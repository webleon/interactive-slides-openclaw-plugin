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

## Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `skill` | Load the Interactive Slides skill by name | `skill(name="interactive-slides")` |
| `update_interactive_slides` | Update skill from GitHub | `update_interactive_slides()` |
| `interactive_slides_version` | Check current skill version | `interactive_slides_version()` |

## Troubleshooting

### Skill Not Auto-Loading

**Symptom:** Skill doesn't load automatically for presentation tasks

**Solution:**
```bash
# Manually load the skill
skill(name="interactive-slides")
```

### Plugin Not Loading

**Symptom:** `openclaw plugins list` shows plugin as "disabled" or "not found"

**Solution:**
```bash
# Check if plugin is in allow list
cat ~/.openclaw/openclaw.json | grep -A 5 '"allow"'

# Restart gateway
openclaw gateway restart
```

## License

MIT
