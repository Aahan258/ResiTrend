# ResiTrend — Frontend Master Specification
### Lead Product Architect Handoff Document
Version 1.0 · Baseline: current repo (`Aahan258/ResiTrend`) + reviewed local Sidebar/Header/CSS iteration

This document converts the architecture review into a build-ready specification. It assumes the review's findings as ground truth: no landing page currently exists, no shared UI primitives exist, and design tokens are defined in `index.css` but inconsistently adopted. Every section below states **why it exists, the UX reasoning, the expected user benefit, its visual priority, and its implementation complexity**, so a frontend team can sequence work without re-litigating rationale.

---

## 1. Ideal Application Architecture

**Structure:**

```
src/
  app/                     — shell-level composition only
    AppShell.tsx           — layout frame (Header + Sidebar + content slot + mobile nav)
    Router.tsx             — route table (public + authenticated)
  marketing/               — NEW: landing page and public-only views
    LandingPage.tsx
    sections/              — Hero, Benefits, DashboardPreview, LeaderboardPreview,
                              FacultyAnalyticsPreview, FinalCTA
  dashboard/               — authenticated views (renamed from flat components/)
    portfolio/              HallOfImpact, Leaderboards
    community/               SilentApplause, Endorsements, InnovationHub, Announcements
    admin/                   AdminPanel split into sub-views (Analytics, SeedData, Users)
    settings/                SettingsPanel
  components/
    primitives/             — NEW: Button, Card, Badge, Pill, ProgressBar, Avatar, EmptyState, Skeleton
    layout/                  Header, Sidebar, MobileNav
  context/                  AuthContext (split — see §1c)
  lib/                       firebase.ts, whitelist.ts, compressImage.ts (extracted from App.tsx), tokens.ts
```

**Why it exists:** The current flat `components/` folder mixes layout, dashboard features, and (soon) marketing under one undifferentiated namespace. At 11 files this is tolerable; at 25+ (once a real landing page and admin sub-views exist) it becomes a navigation cost for every new contributor.

**UX reasoning:** This is a codebase-health decision, not a user-facing one — but it directly enables the user-facing fixes below (primitives, previews, IA regrouping) to be built without further entangling marketing and app code.

**Expected user benefit:** Indirect — faster iteration speed translates to fewer inconsistencies shipped (the radius/opacity drift documented in the review is a direct symptom of *not* having this structure).



**Visual priority:** N/A (architecture, not visual).

**Complexity:** Medium — mostly file moves and import path updates; no behavioral change required if sequenced correctly (rename/move before adding new primitives).

**1a. Marketing/app separation**
A real route boundary must exist between the public landing page and the authenticated workspace. Today `App.tsx` renders the full workspace unconditionally — there is no logged-out state to design against. This is the single highest-leverage architectural fix, because every other IA and onboarding recommendation below depends on there being two distinct entry surfaces.

**1b. Component primitive layer**
A `primitives/` folder is the direct fix for the review's core finding: zero shared `Button`/`Card` components, causing `rounded-lg`/`rounded-xl`/`rounded-2xl` to appear ungoverned within single files. Every visual surface in this spec (cards, buttons, badges, empty states) is defined once here and consumed everywhere else.

**1c. AuthContext decomposition**
Split the current single 60KB+ `AuthContext` into `SessionContext` (user/auth state, login/logout) and `ProfileContext` (profile data, XP, reputation). Reduces re-render blast radius as the app scales past 11 components, each of which independently calls `useAuth()` today.

---

## 2. Complete Information Architecture

```
PUBLIC (unauthenticated)
└── Landing Page (single scrollable page, no sub-routes)
    ├── Hero
    ├── Benefits (4 cards)
    ├── Dashboard Preview (static)
    ├── Leaderboard Preview (Institute + National, static)
    ├── Faculty Analytics Preview (static)
    └── Final CTA

AUTHENTICATED (post-login)
└── App Shell (Header + Sidebar + Content + Mobile Nav)
    ├── Portfolio
    │   ├── Hall of Impact        (living CV / timeline)
    │   └── Leaderboards          (live, interactive — cohort standings)
    ├── Community
    │   ├── Silent Applause       (anonymous kudos)
    │   ├── Endorsements          (peer skill reviews)
    │   ├── Innovation Hub        (improvement ideas)
    │   └── Announcements        (rounds & deadlines)
    ├── Admin (role-gated: Founder only)
    │   ├── Analytics
    │   ├── Seed Data
    │   └── User Management
    └── Settings
        └── Link Identity (Scholar, ORCID, bio, photo)
```

