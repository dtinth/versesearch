import { bookAbbreviations } from "./bookAbbreviations";
import { bookNames } from "./bookNames";
import { verseCount } from "./verseCount";

function isSubsequence(query: string, text: string): boolean {
  let j = 0;
  for (let i = 0; i < text.length && j < query.length; i++) {
    if (query[j] === text[i]) j++;
  }
  return j === query.length;
}

const recognizedAbbreviations = new Map<string, number>();
for (const [bookId, abbreviations] of Object.entries(bookAbbreviations)) {
  for (const abbreviation of abbreviations) {
    recognizedAbbreviations.set(abbreviation.toLowerCase(), parseInt(bookId));
  }
}

export function resolveVerse(
  query: string,
): [number, number, number] | undefined {
  if (!query) return undefined;

  // Parse query into components
  const match = query
    .toLowerCase()
    .match(/^(\d*\s*[a-z].+?)(?:(\d+)(?:\W*(\d+))?)?$/i);
  if (!match) return undefined;

  const [, bookQuery, chapter, verse] = match;
  const trimmedBookQuery = bookQuery.trim().toLowerCase();
  const requestedChapter = chapter ? parseInt(chapter) : 1;
  const requestedVerse = verse ? parseInt(verse) : 1;

  // Generate all possible candidates (1 to 66)
  const candidates = recognizedAbbreviations.has(trimmedBookQuery)
    ? new Set([recognizedAbbreviations.get(trimmedBookQuery)!])
    : new Set(Object.keys(bookNames).map((k) => parseInt(k)));

  // Eliminate based on book name match
  for (const bookId of candidates) {
    const bookName = bookNames[bookId].toLowerCase();
    const beginningNumber = bookName.match(/^\d+/)?.[0];
    if (beginningNumber && !trimmedBookQuery.startsWith(beginningNumber)) {
      candidates.delete(bookId);
    } else if (
      !isSubsequence(trimmedBookQuery, bookName) ||
      !bookName.startsWith(trimmedBookQuery.slice(0, 1))
    ) {
      candidates.delete(bookId);
    }
  }

  // Eliminate based on chapter bounds
  for (const bookId of candidates) {
    const maxChapters = Object.keys(verseCount[bookId]).length;
    if (requestedChapter < 1 || requestedChapter > maxChapters) {
      candidates.delete(bookId);
    }
  }

  // Eliminate based on verse bounds
  for (const bookId of candidates) {
    const maxVerses = verseCount[bookId][requestedChapter];
    if (requestedVerse < 1 || requestedVerse > maxVerses) {
      candidates.delete(bookId);
    }
  }

  // Return if exactly one candidate remains
  if (candidates.size === 1) {
    const [bookId] = candidates;
    return [bookId, requestedChapter, requestedVerse];
  }

  return undefined;
}

export function resolveVerseFromSpeech(
  speech: string,
): [number, number] | [number, number, number] | undefined {
  // Convert ordinal numbers to numeric
  const normalized = speech
    .toLowerCase()
    .replace(/1st|first/g, "1")
    .replace(/2nd|second/g, "2")
    .replace(/3rd|third/g, "3")
    .replace(/(\d)th/g, "$1");

  // Match patterns like "book chapter X verse Y" or "book chapter X"
  const match = normalized.match(
    /^(.*?)\s*(?:chapter\s+(\d+))(?:\s+verse\s+(\d+))?$/i,
  );
  if (!match) return undefined;

  const [, book, chapter, verse] = match;

  if (!verse) {
    const resolved = resolveVerse(`${book} ${chapter}`);
    if (!resolved) return undefined;
    return [resolved[0], resolved[1]];
  }

  const resolved = resolveVerse(`${book} ${chapter}:${verse}`);
  return resolved;
}
