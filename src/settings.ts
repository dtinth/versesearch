import { persistentAtom } from "@nanostores/persistent";

export const $colorMode = persistentAtom(
  "settings:colorMode",
  "dark" as "light" | "dark",
);
