/**
 * Color utility functions for format conversion and export
 */

export type ColorFormat = 'hex' | 'oklch' | 'rgb' | 'hsl';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface OKLCH {
  l: number;
  c: number;
  h: number;
}

/**
 * Convert HEX color to RGB values
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex)
    ? hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    : null;
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert sRGB component to linear RGB
 */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Convert RGB to OKLCH color space
 */
export function rgbToOklch(r: number, g: number, b: number): OKLCH {
  // Convert to linear sRGB
  const linearR = srgbToLinear(r / 255);
  const linearG = srgbToLinear(g / 255);
  const linearB = srgbToLinear(b / 255);

  // Convert to OKLab via LMS
  const l_ =
    0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB;
  const m_ =
    0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB;
  const s_ =
    0.0883024619 * linearR + 0.2817188376 * linearG + 0.6299787005 * linearB;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  // Convert OKLab to OKLCH
  const C = Math.sqrt(a * a + b2 * b2);
  let H = (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return {
    l: Math.round(L * 1000) / 1000,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(H * 10) / 10,
  };
}

/**
 * Format a HEX color to the specified format
 */
export function formatColor(hex: string, format: ColorFormat): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex.toUpperCase();

  switch (format) {
    case 'hex':
      return hex.toUpperCase();
    case 'rgb':
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'hsl': {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case 'oklch': {
      const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
      return `oklch(${oklch.l} ${oklch.c} ${oklch.h})`;
    }
    default:
      return hex.toUpperCase();
  }
}

/**
 * Determine if a color is light (for text contrast)
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  // Calculate relative luminance using sRGB coefficients
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Export color palette as CSS custom properties
 */
export function exportAsCssVariables(
  name: string,
  colors: Record<string, string>
): string {
  const lines = [':root {'];
  for (const [shade, hex] of Object.entries(colors)) {
    lines.push(`  --color-${name}-${shade}: ${hex};`);
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Export color palette as Tailwind CSS config
 */
export function exportAsTailwindConfig(
  name: string,
  colors: Record<string, string>
): string {
  const colorObj = JSON.stringify(colors, null, 4)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '        ' + line))
    .join('\n');

  return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${name}': ${colorObj}
      }
    }
  }
}`;
}

/**
 * Export color palette as JSON
 */
export function exportAsJson(
  name: string,
  colors: Record<string, string>
): string {
  return JSON.stringify({ [name]: colors }, null, 2);
}

/**
 * Trigger a file download in the browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
