import { useStore } from "@nanostores/react";
import { get } from "idb-keyval";
import { atom } from "nanostores";
import { SnackbarProvider } from "notistack";
import { useEffect, useState } from "react";
import { bookNames } from "../bookNames";
import { $route, $targetVerse } from "../routing";
import { $colorMode } from "../settings";
import { verseCount } from "../verseCount";
import { Commander } from "./Commander";
import classes from "./Searcher.module.css";
import type { BibleType } from "./loadBibleXml";

export function Searcher() {
  const [book, chapter] = useStore($route);
  return (
    <>
      <SnackbarProvider />
      <ColorMode />
      <Commander />
      <Chapter book={book} chapter={chapter} />
    </>
  );
}

function ColorMode() {
  const colorMode = useStore($colorMode);
  useEffect(() => {
    document.documentElement.dataset.colorMode = colorMode;
  });
  return null;
}

interface LoadedData {
  book: number;
  chapter: number;
  verses: {
    main: Record<string, string>;
    alt: Record<string, string>;
  };
}

export function Chapter(props: { book: number; chapter: number }) {
  const { book, chapter } = props;
  const verses = verseCount[book]?.[chapter] || 0;
  const [$data] = useState(() => atom<LoadedData | undefined>());
  const data = useStore($data);
  useEffect(() => {
    let canceled = false;
    const loadChapter = async (type: BibleType) => {
      const key = `bible-${type}:book${book}:chapter${chapter}`;
      const verses = await get(key);
      return Object.fromEntries(
        verses?.map((text: string, i: number) => [`${i + 1}`, text]) || [],
      );
    };
    const load = async () => {
      const [main, alt] = await Promise.all([
        loadChapter("main"),
        loadChapter("alt"),
      ]);
      if (canceled) return;
      $data.set({ book, chapter, verses: { main, alt } });
    };
    load();
    return () => {
      canceled = true;
    };
  }, [book, chapter, $data]);
  const targetVerse = useStore($targetVerse);
  useEffect(() => {
    if (!data) return;
    if (!targetVerse) return;
    console.log(targetVerse);
    const found = document.querySelector<HTMLDivElement>(
      `[data-verse="${targetVerse}"]`,
    );
    if (found && data.book === book && data.chapter === chapter) {
      found.scrollIntoView({ behavior: "smooth", block: "center" });
      found.classList.add(classes.targetVerse);
      setTimeout(() => {
        found.classList.remove(classes.targetVerse);
      }, 1000);
      $targetVerse.set(undefined);
    }
  }, [book, chapter, data, targetVerse]);
  return (
    <div style={{ paddingBottom: "50vh" }}>
      <h1 className={classes.chapterTitle}>
        {bookNames[book]} {chapter}
      </h1>
      <PageTitle title={`${bookNames[book]} ${chapter}`} />
      <div className={classes.verses}>
        {data
          ? Array.from({ length: verses }, (_, i) => {
              const verseNum = i + 1;
              const text = data.verses.main[verseNum] || "";
              const altText = data.verses.alt[verseNum] || "";
              return (
                <Verse key={i} verse={verseNum} text={text} altText={altText} />
              );
            })
          : "Loading…"}
      </div>
    </div>
  );
}

function Verse(props: { verse: number; text: string; altText: string }) {
  return (
    <div className={classes.verse} data-verse={props.verse}>
      <span className={classes.verseNumber}>{props.verse}</span>
      <span className={classes.verseText}>
        <span className={classes.mainText}>{props.text}</span>
        <span className={classes.altText}>{props.altText}</span>
      </span>
    </div>
  );
}

function PageTitle(props: { title: string }) {
  useEffect(() => {
    document.title = props.title;
  }, [props.title]);
  return null;
}
