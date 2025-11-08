/**
 * Application Settings
 * Manages user preferences stored in localStorage
 */

const SETTINGS_KEY = 'app-settings';

const DEFAULT_SETTINGS = {
  dexieCloudUrl: '', // Empty by default - user configures if they want sync
};

/**
 * Load settings from localStorage
 */
export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

/**
 * Get Dexie Cloud URL from settings
 */
export function getDexieCloudUrl() {
  const settings = loadSettings();
  return settings.dexieCloudUrl || '';
}

/**
 * Set Dexie Cloud URL in settings
 */
export function setDexieCloudUrl(url) {
  const settings = loadSettings();
  settings.dexieCloudUrl = url;
  return saveSettings(settings);
}

/**
 * Clear all settings
 */
export function clearSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear settings:', error);
    return false;
  }
}
