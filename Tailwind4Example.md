```css
/* ========================================
   TAILWIND CSS V4 COMPLETE SHOWCASE
   ========================================
   This file demonstrates ALL new Tailwind v4 features,
   especially the @directives and CSS-first configuration
*/

/* ========================================
   1. CORE IMPORT - New v4 syntax
   ========================================*/
   @import "tailwindcss";

   /* Optional: Import specific layers manually */
   /* @import "tailwindcss/preflight" layer(base); */
   /* @import "tailwindcss/utilities" layer(utilities); */
   
   /* ========================================
      2. THEME CONFIGURATION - @theme directive
      ========================================
      Define your design tokens using CSS variables
   */
   @theme {
     /* Colors - Custom color palette */
     --color-primary: oklch(0.7 0.15 220);
     --color-secondary: oklch(0.6 0.2 280);
     --color-accent: oklch(0.8 0.25 120);
     --color-neutral: oklch(0.5 0.02 240);
     
     /* Brand colors with full scale */
     --color-brand-50: #fef7ff;
     --color-brand-100: #fdeeff;
     --color-brand-200: #fbddff;
     --color-brand-300: #f7bbff;
     --color-brand-400: #f088ff;
     --color-brand-500: #e654ff;
     --color-brand-600: #d12bff;
     --color-brand-700: #b813dd;
     --color-brand-800: #9313b5;
     --color-brand-900: #7a1695;
     --color-brand-950: #510466;
     
     /* Override default colors namespace */
     --color-emerald-400: #10b981;
     --color-emerald-500: #059669;
     
     /* Typography */
     --font-display: "Inter Display", ui-sans-serif, system-ui;
     --font-mono: "Fira Code", ui-monospace, monospace;
     --font-handwriting: "Dancing Script", cursive;
     
     /* Font sizes with line heights */
     --text-xs: 0.75rem;
     --text-xs--line-height: 1rem;
     --text-2xs: 0.625rem;
     --text-2xs--line-height: 0.75rem;
     --text-hero: clamp(3rem, 8vw, 8rem);
     --text-hero--line-height: 0.9;
     
     /* Font weights */
     --font-weight-hairline: 100;
     --font-weight-ultra-light: 200;
     --font-weight-extra-bold: 800;
     
     /* Spacing scale */
     --spacing-xs: 0.25rem;
     --spacing-2xs: 0.125rem;
     --spacing-18: 4.5rem;
     --spacing-72: 18rem;
     --spacing-96: 24rem;
     
     /* Border radius */
     --radius-4xl: 2rem;
     --radius-5xl: 2.5rem;
     --radius-circle: 9999px;
     
     /* Shadows */
     --shadow-glow: 0 0 20px oklch(0.7 0.15 220 / 0.5);
     --shadow-brutal: 8px 8px 0px oklch(0.2 0.02 240);
     --shadow-inner-lg: inset 0 4px 8px 0 oklch(0.2 0.02 240 / 0.1);
     
     /* Breakpoints - Custom responsive breakpoints */
     --breakpoint-xs: 480px;
     --breakpoint-3xl: 1920px;
     --breakpoint-4xl: 2560px;
     
     /* Animation durations */
     --duration-150: 150ms;
     --duration-2000: 2000ms;
     --duration-5000: 5000ms;
     
     /* Z-index scale */
     --z-0: 0;
     --z-dropdown: 1000;
     --z-modal: 2000;
     --z-toast: 3000;
     --z-tooltip: 4000;
   }
   
   /* ========================================
      3. INLINE THEME - Multi-theme support
      ========================================
      Use @theme inline for dynamic theming
   */
   @theme inline {
     --color-surface: light-dark(#ffffff, #0f0f0f);
     --color-surface-alt: light-dark(#f8fafc, #1e293b);
     --color-text: light-dark(#0f172a, #f1f5f9);
     --color-text-muted: light-dark(#64748b, #94a3b8);
   }
   
   /* ========================================
      4. CUSTOM VARIANTS - @custom-variant
      ========================================
      Create your own variant conditions
   */
   @custom-variant theme-dark (&:where(.dark, .dark *));
   @custom-variant theme-midnight (&:where([data-theme="midnight"] *));
   @custom-variant theme-ocean (&:where([data-theme="ocean"] *));
   @custom-variant group-expanded (&:where(.group[aria-expanded="true"] *));
   @custom-variant peer-checked (&:where(:has(+ input:checked) *));
   @custom-variant hocus (&:where(:hover, :focus));
   @custom-variant js (&:where(.js *));
   @custom-variant no-js (&:where(.no-js *));
   @custom-variant reduced-motion (&:where([data-motion="reduced"] *));
   @custom-variant portrait {
     @media (orientation: portrait) {
       @slot;
     }
   }
   @custom-variant landscape {
     @media (orientation: landscape) {
       @slot;
     }
   }
   @custom-variant high-contrast {
     @media (prefers-contrast: high) {
       @slot;
     }
   }
   
   /* ========================================
      5. CUSTOM UTILITIES - @utility
      ========================================
      Add your own utility classes
   */
   @utility .text-stroke {
     -webkit-text-stroke-width: 1px;
     -webkit-text-stroke-color: currentColor;
     paint-order: stroke fill;
   }
   
   @utility .text-stroke-2 {
     -webkit-text-stroke-width: 2px;
     -webkit-text-stroke-color: currentColor;
     paint-order: stroke fill;
   }
   
   @utility .text-shadow {
     text-shadow: 2px 2px 4px oklch(0.2 0.02 240 / 0.5);
   }
   
   @utility .text-shadow-lg {
     text-shadow: 4px 4px 8px oklch(0.2 0.02 240 / 0.3);
   }
   
   /* Functional utilities with parameters */
   @utility .scroll-snap {
     scroll-snap-type: --value();
     
     &-x {
       scroll-snap-type: x mandatory;
     }
     
     &-y {
       scroll-snap-type: y mandatory;
     }
     
     &-both {
       scroll-snap-type: both mandatory;
     }
   }
   
   @utility .backdrop-blur-extreme {
     backdrop-filter: blur(50px);
   }
   
   @utility .writing-mode {
     writing-mode: --value();
   }
   
   @utility .perspective {
     perspective: --value(--spacing-*);
   }
   
   @utility .transform-style-3d {
     transform-style: preserve-3d;
   }
   
   @utility .mask {
     mask: --value();
     -webkit-mask: --value();
   }
   
   @utility .clip-polygon {
     clip-path: polygon(--value());
   }
   
   @utility .text-wrap {
     text-wrap: --value();
     
     &-balance {
       text-wrap: balance;
     }
     
     &-pretty {
       text-wrap: pretty;
     }
   }
   
   /* Container queries utilities */
   @utility .container-size {
     container-type: size;
   }
   
   @utility .container-inline {
     container-type: inline-size;
   }
   
   @utility .container-name {
     container-name: --value();
   }
   
   /* Logical properties utilities */
   @utility .border-inline {
     border-inline-width: --value(--spacing-*);
     border-inline-style: solid;
     border-inline-color: currentColor;
   }
   
   @utility .border-block {
     border-block-width: --value(--spacing-*);
     border-block-style: solid;
     border-block-color: currentColor;
   }
   
   /* ========================================
      6. LAYER DEFINITIONS - @layer
      ========================================
      Organize CSS in cascade layers
   */
   
   /* Base layer - resets and base styles */
   @layer base {
     /* Modern CSS reset additions */
     *, ::before, ::after {
       box-sizing: border-box;
     }
     
     html {
       color-scheme: light dark;
       hanging-punctuation: first last;
       text-size-adjust: 100%;
     }
     
     body {
       font-family: var(--font-sans);
       line-height: 1.6;
       -webkit-font-smoothing: antialiased;
       -moz-osx-font-smoothing: grayscale;
       text-rendering: optimizeLegibility;
     }
     
     /* Focus styles */
     :focus-visible {
       outline: 2px solid var(--color-primary);
       outline-offset: 2px;
       border-radius: calc(var(--radius-sm) * 1px);
     }
     
     /* Custom scrollbar */
     ::-webkit-scrollbar {
       width: 8px;
       height: 8px;
     }
     
     ::-webkit-scrollbar-track {
       background: var(--color-surface);
     }
     
     ::-webkit-scrollbar-thumb {
       background: var(--color-neutral);
       border-radius: var(--radius-full);
     }
     
     ::-webkit-scrollbar-thumb:hover {
       background: var(--color-primary);
     }
     
     /* Better defaults for media */
     img, picture, video, canvas, svg {
       display: block;
       max-width: 100%;
       height: auto;
     }
     
     /* Remove built-in form typography styles */
     input, button, textarea, select {
       font: inherit;
       color: inherit;
     }
     
     /* Better line wrapping */
     p, h1, h2, h3, h4, h5, h6 {
       overflow-wrap: break-word;
       text-wrap: pretty;
     }
     
     /* Avoid text overflows */
     h1, h2, h3, h4, h5, h6 {
       line-height: 1.1;
       text-wrap: balance;
     }
     
     /* Create a root stacking context */
     #root, #__next {
       isolation: isolate;
     }
   }
   
   /* Components layer - reusable component styles */
   @layer components {
     /* Button component with theme variables */
     .btn {
       display: inline-flex;
       align-items: center;
       justify-content: center;
       gap: var(--spacing-2);
       padding-inline: var(--spacing-4);
       padding-block: var(--spacing-2);
       border-radius: calc(var(--radius-lg) * 1px);
       font-weight: var(--font-weight-medium);
       font-size: var(--text-sm);
       line-height: var(--text-sm--line-height);
       transition: all var(--duration-200) var(--ease-out);
       cursor: pointer;
       border: 1px solid transparent;
       text-decoration: none;
       user-select: none;
       
       &:disabled {
         opacity: 0.5;
         cursor: not-allowed;
       }
     }
     
     .btn-primary {
       background-color: var(--color-primary);
       color: white;
       box-shadow: var(--shadow-sm);
       
       &:hover:not(:disabled) {
         background-color: oklch(from var(--color-primary) calc(l - 0.1) c h);
         box-shadow: var(--shadow-md);
         transform: translateY(-1px);
       }
       
       &:active {
         transform: translateY(0);
         box-shadow: var(--shadow-sm);
       }
     }
     
     .btn-outline {
       background-color: transparent;
       color: var(--color-primary);
       border-color: var(--color-primary);
       
       &:hover:not(:disabled) {
         background-color: var(--color-primary);
         color: white;
       }
     }
     
     /* Card component */
     .card {
       background-color: var(--color-surface);
       border-radius: calc(var(--radius-xl) * 1px);
       box-shadow: var(--shadow-lg);
       border: 1px solid oklch(from var(--color-neutral) l c h / 0.1);
       overflow: hidden;
       
       &-header {
         padding: var(--spacing-6);
         border-bottom: 1px solid oklch(from var(--color-neutral) l c h / 0.1);
       }
       
       &-body {
         padding: var(--spacing-6);
       }
       
       &-footer {
         padding: var(--spacing-4) var(--spacing-6);
         border-top: 1px solid oklch(from var(--color-neutral) l c h / 0.1);
         background-color: var(--color-surface-alt);
       }
     }
     
     /* Form styles */
     .form-input {
       width: 100%;
       padding: var(--spacing-3);
       border: 1px solid var(--color-neutral);
       border-radius: calc(var(--radius-md) * 1px);
       background-color: var(--color-surface);
       color: var(--color-text);
       font-size: var(--text-sm);
       transition: all var(--duration-200) var(--ease-out);
       
       &:focus {
         outline: none;
         border-color: var(--color-primary);
         box-shadow: 0 0 0 3px oklch(from var(--color-primary) l c h / 0.1);
       }
       
       &:invalid {
         border-color: var(--color-red-500);
       }
     }
     
     /* Navigation component */
     .nav-link {
       display: block;
       padding: var(--spacing-2) var(--spacing-4);
       color: var(--color-text-muted);
       text-decoration: none;
       border-radius: calc(var(--radius-md) * 1px);
       transition: all var(--duration-200) var(--ease-out);
       
       &:hover,
       &[aria-current="page"] {
         color: var(--color-text);
         background-color: var(--color-surface-alt);
       }
     }
     
     /* Loading spinner */
     .spinner {
       width: var(--spacing-6);
       height: var(--spacing-6);
       border: 2px solid var(--color-surface-alt);
       border-top-color: var(--color-primary);
       border-radius: var(--radius-full);
       animation: spin var(--duration-1000) linear infinite;
     }
     
     @keyframes spin {
       to {
         transform: rotate(360deg);
       }
     }
     
     /* Skeleton loader */
     .skeleton {
       background: linear-gradient(
         90deg,
         var(--color-surface-alt) 25%,
         oklch(from var(--color-surface-alt) calc(l + 0.02) c h) 50%,
         var(--color-surface-alt) 75%
       );
       background-size: 200% 100%;
       animation: skeleton-loading var(--duration-2000) infinite;
     }
     
     @keyframes skeleton-loading {
       0% {
         background-position: 200% 0;
       }
       100% {
         background-position: -200% 0;
       }
     }
   }
   
   /* ========================================
      7. VARIANTS IN CSS - @variant
      ========================================
      Apply variants to custom CSS
   */
   @variant dark {
     .custom-dark-style {
       background-color: var(--color-surface);
       color: var(--color-text);
     }
   }
   
   @variant hover {
     .hover-lift {
       transform: translateY(-4px);
       box-shadow: var(--shadow-xl);
     }
   }
   
   @variant focus {
     .focus-ring {
       outline: 2px solid var(--color-primary);
       outline-offset: 2px;
     }
   }
   
   /* ========================================
      8. SOURCE DECLARATION - @source
      ========================================
      Explicitly specify content sources
   */
   @source "./src/**/*.{js,ts,jsx,tsx}";
   @source "./pages/**/*.{js,ts,jsx,tsx}";
   @source "./components/**/*.{js,ts,jsx,tsx}";
   @source "./app/**/*.{js,ts,jsx,tsx}";
   
   /* Force include specific utilities */
   @source inline(
     "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
     "animate-pulse animate-bounce animate-spin"
     "backdrop-blur-xl backdrop-saturate-150"
     "text-transparent bg-clip-text"
   );
   
   /* ========================================
      9. LEGACY COMPATIBILITY
      ========================================
      For gradual migration from v3
   */
   
   /* Load legacy config if needed */
   /* @config "./tailwind.config.js"; */
   
   /* Load legacy plugins */
   /* @plugin "tailwindcss-animate"; */
   /* @plugin "@tailwindcss/typography"; */
   /* @plugin "@tailwindcss/forms"; */
   
   /* ========================================
      10. ADVANCED CSS FEATURES
      ========================================
      Taking advantage of modern CSS
   */
   
   /* Container queries */
   @container (min-width: 400px) {
     .container-lg\:text-xl {
       font-size: var(--text-xl);
     }
   }
   
   /* Support for CSS nesting (built-in now) */
   .nested-example {
     color: var(--color-text);
     
     & .child {
       color: var(--color-text-muted);
       
       &:hover {
         color: var(--color-primary);
       }
     }
   }
   
   /* Modern color functions */
   .modern-colors {
     /* OKLCH colors (built-in support) */
     color: oklch(0.7 0.15 220);
     
     /* Color mixing */
     background: color-mix(in oklch, var(--color-primary) 50%, white);
     
     /* Relative colors */
     border-color: oklch(from var(--color-primary) calc(l - 0.2) c h);
   }
   
   /* CSS @property for better performance */
   @property --gradient-angle {
     syntax: '<angle>';
     initial-value: 0deg;
     inherits: false;
   }
   
   .animated-gradient {
     background: conic-gradient(
       from var(--gradient-angle),
       var(--color-primary),
       var(--color-secondary),
       var(--color-accent),
       var(--color-primary)
     );
     animation: rotate var(--duration-5000) linear infinite;
   }
   
   @keyframes rotate {
     to {
       --gradient-angle: 360deg;
     }
   }
   
   /* ========================================
      11. UTILITY EXTENSIONS
      ========================================
      Additional utilities for modern web
   */
   
   /* View transition names */
   .view-transition-name {
     view-transition-name: --value();
   }
   
   /* CSS anchor positioning (when supported) */
   .anchor {
     anchor-name: --value();
   }
   
   .anchored {
     position-anchor: --value();
   }
   
   /* Scroll-driven animations */
   @supports (animation-timeline: scroll()) {
     .scroll-animate {
       animation: scroll-reveal both linear;
       animation-timeline: scroll();
       animation-range: entry 25% cover 75%;
     }
     
     @keyframes scroll-reveal {
       from {
         opacity: 0;
         transform: translateY(20px);
       }
       to {
         opacity: 1;
         transform: translateY(0);
       }
     }
   }
   
   /* ========================================
      12. THEMING SYSTEM
      ========================================
      Multi-theme setup using CSS custom properties
   */
   
   /* Light theme (default) */
   :root {
     --theme-bg: #ffffff;
     --theme-fg: #0f172a;
     --theme-primary: #3b82f6;
     --theme-secondary: #8b5cf6;
   }
   
   /* Dark theme */
   .dark {
     --theme-bg: #0f172a;
     --theme-fg: #f1f5f9;
     --theme-primary: #60a5fa;
     --theme-secondary: #a78bfa;
   }
   
   /* Ocean theme */
   [data-theme="ocean"] {
     --theme-bg: #0c4a6e;
     --theme-fg: #e0f2fe;
     --theme-primary: #0ea5e9;
     --theme-secondary: #06b6d4;
   }
   
   /* Apply theme variables to utilities */
   @theme inline {
     --color-theme-bg: var(--theme-bg);
     --color-theme-fg: var(--theme-fg);
     --color-theme-primary: var(--theme-primary);
     --color-theme-secondary: var(--theme-secondary);
   }
   
   /* ========================================
      13. PERFORMANCE OPTIMIZATIONS
      ========================================
      CSS features for better performance
   */
   
   /* Layer ordering for optimal cascade */
   @layer theme, base, components, utilities, overrides;
   
   /* Content visibility for better rendering */
   .lazy-content {
     content-visibility: auto;
     contain-intrinsic-size: 500px;
   }
   
   /* CSS containment */
   .contained {
     contain: layout style paint;
   }
   
   /* ========================================
      14. ACCESSIBILITY ENHANCEMENTS
      ========================================
      Better a11y with modern CSS
   */
   
   /* Reduced motion support */
   @media (prefers-reduced-motion: reduce) {
     *,
     ::before,
     ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   
   /* High contrast support */
   @media (prefers-contrast: high) {
     .btn {
       border-width: 2px;
     }
   }
   
   /* Focus-visible improvements */
   .focus-visible-only {
     &:focus:not(:focus-visible) {
       outline: none;
     }
     
     &:focus-visible {
       outline: 2px solid var(--color-primary);
       outline-offset: 2px;
     }
   }
   
   /* ========================================
      END OF TAILWIND V4 SHOWCASE
      ========================================
      This CSS file demonstrates:
      - @import directive for Tailwind
      - @theme for design tokens
      - @theme inline for dynamic theming
      - @custom-variant for custom variants
      - @utility for custom utilities
      - @variant for applying variants
      - @layer for organizing CSS
      - @source for content detection
      - Modern CSS features integration
      - Performance optimizations
      - Accessibility enhancements
      - Multi-theme support
      - CSS-first configuration approach
   */
```