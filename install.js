#!/usr/bin/env node

/**
 * Interactive Slides OpenClaw Plugin Installer
 * 
 * Auto-configures OpenClaw to load the plugin.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENCLAW_CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '', '.openclaw');
const OPENCLAW_CONFIG_FILE = path.join(OPENCLAW_CONFIG_DIR, 'openclaw.json');
const PLUGIN_ID = 'interactive-slides-openclaw-plugin';
const PLUGIN_NAME = 'Interactive Slides OpenClaw Plugin';

console.log(`🦞 ${PLUGIN_NAME} Installer\n`);

// Check if OpenClaw config exists
if (!fs.existsSync(OPENCLAW_CONFIG_FILE)) {
  console.error(`❌ OpenClaw config not found at ${OPENCLAW_CONFIG_FILE}`);
  console.error('Please run: openclaw init');
  process.exit(1);
}

// Read config
let config;
try {
  config = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_FILE, 'utf-8'));
} catch (err) {
  console.error(`❌ Failed to parse OpenClaw config: ${err.message}`);
  process.exit(1);
}

// Initialize plugins section if needed
if (!config.plugins) {
  config.plugins = {};
}
if (!config.plugins.entries) {
  config.plugins.entries = {};
}
if (!Array.isArray(config.plugins.allow)) {
  config.plugins.allow = [];
}

// Check if already installed
if (config.plugins.entries[PLUGIN_ID]) {
  console.log(`ℹ️  Plugin already installed. Updating configuration...`);
}

// Add to allow list if not present
if (!config.plugins.allow.includes(PLUGIN_ID)) {
  config.plugins.allow.push(PLUGIN_ID);
  console.log(`✅ Added to plugins.allow`);
}

// Configure plugin entry
config.plugins.entries[PLUGIN_ID] = {
  enabled: true,
  autoDetectPresentations: true
};
console.log(`✅ Added to plugins.entries`);

// Write config back
try {
  fs.writeFileSync(OPENCLAW_CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
  console.log(`✅ Updated ${OPENCLAW_CONFIG_FILE}`);
} catch (err) {
  console.error(`❌ Failed to write config: ${err.message}`);
  process.exit(1);
}

console.log(`\n🎉 Installation complete!`);
console.log(`\nNext steps:`);
console.log(`  1. Run: openclaw gateway restart`);
console.log(`  2. Try: "Create a presentation about Q1 results"`);
