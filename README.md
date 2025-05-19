# VerseSearch

A web application for searching, navigating, and viewing Bible verses. Built with Astro and React.

## Features

- **Easy Navigation**: Jump to any verse using standard Bible references (e.g., "John 3:16")
- **Multiple Translations**: Load and compare two different Bible XML files
- **Voice Commands**: Navigate by speaking verse references (e.g., "John chapter 3 verse 16")
- **Dark/Light Mode**: Toggle between color themes
- **Chapter Selection**: Easily browse books and chapters with a visual selector
- **Keyboard Shortcuts**: Quick access via ⌘K (command menu) and ⌘⇧K (voice search)

## Getting Started

```sh
# Install dependencies
npm install

# Start development server (default port: 31102)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Load Bible Data**: Use the command menu (⌘K) and select "Load XML file" to import a Bible XML file
2. **Navigate**: Type verse references in the command menu or use the book/chapter selector
3. **Voice Search**: Use the microphone button or press ⌘⇧K to navigate by voice

## Bible XML Format

The application expects XML files in the following format:

```xml
<book number="43">
  <chapter number="3">
    <verse number="16">For God so loved the world...</verse>
  </chapter>
</book>
```

## Development

The project is built with:
- **Astro**: Framework
- **React**: Component library
- **nanostores**: State management
- **idb-keyval**: IndexedDB storage
- **cmdk**: Command menu

Run tests with Vitest:

```sh
npx vitest
```

## License

MIT