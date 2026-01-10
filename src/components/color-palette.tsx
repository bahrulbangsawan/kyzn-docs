"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import {
  formatColor,
  isLightColor,
  exportAsCssVariables,
  exportAsTailwindConfig,
  exportAsJson,
  downloadFile,
  type ColorFormat,
} from "@/lib/color-utils";

// Standard Tailwind shade sequence
const SHADE_ORDER = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

const FORMAT_OPTIONS: { value: ColorFormat; label: string }[] = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
  { value: "oklch", label: "OKLCH" },
];

const EXPORT_OPTIONS = [
  { value: "css", label: "CSS Variables", filename: "colors.css" },
  {
    value: "tailwind",
    label: "Tailwind Config",
    filename: "tailwind-colors.js",
  },
  { value: "json", label: "JSON", filename: "colors.json" },
] as const;

export interface ColorPaletteProps {
  /** Palette name displayed as title */
  name: string;
  /** Color values keyed by shade number */
  colors: Record<string, string>;
  /** Optional description */
  description?: string;
  /** Default format for display */
  defaultFormat?: ColorFormat;
  /** Show format selector */
  showFormatSelector?: boolean;
  /** Show export button */
  showExport?: boolean;
  /** Shade to mark as default/locked (e.g., '500') */
  defaultShade?: string;
}

export interface ColorPaletteGroupProps {
  /** Array of palette definitions */
  palettes: {
    name: string;
    colors: Record<string, string>;
    description?: string;
    defaultShade?: string;
  }[];
  /** Global format override */
  defaultFormat?: ColorFormat;
  /** Section title */
  title?: string;
}

interface ColorSwatchProps {
  shade: string;
  hex: string;
  name: string;
  format: ColorFormat;
  isFirst: boolean;
  isLast: boolean;
  isDefault: boolean;
  copiedValue: string | null;
  onCopy: (value: string) => void;
}