**Why it exists:** This is the direct implementation of the review's IA recommendation — collapsing 6 flat, equally-weighted sidebar items into two labeled groups (Portfolio / Community), matching the grouping already prototyped in the reviewed local Sidebar edit, and formalizing Admin/Settings as a separate governance tier rather than two more flat footer items.

**UX reasoning:** Flat lists above ~5 items force the user to scan every label to find what they want (no chunking cue). Two-level grouping lets users first decide "am I looking at my own record, or the community," cutting the decision from a 6-way to a 2-way choice before a 2–4-way one.

**Expected user benefit:** Faster wayfinding, lower cognitive load on first use — this matters especially for a resident opening the app between cases, not during a dedicated sit-down session.

**Visual priority:** High — this is the primary navigational skeleton; it should be legible before any other visual polish.

**Complexity:** Low (already prototyped) for the Sidebar grouping; Medium for the Admin sub-view split (requires breaking apart the existing 460-line `AdminPanel.tsx`).

---

## 3. Every Page, Defined

| Page | Auth state | Purpose | Primary user action |
|---|---|---|---|
| Landing Page | Public | Convert visitor → sign-in | Click primary CTA (Sign in with Google) |
| Hall of Impact | Authenticated | View/build living CV | Add achievement, view timeline |
| Leaderboards | Authenticated | See cohort standing | Filter by metric/cohort |
| Silent Applause | Authenticated | Give/receive anonymous kudos | Send kudos to a peer |
| Endorsements | Authenticated | Peer skill validation | Request/give endorsement |
| Innovation Hub | Authenticated | Submit/vote improvement ideas | Submit idea, upvote |
| Announcements | Authenticated | Read rounds/deadline notices | Dismiss/acknowledge |
| Admin — Analytics | Authenticated, Founder-only | Program-level metrics | View charts |
| Admin — Seed Data | Authenticated, Founder-only | Manage demo/seed records | Trigger seed/reset |
| Admin — User Management | Authenticated, Founder-only | Manage resident accounts | Promote/whitelist user |
| Settings | Authenticated | Manage identity links | Save Scholar/ORCID/bio |

**Why it exists:** A one-line purpose and primary action per page prevents scope creep within a page (the review flagged the Admin panel specifically for trying to do too much in one screen).

**UX reasoning:** Each page should resolve to *one* primary action a user takes before leaving — multiple competing primary actions on one screen is what caused Admin's 13-`useState` sprawl.

**Expected user benefit:** Every screen has a clear "what do I do here" answer within 2 seconds of arrival.

**Visual priority:** High per-page — the primary action should be the single most visually prominent interactive element on each screen.

**Complexity:** Low to define; Medium to retrofit onto Admin (requires the split in §1).

---

## 4. Every Navigation State

**Sidebar item states:** Default, Hover, Active (current tab), Active+Hover, Disabled (role-gated, e.g., Admin hidden entirely rather than shown-disabled for non-founders — do not show what a user cannot access).

**Header states:** Logged-out (Sign in with Google button only, sandbox switcher hidden), Logged-in-Resident (avatar + name + year), Logged-in-Founder (avatar + name + Founder badge + Admin sidebar item visible), DB-status (Live / Cached, independent of auth state).

**Mobile bottom nav:** Same active/default states as Sidebar, but currently only 5 of 6 items are represented (Announcements missing — flagged in review as a parity gap to close, not a deliberate omission).

**Why it exists:** Undocumented states are how the mobile/desktop parity gap happened in the first place — Announcements silently dropped from mobile nav with no spec to catch it.

**UX reasoning:** A resident may check ResiTrend primarily on their phone between cases; navigation parity between desktop and mobile is not optional polish, it's functional equivalence.

