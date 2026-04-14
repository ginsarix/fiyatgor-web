# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Vite)
pnpm build      # Type-check with tsc, then bundle with Vite
pnpm preview    # Preview the production build locally
```

Linting is handled by Biome (`@biomejs/biome`). There are no test scripts configured.

## Architecture

This is a single-page vanilla TypeScript app built with Vite. It is a barcode-based price lookup kiosk ("Fiyat Gör" = "See Price" in Turkish).

**Entry point flow:**
1. `index.html` — static markup with a barcode text input, animated canvas background, stacked loader/product display areas, and two `<audio>` elements for success/error feedback.
2. `src/main.ts` — all application logic. On `keypress` Enter, it reads the input, calls the REST API, and updates the DOM directly (no framework).
3. `src/particles.ts` — canvas animation for the decorative background; called once from `main.ts` on `DOMContentLoaded`.
4. `src/style.css` — imports Tailwind v4 and sets the Geist Variable font globally.

**Multi-tenant server resolution:** In production, the tenant/server code is extracted from the first subdomain segment of `location.hostname` (e.g., `diademo.fiyatgor.panunet.com.tr` → `diademo`). In development it defaults to `"diademo"`.

**API:** `GET https://api.fiyatgor.panunet.com.tr/servers/{serverCode}/products/{barcode}`  
Dev API base: `http://localhost:3000`

**State management:** All UI state is vanilla DOM manipulation — CSS class toggling for opacity/scale transitions, a CSS grid row expansion trick for the result panel, and a `setTimeout`-based auto-dismiss (30 s on success, 3 s on error). `prevBarcode` prevents duplicate fetches for the same barcode scan.

**Tailwind:** Uses Tailwind v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js` needed).
