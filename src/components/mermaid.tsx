'use client';

import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export default function Mermaid({ chart }: { chart: string }): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderChart = async () => {
      if (!ref.current) return;

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        });

        const { svg } = await mermaid.render(
          `mermaid-${Math.random().toString(36).substring(7)}`,
          chart
        );
        
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid render error:', error);
      }
    };

    renderChart();
  }, [chart, resolvedTheme]);

  return (
    <div 
      className="my-4 flex justify-center"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
