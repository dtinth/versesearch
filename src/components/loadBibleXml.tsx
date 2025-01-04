import { set } from "idb-keyval";
import { verseCount } from "../verseCount";

export type BibleType = "main" | "alt";

export async function loadBibleXml(type: BibleType = "main"): Promise<void> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xml";

  const file = await new Promise<File>((resolve, reject) => {
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) resolve(file);
      else reject(new Error("No file selected"));
    };
    input.click();
  });

  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/xml");

  const books: string[][][] = [];
  const bookElements = doc.querySelectorAll("book");
  const warnings: string[] = [];

  for (const book of bookElements) {
    const bookNum = parseInt(book.getAttribute("number") || "0");
    const chapters: string[][] = [];

    for (const chapter of book.querySelectorAll("chapter")) {
      const chapterNum = parseInt(chapter.getAttribute("number") || "0");
      const verses: string[] = [];

      for (const verse of chapter.querySelectorAll("verse")) {
        const verseNum = parseInt(verse.getAttribute("number") || "0");
        verses[verseNum - 1] = verse.textContent || "";
      }

      if (verses.length !== verseCount[bookNum]?.[chapterNum]) {
        const msg = `Expected chapter ${chapterNum} of book ${bookNum} to have ${verseCount[bookNum]?.[chapterNum]} verses, but found ${verses.length} verses`;
        warnings.push(msg);
      }

      chapters[chapterNum - 1] = verses;
    }

    const chapterCount = Object.keys(verseCount[bookNum] || {}).length;
    if (chapters.length !== chapterCount) {
      throw new Error(
        `Expected book ${bookNum} to have ${chapterCount} chapters, but found ${chapters.length} chapters`,
      );
    }

    books[bookNum - 1] = chapters;
  }

  if (warnings.length > 0) {
    if (
      !confirm(
        warnings.join("\n") + "\n\nPress OK to ignore, or Cancel to abort",
      )
    ) {
      throw new Error("Aborted due to warnings");
    }
  }

  for (let b = 0; b < books.length; b++) {
    const chapters = books[b];
    if (!chapters) continue;
    for (let c = 0; c < chapters.length; c++) {
      const verses = chapters[c];
      if (!verses) continue;
      await set(`bible-${type}:book${b + 1}:chapter${c + 1}`, verses);
    }
  }
  await set(`bible-${type}:filename`, file.name);
}
