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
  const headerContainer = document.getElementById('sync-controls');
  const footerContainer = document.getElementById('sync-status-footer');

  if (!headerContainer) return;

  const cloudConfigured = isCloudConfigured();

  // Always show just a settings button in header
  headerContainer.innerHTML = `
    <button class="sync-btn settings-btn" id="settings-btn" aria-label="Settings">⚙</button>
  `;
  document.getElementById('settings-btn')?.addEventListener('click', showSettingsModal);

  // Show status in footer
  if (footerContainer) {
    if (!cloudConfigured) {
      footerContainer.innerHTML = `
        <div>Sync: <span class="local-mode-indicator" title="Local-only mode">Local only</span></div>
      `;
    } else if (currentUser) {
      footerContainer.innerHTML = `
        <div>Sync: <span class="sync-indicator ${getSyncStatusClass()}" title="${getSyncStatusText()}">${getSyncStatusIcon()}</span> ${currentUser.email || 'Signed in'}</div>
      `;
    } else {
      footerContainer.innerHTML = `
        <div>Sync: <span class="local-mode-indicator" title="Cloud configured but not signed in">Offline</span></div>
      `;
    }
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
