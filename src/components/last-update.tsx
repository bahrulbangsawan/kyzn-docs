'use client';

import { Calendar } from 'lucide-react';

interface LastUpdateProps {
  date: Date | string;
}

export function LastUpdate({ date }: LastUpdateProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formatted = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mt-12 pt-6 border-t border-fd-border">
      <div className="flex items-center gap-2 text-sm text-fd-muted-foreground">
        <Calendar className="size-4" />
        <span>Last Update: {formatted}</span>
      </div>
    </div>
  );
}
