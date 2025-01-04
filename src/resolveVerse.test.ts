import { expect, test } from "vitest";
import { resolveVerse, resolveVerseFromSpeech } from "./resolveVerse";

test("resolves verse", async () => {
  expect(resolveVerse("John 3:16")).toEqual([43, 3, 16]);
  expect(resolveVerse("jn3.16")).toEqual([43, 3, 16]);
  expect(resolveVerse("1 Corinthians 13")).toEqual([46, 13, 1]);
});

test("defaults to first verse", async () => {
  expect(resolveVerse("Matthew 1")).toEqual([40, 1, 1]);
});

test("defaults to first chapter", async () => {
  expect(resolveVerse("Psa")).toEqual([19, 1, 1]);
  expect(resolveVerse("joh")).toEqual([43, 1, 1]);
});

test("returns undefined if ambiguous", async () => {
  expect(resolveVerse("P 1:1")).toEqual(undefined);
  expect(resolveVerse("1:1")).toEqual(undefined);
  expect(resolveVerse("")).toEqual(undefined);
});

test("resolves verse from speech", async () => {
  expect(resolveVerseFromSpeech("1st Corinthians chapter 13")).toEqual([
    46, 13,
  ]);
  expect(resolveVerseFromSpeech("John chapter 3 verse 16")).toEqual([
    43, 3, 16,
  ]);
});
