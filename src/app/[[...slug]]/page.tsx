import { getPageImage, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { LLMCopyButton, ViewOptions } from '@/components/page-actions';
import { LastUpdate } from '@/components/last-update';

export default async function Page(props: PageProps<'/[[...slug]]'>) {
  const params = await props.params;
  const slug = params.slug;
  
  // Root path is handled by src/app/page.tsx
  if (!slug || slug.length === 0) notFound();
  
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      {page.data.category && (
        <p className="text-sm font-medium text-fd-primary mb-2">{page.data.category}</p>
      )}
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6 -mt-4">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          githubUrl={`https://github.com/kyzn-ai/docs/blob/main/content/docs/${page.slugs.join('/')}.mdx`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        <LastUpdate date={page.data.lastModified ?? new Date()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  if (!slug || slug.length === 0) return {};
  
  const page = source.getPage(slug);
  if (!page) notFound();

  const ogImage = getPageImage(page).url;

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: `KYZN Docs - ${page.data.title}`,
      description: page.data.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `KYZN Docs - ${page.data.title}`,
      description: page.data.description,
      images: [ogImage],
    },
  };
}
