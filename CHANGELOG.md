# Changelog

All notable changes to the Interactive Slides OpenClaw Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- JSDoc documentation for all public functions and types
- Enhanced update validation with proper error handling when no skills load after update

### Changed
- Simplified skill loading to read directly from cloned repo root (`SKILL.md`)
- Removed redundant `skills/` subdirectory (using cloned repo directly)

### Fixed
- Update tool now properly handles edge case where git pull succeeds but no skills are loaded

## [1.0.0] - 2026-03-31

### Added
- Initial release of Interactive Slides OpenClaw Plugin
- Auto-fetch skill from GitHub on first launch
- Smart detection of presentation-related tasks (Chinese & English keywords)
- Manual skill loading via `skill()` tool
- Version management with `interactive_slides_version()` tool
- Update functionality with `update_interactive_slides()` tool
- Configurable options:
  - `enabled` - Enable/disable plugin
  - `skillsRepo` - GitHub repository URL
  - `autoDetectPresentations` - Auto-detect presentation tasks
- Prompt injection via `before_prompt_build` event
- Local skills directory support with cache fallback

### Technical Details
- Built with OpenClaw Plugin SDK
- Dependencies: `@sinclair/typebox` for tool parameter validation
- Git-based skill caching in `.interactive-slides-cache/` directory
- Bilingual keyword detection (Chinese & English)

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-03-31 | Initial release |