function ColorSwatch({
  shade,
  hex,
  name,
  format,
  isFirst,
  isLast,
  isDefault,
  copiedValue,
  onCopy,
}: ColorSwatchProps) {
  const formattedValue = formatColor(hex, format);
  const isLight = isLightColor(hex);
  const isCopied = copiedValue === formattedValue;

  return (
    <button
      type="button"
      className={cn(
        "group relative aspect-square w-full cursor-pointer transition-all",
        "hover:scale-110 hover:z-10 hover:shadow-lg hover:rounded-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:z-10",
        isFirst && "rounded-l-lg",
        isLast && "rounded-r-lg",
      )}
      style={{
        backgroundColor: hex,
      }}
      onClick={() => onCopy(formattedValue)}
      aria-label={`Copy ${name} ${shade}: ${formattedValue}`}
      title={formattedValue}
    >
      {/* Shade label */}
      {!isCopied && (
        <span
          className={cn(
            "absolute inset-x-0 bottom-1 text-center text-sm font-medium md:text-xs",
            isLight ? "text-gray-900" : "text-white",
          )}
        >
          {shade}
        </span>
      )}

      {/* HEX value label (responsive visibility) */}
      {!isCopied && (
        <span
          className={cn(
            "absolute inset-x-0 bottom-5 text-center text-xs font-normal uppercase md:text-xs",
            isLight ? "text-gray-700" : "text-white/80",
          )}
        >
          {hex.replace("#", "")}
        </span>
      )}

      {/* Default color lock icon */}
      {isDefault && !isCopied && (
        <span className="absolute top-3 left-1/2 -translate-x-1/2">
          <Lock
            className={cn(
              "size-3.5 sm:size-3 md:size-3 drop-shadow-md",
              isLight ? "text-gray-900" : "text-white",
            )}
          />
        </span>
      )}

      {/* Copy indicator - circle checkmark centered with blurred background */}
      {isCopied && (
        <>
          <span
            className={cn(
              "absolute inset-0 pointer-events-none rounded-lg",
              isFirst && "rounded-l-lg",
              isLast && "rounded-r-lg",
            )}
            style={{
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <CheckCircle2 className="size-4 sm:size-5 md:size-6 lg:size-7 drop-shadow-lg text-white" />
          </span>
        </>
      )}

      {/* Hover tooltip */}
      {!isCopied && (
        <span
          className={cn(
            "pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2",
            "whitespace-nowrap rounded-md bg-fd-popover px-2 py-1 text-xs text-fd-popover-foreground shadow-md",
            "opacity-0 transition-opacity group-hover:opacity-100",
            "border border-fd-border",
          )}
        >
          <Copy className="mr-1 inline-block size-3" />
          {formattedValue}
        </span>
      )}
    </button>
  );
}

export function ColorPalette({
  name,
  colors,
  description,
  defaultFormat = "hex",
  showFormatSelector = true,
  showExport = true,
  defaultShade = "50",
}: ColorPaletteProps) {
  const [selectedFormat, setSelectedFormat] =
    useState<ColorFormat>(defaultFormat);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // Sort colors by shade order
  const sortedShades = SHADE_ORDER.filter((shade) => shade in colors);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(null), 500);
  };

  const handleExport = (type: "css" | "tailwind" | "json") => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (type) {
      case "css":
        content = exportAsCssVariables(name, colors);
        filename = `${name}-colors.css`;
        mimeType = "text/css";
        break;
      case "tailwind":
        content = exportAsTailwindConfig(name, colors);
        filename = `${name}-tailwind.js`;
        mimeType = "text/javascript";
        break;
      case "json":
        content = exportAsJson(name, colors);
        filename = `${name}-colors.json`;
        mimeType = "application/json";
        break;
    }

    downloadFile(content, filename, mimeType);
  };

  const handleCopyExport = (type: "css" | "tailwind" | "json") => {
    let content: string;

    switch (type) {
      case "css":
        content = exportAsCssVariables(name, colors);
        break;
      case "tailwind":
        content = exportAsTailwindConfig(name, colors);
        break;
      case "json":
        content = exportAsJson(name, colors);
        break;
    }

    navigator.clipboard.writeText(content);
    setCopiedValue(`export-${type}`);
    setTimeout(() => setCopiedValue(null), 500);
  };

  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-card p-4">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold capitalize text-fd-foreground">
            {name.replace(/-/g, " ")}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-fd-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Format Selector */}
          {showFormatSelector && (
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({
                    color: "outline",
                    size: "sm",
                    className: "gap-1.5 text-xs",
                  }),
                )}
              >
                {FORMAT_OPTIONS.find((f) => f.value === selectedFormat)?.label}
                <ChevronDown className="size-3 text-fd-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent className="flex w-24 flex-col p-1">
                {FORMAT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedFormat(option.value)}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-left text-sm",
                      "hover:bg-fd-accent hover:text-fd-accent-foreground",
                      selectedFormat === option.value &&
                        "bg-fd-accent text-fd-accent-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* Export Button */}
          {showExport && (
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({
                    color: "outline",
                    size: "sm",
                    className: "gap-1.5 text-xs",
                  }),
                )}
              >
                <Download className="size-3" />
                Export
                <ChevronDown className="size-3 text-fd-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent className="flex w-48 flex-col p-1">
                {EXPORT_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyExport(option.value)}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-left text-sm",
                        "hover:bg-fd-accent hover:text-fd-accent-foreground",
                        "flex items-center gap-2",
                      )}
                    >
                      {copiedValue === `export-${option.value}` ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {option.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport(option.value)}
                      className={cn(
                        "rounded-md p-1.5",
                        "hover:bg-fd-accent hover:text-fd-accent-foreground",
                      )}
                      title={`Download ${option.filename}`}
                    >
                      <Download className="size-3.5" />
                    </button>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Color Swatches */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-11 gap-0">
        {sortedShades.map((shade, index) => (
          <ColorSwatch
            key={shade}
            shade={shade}
            hex={colors[shade]}
            name={name}
            format={selectedFormat}
            isFirst={index === 0}
            isLast={index === sortedShades.length - 1}
            isDefault={shade === defaultShade}
            copiedValue={copiedValue}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  );
}

export function ColorPaletteGroup({
  palettes,
  title,
  defaultFormat = "hex",
}: ColorPaletteGroupProps) {
  return (
    <div className="space-y-2">
      {title && (
        <h2 className="text-2xl font-bold text-fd-foreground">{title}</h2>
      )}
      {palettes.map((palette) => (
        <ColorPalette
          key={palette.name}
          name={palette.name}
          colors={palette.colors}
          description={palette.description}
          defaultFormat={defaultFormat}
          defaultShade={palette.defaultShade}
        />
      ))}
    </div>
  );
}
