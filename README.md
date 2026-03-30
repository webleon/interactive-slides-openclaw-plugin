# Interactive Slides OpenClaw Plugin

Bridge to [Interactive Slides](https://github.com/sylvial928/interactive-slides) skill for OpenClaw - create beautiful, animated web presentations with brand kit support and PPTX export.

## Features

- ✅ **Auto-fetch skill** - Automatically clones skill from GitHub on first launch
- ✅ **Smart detection** - Intelligently loads skill for presentation-related tasks
- ✅ **Manual loading** - Provides `skill` tool for explicit skill loading
- ✅ **Version management** - Built-in tools to update and check skill version
- ✅ **Auto-configure** - One-command installation with automatic configuration
- ✅ **Configurable** - Options for auto-detect, auto-update, and custom repo

## Quick Start

### Option A: npm Install

```bash
npm install -g @webleon/interactive-slides-openclaw-plugin
openclaw plugins install @webleon/interactive-slides-openclaw-plugin
openclaw gateway restart
```

### Option B: Git Clone

```bash
cd ~/.openclaw/extensions
git clone https://github.com/webleon/interactive-slides-openclaw-plugin.git
openclaw gateway restart
```

### Option C: Local Install with Auto-Configure

```bash
# Clone to temp directory
git clone https://github.com/webleon/interactive-slides-openclaw-plugin.git /tmp/is-plugin
cd /tmp/is-plugin
node install.js
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable the plugin |
| `skillsRepo` | string | `https://github.com/sylvial928/interactive-slides.git` | GitHub repository for skill |
| `autoDetectPresentations` | boolean | `true` | Auto-detect presentation tasks |
| `autoUpdate` | boolean | `false` | Auto-update skill on startup |

## Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `skill` | Load the Interactive Slides skill by name | `skill(name="interactive-slides")` |
| `update_interactive_slides` | Update skill from GitHub | `update_interactive_slides()` |
| `interactive_slides_version` | Check current skill version | `interactive_slides_version()` |

## Usage Examples

### Load the skill manually

```
skill(name="interactive-slides")
```

### Check version

```
interactive_slides_version()
```

Output:
```
📦 Skills version: abc1234 (Wed Mar 25 11:08:00 2026 -0700)
```

### Update skill

```
update_interactive_slides()
```

## What You Get

Once the skill is loaded, you can:

- **Create interactive presentations** - Beautiful, animated HTML decks
- **Use brand kit support** - Bring your colors, fonts, logo
- **Choose from 10 style presets** - Curated visual styles
- **Export to PowerPoint** - One-click .pptx export
- **Three presentation modes** - Slide Deck, Scroll Story, Interactive Deck

## Example Workflow

```
User: Create an interactive presentation about our Q1 results

Agent: [Loads interactive-slides skill automatically]

Agent: I'll help you create an interactive presentation. Let me ask a few questions:

1. Who is the audience? (investors, team, customers?)
2. Do you have a brand kit or should I show you style presets?
3. What delivery mode do you prefer? (slide deck, scroll story, or interactive deck?)

[After discovery and content creation]

Agent: Here's your interactive presentation! Would you like an editable .pptx version?
```

## Troubleshooting

### Skill Not Auto-Loading

**Symptom:** Skill doesn't load automatically for presentation tasks

**Solution:**
```bash
# Verify plugin is enabled
cat ~/.openclaw/openclaw.json | jq '.plugins.entries["interactive-slides-openclaw-plugin"]'

# Manually load the skill
skill(name="interactive-slides")
```

### Plugin Not Loading

**Symptom:** `openclaw plugins list` shows plugin as "disabled" or "not found"

**Solution:**
```bash
# Check if plugin is in allow list
cat ~/.openclaw/openclaw.json | grep -A 5 '"allow"'

# Verify plugin files exist
ls -la ~/.openclaw/extensions/interactive-slides-openclaw-plugin/

# Check gateway logs
openclaw logs | grep -i "interactive-slides"

# Restart gateway
openclaw gateway restart
```

### Check Cache Status

```bash
ls -la ~/.openclaw/extensions/interactive-slides-openclaw-plugin/.interactive-slides-cache/
```

### Verify Plugin is Loaded

```bash
openclaw plugins list | grep interactive-slides
openclaw plugins inspect interactive-slides-openclaw-plugin
```

### Manual Skill Update

```bash
cd ~/.openclaw/extensions/interactive-slides-openclaw-plugin/.interactive-slides-cache
git pull
openclaw gateway restart
```

### Update Plugin

```bash
# If installed from git
cd ~/.openclaw/extensions/interactive-slides-openclaw-plugin
git pull
openclaw gateway restart

# Or use the tool
update_interactive_slides()
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|---------|
| "Skills not yet cloned" | First run, network issue | Check internet, run `update_interactive_slides()` |
| "No skills loaded" | Skills directory empty | Delete `.interactive-slides-cache/` and restart |
| "Plugin disabled" | Not in plugins.allow | Run install.js or add manually |
| "Clone failed" | Git/network problem | Check git, proxy, firewall |

### Get Help

```bash
# Check plugin status
openclaw plugins inspect interactive-slides-openclaw-plugin

# View recent logs
openclaw logs --tail 50 | grep -i "interactive-slides"

# Verify configuration
cat ~/.openclaw/openclaw.json | jq '.plugins'
```

## Directory Structure

```
interactive-slides-openclaw-plugin/
├── index.ts                 # Plugin main code
├── openclaw.plugin.json     # OpenClaw plugin manifest
├── package.json             # npm config
├── install.js               # Auto-installer script
├── README.md                # This file
├── .gitignore               # Git ignore rules
└── .interactive-slides-cache/  # Auto-downloaded skill (generated)
    └── skills/              # Interactive Slides skill directory
```

## What Gets Installed

When you run the installer:

1. **Plugin files** → `~/.openclaw/extensions/interactive-slides-openclaw-plugin/`
2. **Config update** → `plugins.allow` and `plugins.entries` in `openclaw.json`
3. **Skills cache** → `~/.openclaw/extensions/.../.interactive-slides-cache/`
4. **Dependencies** → `node_modules/` in plugin directory

## Development

```bash
# Clone for development
git clone https://github.com/webleon/interactive-slides-openclaw-plugin.git
cd interactive-slides-openclaw-plugin

# Make changes, then copy to extensions
cp *.ts *.json ~/.openclaw/extensions/interactive-slides-openclaw-plugin/
openclaw gateway restart
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR on GitHub.

## Acknowledgments

- [sylvial928/interactive-slides](https://github.com/sylvial928/interactive-slides) - Original Interactive Slides skill
- [webleon/superpowers-openclaw-plugin](https://github.com/webleon/superpowers-openclaw-plugin) - Plugin architecture reference
- [OpenClaw](https://github.com/openclaw/openclaw) - AI agent framework
