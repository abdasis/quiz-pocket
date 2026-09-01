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
	Difficulty  string    `json:"difficulty"`
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
	if qCount < 20 {
		seedDatabase(db)
	}

	app := fiber.New(fiber.Config{
		AppName: "Quiz Pocket API v1.0",
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

	// 2. User Profile & Stats
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
		// Slot duration = 30 minutes (1800 seconds)
		const slotDurationSec int64 = 1800
		currentUnix := now.Unix()
		slotID := currentUnix / slotDurationSec
		slotStartTime := time.Unix(slotID*slotDurationSec, 0)
		slotEndTime := time.Unix((slotID+1)*slotDurationSec, 0)
		secondsRemaining := slotEndTime.Unix() - currentUnix

		// Pick deterministic rotating category for this slot
		var categories []Category
		db.Find(&categories)
		if len(categories) == 0 {
			return c.Status(500).JSON(fiber.Map{"error": "No categories available"})
		}
		catIndex := int(slotID % int64(len(categories)))
		activeCategory := categories[catIndex]

		// Fetch deterministic questions for this slot
		var allQuestions []Question
		db.Where("category_id = ?", activeCategory.ID).Order("id ASC").Find(&allQuestions)

		// Select 5 questions deterministically using hash of slotID
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

		// Check if current user already completed this slot
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

	// 4. Submit Live 30-Minute Slot
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

		// Verify slot validity (prevent submitting expired slot)
		const slotDurationSec int64 = 1800
		currentSlotID := time.Now().Unix() / slotDurationSec
		if req.SlotID != currentSlotID {
			return c.Status(400).JSON(fiber.Map{"error": "Waktu kuis sesi ini sudah habis. Silakan ikuti sesi kuis berikutnya."})
		}

		var user User
		if err := db.Where("email = ?", req.UserEmail).First(&user).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}

		// Check if already submitted for this slot
		var existing QuizSlotSubmission
		if err := db.Where("slot_id = ? AND user_id = ?", req.SlotID, user.ID).First(&existing).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{"error": "Anda sudah menyelesaikan kuis sesi 30 menit ini!"})
		}

		// Save submission
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

		// Add score to user points & increment completed
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

	// 6. Categories List
	api.Get("/categories", func(c *fiber.Ctx) error {
		var cats []Category
		db.Find(&cats)
		for i := range cats {
			var count int64
			db.Model(&Question{}).Where("category_id = ?", cats[i].ID).Count(&count)
			cats[i].QuestionCount = int(count)
		}
		return c.JSON(fiber.Map{"success": true, "data": cats})
	})

	// 7. Health Check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "app": "Quiz Pocket API (30-Min Rotator)", "timestamp": time.Now()})
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
	fmt.Printf("Quiz Pocket 30-Min Server running on :%s\n", port)
	log.Fatal(app.Listen(":" + port))
}

