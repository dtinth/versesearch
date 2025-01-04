import { useStore } from "@nanostores/react";
import { Command } from "cmdk";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { bookNames } from "../bookNames";
import { resolveVerse, resolveVerseFromSpeech } from "../resolveVerse";
import { $route, $targetVerse } from "../routing";
import { $colorMode } from "../settings";
import { usfmIdentifiers } from "../usfmIdentifiers";
import { verseCount } from "../verseCount";
import "./Commander.scss";
import { loadBibleXml, type BibleType } from "./loadBibleXml";

import { Icon } from "@iconify-icon/react";
import menuIcon from "@iconify-icons/codicon/menu";
import micIcon from "@iconify-icons/codicon/mic";
import micFilledIcon from "@iconify-icons/codicon/mic-filled";
import { $listening, toggleVoiceSearch } from "../speech";
import { Toolbar } from "./Toolbar";

function goTo(found: [number, number, number] | [number, number]) {
  if ($route.get().join(",") !== found.slice(0, 2).join(",")) {
    location.hash = `#${usfmIdentifiers[found[0]]}${found[1]}`;
  }
  if (found.length === 3) {
    $targetVerse.set(found[2]);
  }
}

function formatChapter(ref: [number, number]) {
  return `${bookNames[ref[0]]} ${ref[1]}`;
}

function getNextChapter(chap: [number, number]): [number, number] | undefined {
  const [book, chapter] = chap;
  if (chapter < Object.keys(verseCount[book]).length) {
    return [book, chapter + 1];
  } else if (book < Object.keys(verseCount).length) {
    return [book + 1, 1];
  }
  return undefined;
}

function getPreviousChapter(
  chap: [number, number],
): [number, number] | undefined {
  const [book, chapter] = chap;
  if (chapter > 1) {
    return [book, chapter - 1];
  } else if (book > 1) {
    const prevBook = book - 1;
    const lastChapter = Object.keys(verseCount[prevBook]).length;
    return [prevBook, lastChapter];
  }
  return undefined;
}

export const Commander = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const currentChapter = useStore($route);
  const found = useMemo(
    () => resolveVerse(search, currentChapter),
    [search, currentChapter],
  );

  const clear = () => {
    setSearch("");
    setOpen(false);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLoadXml = async (type: BibleType = "main") => {
    try {
      await loadBibleXml(type);
      enqueueSnackbar(
        `Bible XML loaded successfully${type === "alt" ? " as alternate version" : ""}`,
        {
          variant: "success",
        },
      );
      setOpen(false);
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Failed to load Bible XML",
        { variant: "error" },
      );
    }
  };

  const currentRef = currentChapter
    ? ([currentChapter[0], currentChapter[1]] as [number, number])
    : undefined;
  const nextChapter = currentRef ? getNextChapter(currentRef) : undefined;
  const prevChapter = currentRef ? getPreviousChapter(currentRef) : undefined;

  const colorMode = useStore($colorMode);
  const oppositeColorMode = colorMode === "light" ? "dark" : "light";
  const toggleColorMode = () => {
    $colorMode.set(oppositeColorMode);
    clear();
  };

  return (
    <>
      <Toolbar>
        <button onClick={() => setOpen(true)}>
          <Icon icon={menuIcon} />
        </button>
        <SpeechConnector>
          {({ listen, listening }) => (
            <button onClick={() => listen()}>
              <SpeechHotkey onTrigger={() => listen()} />
              <Icon icon={listening ? micFilledIcon : micIcon} />
            </button>
          )}
        </SpeechConnector>
      </Toolbar>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
      >
        <Command.Input value={search} onValueChange={setSearch} />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>

          <Command.Group heading="Navigation">
            <Command.Item
              onSelect={() => found && (goTo(found), clear())}
              keywords={[search]}
              disabled={!found}
            >
              {found
                ? `Go to ${bookNames[found[0]]} ${found[1]}:${found[2]}`
                : "Type a verse reference to go to"}
            </Command.Item>
            {nextChapter && (
              <Command.Item
                onSelect={() => {
                  goTo([nextChapter[0], nextChapter[1], 1]);
                  clear();
                }}
              >
                Next chapter: {formatChapter(nextChapter)}
              </Command.Item>
            )}
            {prevChapter && (
              <Command.Item
                onSelect={() => {
                  goTo([prevChapter[0], prevChapter[1], 1]);
                  clear();
                }}
              >
                Previous chapter: {formatChapter(prevChapter)}
              </Command.Item>
            )}
          </Command.Group>

          <Command.Group heading="Actions">
            <Command.Item onSelect={() => handleLoadXml("main")}>
              Load XML file
            </Command.Item>
            <Command.Item onSelect={() => handleLoadXml("alt")}>
              Load alternate XML file
            </Command.Item>
            <Command.Item onSelect={() => toggleColorMode()}>
              Change color mode to {oppositeColorMode}
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Open in…">
            <Command.Item
              onSelect={() => {
                const url = `https://www.biblegateway.com/passage/?search=${usfmIdentifiers[currentChapter[0]]}+${currentChapter[1]}`;
                window.open(url, "_blank");
              }}
            >
              Bible Gateway
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
};

const SpeechConnector = (props: {
  children: (args: {
    listening: boolean;
    listen: () => void;
  }) => React.ReactNode;
}) => {
  const listening = useStore($listening);
  const listen = () => {
    let lastText = "";
    let recognized = false;
    toggleVoiceSearch(
      (text) => {
        const found = resolveVerseFromSpeech(text);
        lastText = text;
        if (found) {
          goTo(found);
          recognized = true;
        }
      },
      () => {
        if (lastText && !recognized) {
          enqueueSnackbar(`Could not find verse for: ${lastText}`, {
            variant: "error",
          });
          lastText = "";
        }
      },
    );
  };
  return <>{props.children({ listening, listen })}</>;
};

const SpeechHotkey = (props: { onTrigger: () => void }) => {
  const down = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      props.onTrigger();
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return null;
};
