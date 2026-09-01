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
	LastActiveDate   string    `json:"last_active_date"` // YYYY-MM-DD
	SdCorrect        int       `gorm:"default:0" json:"sd_correct"`
	SdTotal          int       `gorm:"default:0" json:"sd_total"`
	SmpCorrect       int       `gorm:"default:0" json:"smp_correct"`
	SmpTotal         int       `gorm:"default:0" json:"smp_total"`
	SmaCorrect       int       `gorm:"default:0" json:"sma_correct"`
	SmaTotal         int       `gorm:"default:0" json:"sma_total"`
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

// QuizSession: Menyimpan snapshot soal yang aktif dan metadata sesi per 30 menit
type QuizSession struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	SlotID           int64     `gorm:"uniqueIndex;not null" json:"slot_id"`
	SlotStart        time.Time `json:"slot_start"`
	SlotEnd          time.Time `json:"slot_end"`
	CategoryID       uint      `json:"category_id"`
	CategoryTitle    string    `json:"category_title"`
	QuestionCount    int       `json:"question_count"`
	QuestionIDs      string    `gorm:"type:text" json:"-"` // JSON array string e.g. [1, 5, 12]
	QuestionsPayload string    `gorm:"type:text" json:"-"` // Snapshot JSON full array
	CreatedAt        time.Time `json:"created_at"`
}

