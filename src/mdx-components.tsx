import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Callout } from 'fumadocs-ui/components/callout';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { ColorPalette, ColorPaletteGroup } from '@/components/color-palette';
import { TypographyShowcase } from '@/components/typography-showcase';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    Step,
    Steps,
    Callout,
    ColorPalette,
    ColorPaletteGroup,
    TypographyShowcase,
    img: (props) => props.src ? <ImageZoom {...(props as any)} /> : null,
    ...components,
  };
}
