/**
 * Interactive Slides OpenClaw Plugin
 * 
 * Bridge to Interactive Slides skill from GitHub.
 * Based on https://github.com/sylvial928/interactive-slides
 * 
 * Features:
 * - Auto-fetch skill from GitHub on first launch
 * - Smart detection of presentation-related tasks
 * - Manual skill loading via tool
 * - Version management and updates
 * - Configurable auto-update
 */

import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

// ============================================================================
// Types
// ============================================================================

interface PluginConfig {
  enabled?: boolean;
  skillsRepo?: string;
  autoDetectPresentations?: boolean;
  autoUpdate?: boolean;
}

interface Skill {
  name: string;
  description: string;
  content: string;
}

interface VersionResult {
  success: boolean;
  version?: string;
  message: string;
}

interface UpdateResult {
  success: boolean;
  message: string;
}

interface LoadSkillsResult {
  skills: Map<string, Skill>;
  count: number;
  errors: string[];
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SKILLS_REPO = "https://github.com/sylvial928/interactive-slides.git";
const SKILLS_SUBDIR = "skills";
const CACHE_DIR_NAME = ".interactive-slides-cache";
const PLUGIN_NAME = "Interactive Slides OpenClaw Plugin";

// ============================================================================
// Keyword Detection
// ============================================================================

// Chinese keywords for presentation-related tasks
const CHINESE_KEYWORDS: Record<string, string[]> = {
  "interactive-slides": [
    "演示文稿", "演示", "幻灯片", "PPT", "演讲", "展示", "汇报",
    "presentation", "slides", "powerpoint", "deck", "pitch"
  ]
};

// English keywords (lowercase comparison)
const ENGLISH_KEYWORDS: Record<string, string[]> = {
  "interactive-slides": [
    "presentation", "slides", "powerpoint", "deck", "pitch",
    "create presentation", "make slides", "create deck"
  ]
};

// ============================================================================
// Helper Functions
// ============================================================================

function getCacheDir(pluginDir: string): string {
  return path.join(pluginDir, CACHE_DIR_NAME);
}

function getSkillsDir(cacheDir: string): string {
  return path.join(cacheDir, "skills");
}

function ensureSkills(repoUrl: string, pluginDir: string, logger: any): { success: boolean; skillsDir: string; message: string } {
  const cacheDir = getCacheDir(pluginDir);
  const skillsDir = getSkillsDir(cacheDir);

  // Check if already cloned
  if (fs.existsSync(path.join(cacheDir, ".git"))) {
    return { success: true, skillsDir, message: "Skills already cached" };
  }

  // Need to clone
  logger.info(`[${PLUGIN_NAME}] First run - cloning skills from ${repoUrl}...`);
  
  try {
    // Create cache directory parent if needed
    const parentDir = path.dirname(cacheDir);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Clone the repo with shallow depth for faster download
    execSync(`git clone --depth 1 "${repoUrl}" "${cacheDir}"`, {
      stdio: "pipe",
      timeout: 120000, // 2 minutes timeout for clone
    });

    logger.info(`[${PLUGIN_NAME}] Successfully cloned skills to ${cacheDir}`);
    return { success: true, skillsDir, message: "Skills cloned successfully" };
  } catch (err: any) {
    const message = err.message || String(err);
    logger.error(`[${PLUGIN_NAME}] Failed to clone skills: ${message}`);
    return { success: false, skillsDir, message: `Clone failed: ${message}` };
  }
}

function updateSkills(pluginDir: string, logger: any): UpdateResult {
  const cacheDir = getCacheDir(pluginDir);

  if (!fs.existsSync(path.join(cacheDir, ".git"))) {
    return { success: false, message: "Skills not yet cloned. Plugin will auto-clone on next start." };
  }

  try {
    logger.info(`[${PLUGIN_NAME}] Updating skills...`);
    const output = execSync("git pull", {
      cwd: cacheDir,
      stdio: "pipe",
      encoding: "utf-8",
      timeout: 60000,
    });
    
    logger.info(`[${PLUGIN_NAME}] Skills updated: ${output.trim()}`);
    return { success: true, message: output.trim() || "Already up to date" };
  } catch (err: any) {
    const message = err.message || String(err);
    logger.error(`[${PLUGIN_NAME}] Failed to update skills: ${message}`);
    return { success: false, message: `Update failed: ${message}` };
  }
}

function getSkillsVersion(pluginDir: string, logger: any): VersionResult {
  const cacheDir = getCacheDir(pluginDir);

  if (!fs.existsSync(path.join(cacheDir, ".git"))) {
    return { success: false, message: "Skills not yet cloned" };
  }

  try {
    const commit = execSync("git rev-parse --short HEAD", {
      cwd: cacheDir,
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();
    
    const date = execSync("git log -1 --format=%cd", {
      cwd: cacheDir,
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();

    return { 
      success: true, 
      version: commit, 
      message: `Skills version: ${commit} (${date})` 
    };
  } catch (err: any) {
    return { success: false, message: `Failed to get version: ${err.message}` };
  }
}

function parseSkill(content: string, filename: string, logger: any): Skill | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    logger.warn(`[${PLUGIN_NAME}] No frontmatter found in ${filename}`);
    return null;
  }

  const frontmatterStr = match[1];
  const body = match[2].trim();

  const nameMatch = frontmatterStr.match(/name:\s*(.+)/);
  const descMatch = frontmatterStr.match(/description:\s*(.+)/);

  if (!nameMatch) {
    logger.warn(`[${PLUGIN_NAME}] No name in frontmatter of ${filename}`);
    return null;
  }

  return {
    name: nameMatch[1].trim().replace(/^["']|["']$/g, ""),
    description: descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, "") : "",
    content: body,
  };
}

function loadSkills(skillsDir: string, logger: any): LoadSkillsResult {
  const skills = new Map<string, Skill>();
  const errors: string[] = [];

  if (!fs.existsSync(skillsDir)) {
    logger.warn(`[${PLUGIN_NAME}] Skills directory not found: ${skillsDir}`);
    return { skills, count: 0, errors: [`Directory not found: ${skillsDir}`] };
  }

  const startTime = Date.now();
  
  // Look for SKILL.md files in skills subdirectory
  const skillsSubdir = path.join(skillsDir, SKILLS_SUBDIR);
  const skillFiles = [
    path.join(skillsSubdir, "interactive-slides", "SKILL.md"),
    path.join(skillsDir, "SKILL.md"),
    path.join(skillsDir, "interactive-slides", "SKILL.md")
  ];

  for (const skillPath of skillFiles) {
    if (!fs.existsSync(skillPath)) continue;

    try {
      const content = fs.readFileSync(skillPath, "utf-8");
      const skill = parseSkill(content, skillPath, logger);
      if (skill) {
        skills.set(skill.name, skill);
        logger.debug(`[${PLUGIN_NAME}] Loaded skill: ${skill.name}`);
      }
    } catch (err: any) {
      const errorMsg = `Failed to load ${skillPath}: ${err.message}`;
      errors.push(errorMsg);
      logger.error(`[${PLUGIN_NAME}] ${errorMsg}`);
    }
  }

  const loadTime = Date.now() - startTime;
  logger.debug(`[${PLUGIN_NAME}] Loaded ${skills.size} skills in ${loadTime}ms`);

  return { skills, count: skills.size, errors };
}

function detectRelevantSkills(prompt: string, skills: Map<string, Skill>): string[] {
  const relevant = new Set<string>();

  // Detect by Chinese keywords (no case conversion)
  for (const [skillName, keywords] of Object.entries(CHINESE_KEYWORDS)) {
    if (skills.has(skillName) && keywords.some(kw => prompt.includes(kw))) {
      relevant.add(skillName);
    }
  }

  // Detect by English keywords (lowercase comparison)
  const promptLower = prompt.toLowerCase();
  for (const [skillName, keywords] of Object.entries(ENGLISH_KEYWORDS)) {
    if (skills.has(skillName) && keywords.some(kw => promptLower.includes(kw.toLowerCase()))) {
      relevant.add(skillName);
    }
  }

  return Array.from(relevant);
}

function buildSkillsContext(skills: Map<string, Skill>, skillNames: string[]): string {
  const sections: string[] = [];

  sections.push(`# 🎨 Interactive Slides Skill`);
  sections.push(``);
  sections.push(`You have access to the Interactive Slides skill for creating beautiful, animated web presentations.`);
  sections.push(``);

  for (const name of skillNames) {
    const skill = skills.get(name);
    if (!skill) continue;

    sections.push(`## ${skill.name}`);
    if (skill.description) {
      sections.push(`*${skill.description}*`);
    }
    sections.push(``);
    sections.push(skill.content);
    sections.push(``);
    sections.push(`---`);
    sections.push(``);
  }

  return sections.join("\n");
}

// ============================================================================
// Plugin Definition
// ============================================================================

export default definePluginEntry({
  id: "interactive-slides-openclaw-plugin",
  name: "Interactive Slides OpenClaw Plugin",
  description: "Bridge to Interactive Slides skill for OpenClaw - create beautiful presentations",
  kind: "extension",

  register(api: OpenClawPluginApi) {
    const startTime = Date.now();
    const config = (api.pluginConfig || {}) as PluginConfig;
    const pluginDir = path.dirname(new URL(import.meta.url).pathname);

    // Check if plugin is enabled
    if (config.enabled === false) {
      api.logger.info(`[${PLUGIN_NAME}] Plugin disabled via config`);
      return;
    }

    const repoUrl = config.skillsRepo || DEFAULT_SKILLS_REPO;
    const autoDetect = config.autoDetectPresentations !== false;

    // Ensure skills are available
    const { success, skillsDir, message } = ensureSkills(repoUrl, pluginDir, api.logger);
    
    if (!success) {
      api.logger.error(`[${PLUGIN_NAME}] Failed to initialize: ${message}`);
      api.logger.warn(`[${PLUGIN_NAME}] Plugin will be disabled until skills are available`);
      return;
    }

    // Load all skills
    const { skills, count, errors } = loadSkills(skillsDir, api.logger);
    api.logger.info(`[${PLUGIN_NAME}] Loaded ${count} skills in ${Date.now() - startTime}ms`);

    if (errors.length > 0) {
      api.logger.warn(`[${PLUGIN_NAME}] ${errors.length} skills failed to load`);
    }

    if (count === 0) {
      api.logger.error(`[${PLUGIN_NAME}] No skills loaded. Plugin disabled.`);
      return;
    }

    // Inject relevant skills on prompt build
    api.on("before_prompt_build", (event) => {
      const prompt = event.prompt || "";

      // Detect relevant skills
      const relevantSkills = autoDetect
        ? detectRelevantSkills(prompt, skills)
        : [];

      if (relevantSkills.length === 0) {
        return {};
      }

      const guidance = buildSkillsContext(skills, relevantSkills);
      api.logger.debug(`[${PLUGIN_NAME}] Injecting ${relevantSkills.length} skills: ${relevantSkills.join(", ")}`);

      return {
        appendSystemContext: guidance,
      };
    });

    // ========================================================================
    // Tool: skill(name)
    // ========================================================================
    api.registerTool({
      name: "skill",
      description: "Load and apply the Interactive Slides skill by name.",
      parameters: Type.Object({
        name: Type.String({ 
          description: "Name of the skill to load (e.g., interactive-slides)" 
        }),
      }),
      async execute(_id, params) {
        const skill = skills.get(params.name);
        if (!skill) {
          const available = Array.from(skills.keys()).join(", ");
          return {
            content: [{ 
              type: "text", 
              text: `❌ Skill '${params.name}' not found.\n\nAvailable skills: ${available}` 
            }],
          };
        }

        return {
          content: [{ 
            type: "text", 
            text: `✅ Loaded skill: ${skill.name}\n\n${skill.description}\n\n---\n\n${skill.content}` 
          }],
        };
      },
    });

    // ========================================================================
    // Tool: update_interactive_slides()
    // ========================================================================
    api.registerTool({
      name: "update_interactive_slides",
      description: "Update Interactive Slides skill to the latest version from GitHub (git pull). Call this to refresh the skill.",
      parameters: Type.Object({}),
      async execute(_id, _params) {
        const updateStart = Date.now();
        const result = updateSkills(pluginDir, api.logger);
        
        if (result.success) {
          // Reload skills after update
          const { skills: newSkills, count: newCount } = loadSkills(skillsDir, api.logger);
          
          if (newCount > 0) {
            skills.clear();
            for (const [name, skill] of newSkills) {
              skills.set(name, skill);
            }
            api.logger.info(`[${PLUGIN_NAME}] Reloaded ${newCount} skills after update in ${Date.now() - updateStart}ms`);
          }
        }
        
        return {
          content: [{ type: "text", text: result.success ? `📦 ${result.message}` : `⚠️ ${result.message}` }],
        };
      },
    });

    // ========================================================================
    // Tool: interactive_slides_version()
    // ========================================================================
    api.registerTool({
      name: "interactive_slides_version",
      description: "Check the current version/commit of Interactive Slides skill. Returns git commit hash and date.",
      parameters: Type.Object({}),
      async execute(_id, _params) {
        const result = getSkillsVersion(pluginDir, api.logger);
        return {
          content: [{ type: "text", text: result.success ? `📦 ${result.message}` : `⚠️ ${result.message}` }],
        };
      },
    });

    api.logger.info(`[${PLUGIN_NAME}] Plugin registered with tools: skill, update_interactive_slides, interactive_slides_version`);
  },
});
