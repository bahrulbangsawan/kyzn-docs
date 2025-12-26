import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { convertToModelMessages, streamText } from 'ai';
import { getLLMText, source } from '@/lib/source';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Cache the docs content with page info
let docsCache: { content: string; pages: { title: string; url: string; description?: string }[] } | null = null;

async function getDocsContent() {
  if (docsCache) return docsCache;
  
  const pages = source.getPages();
  const texts = await Promise.all(pages.map(getLLMText));
  
  const pageInfo = pages.map(page => ({
    title: page.data.title,
    url: page.url,
    description: page.data.description,
  }));
  
  docsCache = {
    content: texts.join('\n\n---\n\n'),
    pages: pageInfo,
  };
  
  return docsCache;
}

export async function POST(req: Request) {
  const reqJson = await req.json();

  try {
    const { content: docsContent, pages } = await getDocsContent();
    
    // Create a list of available pages for the AI to reference
    const pageList = pages.map(p => `- "${p.title}" (${p.url})`).join('\n');
    
    const result = streamText({
      model: openrouter('google/gemini-2.0-flash-001'),
      system: `You are RuBot, a documentation assistant for KYZN Docs.

RESPONSE FORMAT RULES:
- Answer in bullet points. Short, clear, direct.
- No emojis, filler, hype, politeness, transitions, or call-to-actions.
- No questions, offers, suggestions, or motivational content.
- Do not mirror user tone, mood, or diction.
- Address only the cognitive core of the request.

GREETING HANDLING:
- For greetings like "Halo", "Hi", "Hello", respond with: "RuBot ready. Ask about KYZN documentation."
- Do NOT include [[REFERENCES]] for greetings.

CONTENT RULES:
1. ONLY answer based on the documentation provided below.
2. If the answer is not in the documentation, say "Information not available in documentation." (no references needed)
3. Do NOT hallucinate or make up information.
4. ONLY include [[REFERENCES]] when you actually reference documentation pages in your answer.
5. Reference format (only when applicable):
   [[REFERENCES]]
   - Title: <page title> | URL: <page url>
   [[/REFERENCES]]

AVAILABLE PAGES:
${pageList}

DOCUMENTATION:
${docsContent}`,
      messages: await convertToModelMessages(reqJson.messages, {
        ignoreIncompleteToolCalls: true,
      }),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
