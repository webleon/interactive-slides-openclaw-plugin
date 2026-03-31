import { describe, it, expect } from 'vitest';

// These constants should match what's defined in index.ts
const DEFAULT_SKILLS_REPO = "https://github.com/sylvial928/interactive-slides.git";
const SKILLS_SUBDIR = "skills";
const CACHE_DIR_NAME = ".interactive-slides-cache";

describe('Plugin Constants', () => {
  it('should have correct default skills repo URL', () => {
    expect(DEFAULT_SKILLS_REPO).toBe('https://github.com/sylvial928/interactive-slides.git');
  });

  it('should have correct cache directory name', () => {
    expect(CACHE_DIR_NAME).toBe('.interactive-slides-cache');
  });

  it('should have correct skills subdirectory', () => {
    expect(SKILLS_SUBDIR).toBe('skills');
  });
});

describe('Keyword Detection', () => {
  const CHINESE_KEYWORDS: Record<string, string[]> = {
    "interactive-slides": [
      "演示文稿", "演示", "幻灯片", "PPT", "演讲", "展示", "汇报",
      "presentation", "slides", "powerpoint", "deck", "pitch"
    ]
  };

  const ENGLISH_KEYWORDS: Record<string, string[]> = {
    "interactive-slides": [
      "presentation", "slides", "powerpoint", "deck", "pitch",
      "create presentation", "make slides", "create deck"
    ]
  };

  function detectRelevantSkills(prompt: string, availableSkills: string[]): string[] {
    const relevant = new Set<string>();

    // Detect by Chinese keywords (no case conversion)
    for (const [skillName, keywords] of Object.entries(CHINESE_KEYWORDS)) {
      if (availableSkills.includes(skillName) && keywords.some(kw => prompt.includes(kw))) {
        relevant.add(skillName);
      }
    }

    // Detect by English keywords (lowercase comparison)
    const promptLower = prompt.toLowerCase();
    for (const [skillName, keywords] of Object.entries(ENGLISH_KEYWORDS)) {
      if (availableSkills.includes(skillName) && keywords.some(kw => promptLower.includes(kw.toLowerCase()))) {
        relevant.add(skillName);
      }
    }

    return Array.from(relevant);
  }

  it('should detect Chinese keywords', () => {
    const result = detectRelevantSkills('帮我做一个演示文稿', ['interactive-slides']);
    expect(result).toContain('interactive-slides');
  });

  it('should detect English keywords', () => {
    const result = detectRelevantSkills('Create a presentation', ['interactive-slides']);
    expect(result).toContain('interactive-slides');
  });

  it('should be case-insensitive for English', () => {
    const result = detectRelevantSkills('CREATE A PRESENTATION', ['interactive-slides']);
    expect(result).toContain('interactive-slides');
  });

  it('should return empty for unrelated prompts', () => {
    const result = detectRelevantSkills('What is the weather?', ['interactive-slides']);
    expect(result).toHaveLength(0);
  });

  it('should detect PPT keyword', () => {
    const result = detectRelevantSkills('做一个 PPT', ['interactive-slides']);
    expect(result).toContain('interactive-slides');
  });
});
