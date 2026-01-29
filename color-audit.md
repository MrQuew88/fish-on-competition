# Color Audit Report

**Generated:** 2026-01-29
**Branch:** feature/ui-improvements

---

## Summary

### Tailwind Config - Water Reflections Palette

The following custom colors are defined in `tailwind.config.ts`:

| Category | Colors |
|----------|--------|
| **water-*** | deepest (#152D30), deep (#1A3B3F), mid (#2C4F54), surface (#3D6A6F) |
| **reflect-*** | bright (#E8A66F), gold (#D4A574), amber (#C9915D), subtle (#B8896A) |
| **merged-*** | teal-gold (#4A6B5F), dark-amber (#5C5647) |
| **primary-*** | DEFAULT (#2C4F54), hover (#3D6A6F), dark (#1A3B3F), light (#E8F4F2), 50-900 scale |
| **accent-*** | DEFAULT (#D4A574), hover (#E8A66F), dark (#C9915D), amber, orange, emerald |
| **surface-*** | DEFAULT (#FFF), bg (#F8FAFC), muted (#F1F5F9), border (#E2E8F0), hover (#CBD5E1) |
| **text-*** | primary (#0F172A), secondary (#64748B), muted (#94A3B8), inverse (#FFF) |
| **status-*** | active (#4A6B5F), active-bg (rgba), completed (#94A3B8), pending (#D4A574) |
| **medal-*** | gold (#D4A574), gold-bg, silver (#64748B), silver-bg, bronze (#C9915D), bronze-bg |

---

## File-by-File Analysis

---

### components/Header.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (gradient)
- `from-water-deep`, `to-water-surface` (text gradient)
- `text-primary`, `hover:text-primary`, `bg-primary-light`, `bg-primary`

**Old Palette (Tailwind defaults):**
- `bg-white`, `border-slate-200`, `text-slate-600`, `text-slate-900`, `text-slate-500`
- `hover:bg-slate-50`, `hover:bg-slate-100`, `bg-slate-900/50`, `ring-slate-200`
- `from-slate-50`, `to-slate-100/50`

**Hard-coded values:** None

---

### app/layout.tsx

**Water Reflections Palette:** None

**Old Palette:**
- `antialiased` (no color)

**Hard-coded values:**
- `themeColor: '#102a43'` (in viewport metadata - NOT from palette)

---

### app/page.tsx (Home/Splash)

**Water Reflections Palette:**
- `text-water-deep`

**Old Palette:**
- `bg-slate-900`, `text-white`, `border-white`, `text-white/90`, `text-white/80`, `text-white/60`
- `from-slate-900/60`, `via-slate-900/20`, `to-slate-900/80`
- `bg-white/10`, `border-white/20`, `border-white/30`, `hover:border-white/50`, `hover:bg-white/10`

**Hard-coded values:** None

---

### app/(auth)/login/page.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (button gradient)
- `hover:from-water-mid`, `hover:to-water-surface`
- `focus:border-primary`, `focus:ring-primary/20`, `text-primary`, `hover:text-primary-hover`
- `shadow-primary/25`

**Old Palette:**
- `bg-white/95`, `border-slate-200`, `text-slate-900`, `text-slate-600`, `text-slate-400`, `text-slate-500`
- `from-slate-900/70`, `via-slate-900/60`, `to-slate-900/80`
- `bg-red-50`, `border-red-200`, `bg-red-100`, `text-red-600`, `text-red-800`
- `border-slate-300`

**Hard-coded values:** None

---

### app/(auth)/signup/page.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (button gradient)
- `hover:from-water-mid`, `hover:to-water-surface`
- `focus:border-primary`, `focus:ring-primary/20`, `text-primary`, `hover:text-primary-hover`
- `shadow-primary/25`

**Old Palette:**
- Same as login page (slate, red, white)

**Hard-coded values:** None

---

### app/(dashboard)/profile/page.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (avatar fallback, buttons)
- `hover:from-water-mid`, `hover:to-water-surface`
- `text-primary`, `hover:text-primary`, `focus:border-primary`, `focus:ring-primary/20`
- `bg-primary/5`, `shadow-primary/25`, `hover:shadow-primary/30`

**Old Palette:**
- `from-slate-50`, `via-teal-50/30`, `to-emerald-50/20`
- `bg-slate-200`, `bg-slate-50`, `bg-slate-100`, `border-slate-200`, `text-slate-900`, `text-slate-700`, `text-slate-600`, `text-slate-500`, `text-slate-400`
- `bg-emerald-50`, `border-emerald-200`, `bg-emerald-100`, `text-emerald-600`, `text-emerald-800`
- `bg-red-50`, `border-red-200`, `bg-red-100`, `text-red-600`, `text-red-800`
- `ring-white`

**Hard-coded values:**
- `from-[#0A4F4C]/20`, `to-emerald-500/20` (avatar glow - NOT from palette)

---

### app/(dashboard)/competitions/page.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (buttons, FAB)
- `hover:from-water-mid`, `hover:to-water-surface`
- `hover:text-primary`, `text-primary`, `from-primary/80`, `to-primary`, `from-primary-light`, `to-[#0A4F4C]/10`

**Old Palette:**
- `from-slate-50`, `via-blue-50/50`, `to-teal-50/30`
- `bg-white/95`, `bg-white/80`, `border-slate-200`, `text-slate-900`, `text-slate-600`, `text-slate-700`, `text-slate-500`, `text-slate-400`
- `bg-emerald-500/10`, `border-emerald-500/20`, `bg-emerald-500`, `text-emerald-700`
- `bg-slate-500/10`, `border-slate-500/20`, `text-slate-600`
- `bg-amber-500/10`, `border-amber-500/20`, `text-amber-700`
- `ring-white`, `bg-slate-200`

**Hard-coded values:**
- `rgba(212,165,116,0.25)` (hover shadow - reflect-gold color in rgba)

---

### app/(dashboard)/competitions/create/page.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (header icon, submit button)
- `focus:border-primary`, `focus:ring-primary/20`, `text-primary`, `focus:ring-primary`
- `from-primary-light`, `shadow-primary/20`, `hover:shadow-primary/30`, `shadow-primary/25`

**Old Palette:**
- `from-slate-50`, `via-primary-light`, `to-slate-100`
- `bg-white/90`, `bg-white`, `border-slate-200`, `border-slate-100`, `text-slate-900`, `text-slate-700`, `text-slate-600`, `text-slate-500`, `text-slate-400`
- `border-emerald-500`, `bg-emerald-50/50`, `bg-emerald-500/20`, `bg-emerald-500/10`, `text-emerald-600`
- `border-amber-500`, `bg-amber-50/50`, `bg-amber-500/20`, `bg-amber-500/10`, `text-amber-600`
- `bg-red-50`, `border-red-200`, `bg-red-100`, `text-red-600`, `text-red-800`
- `text-red-500` (required asterisks)

**Hard-coded values:**
- `from-[#0A4F4C]/10`, `to-[#0A4F4C]/5` (icon backgrounds - NOT from palette)

---

### app/(dashboard)/competitions/[id]/page.tsx

**Water Reflections Palette:**
- `from-water-deepest`, `via-water-deep`, `to-water-mid` (hero background)
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (buttons, gradients)
- `hover:from-water-mid`, `hover:to-water-surface`, `active:from-water-deepest`, `active:to-water-deep`
- `from-reflect-gold/8`, `via-reflect-gold/3` (hero reflection)
- `from-reflect-gold`, `to-reflect-amber`, `from-reflect-bright/15`, `via-reflect-gold/20`, `to-reflect-amber/15`
- `border-reflect-gold/30`, `text-reflect-amber`, `text-water-deepest`
- `text-primary`, `hover:text-primary`, `hover:text-primary-hover`, `bg-primary-light`, `bg-primary`, `bg-primary-light/50`, `ring-primary`

**Old Palette:**
- `from-slate-50`, `via-blue-50/50`, `to-teal-50/30`
- `bg-white/80`, `bg-white/90`, `border-slate-200`, `bg-slate-50`, `ring-slate-200`, `text-slate-900`, `text-slate-600`, `text-slate-700`, `text-slate-500`, `text-slate-400`
- `bg-emerald-400/20`, `border-emerald-400/30`, `bg-emerald-400`, `text-emerald-50`, `text-emerald-700`
- `bg-slate-400/20`, `border-slate-400/30`, `text-slate-200`, `text-slate-600`
- `bg-amber-400/20`, `border-amber-400/30`, `text-amber-200`, `text-amber-700`
- `bg-amber-100`, `border-amber-200`, `text-amber-700` (draft badge)
- `text-teal-100`, `text-teal-100/90`, `text-teal-50`, `border-white/10`, `border-white/20`
- `bg-white`, `ring-white`
- `from-slate-200/50`, `to-slate-100/30`, `border-slate-300/50`
- `from-amber-100/50`, `to-orange-50/30`, `border-amber-200/50`
- `from-slate-400`, `to-slate-500`, `from-amber-500`, `to-orange-500`

**Hard-coded values:**
- `rgba(212,165,116,0.25)`, `rgba(212,165,116,0.3)` (hover shadows - reflect-gold rgba)

---

### app/(dashboard)/competitions/[id]/invite/page.tsx

**Water Reflections Palette:** None (uses CSS classes like `.btn-primary`, `.card`)

**Old Palette:**
- `bg-teal-700` (header icon)
- `bg-teal-500/10`, `text-teal-700`
- `bg-teal-50`, `border-teal-200`, `bg-teal-100`, `text-teal-800`, `text-teal-700`

**Hard-coded values:** None

---

### app/(dashboard)/competitions/[id]/leaderboard/page.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (avatars, tabs, buttons)
- `from-primary-light`, `shadow-primary/25`, `shadow-primary/20`
- `ring-primary`, `ring-primary/50`, `bg-primary`, `text-primary`
- `bg-primary-light/50`, `border-primary/30`

**Old Palette:**
- `from-slate-50`, `via-primary-light`, `to-slate-100`
- `bg-white/90`, `bg-white/80`, `bg-white/50`, `border-slate-200`, `bg-slate-100`, `text-slate-900`, `text-slate-600`, `text-slate-700`, `text-slate-500`
- `from-amber-50`, `via-yellow-50`, `to-amber-100`, `border-amber-300/60`, `shadow-amber-500`
- `from-amber-400`, `to-yellow-500`, `text-amber-900`
- `ring-amber-400`, `shadow-amber-500/30`
- `from-slate-100`, `to-slate-200`, `border-slate-300`, `ring-slate-400`, `shadow-slate-500/20`, `text-slate-700`
- `from-orange-50`, `to-orange-100`, `border-orange-300/60`, `ring-orange-400`, `shadow-orange-500/20`, `text-orange-900`
- `from-orange-400`, `to-orange-600`
- `from-emerald-500`, `to-[#0A4F4C]`, `shadow-emerald-500/25`
- `bg-amber-100`, `text-amber-600`
- `bg-emerald-100`, `text-emerald-700`, `text-emerald-500`

**Hard-coded values:**
- `to-[#0A4F4C]` (teal color - close to water-deep but not exact)
- `from-[#0A4F4C]/10` (button backgrounds)

---

### app/(dashboard)/competitions/[id]/catches/page.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (fish count buttons, fish number badges)
- `from-primary-light`, `focus:border-primary`, `focus:ring-primary/20`, `text-primary`, `shadow-primary/30`

**Old Palette:**
- `from-slate-50`, `via-primary-light`, `to-slate-100`
- `bg-white/90`, `bg-white`, `border-slate-200`, `border-slate-100`, `border-slate-300`, `text-slate-900`, `text-slate-700`, `text-slate-600`, `text-slate-500`, `text-slate-400`
- `bg-slate-50`, `bg-slate-100`, `hover:bg-slate-200`, `hover:bg-slate-50`
- `from-emerald-50`, `to-teal-50`, `to-primary-light`
- `from-emerald-400`, `to-emerald-600`, `text-emerald-600`, `bg-emerald-50`, `border-emerald-200`
- `bg-emerald-500`, `from-emerald-500`, `to-primary`, `shadow-emerald-500/25`, `shadow-emerald-500/30`
- `bg-red-50`, `border-red-200`, `bg-red-100`, `text-red-600`, `text-red-800`, `bg-red-500/90`, `hover:bg-red-500`
- `from-amber-500/20`, `to-amber-500/5`, `text-amber-600`

**Hard-coded values:**
- `from-[#0D9488]/20`, `to-primary/10` (photo section icon background - #0D9488 is teal-600)

---

### app/(dashboard)/competitions/[id]/captures/page.tsx

**Water Reflections Palette:**
- `from-water-deep`, `via-merged-teal-gold`, `to-water-mid` (avatar fallbacks, filter buttons)
- `from-primary-light`, `to-primary/10`, `text-primary`, `ring-primary`, `border-primary/20`, `bg-primary/10`
- `shadow-primary/25`, `shadow-primary/20`

**Old Palette:**
- `from-slate-50`, `via-primary-light`, `to-slate-100`
- `bg-white/90`, `bg-white/80`, `bg-white/50`, `border-slate-200`, `ring-slate-200`, `text-slate-900`, `text-slate-600`, `text-slate-500`
- `bg-slate-900/80`, `bg-slate-50`, `bg-slate-100`, `border-slate-100`
- `bg-emerald-100`, `text-emerald-600`, `bg-emerald-500`, `from-emerald-500`, `to-primary`, `shadow-emerald-500/25`, `shadow-emerald-500/30`
- `bg-amber-100`, `text-amber-600`, `border-amber-200`, `bg-amber-50`, `text-amber-700`, `text-amber-900`
- `from-amber-400`, `to-orange-500` (record badge)
- `from-slate-900/80`, `via-slate-900/20` (overlay gradient)
- `ring-white`, `bg-white/20`, `bg-white/30`

**Hard-coded values:** None

---

### app/(dashboard)/competitions/[id]/results/page.tsx

**Water Reflections Palette:** None (uses CSS classes)

**Old Palette:**
- `bg-amber-50`, `border-amber-200`, `bg-amber-100`, `text-amber-600`, `text-amber-700`, `text-amber-800`, `ring-amber-400`
- `bg-slate-200`, `ring-slate-300`, `text-slate-600`, `text-slate-700`
- `bg-orange-100`, `ring-orange-300`, `text-orange-700`, `text-orange-800`, `text-orange-600`
- `text-slate-400`, `text-slate-500`, `text-slate-900`
- `bg-emerald-500/10`, `text-emerald-600`
- `bg-teal-500/10`, `text-teal-700`
- `bg-amber-500/10`

**Hard-coded values:** None

---

### app/(dashboard)/competitions/[id]/manage/page.tsx

**Water Reflections Palette:** None (uses CSS classes)

**Old Palette:**
- `text-slate-400`

**Hard-coded values:** None

---

### app/(dashboard)/history/page.tsx

**Water Reflections Palette:** None (uses CSS classes)

**Old Palette:**
- `text-slate-400`

**Hard-coded values:** None

---

### app/invite/[token]/page.tsx

**Water Reflections Palette:** None

**Old Palette:**
- `bg-slate-50`, `text-slate-500`, `text-slate-600`, `text-slate-700`, `text-slate-900`
- `hover:text-slate-700`, `text-slate-400`
- `bg-teal-700`, `text-teal-700`, `hover:text-teal-600`
- `bg-teal-50`, `border-teal-200`
- `border-slate-200`

**Hard-coded values:** None

---

## Summary by Color System

### Water Reflections Palette Usage

| Color | Files Using |
|-------|-------------|
| `water-*` | Header, page.tsx, login, signup, profile, competitions, [id]/page, leaderboard, catches, captures |
| `reflect-*` | [id]/page.tsx (hero, reward card) |
| `merged-*` | Header, login, signup, profile, competitions, [id]/page, leaderboard, catches, captures |
| `primary-*` | All dashboard pages (extensively used) |
| `accent-*` | Not used in scanned files |
| `surface-*` | Not used directly (using slate instead) |
| `text-*` (custom) | Not used directly (using slate instead) |
| `status-*` | Not used in scanned files |
| `medal-*` | Not used in scanned files |

### Old Palette (Tailwind Defaults) Still Used

| Color | Usage |
|-------|-------|
| `slate-*` | **HEAVILY USED** - backgrounds, borders, text colors across ALL files |
| `white` | Backgrounds, text, borders - ALL files |
| `red-*` | Error states, alerts |
| `emerald-*` | Success states, active indicators, "En cours" badges |
| `amber-*` | Warnings, draft badges, gold medals, pending states |
| `orange-*` | Bronze medals, third place indicators |
| `teal-*` | Some icon backgrounds, invite pages |
| `blue-*` | Page background gradients (minimal use) |

### Hard-coded Values Found

| Value | Location | Notes |
|-------|----------|-------|
| `#102a43` | layout.tsx (themeColor) | Dark blue, should use water-deepest? |
| `#0A4F4C` | profile, competitions, leaderboard, catches | Close to water-deep (#1A3B3F) but not exact |
| `#0D9488` | catches/page.tsx | Tailwind teal-600 |
| `rgba(212,165,116,0.25)` | Multiple buttons | reflect-gold with opacity |
| `rgba(212,165,116,0.3)` | [id]/page.tsx | reflect-gold with opacity |

---

## Recommendations

1. **Replace slate-* with custom surface-* and text-* colors** for consistency
2. **Replace teal-* (invite pages) with water-* colors**
3. **Replace hard-coded #0A4F4C with water-deep** (needs slight adjustment)
4. **Replace emerald-* with status-active or a new success-* color**
5. **Replace amber-* with reflect-* or status-pending**
6. **Update themeColor in layout.tsx** to use water-deepest
7. **Consider adding emerald/green success variant** to status or create new "success" semantic color
