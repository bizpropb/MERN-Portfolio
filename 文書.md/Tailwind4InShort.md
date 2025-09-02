
Here’s the **absolute minimum** you need to understand about tailwind v4.  

For more info visit: https://tailwindcss.com/docs/functions-and-directives 

--------------------------------------------------
1. `@tailwind base; @tailwind components; @tailwind utilities;`  
   • **v3 only**.  
   • v4 **never** uses these—delete them.

2. `@import "tailwindcss";`  
   • v4 **single-line** entry.  
   • Put it **once**, at the **top** of your main CSS file.  
   • Generates **all** Tailwind classes in one go.

3. `@layer theme | base | components | utilities`  
   • **Sorts** your custom CSS into the same cascade order Tailwind uses.  
   • Rules inside `@layer components` **come before** utilities, so utilities can still override them.  
   • **Optional**; if you skip it, your CSS lands in the implicit layer (highest priority).

4. `@config "tailwind.config.js"`  
   • v4 **only** if you still keep a JS config file.  
   • Put it **right after** `@import "tailwindcss";` (or omit it entirely and use the new CSS config).

5. `@theme`  
   • v4 **CSS config** block.  
   • Define colours, fonts, spacing, etc. in plain CSS instead of JS:

   ```css
   @theme {
     --color-brand: #f00;
     --font-display: "Inter", sans-serif;
   }
   ```

6. `@apply`  
   • Works **inside any selector**, never naked.  
   • Searches **only the already compiled** utility list, so the file that defines the utility **must be imported earlier** in the same bundle.

7. `@plugin "some-plugin"`  
   • v4 **plugin loading**.  
   • Goes **after** the Tailwind import.

--------------------------------------------------
One-liner summary  
In v4 you usually write:

```css
@import "tailwindcss";
@config "tailwind.config.js";          /* optional */
@plugin "@tailwindcss/typography";     /* optional */

@layer components {
  .btn { @apply px-4 py-2 bg-brand; }
}
```

That’s it—no other `@` directives matter for 99 % of daily work.