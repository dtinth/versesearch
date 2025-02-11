import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { $route } from '../routing';
import { usfmIdentifiers } from '../usfmIdentifiers';
import { verseCount } from '../verseCount';
import classes from './ChapterSelector.module.css';

const OT_BOOKS = Array.from({ length: 39 }, (_, i) => i + 1);
const NT_BOOKS = Array.from({ length: 27 }, (_, i) => i + 40);

export const ChapterSelector = (props: { open: boolean; onClose?: () => void }) => {
  const [currentBook, currentChapter] = useStore($route);

  useEffect(() => {
    if (!props.open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [props.open, props.onClose]);

  const handleBookSelect = (book: number) => {
    location.hash = `#${usfmIdentifiers[book]}1`;
  };

  const handleChapterSelect = (chapter: number) => {
    location.hash = `#${usfmIdentifiers[currentBook]}${chapter}`;
    props.onClose?.();
  };

  const maxChapters = currentBook ? Object.keys(verseCount[currentBook]).length : 0;
  const chapters = Array.from({ length: Math.max(150, maxChapters) }, (_, i) => i + 1);

  return (
    <div className={classes.popup} data-open={props.open}>
      <section>
        <div className={classes.grid}>
          {OT_BOOKS.map((book) => (
            <button
              key={book}
              className={classes.button}
              data-selected={book === currentBook}
              onClick={() => handleBookSelect(book)}
            >
              {usfmIdentifiers[book]}
            </button>
          ))}
        </div>
        <div className={classes.grid}>
          {NT_BOOKS.map((book) => (
            <button
              key={book}
              className={classes.button}
              data-selected={book === currentBook}
              onClick={() => handleBookSelect(book)}
            >
              {usfmIdentifiers[book]}
            </button>
          ))}
        </div>
      </section>

      <div className={classes.separator} />

      <section>
        <div className={classes.grid}>
          {chapters.map((chapter) => (
            <button
              key={chapter}
              className={classes.button}
              data-selected={chapter === currentChapter}
              data-disabled={chapter > maxChapters}
              disabled={chapter > maxChapters}
              onClick={() => handleChapterSelect(chapter)}
            >
              {chapter}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
