import { atom } from "nanostores";
import { usfmToBookNum } from "./usfmIdentifiers";
import { verseCount } from "./verseCount";

export const $targetVerse = atom<number | undefined>();

const $hash = atom(location.hash);
window.addEventListener("hashchange", () => {
  $hash.set(location.hash);
});

function getInitialRoute(): [number, number] {
  const lastRoute = localStorage.getItem("lastRoute");
  if (lastRoute) {
    const parts = lastRoute.split(".");
    const book = parseInt(parts[0]);
    const chapter = parseInt(parts[1]);
    if (book && chapter && verseCount[book]?.[chapter]) {
      return [book, chapter];
    }
  }
  return [43, 1];
}

export const $route = atom<[number, number]>(getInitialRoute());
$hash.subscribe((hash) => {
  const match = hash.match(/^#(\w{3})(\d+)$/);
  if (match) {
    const book = usfmToBookNum[match[1].toUpperCase()];
    const chapter = parseInt(match[2]);
    if (book && verseCount[book]?.[chapter]) {
      $route.set([book, chapter]);
      localStorage.setItem("lastRoute", `${book}.${chapter}`);
    }
  }
});
