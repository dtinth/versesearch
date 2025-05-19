# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VerseSearch is a web application for searching and navigating Bible verses. It's built with Astro and React, and allows users to:

1. Navigate to specific Bible chapters and verses using text input
2. Load Bible XML files for different versions/translations
3. Search verses using voice commands
4. Toggle between light and dark color modes
5. Navigate between chapters using a chapter selector UI

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (default port: 31102) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npx vitest` | Run tests |

## Code Architecture

The application is structured around these key components and concepts:

### Core Functionality

- **Bible Navigation**: Allows navigation using book names, abbreviations, chapter and verse numbers
- **Bible XML Loading**: Users can load XML files for different Bible translations
- **Speech Recognition**: Enables voice commands for navigating to specific passages
- **Theme Switching**: Supports light and dark color modes

### Key Components

- **Searcher.tsx**: Main component that displays the Bible chapter and verses
- **Commander.tsx**: Command menu for navigation and actions (⌘K shortcut)
- **ChapterSelector.tsx**: UI for selecting book and chapter
- **loadBibleXml.tsx**: Handles loading Bible XML files from user's filesystem

### State Management

The app uses nanostores for state management:
- `$route`: Stores the current book and chapter being viewed
- `$targetVerse`: Tracks verse to scroll to when navigating
- `$colorMode`: Manages the UI theme (light/dark)
- `$listening`: Tracks voice search state

### Data & Utilities

- **resolveVerse.ts**: Core logic to parse and resolve verse references
- **bookNames.tsx** & **bookAbbreviations.tsx**: Bible book data
- **verseCount.ts**: Number of verses in each chapter
- **usfmIdentifiers.tsx**: Standard book abbreviations

## Testing

Tests are written using Vitest. Key test files:
- **resolveVerse.test.ts**: Tests the verse resolution logic

## Development Notes

1. The app uses IndexedDB (via idb-keyval) to store Bible verse data loaded from XML files
2. XML parsing is done in browser for user-provided files
3. The app supports two concurrent Bible versions: main and alternate
4. Voice commands work with patterns like "John chapter 3 verse 16"