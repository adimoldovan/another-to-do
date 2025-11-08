import { db, isCloudConfigured } from '../db.js';

/**
 * Sync Status and Authentication Component
 * Manages cloud sync status display and user authentication
 */

let currentUser = null;
let syncState = { type: 'not-synced' };

export function initSyncStatus() {
  // Always render controls (even in local-only mode)
  // This allows users to configure cloud sync if they want

  // Subscribe to auth state changes
  db.cloud.currentUser.subscribe(user => {
    currentUser = user;
    renderSyncControls();
  });

  // Subscribe to sync state changes
  db.cloud.syncState.subscribe(state => {
    syncState = state;
    renderSyncControls();
  });

  // Initial render
  renderSyncControls();
}

function renderSyncControls() {
  const container = document.getElementById('sync-controls');
  if (!container) return;

  const cloudConfigured = isCloudConfigured();

  if (!cloudConfigured) {
    // Cloud not configured - show setup button
    container.innerHTML = `
      <div class="sync-status">
        <span class="local-mode-indicator" title="Local-only mode">
          ⊙ Local
        </span>
        <button class="sync-btn setup-btn" id="setup-cloud-btn">Setup Sync</button>
      </div>
    `;

    document.getElementById('setup-cloud-btn')?.addEventListener('click', showSettingsModal);
  } else if (currentUser) {
    // Cloud configured and user is logged in
    container.innerHTML = `
      <div class="sync-status">
        <span class="sync-indicator ${getSyncStatusClass()}" title="${getSyncStatusText()}">
          ${getSyncStatusIcon()}
        </span>
        <span class="user-email">${currentUser.email || 'Signed in'}</span>
        <button class="sync-btn settings-btn" id="settings-btn">⚙</button>
        <button class="sync-btn logout-btn" id="logout-btn">Sign out</button>
      </div>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('settings-btn')?.addEventListener('click', showSettingsModal);
  } else {
    // Cloud configured but user is not logged in
    container.innerHTML = `
      <div class="sync-status">
        <span class="local-mode-indicator" title="Offline mode - Sign in to sync across devices">
          ⊙ Local
        </span>
        <button class="sync-btn login-btn" id="login-btn">Sign in</button>
        <button class="sync-btn settings-btn" id="settings-btn">⚙</button>
      </div>
    `;

    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('settings-btn')?.addEventListener('click', showSettingsModal);
  }
}

function getSyncStatusClass() {
  if (syncState.phase === 'error') return 'sync-error';
  if (syncState.phase === 'offline') return 'sync-offline';
  if (syncState.phase === 'pushing' || syncState.phase === 'pulling') return 'sync-syncing';
  if (syncState.phase === 'in-sync') return 'sync-synced';
  return 'sync-idle';
}

function getSyncStatusText() {
  if (syncState.phase === 'error') return `Sync error: ${syncState.error || 'Unknown error'}`;
  if (syncState.phase === 'offline') return 'Offline - changes will sync when online';
  if (syncState.phase === 'pushing') return 'Uploading changes...';
  if (syncState.phase === 'pulling') return 'Downloading changes...';
  if (syncState.phase === 'in-sync') return 'Synced';
  return 'Idle';
}

function getSyncStatusIcon() {
  if (syncState.phase === 'error') return '⚠';
  if (syncState.phase === 'offline') return '○';
  if (syncState.phase === 'pushing' || syncState.phase === 'pulling') return '↻';
  if (syncState.phase === 'in-sync') return '●';
  return '○';
}

async function handleLogin() {
  try {
    // Dexie Cloud's built-in authentication UI
    await db.cloud.login();
  } catch (error) {
    console.error('Login failed:', error);
    alert('Failed to sign in. Please try again.');
  }
}

async function handleLogout() {
  try {
    await db.cloud.logout();
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Failed to sign out. Please try again.');
  }
}

function showSettingsModal() {
  // Dispatch custom event to show settings modal
  window.dispatchEvent(new CustomEvent('show-settings'));
}
