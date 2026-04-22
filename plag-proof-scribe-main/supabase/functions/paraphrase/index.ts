import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface Body {
  text: string;
  tone?: string;
  strength?: string;
  readingLevel?: string;
  language?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, tone = "neutral", strength = "medium", readingLevel = "college", language = "English" } = (await req.json()) as Body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const strengthGuide: Record<string, string> = {
      light: "Lightly rewrite — change only obvious AI-pattern phrases and a few word choices. Keep most original wording intact.",
      medium: "Moderately rewrite — restructure sentences, vary vocabulary, and break repetitive AI patterns while preserving meaning.",
      heavy: "Aggressively rewrite — fully reword sentences, vary structure, replace common AI phrases, and add natural human cadence. Keep meaning identical.",
    };

    const system = `You are a humanizer that rewrites text to remove AI-detection signals and plagiarism.

CRITICAL RULES:
1. Preserve the original document structure EXACTLY: keep all paragraph breaks, line breaks, headings, bullet/number lists, indentation, and blank lines as in the input.
2. Preserve the original meaning, facts, numbers, names, citations, and quotes (text inside "..." must not change).
3. Do NOT add commentary, preamble, explanations, or markdown fences. Output ONLY the rewritten text.
4. Do NOT translate unless the requested language differs from the source.
5. Use natural human cadence, mild imperfections, varied sentence length, and remove typical AI phrases ("delve", "in conclusion", "moreover", "it is important to note", "furthermore" overuse, etc.).

STYLE:
- Tone: ${tone}
- Reading level: ${readingLevel}
- Output language: ${language}
- Rewrite strength: ${strength} — ${strengthGuide[strength] ?? strengthGuide.medium}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const output: string = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ text: output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("paraphrase error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});