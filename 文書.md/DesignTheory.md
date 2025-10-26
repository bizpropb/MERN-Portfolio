# Design Theory Reinvented

During my experiments I have realized that many design rules are seemingly outdated.
I am writing my findings down here, yet I must disclaim all liability for correctness or completeness

## Lightmode vs Darkmode (Evolutionary Psychology)

For purposes of survival, our eyes are constantly finding patterns in our field of view. This is important for survival, as it helps us to spot predators, prey, and other threats. The same ancient patterns apply to (web)design.

Imagine yourself in a purely white room, without any textures or patterns. Your brain would inevitably start to panic, trying to see patterns, to the point where you start to hallucinate. The same effect can be replicated with any color in theory.

However, there is an exception to this rule, and that is black. Our brains would not have survived a single night trying frantically to find patterns in pure darkness. Our brain is wired to see dark untextured surfaces as "night" and disengaged the pattern recognition. This same effect causes black cats, black shirts, or black surfaces to appear smaller than they are, since our eyes disengage.

Knowing all of this, we now understand why:
- Microsoft Word has clearly visible page borders (including margins)
- Lightmode websites use stripe patterns

The absence of texture is counteracted by introducing borders, helping the brain separate objects, preventing discomfort. 

## Striped Design

Striped design causes a clear separation of objects, whichs helps our brain form visual chunks.
This not only eases our brain, but it separates our website into datapackages (memory psychology).
Understanding and remembering a clearly defined small datapackage is much easier than try to form the packages yourself during reading.
Comparatively to a power point presentation, or a SWAY, we recognize each stripe as its own slide.
This form of presentation is optimal for homepages, landing pages, marketing, sales and so on.
In a striped design, there is a clear direction of reading, which is from top to bottom, then left to right.

## Card Design

Card design means to use cards instead of stripes. Just like real cards they can be ordered not unlike tetris blocks. 
We are using cards when designing applications since it allows us to make better use of the space, offering the user more information in a compact way.
However, even though the card design is optimal for applications, the continous background surface will always end up an infinite plane.
While this allows us to expand, reduce or modify our app as we please (AGILE DESIGN), it also creates the unpleasant effect of the untextured mono-colored background. 
This is why we use darkmode exclusively for applications, to disengage the pattern recognition for the background and prevent discomfort, while leveraging the same pattern recogntion to enhance focus on our cards.
In a card Design, the clarity for the direction of reading is reduced, in favor of the compact design. (Think of a dashboard app)

## TL;DR
Lightmode requires a Striped Design architecture, and can not be used for non-traditional layouts, without negative sideeffects. Nontraditional layouts allow us more flexibilibility in both function and design, while keeping it compact, but require darkmode.

## Further Advantages of darkmode design
- Saves energy on OLED displays (important on mobile devices)
- Reduces eyestrain (Especially in low-light conditions)
- Helps directing focus (marketing, sales)
- **Research finding:** 80%+ of users prefer dark mode because it "looks cool" and feels modern, with 91-95% reporting preference for dark mode on personal devices.

---

## Color Theory: Brightness and Contrast

### The Brightness Hierarchy

