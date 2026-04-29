# Design System Philosophy: The Adaptive Canvas

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Adaptive Canvas."** 

We are moving away from the rigid, boxed-in layouts of traditional educational software. Instead, we treat the interface as a living environment that morphs between two states: **Wonder** (the student experience) and **Wisdom** (the teacher experience). By utilizing intentional asymmetry, overlapping layers, and high-contrast typography, we create an editorial feel that respects the intelligence of the student and the professionalism of the educator. This system rejects "standard" UI defaults in favor of a tactile, premium aesthetic that feels globally conscious and purposefully designed.

---

## 2. Colors & Tonal Depth
This system utilizes a sophisticated Material-based palette to define mood and function without relying on heavy-handed containers.

### The "No-Line" Rule
**Designers are strictly prohibited from using 1px solid borders to section off content.** Physical boundaries must be defined solely through background color shifts. For example, a `surface-container-low` card should sit atop a `surface` background. If more separation is needed, use a transition to `surface-container-high`. This creates a seamless, high-end feel that mimics architectural layering rather than a digital grid.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of fine paper or frosted glass. 
- Use `surface-container-lowest` for the primary background in deep-focus modes.
- Use `surface-container-highest` for floating navigation or high-priority modals.
- Nesting should follow a logical flow: an inner container must always be a higher or lower tier than its parent, never the same.

### The Glass & Gradient Rule
To achieve a "modern AI" signature, use **Glassmorphism** for floating UI elements (like student reward popups or teacher floating action buttons). 
- **Recipe:** Use a semi-transparent `surface` color with a `backdrop-filter: blur(20px)`.
- Use **Signature Gradients** for main CTAs and Hero sections. Transition from `primary` (#005e9f) to `primary_container` (#44a5ff) at a 135-degree angle to give the UI "soul" and depth.

### Signature Textures
For the student experience, integrate subtle geometric patterns inspired by the UN Sustainable Development Goals (SDGs). These should be applied at 3-5% opacity using the `on-surface-variant` color, creating a "watermark" effect that feels intentional and global.

---

## 3. Typography
Our typography creates a clear distinction between "The Narrative" and "The Data."

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Voice." Use large scales (`display-lg` for student milestones) to create a friendly, geometric presence. The generous x-height and open curves of Plus Jakarta Sans provide the "Quicksand-like" friendliness requested while maintaining professional integrity.
*   **Body & Labels (Be Vietnam Pro):** This is our "Functional Engine." Be Vietnam Pro is used for high-readability tasks, particularly in the teacher's data views. Its neutral, global character ensures that complex literacy data remains the hero.
*   **Editorial Contrast:** Don't be afraid of extreme scale. A `display-lg` headline paired with a `body-md` description creates the high-end editorial tension that defines this system.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering.**

*   **The Layering Principle:** Depth is achieved by "stacking." A card is not a box with a shadow; it is a `surface-container-lowest` element resting on a `surface-container-low` plane.
*   **Ambient Shadows:** When an element must float (e.g., a teacher's "Needs Help" alert), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(26, 47, 80, 0.06)`. Note the use of the `on-surface` color (#1a2f50) for the shadow tint—never use pure black.
*   **The Ghost Border:** If a border is functionally required for accessibility, it must be a "Ghost Border." Use `outline_variant` at 15% opacity. This provides a "suggestion" of a boundary without breaking the soft, premium aesthetic.

---

## 5. Components

### Buttons
*   **Student (Action):** Use `xl` (3rem) roundedness and the signature primary gradient. These should feel like tactile "pills" that are satisfying to tap.
*   **Teacher (Utility):** Use `md` (1.5rem) roundedness with a flat `primary` or `surface-container-high` fill. This signals a shift from "play" to "work."

### Chips
*   **Status Chips (Teacher):** Used for student tracking. 
    *   *Fluent:* `tertiary_container` with `on_tertiary_container` text.
    *   *Caution:* `secondary_container` with `on_secondary_container` text.
    *   *Needs Help:* `error_container` with `on_error_container` text.
*   **Selection Chips (Student):** Use `full` roundedness and `surface-container-highest` for unselected states.

### Cards & Lists
*   **Zero-Line Policy:** Forbid the use of divider lines. Separate list items using `1rem` of vertical whitespace or by alternating background tones between `surface-container-low` and `surface-container-lowest`.
*   **Interactive Cards:** Use a subtle scale-up transform (1.02x) on hover instead of a heavy shadow to indicate interactivity.

### AI Feedback Inputs
Text areas should use `surface_container_lowest` with a `ghost border`. When the AI is "thinking," the border should animate with a subtle pulse using the `primary_fixed` color.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. Place a large `display-sm` headline on the left with a `body-lg` paragraph offset to the right to create an editorial rhythm.
*   **Do** leverage white space as a functional tool. If the screen feels "empty," it’s likely working correctly.
*   **Do** use the `lg` and `xl` corner radius for student-facing elements to maximize the "friendly" feel.

### Don't:
*   **Don't** use 100% opaque borders or dividers. They clutter the UI and feel "templated."
*   **Don't** use pure black for text or shadows. Always use the `on-surface` or `on-background` tokens to maintain tonal harmony.
*   **Don't** use "standard" grid alignments for everything. Allow hero images or student "badges" to break the container and overlap onto the background to create depth.
*   **Don't** use vibrant oranges/greens for teacher data unless they represent specific status alerts. Keep the teacher dashboard grounded in `primary` blues and neutrals to reduce cognitive load.