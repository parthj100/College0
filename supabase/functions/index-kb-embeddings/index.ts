import { createClient } from 'npm:@supabase/supabase-js@2.46.1';

// Idempotent KB indexer. Reads kb_docs rows with embedding IS NULL and fills
// them in using OpenAI's text-embedding-3-small (1536-d, matches the schema).
// No-op (returns 0 indexed) if OPENAI_API_KEY isn't set, so it's safe to deploy
// before keys are configured. Once an embedding model exists, the ai-query
// function's vector branch lights up.

async function embed(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.data?.[0]?.embedding ?? [];
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        message: 'POST to index any kb_docs with NULL embeddings.',
        configured: !!Deno.env.get('OPENAI_API_KEY'),
      }),
      { headers: { 'content-type': 'application/json' } },
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({
      indexed: 0,
      skipped: 'OPENAI_API_KEY not set — indexer is a no-op until configured.',
    }), { headers: { 'content-type': 'application/json' } });
  }

  const { data: docs, error } = await supabase
    .from('kb_docs')
    .select('id, title, body')
    .is('embedding', null);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }

  let indexed = 0;
  const failures: { id: number; err: string }[] = [];
  for (const d of docs ?? []) {
    try {
      const vec = await embed(`${d.title}\n\n${d.body}`, apiKey);
      const { error: upErr } = await supabase
        .from('kb_docs')
        .update({ embedding: vec })
        .eq('id', d.id);
      if (upErr) failures.push({ id: d.id, err: upErr.message });
      else indexed++;
    } catch (e) {
      failures.push({ id: d.id, err: e instanceof Error ? e.message : String(e) });
    }
  }

  return new Response(JSON.stringify({ indexed, failures }), {
    headers: { 'content-type': 'application/json' },
  });
});
