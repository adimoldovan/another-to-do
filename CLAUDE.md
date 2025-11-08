# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development
```bash
npm start
```
Runs Vite in development mode and starts Electron with hot reload and DevTools enabled.

### Build & Package
```bash
npm run build    # Build app once with Vite
npm run package  # Package app for distribution
npm run make     # Create distributable
```

### Testing
```bash
npm test         # Run E2E tests with Playwright
npm run test:headed  # Run tests in headed mode
npm run test:ui      # Run tests with Playwright UI
```

### Linting
```bash
npm run lint     # Check for linting issues
npm run lint:fix # Fix linting issues automatically
```

### Icon Generation
```bash
mkdir ./assets/set.iconset
cp ./assets/favicon.png ./assets/set.iconset/icon_512x512@2x.png
iconutil -c icns ./assets/set.iconset
rm -rf ./assets/set.iconset
```

## Architecture

This is an Electron-based to-do list application built with vanilla JavaScript and Dexie (IndexedDB wrapper).

### Technology Stack
- **Electron**: Desktop app framework
- **Vanilla JavaScript**: No framework, just ES6+ modules
- **Dexie**: IndexedDB wrapper for local storage
- **Vite**: Fast build tool and dev server
- **date-fns**: Date formatting
- **Playwright**: E2E testing framework
- **ESLint**: Code linting

### Project Structure
- `main.js` - Electron main process entry point
- `preload.js` - Preload script for renderer process
- `src/main.js` - Main application entry point
- `src/db.js` - Dexie database configuration
- `src/styles.css` - Application styles
- `index.html` - Main HTML file
- `vite.config.js` - Vite configuration
- `e2e/` - Playwright E2E tests
- `eslint.config.js` - ESLint configuration

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
- **Hot Reload**: Development mode includes live reload for both Electron and Vite
- **E2E Testing**: Playwright tests for critical user flows
- **Accessibility**: ARIA labels and keyboard navigation

### Build Process
1. Vite bundles JavaScript and CSS into `dist/` directory
2. Electron loads `index.html` which includes the bundled assets
3. In development, Vite runs dev server with HMR alongside Electron
4. Electron Forge handles packaging and distribution
