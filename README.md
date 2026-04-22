# HumanizeA 

> Rewrite any text to sound human. Remove AI detection signals and plagiarism — while keeping your original meaning intact.

Built by [Anadi99](https://github.com/Anadi99)

---

## What it does

HumanizeA takes your text — whether it's an essay, report, article, or book chapter — and rewrites it to bypass AI detectors and plagiarism checkers. It preserves your structure, facts, numbers, and intent. Only the phrasing changes.

---

## Features

- **Paste or upload** — supports `.txt`, `.docx`, and `.pdf` files
- **Tone control** — Neutral, Formal, Casual, Academic, or Simple
- **Rewrite strength** — Light, Medium, or Heavy rewrite modes
- **Reading level** — School, College, or Expert
- **Multi-language output** — English, Spanish, French, German, Portuguese, Italian, Hindi, Arabic, Chinese, Japanese
- **Export results** — download as `.txt` or `.docx`
- **Format preserved** — paragraphs, headings, and lists stay intact
- **Dark / Light mode** — theme toggle built in
- **Word count** — live word count on both input and output

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase Edge Functions (Deno) |
| AI Model | Google Gemini (via AI gateway) |
| File parsing | mammoth (docx), pdfjs-dist (pdf) |
| Export | docx + file-saver |
| State / Data | TanStack Query |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An AI gateway API key set as `LOVABLE_API_KEY` in your Supabase Edge Function secrets

### Installation

```bash
git clone https://github.com/Anadi99/plag-proof-scribe.git
cd plag-proof-scribe
npm install
```

### Environment setup

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run locally

```bash
npm run dev
```

### Deploy the Edge Function

```bash
supabase functions deploy paraphrase
supabase secrets set LOVABLE_API_KEY=your_api_key
```

### Build for production

```bash
npm run build
```

---

## Project Structure

```
src/
├── pages/
│   └── Index.tsx          # Main app page
├── components/
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── fileExtract.ts     # PDF, DOCX, TXT parsing
│   └── exportFile.ts      # TXT and DOCX export
└── integrations/
    └── supabase/          # Supabase client + types

supabase/
└── functions/
    └── paraphrase/
        └── index.ts       # Edge function — AI rewriting logic
```

---

## How it works

1. User pastes text or uploads a file
2. Selects tone, strength, reading level, and output language
3. Hits **Humanize** — the text is sent to a Supabase Edge Function
4. The edge function calls the AI model with a carefully crafted system prompt
5. The rewritten text is returned and displayed
6. User can copy it or export as `.txt` / `.docx`

---

## License

MIT — free to use, modify, and distribute.

---

Made by [Anadi99](https://github.com/Anadi99)
