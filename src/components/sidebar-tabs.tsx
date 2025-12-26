'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface TabItem {
  title: string;
  description: string;
  url: string;
  icon: ReactNode;
}

interface SidebarTabsProps {
  tabs: TabItem[];
}

export function SidebarTabs({ tabs }: SidebarTabsProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find current tab - handle root URL specially
  const currentTab = tabs.find((tab) => {
    if (tab.url === '/') {
      // Root tab is active for / or /pd paths
      return pathname === '/' || pathname.startsWith('/pd');
    }
    return pathname.startsWith(tab.url);
  }) || tabs[0];

  const isTabActive = (tab: TabItem) => {
    if (tab.url === '/') {
      return pathname === '/' || pathname.startsWith('/pd');
    }
    return pathname.startsWith(tab.url);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative mb-2" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-lg border border-fd-border bg-fd-card p-3 text-left transition-colors hover:bg-fd-accent"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-fd-muted text-fd-muted-foreground [&>svg]:size-4">
          {currentTab.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-fd-foreground text-sm">{currentTab.title}</div>
          <div className="text-xs text-fd-muted-foreground truncate">{currentTab.description}</div>
        </div>
        <ChevronDown className={`size-4 shrink-0 text-fd-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-fd-border bg-fd-popover p-1.5 shadow-lg">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const isActive = isTabActive(tab);
              return (
                <Link
                  key={tab.url}
                  href={tab.url}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-md p-2.5 transition-colors ${
                    isActive ? 'bg-fd-accent' : 'hover:bg-fd-accent/50'
                  }`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-fd-muted text-fd-muted-foreground [&>svg]:size-4">
                    {tab.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-fd-foreground text-sm">{tab.title}</div>
                    <div className="text-xs text-fd-muted-foreground">{tab.description}</div>
                  </div>
                  {isActive && <Check className="size-4 shrink-0 text-fd-primary" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
