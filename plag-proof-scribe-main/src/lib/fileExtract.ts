import mammoth from "mammoth";

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || file.type === "text/plain") {
    return await file.text();
  }
  if (name.endsWith(".docx")) {
    const buf = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    return value;
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    // dynamic import to avoid bundling worker eagerly
    const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
    // Use CDN worker matching installed version
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data }).promise;
    let out = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let lastY: number | null = null;
      let line = "";
      const lines: string[] = [];
      for (const item of content.items as any[]) {
        const y = item.transform?.[5];
        if (lastY !== null && y !== lastY) {
          lines.push(line.trimEnd());
          line = "";
        }
        line += item.str;
        if (item.hasEOL) {
          lines.push(line.trimEnd());
          line = "";
        }
        lastY = y;
      }
      if (line) lines.push(line);
      out += lines.join("\n") + "\n\n";
    }
    return out.trim();
  }
  throw new Error("Unsupported file type. Use .txt, .docx, or .pdf");
}