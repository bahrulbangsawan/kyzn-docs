import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src="https://files.kyzn.life/brand/kyzn-logo-2.webp"
            alt="KYZN"
            width={24}
            height={24}
            className="block dark:hidden"
          />
          <Image
            src="https://files.kyzn.life/brand/kyzn-logo-1.webp"
            alt="KYZN"
            width={24}
            height={24}
            className="hidden dark:block"
          />
          <span>KYZN Docs</span>
        </>
      ),
    },
  };
}
