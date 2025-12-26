'use client';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ArrowRight, Bot, Check, Copy, ExternalLink, FileText, Loader2, MessageCircleIcon, RefreshCw, Send, User, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { buttonVariants } from './ui/button';
import Link from 'fumadocs-core/link';
import { type UIMessage, useChat, type UseChatHelpers } from '@ai-sdk/react';
import type { ProvideLinksToolSchema } from '../lib/inkeep-qa-schema';
import type { z } from 'zod';
import { DefaultChatTransport } from 'ai';
import { Markdown } from './markdown';
import { Presence } from '@radix-ui/react-presence';

export const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<UIMessage>;
} | null>(null);

function useChatContext() {
  return use(Context)!.chat;
}

function Header() {
  const { setOpen } = use(Context)!;

  return (
    <div 
      className="flex-shrink-0 flex items-start gap-2 bg-fd-popover pb-2 pt-3 px-3 sm:px-4"
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="flex-1 p-3 border rounded-xl bg-fd-card text-fd-card-foreground">
        <div className="flex items-center gap-2">
          <Bot className="size-4" />
          <p className="text-sm font-medium">Ask RuBot</p>
        </div>
      </div>
      <button
        aria-label="Close"
        tabIndex={-1}
        className={cn(
          buttonVariants({
            size: 'icon-sm',
            color: 'secondary',
            className: 'rounded-full',
          }),
        )}
        onClick={() => setOpen(false)}
      >
        <X />
      </button>
    </div>
  );
}

function SearchAIActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === 'streaming';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              size: 'sm',
              className: 'rounded-full gap-1.5',
            }),
          )}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          Retry
        </button>
      )}
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: 'secondary',
            size: 'sm',
            className: 'rounded-full',
          }),
        )}
        onClick={() => setMessages([])}
      >
        Clear Chat
      </button>
    </>
  );
}

const StorageKeyInput = '__ai_search_input';
function SearchAIInput(props: ComponentProps<'form'>) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState('');
  const isLoading = status === 'streaming' || status === 'submitted';
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(StorageKeyInput);
      if (saved) setInput(saved);
    } catch (error) {
      // localStorage may not be available in some environments
      console.warn('Failed to load from localStorage:', error);
    }
  }, []);
  
  // Save to localStorage when input changes
  useEffect(() => {
    try {
      localStorage.setItem(StorageKeyInput, input);
    } catch (error) {
      // localStorage may not be available in some environments
      console.warn('Failed to save to localStorage:', error);
    }
  }, [input]);
  
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    void sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus();
  }, [isLoading]);

  return (
    <form
      {...props}
      className={cn('flex items-center gap-2 w-full', props.className)}
      onSubmit={onStart}
    >
      <Input
        id="nd-ai-input"
        value={input}
        placeholder={isLoading ? 'AI is answering...' : 'Ask a question'}
        autoFocus
        className="flex-1 p-3 min-w-0 w-full"
        disabled={status === 'streaming' || status === 'submitted'}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              className: 'transition-all rounded-full gap-2 flex-shrink-0',
            }),
          )}
          onClick={stop}
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          <span className="hidden sm:inline">Abort</span>
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className={cn(
            buttonVariants({
              color: 'secondary',
              className: 'transition-all rounded-full flex-shrink-0',
            }),
          )}
          disabled={input.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn(
        'fd-scroll-container overflow-y-auto min-w-0 flex flex-col',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<'textarea'>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('col-start-1 row-start-1 text-sm', props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          'resize-none bg-transparent placeholder:text-fd-muted-foreground placeholder:text-sm focus-visible:outline-none',
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, 'break-all invisible')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: 'User',
  assistant: 'RuBot',
};

// Parse references from the AI response
function parseReferences(text: string): { content: string; references: { title: string; url: string }[] } {
  const refMatch = text.match(/\[\[REFERENCES\]\]([\s\S]*?)\[\[\/REFERENCES\]\]/);
  
  if (!refMatch) {
    return { content: text, references: [] };
  }
  
  const content = text.replace(/\[\[REFERENCES\]\][\s\S]*?\[\[\/REFERENCES\]\]/, '').trim();
  const refBlock = refMatch[1];
  const references: { title: string; url: string }[] = [];
  
  const lines = refBlock.split('\n').filter(line => line.trim());
  for (const line of lines) {
    const match = line.match(/Title:\s*(.+?)\s*\|\s*URL:\s*(.+)/);
    if (match) {
      references.push({ title: match[1].trim(), url: match[2].trim() });
    }
  }
  
  return { content, references };
}

function ReferenceLinks({ references }: { references: { title: string; url: string }[] }) {
  if (references.length === 0) return null;
  
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-fd-muted-foreground flex items-center gap-1.5">
        <FileText className="size-3" />
        Related Documentation
      </p>
      <div className="flex flex-col gap-1.5">
        {references.map((ref, i) => (
          <Link
            key={i}
            href={ref.url}
            className="group flex items-center gap-2 rounded-lg border bg-fd-card p-2.5 text-sm transition-colors hover:bg-fd-accent hover:border-fd-accent"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-fd-primary/10 text-fd-primary">
              <ExternalLink className="size-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-fd-foreground truncate">{ref.title}</p>
              <p className="text-xs text-fd-muted-foreground truncate">{ref.url}</p>
            </div>
            <ArrowRight className="size-4 text-fd-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Message({
  message,
  ...props
}: { message: UIMessage } & ComponentProps<'div'>) {
  const [copied, setCopied] = useState(false);
  let markdown = '';
  let links: z.infer<typeof ProvideLinksToolSchema>['links'] = [];

  for (const part of message.parts ?? []) {
    if (part.type === 'text') {
      markdown += part.text;
      continue;
    }

    if (part.type === 'tool-provideLinks' && part.input) {
      links = (part.input as z.infer<typeof ProvideLinksToolSchema>).links;
    }
  }

  // Parse references from the markdown
  const { content: cleanMarkdown, references } = message.role === 'assistant' 
    ? parseReferences(markdown) 
    : { content: markdown, references: [] };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cleanMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div {...props}>
      <div className="flex items-center gap-1.5 mb-1">
        {message.role === 'assistant' ? (
          <Bot className="size-4 text-fd-primary" />
        ) : (
          <User className="size-4 text-fd-muted-foreground" />
        )}
        <p
          className={cn(
            'text-sm font-medium text-fd-muted-foreground',
            message.role === 'assistant' && 'text-fd-primary',
          )}
        >
          {roleName[message.role] ?? 'unknown'}
        </p>
      </div>
      <div className="prose text-sm">
        <Markdown text={cleanMarkdown} />
      </div>
      <ReferenceLinks references={references} />
      {links && links.length > 0 && (
        <div className="mt-2 flex flex-row flex-wrap items-center gap-1">
          {links.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className="block text-xs rounded-lg border p-3 hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-fd-muted-foreground">Reference {item.label}</p>
            </Link>
          ))}
        </div>
      )}
      {cleanMarkdown && (
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            buttonVariants({
              color: 'ghost',
              size: 'sm',
              className: 'mt-2 gap-1.5 text-xs text-fd-muted-foreground hover:text-fd-foreground',
            }),
          )}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      )}
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>
      {children}
    </Context>
  );
}