**Expected user benefit:** No user-facing feature is desktop-only by accident.

**Visual priority:** Medium (correctness over polish here).

**Complexity:** Low — mobile nav array just needs the missing item added once primitives exist.

---

## 5. Every Reusable Component (Primitive Layer)

| Component | Variants | Why it exists |
|---|---|---|
| `Button` | Primary, Secondary, Ghost, Danger, Icon-only | Replaces the current per-file hand-rolled buttons (Sign-in button, tab buttons, banner action buttons, sandbox switcher buttons all currently styled independently) |
| `Card` | Standard, Elevated (glass-panel), Interactive (hoverable/clickable) | Fixes the `rounded-lg/xl/2xl` drift documented across `AdminPanel`, `InnovationHub`, `HallOfImpact` |
| `Badge` / `Pill` | Status (Live/Cached), Role (Founder), Metric (XP, reputation level) | Currently each status indicator (emerald DB dot, Founder shield tag, reputation label) is styled ad hoc |
| `ProgressBar` | Linear (XP bar), Circular (profile completion ring) | Circular version already exists (`CircularProgressRing`); linear version needs the same token discipline applied |
| `Avatar` | With photo, Initials fallback, Sized (sm/md/lg) | Currently inlined in Header only; needed wherever a user is represented (leaderboards, endorsements, kudos) |
| `EmptyState` | Icon + message + optional action | Does not currently exist anywhere — see §17 |
| `Skeleton` | Card skeleton, list-row skeleton, text-line skeleton | Does not currently exist anywhere — see §16 |
| `SectionHeader` | Label + optional action link | Formalizes the pattern already used informally for "Portfolio"/"Community" group labels |

**UX reasoning:** A primitive layer is what lets a hackathon judge (or a new resident) form one visual grammar for "this is clickable," "this is a status," "this is a container" — instead of relearning it per screen.

**Expected user benefit:** Faster recognition of interactive vs. decorative elements; consistent affordances.

**Visual priority:** Critical — this is the foundation every other visual rule in this document depends on.

**Complexity:** Medium-High — touches every existing file, but is mechanical once each primitive's API is agreed.

---

## 6. Design System Definition

The system is **dark-surface, glass-panel, high-restraint** — few colors, generous negative space, motion used sparingly as confirmation rather than decoration. This is already the direction of the existing `index.css` tokens (`.glass-panel`, `.glass-card`, `--shadow-panel`); the system formalizes and enforces what's already been designed once, rather than introducing a new aesthetic.

**Why it exists:** The tokens already exist and are good — the problem the review found is *adoption*, not design. Formalizing them as "the system" (not "some CSS variables in a file") gives the team permission to treat deviation as a bug, not a style choice.

**UX reasoning:** Consistency reduces the cognitive tax of context-switching between screens; a resident moving from Leaderboards to Settings should not have to re-parse a new visual dialect.

**Expected user benefit:** The app reads as one product, not eleven independently-designed screens.

**Visual priority:** Critical.

**Complexity:** Low to define (mostly already exists); Medium to enforce via primitives.

---

## 7. Typography

| Role | Font | Use |
|---|---|---|
| Display / headings | Space Grotesk | Page titles, section headers, numeric hero stats (XP, scores) — already introduced in the reviewed local CSS, should become the system standard, not a one-off |
| Body / UI text | Inter | All body copy, labels, buttons, descriptions |
| Numeric / data / mono | JetBrains Mono | Timestamps, IDs, XP counters, status pills, version tag |

**Scale:** 4 sizes for body/UI (10px micro-label, 12px secondary, 13–14px body, 15–16px prominent), 3 sizes for display (18px card title, 22px section title, 28px+ hero/landing headline only).

**Why it exists:** The repo currently ships only Inter + JetBrains Mono; the reviewed local edit added Space Grotesk specifically to differentiate headings from body copy (`font-display` class with tighter letter-spacing). This spec makes that a rule, not an experiment.

**UX reasoning:** A dedicated display face at tight tracking creates a visible hierarchy cue distinct from font-weight alone, which is especially useful at the small sizes this UI favors (most body text is 10–13px).

