
# Another To Do

A minimal Electron-based to-do list app built with vanilla JavaScript.

## Features

- Create, edit, and delete tasks
- Drag & drop reordering
- Mark tasks as complete
- URL auto-linking in task names
- Local storage with IndexedDB
- Keyboard shortcuts

## Tech Stack

- **Electron** - Desktop app framework
- **Vanilla JavaScript** - No framework dependencies
- **Vite** - Fast build tool and dev server
- **Dexie** - IndexedDB wrapper for local storage
- **Playwright** - E2E testing

## Development

```shell
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Lint code
npm run lint
npm run lint:fix
```

## Build & Package

```shell
# Build for production
npm run build

# Package app
npm run package

# Create distributable
npm run make
```

## Icon Generation

```shell
# Create a set of icons from png
mkdir ./assets/set.iconset
cp ./assets/favicon.png ./assets/set.iconset/icon_512x512@2x.png
iconutil -c icns ./assets/set.iconset
rm -rf ./assets/set.iconset
```

## License

MIT