import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { DocsLayoutWrapper } from '@/components/docs-layout-wrapper';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <DocsLayoutWrapper tree={source.pageTree} baseOptions={baseOptions()}>
      {children}
    </DocsLayoutWrapper>
  );
}
