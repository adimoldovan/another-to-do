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

  // Header is now empty - no button needed
  headerContainer.innerHTML = '';

  // Show status in footer with settings link
  if (footerContainer) {
    let syncStatusHtml = '';

    if (!cloudConfigured) {
      syncStatusHtml = `<span class="local-mode-indicator" title="Local-only mode">Local only</span>`;
    } else if (cloudConfigured && currentUser && syncState.phase !== 'error') {
      // Show sync status only when cloud is configured AND user is signed in
      const statusClass = getSyncStatusClass();
      const statusIcon = getSyncStatusIcon();
      const statusText = getSyncStatusText();
      syncStatusHtml = `<span class="sync-indicator ${statusClass}" title="${statusText}">${statusIcon}</span> ${currentUser.email || 'Signed in'}`;
    } else {
      // Default to local only for all other cases (not configured, error, etc.)
      syncStatusHtml = `<span class="local-mode-indicator" title="Local-only mode">Local only</span>`;
    }

    footerContainer.innerHTML = `
      <div>Sync: ${syncStatusHtml} · <a href="#" class="settings-link" id="settings-link">Settings</a></div>
    `;

    document.getElementById('settings-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      showSettingsModal();
    });
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