// QuizSlotSubmission: Riwayat partisipan dan skor yang dicapai per sesi
type QuizSlotSubmission struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	SlotID       int64     `gorm:"index:idx_user_slot,unique;not null" json:"slot_id"`
	UserID       uint      `gorm:"index:idx_user_slot,unique;not null" json:"user_id"`
	UserEmail    string    `json:"user_email"`
	UserName     string    `json:"user_name"`
	AvatarURL    string    `json:"avatar_url"`
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

	// Auto-migrate schema
	if err := db.AutoMigrate(&User{}, &Category{}, &Question{}, &QuizSession{}, &QuizSlotSubmission{}); err != nil {
		log.Fatalf("Auto-migration failed: %v", err)
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

		todayStr := time.Now().Format("2006-01-02")
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
				LastActiveDate:   todayStr,
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

	// 2. User Profile Update (Ganti Nama & Photo Profile)
	api.Put("/user/profile", func(c *fiber.Ctx) error {
		var req struct {
			Email     string `json:"email"`
			Name      string `json:"name"`
			AvatarURL string `json:"avatar_url"`
		}
		if err := c.BodyParser(&req); err != nil || req.Email == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
		}

		var user User
		if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}

		if req.Name != "" {
			user.Name = req.Name
		}
		if req.AvatarURL != "" {
			user.AvatarURL = req.AvatarURL
		}
		if err := db.Save(&user).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile"})
		}

		// Sync username/avatar ke submissions lampau agar seragam
		db.Model(&QuizSlotSubmission{}).Where("user_id = ?", user.ID).Updates(map[string]interface{}{
			"user_name":  user.Name,
			"avatar_url": user.AvatarURL,
		})

		return c.JSON(fiber.Map{
			"success": true,
			"data":    user,
		})
	})

	// 3. User Profile + Stats Breakdown
	api.Get("/user/profile", func(c *fiber.Ctx) error {
		email := c.Query("email")
		if email == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Email parameter required"})
		}
		var user User
		if err := db.Where("email = ?", email).First(&user).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}

		multiplier := 1.0
		if user.Streak >= 7 {
			multiplier = 1.5
		} else if user.Streak >= 3 {
			multiplier = 1.2
		}

		return c.JSON(fiber.Map{
			"success":           true,
			"data":              user,
			"streak_multiplier": multiplier,
		})
	})

	// 3. Current Live 30-Minute Slot Query & Snapshot Persistence
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

		// Dynamic Pseudo-Random Question Count using Slot Hash (10, 15, or 20 secara acak)
		h := sha256.New()
		binary.Write(h, binary.BigEndian, slotID)
		seedBytes := h.Sum(nil)

		countOptions := []int{10, 15, 20}
		randomIndex := int(seedBytes[3]) % len(countOptions)
		targetCount := countOptions[randomIndex]

		// Komposisi Seimbang: Campuran soal dari setiap tingkatan (SD, SMP, SMA)
		var sdQuestions, smpQuestions, smaQuestions []Question
		db.Where("level = ?", "SD").Order("id ASC").Find(&sdQuestions)
		db.Where("level = ?", "SMP").Order("id ASC").Find(&smpQuestions)
		db.Where("level = ?", "SMA").Order("id ASC").Find(&smaQuestions)

		var countSD, countSMP, countSMA int
		if targetCount == 10 {
			countSD, countSMP, countSMA = 4, 3, 3
		} else if targetCount == 15 {
			countSD, countSMP, countSMA = 5, 5, 5
		} else {
			countSD, countSMP, countSMA = 7, 7, 6
		}

		var slotQuestions []Question
		var questionIDs []uint

		pickQuestions := func(list []Question, count int, seedOffset byte) {
			if len(list) == 0 {
				return
			}
			// Fisher-Yates shuffle deterministik berdasarkan hash slot
			shuffled := make([]Question, len(list))
			copy(shuffled, list)
			
			for i := len(shuffled) - 1; i > 0; i-- {
				j := int(seedBytes[(int(seedOffset)+i)%len(seedBytes)]) % (i + 1)
				shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
			}

			for i := 0; i < count && i < len(shuffled); i++ {
				q := shuffled[i]
				var opts []string
				if err := json.Unmarshal([]byte(q.Options), &opts); err == nil {
					q.OptionsList = opts
				}
				slotQuestions = append(slotQuestions, q)
				questionIDs = append(questionIDs, q.ID)
			}
		}

		pickQuestions(sdQuestions, countSD, seedBytes[0])
		pickQuestions(smpQuestions, countSMP, seedBytes[1])
		pickQuestions(smaQuestions, countSMA, seedBytes[2])

		// Interleave / Shuffle gabungan seluruh mata pelajaran (SD, SMP, SMA) agar urutan mata pelajaran bervariasi acak
		for i := len(slotQuestions) - 1; i > 0; i-- {
			j := int(seedBytes[(i*3)%len(seedBytes)]) % (i + 1)
			slotQuestions[i], slotQuestions[j] = slotQuestions[j], slotQuestions[i]
		}

		// Save/Ensure QuizSession Snapshot di Database
		var session QuizSession
		if err := db.Where("slot_id = ?", slotID).First(&session).Error; err != nil {
			qIDsBytes, _ := json.Marshal(questionIDs)
			qPayloadBytes, _ := json.Marshal(slotQuestions)
			session = QuizSession{
				SlotID:           slotID,
				SlotStart:        slotStartTime,
				SlotEnd:          slotEndTime,
				CategoryID:       activeCategory.ID,
				CategoryTitle:    activeCategory.Title,
				QuestionCount:    len(slotQuestions),
				QuestionIDs:      string(qIDsBytes),
				QuestionsPayload: string(qPayloadBytes),
			}
			db.Create(&session)
		}

		// Hitung Partisipan yang sudah submit di sesi ini
		var participants []QuizSlotSubmission
		db.Where("slot_id = ?", slotID).Order("score DESC, created_at ASC").Find(&participants)

		var userSubmission QuizSlotSubmission
		isCompleted := false
		if userEmail != "" {
			err := db.Where("slot_id = ? AND user_email = ?", slotID, userEmail).First(&userSubmission).Error
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
			"submission":        userSubmission,
			"participants_count": len(participants),
			"participants":      participants,
		})
	})

	// 4. Session History List Endpoint (Menampilkan daftar semua sesi lampau beserta soal & partisipannya)
	api.Get("/sessions/history", func(c *fiber.Ctx) error {
		var sessions []QuizSession
		db.Order("slot_id DESC").Limit(20).Find(&sessions)

		type SessionHistoryItem struct {
			Session           QuizSession          `json:"session"`
			ParticipantsCount int64                `json:"participants_count"`
			Participants      []QuizSlotSubmission `json:"participants"`
		}

		var result []SessionHistoryItem
		for _, s := range sessions {
			var subs []QuizSlotSubmission
			db.Where("slot_id = ?", s.SlotID).Order("score DESC").Find(&subs)
			result = append(result, SessionHistoryItem{
				Session:           s,
				ParticipantsCount: int64(len(subs)),
				Participants:      subs,
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    result,
		})
	})

	// 5. Practice Mode Endpoint (Random 10 Questions, No Points)
	api.Get("/practice-questions", func(c *fiber.Ctx) error {
		var questions []Question
		db.Order("RANDOM()").Limit(10).Find(&questions)
		for i := range questions {
			var opts []string
			if err := json.Unmarshal([]byte(questions[i].Options), &opts); err == nil {
				questions[i].OptionsList = opts
			}
		}
		return c.JSON(fiber.Map{
			"success":   true,
			"questions": questions,
		})
	})

	// 6. Submit Live Slot (With Streak Multiplier & Analytics Breakdown)
	api.Post("/live-slot/submit", func(c *fiber.Ctx) error {
		var req struct {
			SlotID       int64  `json:"slot_id"`
			UserEmail    string `json:"user_email"`
			Score        int    `json:"score"`
			Total        int    `json:"total"`
			CorrectCount int    `json:"correct_count"`
			TimeSpentSec int    `json:"time_spent_sec"`
			SdCorrect    int    `json:"sd_correct"`
			SdTotal      int    `json:"sd_total"`
			SmpCorrect   int    `json:"smp_correct"`
			SmpTotal     int    `json:"smp_total"`
			SmaCorrect   int    `json:"sma_correct"`
			SmaTotal     int    `json:"sma_total"`
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

		// Calculate Daily Streak
		todayStr := time.Now().Format("2006-01-02")
		yesterdayStr := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

		if user.LastActiveDate == yesterdayStr {
			user.Streak += 1
		} else if user.LastActiveDate != todayStr {
			user.Streak = 1
		}
		user.LastActiveDate = todayStr

		// Multiplier calculation
		multiplier := 1.0
		if user.Streak >= 7 {
			multiplier = 1.5
		} else if user.Streak >= 3 {
			multiplier = 1.2
		}

		finalScoreAwarded := int(float64(req.Score) * multiplier)

		submission := QuizSlotSubmission{
			SlotID:       req.SlotID,
			UserID:       user.ID,
			UserEmail:    user.Email,
			UserName:     user.Name,
			AvatarURL:    user.AvatarURL,
			Score:        finalScoreAwarded,
			Total:        req.Total,
			CorrectCount: req.CorrectCount,
			TimeSpentSec: req.TimeSpentSec,
		}
		if err := db.Create(&submission).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		user.Points += finalScoreAwarded
		user.QuizzesCompleted += 1
		user.SdCorrect += req.SdCorrect
		user.SdTotal += req.SdTotal
		user.SmpCorrect += req.SmpCorrect
		user.SmpTotal += req.SmpTotal
		user.SmaCorrect += req.SmaCorrect
		user.SmaTotal += req.SmaTotal
		db.Save(&user)

		return c.JSON(fiber.Map{
			"success":           true,
			"points":            user.Points,
			"score_awarded":     finalScoreAwarded,
			"streak_multiplier": multiplier,
			"streak":            user.Streak,
			"submission":        submission,
			"user":              user,
		})
	})

	// 7. Global Leaderboard
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
