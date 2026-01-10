"use client";

import { cn } from "@/lib/cn";

interface TypographyItem {
  name: string;
  size: string;
  weight: number;
  lineHeight: number;
  description?: string;
  className: string;
}

const TYPOGRAPHY_SCALES: TypographyItem[] = [
  {
    name: "H1",
    size: "36px / 2.25rem",
    weight: 700,
    lineHeight: 1.2,
    description: "Heading 1 - Main page title",
    className: "text-4xl font-bold",
  },
  {
    name: "H2",
    size: "30px / 1.875rem",
    weight: 700,
    lineHeight: 1.2,
    description: "Heading 2 - Section title",
    className: "text-3xl font-bold",
  },
  {
    name: "H3",
    size: "24px / 1.5rem",
    weight: 700,
    lineHeight: 1.2,
    description: "Heading 3 - Subsection",
    className: "text-2xl font-bold",
  },
  {
    name: "H4",
    size: "20px / 1.25rem",
    weight: 700,
    lineHeight: 1.3,
    description: "Heading 4 - Component title",
    className: "text-xl font-bold",
  },
  {
    name: "Body Large",
    size: "18px / 1.125rem",
    weight: 400,
    lineHeight: 1.6,
    description: "Large body text",
    className: "text-lg font-normal",
  },
  {
    name: "Body Regular",
    size: "16px / 1rem",
    weight: 400,
    lineHeight: 1.6,
    description: "Default body text",
    className: "text-base font-normal",
  },
  {
    name: "Body Small",
    size: "14px / 0.875rem",
    weight: 400,
    lineHeight: 1.6,
    description: "Small body text",
    className: "text-sm font-normal",
  },
  {
    name: "Body XSmall",
    size: "12px / 0.75rem",
    weight: 400,
    lineHeight: 1.6,
    description: "Extra small body text",
    className: "text-xs font-normal",
  },
];

const FONT_WEIGHTS: Array<{
  name: string;
  weight: number;
  className: string;
}> = [
  { name: "Regular", weight: 400, className: "font-normal" },
  { name: "Medium", weight: 500, className: "font-medium" },
  { name: "Semibold", weight: 600, className: "font-semibold" },
  { name: "Bold", weight: 700, className: "font-bold" },
];

export function TypographyShowcase() {
  return (
    <div className="space-y-8">
      {/* Typography Scale */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-fd-foreground">
          Typography Scale
        </h2>
        <div className="grid gap-4">
          {TYPOGRAPHY_SCALES.map((item) => (
            <div
              key={item.name}
              className="rounded-lg border border-fd-border bg-fd-card p-6"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-fd-foreground">
                    {item.name}
                  </h3>
                  <p className="text-sm text-fd-muted-foreground">
                    {item.size} • Weight {item.weight} • Line height {item.lineHeight}
                  </p>
                </div>
                <p className="text-xs text-fd-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className={cn(item.className, "text-fd-foreground")}>
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-fd-foreground">Font Weights</h2>
        <div className="grid gap-4">
          {FONT_WEIGHTS.map((weight) => (
            <div
              key={weight.name}
              className="rounded-lg border border-fd-border bg-fd-card p-6"
            >
              <p className="mb-3 text-sm font-semibold text-fd-muted-foreground">
                {weight.name} ({weight.weight})
              </p>
              <p
                className={cn(
                  "text-xl text-fd-foreground",
                  weight.className
                )}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Line Height Reference */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-fd-foreground">Line Heights</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-fd-border bg-fd-card p-6">
            <p className="mb-3 text-sm font-semibold text-fd-muted-foreground">
              Heading (1.2 - 1.3)
            </p>
            <p className="text-lg font-bold leading-snug text-fd-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor.
            </p>
          </div>
          <div className="rounded-lg border border-fd-border bg-fd-card p-6">
            <p className="mb-3 text-sm font-semibold text-fd-muted-foreground">
              Body Text (1.5 - 1.6)
            </p>
            <p className="text-base leading-relaxed text-fd-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-fd-foreground">Usage Examples</h2>
        <div className="space-y-6 rounded-lg border border-fd-border bg-fd-card p-6">
          <div>
            <h1 className="text-4xl font-bold text-fd-foreground">
              This is a Heading 1
            </h1>
            <p className="mt-2 text-sm text-fd-muted-foreground">
              36px • Weight 700 • Line height 1.2
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-fd-foreground">
              This is a Heading 2
            </h2>
            <p className="mt-2 text-sm text-fd-muted-foreground">
              30px • Weight 700 • Line height 1.2
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-fd-foreground">
              This is a Heading 3
            </h3>
            <p className="mt-2 text-sm text-fd-muted-foreground">
              24px • Weight 700 • Line height 1.2
            </p>
          </div>

          <div>
            <p className="text-base leading-relaxed text-fd-foreground">
              This is body text with regular weight and proper line height for
              optimal readability. The line height should be between 1.5 and 1.6
              for body text to ensure comfortable reading experience.
            </p>
            <p className="mt-2 text-sm text-fd-muted-foreground">
              16px • Weight 400 • Line height 1.6
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-fd-foreground">
          Best Practices
        </h2>
        <ul className="space-y-2 rounded-lg border border-fd-border bg-fd-card p-6">
          <li className="flex gap-3 text-fd-foreground">
            <span className="font-semibold">•</span>
            <span>Use maximum 2-3 font sizes per page for hierarchy</span>
          </li>
          <li className="flex gap-3 text-fd-foreground">
            <span className="font-semibold">•</span>
            <span>
              Ensure sufficient contrast between text and background
            </span>
          </li>
          <li className="flex gap-3 text-fd-foreground">
            <span className="font-semibold">•</span>
            <span>Keep line length between 60-80 characters for readability</span>
          </li>
          <li className="flex gap-3 text-fd-foreground">
            <span className="font-semibold">•</span>
            <span>Use appropriate weights for visual hierarchy</span>
          </li>
          <li className="flex gap-3 text-fd-foreground">
            <span className="font-semibold">•</span>
            <span>Maintain consistent spacing between text elements</span>
          </li>
          <li className="flex gap-3 text-fd-foreground">
            <span className="font-semibold">•</span>
            <span>Test readability across different screen sizes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
