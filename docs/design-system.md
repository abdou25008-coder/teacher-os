# TEACHER OS — Design System & UI/UX Guidelines

---

## 1. Design Philosophy
- **Modern, Calm, Intelligent**: Clean interface designed to eliminate visual stress during busy teaching hours.
- **Show the Next Best Action**: Don't just display passive graphs—always highlight actionable next steps.
- **Arabic-First & Flawless RTL**: Crafted specifically for natural Arabic reading order, right-to-left layout dynamics, and authentic Egyptian educational terminology.

---

## 2. Design Tokens

### 2.1 Color Palette
```css
/* Primary Brand - Deep Egyptian Indigo */
--color-primary-50:  #EEF2FF;
--color-primary-500: #4338CA;
--color-primary-700: #3730A3;
--color-primary-900: #1E1B4B;

/* Accent - Nile Emerald (Growth & Intelligence) */
--color-accent-50:   #ECFDF5;
--color-accent-500:  #059669;
--color-accent-700:  #047857;

/* Warning & Alerts - Warm Amber */
--color-amber-500:   #D97706;

/* Error & Risk - Crimson */
--color-error-500:   #DC2626;

/* Neutral Surface & Backgrounds */
--color-bg-base:     #F8FAFC;
--color-surface-card:#FFFFFF;
--color-text-main:   #0F172A;
--color-text-muted:  #64748B;
--color-border:      #E2E8F0;
```

### 2.2 Typography
- **Arabic Primary Font**: `Cairo` / `Alexandria` (Optimized for Arabic legibility and modern numerals).
- **Hierarchy**:
  - `Display Large`: 28sp / Bold (Title headers)
  - `Heading 1`: 22sp / SemiBold (Section titles)
  - `Body Regular`: 15sp / Regular (Reading content)
  - `Label Small`: 12sp / Medium (Badges, tags, status pills)

### 2.3 Semantic Component Patterns
- **"Child Pulse" Badge**: Pill badge with dynamic status color (`Good: Emerald`, `Needs Attention: Amber`, `Action Required: Crimson`).
- **"My Intelligent Day" Priority Card**: Prominent surface card with high contrast border, reason explanation, and 1-tap action button.
- **Concept Mastery Radar Pill**: Concept name + percentage + color progress indicator.
