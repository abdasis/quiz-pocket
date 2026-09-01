package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Slug        string    `gorm:"uniqueIndex;not null" json:"slug"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	QuestionCount int     `json:"question_count"`
	CreatedAt   time.Time `json:"created_at"`
}

type Question struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CategoryID  uint      `gorm:"index;not null" json:"category_id"`
	Category    Category  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Question    string    `gorm:"not null" json:"question"`
	Options     string    `gorm:"type:text;not null" json:"-"` // JSON string array of choices
	OptionsList []string  `gorm:"-" json:"options"`
	AnswerIndex int       `json:"answer_index"` // 0-based correct index
	Explanation string    `json:"explanation"`
	Difficulty  string    `json:"difficulty"` // easy, medium, hard
	Points      int       `json:"points"`
	CreatedAt   time.Time `json:"created_at"`
}

type QuizResult struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
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
	if err := db.AutoMigrate(&Category{}, &Question{}, &QuizResult{}); err != nil {
		log.Fatalf("Auto-migration failed: %v", err)
	}

	// Seed default categories and questions if empty
	var catCount int64
	db.Model(&Category{}).Count(&catCount)
	if catCount == 0 {
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

	// API Routes
	api := app.Group("/api/v1")

	// 1. Categories
	api.Get("/categories", func(c *fiber.Ctx) error {
		var cats []Category
		if err := db.Find(&cats).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		// Update question count dynamically
		for i := range cats {
			var count int64
			db.Model(&Question{}).Where("category_id = ?", cats[i].ID).Count(&count)
			cats[i].QuestionCount = int(count)
		}
		return c.JSON(fiber.Map{"success": true, "data": cats})
	})

	// 2. Questions by Category
	api.Get("/quiz/:slug", func(c *fiber.Ctx) error {
		slug := c.Params("slug")
		var cat Category
		if err := db.Where("slug = ?", slug).First(&cat).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Kategori kuis tidak ditemukan"})
		}

		var questions []Question
		if err := db.Where("category_id = ?", cat.ID).Order("id ASC").Find(&questions).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		for i := range questions {
			var opts []string
			if err := json.Unmarshal([]byte(questions[i].Options), &opts); err == nil {
				questions[i].OptionsList = opts
			}
		}

		return c.JSON(fiber.Map{
			"success":  true,
			"category": cat,
			"data":     questions,
		})
	})

	// 3. Submit Quiz Result
	api.Post("/quiz/submit", func(c *fiber.Ctx) error {
		var req struct {
			CategoryID   uint `json:"category_id"`
			Score        int  `json:"score"`
			Total        int  `json:"total"`
			CorrectCount int  `json:"correct_count"`
			TimeSpentSec int  `json:"time_spent_sec"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		res := QuizResult{
			CategoryID:   req.CategoryID,
			Score:        req.Score,
			Total:        req.Total,
			CorrectCount: req.CorrectCount,
			TimeSpentSec: req.TimeSpentSec,
		}
		if err := db.Create(&res).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{"success": true, "data": res})
	})

	// 4. Random Quiz (Campuran)
	api.Get("/quiz-random", func(c *fiber.Ctx) error {
		limit, _ := strconv.Atoi(c.Query("limit", "10"))
		if limit <= 0 || limit > 50 {
			limit = 10
		}

		var questions []Question
		if err := db.Preload("Category").Order("RANDOM()").Limit(limit).Find(&questions).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		for i := range questions {
			var opts []string
			if err := json.Unmarshal([]byte(questions[i].Options), &opts); err == nil {
				questions[i].OptionsList = opts
			}
		}

		return c.JSON(fiber.Map{
			"success": true,
			"total":   len(questions),
			"data":    questions,
		})
	})

	// 5. Health Check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "app": "Quiz Pocket API", "timestamp": time.Now()})
	})

	// Static Web Frontend Serving
	app.Static("/", "/home/abdasis/Projects/quiz-pocket/apps/web/dist")
	app.Get("*", func(c *fiber.Ctx) error {
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
		{Slug: "islamic-basic", Title: "Pendidikan Agama Islam", Description: "Rukun Iman, Rukun Islam, Sejarah Nabi & Sahabat", Icon: "BookOpen"},
		{Slug: "web-dev", Title: "Web & Frontend Engineering", Description: "HTML/CSS, React, TypeScript, Tailwind & Browser API", Icon: "Code"},
		{Slug: "backend-go", Title: "Backend & Golang Mastery", Description: "Go Fiber, Concurrency, REST API, Database & Architecture", Icon: "Server"},
		{Slug: "general-logic", Title: "Logika & Algoritma", Description: "Pemecahan masalah, pola angka, struktur data & penalaran", Icon: "Cpu"},
	}

	for _, c := range categories {
		db.Create(&c)
	}

	// Fetch created categories
	var catIslam, catWeb, catGo, catLogic Category
	db.Where("slug = ?", "islamic-basic").First(&catIslam)
	db.Where("slug = ?", "web-dev").First(&catWeb)
	db.Where("slug = ?", "backend-go").First(&catGo)
	db.Where("slug = ?", "general-logic").First(&catLogic)

	questions := []Question{
		// Islam
		{
			CategoryID:  catIslam.ID,
			Question:    "Berapa jumlah rukun iman dalam ajaran Islam?",
			Options:     `["4", "5", "6", "7"]`,
			AnswerIndex: 2,
			Explanation: "Rukun Iman ada 6: Iman kepada Allah, Malaikat, Kitab-kitab, Rasul-rasul, Hari Kiamat, dan Qada & Qadar.",
			Difficulty:  "easy",
			Points:      10,
		},
		{
			CategoryID:  catIslam.ID,
			Question:    "Surah apa yang disebut sebagai 'Ummul Kitab' atau 'Ummul Qur'an'?",
			Options:     `["Al-Baqarah", "Al-Fatihah", "Yasin", "Al-Ikhlas"]`,
			AnswerIndex: 1,
			Explanation: "Surah Al-Fatihah disebut Ummul Kitab (Induk Al-Kitab) karena mencakup pokok-pokok ajaran Al-Qur'an.",
			Difficulty:  "easy",
			Points:      10,
		},
		{
			CategoryID:  catIslam.ID,
			Question:    "Siapakah Sahabat Nabi yang menemani beliau hijrah dan bersembunyi di Gua Tsur?",
			Options:     `["Umar bin Khattab", "Ali bin Abi Thalib", "Abu Bakar Ash-Shiddiq", "Utsman bin Affan"]`,
			AnswerIndex: 2,
			Explanation: "Abu Bakar Ash-Shiddiq radhiyallahu 'anhu adalah sahabat yang menemani Rasulullah ﷺ dalam perjalanan hijrah ke Madinah.",
			Difficulty:  "medium",
			Points:      10,
		},
		{
			CategoryID:  catIslam.ID,
			Question:    "Mushaf Al-Qur'an standar Madani yang dicetak Kompleks Percetakan Al-Qur'an Raja Fahd umumnya terdiri dari berapa baris per halaman?",
			Options:     `["13 Baris", "15 Baris", "17 Baris", "18 Baris"]`,
			AnswerIndex: 1,
			Explanation: "Mushaf Madani Rasm Utsmani standar King Fahd Complex memiliki format 15 baris per halaman dan berakhir pada nomor ayat di setiap akhir halaman (Ayat Pojok).",
			Difficulty:  "medium",
			Points:      10,
		},
		// Web Dev
		{
			CategoryID:  catWeb.ID,
			Question:    "Di CSS modern, unit viewport apa yang otomatis menyesuaikan tinggi layar smartphone saat browser toolbar/address bar muncul dan hilang?",
			Options:     `["vh", "100vh", "100dvh", "100lvh"]`,
			AnswerIndex: 2,
			Explanation: "100dvh (dynamic viewport height) memperbarui tingginya secara dinamis saat bilah antarmuka browser mobile mengembang atau menyusut.",
			Difficulty:  "medium",
			Points:      10,
		},
		{
			CategoryID:  catWeb.ID,
			Question:    "Apa fungsi dari `scrollbar-gutter: stable` pada CSS?",
			Options:     `["Menghilangkan scrollbar sepenuhnya", "Mencegah terjadinya Layout Shift saat scrollbar muncul/hilang", "Membuat scrollbar berwarna transparan", "Mengunci scroll mouse pada container"]`,
			AnswerIndex: 1,
			Explanation: "scrollbar-gutter: stable mencadangkan ruang untuk scrollbar sehingga halaman tidak mengalami pergeseran tata letak (layout shift) saat konten berubah panjang.",
			Difficulty:  "medium",
			Points:      10,
		},
		{
			CategoryID:  catWeb.ID,
			Question:    "Pada standar Apple Human Interface Guidelines (HIG), berapa ukuran minimal touch target untuk navigasi mobile yang ramah ibu jari?",
			Options:     `["24x24px", "32x32px", "44x44px", "64x64px"]`,
			AnswerIndex: 2,
			Explanation: "Apple HIG merekomendasikan area sentuh (touch target) minimal 44x44 points/pixels agar mudah dan akurat ditekan oleh jemari pengguna.",
			Difficulty:  "easy",
			Points:      10,
		},
		// Golang
		{
			CategoryID:  catGo.ID,
			Question:    "Bagaimana cara membaca context deadline atau pembatalan di dalam perulangan goroutine di Go?",
			Options:     `["Menggunakan try-catch block", "Menggunakan switch case pada ctx.Done()", "Menggunakan select { case <-ctx.Done(): return }", "Menjalankan runtime.GC()"]`,
			AnswerIndex: 2,
			Explanation: "Pola idiomatik Go menggunakan select statement yang mendengarkan sinyal dari channel <-ctx.Done() untuk membatalkan proses yang berjalan.",
			Difficulty:  "medium",
			Points:      10,
		},
		{
			CategoryID:  catGo.ID,
			Question:    "Di framework Go Fiber, di mana middleware CORS sebaiknya didaftarkan?",
			Options:     `["Setelah semua handler route selesai", "Sebelum registrasi route kelompok (app.Group/app.Get)", "Di dalam goroutine terpisah", "Di dalam function init() database"]`,
			AnswerIndex: 1,
			Explanation: "Middleware CORS harus dipasang di awal sebelum handler route dieksekusi agar pre-flight request OPTIONS dapat ditangani dengan benar.",
			Difficulty:  "easy",
			Points:      10,
		},
		// Logic
		{
			CategoryID:  catLogic.ID,
			Question:    "Lanjutkan pola bilangan berikut: 2, 6, 12, 20, 30, ...?",
			Options:     `["38", "40", "42", "44"]`,
			AnswerIndex: 2,
			Explanation: "Pola selisih: +4, +6, +8, +10, +12. Maka 30 + 12 = 42 (atau pola n * (n+1) -> 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).",
			Difficulty:  "easy",
			Points:      10,
		},
		{
			CategoryID:  catLogic.ID,
			Question:    "Manakah kompleksitas waktu (Big-O) rata-rata dari pencarian Binary Search pada array terurut?",
			Options:     `["O(1)", "O(n)", "O(log n)", "O(n log n)"]`,
			AnswerIndex: 2,
			Explanation: "Binary search membagi ruang pencarian menjadi setengah pada setiap langkahnya, sehingga memiliki kompleksitas waktu O(log n).",
			Difficulty:  "easy",
			Points:      10,
		},
	}

	for _, q := range questions {
		db.Create(&q)
	}
}
