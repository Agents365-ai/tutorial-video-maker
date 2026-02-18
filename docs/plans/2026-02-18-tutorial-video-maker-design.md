# tutorial-video-maker Skill Design

## Overview

A new Claude Code skill for creating tutorial/demonstration videos with user-provided materials (screen recordings, screenshots) and AI-assisted narration.

## Problem Statement

`video-podcast-maker` is optimized for news/analysis videos where AI generates all content from a topic. For tutorial videos:
- User already has screen recordings and screenshots
- AI should assist with narration, not create visuals
- Timeline follows video duration, not script length

## Requirements

| Requirement | Value |
|-------------|-------|
| Input | Screen recordings + screenshots + outline |
| Output | B站横屏视频 (16:9, 1080p/4K) |
| AI Role | Write narration script + TTS + assemble video |
| Timeline | Video duration drives narration length |
| Tech Stack | Remotion (reuse video-podcast-maker components) |

## Directory Structure

```
tutorials/{tutorial-name}/
├── outline.md              # Required: topic outline
├── assets/                 # User materials
│   ├── 01_intro.mp4       # Screen recording
│   ├── 02_setup.png       # Or screenshots
│   └── ...
├── script.txt              # AI-generated narration
├── audio.wav               # TTS audio
├── audio.srt               # Subtitles
├── timing.json             # Timeline
└── final_video.mp4         # Output
```

## outline.md Format

```markdown
# Tutorial Title

## Target Audience
Description of target audience

## Chapters

### 01_intro
- Asset: intro.mp4 (15s)
- Points:
  - Point 1
  - Point 2

- Annotations:
  - 0:05 arrow (1200, 300) "Click here"
  - 0:10 highlight (100, 200, 400, 60)

### 02_setup
- Asset: setup.mp4 (30s)
- Points:
  - Point 1
  - Point 2
```

## Workflow (14 Steps)

| Step | Tool | Input | Output |
|------|-----|------|------|
| 0 | Claude | Name | Directory structure |
| 1 | User | Recordings | `assets/` |
| 2 | User+Claude | Points | `outline.md` |
| 3 | FFmpeg | Videos | Duration info |
| 4 | Claude | Outline+duration | `script.txt` |
| 5 | generate_tts.py | Script | `audio.wav`, `audio.srt` |
| 6 | Claude | Durations | `timing.json` |
| 7 | Claude | timing.json | React components |
| 8 | Remotion | Components | `output.mp4` |
| 9 | FFmpeg | output.mp4 | `video_with_bgm.mp4` |
| 10 | FFmpeg | SRT | `final_video.mp4` |
| 11 | Claude | Outline | `publish_info.md` |
| 12 | Remotion/AI | Topic | `thumbnail.png` |
| 13 | FFmpeg | Final video | Verification |
| 14 | Bash | Temp files | Cleanup |

## Annotation System

| Type | Usage | Syntax |
|------|-------|--------|
| arrow | Point to area | `arrow (x, y) "text"` |
| highlight | Rectangle box | `highlight (x, y, w, h)` |
| circle | Circle emphasis | `circle (x, y) radius=N` |
| text | Text label | `text (x, y) "content"` |
| zoom | Magnify area | `zoom (x, y, w, h) scale=N` |
| blur | Hide sensitive | `blur (x, y, w, h)` |
| cursor | Virtual mouse | `cursor (x, y)` |

## Component Reuse

From `video-podcast-maker`:
- `FullBleedLayout.tsx` - Layout system
- `generate_tts.py` - TTS generation
- BGM files

New components:
- `<ScreenRecording>` - Video playback
- `<ScreenshotSequence>` - Screenshot slideshow
- `<Annotation>` - Arrow, highlight, etc.
- `<StepIndicator>` - Step number
- `<KeyHighlight>` - Keyboard shortcut display

## Key Differences from video-podcast-maker

| Aspect | video-podcast-maker | tutorial-video-maker |
|--------|---------------------|---------------------|
| Input | Topic keyword | Recordings + outline |
| Research | AI web search | None (user has content) |
| Script | AI creates from scratch | AI writes narration for visuals |
| Visuals | AI-generated/web | User-provided |
| Timeline | Script-driven | Asset-driven |

## Timeline Alignment Strategy

Since video duration is the constraint:
1. Calculate max words per chapter (4 words/second)
2. Constrain script to word limit
3. Fine-tune TTS speed (Azure rate parameter)
4. Insert silence transitions if needed

## Quick Start Command

```
/tutorial-video-maker "How to use LM Studio for web search"
```

## Next Steps

1. Create `~/.claude/skills/tutorial-video-maker/` directory
2. Write SKILL.md with workflow details
3. Implement annotation components in Remotion
4. Create template files (outline.md template)
5. Test with a real tutorial video
