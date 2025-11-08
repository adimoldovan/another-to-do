# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development
```bash
npm start
```
Runs Rollup in watch mode and starts Electron in development mode with hot reload and DevTools enabled.

### Build & Package
```bash
npm run svelte-build  # Build Svelte app once
npm run package       # Package app for distribution
npm run make          # Create distributable
```

### Icon Generation
```bash
mkdir ./assets/set.iconset
cp ./assets/favicon.png ./assets/set.iconset/icon_512x512@2x.png
iconutil -c icns ./assets/set.iconset
rm -rf ./assets/set.iconset
```

## Architecture

This is an Electron-based to-do list application built with Svelte and Dexie (IndexedDB wrapper).

### Technology Stack
- **Electron**: Desktop app framework
- **Svelte**: UI framework
- **Dexie**: IndexedDB wrapper for local storage
- **Rollup**: Module bundler for Svelte
- **date-fns**: Date formatting

### Project Structure
- `main.js` - Electron main process entry point
- `preload.js` - Preload script for renderer process
- `src/App.svelte` - Main Svelte application component
- `src/db.js` - Dexie database configuration
- `src/svelte.js` - Svelte app entry point
- `public/` - Static assets and HTML
- `rollup.config.js` - Rollup bundler configuration

### Data Model
Tasks are stored in IndexedDB via Dexie with the following schema:
- `id` (auto-increment)
- `name` (string, supports URLs which are auto-linked)
- `priority` (number, uses fractional values for reordering)
- `complete` (0 or 1)

### Key Features
- **Drag & Drop Reordering**: Tasks use fractional priority values to maintain order
- **URL Detection**: Automatically detects and links URLs in task names
- **Local Storage**: All data stored client-side in IndexedDB
- **Hot Reload**: Development mode includes live reload for both Electron and Svelte

### Build Process
1. Rollup bundles Svelte components into `public/build/bundle.js`
2. Electron loads `public/index.html` which includes the bundled JS
3. In development, Rollup runs in watch mode alongside Electron
4. Electron Forge handles packaging and distribution
