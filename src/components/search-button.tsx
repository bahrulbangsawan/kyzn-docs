'use client';

import { Search } from 'lucide-react';
import { use } from 'react';
import { Context } from './search';

export function SearchButton() {
  const context = use(Context);
  if (!context) return null;
  
  const { setOpen } = context;
  
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 rounded-lg border bg-fd-secondary px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground sm:w-[200px] md:w-[240px]"
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Search docs...</span>
      <kbd className="ml-auto hidden rounded border bg-fd-background px-1.5 py-0.5 text-xs sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}

