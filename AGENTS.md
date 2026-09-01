# Quiz Pocket - Engineering & Design Constitution

Constitution for autonomous coding agents (Claude Code, Hermes Agent, Codex, Kiro).

## 📱 Design System: Apple Human Interface Guidelines (HIG) & Emil Kowalski Principles

Zero AI-slop, no fancy decorative design, no heavy artificial shadows. Clean, understated, and functional.

### 1. Visual Foundation
- **No Heavy Shadows:** Dilarang shadow tebal (`shadow-lg`, `shadow-2xl`).
- **Hairline Flat Borders:**
  * Light Mode: `border border-black/[0.06]` atau `border-black/[0.08]`
  * Dark Mode: `border border-white/[0.08]` atau `border-white/[0.10]`
- **Subtle Surface Vibrancy:** Frosted glass `backdrop-blur-2xl` dengan `bg-white/80` (Light) dan `bg-[#090a0f]/80` (Dark).
- **Corner Radii (Squircles):**
  * Modals / Main Cards: `rounded-3xl`
  * Buttons / Inputs / List Items: `rounded-2xl`
  * Badges / Pill Tags: `rounded-xl`
- **Zero Raw Emoji in UI:** Gunakan vektor Lucide icons resmi untuk ketajaman visual.

### 2. Touch Ergonomics & Mobile-First
- **Thumb Touch Targets:** Tombol interaktif minimal `44x44px` / `h-11` atau `h-12`.
- **Spring Feedback:**
  * Curve: `--apple-spring: cubic-bezier(0.16, 1, 0.3, 1)`
  * Press scale: `.pressable:active { transform: scale(0.97); }`
- **Zero Horizontal Overflow:** Batasi layout pada `w-full max-w-4xl mx-auto px-4 sm:px-6`.

### 3. File Naming Conventions
- **React Components:** Huruf kecil pemisah tanda hubung (hyphen-case): `app-header.tsx`, `quiz-player.tsx`, `login-modal.tsx`.
- **Dilarang:** `PascalCase` seperti `AppHeader.tsx` atau `QuizPlayer.tsx`.

---

## 🛠️ Backend Standards (Go Fiber + GORM + PostgreSQL)

- Handler hanya parsing request & response JSON.
- Database: PostgreSQL socket `/var/run/postgresql`, DB `quiz_pocket`.
- No raw SQL drop/truncate tanpa konfirmasi user.
- Explicit error handling dengan context wrapping.