**In Light Mode:**
- Background: Light color or very light grey, NEVER pure white (#FFFFFF)
- Primary text: Dark grey NOT pure black (Tailwind: 900) // prevent jarring hyper-contrast
- Secondary text: a bit lighter (Tailwind: 800)
- Tertiary text: another bit lighter (Tailwind: 700)
- Surface: light grey, but lighter than background (Tailwind: 100)
- Borders: lighter than surface (Tailwind: 300)
- Glow: Slightly lighter than surface (Tailwind: 200)

**In Dark Mode:**
- Background: Dark color or very dark grey, NEVER pure black (#000000)
- Primary text: Off-white NOT pure white (#FFFFFF) (Tailwind: 100) // prevent jarring hyper-contrast
- Secondary text: a bit darker (Tailwind: 200)
- Tertiary text: another bit darker (Tailwind: 300)
- Surface: dark grey, but lighter than background (Tailwind: 900)
- Borders: lighter than surface (Tailwind: 700)
- Glow: Slightly lighter than surface (Tailwind: 800)

Work with shadows to enhance the focus effect when doing card designs.


### Hypercontrast

While hypercontrast is often overlooked as trivial, it is a real issue, because:
- Can cause text to blur or appear to move (especially for dyslexic users)
- Can cause glare and eye strain over extended periods
- Creates halation effect (white text appears to bleed)
- Maximum contrast can be harsh and fatiguing
- Less extreme contrast is more comfortable for extended reading

**Research-backed recommendation:** Use dark greys (#121212, #1E1E1E) and off-whites (#E0E0E0, #FAFAFA) for more comfortable viewing experiences.

---

## Depth, Elevation, and Visual Hierarchy

### Light Mode: Shadows and Depth
In light mode, depth is communicated through **shadows**:
- Darker shadows = higher elevation
- Shadow blur and spread create 3D illusion
- Works naturally because shadows fall on light surfaces
- Material Design's elevation system is built on this

**Shadow hierarchy:**
- Flat surface: No shadow
- Raised card: `box-shadow: 0 2px 4px rgba(0,0,0,0.1)`
- Elevated modal: `box-shadow: 0 8px 16px rgba(0,0,0,0.15)`
- Floating action button: `box-shadow: 0 12px 24px rgba(0,0,0,0.2)`

### Dark Mode: Glows, Borders, and Brightness
In dark mode, shadows don't work—use **light instead**:
- Lighter surfaces = higher elevation (inverted from light mode)
- Borders and glows create separation
- Subtle highlights indicate elevated elements

**Elevation hierarchy in dark mode:**
- Base layer: #121212
- Card/raised: #1E1E1E (lighter than base)
- Modal/elevated: #2C2C2C (even lighter)
- Glows: Use subtle border glow `box-shadow: 0 0 8px rgba(255,255,255,0.1)`

**Critical principle:** With shadows removed from dark mode UI design, lighter layers appear more elevated than darker ones. This is the inverse of light mode.

---

## Borders and Visual Separation

### Light Mode Borders
- Subtle and understated
- Usually 1px solid in light grey (#E0E0E0, #DDDDDD)
- Can be omitted if using shadows for separation
- Should be significantly lighter than content

### Dark Mode Borders
Borders become **more important** in dark mode:
- Must be visible but not harsh
- Use lighter greys (#333333, #404040)
- Often paired with subtle glows
- Critical for defining interactive elements (buttons, inputs)

**Why borders matter more in dark mode:**
Users rely more on contrast and shape recognition in dark environments, so clearly distinguished borders help identify interactive elements at a glance.

---

## WCAG Contrast Requirements

### Minimum Contrast Ratios
**For accessibility compliance:**
- Normal text (under 18pt): 4.5:1 minimum (AA), 7:1 ideal (AAA)
- Large text (18pt+): 3:1 minimum (AA), 4.5:1 ideal (AAA)
- UI components: 3:1 minimum

**Example ratios:**
- Black on white: 21:1 (maximum possible)
- #333333 on white: ~12.6:1 (excellent)
- #666666 on white: ~5.7:1 (good for body text)
- White on #121212: ~18:1 (excellent for dark mode)

**Testing tools:**
- WebAIM Contrast Checker
- Chrome DevTools contrast analyzer
- Figma/Sketch built-in contrast checkers

---

## Typography and Readability

### Optimal Line Length
The ideal line length for readability is **50-75 characters per line** (including spaces):

**Desktop:**
- 60-70 characters per line is ideal
- Approximately 600-800px max width for article content
- Overall container: 1140-1200px max width

**Mobile:**
- 30-50 characters per line
- Narrower screens naturally enforce this

**Why this matters:**
If a line is too long, the reader's eyes have difficulty:
- Focusing on the text
- Gauging where the line starts and ends
- Finding the correct next line in large text blocks

**CSS Implementation:**
```css
.article-content {
  max-width: 70ch; /* 70 characters */
  /* or */
  max-width: 34em; /* font-relative */
  /* or */
  max-width: 680px; /* absolute */
}
```

### The 1200px Container Standard
Why websites max out around 1200px:

1. **Historical context:** Once monitors exceeded 1200px in the early 2010s, site widths stopped expanding
2. **Grid systems:** 1140-1200px works perfectly with 12-column grids
3. **Readability:** Wider content becomes uncomfortable to scan
4. **Visual comfort:** Content feels balanced on standard desktop resolutions
5. **Multi-column layouts:** Allows for sidebars while maintaining readable main content

**Modern approach:**
- Full-width containers for backgrounds
- Max-width content areas for text
- Responsive breakpoints at 1200px, 992px, 768px, 576px

### Paragraph Length
**Optimal paragraph length:** 3-5 sentences or 40-70 words

**Why shorter paragraphs work:**
- Easier to scan
- Less intimidating to readers
- Better for mobile viewing
- Creates natural rhythm and breathing room

**On the web:** Break paragraphs more frequently than in print

### Title/Heading Length

**H1 (Main title):**
- 60 characters maximum (Google truncates at ~60)
- 6-12 words ideal
- Should be concise and descriptive

**H2 (Section headings):**
- 40-60 characters
- 4-8 words
- Scannable and informative

**H3 (Subsection headings):**
- 30-50 characters
- 3-6 words
- More specific and focused

### Button Text Length

**Formula:** `{Verb} + {Noun}` for context

**Examples:**
- ✅ "Start Free Trial" (clear action + object)
- ✅ "Download PDF" (verb + specific noun)
- ✅ "Add to Cart" (action + destination)
- ❌ "Click Here" (vague, no context)
- ❌ "Submit" (unclear what happens)

**Exception:** Common actions can be single words:
- "Done"
- "Close"
- "Cancel"
- "Delete"
- "Save"

**Key principle:** Be explicit about what happens when users click. Clarity trumps brevity.

**Research finding:** "Start My Free Trial" consistently converts better than "Start Free Trial" because possessive language creates ownership.

### Line Height and Spacing

**Body text:**
- Line height: 1.5em (150% of font size)
- Paragraph spacing: 2× font size minimum

**Example:**
```css
body {
  font-size: 16px;
  line-height: 1.5; /* 24px */
  margin-bottom: 32px; /* 2× font size */
}
```

**Why this works:**
- Maintains steady vertical rhythm
- Prevents lines from feeling cramped
- Creates visual breathing room
- Improves comprehension and scan-ability

---

## Primary, Secondary, and Accent Colors

### Color Roles in Design Systems

**Primary color:**
- Brand identity color
- Used for main CTAs, links, active states
- Should have sufficient contrast against background
- Typically used sparingly (5-10% of interface)

**Secondary color:**
- Supports primary color
- Used for less prominent actions
- Often a complementary or analogous color
- Helps create visual hierarchy

**Accent colors:**
- Highlight important information
- Success (green), warning (yellow), error (red), info (blue)
- Should be vibrant but not overwhelming

### Brightness Adjustments Across Modes

**Light Mode Colors:**
- Use darker/saturated versions of brand colors
- Primary: #4F46E5 (indigo-600)
- Success: #059669 (emerald-600)
- Error: #DC2626 (red-600)

**Dark Mode Colors:**
- Use lighter/less saturated versions
- Primary: #818CF8 (indigo-400)
- Success: #34D399 (emerald-400)
- Error: #F87171 (red-400)

**Why adjust brightness:**
- Saturated colors on dark backgrounds feel too vibrant and cause eye strain
- Lighter shades provide better contrast without harshness
- Maintains accessibility while preserving brand identity

---

## Geometric Shapes and Visual Flow

### Why Rounded Corners Work
Modern interfaces favor rounded corners (border-radius):
- Feels friendlier and more approachable
- Easier for eyes to process
- Guides attention along natural curves
- Reduces visual sharpness/aggression

**Common radius values:**
- Subtle: 4px (inputs, cards)
- Moderate: 8px (buttons, modals)
- Prominent: 12-16px (hero elements)
- Pill-shaped: 999px or 50% (badges, tags)

### Card-Based Design
Cards work in both modes because they:
- Create clear content boundaries
- Establish visual hierarchy
- Allow for elevation/depth
- Separate distinct information chunks
- Scale responsively

**In light mode:** Use shadows + subtle borders
**In dark mode:** Use lighter backgrounds + borders/glows

---

## Summary: Design Decision Framework

### Choose Light Mode When:
- Creating marketing/landing pages with clear sections
- Designing print-emulating content (articles, docs)
- Targeting professional/corporate audiences
- Prioritizing daytime use in bright environments
- Building trust-focused interfaces (banking, healthcare)

### Choose Dark Mode When:
- Building infinite-scroll applications
- Creating immersive experiences (media, gaming)
- Designing for extended use (IDEs, dashboards)
- Targeting tech-savvy audiences
- Emphasizing modern, sleek aesthetics

### Design Both When:
- Building general-purpose applications
- Serving diverse user bases
- Wanting to maximize accessibility
- Following modern best practices

**The golden rule:** Design systems should support both modes with careful attention to contrast, hierarchy, and user comfort in each context.

---

## Additional Resources

**Contrast Checkers:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools (Lighthouse)

**Design Systems with Excellent Dark Mode:**
- Material Design 3
- Apple Human Interface Guidelines
- Tailwind CSS default palette

**Testing:**
- Test in actual lighting conditions (bright room vs dark room)
- Check on different screen types (OLED vs LCD)
- Validate with accessibility tools
- Get feedback from users with visual impairments

---

*This document synthesizes research, design theory, and practical observation to guide thoughtful mode implementation in modern web applications.*
