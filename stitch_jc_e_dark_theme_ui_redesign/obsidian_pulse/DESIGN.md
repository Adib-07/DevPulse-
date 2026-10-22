---
name: Obsidian Pulse
colors:
  surface: '#12131a'
  surface-dim: '#12131a'
  surface-bright: '#383941'
  surface-container-lowest: '#0d0e15'
  surface-container-low: '#1a1b22'
  surface-container: '#1e1f26'
  surface-container-high: '#292931'
  surface-container-highest: '#34343c'
  on-surface: '#e3e1ec'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e3e1ec'
  inverse-on-surface: '#2f3038'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ccbeff'
  on-tertiary: '#332664'
  tertiary-container: '#9587cc'
  on-tertiary-container: '#2c1f5c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e7deff'
  tertiary-fixed-dim: '#ccbeff'
  on-tertiary-fixed: '#1e0e4e'
  on-tertiary-fixed-variant: '#4a3d7c'
  background: '#12131a'
  on-background: '#e3e1ec'
  surface-variant: '#34343c'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2.5rem
---

## Brand & Style

The design system embodies an engineering-grade, hyper-refined aesthetic tailored for high-output developer platforms, mission-critical infrastructure observability, and distributed team collaboration. It is built to evoke razor-sharp clarity, calm authority, and frictionless focus during intensive coding and operations cycles.

The visual narrative blends **Precision Minimalism** with **Subtle Glassmorphic Depth**:
- **Atmosphere:** Deep obsidian and graphite canvas layers establish an immersive, zero-fatigue dark workspace.
- **Accents:** Electric lavender and violet serve as luminous primary guides for active contexts, critical paths, and focused controls, counterbalanced by emerald/mint green for health telemetry, execution states, and uptime metrics.
- **Surface Texture:** Whispering border lines (`rgba(255, 255, 255, 0.08)`), micro-frosted paneling, and controlled directional luminescence replace opaque, heavy drop shadows to preserve legibility and information density.

## Colors

The palette is engineered specifically for deep-contrast environments, meeting strict WCAG 2.1 AAA accessibility thresholds for technical displays.

### Canvas & Surfaces
- **Canvas Base:** `#090A0F` — Absolute low-layer background, foundational backdrop for global sidebars and structural framing.
- **Surface Elevated:** `#12131A` — Primary container surface for dashboards, viewports, and high-density panels.
- **Surface Overlay:** `#181A22` — Modal dialogs, floating context menus, active cards, and inspector panels.
- **Surface Highlight:** `#222532` — Micro-level highlights, hover states, and structural division blocks.

### Primary Accents (Violet Spectrum)
- **Primary Base:** `#8B5CF6` — Interactive elements, focused borders, active badges, and directional CTA buttons.
- **Primary Lighter:** `#A78BFA` — Hover states, primary link highlights, and chart gradient crests.
- **Primary Glow:** `#C4B5FD` — High-visibility micro-labels, code tokens, and subtle text emphases.

### Secondary & Semantic Accents (Emerald / Pulse Spectrum)
- **Status Success / Active:** `#10B981` — Service running states, zero-error deployments, PR approvals.
- **Status Mint Glow:** `#34D399` — Dynamic activity pulses, real-time latency peaks, metrics upticks.
- **Status Dark Emerald:** `#059669` — Subdued chips, badge backgrounds, and muted telemetry fills.

### Functional Neutrals & Borders
- **Border Default:** `rgba(255, 255, 255, 0.08)` — Standard architectural bounding box divider.
- **Border Subtle:** `rgba(255, 255, 255, 0.04)` — Secondary column tracks and inner cell fences.
- **Border Strong:** `rgba(255, 255, 255, 0.16)` — Focus rings, active drawers, and modal edges.
- **Text High-Contrast:** `#F8FAFC` — Primary headings, critical parameters, code output.
- **Text Muted:** `#94A3B8` — Body text, metadata, documentation copy.
- **Text Faint:** `#64748B` — Inactive tags, table column headers, helper timestamps.

## Typography

The typographic hierarchy implements an asymmetric dual-typeface pairing:
1. **Primary Structural Type (`Inter`):** Provides extreme visual equilibrium, neutral geometry, and superior legibility across varied device resolutions. Used for headlines, descriptions, tables, and functional interface components.
2. **Technical Accent Type (`JetBrains Mono`):** Applied systematically to all raw data values, API slugs, branch names, commit hashes, latency metrics, and telemetry indicators.

### Line Height & Rhythmic Balance
Letter-spacing scales inversely with type size: tighter optical kerning on large headers (`-0.03em`) creates cohesion, while expanded tracking on monospaced labels (`+0.02em` to `+0.03em`) maximizes glanceability in high-density operations panels.

## Layout & Spacing

The system leverages a strict **8-point mathematical grid** (with a 4-point sub-grid for internal component micro-padding) engineered to maintain spatial balance across complex developer instrumentation dashboards.

### Grid Construction & Reflow
- **Desktop (>= 1280px):** 12-column dynamic fluid layout with `1.5rem` gutters and `2.5rem` canvas margins. Supports fixed-width command rails (64px collapsed, 240px expanded) alongside fluid data tables and split-pane code reviews.
- **Tablet (768px – 1279px):** 8-column fluid layout with `1rem` gutters and `1.5rem` outer margins. Side navigation shifts into an off-canvas overlay or icon-only spine; data tables toggle horizontal scrollers.
- **Mobile (< 768px):** 4-column adaptive layout with `1rem` gutters and `1rem` outer screen margins. Multi-column cards stack vertically; technical metrics display in horizontal snap-scroll carousels.

