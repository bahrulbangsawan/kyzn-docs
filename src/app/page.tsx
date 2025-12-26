import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Code, Palette, GraduationCap, Search } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KYZN Docs',
  description: 'Internal documentation and knowledge base for KYZN',
};

const sections = [
  {
    title: 'Product Knowledge',
    description: 'Product knowledge base and documentation',
    href: '/pd',
    icon: BookOpen,
  },
  {
    title: 'IT Development',
    description: 'IT development documentation and resources',
    href: '/it',
    icon: Code,
  },
  {
    title: 'Design System',
    description: 'Design system documentation and guidelines',
    href: '/brand',
    icon: Palette,
  },
  {
    title: 'Tutorial',
    description: 'Tutorials and guides',
    href: '/tutorial',
    icon: GraduationCap,
  },
];

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-fd-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://files.kyzn.life/brand/kyzn-logo-2.webp"
              alt="KYZN"
              width={24}
              height={24}
              className="block dark:hidden"
            />
            <Image
              src="https://files.kyzn.life/brand/kyzn-logo-1.webp"
              alt="KYZN"
              width={24}
              height={24}
              className="hidden dark:block"
            />
            <span className="font-semibold">KYZN Docs</span>
          </Link>
          <Link
            href="/pd"
            className="flex items-center gap-2 rounded-lg border bg-fd-secondary px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground sm:w-[200px] md:w-[240px]"
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">Search docs...</span>
            <kbd className="ml-auto hidden rounded border bg-fd-background px-1.5 py-0.5 text-xs sm:inline">
              ⌘K
            </kbd>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Getting Started
            </h1>
            <p className="text-fd-muted-foreground text-lg">
              Portal to different sections of docs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-xl border bg-fd-card p-5 transition-colors hover:bg-fd-accent"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-fd-background">
                  <section.icon className="size-5 text-fd-muted-foreground" />
                </div>
                <h2 className="font-semibold text-fd-card-foreground">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm text-fd-muted-foreground">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
