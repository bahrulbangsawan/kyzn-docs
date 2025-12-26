import { getPageImage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/[...slug]'>,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        padding: '60px',
      }}
    >
      {/* KYZN Logo - text based */}
      <div
        style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.1em',
        }}
      >
        KYZN
      </div>
      
      {/* Content area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
          gap: '20px',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          {page.data.title}
        </div>
        
        {/* Description */}
        {page.data.description && (
          <div
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              lineHeight: 1.4,
              maxWidth: '800px',
            }}
          >
            {page.data.description}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div
        style={{
          fontSize: '18px',
          color: '#71717a',
        }}
      >
        docs.kyzn.life
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
