import { useRef, useState } from "react";
import { Sparkles, Upload, FileText, Download, Loader2, Wand2, ShieldCheck, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractText } from "@/lib/fileExtract";
import { downloadDocx, downloadTxt } from "@/lib/exportFile";
import { ThemeToggle } from "@/components/ThemeToggle";

const TONES = ["Neutral", "Formal", "Casual", "Academic", "Simple"];
const STRENGTHS = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];
const LEVELS = [
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "expert", label: "Expert" },
];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Hindi", "Arabic", "Chinese", "Japanese"];

const Index = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("Neutral");
  const [strength, setStrength] = useState("medium");
  const [level, setLevel] = useState("college");
  const [language, setLanguage] = useState("English");
  const [fileName, setFileName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

  const handleFile = async (file: File) => {
    try {
      toast.loading("Reading file…", { id: "file" });
      const txt = await extractText(file);
      setInput(txt);
      setFileName(file.name.replace(/\.[^.]+$/, ""));
      toast.success("File loaded", { id: "file" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to read file", { id: "file" });
    }
  };

  const handleHumanize = async () => {
    if (!input.trim()) return toast.error("Please paste or upload some text first");
    setLoading(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("paraphrase", {
        body: { text: input, tone, strength, readingLevel: level, language },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setOutput((data as any).text ?? "");
      toast.success("Done — text humanized");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-6xl flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold leading-tight">Humanize</div>
              <div className="text-xs text-muted-foreground leading-tight">AI & plagiarism remover</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-[hsl(var(--success))]" />
              Format-preserving paraphraser
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl py-10 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Remove AI & plagiarism.
          <span className="block text-primary mt-2">Keep your meaning.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Paste text or upload a report, article, letter, or book. We rewrite it to sound human while preserving structure, facts, and intent.
        </p>
      </section>

      <main className="container max-w-6xl pb-20">
        {/* Controls */}
        <Card className="p-5 md:p-6 mb-6 shadow-soft">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Rewrite strength</Label>
              <Select value={strength} onValueChange={setStrength}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STRENGTHS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Reading level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Editor grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="p-5 shadow-soft flex flex-col">
            <Tabs defaultValue="paste" className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <TabsList>
                  <TabsTrigger value="paste"><FileText className="h-4 w-4 mr-1.5" />Paste</TabsTrigger>
                  <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-1.5" />Upload</TabsTrigger>
                </TabsList>
                <span className="text-xs text-muted-foreground">{wordCount(input)} words</span>
              </div>
              <TabsContent value="paste" className="flex-1 mt-0">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your report, article, essay, letter, or book chapter here…"
                  className="min-h-[360px] resize-none text-sm leading-relaxed"
                />
              </TabsContent>
              <TabsContent value="upload" className="flex-1 mt-0">
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFile(f);
                  }}
                  className="min-h-[360px] flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/40 transition-colors p-6"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="font-medium">Drop a file or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">.docx, .pdf, .txt — formatting preserved on export</p>
                  {fileName && <p className="mt-3 text-sm text-primary">Loaded: {fileName}</p>}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.docx,.pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleHumanize}
              disabled={loading || !input.trim()}
              className="mt-4 h-11 text-base"
              size="lg"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Humanizing…</> : <><Wand2 className="h-4 w-4 mr-2" />Humanize text</>}
            </Button>
          </Card>

          {/* Output */}
          <Card className="p-5 shadow-soft flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Humanized output</span>
              </div>
              <span className="text-xs text-muted-foreground">{wordCount(output)} words</span>
            </div>
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Your rewritten text will appear here…"
              className="min-h-[360px] resize-none text-sm leading-relaxed flex-1"
            />
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button variant="outline" disabled={!output} onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" disabled={!output} onClick={() => downloadTxt(output, fileName ?? "humanized")}>
                <Download className="h-4 w-4 mr-1.5" />.txt
              </Button>
              <Button variant="outline" disabled={!output} onClick={() => downloadDocx(output, fileName ?? "humanized")}>
                <Download className="h-4 w-4 mr-1.5" />.docx
              </Button>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {[
            { icon: ShieldCheck, title: "Bypasses AI detectors", desc: "Removes telltale AI patterns and rhythm." },
            { icon: FileText, title: "Format preserved", desc: "Paragraphs, lists, headings stay intact." },
            { icon: Wand2, title: "Meaning intact", desc: "Facts, numbers, and quotes are protected." },
          ].map((f) => (
            <Card key={f.title} className="p-5 shadow-soft">
              <f.icon className="h-5 w-5 text-primary mb-3" />
              <div className="font-semibold">{f.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{f.desc}</div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="container max-w-6xl py-6 text-center text-sm text-muted-foreground">
          Made by{" "}
          <a
            href="https://github.com/Anadi99"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Anadi99
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;