func seedDatabase(db *gorm.DB) {
	categories := []Category{
		{Slug: "islamic-basic", Title: "Pendidikan Agama Islam", Description: "Rukun Iman, Rukun Islam, Sejarah Nabi & Sahabat", Icon: "BookOpen"},
		{Slug: "web-dev", Title: "Web & Frontend Engineering", Description: "HTML/CSS, React, TypeScript, Tailwind & Browser API", Icon: "Code"},
		{Slug: "backend-go", Title: "Backend & Golang Mastery", Description: "Go Fiber, Concurrency, REST API, Database & Architecture", Icon: "Server"},
		{Slug: "general-logic", Title: "Logika & Algoritma", Description: "Pemecahan masalah, pola angka, struktur data & penalaran", Icon: "Cpu"},
	}

	for _, c := range categories {
		var existing Category
		if err := db.Where("slug = ?", c.Slug).First(&existing).Error; err != nil {
			db.Create(&c)
		}
	}

	var catIslam, catWeb, catGo, catLogic Category
	db.Where("slug = ?", "islamic-basic").First(&catIslam)
	db.Where("slug = ?", "web-dev").First(&catWeb)
	db.Where("slug = ?", "backend-go").First(&catGo)
	db.Where("slug = ?", "general-logic").First(&catLogic)

	questions := []Question{
		// Islam
		{CategoryID: catIslam.ID, Question: "Berapa jumlah rukun iman dalam ajaran Islam?", Options: `["4", "5", "6", "7"]`, AnswerIndex: 2, Explanation: "Rukun Iman ada 6: Iman kepada Allah, Malaikat, Kitab, Rasul, Hari Akhir, dan Qada & Qadar.", Difficulty: "easy", Points: 10},
		{CategoryID: catIslam.ID, Question: "Surah apa yang disebut sebagai 'Ummul Kitab' atau 'Ummul Qur'an'?", Options: `["Al-Baqarah", "Al-Fatihah", "Yasin", "Al-Ikhlas"]`, AnswerIndex: 1, Explanation: "Surah Al-Fatihah disebut Ummul Kitab karena mencakup inti pesan Al-Qur'an.", Difficulty: "easy", Points: 10},
		{CategoryID: catIslam.ID, Question: "Siapakah Sahabat Nabi yang menemani beliau hijrah dan bersembunyi di Gua Tsur?", Options: `["Umar bin Khattab", "Ali bin Abi Thalib", "Abu Bakar Ash-Shiddiq", "Utsman bin Affan"]`, AnswerIndex: 2, Explanation: "Abu Bakar Ash-Shiddiq RA adalah sahabat yang menemani Rasulullah ﷺ dalam perjalanan hijrah.", Difficulty: "medium", Points: 10},
		{CategoryID: catIslam.ID, Question: "Mushaf Al-Qur'an standar Madani Raja Fahd umumnya terdiri dari berapa baris per halaman?", Options: `["13 Baris", "15 Baris", "17 Baris", "18 Baris"]`, AnswerIndex: 1, Explanation: "Mushaf Madani Rasm Utsmani standar King Fahd Complex memiliki format 15 baris per halaman.", Difficulty: "medium", Points: 10},
		{CategoryID: catIslam.ID, Question: "Nabi yang memiliki mukjizat dapat berbicara dengan hewan dan mengendalikan angin adalah?", Options: `["Nabi Daud AS", "Nabi Sulaiman AS", "Nabi Musa AS", "Nabi Yusuf AS"]`, AnswerIndex: 1, Explanation: "Nabi Sulaiman 'alaihissalam dikaruniai kemampuan memahami bahasa hewan dan memerintah angin serta jin.", Difficulty: "easy", Points: 10},
		{CategoryID: catIslam.ID, Question: "Bulan ke-9 dalam kalender Hijriyah di mana umat Islam diwajibkan berpuasa adalah?", Options: `["Sya'ban", "Ramadhan", "Syawwal", "Muharram"]`, AnswerIndex: 1, Explanation: "Bulan Ramadhan adalah bulan ke-9 dalam kalender Hijriyah.", Difficulty: "easy", Points: 10},

		// Web Dev
		{CategoryID: catWeb.ID, Question: "Unit CSS apa yang dinamis menyesuaikan tinggi viewport saat mobile browser address bar muncul/hilang?", Options: `["vh", "100vh", "100dvh", "100lvh"]`, AnswerIndex: 2, Explanation: "100dvh (dynamic viewport height) menyesuaikan tinggi viewport dinamis pada peramban mobile.", Difficulty: "medium", Points: 10},
		{CategoryID: catWeb.ID, Question: "Apa fungsi dari `scrollbar-gutter: stable` pada CSS?", Options: `["Menghilangkan scrollbar", "Mencegah pergeseran tata letak (Layout Shift)", "Membuat scrollbar transparan", "Mengunci mouse scroll"]`, AnswerIndex: 1, Explanation: "scrollbar-gutter: stable mencadangkan ruang scrollbar agar layout tidak berguncang saat konten bertambah.", Difficulty: "medium", Points: 10},
		{CategoryID: catWeb.ID, Question: "Berdasarkan Apple HIG, berapa ukuran minimum touch target untuk navigasi ramah jari?", Options: `["24x24px", "32x32px", "44x44px", "64x64px"]`, AnswerIndex: 2, Explanation: "Apple HIG merekomendasikan touch target minimal 44x44 points/pixels.", Difficulty: "easy", Points: 10},
		{CategoryID: catWeb.ID, Question: "Di React 19, hook apa yang diperkenalkan untuk menangani async transition dan pending state secara native?", Options: `["useActionState", "useAsyncEffect", "usePromise", "useFetch"]`, AnswerIndex: 0, Explanation: "useActionState adalah hook resmi React 19 untuk mengelola form actions dan status async pending.", Difficulty: "medium", Points: 10},
		{CategoryID: catWeb.ID, Question: "Atribut rel apa yang penting disertakan saat menggunakan target='_blank' pada tag <a>?", Options: `["rel='nofollow'", "rel='noopener noreferrer'", "rel='preload'", "rel='canonical'"]`, AnswerIndex: 1, Explanation: "rel='noopener noreferrer' mencegah tab baru mengakses window.opener untuk keamanan isolasi proses.", Difficulty: "easy", Points: 10},

		// Backend & Go
		{CategoryID: catGo.ID, Question: "Bagaimana pola idiomatik mendengarkan pembatalan context di dalam loop goroutine di Go?", Options: `["try-catch block", "switch case ctx.Done()", "select { case <-ctx.Done(): return }", "runtime.GC()"]`, AnswerIndex: 2, Explanation: "Statement select dengan case <-ctx.Done() adalah pola standar Go menangani pembatalan context.", Difficulty: "medium", Points: 10},
		{CategoryID: catGo.ID, Question: "Di Go Fiber, di mana middleware CORS sebaiknya didaftarkan?", Options: `["Setelah semua route selesai", "Sebelum handler route didaftarkan", "Di goroutine terpisah", "Di fungsi init DB"]`, AnswerIndex: 1, Explanation: "Middleware CORS harus didaftarkan di awal sebelum routes agar preflight OPTIONS tertangani.", Difficulty: "easy", Points: 10},
		{CategoryID: catGo.ID, Question: "Apa tipe data bawaan Go yang aman untuk sharing data antar goroutine tanpa explicit mutex lock?", Options: `["Slice", "Map", "Channel", "Pointer"]`, AnswerIndex: 2, Explanation: "Channel di Go dirancang untuk komunikasi thread-safe antargoroutine ('Do not communicate by sharing memory; instead, share memory by communicating').", Difficulty: "easy", Points: 10},
		{CategoryID: catGo.ID, Question: "Keyword apa di Go yang digunakan untuk menunda eksekusi fungsi hingga fungsi pembungkusnya selesai?", Options: `["defer", "delay", "sleep", "yield"]`, AnswerIndex: 0, Explanation: "defer menunda eksekusi instruksi (misal closing file/database) sampai fungsi di sekelilingnya me-return nilai.", Difficulty: "easy", Points: 10},

		// Logic
		{CategoryID: catLogic.ID, Question: "Lanjutkan deret pola bilangan berikut: 2, 6, 12, 20, 30, ...?", Options: `["38", "40", "42", "44"]`, AnswerIndex: 2, Explanation: "Pola selisih: +4, +6, +8, +10, +12. Maka 30 + 12 = 42.", Difficulty: "easy", Points: 10},
		{CategoryID: catLogic.ID, Question: "Berapa kompleksitas waktu (Big-O) rata-rata Binary Search pada array terurut?", Options: `["O(1)", "O(n)", "O(log n)", "O(n log n)"]`, AnswerIndex: 2, Explanation: "Binary search membagi ruang pencarian menjadi setengah pada tiap iterasinya, menghasilkan O(log n).", Difficulty: "easy", Points: 10},
		{CategoryID: catLogic.ID, Question: "Jika 5 mesin dapat membuat 5 barang dalam 5 menit, berapa menit yang dibutuhkan 100 mesin untuk membuat 100 barang?", Options: `["5 Menit", "20 Menit", "50 Menit", "100 Menit"]`, AnswerIndex: 0, Explanation: "1 mesin membutuhkan 5 menit untuk membuat 1 barang. Maka 100 mesin membuat 100 barang secara paralel tetap dalam 5 menit.", Difficulty: "medium", Points: 10},
	}

	for _, q := range questions {
		var existing Question
		if err := db.Where("question = ?", q.Question).First(&existing).Error; err != nil {
			db.Create(&q)
		}
	}
}
