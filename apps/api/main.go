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
	if qCount < 50 {
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

	// 3. Current Live 30-Minute Slot Query (Dynamic 10, 15, or 20 questions)
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

		// Dynamic Pseudo-Random Question Count using Slot Hash (10, 15, or 20 secara acak/tidak berurutan)
		h := sha256.New()
		binary.Write(h, binary.BigEndian, slotID)
		seedBytes := h.Sum(nil)

		countOptions := []int{10, 15, 20}
		randomIndex := int(seedBytes[3]) % len(countOptions)
		targetCount := countOptions[randomIndex]

		// Fetch questions for this category (or cross categories if needed)
		var allQuestions []Question
		db.Where("category_id = ?", activeCategory.ID).Order("id ASC").Find(&allQuestions)
		if len(allQuestions) < targetCount {
			// Fallback: mix from other non-IT non-religion categories
			db.Order("id ASC").Find(&allQuestions)
		}

		var slotQuestions []Question
		if len(allQuestions) > 0 {
			h := sha256.New()
			binary.Write(h, binary.BigEndian, slotID)
			seedBytes := h.Sum(nil)

			count := targetCount
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
			"question_count":    len(slotQuestions),
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
		var existing Category
		if err := db.Where("slug = ?", c.Slug).First(&existing).Error; err != nil {
			db.Create(&c)
		}
	}

	var catSD, catSMP, catSMA Category
	db.Where("slug = ?", "wawasan-sd").First(&catSD)
	db.Where("slug = ?", "wawasan-smp").First(&catSMP)
	db.Where("slug = ?", "wawasan-sma").First(&catSMA)

	questions := []Question{
		// SD Level (1-20)
		{CategoryID: catSD.ID, Question: "Hewan apa yang bernapas menggunakan insang saat berudu, lalu paru-paru dan kulit saat dewasa?", Options: `["Katak", "Ikan Mas", "Kura-kura", "Buaya"]`, AnswerIndex: 0, Explanation: "Katak adalah hewan amfibi yang mengalami metamorfosis.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Planet terbesar di tata surya kita yang berjuluk raksasa gas adalah?", Options: `["Mars", "Saturnus", "Jupiter", "Bumi"]`, AnswerIndex: 2, Explanation: "Jupiter adalah planet terbesar di tata surya.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Proses pembuatan makanan pada tumbuhan hijau dengan bantuan cahaya matahari disebut?", Options: `["Respirasi", "Fotosintesis", "Fermentasi", "Transpirasi"]`, AnswerIndex: 1, Explanation: "Fotosintesis mengubah air dan CO2 menjadi glukosa dan O2.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Bagian darah yang bertugas membekukan darah saat kita terluka adalah?", Options: `["Eritrosit", "Leukosit", "Trombosit", "Plasma"]`, AnswerIndex: 2, Explanation: "Trombosit (keping darah) bertugas menutup luka.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Berapa jumlah provinsi di Indonesia saat ini setelah pemekaran Papua?", Options: `["34", "36", "38", "40"]`, AnswerIndex: 2, Explanation: "Indonesia saat ini memiliki 38 provinsi.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Garis khayal yang membagi bumi menjadi belahan utara dan selatan disebut garis?", Options: `["Khatulistiwa", "Bujur", "Meridian", "Kutub"]`, AnswerIndex: 0, Explanation: "Garis Khatulistiwa (Ekuator) berada di lintang 0 derajat.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Hewan yang memakan tumbuhan dan juga memakan daging disebut?", Options: `["Herbivora", "Karnivora", "Omnivora", "Insektivora"]`, AnswerIndex: 2, Explanation: "Omnivora adalah hewan pemakan segala (tumbuhan dan hewan).", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Mata uang resmi negara Indonesia adalah?", Options: `["Ringgit", "Rupiah", "Dolar", "Peso"]`, AnswerIndex: 1, Explanation: "Rupiah (IDR) adalah mata uang resmi Republik Indonesia.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Alat untuk mengukur suhu tubuh atau ruangan disebut?", Options: `["Barometer", "Termometer", "Higrometer", "Altimeter"]`, AnswerIndex: 1, Explanation: "Termometer digunakan untuk mengukur derajat panas atau suhu.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Organ tubuh manusia yang berfungsi memompa darah ke seluruh tubuh adalah?", Options: `["Paru-paru", "Lambung", "Jantung", "Ginjal"]`, AnswerIndex: 2, Explanation: "Jantung memompa darah beroksigen ke seluruh jaringan tubuh.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Ibu kota Nusantara (IKN) berlokasi di provinsi?", Options: `["Kalimantan Timur", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Barat"]`, AnswerIndex: 0, Explanation: "IKN Nusantara berada di wilayah Penajam Paser Utara & Kutai Kartanegara, Kalimantan Timur.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Berapa hari jumlah hari dalam satu tahun kabisat?", Options: `["364 Hari", "365 Hari", "366 Hari", "367 Hari"]`, AnswerIndex: 2, Explanation: "Tahun kabisat memiliki 366 hari dengan tambahan 1 hari di tanggal 29 Februari.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Perubahan wujud benda padat menjadi gas tanpa melalui fase cair disebut?", Options: `["Mencair", "Menguap", "Menyublim", "Mengembun"]`, AnswerIndex: 2, Explanation: "Menyublim adalah perubahan wujud dari padat langsung menjadi gas (contoh: kapur barus).", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Burung Cendrawasih adalah fauna khas dari daerah?", Options: `["Sumatera", "Jawa", "Sulawesi", "Papua"]`, AnswerIndex: 3, Explanation: "Burung Cendrawasih adalah burung endemik tanah Papua.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Warna sekunder yang dihasilkan dari percampuran warna merah dan kuning adalah?", Options: `["Hijau", "Oranye (Jingga)", "Ungu", "Cokelat"]`, AnswerIndex: 1, Explanation: "Merah + Kuning = Oranye.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Benda langit yang mengelilingi matahari dan memiliki ekor bercahaya saat mendekati matahari adalah?", Options: `["Asteroid", "Komet", "Meteoroid", "Satelit"]`, AnswerIndex: 1, Explanation: "Komet (bintang berekor) tersusun atas es dan debu yang menguap membentuk ekor gas.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Berapa jumlah sisi pada bangun ruang kubus?", Options: `["4 Sisi", "6 Sisi", "8 Sisi", "12 Sisi"]`, AnswerIndex: 1, Explanation: "Kubus memiliki 6 sisi berbentuk persegi yang kongruen.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Tanaman kaktus menyimpan cadangan airnya di bagian?", Options: `["Daun", "Batang", "Akar", "Bunga"]`, AnswerIndex: 1, Explanation: "Batang kaktus berdaging tebal untuk menyimpan air di lingkungan kering/gurun.", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Simbol sila ketiga Pancasila adalah?", Options: `["Bintang", "Rantai", "Pohon Beringin", "Padi dan Kapas"]`, AnswerIndex: 2, Explanation: "Pohon Beringin melambangkan persatuan Indonesia (sila ke-3).", Level: "SD", Points: 10},
		{CategoryID: catSD.ID, Question: "Bunyi tidak dapat merambat di dalam?", Options: `["Air", "Udara", "Besi", "Ruang Hampa Udara"]`, AnswerIndex: 3, Explanation: "Gelombang bunyi adalah gelombang mekanik yang memerlukan medium rambat.", Level: "SD", Points: 10},

		// SMP Level (21-40)
		{CategoryID: catSMP.ID, Question: "Selat yang memisahkan Pulau Jawa dan Sumatera adalah?", Options: `["Selat Malaka", "Selat Sunda", "Selat Bali", "Selat Makassar"]`, AnswerIndex: 1, Explanation: "Selat Sunda menghubungkan Laut Jawa dan Samudra Hindia.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Naskah proklamasi kemerdekaan RI dibacakan di Jalan?", Options: `["Pegangsaan Timur No. 56", "Imam Bonjol No. 1", "Merdeka Barat", "Salemba Raya"]`, AnswerIndex: 0, Explanation: "Dibacakan di Jalan Pegangsaan Timur No. 56, Jakarta Pusat.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Mengapa rel kereta api diberi celah pada sambungannya?", Options: `["Redam suara", "Ruang pemuaian saat panas", "Mempermudah perbaikan", "Anti slip"]`, AnswerIndex: 1, Explanation: "Celah memberi ruang muai agar rel tidak melengkung saat terik panas.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Danau vulkanik terbesar di Asia Tenggara adalah?", Options: `["Danau Singkarak", "Danau Poso", "Danau Toba", "Danau Matano"]`, AnswerIndex: 2, Explanation: "Danau Toba di Sumatera Utara adalah danau kaldera vulkanik terbesar.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Hukum Newton yang menyatakan aksi sama dengan reaksi berlawanan arah adalah?", Options: `["Hukum Newton I", "Hukum Newton II", "Hukum Newton III", "Hukum Archimedes"]`, AnswerIndex: 2, Explanation: "Hukum Newton III: F aksi = -F reaksi.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Organ tubuh yang berfungsi menyaring racun dan memproduksi cairan empedu adalah?", Options: `["Pankreas", "Hati (Liver)", "Ginjal", "Limpa"]`, AnswerIndex: 1, Explanation: "Hati menyaring racun dari darah dan menghasilkan empedu untuk pencernaan lemak.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Pemberontakan VOC di Jawa yang dipimpin Pangeran Diponegoro terjadi pada tahun?", Options: `["1800-1805", "1825-1830", "1901-1905", "1942-1945"]`, AnswerIndex: 1, Explanation: "Perang Jawa (Diponegoro) berlangsung dari tahun 1825 hingga 1830.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Lapisan atmosfer bumi tempat terjadinya fenomena cuaca seperti hujan dan awan adalah?", Options: `["Troposfer", "Stratosfer", "Mesosfer", "Termosfer"]`, AnswerIndex: 0, Explanation: "Troposfer adalah lapisan atmosfer paling bawah tempat semua fenomena cuaca terjadi.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Rumus luas permukaan lingkaran dengan jari-jari r adalah?", Options: `["2 × π × r", "π × r²", "4 × π × r²", "½ × π × r"]`, AnswerIndex: 1, Explanation: "Luas lingkaran dihitung dengan rumus π × r².", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Jenis batuan yang terbentuk dari pembekuan magma atau lava yang keluar dari gunung berapi adalah?", Options: `["Batuan Sedimen", "Batuan Beku", "Batuan Metamorf", "Batuan Kapur"]`, AnswerIndex: 1, Explanation: "Batuan beku (igneous rock) terbentuk dari pendinginan magma atau lava.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Organ pernapasan manusia tempat terjadinya pertukaran oksigen dan karbon dioksida adalah?", Options: `["Trakea", "Bronkus", "Alveolus", "Laring"]`, AnswerIndex: 2, Explanation: "Alveolus adalah gelembung udara di paru-paru tempat difusi O2 dan CO2.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Pegunungan tertinggi di dunia yang memiliki puncak Gunung Everest adalah?", Options: `["Pegunungan Andes", "Pegunungan Rocky", "Pegunungan Himalaya", "Pegunungan Alpen"]`, AnswerIndex: 2, Explanation: "Pegunungan Himalaya membentang di Asia dan memiliki puncak tertinggi Everest (8.848 m).", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Berapa kecepatan cahaya dalam ruang hampa secara pendekatan?", Options: `["300.000 m/detik", "300.000 km/detik", "3.000 km/detik", "30.000 km/jam"]`, AnswerIndex: 1, Explanation: "Kecepatan rambat cahaya di ruang hampa adalah sekitar 3 × 10^8 m/s (300.000 km/detik).", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Prasasti Yupa dari Kerajaan Kutai di Kalimantan Timur ditulis menggunakan huruf?", Options: `["Hieroglif", "Pallawa", "Kawi", "Latin"]`, AnswerIndex: 1, Explanation: "Prasasti Kerajaan Kutai menggunakan huruf Pallawa dan bahasa Sanskerta.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Senyawa kimia garam dapur yang sering digunakan memasak memiliki rumus molekul?", Options: `["H2O", "NaCl", "CO2", "CaCO3"]`, AnswerIndex: 1, Explanation: "Garam dapur adalah Natrium Klorida (NaCl).", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Gunung tertinggi di pulau Jawa adalah?", Options: `["Gunung Merapi", "Gunung Semeru", "Gunung Bromo", "Gunung Slamet"]`, AnswerIndex: 1, Explanation: "Gunung Semeru (Puncak Mahameru) setinggi 3.676 mdpl adalah puncak tertinggi di Jawa.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Energi yang tersimpan pada suatu benda karena kedudukan atau ketinggiannya disebut?", Options: `["Energi Kinetik", "Energi Potensial", "Energi Kimia", "Energi Panas"]`, AnswerIndex: 1, Explanation: "Energi Potensial Gravitasi (Ep = m × g × h) bergantung pada posisi/ketinggian benda.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Batas laut teritorial Indonesia yang diakui secara internasional sejauh berapa mil laut dari garis pantai?", Options: `["3 Mil", "12 Mil", "24 Mil", "200 Mil"]`, AnswerIndex: 1, Explanation: "Batas laut teritorial Indonesia adalah 12 mil laut dari garis pangkal kepulauan.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Pembelahan sel pada tubuh untuk pertumbuhan dan perbaikan jaringan tubuh yang rusak disebut?", Options: `["Mitosis", "Meiosis", "Amitosis", "Fertilisasi"]`, AnswerIndex: 0, Explanation: "Mitosis menghasilkan 2 sel anakan identik untuk perbanyakan dan perbaikan sel tubuh.", Level: "SMP", Points: 10},
		{CategoryID: catSMP.ID, Question: "Titik beku air murni pada tekanan standar 1 atmosfer berada pada suhu?", Options: `["0° Celcius", "32° Celcius", "100° Celcius", "-4° Celcius"]`, AnswerIndex: 0, Explanation: "Air murni membeku pada suhu 0°C dan mendidih pada 100°C.", Level: "SMP", Points: 10},

		// SMA Level (41-60)
		{CategoryID: catSMA.ID, Question: "Kenaikan harga barang dan jasa secara umum dan terus menerus disebut?", Options: `["Deflasi", "Inflasi", "Devaluasi", "Resesi"]`, AnswerIndex: 1, Explanation: "Inflasi menurunkan daya beli uang terhadap barang dan jasa.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Mengapa rem kendaraan panas saat menuruni jalan pegunungan curam?", Options: `["Gesekan ubah energi kinetik jadi panas", "Udara tipis", "Gravitasi rusak rem", "Minyak rem menguap"]`, AnswerIndex: 0, Explanation: "Energi kinetik laju roda diubah menjadi energi termal (panas) akibat gesekan kampas.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Metode budgeting yang membagi 50% Kebutuhan, 30% Keinginan, 20% Tabungan disebut?", Options: `["Pareto 80/20", "Metode 50/30/20", "Aturan 70/20/10", "Zero-Based"]`, AnswerIndex: 1, Explanation: "Metode 50/30/20 dirancang untuk menjaga alokasi pendapatan ideal.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Gas rumah kaca utama buangan pembakaran fosil pemicu pemanasan global adalah?", Options: `["O2", "CO2", "He", "N2"]`, AnswerIndex: 1, Explanation: "Karbon Dioksida (CO2) adalah kontributor terbesar efek rumah kaca buatan manusia.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Mengapa tubuh lebih mudah mengapung di air laut dibanding air tawar?", Options: `["Massa jenis air laut lebih besar", "Suhu lebih hangat", "Dorongan ombak", "Tekanan udara rendah"]`, AnswerIndex: 0, Explanation: "Gaya apung Archimedes sebanding dengan densitas cairan. Air laut lebih padat.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Penurunan nilai mata uang domestik terhadap mata uang asing akibat kebijakan pemerintah disebut?", Options: `["Apresiasi", "Depresiasi", "Devaluasi", "Revaluasi"]`, AnswerIndex: 2, Explanation: "Devaluasi adalah kebijakan penurunan resmi nilai mata uang terhadap mata uang asing.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Mengapa menyiram tanaman di siang hari bolong saat terik matahari tidak disarankan?", Options: `["Air cepat menguap & butiran air memfokuskan panas seperti lensa", "Akar tanaman tidur", "Tanaman menolak air", "Air menjadi beracun"]`, AnswerIndex: 0, Explanation: "Butiran air di daun dapat berfungsi seperti lensa pembesar yang membakar jaringan daun.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Instrumen investasi pasar modal yang menunjukkan bukti kepemilikan sebagian atas suatu perusahaan adalah?", Options: `["Obligasi", "Saham", "Deposito", "Surat Utang Negara"]`, AnswerIndex: 1, Explanation: "Saham merupakan bukti penyertaan modal atau kepemilikan atas sebuah perseroan.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Organel sel yang sering disebut 'pembangkit tenaga sel' (powerhouse of cell) adalah?", Options: `["Ribosom", "Mitokondria", "Lisosom", "Badan Golgi"]`, AnswerIndex: 1, Explanation: "Mitokondria menghasilkan sebagian besar pasokan adenosin trifosfat (ATP) sebagai energi sel.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Prinsip ekonomi yang menyatakan bahwa semakin banyak barang diproduksi, semakin rendah biaya rata-rata per unit disebut?", Options: `["Opportunity Cost", "Economies of Scale (Skala Ekonomis)", "Law of Diminishing Return", "Invisble Hand"]`, AnswerIndex: 1, Explanation: "Skala ekonomis terjadi ketika efisiensi biaya tercapai seiring peningkatan volume produksi.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Mengapa langit siang hari terlihat berwarna biru?", Options: `["Pantulan warna air laut", "Hamburan Rayleigh cahaya matahari oleh partikel udara", "Lapisan ozon berwarna biru", "Matahari memancarkan sinar biru saja"]`, AnswerIndex: 1, Explanation: "Hamburan Rayleigh menyebabkan gelombang cahaya berfrekuensi tinggi (biru) terhambur ke segala arah.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Biaya yang timbul karena memilih satu alternatif terbaik dan mengorbankan alternatif lainnya dinamakan?", Options: `["Biaya Tetap", "Biaya Peluang (Opportunity Cost)", "Biaya Marginal", "Biaya Variabel"]`, AnswerIndex: 1, Explanation: "Opportunity cost adalah nilai dari potensi manfaat yang hilang ketika memilih satu opsi atas opsi lain.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Zat pengawet alami yang sering digunakan dalam proses pengasapan atau pembuatan ikan asin adalah?", Options: `["Formalin", "Garam (NaCl)", "Boraks", "Tawas"]`, AnswerIndex: 1, Explanation: "Garam menyerap air dari sel bakteri melalui osmosis sehingga mikroba perusak tidak bisa berkembang.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Hukum termodinamika yang menyatakan bahwa energi tidak dapat diciptakan atau dimusnahkan adalah?", Options: `["Hukum Termodinamika I", "Hukum Termodinamika II", "Hukum Termodinamika III", "Hukum Termodinamika Ke-Nol"]`, AnswerIndex: 0, Explanation: "Hukum I Termodinamika adalah hukum kekekalan energi (energi hanya dapat berubah bentuk).", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Kondisi di mana pertumbuhan ekonomi stagnan atau melambat disertai dengan tingkat inflasi yang tinggi disebut?", Options: `["Stagflasi", "Hiperinflasi", "Deflasi", "Depresi Ekonomi"]`, AnswerIndex: 0, Explanation: "Stagflasi merupakan gabungan dari stagnansi pertumbuhan ekonomi dan inflasi tinggi.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Mengapa saat menyetir di jalan beraspal panas di kejauhan tampak seperti ada genangan air (fatamorgana)?", Options: `["Pembiasan cahaya akibat perbedaan kerapatan udara panas dan dingin", "Halusinasi pengemudi", "Uap air mengembun di jalan", "Aspal mencair"]`, AnswerIndex: 0, Explanation: "Fatamorgana terjadi akibat pembiasan/refraksi cahaya matahari saat melewati lapisan udara dengan gradien suhu berbeda.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Zat dalam tubuh yang berfungsi mempercepat reaksi kimia biologis tanpa ikut terpakai habis adalah?", Options: `["Enzim", "Hormon", "Lipid", "Glukosa"]`, AnswerIndex: 0, Explanation: "Enzim adalah biokatalisator yang mempercepat laju reaksi biologis di dalam organisme.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Indikator makroekonomi yang mengukur nilai total seluruh barang dan jasa yang diproduksi di suatu negara dalam periode tertentu adalah?", Options: `["IHSG", "PDB (Produk Domestik Bruto)", "APBN", "Neraca Pembayaran"]`, AnswerIndex: 1, Explanation: "PDB (GDP) adalah ukuran moneter utama aktivitas perekonomian suatu negara.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Manakah tindakan pertolongan pertama yang benar saat seseorang mengalami luka bakar ringan terkena minyak panas?", Options: `["Mengoleskan pasta gigi (odol)", "Mengoleskan mentega", "Mengalirkan air bersih suhu ruang selama 10-20 menit", "Memecahkan gelembung luka"]`, AnswerIndex: 2, Explanation: "Luka bakar ringan harus dialiri air mengalir sejuk (bukan es) untuk meredakan panas jaringan kulit secara aman.", Level: "SMA", Points: 10},
		{CategoryID: catSMA.ID, Question: "Konsep psikologi finansial di mana seseorang lebih takut kehilangan Rp100.000 daripada senang saat mendapatkan Rp100.000 disebut?", Options: `["Loss Aversion", "Confirmation Bias", "Sunk Cost Fallacy", "Anchoring Effect"]`, AnswerIndex: 0, Explanation: "Loss Aversion menyatakan rasa sakit psikologis akibat kerugian terasa sekitar dua kali lipat dibanding kenikmatan keuntungan sepadan.", Level: "SMA", Points: 10},
	}

	for _, q := range questions {
		var existing Question
		if err := db.Where("question = ?", q.Question).First(&existing).Error; err != nil {
			db.Create(&q)
		}
	}
}
