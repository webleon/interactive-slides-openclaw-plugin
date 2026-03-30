#!/usr/bin/env node

/**
 * Interactive Slides OpenClaw Plugin - Installer
 * 
 * Auto-configures the plugin in OpenClaw configuration.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const PLUGIN_ID = "interactive-slides-openclaw-plugin";
const PLUGIN_NAME = "Interactive Slides OpenClaw Plugin";
const CONFIG_FILE = path.join(process.env.HOME || process.env.HOMEDIR || "", ".openclaw", "openclaw.json");

// ============================================================================
// Helper Functions
// ============================================================================

function log(message, type = "info") {
  const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
  console.log(`${prefix} ${message}`);
}

function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error(`Configuration file not found: ${CONFIG_FILE}`);
  }

  const content = fs.readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(content);
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

function isPluginInstalled(config) {
  const entries = config.plugins?.entries || {};
  return PLUGIN_ID in entries;
}

function installPlugin(config) {
  // Ensure plugins section exists
  if (!config.plugins) {
    config.plugins = { allow: [], entries: {} };
  }

  if (!config.plugins.allow) {
    config.plugins.allow = [];
  }

  if (!config.plugins.entries) {
    config.plugins.entries = {};
  }

  // Add to allow list if not already there
  if (!config.plugins.allow.includes(PLUGIN_ID)) {
    config.plugins.allow.push(PLUGIN_ID);
  }

  // Add plugin configuration
  config.plugins.entries[PLUGIN_ID] = {
    enabled: true,
    config: {
      enabled: true,
      skillsRepo: "https://github.com/sylvial928/interactive-slides.git",
      autoDetectPresentations: true,
      autoUpdate: false
    }
  };

  return config;
}

// ============================================================================
// Main Installation
// ============================================================================

function main() {
  log(`Starting ${PLUGIN_NAME} installation...`);

  try {
    // Read current configuration
    log(`Reading configuration from ${CONFIG_FILE}...`);
    const config = readConfig();

    // Check if already installed
    if (isPluginInstalled(config)) {
      log(`${PLUGIN_NAME} is already installed. Skipping installation.`, "info");
      log("To reinstall, first remove the plugin from openclaw.json", "info");
      return;
    }

    // Install plugin
    log("Installing plugin configuration...");
    installPlugin(config);

    // Write updated configuration
    log("Writing updated configuration...");
    writeConfig(config);

    // Success
    log(`${PLUGIN_NAME} installed successfully!`, "success");
    log("");
    log("Next steps:");
    log("  1. Restart OpenClaw Gateway: openclaw gateway restart");
    log("  2. The plugin will automatically clone skills from GitHub on first use");
    log("  3. Use the 'skill' tool to load the interactive-slides skill");
    log("");
    log("Configuration location:", "info");
    log(`  ${CONFIG_FILE}`, "info");

  } catch (error) {
    log(`Installation failed: ${error.message}`, "error");
    process.exit(1);
  }
}

// Run installation
main();
