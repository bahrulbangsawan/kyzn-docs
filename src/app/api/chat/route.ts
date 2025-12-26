import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { convertToModelMessages, streamText } from 'ai';
import { getLLMText, source } from '@/lib/source';

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }
  
  return createOpenAICompatible({
    name: 'openrouter',
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  });
}

// Cache the docs content with page info
// Using a Map to support multiple concurrent requests in serverless environments
const docsCacheMap = new Map<string, Promise<{ content: string; pages: { title: string; url: string; description?: string }[] }>>();

async function getDocsContent() {
  const cacheKey = 'docs-content';
  
  // Check if there's already a pending request
  const existingPromise = docsCacheMap.get(cacheKey);
  if (existingPromise) {
    return existingPromise;
  }
  
  // Create a new promise for fetching docs
  const promise = (async () => {
    const pages = source.getPages();
    const texts = await Promise.all(pages.map(getLLMText));
    
    const pageInfo = pages.map(page => ({
      title: page.data.title,
      url: page.url,
      description: page.data.description,
    }));
    
    return {
      content: texts.join('\n\n---\n\n'),
      pages: pageInfo,
    };
  })();
  
  docsCacheMap.set(cacheKey, promise);
  
  // Clean up the cache after a reasonable time (5 minutes)
  setTimeout(() => {
    docsCacheMap.delete(cacheKey);
  }, 5 * 60 * 1000);
  
  return promise;
}

export async function POST(req: Request) {
  try {
    const reqJson = await req.json();
    
    if (!reqJson || !Array.isArray(reqJson.messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const openrouter = getOpenRouterClient();
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
