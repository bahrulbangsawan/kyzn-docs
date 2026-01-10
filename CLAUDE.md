# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun dev                # Start development server (Turbopack enabled)
bun run build          # Build for production
bun run start          # Start production server

# Code Quality
bun run lint           # Lint with Biome
bun run format         # Format with Biome
bun run types:check    # TypeScript type checking (runs fumadocs-mdx first)
```

## Architecture

This is a **Fumadocs-based documentation site** built with Next.js 16 (App Router) and deployed to Vercel.

### Content System

- MDX content lives in `content/docs/` organized by section (brand, funnel, it, pd, tutorial)
- Content configuration: `source.config.ts` defines frontmatter schema and MDX options
- Source loader: `src/lib/source.ts` creates the Fumadocs source with lucide icons plugin
- Each section has a `meta.json` for navigation ordering and structure

### Key Patterns

**MDX Components** (`src/mdx-components.tsx`): Custom components available in MDX files:
- `Tabs`, `Tab` - from fumadocs-ui
- `Step`, `Steps` - for step-by-step guides
- `Callout` - for info/warning/error boxes
- `ImageZoom` - for zoomable images

**Page Rendering** (`src/app/[...slug]/page.tsx`):
- Uses `source.getPage(slug)` to fetch content
- Supports custom `category` frontmatter for eyebrow text
- Static generation via `generateStaticParams()`

**AI Chat** (`src/app/api/chat/route.ts`):
- Uses OpenRouter API with Gemini model
- Caches all docs content for context
- Response includes `[[REFERENCES]]` blocks for linking to docs

**LLM-Friendly Endpoints**:
- `GET /[path].mdx` - Raw markdown for any doc page (via rewrite to `/llms.mdx/`)
- `GET /llms-full.txt` - All docs concatenated for LLM consumption

### Path Aliases

- `@/*` → `./src/*`
- `fumadocs-mdx:collections/*` → `./.source/*`

### Environment Variables

- `OPENROUTER_API_KEY` - Required for AI chat functionality

### Styling

- Tailwind CSS 4 with PostCSS
- Fumadocs UI theme with dark mode support
- Custom button variants in `src/components/ui/button.tsx`
