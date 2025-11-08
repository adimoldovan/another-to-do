# Dexie Cloud Setup Guide

This app supports optional cloud sync using Dexie Cloud. By default, the app runs in local-only mode.

## User-Configurable Cloud Sync

Users can configure their own Dexie Cloud database at runtime - no build configuration needed!

### How It Works

1. **Download & Install**: User downloads and installs the app
2. **Local-Only by Default**: App works immediately in local-only mode
3. **Optional Cloud Sync**: User clicks "Setup Sync" to configure their own Dexie Cloud database
4. **Personal Database**: Each user can use their own database (privacy + no shared limits)

## For End Users

### Enabling Cloud Sync

1. Open the app
2. Click "Setup Sync" in the top-right corner
3. Click "Create a free Dexie Cloud database" link
4. Create a Dexie Cloud account and database at https://dexie.cloud
5. Copy your database URL (looks like `https://YOUR_DB_ID.dexie.cloud`)
6. Paste the URL into the settings and click "Save"
7. App will reload with cloud sync enabled
8. Click "Sign in" to authenticate and start syncing

### Using the App

- **Without Cloud Sync**: All tasks stay on your device
- **With Cloud Sync**: Tasks sync across all your devices
- **Offline Mode**: App works offline, syncs when you're back online
- **Privacy**: Only you can see your tasks (even though others might use their own databases)

## For Developers

### Client-Only Setup

This app uses a **client-only** Dexie Cloud setup:
- No `dexie-cloud.json` or `dexie-cloud.key` files needed
- No Dexie Cloud CLI required
- Settings stored in localStorage (per-user)
- Database URL configured at runtime by each user

### Development

```bash
npm start  # Runs in local-only mode
```

To test cloud sync during development:
1. Run the app
2. Click "Setup Sync"
3. Enter your dev database URL
4. Test sign-in and sync features

## User Experience

### Local-Only Mode (Development)
- Shows "⊙ Local" in header
- No sign-in required
- Data stays on device

### Cloud Mode (Production)
- Shows "⊙ Local" and "Sign in" button when not authenticated
- After sign-in: Shows sync status indicator (●/↻/○) and user email
- Users can sign out to return to local-only mode
- Data created while offline syncs automatically after sign-in

## Sync States

- **● Synced** (green): All changes synced to cloud
- **↻ Syncing** (yellow): Uploading or downloading changes
- **○ Offline** (gray): No internet connection, changes queued
- **⚠ Error** (red): Sync error occurred

## Privacy & Security

- Data is encrypted in transit (HTTPS)
- Users must authenticate to access their cloud data
- Each user only sees their own tasks
- Local data remains private until user signs in

## Free Tier Limits

Dexie Cloud free tier includes:
- 50MB per database
- 1,000 sync operations per day
- Unlimited users

For higher limits, check Dexie Cloud pricing.
