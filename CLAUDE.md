# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Electron-based to-do list application built with TypeScript. Uses electron-store for data persistence and electron-vite for development and building.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production (runs typecheck first)
npm run build

# Type checking
npm run typecheck          # Check both node and web
npm run typecheck:node     # Main/preload only
npm run typecheck:web      # Renderer only

# Linting and formatting
npm run lint
npm run format

# Platform-specific builds (runs build + typecheck first)
npm run build:mac
npm run build:win
npm run build:linux
npm run build:unpack       # Build unpacked directory only
```

## Architecture

The app follows Electron's multi-process architecture with three key parts:

### Main Process ([src/main/index.ts](src/main/index.ts))
- Creates and manages the BrowserWindow
- Implements IPC handlers for CRUD operations: `get-todos`, `add-todo`, `update-todo`, `delete-todo`
- Uses electron-store to persist todos as JSON
- Todo type: `{ id: string; text: string; completed: boolean }`

### Preload Script ([src/preload/index.ts](src/preload/index.ts))
- Exposes safe IPC methods to renderer via contextBridge
- API methods: `getTodos()`, `addTodo(todo)`, `updateTodo(todo)`, `deleteTodo(id)`

### Renderer Process ([src/renderer/src/renderer.ts](src/renderer/src/renderer.ts))
- Plain TypeScript + DOM manipulation (no framework)
- Renders only incomplete todos
- Supports multi-line todo text with auto-resizing textarea
- Keyboard shortcut: Cmd/Ctrl+Enter to submit

## TypeScript Configuration

- Uses project references with two separate configs
- `tsconfig.node.json`: Main + preload processes (Node environment)
- `tsconfig.web.json`: Renderer process (Browser environment)
- Both configs use `@electron-toolkit/tsconfig` as base

## Build System

- electron-vite handles bundling for all three processes
- Config: [electron.vite.config.ts](electron.vite.config.ts)
- Output directory: `out/`
- Renderer builds with Vite (no special config needed)
