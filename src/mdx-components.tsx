import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Callout } from 'fumadocs-ui/components/callout';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    Step,
    Steps,
    Callout,
    img: (props) => props.src ? <ImageZoom {...(props as any)} /> : null,
    ...components,
  };
}