export function AISearchTrigger() {
  const { open, setOpen } = use(Context)!;

  return (
    <button
      className={cn(
        buttonVariants({
          variant: 'secondary',
        }),
        'fixed bottom-4 gap-3 w-24 end-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] text-fd-muted-foreground rounded-2xl shadow-lg z-20 transition-[translate,opacity]',
        open && 'translate-y-10 opacity-0',
      )}
      onClick={() => setOpen(true)}
    >
      <MessageCircleIcon className="size-4.5" />
      Ask AI
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = use(Context)!;
  const chat = useChatContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, []);

  return (
    <>
      <Presence present={open}>
        <div
          data-state={open ? 'open' : 'closed'}
          className="fixed inset-0 z-[60] backdrop-blur-xs bg-fd-overlay data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out"
          onClick={() => setOpen(false)}
        />
      </Presence>
      <Presence present={open}>
        <div
          className={cn(
            'fixed left-0 right-0 top-0 bottom-0 z-[60] overflow-hidden bg-fd-popover text-fd-popover-foreground border-0 rounded-none shadow-xl',
            'sm:left-auto sm:right-4 sm:top-20 sm:bottom-4 sm:rounded-2xl sm:border sm:w-[400px] xl:w-[460px]',
            'pb-safe sm:pb-0',
            open
              ? 'animate-fd-dialog-in'
              : 'animate-fd-dialog-out',
          )}
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
          }}
        >
          <div className="flex flex-col h-full w-full overflow-hidden">
            <Header />
            <List
              className="px-3 py-4 flex-1 min-h-0 overscroll-contain sm:px-4"
              style={{
                maskImage:
                  'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
              }}
            >
              <div className="flex flex-col gap-4">
                {chat.messages
                  .filter((msg) => msg.role !== 'system')
                  .map((item) => (
                    <Message key={item.id} message={item} />
                  ))}
              </div>
            </List>
            <div 
              className="flex-shrink-0 border-t bg-fd-popover px-3 py-3 sm:px-4 sm:py-4 relative z-10"
              style={{
                paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
                minHeight: 'auto',
              }}
            >
              <div className="rounded-xl border bg-fd-card text-fd-card-foreground has-focus-visible:ring-2 has-focus-visible:ring-fd-ring p-3 shadow-lg">
                <SearchAIInput />
                <div className="flex items-center gap-1.5 pt-2 empty:hidden">
                  <SearchAIActions />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Presence>
    </>
  );
}
