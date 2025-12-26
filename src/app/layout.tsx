import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { AISearch, AISearchTrigger, AISearchPanel } from '@/components/search';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: 'KYZN Docs - %s',
    default: 'KYZN Docs',
  },
  icons: {
    icon: 'https://files.kyzn.life/brand/favicon.ico',
  },
  openGraph: {
    siteName: 'KYZN Docs',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <AISearch>
            {children}
            <AISearchTrigger />
            <AISearchPanel />
          </AISearch>
        </RootProvider>
      </body>
    </html>
  );
}
