import { atom } from "nanostores";
import { usfmToBookNum } from "./usfmIdentifiers";
import { verseCount } from "./verseCount";

export const $targetVerse = atom<number | undefined>();

const $hash = atom(location.hash);
window.addEventListener("hashchange", () => {
  $hash.set(location.hash);
});

export const $route = atom<[number, number]>([43, 1]);
$hash.subscribe((hash) => {
  const match = hash.match(/^#(\w{3})(\d+)$/);
  if (match) {
    const book = usfmToBookNum[match[1].toUpperCase()];
    const chapter = parseInt(match[2]);
    if (book && verseCount[book]?.[chapter]) {
      $route.set([book, chapter]);
    }
  }
});