**Expected user benefit:** Faster scanning — headings are immediately distinguishable from data/labels without relying purely on size or color.

**Visual priority:** High.

**Complexity:** Low — font already loaded via the reviewed CSS; just needs consistent class application.

---

## 8. Spacing Scale

Base unit: **4px**. Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64.

- Micro (4–8px): icon-to-label gaps, badge padding
- Component (12–16px): card internal padding, button padding
- Layout (20–32px): gaps between cards, section padding
- Macro (48–64px): landing page section breaks only

**Why it exists:** The review noted the dashboard home screen has "everything flush against the same column, hierarchy relies entirely on component boundaries" — i.e., no deliberate macro spacing exists to separate sections. A named scale is what prevents that.

**UX reasoning:** Consistent, deliberate whitespace is what "progressive disclosure" and "one primary idea per screen" (both explicitly requested) actually look like in practice — it's spacing, not just content reduction, that creates calm.

**Expected user benefit:** Reduced visual fatigue; clearer grouping of related content without needing borders around everything.

**Visual priority:** High.

**Complexity:** Low — a scale is easy to define; the work is auditing existing arbitrary values (`p-3.5`, `gap-2.5`, `mt-3.5` all appear in current code, off-scale) against it.

---

## 9. Card Hierarchy

1. **Elevated / Panel card** — glass-panel treatment, used once per screen maximum for the primary content container (e.g., the completion banner, a leaderboard table wrapper).
2. **Standard card** — glass-card treatment, used for repeated content units (achievement entries, kudos entries, announcement items).
3. **Interactive card** — standard card + hover lift + pointer cursor, used only when the whole card is clickable (not just a button inside it).
4. **Inline/nested card** — flattest treatment (border only, no shadow/blur), used for content *inside* another card (e.g., the XP row inside the profile card, per the reviewed Sidebar consolidation).

**Why it exists:** Today, radius and shadow are assigned per-file with no rule for "how important is this container relative to its neighbor" — the review's central finding. This hierarchy gives every new card a lookup table instead of a fresh decision.

**UX reasoning:** Visual weight should map to information importance. Nesting a bordered box inside another bordered box (the pre-edit Sidebar profile card) tells the user two things are equally separate when they're actually one unit — exactly what the reviewed consolidation fixed.

**Expected user benefit:** Faster parsing of "what belongs together" vs. "what's a separate module."

**Visual priority:** Critical.

**Complexity:** Low to define, Medium to retrofit across existing screens.

---

## 10. Button Hierarchy

