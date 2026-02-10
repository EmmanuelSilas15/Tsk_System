# Copilot Instructions for tsk_in 🚀

These instructions are written for AI coding agents to be immediately productive in this repository. Follow only patterns discoverable in the codebase.

## Quick snapshot
- Framework: **Next.js (app directory)** — see `app/layout.tsx` and `app/page.tsx`.
- Styling: **Tailwind CSS** + custom utilities in `app/globals.css` and `tailwind.config.ts`.
- Languages: **TypeScript** (strict) — see `tsconfig.json`.
- Tooling: Scripts in `package.json`: `dev`, `build`, `start`, `lint`.

## Big picture & architecture 🔧
- This is a single Next.js app using the **app/** directory (server-first components by default). Use server components unless a file explicitly includes `"use client"`.
- Global layout and font loading are centralized in `app/layout.tsx` (uses `next/font/google` with CSS variables).
- Styling follows Tailwind utility-first approach and also defines component classes inside `app/globals.css` using `@layer components` (examples: `.btn-primary`, `.card`).
- Dark mode is implemented via CSS variables in `app/globals.css` (prefers-color-scheme media query), not via Tailwind's `dark:` strategy as the sole source of truth.

## Key files to read first 📚
- `package.json` — scripts and dependency versions.
- `app/layout.tsx` — app-wide fonts/variables and root markup.
- `app/globals.css` — Tailwind entry points, CSS variables, component utilities.
- `tailwind.config.ts` — theme extensions (colors `primary`/`secondary`, `content` globs).
- `eslint.config.mjs` — linting rules and ignored paths.

## Project-specific conventions & patterns ✅
- Tailwind custom utilities: defined in `app/globals.css` under `@layer components`. Use and extend these, e.g.:
  - `.btn-primary` used in `app/page.tsx`.
  - `.card` used widely for card-like containers.
- Color tokens: `primary` and `secondary` are defined in `tailwind.config.ts` and used in markup (`text-primary`, `border-primary`).
- Fonts: `next/font/google` is used and exported as CSS variables (see `layout.tsx`) — prefer referencing those variables instead of importing fonts manually.
- Import paths: `tsconfig.json` defines `"@/*": ["./*"]`; import helpers/components with `@/` when appropriate.

## Important gotchas discovered ⚠️
- Tailwind content globs in `tailwind.config.ts` point to `./src/...` (e.g. `./src/app/**/*`), but this repo places files in `./app/...` at the project root. This can cause missing utilities in production builds. Actionable: update content globs to include the root `./app/**/*.{js,ts,jsx,tsx,mdx}` or `./**/*.{js,ts,jsx,tsx,mdx}`.
- `package.json` lists Next dependency `16.1.6` but the UI text references "Next.js 14". Trust `package.json` for canonical versioning and confirm when adding version-specific features.
- `package.json` `lint` script is simply `eslint` (no path). To lint the repository explicitly run `npm run lint` or `npx eslint . --ext .ts,.tsx` if necessary.

## Typical developer workflows (discovered) 🛠️
- Local dev: `npm run dev` (runs `next dev`) — hot reloads `app/` files.
- Build for production: `npm run build` then `npm run start`.
- Linting: `npm run lint` (uses `eslint.config.mjs`).
- PostCSS is configured via `postcss.config.mjs` and Tailwind is loaded via `@tailwindcss/postcss` plugin.

## How to make safe changes (examples) ✏️
- Adding a new UI utility: add it to `@layer components` in `app/globals.css` and use the existing naming pattern (e.g., `btn-*`, `card`).
- Adding Tailwind content paths: modify `tailwind.config.ts` `content` array — include `./app/**/*.{js,ts,jsx,tsx,mdx}`.
- Introducing client components: add the `"use client"` directive at the top of the component file and keep logic isolated to that component.

## Tests & CI
- No test framework or CI config detected in repository. If adding tests, follow the existing TypeScript strictness and ensure build passes `npm run build`.

## When unsure, follow these heuristics 💡
- Prefer changes that are visible in `app/` and `app/globals.css` (major UX and style patterns live here).
- Consult `package.json` for script commands and dependency versions.
- If touching tooling (Tailwind, ESLint), update corresponding config files (`tailwind.config.ts`, `eslint.config.mjs`).

---
Please review these instructions and tell me which parts need more detail or any missing conventions you want included (e.g., preferred commit message format, CI steps, or test framework to adopt). 🙏