### Spacing Principles
- Density is prioritized without sacrificing whitespace: internal component gaps use `space-xs` (4px) and `space-sm` (8px).
- Structural panel separations default to `space-lg` (16px) or `space-xl` (24px) to retain distinct cognitive zones.

## Elevation & Depth

Visual hierarchy eschews physical shadows in favor of **ambient luminescent depth**, tonal gradation, and crisp light-boundary thresholds:

### Surface Stacking & Tiers
1. **Tier 0 (Root Canvas):** `#090A0F` — Flat background, non-interactive foundation.
2. **Tier 1 (Panels & Cards):** `#12131A` with a 1px solid border of `rgba(255, 255, 255, 0.08)`.
3. **Tier 2 (Interactive Floating Modules):** `#181A22` with `backdrop-filter: blur(12px)` and `rgba(255, 255, 255, 0.12)` border.
4. **Tier 3 (Modals & Command Palettes):** `#181A22` with `backdrop-filter: blur(24px)`, combined with a 1px outline in `rgba(255, 255, 255, 0.16)`.

### Ambient Glows & Shadows
- **Passive Drop Shadow:** Low-frequency, diffused occlusion: `0 8px 32px -4px rgba(0, 0, 0, 0.5)`.
- **Primary Luminescence:** Focused controls and active states emit a directional, subtle violet radiance: `0 0 20px -3px rgba(139, 92, 246, 0.25)`.
- **Health / Status Pulse:** Success nodes feature an emerald aura: `0 0 16px -2px rgba(16, 185, 129, 0.3)`.

## Shapes

The geometric framework is calibrated to roundedness scale `2` (`0.5rem` or `8px`), projecting modern precision while avoiding clinical sharpness.

- **Base Radius (`0.5rem` / 8px):** Inputs, buttons, segmented controls, table headers, and chips.
- **Container Radius (`1rem` / 16px):** Dashboards cards, terminal panels, deploy logs, and popover dialogs.
- **Structural Radius (`1.5rem` / 24px):** Full-screen overlays, primary slide-over drawers, and hero metric containers.
- **Pill Formats (`9999px`):** Status indicator pulses, interactive tag toggles, and live environment indicator badges.

## Components

### Buttons
- **Primary:** Background in `#8B5CF6`, text `#FFFFFF`, font `Inter` 14px weight 500. Hover transitions to `#A78BFA` with a soft outer glow (`0 0 16px rgba(139, 92, 246, 0.35)`). Active state scales subtly (`transform: scale(0.98)`).
- **Secondary / Outline:** Background `transparent`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F8FAFC`. Hover applies background `rgba(255, 255, 255, 0.04)` and border `rgba(255, 255, 255, 0.16)`.
- **Ghost:** Text `#94A3B8`, background `transparent`. Hover transitions to `#F8FAFC` text with `rgba(255, 255, 255, 0.03)` surface highlight.

### Chips & Telemetry Badges
- **Status Pills:** Compact layout, horizontal padding `space-sm` (8px), vertical `2px`. Monospace font (`JetBrains Mono` 11px).
- **Active / Healthy:** Background `rgba(16, 185, 129, 0.12)`, text `#34D399`, border `1px solid rgba(16, 185, 129, 0.25)`. Accompanied by a 6px circular dot with a continuous 2-second ease pulse animation.
- **Neutral / Version Tag:** Background `rgba(255, 255, 255, 0.04)`, text `#94A3B8`, border `1px solid rgba(255, 255, 255, 0.08)`.

### Input Fields & Search Bars
- **Base State:** Background `#12131A`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F8FAFC`, placeholder `#64748B`. Corner radius `8px`. Padding `10px 14px`.
- **Focus State:** Border color `#8B5CF6`, outline none, box-shadow `0 0 0 1px #8B5CF6, 0 0 12px rgba(139, 92, 246, 0.2)`.
- **Prefix / Suffix Adornments:** Iconography in `#64748B`, switching to `#C4B5FD` on container focus.

### Checkboxes & Toggle Controls
- **Checkboxes:** 18x18px, border `1px solid rgba(255, 255, 255, 0.16)`, radius `4px`, background `#12131A`. Checked state triggers `#8B5CF6` background fill with white stroke icon.
- **Toggles:** Track 36x20px, rounded pill. Off: track `#181A22` with `rgba(255, 255, 255, 0.1)` border. On: track `#8B5CF6`. Thumb: 16px circle `#FFFFFF`.

### Cards & Panels
- **Layout:** Background `#12131A`, border `1px solid rgba(255, 255, 255, 0.08)`, border-radius `16px`, padding `space-xl` (24px).
- **Interactive Variant:** Transition on border-color to `rgba(255, 255, 255, 0.18)` and slight translate upward (`translateY(-1px)`).

### Developer-Specific Components
- **Command Palette (Cmd+K):** Modal overlay with `backdrop-filter: blur(20px)`, surface `#181A22`, border `1px solid rgba(255, 255, 255, 0.16)`. Items display shortcut keycaps rendered in `JetBrains Mono` with muted graphite backgrounds (`#222532`).
- **Log Stream & Terminal Viewers:** Background `#090A0F`, inline dividers `1px solid rgba(255, 255, 255, 0.04)`, font `JetBrains Mono` 12px, syntax highlighting using `#C4B5FD` (keys), `#34D399` (strings), and `#94A3B8` (metadata).