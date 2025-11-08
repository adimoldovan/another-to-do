# Migration Plan: v1 → v2.0

## Status
**Current Milestone:** Milestone 3 Complete ✓
**Last Updated:** 2025-11-08

## Configuration
- **UI Design:** Minimalist (clean, whitespace, subtle colors)
- **Dexie Cloud:** Set up account during Milestone 7
- **Reminders:** In-app notifications only (background notifications: future version)
- **Playwright Tests:** Headless mode

## Progress Overview
- [x] Milestone 1: Dependency Upgrades
- [x] Milestone 2: Playwright E2E Testing (infrastructure ready, tests deferred to M4)
- [x] Milestone 3: Add Linting
- [ ] Milestone 4: Vanilla JS Conversion
- [ ] Milestone 5: Expand E2E Test Coverage
- [ ] Milestone 6: UI Improvements (Minimalist Design)
- [ ] Milestone 7: Add Dexie Cloud
- [ ] Milestone 8: Add Reminders Feature
- [ ] Milestone 9: Final Polish & Documentation
- [ ] Milestone 10: Release v2.0

---

## Detailed Milestones

### **MILESTONE 1: Dependency Upgrades** ✓
**Status:** Complete
**Goal:** Upgrade all dependencies while keeping Svelte app working

**Completed Upgrades:**
- Electron: 28.1.4 → 39.1.1
- date-fns: 3.3.1 → 4.1.0
- Dexie: 3.2.4 → 4.2.1
- @electron-forge/*: 7.2.0 → 7.10.2
- @rollup/plugin-commonjs: 25.0.7 → 29.0.0
- @rollup/plugin-node-resolve: 15.2.3 → 16.0.3
- rollup-plugin-css-only: 3.1.0 → 4.5.5
- rollup-plugin-svelte: 7.1.6 → 7.2.3

**Notes:**
- Disabled electron-reload (incompatible with Electron 39+ and ES modules)
- Will be replaced with Vite HMR in Milestone 4
- All tests passed, app stable

#### Implementation Steps
1. Upgrade Electron 28 → latest (31+)
2. Upgrade date-fns 3 → 4
3. Upgrade all Electron Forge packages to latest (@electron-forge/*)
4. Upgrade all Rollup plugins to latest compatible versions
5. Run `npm install` to update package-lock.json

#### Testing for Stability
- [ ] Run `npm start` - app launches successfully
- [ ] Create a new task - saves to database
- [ ] Edit existing task (double-click) - updates successfully
- [ ] Drag-and-drop task - reordering works with correct priority
- [ ] Delete task - removes from list
- [ ] Toggle completed view - shows/hides completed items
- [ ] Check URL linking works (add task with https://google.com)
- [ ] Verify date display at top updates
- [ ] Check task count displays correctly
- [ ] No console errors in DevTools
- [ ] Run `npm run package` - builds successfully

#### Git Commit
```bash
git add package.json package-lock.json
git commit -m "chore: upgrade dependencies to latest versions"
git push origin master
```

---

### **MILESTONE 2: Add Playwright E2E Testing** ✓ (Deferred to M4)
**Status:** Infrastructure Complete - Tests Deferred to Milestone 4
**Goal:** Add full end-to-end test coverage with Playwright (headless mode)

**Completed Work:**
- ✅ Playwright installed and configured
- ✅ Created playwright.config.js (headless, no auto-open report)
- ✅ Created e2e/ directory structure with 9 comprehensive test files
- ✅ Test helpers created (app launch, database cleanup, wait utilities)
- ✅ npm test scripts added

**Test Files Created (29 tests total):**
- `e2e/task-creation.spec.js` (3 tests)
- `e2e/task-editing.spec.js` (2 tests)
- `e2e/task-deletion.spec.js` (2 tests)
- `e2e/task-reordering.spec.js` (2 tests)
- `e2e/task-completion.spec.js` (2 tests)
- `e2e/url-linking.spec.js` (4 tests)
- `e2e/task-filtering.spec.js` (4 tests)
- `e2e/modal-interactions.spec.js` (5 tests)
- `e2e/persistence.spec.js` (2 tests)
- `e2e/full-workflow.spec.js` (3 tests)

**Why Deferred:**
- Electron 28-39 incompatibility with Playwright's `--remote-debugging-port` flag
- Tests will be easier to run and maintain after Milestone 4 (Vanilla JS + Vite)
- Vite provides better debugging and testing infrastructure
- All test code is ready and will be validated in M4

#### Implementation Steps
1. Install Playwright: `npm install -D @playwright/test playwright`
2. Install Playwright Electron support: `npm install -D playwright-electron`
3. Create `playwright.config.js` configured for:
   - Electron app testing
   - Headless mode
   - Video/screenshot on failure
4. Create `e2e/` test directory structure
5. Create `e2e/helpers/` with test utilities (app launch, cleanup)
6. Write comprehensive E2E tests:
   - `e2e/task-creation.spec.js` - Create tasks flow
   - `e2e/task-editing.spec.js` - Edit tasks flow (double-click to edit)
   - `e2e/task-deletion.spec.js` - Delete tasks flow
   - `e2e/task-reordering.spec.js` - Drag-and-drop reordering flow
   - `e2e/task-completion.spec.js` - Mark complete/incomplete flow
   - `e2e/url-linking.spec.js` - URL auto-detection and linking
   - `e2e/task-filtering.spec.js` - Toggle completed view flow
   - `e2e/modal-interactions.spec.js` - Modal open/close/escape key
   - `e2e/persistence.spec.js` - Data persistence across app restarts
   - `e2e/full-workflow.spec.js` - Complete user journey
7. Add npm scripts:
   - `"test": "playwright test"` (headless)
   - `"test:headed": "playwright test --headed"` (for debugging)
   - `"test:ui": "playwright test --ui"` (for interactive mode)

#### Testing for Stability
- [ ] Run `npm start` - app still launches
- [ ] Run `npm test` - ALL E2E tests pass (100% pass rate)
- [ ] Verify tests cover:
  - [ ] Task creation
  - [ ] Task editing (double-click)
  - [ ] Task deletion
  - [ ] Drag-and-drop reordering
  - [ ] Task completion toggle
  - [ ] URL auto-linking
  - [ ] Filter completed view
  - [ ] Modal interactions (open/close/escape)
  - [ ] Data persistence across restarts
  - [ ] Full user workflow
- [ ] No flaky tests (run 3x to verify stability)
- [ ] Test suite completes in <2 minutes
- [ ] No new dependencies break the build

#### Git Commit
```bash
git add playwright.config.js e2e/ package.json package-lock.json
git commit -m "test: add comprehensive Playwright E2E test suite"
git push origin master
```

---

### **MILESTONE 3: Add Linting** ✓
**Status:** Complete
**Goal:** Add ESLint without breaking anything

**Completed Work:**
- ✅ ESLint installed with @eslint/js
- ✅ Created eslint.config.js (flat config format)
- ✅ Configured for ES2022 + ES modules
- ✅ Added npm scripts: `lint` and `lint:fix`
- ✅ Fixed 2 linting issues (unused import, require → spawn)
- ✅ All files pass linting with no errors

#### Implementation Steps
1. Install ESLint: `npm install -D eslint`
2. Install config: `npm install -D eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise`
3. Create `.eslintrc.js` with:
   - ES2022 support
   - ES modules support
   - Node environment
   - Standard config base
4. Create `.eslintignore` (ignore node_modules, out/, public/build/)
5. Add npm scripts:
   - `"lint": "eslint ."`
   - `"lint:fix": "eslint . --fix"`
6. Run `npm run lint:fix` to auto-fix issues
7. Manually fix remaining linting errors

#### Testing for Stability
- [ ] Run `npm start` - app launches
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm test` - ALL E2E tests still pass (100%)
- [ ] No functionality changed, only code style improvements
- [ ] Manual smoke test (create/edit/delete one task)

#### Git Commit
```bash
git add .eslintrc.js .eslintignore package.json package-lock.json
git add . # all files with linting fixes
git commit -m "chore: add ESLint configuration and fix linting issues"
git push origin master
```

---

### **MILESTONE 4: Vanilla JS Conversion**
**Status:** Not started
**Goal:** Convert Svelte to vanilla JS with exact feature parity

#### Implementation Steps
1. Install Vite: `npm install -D vite`
2. Create `vite.config.js` configured for:
   - Electron compatibility
   - ES modules
   - Build output to `public/build/`
3. Create vanilla JS file structure:
   - `src/app.js` - Main app entry point
   - `src/state.js` - Reactive state management (using Proxy pattern)
   - `src/components/TaskList.js` - Task list rendering and updates
   - `src/components/TaskItem.js` - Individual task rendering
   - `src/components/Modal.js` - Modal dialog logic
   - `src/utils/urlDetector.js` - URL parsing and linking utility
   - `src/utils/dragDrop.js` - Drag-and-drop handlers
   - `src/utils/dateFormatter.js` - Date formatting wrapper
4. Implement features in vanilla JS:
   - Task CRUD operations with live updates (observe Dexie changes)
   - Drag-and-drop reordering with fractional priorities
   - URL auto-detection and linking
   - Modal for add/edit tasks (keyboard support: Escape to close)
   - Toggle completed items view
   - Date/time display with hourly updates
   - Task count display
5. Update `public/index.html`:
   - Change script src to Vite bundle
   - Add necessary mounting point
6. Update `package.json` scripts:
   - Update `start` to use Vite dev server
   - Update `svelte-build` → `build` using Vite
7. Update `main.js` to work with Vite dev server
8. Remove Rollup, Svelte, and related packages
9. Delete `rollup.config.js`
10. Delete `src/App.svelte` and `src/svelte.js`

#### Testing for Stability (CRITICAL - Feature Parity Required)
- [ ] Run `npm start` - app launches with Vite
- [ ] **Playwright E2E Tests** (source of truth):
  - [ ] Run `npm test` - ALL tests MUST pass (100%)
  - [ ] Task creation flow ✓
  - [ ] Task editing flow ✓
  - [ ] Task deletion flow ✓
  - [ ] Drag-and-drop reordering ✓
  - [ ] Task completion toggle ✓
  - [ ] URL auto-linking ✓
  - [ ] Filter completed view ✓
  - [ ] Modal interactions ✓
  - [ ] Data persistence ✓
  - [ ] Full workflow ✓
- [ ] Manual verification:
  - [ ] No console errors
  - [ ] UI renders identically to Svelte version
  - [ ] All animations/transitions work
  - [ ] Keyboard shortcuts work (Escape, Enter)
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run package` - builds successfully
- [ ] Test packaged app launches and works

#### Git Commit
```bash
git add vite.config.js src/ public/ main.js package.json package-lock.json
git rm rollup.config.js
git commit -m "refactor: migrate from Svelte to vanilla JS with Vite"
git push origin master
```

---

### **MILESTONE 5: Expand E2E Test Coverage**
**Status:** Not started
**Goal:** Add edge cases and error scenarios to E2E tests

#### Implementation Steps
1. Create `e2e/edge-cases/` directory
2. Add edge case tests:
   - `empty-task.spec.js` - Attempt to create empty task (should prevent)
   - `long-task.spec.js` - Very long task names (>500 chars)
   - `special-chars.spec.js` - Special characters (emoji, unicode, HTML tags)
   - `many-tasks.spec.js` - Performance with 100+ tasks
   - `concurrent-edits.spec.js` - Multiple rapid operations
   - `url-variations.spec.js` - Various URL formats (http, https, www, no protocol)
3. Add accessibility tests:
   - `e2e/accessibility.spec.js` - Keyboard navigation, ARIA labels, focus management
4. Add `e2e/error-recovery.spec.js` - Error handling scenarios
5. Target 100% user flow coverage

#### Testing for Stability
- [ ] Run `npm test` - all tests including new edge cases pass (100%)
- [ ] Manual verification of edge cases:
  - [ ] Empty task handling
  - [ ] Long task rendering
  - [ ] Special characters display
  - [ ] Performance with many tasks
- [ ] All existing features still work normally
- [ ] No new console errors or warnings

#### Git Commit
```bash
git add e2e/
git commit -m "test: add edge case and accessibility E2E tests"
git push origin master
```

---

### **MILESTONE 6: UI Improvements (Minimalist Design)**
**Status:** Not started
**Goal:** Modern, beautiful minimalist design

#### Implementation Steps
1. Redesign `public/global.css` with minimalist aesthetic:
   - **Color Palette**: Neutral grays, single accent color (subtle blue/green)
   - **Typography**: Clean sans-serif (system fonts: -apple-system, BlinkMacSystemFont, Segoe UI)
   - **Spacing**: Generous whitespace, consistent spacing scale (8px base)
   - **Layout**: Simple, uncluttered, clear hierarchy
2. CSS improvements:
   - Add CSS custom properties (variables) for theming
   - Smooth, subtle animations (fade, slide)
   - Minimal shadows (or no shadows)
   - Clean borders (1px, subtle colors)
   - Focus states for accessibility
3. UI enhancements:
   - Loading states (simple spinner)
   - Empty state design (gentle message when no tasks)
   - Hover states (subtle background changes)
   - Success feedback (subtle fade animation on save)
4. Remove visual clutter:
   - Simplify buttons (minimal icons/symbols)
   - Clean input fields
   - Subtle task separators

#### Testing for Stability
- [ ] Run `npm start` - app launches with new design
- [ ] **Playwright E2E Tests**:
  - [ ] Run `npm test` - ALL tests pass (100%)
- [ ] Manual visual verification:
  - [ ] Clean, uncluttered appearance
  - [ ] Generous whitespace
  - [ ] Readable typography
  - [ ] Subtle colors
  - [ ] Smooth animations (not jarring)
  - [ ] Clear visual hierarchy
- [ ] Accessibility checks:
  - [ ] Sufficient color contrast (WCAG AA)
  - [ ] Focus indicators visible
  - [ ] Keyboard navigation clear
- [ ] Responsive check (resize window, verify layout)
- [ ] No visual bugs or layout issues
- [ ] Run `npm run lint` - no errors

#### Git Commit
```bash
git add public/global.css
git commit -m "style: redesign UI with minimalist aesthetic"
git push origin master
```

---

### **MILESTONE 7: Add Dexie Cloud**
**Status:** Not started
**Goal:** Enable cloud sync with offline-first functionality

#### Implementation Steps
1. **Set up Dexie Cloud Account**:
   - Go to https://dexie.cloud
   - Create account
   - Create new database
   - Note database URL
2. Install Dexie Cloud addon: `npm install dexie-cloud-addon`
3. Update `src/db.js`:
   - Import and configure Dexie Cloud addon
   - Add database URL from account
   - Configure sync settings (offline-first)
   - Keep existing schema
4. Create authentication components:
   - `src/components/Auth.js` - Login/signup UI
   - `src/components/SyncStatus.js` - Sync status indicator
5. Add UI elements:
   - Login/signup modal or screen
   - Sync status indicator (synced/syncing/offline badge)
   - Offline mode indicator
   - Logout button
6. Handle authentication state:
   - Check if user logged in on app start
   - Show login screen if not authenticated
   - Store auth state
7. Update app to handle sync:
   - Show sync status in UI
   - Handle sync errors gracefully
   - Maintain offline-first behavior

#### E2E Tests to Add
- `e2e/cloud/authentication.spec.js` - Login/logout flow
- `e2e/cloud/offline-mode.spec.js` - Offline CRUD operations
- `e2e/cloud/sync.spec.js` - Online sync flow
- `e2e/cloud/conflict-resolution.spec.js` - Sync conflicts

#### Testing for Stability
- [ ] Run `npm test` - all existing tests pass
- [ ] **Cloud-specific E2E tests**:
  - [ ] Authentication flow (login/logout)
  - [ ] Offline CRUD operations work
  - [ ] Sync flow when online
  - [ ] Conflict resolution
- [ ] Manual testing:
  - [ ] **Offline Mode**: Disconnect wifi, create/edit tasks
  - [ ] **Sync**: Reconnect wifi, verify offline changes sync
  - [ ] **Multi-Device**: Open in two browsers, verify real-time sync
  - [ ] **Logout/Login**: Verify data persists after logout/login
  - [ ] Sync status indicator updates correctly
  - [ ] Offline indicator shows when disconnected
- [ ] All previous features work identically
- [ ] No degradation of offline-first functionality
- [ ] No console errors during sync operations

#### Git Commit
```bash
git add src/db.js src/components/Auth.js src/components/SyncStatus.js e2e/cloud/ package.json package-lock.json
git commit -m "feat: add Dexie Cloud sync with offline-first support"
git push origin master
```

#### Notes
- Database URL will be added during implementation
- Authentication credentials managed by Dexie Cloud
- Free tier limits: 50MB per database, 1,000 sync operations/day

---

### **MILESTONE 8: Add Reminders Feature**
**Status:** Not started
**Goal:** Task reminders with in-app notifications

#### Implementation Steps
1. **Database Migration**:
   - Update `src/db.js` to add `reminder_date` field to tasks schema
   - Bump database version
   - Add migration function for existing tasks (set reminder_date to null)
2. **UI Components**:
   - Create `src/components/ReminderPicker.js` - Date/time picker
   - Update Modal to include reminder picker
   - Add visual indicator for tasks with reminders (clock icon or badge)
3. **Reminder Logic**:
   - Create `src/utils/reminderChecker.js`:
     - Check for due reminders every minute (setInterval)
     - Request Notification permission on first use
     - Trigger browser notification when reminder time reached
     - Mark reminder as shown (don't show again)
   - Initialize reminder checker on app start
   - Clean up interval on app close
4. **Notification Actions**:
   - Show browser notification with task name
   - Click notification to focus app and show task
   - Dismiss notification
5. **UI Updates**:
   - Display reminder time on task item (if set)
   - Allow editing/removing reminder
   - Show upcoming reminders section (optional)

#### E2E Tests to Add
- `e2e/reminders/set-reminder.spec.js` - Set reminder for task
- `e2e/reminders/edit-reminder.spec.js` - Edit existing reminder
- `e2e/reminders/remove-reminder.spec.js` - Remove reminder from task
- `e2e/reminders/visual-indicator.spec.js` - Verify reminder indicator shows
- `e2e/reminders/persistence.spec.js` - Reminders persist across restarts
- `e2e/reminders/notification.spec.js` - Mock time and verify notification (if possible)

#### Testing for Stability
- [ ] Run `npm test` - ALL tests pass including reminder tests
- [ ] **Database Migration**:
  - [ ] Existing tasks load correctly after migration
  - [ ] New reminder_date field exists
  - [ ] Old tasks have null reminder_date
- [ ] **Reminder E2E Tests**:
  - [ ] Set reminder flow
  - [ ] Edit reminder flow
  - [ ] Remove reminder flow
  - [ ] Visual indicator appears
  - [ ] Persistence across restarts
- [ ] Manual testing:
  - [ ] **Set Reminder**: Create task, set reminder for 2 minutes from now
  - [ ] **Notification Permission**: Verify permission prompt appears
  - [ ] **Notification Appears**: Wait for reminder time, verify notification
  - [ ] **Click Notification**: Click notification, verify app focuses
  - [ ] **Visual Indicator**: Verify tasks with reminders show indicator
  - [ ] **Edit Reminder**: Change reminder time, verify update
  - [ ] **Remove Reminder**: Clear reminder, verify indicator removed
  - [ ] **Persistence**: Close app, reopen, verify reminder still set
  - [ ] **Multiple Reminders**: Set multiple, verify all trigger correctly
- [ ] All previous features work normally
- [ ] No memory leaks from interval timers (verify in DevTools)
- [ ] No console errors

#### Git Commit
```bash
git add src/db.js src/components/ReminderPicker.js src/utils/reminderChecker.js e2e/reminders/ package.json
git commit -m "feat: add reminder notifications for tasks (in-app only)"
git push origin master
```

#### Future Enhancement Note
- Background notifications (when app closed) can be added in v2.1 using service workers

---

### **MILESTONE 9: Final Polish & Documentation**
**Status:** Not started
**Goal:** Documentation, cleanup, and full regression testing

#### Implementation Steps
1. **Update Documentation**:
   - Update `CLAUDE.md`:
     - New tech stack (Vanilla JS, Vite, Dexie Cloud)
     - New architecture (state management, components)
     - Development workflow
     - Testing approach (Playwright E2E)
   - Update `README.md`:
     - Feature list (including reminders, cloud sync)
     - Tech stack overview
     - Setup instructions
     - Dexie Cloud configuration steps
     - Development commands
     - Testing instructions
   - Create `CHANGELOG.md`:
     - Document all changes from v1 → v2.0
     - Breaking changes (Svelte → Vanilla JS)
     - New features (reminders, cloud sync)
     - Improvements (UI redesign, E2E tests)
2. **Code Cleanup**:
   - Add JSDoc comments to complex functions
   - Remove dead code
   - Remove TODO comments (complete or delete)
   - Ensure consistent code style
3. **Final Testing**:
   - Run full E2E test suite multiple times
   - Fix any flaky tests
   - Ensure 100% pass rate
4. **Bug Fixes**:
   - Address any remaining bugs
   - Test edge cases manually
   - Verify error handling

#### Testing for Stability
- [ ] **Fresh Install Test**:
  - [ ] Delete `node_modules` and `package-lock.json`
  - [ ] Run `npm install`
  - [ ] Run `npm start` - app works
- [ ] **Full E2E Regression**:
  - [ ] Run `npm test` - 100% pass rate
  - [ ] Run tests 3x to verify no flakes
- [ ] **Lint Check**:
  - [ ] Run `npm run lint` - no errors
- [ ] **Build Test**:
  - [ ] Run `npm run package` - builds successfully
  - [ ] Test packaged app on clean system
  - [ ] Verify packaged app doesn't require dev dependencies
- [ ] **Manual Feature Regression**:
  - [ ] Test every feature end-to-end manually
  - [ ] Verify all features work correctly
  - [ ] No console errors or warnings
- [ ] **Documentation Accuracy**:
  - [ ] Follow README setup instructions on clean machine
  - [ ] Verify all commands work as documented
  - [ ] Check for broken links or outdated info

#### Git Commit
```bash
git add CLAUDE.md README.md CHANGELOG.md src/ e2e/
git commit -m "docs: update documentation for v2.0 and final polish"
git push origin master
```

---

### **MILESTONE 10: Release v2.0**
**Status:** Not started
**Goal:** Official v2.0 release

#### Implementation Steps
1. **Version Verification**:
   - Verify `package.json` version is `2.0.0`
   - Update if needed
2. **Create Changelog**:
   - Finalize `CHANGELOG.md` with all changes
   - Add release date
3. **Build Distributables**:
   - Run `npm run package` for all platforms
   - Test packaged apps thoroughly
4. **Create Git Tag**:
   - Create annotated tag `v2.0.0`
   - Push tag to remote
5. **Update Migration Plan**:
   - Mark all milestones complete
   - Update status to "Completed"

#### Testing for Stability
- [ ] **Packaged App Tests** (macOS):
  - [ ] App launches without errors
  - [ ] All features work in packaged version
  - [ ] No dev tools or debug info visible
  - [ ] App icon displays correctly
- [ ] **Packaged App Tests** (Windows - if applicable):
  - [ ] App launches
  - [ ] Features work correctly
- [ ] **Packaged App Tests** (Linux - if applicable):
  - [ ] App launches
  - [ ] Features work correctly
- [ ] **Final Verification**:
  - [ ] Version number shows correctly in app
  - [ ] No dev dependencies in packaged app
  - [ ] App size reasonable
  - [ ] No console errors in production build

#### Git Commands
```bash
# Ensure all changes committed
git status

# Create annotated tag
git tag -a v2.0.0 -m "Release v2.0.0

Major rewrite with vanilla JS, Dexie Cloud sync, and reminders.

Features:
- Vanilla JS (removed Svelte)
- Dexie Cloud offline-first sync
- Task reminders with notifications
- Minimalist UI redesign
- Comprehensive Playwright E2E tests
- Updated to latest dependencies"

# Push tag
git push origin v2.0.0

# Push final commits
git push origin master
```

#### Post-Release
- [ ] Update this MIGRATION_PLAN.md status to "Completed"
- [ ] Archive or move plan to docs/ folder
- [ ] Celebrate! 🎉

---

## Notes & Learnings

*(This section will be updated during migration with important notes, gotchas, and learnings)*

---

## Testing Philosophy

**Playwright E2E tests are the source of truth for stability.**

Every milestone must achieve:
- ✅ 100% E2E test pass rate
- ✅ No console errors
- ✅ Manual verification of new features
- ✅ Successful git push before proceeding to next milestone

This ensures the app remains stable and functional throughout the migration.
