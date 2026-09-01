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
	GoogleID         string    `json:"google_id"`
	Points           int       `gorm:"default:0" json:"points"`
	WeeklyPoints     int       `gorm:"default:0" json:"weekly_points"`
	CurrentWeekKey   string    `json:"current_week_key"` // e.g. "2026-W36"
	QuizzesCompleted int       `gorm:"default:0" json:"quizzes_completed"`
	Streak           int       `gorm:"default:1" json:"streak"`
	DuelWins         int       `gorm:"default:0" json:"duel_wins"`
	DuelLosses       int       `gorm:"default:0" json:"duel_losses"`
	DuelDraws        int       `gorm:"default:0" json:"duel_draws"`
	DuelTotal        int       `gorm:"default:0" json:"duel_total"`
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

// DuelMatch: Model Pertandingan 1 vs 1
type DuelMatch struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	MatchCode      string    `gorm:"uniqueIndex;not null" json:"match_code"`
	Player1Email   string    `gorm:"index;not null" json:"player1_email"`
	Player1Name    string    `json:"player1_name"`
	Player1Avatar  string    `json:"player1_avatar"`
	Player1Score   int       `gorm:"default:0" json:"player1_score"`
	Player1Correct int       `gorm:"default:0" json:"player1_correct"`
	Player1Done    bool      `gorm:"default:false" json:"player1_done"`
	Player2Email   string    `gorm:"index" json:"player2_email"`
	Player2Name    string    `json:"player2_name"`
	Player2Avatar  string    `json:"player2_avatar"`
	Player2Score   int       `gorm:"default:0" json:"player2_score"`
	Player2Correct int       `gorm:"default:0" json:"player2_correct"`
	Player2Done    bool      `gorm:"default:false" json:"player2_done"`
	Status         string    `gorm:"default:'waiting'" json:"status"` // waiting, matched, finished
	WinnerEmail    string    `json:"winner_email"`
	QuestionIDs    string    `gorm:"type:text" json:"-"`
	QuestionsJSON  string    `gorm:"type:text" json:"-"`
	Questions      []Question `gorm:"-" json:"questions"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// Helper untuk mengambil soal dari sesi aktif 30 menit
func getLiveSlotQuestions(db *gorm.DB) []Question {
	const slotDurationSec int64 = 1800
	currentUnix := time.Now().Unix()
	slotID := currentUnix / slotDurationSec

	// Cek jika snapshot sesi sudah tersimpan di database
	var sessionRecord QuizSession
	if err := db.Where("slot_id = ?", slotID).First(&sessionRecord).Error; err == nil && sessionRecord.QuestionsPayload != "" {
		var questions []Question
		if err := json.Unmarshal([]byte(sessionRecord.QuestionsPayload), &questions); err == nil && len(questions) > 0 {
			return questions
		}
	}

	// Generate deterministic jika belum ada record snapshot
	h := sha256.New()
	binary.Write(h, binary.BigEndian, slotID)
	seedBytes := h.Sum(nil)

	countOptions := []int{10, 15, 20}
	randomIndex := int(seedBytes[3]) % len(countOptions)
	targetCount := countOptions[randomIndex]

	var countSD, countSMP, countSMA int
	if targetCount == 10 {
		countSD, countSMP, countSMA = 4, 4, 2
	} else if targetCount == 15 {
		countSD, countSMP, countSMA = 6, 6, 3
	} else {
		countSD, countSMP, countSMA = 8, 8, 4
	}

	var sdQuestions, smpQuestions, smaQuestions []Question
	db.Where("level = ?", "SD").Order("id ASC").Find(&sdQuestions)
	db.Where("level = ?", "SMP").Order("id ASC").Find(&smpQuestions)
	db.Where("level = ?", "SMA").Order("id ASC").Find(&smaQuestions)

	var slotQuestions []Question

	pickQuestions := func(list []Question, count int, seedOffset byte) {
		if len(list) == 0 {
			return
		}
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
		}
	}

	pickQuestions(sdQuestions, countSD, seedBytes[0])
	pickQuestions(smpQuestions, countSMP, seedBytes[1])
	pickQuestions(smaQuestions, countSMA, seedBytes[2])

	for i := len(slotQuestions) - 1; i > 0; i-- {
		j := int(seedBytes[(i*7)%len(seedBytes)]) % (i + 1)
		slotQuestions[i], slotQuestions[j] = slotQuestions[j], slotQuestions[i]
	}

	return slotQuestions
}

func getISOWeekKey(t time.Time) string {
	year, week := t.ISOWeek()
	return fmt.Sprintf("%d-W%02d", year, week)
}

func main() {
	dsn := "host=/var/run/postgresql dbname=quiz_pocket sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to Postgres: %v", err)
	}

	// Auto-migrate schema
	if err := db.AutoMigrate(&User{}, &Category{}, &Question{}, &QuizSession{}, &QuizSlotSubmission{}, &DuelMatch{}); err != nil {
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
		currentWeek := getISOWeekKey(time.Now())
		var user User
		err := db.Where("email = ?", req.Email).First(&user).Error
		if err != nil {
			user = User{
				Email:            req.Email,
				Name:             req.Name,
				AvatarURL:        req.AvatarURL,
				GoogleID:         req.GoogleID,
				Points:           0,
				WeeklyPoints:     0,
				CurrentWeekKey:   currentWeek,
				QuizzesCompleted: 0,
				Streak:           1,
				LastActiveDate:   todayStr,
			}
			if err := db.Create(&user).Error; err != nil {
				return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
			}
		} else {
			// Update avatar or name if provided and verify week reset
			if req.Name != "" && user.Name == "" {
				user.Name = req.Name
			}
			if req.AvatarURL != "" && user.AvatarURL == "" {
				user.AvatarURL = req.AvatarURL
			}
			if user.CurrentWeekKey != currentWeek {
				user.CurrentWeekKey = currentWeek
				user.WeeklyPoints = 0
			}
			db.Save(&user)
		}

		return c.JSON(fiber.Map{
			"success": true,
			"user":    user,
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

		// Update historical submissions to reflect new name/avatar
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

		// Check weekly reset
		currentWeek := getISOWeekKey(time.Now())
		if user.CurrentWeekKey != currentWeek {
			user.CurrentWeekKey = currentWeek
			user.WeeklyPoints = 0
			db.Save(&user)
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

	// 4. Current Live 30-Minute Slot Query & Snapshot Persistence
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

		// Komposisi Soal: 40% SD, 40% SMP, 20% SMA
		var countSD, countSMP, countSMA int
		if targetCount == 10 {
			countSD, countSMP, countSMA = 4, 4, 2 // 40% SD, 40% SMP, 20% SMA
		} else if targetCount == 15 {
			countSD, countSMP, countSMA = 6, 6, 3 // 40% SD, 40% SMP, 20% SMA
		} else {
			countSD, countSMP, countSMA = 8, 8, 4 // 40% SD, 40% SMP, 20% SMA
		}

		var sdQuestions, smpQuestions, smaQuestions []Question
		db.Where("level = ?", "SD").Order("id ASC").Find(&sdQuestions)
		db.Where("level = ?", "SMP").Order("id ASC").Find(&smpQuestions)
		db.Where("level = ?", "SMA").Order("id ASC").Find(&smaQuestions)

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

		// Acak final urutan seluruh soal antar-tingkat agar tidak mengelompok SD dulu
		for i := len(slotQuestions) - 1; i > 0; i-- {
			j := int(seedBytes[(i*7)%len(seedBytes)]) % (i + 1)
			slotQuestions[i], slotQuestions[j] = slotQuestions[j], slotQuestions[i]
		}

		// Snapshot Persistence: Simpan snapshot sesi ke DB jika belum ada
		var sessionRecord QuizSession
		if err := db.Where("slot_id = ?", slotID).First(&sessionRecord).Error; err != nil {
			qIDsJSON, _ := json.Marshal(questionIDs)
			payloadJSON, _ := json.Marshal(slotQuestions)
			sessionRecord = QuizSession{
				SlotID:           slotID,
				SlotStart:        slotStartTime,
				SlotEnd:          slotEndTime,
				CategoryID:       activeCategory.ID,
				CategoryTitle:    "Kuis Terpadu (SD · SMP · SMA)",
				QuestionCount:    len(slotQuestions),
				QuestionIDs:      string(qIDsJSON),
				QuestionsPayload: string(payloadJSON),
			}
			db.Create(&sessionRecord)
		}

		// Cek apakah user yang sedang login sudah pernah submit di slot ini
		userSubmitted := false
		var userSubmission QuizSlotSubmission
		if userEmail != "" {
			var u User
			if err := db.Where("email = ?", userEmail).First(&u).Error; err == nil {
				if err := db.Where("slot_id = ? AND user_id = ?", slotID, u.ID).First(&userSubmission).Error; err == nil {
					userSubmitted = true
				}
			}
		}

		// Total partisipan di slot ini
		var participantCount int64
		db.Model(&QuizSlotSubmission{}).Where("slot_id = ?", slotID).Count(&participantCount)

		return c.JSON(fiber.Map{
			"success":           true,
			"slot_id":           slotID,
			"slot_start":        slotStartTime,
			"slot_end":          slotEndTime,
			"seconds_remaining": secondsRemaining,
			"category":          activeCategory,
			"questions":         slotQuestions,
			"user_submitted":    userSubmitted,
			"user_submission":   userSubmission,
			"participants":      participantCount,
		})
	})

	// 5. Riwayat Seluruh Sesi Lampau & Detail Peserta
	api.Get("/sessions/history", func(c *fiber.Ctx) error {
		var sessions []QuizSession
		db.Order("slot_id DESC").Limit(20).Find(&sessions)

		type SessionWithSubmissions struct {
			Session      QuizSession          `json:"session"`
			Submissions  []QuizSlotSubmission `json:"submissions"`
			Participants int                  `json:"participants"`
		}

		var result []SessionWithSubmissions
		for _, s := range sessions {
			var subs []QuizSlotSubmission
			db.Where("slot_id = ?", s.SlotID).Order("score DESC, time_spent_sec ASC").Find(&subs)
			result = append(result, SessionWithSubmissions{
				Session:      s,
				Submissions:  subs,
				Participants: len(subs),
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    result,
		})
	})

	// 6. Practice Mode Endpoint (Random 10 Questions, No Points)
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

	// 7. Submit Live Slot (With Streak Multiplier, Weekly Season & Analytics Breakdown)
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

		// Weekly Season Key Check
		currentWeek := getISOWeekKey(time.Now())
		if user.CurrentWeekKey != currentWeek {
			user.CurrentWeekKey = currentWeek
			user.WeeklyPoints = 0
		}

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
		user.WeeklyPoints += finalScoreAwarded
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
			"weekly_points":     user.WeeklyPoints,
			"score_awarded":     finalScoreAwarded,
			"streak_multiplier": multiplier,
			"streak":            user.Streak,
			"submission":        submission,
			"user":              user,
		})
	})

	// 8. Leaderboard (Dua Tab: Musim Mingguan & Sepanjang Masa)
	api.Get("/leaderboard", func(c *fiber.Ctx) error {
		mode := c.Query("mode", "weekly") // "weekly" atau "alltime"
		var users []User
		
		if mode == "alltime" {
			db.Order("points DESC, quizzes_completed DESC, updated_at ASC").Limit(25).Find(&users)
		} else {
			currentWeek := getISOWeekKey(time.Now())
			db.Where("current_week_key = ?", currentWeek).
				Order("weekly_points DESC, quizzes_completed DESC, updated_at ASC").
				Limit(25).
				Find(&users)
		}
		return c.JSON(fiber.Map{
			"success": true, 
			"mode":    mode, 
			"week":    getISOWeekKey(time.Now()),
			"data":    users,
		})
	})

	// 9. Matchmaking 1 vs 1: Cari Lawan / Masuk Antrean Duel
	api.Post("/duel/matchmake", func(c *fiber.Ctx) error {
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

		// Cek apakah ada duel waiting dari orang lain (< 2 menit lalu)
		twoMinsAgo := time.Now().Add(-2 * time.Minute)
		var waitingMatch DuelMatch
		err := db.Where("status = ? AND player1_email != ? AND created_at >= ?", "waiting", req.Email, twoMinsAgo).
			Order("created_at ASC").
			First(&waitingMatch).Error

		if err == nil {
			// Temukan lawan! Match up dengan player 2
			waitingMatch.Player2Email = req.Email
			waitingMatch.Player2Name = user.Name
			waitingMatch.Player2Avatar = user.AvatarURL
			waitingMatch.Status = "matched"
			db.Save(&waitingMatch)

			var qList []Question
			if err := json.Unmarshal([]byte(waitingMatch.QuestionsJSON), &qList); err == nil {
				waitingMatch.Questions = qList
			}

			return c.JSON(fiber.Map{
				"success": true,
				"matched": true,
				"match":   waitingMatch,
			})
		}

		// Jika tidak ada lawan waiting, cek apakah user sudah punya room waiting aktif
		var myWaiting DuelMatch
		err = db.Where("status = ? AND player1_email = ? AND created_at >= ?", "waiting", req.Email, twoMinsAgo).
			First(&myWaiting).Error

		if err == nil {
			var qList []Question
			if err := json.Unmarshal([]byte(myWaiting.QuestionsJSON), &qList); err == nil {
				myWaiting.Questions = qList
			}
			return c.JSON(fiber.Map{
				"success": true,
				"matched": false,
				"match":   myWaiting,
			})
		}

		// Ambil soal persis dari sesi yang sedang aktif saat ini
		sessionQuestions := getLiveSlotQuestions(db)
		if len(sessionQuestions) == 0 {
			// Fallback jika tidak ada sesi
			var sdQuestions, smpQuestions, smaQuestions []Question
			db.Where("level = ?", "SD").Order("RANDOM()").Limit(4).Find(&sdQuestions)
			db.Where("level = ?", "SMP").Order("RANDOM()").Limit(4).Find(&smpQuestions)
			db.Where("level = ?", "SMA").Order("RANDOM()").Limit(2).Find(&smaQuestions)
			sessionQuestions = append(sdQuestions, smpQuestions...)
			sessionQuestions = append(sessionQuestions, smaQuestions...)
			for i := range sessionQuestions {
				var opts []string
				if err := json.Unmarshal([]byte(sessionQuestions[i].Options), &opts); err == nil {
					sessionQuestions[i].OptionsList = opts
				}
			}
		}

		qBytes, _ := json.Marshal(sessionQuestions)
		matchCode := fmt.Sprintf("duel_%d_%d", time.Now().UnixNano(), user.ID)

		newMatch := DuelMatch{
			MatchCode:     matchCode,
			Player1Email:  req.Email,
			Player1Name:   user.Name,
			Player1Avatar: user.AvatarURL,
			Status:        "waiting",
			QuestionsJSON: string(qBytes),
		}
		if err := db.Create(&newMatch).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		newMatch.Questions = sessionQuestions
		return c.JSON(fiber.Map{
			"success": true,
			"matched": false,
			"match":   newMatch,
		})
	})

	// 10. Polling Status Duel Match
	api.Get("/duel/status/:code", func(c *fiber.Ctx) error {
		code := c.Params("code")
		var match DuelMatch
		if err := db.Where("match_code = ?", code).First(&match).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Match not found"})
		}

		var qList []Question
		if err := json.Unmarshal([]byte(match.QuestionsJSON), &qList); err == nil {
			match.Questions = qList
		}

		return c.JSON(fiber.Map{
			"success": true,
			"match":   match,
		})
	})

	// 11. Submit Skor Duel 1 vs 1 & Simpan Poin serta Win Rate
	api.Post("/duel/submit", func(c *fiber.Ctx) error {
		var req struct {
			MatchCode    string `json:"match_code"`
			UserEmail    string `json:"user_email"`
			Score        int    `json:"score"`
			CorrectCount int    `json:"correct_count"`
		}
		if err := c.BodyParser(&req); err != nil || req.MatchCode == "" || req.UserEmail == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
		}

		var match DuelMatch
		if err := db.Where("match_code = ?", req.MatchCode).First(&match).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Match not found"})
		}

		isP1 := match.Player1Email == req.UserEmail
		isP2 := match.Player2Email == req.UserEmail

		if !isP1 && !isP2 {
			return c.Status(403).JSON(fiber.Map{"error": "Unauthorized player"})
		}

		if isP1 {
			match.Player1Score = req.Score
			match.Player1Correct = req.CorrectCount
			match.Player1Done = true
		} else {
			match.Player2Score = req.Score
			match.Player2Correct = req.CorrectCount
			match.Player2Done = true
		}

		// Jika kedua pemain selesai (atau status sudah matched dan submit terjadi)
		if match.Player1Done && match.Player2Done {
			match.Status = "finished"
			var p1, p2 User
			db.Where("email = ?", match.Player1Email).First(&p1)
			db.Where("email = ?", match.Player2Email).First(&p2)

			p1.DuelTotal += 1
			p2.DuelTotal += 1

			// Poin duel bertambah ke akumulasi points masing-masing
			p1.Points += match.Player1Score
			p1.WeeklyPoints += match.Player1Score
			p2.Points += match.Player2Score
			p2.WeeklyPoints += match.Player2Score

			if match.Player1Score > match.Player2Score {
				match.WinnerEmail = match.Player1Email
				p1.DuelWins += 1
				p2.DuelLosses += 1
				// Bonus kemenangan 50 pts untuk pemenang
				p1.Points += 50
				p1.WeeklyPoints += 50
			} else if match.Player2Score > match.Player1Score {
				match.WinnerEmail = match.Player2Email
				p2.DuelWins += 1
				p1.DuelLosses += 1
				p2.Points += 50
				p2.WeeklyPoints += 50
			} else {
				match.WinnerEmail = "draw"
				p1.DuelDraws += 1
				p2.DuelDraws += 1
				// Bonus seri 20 pts masing-masing
				p1.Points += 20
				p1.WeeklyPoints += 20
				p2.Points += 20
				p2.WeeklyPoints += 20
			}

			db.Save(&p1)
			db.Save(&p2)
		}

		db.Save(&match)

		var qList []Question
		if err := json.Unmarshal([]byte(match.QuestionsJSON), &qList); err == nil {
			match.Questions = qList
		}

		return c.JSON(fiber.Map{
			"success": true,
			"match":   match,
		})
	})

	// Static Downloads Serving (Direct APK Downloads)
	app.Static("/downloads", "/home/abdasis/Projects/quiz-pocket/apps/web/dist/downloads")

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