'use client';

import { usePathname } from 'next/navigation';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { Palette, Code, Lightbulb, BookOpen, Filter } from 'lucide-react';
import { SidebarTabs } from '@/components/sidebar-tabs';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import type { ReactNode } from 'react';

const tabs = [
  {
    title: 'Product Knowledge',
    description: 'Features and business logic',
    url: '/pd',
    icon: <Lightbulb />,
  },
  {
    title: 'Design System',
    description: 'UI components and styling guidelines',
    url: '/brand',
    icon: <Palette />,
  },
  {
    title: 'IT Development',
    description: 'Technical docs and integrations',
    url: '/it',
    icon: <Code />,
  },
  {
    title: 'Funnel',
    description: 'Funnel documentation and guides',
    url: '/funnel',
    icon: <Filter />,
  },
  {
    title: 'Tutorial',
    description: 'Guides and onboarding materials',
    url: '/tutorial',
    icon: <BookOpen />,
  },
];

interface DocsLayoutWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tree: any;
  baseOptions: BaseLayoutProps;
  children: ReactNode;
}

export function DocsLayoutWrapper({ tree, baseOptions, children }: DocsLayoutWrapperProps) {
  const pathname = usePathname();
  
  // Determine which section we're in based on pathname
  const getFilteredTree = () => {
    // Map pathname to folder URL prefix
    let targetUrlPrefix = '/pd'; // default to Product Knowledge
    
    if (pathname.startsWith('/brand')) {
      targetUrlPrefix = '/brand';
    } else if (pathname.startsWith('/it')) {
      targetUrlPrefix = '/it';
    } else if (pathname.startsWith('/funnel')) {
      targetUrlPrefix = '/funnel';
    } else if (pathname.startsWith('/tutorial')) {
      targetUrlPrefix = '/tutorial';
    }
    
    // Find the matching folder by checking the index URL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const folder = tree.children.find((node: any) => {
      if (node.type === 'folder' && node.index?.url) {
        return node.index.url.startsWith(targetUrlPrefix);
      }
      return false;
    });
    
    if (folder?.type === 'folder' && folder.children) {
      return {
        name: tree.name,
        children: folder.children,
      };
    }
    
    return tree;
  };

  return (
    <DocsLayout
      tree={getFilteredTree()}
      {...baseOptions}
      sidebar={{
        banner: <SidebarTabs tabs={tabs} />,
        tabs: false,
      }}
    >
      {children}
    </DocsLayout>
  );
}
