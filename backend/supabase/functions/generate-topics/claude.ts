// Wrapper around the Anthropic Messages API with web_search tool enabled.
// Runs in Supabase's Deno runtime; all environment variables come from
// `supabase secrets set` set up in backend/README.md.

import Anthropic from 'npm:@anthropic-ai/sdk@^0.69.0';

const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
if (!apiKey) {
  console.warn('ANTHROPIC_API_KEY missing — generation will fail until you set it.');
}

export const anthropic = new Anthropic({ apiKey: apiKey ?? 'missing' });

// Latest Claude model with web search tool support at time of writing.
// Update if a newer Sonnet/Opus is available — keep version pinned for
// determinism in scheduled runs.
export const CLAUDE_MODEL = 'claude-sonnet-4-5';

interface CallOpts {
  system: string;
  user: string;
  enableWebSearch?: boolean;
  maxTokens?: number;
}

export async function callClaude({
  system,
  user,
  enableWebSearch = false,
  maxTokens = 4096,
}: CallOpts): Promise<string> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    tools: enableWebSearch
      ? [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 8,
          } as unknown as Anthropic.Tool,
        ]
      : undefined,
    messages: [{ role: 'user', content: user }],
  });

  // Stitch together text content from all blocks (web-search-augmented
  // responses interleave tool_use, tool_result, and text blocks).
  const text = response.content
    .map((block) => {
      if (block.type === 'text') return block.text;
      return '';
    })
    .join('\n')
    .trim();

  return text;
}

export function extractJson<T = unknown>(raw: string): T | null {
  // Tolerate the model emitting code fences or surrounding prose.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  // Try direct parse first; fall back to greedy match for the first
  // top-level brace span.
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match =
      cleaned.match(/\[[\s\S]*\]/) || cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}
