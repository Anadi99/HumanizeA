import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export function downloadTxt(text: string, baseName = "humanized") {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${baseName}.txt`);
}

export async function downloadDocx(text: string, baseName = "humanized") {
  const paragraphs = text.split(/\n/).map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line, font: "Calibri", size: 24 })],
      })
  );
  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 24 } } } },
    sections: [{ children: paragraphs }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${baseName}.docx`);
}