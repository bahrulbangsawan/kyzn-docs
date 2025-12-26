# KYZN Docs

Internal documentation and knowledge base for KYZN, built with Next.js and Fumadocs.

## Overview

KYZN Docs is a comprehensive documentation platform that provides access to:
- **Product Knowledge**: Product knowledge base and documentation
- **IT Development**: IT development documentation and resources
- **Design System**: Design system documentation and guidelines
- **Tutorials**: Tutorials and guides

## Features

- 📚 Multi-section documentation with MDX support
- 🤖 AI-powered chat assistant (Ask RuBot) for interactive help
- 🔍 Full-text search functionality
- 🎨 Modern, responsive UI with dark mode support
- 📱 Mobile-friendly design
- ⚡ Fast performance with Next.js

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.0.1
- **Documentation**: [Fumadocs](https://fumadocs.dev/) 16.2.2
- **UI Components**: Fumadocs UI, Radix UI
- **Styling**: Tailwind CSS 4.1.16
- **AI Chat**: AI SDK with OpenAI-compatible API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/itkyzn/kyzn-docs.git
cd kyzn-docs
```

2. Install dependencies:
```bash
npm install
# or
bun install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
bun dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
docs-kyzn/
├── content/              # MDX documentation files
│   └── docs/
│       ├── brand/        # Design system docs
│       ├── funnel/       # Funnel documentation
│       ├── it/           # IT development docs
│       ├── pd/           # Product knowledge
│       └── tutorial/     # Tutorials
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/          # API routes (chat, search)
│   │   └── [...slug]/     # Dynamic docs pages
│   ├── components/       # React components
│   │   ├── search.tsx    # AI search/chat component
│   │   └── ui/           # UI components
│   └── lib/              # Utilities and configs
└── source.config.ts      # Fumadocs source configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome
- `npm run types:check` - Type check with TypeScript

## Documentation Sections

### Product Knowledge (`/pd`)
Product knowledge base and documentation.

### IT Development (`/it`)
IT development documentation and resources, including:
- Authentication guides (e.g., SleekFlow WhatsApp Auth)

### Design System (`/brand`)
Design system documentation including:
- Color palettes
- Typography
- Logo guidelines
- Theme CSS

### Tutorials (`/tutorial`)
Step-by-step tutorials and guides.

## AI Chat Feature

The documentation includes an AI-powered chat assistant (Ask RuBot) that can:
- Answer questions about the documentation
- Provide contextual help
- Reference related documentation pages

Access it via the "Ask AI" button in the bottom-right corner or use the keyboard shortcut `⌘K` (Mac) or `Ctrl+K` (Windows/Linux).

## Configuration

### Source Configuration

Edit `source.config.ts` to customize:
- Frontmatter schema
- Content structure
- MDX options

### Layout Options

Edit `src/lib/layout.shared.tsx` to customize:
- Navigation
- Sidebar
- Theme options

## Deployment

### Vercel

This project is configured for deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and configure the build settings
3. Deployments happen automatically on every push to the main branch

The project includes a `vercel.json` configuration file for deployment settings.

For manual deployment:
```bash
npm run build
```

Then deploy via Vercel CLI or the Vercel dashboard.

## Contributing

1. Create a new branch for your changes
2. Make your changes
3. Test locally with `npm run dev`
4. Run linting: `npm run lint`
5. Format code: `npm run format`
6. Submit a pull request

## License

Private - Internal use only

## Support

For questions or issues, please contact the KYZN development team.
