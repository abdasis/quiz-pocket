package main

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	Email            string    `gorm:"uniqueIndex;not null" json:"email"`
	Name             string    `json:"name"`
	AvatarURL        string    `json:"avatar_url"`
	GoogleID         string    `gorm:"index" json:"google_id"`
	Points           int       `gorm:"default:0" json:"points"`
	QuizzesCompleted int       `gorm:"default:0" json:"quizzes_completed"`
	Streak           int       `gorm:"default:1" json:"streak"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Category struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Slug          string    `gorm:"uniqueIndex;not null" json:"slug"`
	Title         string    `gorm:"not null" json:"title"`
	Description   string    `json:"description"`
	Level         string    `json:"level"`
	Icon          string    `json:"icon"`
	QuestionCount int       `json:"question_count"`
	CreatedAt     time.Time `json:"created_at"`
}

type Question struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CategoryID  uint      `gorm:"index;not null" json:"category_id"`
	Category    Category  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Question    string    `gorm:"not null" json:"question"`
	Options     string    `gorm:"type:text;not null" json:"-"`
	OptionsList []string  `gorm:"-" json:"options"`
	AnswerIndex int       `json:"answer_index"`
	Explanation string    `json:"explanation"`
	Level       string    `json:"level"` // "SD", "SMP", "SMA"
	Points      int       `json:"points"`
	CreatedAt   time.Time `json:"created_at"`
}

type QuizSlotSubmission struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	SlotID       int64     `gorm:"index:idx_user_slot,unique;not null" json:"slot_id"`
	UserID       uint      `gorm:"index:idx_user_slot,unique;not null" json:"user_id"`
	UserEmail    string    `json:"user_email"`
	UserName     string    `json:"user_name"`
	CategoryID   uint      `json:"category_id"`
	Score        int       `json:"score"`
	Total        int       `json:"total"`
	CorrectCount int       `json:"correct_count"`
	TimeSpentSec int       `json:"time_spent_sec"`
	CreatedAt    time.Time `json:"created_at"`
}

func main() {
	dsn := "host=/var/run/postgresql dbname=quiz_pocket sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to Postgres: %v", err)
	}

	// Auto-migrate
	if err := db.AutoMigrate(&User{}, &Category{}, &Question{}, &QuizSlotSubmission{}); err != nil {
		log.Fatalf("Auto-migration failed: %v", err)
	}

	var qCount int64
	db.Model(&Question{}).Count(&qCount)
	if qCount == 0 {
		seedDatabase(db)
	}

	app := fiber.New(fiber.Config{
		AppName: "Quiz Pocket API (SD-SMP-SMA)",
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))
	app.Use(logger.New())

	api := app.Group("/api/v1")

	// 1. Google / Email Auth Login & Profile Sync
	api.Post("/auth/google-login", func(c *fiber.Ctx) error {
		var req struct {
			Email     string `json:"email"`
			Name      string `json:"name"`
			AvatarURL string `json:"avatar_url"`
			GoogleID  string `json:"google_id"`
		}
		if err := c.BodyParser(&req); err != nil || req.Email == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
		}

		var user User
		err := db.Where("email = ?", req.Email).First(&user).Error
		if err != nil {
			user = User{
				Email:            req.Email,
				Name:             req.Name,
				AvatarURL:        req.AvatarURL,
				GoogleID:         req.GoogleID,
				Points:           0,
				QuizzesCompleted: 0,
				Streak:           1,
			}
			if err := db.Create(&user).Error; err != nil {
				return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
			}
		} else {
			if req.Name != "" {
				user.Name = req.Name
			}
			if req.AvatarURL != "" {
				user.AvatarURL = req.AvatarURL
			}
			if req.GoogleID != "" {
				user.GoogleID = req.GoogleID
			}
			db.Save(&user)
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    user,
		})
	})

	// 2. User Profile
	api.Get("/user/profile", func(c *fiber.Ctx) error {
		email := c.Query("email")
		if email == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Email parameter required"})
		}
		var user User
		if err := db.Where("email = ?", email).First(&user).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.JSON(fiber.Map{"success": true, "data": user})
	})

	// 3. Current Live 30-Minute Slot Query
	api.Get("/live-slot", func(c *fiber.Ctx) error {
		userEmail := c.Query("email")
		now := time.Now()
		const slotDurationSec int64 = 1800
		currentUnix := now.Unix()
		slotID := currentUnix / slotDurationSec
		slotStartTime := time.Unix(slotID*slotDurationSec, 0)
		slotEndTime := time.Unix((slotID+1)*slotDurationSec, 0)
		secondsRemaining := slotEndTime.Unix() - currentUnix

		var categories []Category
		db.Find(&categories)
		if len(categories) == 0 {
			return c.Status(500).JSON(fiber.Map{"error": "No categories available"})
		}
		catIndex := int(slotID % int64(len(categories)))
		activeCategory := categories[catIndex]

		// Fetch questions for this category
		var allQuestions []Question
		db.Where("category_id = ?", activeCategory.ID).Order("id ASC").Find(&allQuestions)

		var slotQuestions []Question
		if len(allQuestions) > 0 {
			h := sha256.New()
			binary.Write(h, binary.BigEndian, slotID)
			seedBytes := h.Sum(nil)

			count := 5
			if len(allQuestions) < count {
				count = len(allQuestions)
			}

			offset := int(seedBytes[0]) % len(allQuestions)
			for i := 0; i < count; i++ {
				idx := (offset + i) % len(allQuestions)
				q := allQuestions[idx]
				var opts []string
				if err := json.Unmarshal([]byte(q.Options), &opts); err == nil {
					q.OptionsList = opts
				}
				slotQuestions = append(slotQuestions, q)
			}
		}

		var submission QuizSlotSubmission
		isCompleted := false
		if userEmail != "" {
			err := db.Where("slot_id = ? AND user_email = ?", slotID, userEmail).First(&submission).Error
			if err == nil {
				isCompleted = true
			}
		}

		return c.JSON(fiber.Map{
			"success":           true,
			"slot_id":           slotID,
			"slot_start":        slotStartTime,
			"slot_end":          slotEndTime,
			"seconds_remaining": secondsRemaining,
			"category":          activeCategory,
			"questions":         slotQuestions,
			"is_completed":      isCompleted,
			"submission":        submission,
		})
	})

	// 4. Submit Live Slot
	api.Post("/live-slot/submit", func(c *fiber.Ctx) error {
		var req struct {
			SlotID       int64  `json:"slot_id"`
			UserEmail    string `json:"user_email"`
			Score        int    `json:"score"`
			Total        int    `json:"total"`
			CorrectCount int    `json:"correct_count"`
			TimeSpentSec int    `json:"time_spent_sec"`
		}
		if err := c.BodyParser(&req); err != nil || req.UserEmail == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
		}

		const slotDurationSec int64 = 1800
		currentSlotID := time.Now().Unix() / slotDurationSec
		if req.SlotID != currentSlotID {
			return c.Status(400).JSON(fiber.Map{"error": "Waktu sesi kuis telah berakhir. Silakan ikuti sesi selanjutnya."})
		}

		var user User
		if err := db.Where("email = ?", req.UserEmail).First(&user).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}

		var existing QuizSlotSubmission
		if err := db.Where("slot_id = ? AND user_id = ?", req.SlotID, user.ID).First(&existing).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{"error": "Kuis sesi ini sudah Anda kerjakan!"})
		}

		submission := QuizSlotSubmission{
			SlotID:       req.SlotID,
			UserID:       user.ID,
			UserEmail:    user.Email,
			UserName:     user.Name,
			Score:        req.Score,
			Total:        req.Total,
			CorrectCount: req.CorrectCount,
			TimeSpentSec: req.TimeSpentSec,
		}
		if err := db.Create(&submission).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		user.Points += req.Score
		user.QuizzesCompleted += 1
		db.Save(&user)

		return c.JSON(fiber.Map{
			"success":    true,
			"points":     user.Points,
			"submission": submission,
			"user":       user,
		})
	})

	// 5. Global Leaderboard
	api.Get("/leaderboard", func(c *fiber.Ctx) error {
		var users []User
		db.Order("points DESC, quizzes_completed DESC, updated_at ASC").Limit(25).Find(&users)
		return c.JSON(fiber.Map{"success": true, "data": users})
	})

	// Static Web Frontend Serving
	app.Static("/assets", "/home/abdasis/Projects/quiz-pocket/apps/web/dist/assets")
	app.Get("/*", func(c *fiber.Ctx) error {
		path := c.Path()
		if len(path) >= 4 && path[:4] == "/api" {
			return c.Status(404).JSON(fiber.Map{"error": "Endpoint not found"})
		}
		return c.SendFile("/home/abdasis/Projects/quiz-pocket/apps/web/dist/index.html")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}
	fmt.Printf("Quiz Pocket Server running on :%s\n", port)
	log.Fatal(app.Listen(":" + port))
}

func seedDatabase(db *gorm.DB) {
	categories := []Category{
		{Slug: "wawasan-sd", Title: "Pengetahuan Umum & Sains Dasar (Tingkat SD)", Description: "Organ tubuh, rantai makanan, tata surya, dan flora fauna", Level: "SD", Icon: "Globe"},
		{Slug: "wawasan-smp", Title: "Wawasan Nusantara & Geografi (Tingkat SMP)", Description: "Sejarah nasional, peta wilayah, iklim, dan fenomena alam", Level: "SMP", Icon: "Compass"},
		{Slug: "wawasan-sma", Title: "Logika Kritis, Finansial & Sains Praktis (Tingkat SMA)", Description: "Ekonomi praktis, hukum fisika sehari-hari, dan nalar kritis", Level: "SMA", Icon: "Lightbulb"},
	}

	for _, c := range categories {
		db.Create(&c)
	}

	var catSD, catSMP, catSMA Category
	db.Where("slug = ?", "wawasan-sd").First(&catSD)
	db.Where("slug = ?", "wawasan-smp").First(&catSMP)
	db.Where("slug = ?", "wawasan-sma").First(&catSMA)

	questions := []Question{
		// SD Questions
		{
			CategoryID:  catSD.ID,
			Question:    "Hewan apa yang bernapas menggunakan insang saat masih berbentuk berudu, lalu menggunakan paru-paru dan kulit saat dewasa?",
			Options:     `["Katak", "Ikan Mas", "Kura-kura", "Buaya"]`,
			AnswerIndex: 0,
			Explanation: "Katak mengalami metamorfosis: bernapas dengan insang saat berudu, lalu dengan paru-paru dan kulit saat dewasa.",
			Level:       "SD",
			Points:      10,
		},
		{
			CategoryID:  catSD.ID,
			Question:    "Planet terbesar di tata surya kita yang memiliki julukan planet raksasa gas adalah?",
			Options:     `["Mars", "Saturnus", "Jupiter", "Bumi"]`,
			AnswerIndex: 2,
			Explanation: "Jupiter adalah planet terbesar di tata surya dengan diameter lebih dari 11 kali diameter Bumi.",
			Level:       "SD",
			Points:      10,
		},
		{
			CategoryID:  catSD.ID,
			Question:    "Proses pembuatan makanan pada tumbuhan hijau dengan bantuan cahaya matahari dinamakan?",
			Options:     `["Respirasi", "Fotosintesis", "Fermentasi", "Transpirasi"]`,
			AnswerIndex: 1,
			Explanation: "Fotosintesis adalah proses di mana klorofil tumbuhan memanfaatkan sinar matahari untuk mengubah air dan karbon dioksida menjadi glukosa dan oksigen.",
			Level:       "SD",
			Points:      10,
		},
		{
			CategoryID:  catSD.ID,
			Question:    "Bagian darah yang bertugas membekukan darah saat kita terluka agar pendarahan berhenti adalah?",
			Options:     `["Sel darah merah (Eritrosit)", "Sel darah putih (Leukosit)", "Keping darah (Trombosit)", "Plasma darah"]`,
			AnswerIndex: 2,
			Explanation: "Trombosit (keping darah) berfungsi penting dalam proses pembekuan darah untuk menutup luka.",
			Level:       "SD",
			Points:      10,
		},
		{
			CategoryID:  catSD.ID,
			Question:    "Berapa jumlah provinsi di Indonesia saat ini setelah pemekaran wilayah Papua?",
			Options:     `["34 Provinsi", "36 Provinsi", "38 Provinsi", "40 Provinsi"]`,
			AnswerIndex: 2,
			Explanation: "Indonesia memiliki 38 provinsi setelah pembentukan 4 Daerah Otonom Baru (DOB) di wilayah Papua.",
			Level:       "SD",
			Points:      10,
		},
		{
			CategoryID:  catSD.ID,
			Question:    "Garis khayal yang membagi bumi menjadi belahan bumi utara dan selatan disebut garis?",
			Options:     `["Khatulistiwa (Ekuator)", "Bujur", "Meridian", "Kutub"]`,
			AnswerIndex: 0,
			Explanation: "Garis Khatulistiwa (Ekuator) melintasi lintang 0 derajat dan membagi bumi menjadi belahan utara dan selatan.",
			Level:       "SD",
			Points:      10,
		},

		// SMP Questions
		{
			CategoryID:  catSMP.ID,
			Question:    "Selat yang memisahkan antara Pulau Jawa dan Pulau Sumatera adalah?",
			Options:     `["Selat Malaka", "Selat Sunda", "Selat Bali", "Selat Makassar"]`,
			AnswerIndex: 1,
			Explanation: "Selat Sunda adalah selat penghubung antara Laut Jawa dan Samudra Hindia yang memisahkan Pulau Jawa dan Sumatera.",
			Level:       "SMP",
			Points:      10,
		},
		{
			CategoryID:  catSMP.ID,
			Question:    "Peristiwa proklamasi kemerdekaan Indonesia pada tanggal 17 Agustus 1945 dibacakan di Jalan?",
			Options:     `["Pegangsaan Timur No. 56", "Imam Bonjol No. 1", "Medan Merdeka Barat", "Salemba Raya No. 4"]`,
			AnswerIndex: 0,
			Explanation: "Naskah proklamasi dibacakan oleh Ir. Soekarno di kediamannya di Jalan Pegangsaan Timur No. 56, Jakarta Pusat.",
			Level:       "SMP",
			Points:      10,
		},
		{
			CategoryID:  catSMP.ID,
			Question:    "Mengapa rel kereta api selalu diberi celah kecil di antara sambungan batangnya?",
			Options:     `["Mengurangi kebisingan roda", "Memberi ruang pemuaian rel saat suhu panas", "Mempermudah pergantian rel", "Mencegah kereta tergelincir"]`,
			AnswerIndex: 1,
			Explanation: "Besi rel memuai saat terkena panas matahari. Celah dibuat agar rel tidak membengkok akibat pemuaian.",
			Level:       "SMP",
			Points:      10,
		},
		{
			CategoryID:  catSMP.ID,
			Question:    "Danau vulkanik terbesar di Indonesia sekaligus di Asia Tenggara adalah?",
			Options:     `["Danau Singkarak", "Danau Poso", "Danau Toba", "Danau Matano"]`,
			AnswerIndex: 2,
			Explanation: "Danau Toba di Sumatera Utara merupakan danau hasil letusan supervolcano terbesar di dunia.",
			Level:       "SMP",
			Points:      10,
		},
		{
			CategoryID:  catSMP.ID,
			Question:    "Hukum gerak benda yang menyatakan bahwa setiap aksi akan menimbulkan reaksi yang sama besar dan berlawanan arah adalah?",
			Options:     `["Hukum Newton I", "Hukum Newton II", "Hukum Newton III", "Hukum Archimedes"]`,
			AnswerIndex: 2,
			Explanation: "Hukum Newton III menyatakan F_aksi = -F_reaksi (gaya aksi selalu berpasangan dengan gaya reaksi berlawanan).",
			Level:       "SMP",
			Points:      10,
		},

		// SMA Questions
		{
			CategoryID:  catSMA.ID,
			Question:    "Kenaikan harga barang dan jasa secara umum dan terus menerus dalam jangka waktu tertentu dalam istilah ekonomi disebut?",
			Options:     `["Deflasi", "Inflasi", "Devaluasi", "Resesi"]`,
			AnswerIndex: 1,
			Explanation: "Inflasi adalah kecenderungan naiknya harga kebutuhan pokok dan barang/jasa secara umum yang menurunkan daya beli uang.",
			Level:       "SMA",
			Points:      10,
		},
		{
			CategoryID:  catSMA.ID,
			Question:    "Mengapa rem kendaraan bermotor lebih cepat terasa panas dan aus saat menuruni jalan pegunungan yang curam?",
			Options:     `["Gesekan mengubah energi kinetik menjadi energi termal (panas)", "Udara di pegunungan lebih tipis", "Gravitasi merusak piringan rem", "Minyak rem mudah menguap"]`,
			AnswerIndex: 0,
			Explanation: "Berdasarkan hukum kekekalan energi, sistem pengereman meredam laju kendaraan dengan mengubah energi gerak (kinetik) menjadi energi panas (termal) melalui gesekan.",
			Level:       "SMA",
			Points:      10,
		},
		{
			CategoryID:  catSMA.ID,
			Question:    "Manakah konsep pengelolaan keuangan pribadi yang membagi penghasilan menjadi 50% Kebutuhan Pokok, 30% Keinginan, dan 20% Tabungan/Investasi?",
			Options:     `["Aturan Pareto 80/20", "Metode 50/30/20", "Aturan 70/20/10", "Zero-Based Budgeting"]`,
			AnswerIndex: 1,
			Explanation: "Metode budgeting 50/30/20 dipopulerkan untuk menjaga kesehatan arus kas pribadi antara kebutuhan harian dan masa depan.",
			Level:       "SMA",
			Points:      10,
		},
		{
			CategoryID:  catSMA.ID,
			Question:    "Gas rumah kaca di atmosfer yang paling banyak dihasilkan dari pembakaran bahan bakar fosil oleh kendaraan dan industri adalah?",
			Options:     `["Oksigen (O2)", "Karbon Dioksida (CO2)", "Helium (He)", "Nitrogen (N2)"]`,
			AnswerIndex: 1,
			Explanation: "Karbon Dioksida (CO2) adalah gas buang utama pembakaran fosil yang memerangkap panas di atmosfer dan memicu pemanasan global.",
			Level:       "SMA",
			Points:      10,
		},
		{
			CategoryID:  catSMA.ID,
			Question:    "Saat berenang di laut, tubuh kita terasa lebih mudah mengapung dibandingkan di kolam renang air tawar. Mengapa?",
			Options:     `["Air laut memiliki massa jenis lebih tinggi karena kandungan garam", "Suhu air laut lebih hangat", "Ombak laut mendorong tubuh ke atas", "Tekanan udara di pantai lebih rendah"]`,
			AnswerIndex: 0,
			Explanation: "Sesuai hukum Archimedes, gaya apung berbanding lurus dengan massa jenis zat cair. Air garam memiliki massa jenis lebih besar daripada air tawar.",
			Level:       "SMA",
			Points:      10,
		},
	}

	for _, q := range questions {
		db.Create(&q)
	}
}