1. **Primary** — solid white fill, dark text (matches existing "Sign in with Google" / header CTA treatment). One per screen maximum.
2. **Secondary** — bordered, transparent/glass background, white text. For supporting actions (e.g., "Configure Links" in the completion banner).
3. **Ghost / Text** — no border, colored text only, used for low-emphasis actions (e.g., "Dismiss" on the auth error banner, already styled this way).
4. **Danger** — reserved for destructive actions (currently none exist in-app, but Admin's future user-management actions will need this — defining it now avoids an ad hoc red button later).
5. **Icon-only** — square/circular, used for logout, share, and similar utility actions.

**Why it exists:** The review found button styling duplicated per-component (sandbox switcher pills, tab buttons, banner actions, sign-in button all independently coded). A hierarchy with a hard "one primary per screen" rule prevents the multi-emerald-button ambiguity flagged in the review (emerald used for CTAs, status, and success states interchangeably).

**UX reasoning:** If everything is emphasized, nothing is. Restricting Primary to one instance per screen forces a design decision about what actually matters there.

**Expected user benefit:** A judge or new user can always identify "the one thing to click" per screen within seconds.

**Visual priority:** Critical.

**Complexity:** Low to define; Medium to audit/retrofit (every current button needs reclassifying into one of these five).

---

## 11. Iconography

**Library:** Lucide (already in use — no change needed, just governance).

**Rules:**
- One icon weight/style throughout (current usage is consistent — preserve this).
- Icon sizing tied to text scale it accompanies: 10px text → 10–12px icon; 13px text → 14–16px icon. (Current code has some drift — e.g., `h-2.5 w-2.5` vs `h-4.5 w-4.5` for visually similar contexts.)
- Icons are never the sole means of conveying status without an accompanying label or tooltip (accessibility requirement, see §15).
- Reserve color-filled icons (e.g., amber Zap, emerald Shield) for metrics/status only — never for pure navigation icons, which stay monochrome white/opacity-scaled so status icons retain their signal value.

**Why it exists:** Lucide is already the right choice and well-used; the fix needed is sizing discipline, not a library change.

**UX reasoning:** If navigation icons borrow the same accent colors as status icons, the status signal (e.g., amber = XP-related, emerald = live/positive) gets diluted.

**Expected user benefit:** Color continues to mean something specific instead of becoming decorative noise.

**Visual priority:** Medium.

**Complexity:** Low.

---

## 12. Color Tokens

Building directly on the existing `index.css` theme block:

| Token | Value | Use |
|---|---|---|
| `--color-zinc-950` | `#09090b` | App background |
| `--color-zinc-900` | `rgba(20,20,23,0.72)` | Glass panel base |
| `--color-zinc-850` | `rgba(255,255,255,0.035)` | Standard card background |
| `--color-zinc-800` | `rgba(255,255,255,0.07)` | Active/selected surface |
| `--color-zinc-750` | `rgba(255,255,255,0.10)` | Active surface border |
| `--color-zinc-700` | `rgba(255,255,255,0.15)` | Hover border |
| `--color-emerald-500` | `#10b981` | **Reserved**: live status, success, positive metrics only |
| Amber (existing usage) | — | XP / gamification accents only |
| Red (existing usage) | — | Errors/warnings only |
| Cyan (existing usage) | — | Reserved for one specific secondary action (e.g., Share) — do not expand without a rule |

**Why it exists:** The palette itself is not the problem (it's restrained and appropriate for the "quiet SaaS" direction requested) — the problem is *unscoped reuse* of emerald across CTA, status, and success contexts. This table assigns each accent color exactly one job.

**UX reasoning:** Color-as-signal only works if the signal is exclusive. Reassigning emerald to "success/live only" and moving primary CTAs to the neutral white/dark treatment (as the Header's "Sign in with Google" already does) removes the ambiguity flagged in the review.

**Expected user benefit:** A user can learn "emerald = good/live" once and trust it everywhere.

**Visual priority:** Critical.

**Complexity:** Low — no new colors needed, just scoped usage rules and an audit of current emerald buttons that should become neutral Primary buttons instead.

---

## 13. Animation Principles

1. **Motion confirms, it doesn't decorate.** Use for: tab switches, banner entrance (existing stagger pattern in `App.tsx` is good — keep it), progress bar fills, toast/success confirmations.
2. **Duration:** 150–200ms for micro-interactions (hover/lift, already defined as the `.lift` utility at 180ms), 300–350ms for entrance/reveal (matches existing `fadeIn` keyframe).
3. **Easing:** One curve system-wide — the existing `cubic-bezier(0.16, 1, 0.3, 1)` ("ease-out-expo"-adjacent) is already used consistently in `.lift`, `.glass-item`, and `fadeIn` — formalize it as the only easing curve permitted.
4. **Respect reduced motion.** The reviewed local CSS already includes a `prefers-reduced-motion` block disabling `.lift`/`.glass-item`/`fadeIn` — this must ship to the repo, not stay local-only.
5. **No motion on data that updates automatically/frequently** (e.g., live DB status dot pulse is fine as an ambient indicator; do not animate every re-render of frequently-changing leaderboard numbers, which reads as jittery rather than alive).

**Why it exists:** The codebase already has good animation instincts (staggered banner reveal, spring-based entrance, a defined easing curve) — the fix is consistency and accessibility compliance, not redesign.

**UX reasoning:** Motion that always means "something changed that you should notice" retains its communicative value; motion used decoratively everywhere trains users to ignore it.

**Expected user benefit:** Meaningful state changes (task completed, new item added) are noticeable without every screen feeling busy.

**Visual priority:** Medium.

**Complexity:** Low — mostly ensuring the local reduced-motion fix ships, plus auditing for unnecessary motion in Admin/data-heavy screens.

---

## 14. Responsive Behavior

- **Desktop (≥1024px):** Sidebar visible, full header (brand + sandbox switcher + status + user), 3-column grid header layout.
- **Tablet (768–1023px):** Sidebar hidden (already the current breakpoint behavior — `hidden md:flex`), header collapses sandbox switcher (already `hidden lg:flex`), mobile bottom nav takes over primary navigation.
- **Mobile (<768px):** Bottom nav only, header shows brand + status + user avatar (subtitle "Resident Performance Platform" already hidden below `sm:`), full-width single-column content.
- **Content max-width:** Preserve existing `max-w-6xl` centered column for all dashboard content — do not go full-bleed, as line-length control matters for the dense data this app displays (leaderboards, tables, timelines).

**Why it exists:** The existing breakpoint strategy is already reasonable (mobile-first bottom nav, progressive header simplification) — this section formalizes it as a rule so future components don't invent new breakpoints ad hoc.

**UX reasoning:** A resident's primary device for quick checks is likely mobile (between cases); the existing bottom-nav-first approach is correct and should be preserved, not reinvented, while parity gaps (§4) get closed.

**Expected user benefit:** Predictable, consistent behavior across devices without per-component surprises.

**Visual priority:** High.

**Complexity:** Low — largely already correct; enforcement, not redesign.

---

## 15. Accessibility Rules

1. **Focus visibility:** The reviewed local CSS already adds a `:focus-visible` outline rule — this must ship system-wide, not stay local-only.
2. **Color is never the sole signal:** Status pills (Live/Cached, Founder badge) must always pair color with a text label or icon+label — current implementation already does this correctly; preserve it as a hard rule for new components.
3. **Touch targets:** Minimum 44×44px tappable area on mobile, even where visual icon/button is smaller (current icon buttons like the logout button are close to this threshold and should be explicitly verified, not assumed).
4. **Reduced motion:** As defined in §13 — ship the existing local fix.
5. **Contrast:** All text-on-glass combinations must meet WCAG AA (4.5:1 for body text, 3:1 for large text/headings) — the very low-opacity white text used for secondary labels (e.g., `text-white/35`, `text-white/25`) should be audited against the actual rendered background, since opacity-based color easily drops below AA on light-glass surfaces.
6. **Semantic structure:** Sidebar/nav buttons should carry `aria-current` for the active tab state (not currently verifiable from styling alone) — a screen reader user needs a state signal beyond visual highlight.

**Why it exists:** Several of these (focus rings, reduced motion) are already solved in your local iteration but not yet in production — this section is the checklist that ensures they actually ship, plus catches gaps (contrast on low-opacity text, `aria-current`) that neither version currently addresses.

**UX reasoning:** Accessibility failures compound with the existing low-opacity, small-type-heavy design language — a system this reliant on subtle contrast needs explicit contrast verification, not just visual judgment.

**Expected user benefit:** Usable by keyboard-only and screen-reader users; legally and ethically necessary for institutional deployment.

**Visual priority:** Critical (non-negotiable, not a "nice to have").

**Complexity:** Low-Medium — mostly auditing existing low-opacity text values and adding `aria-current`/`aria-label` attributes.

---

## 16. Loading States

No skeleton/loading component currently exists anywhere in the codebase. Required:

- **Card skeleton:** Pulsing placeholder matching the Standard Card dimensions, used while Hall of Impact, Leaderboards, or Endorsements data loads from Firebase.
- **List-row skeleton:** For Announcements, Silent Applause feed, Innovation Hub — 3–5 placeholder rows.
- **Inline text skeleton:** For profile card fields (reputation level, XP) while `AuthContext`/profile resolves.
- **Full-page skeleton:** Only for initial app load (before `AuthContext` resolves at all) — matches the eventual Header+Sidebar+content skeleton shape so there's no layout shift on real content arrival.

**Why it exists:** This is a genuine gap — nothing in the current code differentiates "loading" from "empty" from "error," which the review didn't call out explicitly but is a direct consequence of the same "every screen improvised independently" pattern.

**UX reasoning:** Skeletons that match final content shape prevent layout shift and give users a sense of *what kind* of content is arriving, reducing perceived wait time versus a generic spinner.

**Expected user benefit:** The app feels responsive even on a slow connection or cold Firebase read, rather than appearing broken or blank.

**Visual priority:** High.

**Complexity:** Medium — requires a `Skeleton` primitive (§5) plus per-screen integration.

---

## 17. Empty States

No empty-state component currently exists. Required for:

- **Hall of Impact** with zero entries: icon + "Your portfolio is empty — log your first case to start building your timeline" + primary action to add an entry.
- **Silent Applause / Endorsements** with zero received: icon + reassuring copy ("No kudos yet — they'll show up here as your peers recognize your work") — must not read as a failure state, since this is a normal early-tenure condition for a junior resident.
- **Innovation Hub** with zero submitted ideas: icon + CTA to submit the first idea.
- **Leaderboards** with insufficient cohort data: explicit "not enough data yet" message rather than a blank/broken-looking table.
- **Announcements** with none active: simple "You're all caught up" state — positive framing, not an error look.

**Why it exists:** This is a real gap uncovered by close reading, not present in the original review — a junior resident (Year 1, zero XP) will hit nearly every empty state on day one, and the app currently has no defined behavior for this.

**UX reasoning:** Empty states are an onboarding moment in disguise — the copy and CTA shown here directly shapes whether a first-time user understands what to do next or bounces confused by a blank panel.

**Expected user benefit:** New residents (the most vulnerable users to churn) get a clear next action instead of an ambiguous blank screen.

**Visual priority:** High.

**Complexity:** Low-Medium — requires the `EmptyState` primitive (§5) plus per-screen copy, no new logic.

---

## 18. Onboarding Flow

Given there is currently no real logged-out state or route boundary (§1a), onboarding must be newly designed:

1. **Landing → Sign in with Google** (existing button, keep).
2. **First-login welcome:** A one-time modal or banner (distinct from the returning-user completion banner) — "Welcome to ResiTrend. Let's set up your profile" — with 2–3 lightweight steps (add photo, confirm year/reputation level, optionally link Scholar/ORCID). Skippable at every step.
3. **Empty-state-driven discovery** (see §17) takes over after initial setup — rather than a forced product tour, each section teaches itself via its empty state the first time a user visits it.
4. **Progressive disclosure of Admin:** Founder-only nav item should simply not render for non-founders (already correct per §4) — no onboarding needed for a role most users will never have.

**Why it exists:** "Progressive disclosure" and "discovered progressively after authentication" were explicit requirements. Currently there is no mechanism for this at all — every returning and first-time user sees an identical, undifferentiated dashboard.

**UX reasoning:** A forced multi-step tour has high drop-off and delays time-to-value; a lightweight, skippable setup step followed by empty-state teaching respects a busy resident's time while still orienting them.

**Expected user benefit:** New residents understand what to do first without a heavyweight tutorial blocking their path to actual use.

**Visual priority:** Medium (should feel light-touch, not a blocking wizard).

**Complexity:** Medium — requires first-login detection logic (likely a profile flag) plus the modal/banner component.

---

## 19. Landing Page — Full Definition

*(This does not exist in the current repo — full net-new specification, per Phase 1 requirements.)*

**Structure (single scroll, no sub-routes):**

1. **Hero** — one headline, one subheadline, one primary CTA ("Sign in with Google"), one secondary CTA (e.g., "See how it works" — anchor-scrolls to Benefits, does not navigate away), one product screenshot (a real, static export of the authenticated dashboard — not a mockup illustration, to build credibility with a hackathon committee evaluating a real tool). Nothing else above the fold.
2. **Benefits — exactly 4 cards:** Track Surgery / Build Your Academic Portfolio / Compete with Your Institute / AI-powered Logging. Equal visual weight, one icon + one line each — no feature-by-feature deep dives here (that's what the app itself is for).
3. **Dashboard Preview** — one polished static image/mockup. Explicitly no live widgets, no editable controls, no forms, no AI chat, per the review's constraint that the marketing surface must not attempt to *be* the product.
4. **Leaderboard Preview** — two static previews (Institute, National) side by side or stacked on mobile — visual proof of the competitive/gamified mechanic without requiring login to explore it live.
5. **Faculty Analytics Preview** — one static, non-interactive preview aimed at the institutional-adoption audience (program directors evaluating the tool), distinct from the resident-facing benefit cards above it.
6. **Final CTA** — one closing section, single CTA repeated, no footer clutter (no sitemap, no social links grid — a hackathon/institutional pilot product does not need enterprise-footer scaffolding yet).

**Why it exists:** This is the single largest gap between the current repo and a "world-class SaaS" first impression — there is currently nothing for an unauthenticated visitor to see at all.

**UX reasoning:** Each section should communicate exactly one idea (explicit requirement) — this structure enforces that by giving each section a single, named job (convert, explain value, prove it's real, prove it's competitive, prove it's credible to institutions, close).

**Expected user benefit:** A judge, program director, or prospective resident forms a confident first impression in under 30 seconds, without needing to log in to evaluate whether the tool is worth their time.

**Visual priority:** Critical — this is a net-new, highest-priority deliverable.

**Complexity:** High — genuinely new page, new copy, new static preview assets (screenshots/mockups of Dashboard, Leaderboards, Analytics), though it can be built entirely from primitives once §5 exists.

---

## 20. Authenticated Dashboard — Full Definition

**Layout (unchanged in skeleton, refined in content):** Header (brand, sandbox switcher — demo-only, should be dev/staging-gated in a real institutional deployment, DB status, user) + Sidebar (grouped Portfolio/Community nav, Admin/Settings footer) + Content canvas (max-width column) + Mobile bottom nav.

**Home/default view on login:**
1. **Completion banner** (existing — circular progress ring, count-up animation, three actions: Upload Photo, Edit Bio, Share Profile) — keep, it's well-built per the review.
2. **Primary content = whichever tab is active**, defaulting to Hall of Impact for a returning user, or the onboarding welcome (§18) for a first-time user.
3. **Clear vertical separation** between the banner and the tab content below it, using the Layout spacing tier (§8, 24–32px) — directly fixing the review's finding that these currently read as one undifferentiated block.

**Per-section content rules:**
- **Hall of Impact / Leaderboards (Portfolio group):** Data-dense, table/timeline-heavy — use Standard cards, minimal decoration, prioritize scanability.
- **Silent Applause / Endorsements / Innovation Hub / Announcements (Community group):** Feed-like, social — Interactive cards where a whole item is clickable, more generous spacing between items than data tables.
- **Admin (Founder-only):** Split into named sub-tabs (§1, §4) rather than one long scroll — each sub-tab gets its own primary action.
- **Settings:** Simple, form-like, single-column — this screen should be the *least* visually elaborate in the app, since its job is data entry, not discovery.

**Why it exists:** This section ties together every prior rule (cards, spacing, color, empty/loading states) into the one screen every authenticated user sees most often.

**UX reasoning:** The dashboard is the "home base" — its job is orientation (where am I, what's new, what should I do next), not comprehensive display of every feature at once, matching the "reduce cognitive load, one primary idea per screen" directive.

**Expected user benefit:** A resident opening the app mid-shift gets oriented and to their next action in seconds, without the current undifferentiated wall of content.

**Visual priority:** Critical — highest-traffic screen in the product.

**Complexity:** Medium — mostly spacing/hierarchy fixes to existing, functioning components rather than new build (unlike the landing page, which is net-new).

---

## Sequencing Note

Given dependencies, the realistic build order is: **primitives (§5) → design tokens/color/spacing enforcement (§6–9, 12) → dashboard retrofit (§20) → landing page (§19, entirely new) → onboarding/empty/loading states (§16–18, net new) → accessibility audit pass (§15) last, across everything built.** Ship the already-completed Sidebar/Header/CSS local edits immediately — they cost nothing further and fix real, documented issues today.
