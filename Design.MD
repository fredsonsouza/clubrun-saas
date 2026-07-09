# Design System Specification: High-Performance Editorial

## 1. Overview & Creative North Star: "ClubRun"

The creative direction for this design system is **"ClubRun."** It moves beyond the static, boxy layouts of traditional SaaS to capture the momentum of a runner in mid-stride. We are not just building a dashboard; we are building a high-performance engine.

The system breaks the "template" look by utilizing **intentional asymmetry** and **tonal layering**. We replace rigid 1px dividers with "breathable" transitions and high-contrast typography scales. The goal is a premium, editorial feel that balances the raw energy of vibrant orange with the sophisticated calm of an expansive, light-filled workspace.

---

## 2. Color Strategy & Tonal Depth

We utilize a light-mode palette that prioritizes "Atmospheric White." Instead of flat grey backgrounds, we use a sophisticated layering of warm and cool neutrals to guide the eye.

### Primary Palette

- **Primary (`#ac2c00`):** Our core "Blood Orange." Used for high-intensity actions and critical data visualization.
- **Primary Container (`#ff7852`):** A high-energy tint for secondary momentum and large-scale branding moments.
- **Surface (`#f6f6f6`):** The ambient base. It provides a soft, non-reflective ground for the UI to sit upon.

### The "No-Line" Rule

**Standard 1px solid borders are prohibited.** Sectioning must be achieved through:

1.  **Background Shifts:** Placing a `surface-container-lowest` (#ffffff) card against a `surface` (#f6f6f6) background.
2.  **Tonal Transitions:** Using subtle shifts between `surface-container-low` (#f0f1f1) and `surface-container-high` (#e1e3e3).

### Glass & Gradient (The "Sweat & Glass" Aesthetic)

To achieve a custom, high-end feel, use **Glassmorphism** for floating navigation and overlays:

- **Material:** `surface` (#f6f6f6) at 70% opacity with a `20px` backdrop blur.
- **Signature Gradient:** For primary CTAs or Hero progress rings, transition from `primary` (#ac2c00) to `primary_container` (#ff7852) at a 135-degree angle to simulate forward motion.

---

## 3. Typography: The Athletic Editorial

Our type system pairs the industrial, high-performance geometry of **Space Grotesk** with the humanistic, legible clarity of **Inter** and **Lexend**.

- **Display & Headline (Space Grotesk):** These are the "Power" levels. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for race stats and big motivational headlines.
- **Title & Body (Inter):** The "Endurance" levels. `title-lg` and `body-md` provide the narrative. Inter’s neutral character ensures that data remains the hero.
- **Labels (Lexend):** The "Precision" levels. Lexend is used for `label-md` and `label-sm` to ensure that micro-data (split times, heart rate) is instantly readable at small scales.

---

## 4. Elevation & Depth: Tonal Layering

We do not use shadows to create "lift"; we use **stacking**.

- **The Layering Principle:**
  - Base Layer: `surface` (#f6f6f6)
  - Content Sections: `surface-container-low` (#f0f1f1)
  - Interaction Cards: `surface-container-lowest` (#ffffff)
- **Ambient Shadows:** Only used for "floating" elements (Modals/Popovers). Use the `on-surface` color at 4% opacity with a 32px blur and 16px Y-offset. This mimics natural light over a track.
- **The Ghost Border:** If a container requires a boundary (e.g., in high-density data tables), use `outline-variant` (#acadad) at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components

### Buttons & CTAs

- **Primary:** Background `primary` (#ac2c00), text `on-primary` (#ffefec). Roundedness: `md` (0.375rem). Apply the signature gradient on hover to create a "glow" effect.
- **Secondary:** Background `secondary_container` (#e2e2e2), text `on-secondary_container` (#505252). No border.
- **Ghost Action:** Background `none`, text `primary`. Used for tertiary actions like "View All."

### Cards & Activity Feeds

- **Rule:** Forbid divider lines between activity items.
- **Style:** Use `surface-container-lowest` (#ffffff) for the card body. Use vertical white space (from the `xl` spacing scale) to separate content blocks.
- **Interaction:** On hover, a card should shift from `surface-container-lowest` to a subtle `surface-bright` or gain a "Ghost Border."

### Status Badges & Chips

- **High Intensity (Active):** `primary` background with `on-primary` text.
- **Neutral (Paused):** `secondary_container` background with `on-secondary` text.
- **Shape:** Use `full` roundedness (9999px) for a "pill" shape that feels aerodynamic.

### Kinetic Inputs

- **Text Fields:** Use `surface-container-low` (#f0f1f1) for the input bed. On focus, the bottom edge gains a 2px `primary` highlight—never a full box stroke.

---

## 6. Do’s and Don’ts

### Do:

- **Use Asymmetric Padding:** Allow more "air" at the top of a layout than the bottom to create a sense of upward momentum.
- **Bold Overlaps:** Allow typography (like a large `display-sm` race number) to slightly overlap the edge of a card or an image.
- **Tonal Depth:** Use `surface-container-highest` for inactive states to make them feel "recessed" into the UI.

### Don’t:

- **No Heavy Shadows:** Avoid "dirty" shadows. If it looks like a 2010 web element, it’s too heavy.
- **No Grid-Lock:** Don't feel forced to align everything to a rigid 12-column grid. Use "optical alignment" to make sure the "energy" of the page flows toward the primary action.
- **No Hard Dividers:** Never use a solid grey line to separate two pieces of content. Use space or a shift in surface color.
