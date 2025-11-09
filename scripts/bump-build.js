#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packagePath = join(__dirname, '..', 'package.json');

// Read package.json
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

// Parse the current build number
const buildMatch = currentVersion.match(/-build-(\d+)$/);
let newVersion;

if (buildMatch) {
  // Increment existing build number
  const buildNumber = parseInt(buildMatch[1], 10) + 1;
  newVersion = currentVersion.replace(/-build-\d+$/, `-build-${buildNumber}`);
} else {
  // Add initial build number
  newVersion = `${currentVersion}-build-1`;
}

// Update package.json
packageJson.version = newVersion;
writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

console.log(`Version bumped: ${currentVersion} → ${newVersion}`);
