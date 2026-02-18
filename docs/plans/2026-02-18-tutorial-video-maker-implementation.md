# tutorial-video-maker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a Claude Code skill for making tutorial/demonstration videos with user-provided screen recordings and AI-generated narration.

**Architecture:** Asset-driven workflow where video duration constrains narration length. Reuse video-podcast-maker components (FullBleedLayout.tsx, generate_tts.py). Add annotation system for arrows, highlights, etc.

**Tech Stack:** Claude Code Skill, Remotion, FFmpeg, Azure TTS, Python

---

## Task 1: Create Skill Skeleton

**Files:**
- Create: `SKILL.md`
- Create: `CLAUDE.md`
- Create: `README.md`
- Create: `templates/outline.md`

**Step 1: Create SKILL.md**

```markdown
---
name: tutorial-video-maker
description: Create tutorial videos from screen recordings with AI-generated narration and annotations
---

# Tutorial Video Maker

## Quick Start

```
/tutorial-video-maker "How to use LM Studio for web search"
```

## Workflow

| Step | Tool | Output |
|------|------|--------|
| 0 | Claude | Project directory |
| 1 | User | `assets/` with recordings |
| 2 | Claude | `outline.md` |
| 3 | FFmpeg | Duration analysis |
| 4 | Claude | `script.txt` |
| 5 | generate_tts.py | `audio.wav`, `audio.srt` |
| 6 | Claude | `timing.json` |
| 7 | Remotion | Video composition |
| 8 | FFmpeg | `final_video.mp4` |

## Step 0: Create Project

```bash
mkdir -p tutorials/{name}/assets
cp ~/.claude/skills/tutorial-video-maker/templates/outline.md tutorials/{name}/
```

## Step 1: Prepare Assets

User places screen recordings and screenshots in `assets/`:
- `01_intro.mp4` - Screen recording
- `02_setup.png` - Screenshot
- Videos should be 16:9 aspect ratio

## Step 2: Write Outline

Edit `outline.md` with chapter structure:

```markdown
# Tutorial Title

## Target Audience
Description

## Chapters

### 01_intro
- Asset: intro.mp4 (15s)
- Points:
  - Introduction point
  - Goal of tutorial

- Annotations:
  - 0:05 arrow (1200, 300) "Click here"
  - 0:10 highlight (100, 200, 400, 60)
```

## Step 3: Analyze Assets

```bash
for f in tutorials/{name}/assets/*.mp4; do
  echo "$f: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f")s"
done
```

## Step 4: Generate Script

AI writes narration script constrained by asset duration:
- 4 words/second target
- Must fit within video length
- Save to `script.txt`

## Step 5: TTS Synthesis

```bash
cp ~/.claude/skills/video-podcast-maker/generate_tts.py .
python3 generate_tts.py --input tutorials/{name}/script.txt --output-dir tutorials/{name}
```

## Step 6: Timeline Alignment

Generate `timing.json` matching narration to video segments.

## Step 7: Create Remotion Composition

Generate React components using:
- `FullBleedLayout.tsx` from video-podcast-maker
- `Annotations.tsx` for arrows/highlights
- `ScreenRecording.tsx` for video playback

## Step 8: Render and Finalize

```bash
npx remotion render src/remotion/index.ts Tutorial tutorials/{name}/output.mp4 --video-bitrate 16M
```

Add BGM and subtitles:

```bash
ffmpeg -y -i output.mp4 -stream_loop -1 -i bgm.mp3 \
  -filter_complex "[0:a]volume=1.0[a1];[1:a]volume=0.05[a2];[a1][a2]amix=inputs=2:duration=first[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac final_video.mp4
```

## Annotation Syntax

| Type | Syntax | Example |
|------|--------|---------|
| arrow | `arrow (x, y) "text"` | `0:05 arrow (500, 300) "Click here"` |
| highlight | `highlight (x, y, w, h)` | `0:10 highlight (100, 200, 400, 60)` |
| circle | `circle (x, y) radius=N` | `0:15 circle (800, 400) radius=50` |
| text | `text (x, y) "content"` | `0:20 text (500, 500) "Step 1"` |
| zoom | `zoom (x, y, w, h) scale=N` | `0:25 zoom (600, 300, 200, 100) scale=2` |
| blur | `blur (x, y, w, h)` | `0:30 blur (0, 0, 200, 50)` |

## Output Structure

```
tutorials/{name}/
├── outline.md
├── assets/
│   ├── 01_intro.mp4
│   └── 02_setup.png
├── script.txt
├── audio.wav
├── audio.srt
├── timing.json
└── final_video.mp4
```

## Related Skills

- @video-podcast-maker - Knowledge video generation
- @remotion - Remotion best practices
- @ffmpeg - Video processing
```

**Step 2: Create CLAUDE.md**

```markdown
# tutorial-video-maker - Project Instructions

## Git Commits
- Do NOT add `Co-Authored-By` lines to commits in this repository

## Code Style
- Keep scripts minimal and functional
- No type hints or docstrings unless necessary
- Use simple print statements for output
```

**Step 3: Create templates/outline.md**

```markdown
# [Tutorial Title]

## Target Audience

[Describe who this tutorial is for]

## Chapters

### 01_intro
- Asset: [filename.mp4 or filename.png]
- Points:
  - [Key point 1]
  - [Key point 2]

- Annotations:
  - [timestamp] [type] (x, y) ["text"]

### 02_content
- Asset: [filename.mp4]
- Points:
  - [Key point 1]
  - [Key point 2]

### 03_summary
- Asset: none
- Points:
  - [Summary point]
  - [Call to action]
```

**Step 4: Create README.md**

```markdown
# Tutorial Video Maker

A Claude Code skill for creating tutorial videos from screen recordings with AI-generated narration.

## Features

- Screen recording + screenshot support
- AI-generated narration scripts
- Annotation system (arrows, highlights, zoom)
- Azure TTS audio synthesis
- Remotion-based video composition

## Usage

```
/tutorial-video-maker "How to use LM Studio for web search"
```

## Requirements

- Node.js + Remotion
- Python + Azure TTS SDK
- FFmpeg

## License

MIT
```

**Step 5: Commit**

```bash
git add SKILL.md CLAUDE.md README.md templates/
git commit -m "Add skill skeleton with SKILL.md, CLAUDE.md, README, templates"
```

---

## Task 2: Create Annotation Components

**Files:**
- Create: `Annotations.tsx`

**Step 1: Create Annotations.tsx**

```tsx
/**
 * Annotation Components for Tutorial Videos
 *
 * Provides: Arrow, Highlight, Circle, TextLabel, Zoom, Blur, Cursor
 */
// @ts-nocheck
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'
import React from 'react'

// Animation hook for fade in/out
const useAnnotationOpacity = (startFrame: number, duration: number = 30) => {
  const frame = useCurrentFrame()
  const fadeIn = 10
  const fadeOut = 10

  if (frame < startFrame) return 0
  if (frame < startFrame + fadeIn) {
    return interpolate(frame - startFrame, [0, fadeIn], [0, 1])
  }
  if (frame < startFrame + duration - fadeOut) {
    return 1
  }
  if (frame < startFrame + duration) {
    return interpolate(frame - (startFrame + duration - fadeOut), [0, fadeOut], [1, 0])
  }
  return 0
}

// Arrow annotation
interface ArrowProps {
  x: number
  y: number
  text?: string
  startFrame: number
  duration?: number
  color?: string
}

export const Arrow: React.FC<ArrowProps> = ({
  x, y, text, startFrame, duration = 90, color = '#ef4444'
}) => {
  const opacity = useAnnotationOpacity(startFrame, duration)
  const frame = useCurrentFrame()

  // Bounce animation
  const bounce = frame >= startFrame ?
    Math.sin((frame - startFrame) * 0.3) * 5 : 0

  if (opacity === 0) return null

  return (
    <div style={{
      position: 'absolute',
      left: x - 60,
      top: y - 80 + bounce,
      opacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {text && (
        <div style={{
          background: color,
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 8,
          whiteSpace: 'nowrap',
        }}>
          {text}
        </div>
      )}
      <svg width="40" height="50" viewBox="0 0 40 50">
        <path d="M20 0 L40 30 L25 30 L25 50 L15 50 L15 30 L0 30 Z" fill={color} />
      </svg>
    </div>
  )
}

// Highlight rectangle
interface HighlightProps {
  x: number
  y: number
  width: number
  height: number
  startFrame: number
  duration?: number
  color?: string
}

export const Highlight: React.FC<HighlightProps> = ({
  x, y, width, height, startFrame, duration = 90, color = '#fbbf24'
}) => {
  const opacity = useAnnotationOpacity(startFrame, duration)
  const frame = useCurrentFrame()

  // Pulse animation
  const pulse = frame >= startFrame ?
    1 + Math.sin((frame - startFrame) * 0.2) * 0.05 : 1

  if (opacity === 0) return null

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: width * pulse,
      height: height * pulse,
      border: `4px solid ${color}`,
      borderRadius: 8,
      background: `${color}20`,
      opacity,
      transform: `translate(${(1 - pulse) * width / 2}px, ${(1 - pulse) * height / 2}px)`,
    }} />
  )
}

// Circle emphasis
interface CircleProps {
  x: number
  y: number
  radius?: number
  startFrame: number
  duration?: number
  color?: string
}

export const Circle: React.FC<CircleProps> = ({
  x, y, radius = 40, startFrame, duration = 90, color = '#ef4444'
}) => {
  const opacity = useAnnotationOpacity(startFrame, duration)
  const frame = useCurrentFrame()

  const pulse = frame >= startFrame ?
    1 + Math.sin((frame - startFrame) * 0.2) * 0.1 : 1

  if (opacity === 0) return null

  return (
    <div style={{
      position: 'absolute',
      left: x - radius * pulse,
      top: y - radius * pulse,
      width: radius * 2 * pulse,
      height: radius * 2 * pulse,
      border: `4px solid ${color}`,
      borderRadius: '50%',
      opacity,
    }} />
  )
}

// Text label
interface TextLabelProps {
  x: number
  y: number
  text: string
  startFrame: number
  duration?: number
  color?: string
  background?: string
}

export const TextLabel: React.FC<TextLabelProps> = ({
  x, y, text, startFrame, duration = 90, color = '#fff', background = '#1a1a1a'
}) => {
  const opacity = useAnnotationOpacity(startFrame, duration)

  if (opacity === 0) return null

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      background,
      color,
      padding: '12px 20px',
      borderRadius: 8,
      fontSize: 28,
      fontWeight: 600,
      opacity,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      {text}
    </div>
  )
}

// Zoom magnifier
interface ZoomProps {
  x: number
  y: number
  width: number
  height: number
  scale?: number
  startFrame: number
  duration?: number
}

export const Zoom: React.FC<ZoomProps> = ({
  x, y, width, height, scale = 2, startFrame, duration = 90
}) => {
  const opacity = useAnnotationOpacity(startFrame, duration)

  if (opacity === 0) return null

  return (
    <div style={{
      position: 'absolute',
      left: x + width + 20,
      top: y,
      width: width * scale,
      height: height * scale,
      border: '4px solid #3b82f6',
      borderRadius: 12,
      overflow: 'hidden',
      opacity,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        position: 'absolute',
        left: -x * scale,
        top: -y * scale,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}>
        {/* Video frame will be clipped here */}
      </div>
    </div>
  )
}

// Blur mask
interface BlurProps {
  x: number
  y: number
  width: number
  height: number
  startFrame: number
  duration?: number
  blurAmount?: number
}

export const Blur: React.FC<BlurProps> = ({
  x, y, width, height, startFrame, duration = 90, blurAmount = 20
}) => {
  const opacity = useAnnotationOpacity(startFrame, duration)

  if (opacity === 0) return null

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      backdropFilter: `blur(${blurAmount}px)`,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 4,
      opacity,
    }} />
  )
}

// Virtual cursor
interface CursorProps {
  x: number
  y: number
  startFrame: number
  duration?: number
}

export const Cursor: React.FC<CursorProps> = ({
  x, y, startFrame, duration = 90
}) => {
  const opacity = useAnnotationOpacity(startFrame, duration)

  if (opacity === 0) return null

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      opacity,
    }}>
      <svg width="24" height="36" viewBox="0 0 24 36">
        <path
          d="M0 0 L0 28 L7 21 L12 32 L16 30 L11 19 L20 19 Z"
          fill="#fff"
          stroke="#000"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

// Annotation parser
export interface ParsedAnnotation {
  type: 'arrow' | 'highlight' | 'circle' | 'text' | 'zoom' | 'blur' | 'cursor'
  startFrame: number
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  radius?: number
  scale?: number
}

export const parseAnnotation = (line: string, fps: number = 30): ParsedAnnotation | null => {
  // Format: "0:05 arrow (1200, 300) "Click here""
  const match = line.match(/^(\d+):(\d+)\s+(\w+)\s+\(([^)]+)\)(?:\s+"([^"]*)")?(?:\s+(\w+)=(\d+))?/)
  if (!match) return null

  const [, min, sec, type, coords, text, param, value] = match
  const startFrame = (parseInt(min) * 60 + parseInt(sec)) * fps
  const [x, y, w, h] = coords.split(',').map(s => parseInt(s.trim()))

  return {
    type: type as ParsedAnnotation['type'],
    startFrame,
    x,
    y,
    width: w,
    height: h,
    text,
    radius: param === 'radius' ? parseInt(value) : undefined,
    scale: param === 'scale' ? parseInt(value) : undefined,
  }
}
```

**Step 2: Commit**

```bash
git add Annotations.tsx
git commit -m "Add annotation components (Arrow, Highlight, Circle, Text, Zoom, Blur, Cursor)"
```

---

## Task 3: Create Screen Recording Component

**Files:**
- Create: `ScreenRecording.tsx`

**Step 1: Create ScreenRecording.tsx**

```tsx
/**
 * Screen Recording Component for Tutorial Videos
 *
 * Plays video assets with optional annotations overlay
 */
// @ts-nocheck
import { AbsoluteFill, Video, Img, Sequence, staticFile } from 'remotion'
import React from 'react'
import { Arrow, Highlight, Circle, TextLabel, Zoom, Blur, Cursor, ParsedAnnotation } from './Annotations'

interface ScreenRecordingProps {
  src: string
  type?: 'video' | 'image'
  annotations?: ParsedAnnotation[]
  startFrame?: number
}

export const ScreenRecording: React.FC<ScreenRecordingProps> = ({
  src,
  type = 'video',
  annotations = [],
  startFrame = 0,
}) => {
  const MediaComponent = type === 'video' ? Video : Img

  return (
    <AbsoluteFill>
      {/* Video/Image layer */}
      <MediaComponent
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          background: '#000',
        }}
        {...(type === 'video' ? { volume: 0 } : {})}
      />

      {/* Annotations layer */}
      {annotations.map((ann, i) => {
        const localStart = ann.startFrame - startFrame
        const props = { ...ann, startFrame: localStart, key: i }

        switch (ann.type) {
          case 'arrow':
            return <Arrow {...props} />
          case 'highlight':
            return <Highlight {...props} />
          case 'circle':
            return <Circle {...props} />
          case 'text':
            return <TextLabel {...props} />
          case 'zoom':
            return <Zoom {...props} />
          case 'blur':
            return <Blur {...props} />
          case 'cursor':
            return <Cursor {...props} />
          default:
            return null
        }
      })}
    </AbsoluteFill>
  )
}

// Screenshot sequence for multiple images
interface ScreenshotSequenceProps {
  images: string[]
  frameDuration: number
  annotations?: ParsedAnnotation[][]
}

export const ScreenshotSequence: React.FC<ScreenshotSequenceProps> = ({
  images,
  frameDuration,
  annotations = [],
}) => {
  return (
    <AbsoluteFill>
      {images.map((src, i) => (
        <Sequence key={i} from={i * frameDuration} durationInFrames={frameDuration}>
          <ScreenRecording
            src={src}
            type="image"
            annotations={annotations[i] || []}
            startFrame={i * frameDuration}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
```

**Step 2: Commit**

```bash
git add ScreenRecording.tsx
git commit -m "Add ScreenRecording component with annotation support"
```

---

## Task 4: Create Outline Parser Script

**Files:**
- Create: `scripts/parse_outline.py`

**Step 1: Create parse_outline.py**

```python
#!/usr/bin/env python3
"""
Parse outline.md and extract chapter info with annotations
Outputs JSON for Remotion consumption
"""
import sys
import re
import json
import subprocess

def get_duration(filepath):
    """Get video duration in seconds using ffprobe"""
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', filepath],
            capture_output=True, text=True
        )
        return float(result.stdout.strip())
    except:
        return 0

def parse_outline(filepath, assets_dir):
    with open(filepath, 'r') as f:
        content = f.read()

    # Extract title
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else 'Tutorial'

    # Extract target audience
    audience_match = re.search(r'## Target Audience\n+(.+?)(?=\n#|\Z)', content, re.DOTALL)
    audience = audience_match.group(1).strip() if audience_match else ''

    # Extract chapters
    chapters = []
    chapter_pattern = r'### (\d+_\w+)\n(.+?)(?=\n### |\Z)'

    for match in re.finditer(chapter_pattern, content, re.DOTALL):
        name = match.group(1)
        body = match.group(2)

        # Parse asset
        asset_match = re.search(r'- Asset: ([^\n]+)', body)
        asset = asset_match.group(1).strip() if asset_match else None

        # Parse duration from asset name or probe video
        duration = 0
        if asset and asset != 'none':
            asset_path = f"{assets_dir}/{asset.split()[0]}"
            duration_match = re.search(r'\((\d+)s\)', asset)
            if duration_match:
                duration = int(duration_match.group(1))
            elif asset_path.endswith('.mp4'):
                duration = get_duration(asset_path)

        # Parse points
        points = []
        points_section = re.search(r'- Points:\n((?:\s+- .+\n?)+)', body)
        if points_section:
            points = re.findall(r'\s+- (.+)', points_section.group(1))

        # Parse annotations
        annotations = []
        ann_section = re.search(r'- Annotations:\n((?:\s+- .+\n?)+)', body)
        if ann_section:
            for line in re.findall(r'\s+- (.+)', ann_section.group(1)):
                annotations.append(line.strip())

        chapters.append({
            'name': name,
            'asset': asset.split()[0] if asset and asset != 'none' else None,
            'duration': duration,
            'points': points,
            'annotations': annotations,
        })

    # Calculate word limits (4 words/second)
    for ch in chapters:
        ch['max_words'] = int(ch['duration'] * 4) if ch['duration'] > 0 else 100

    return {
        'title': title,
        'audience': audience,
        'chapters': chapters,
        'total_duration': sum(ch['duration'] for ch in chapters),
    }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: parse_outline.py <outline.md> <assets_dir>", file=sys.stderr)
        sys.exit(1)

    result = parse_outline(sys.argv[1], sys.argv[2])
    print(json.dumps(result, indent=2, ensure_ascii=False))
```

**Step 2: Commit**

```bash
chmod +x scripts/parse_outline.py
git add scripts/
git commit -m "Add outline parser script"
```

---

## Task 5: Create Script Generator Template

**Files:**
- Create: `templates/script_prompt.md`

**Step 1: Create script_prompt.md**

```markdown
# Script Generation Prompt

You are writing narration for a tutorial video. The narration must fit within the video duration.

## Constraints

- **Target: 4 words per second** (Chinese: ~2.5 characters per second)
- Each chapter has a maximum word count based on video duration
- Write in conversational, clear style
- Use `[SECTION:name]` markers between chapters

## Chapter Information

{{CHAPTER_INFO}}

## Output Format

```
[SECTION:01_intro]
[Narration for intro, max {{MAX_WORDS_INTRO}} words]

[SECTION:02_content]
[Narration for content, max {{MAX_WORDS_CONTENT}} words]

...
```

## Guidelines

1. Start with a hook or question
2. Explain what's happening on screen
3. Highlight key actions (click, type, select)
4. End each section with a transition
5. Final section: summary + call to action
```

**Step 2: Commit**

```bash
git add templates/script_prompt.md
git commit -m "Add script generation prompt template"
```

---

## Task 6: Copy Shared Components from video-podcast-maker

**Files:**
- Copy: `FullBleedLayout.tsx` from video-podcast-maker
- Copy: `generate_tts.py` from video-podcast-maker

**Step 1: Copy files**

```bash
cp ~/.claude/skills/video-podcast-maker/FullBleedLayout.tsx .
cp ~/.claude/skills/video-podcast-maker/generate_tts.py scripts/
chmod +x scripts/generate_tts.py
```

**Step 2: Commit**

```bash
git add FullBleedLayout.tsx scripts/generate_tts.py
git commit -m "Copy shared components from video-podcast-maker"
```

---

## Task 7: Create Sample Tutorial Composition

**Files:**
- Create: `examples/TutorialExample.tsx`

**Step 1: Create TutorialExample.tsx**

```tsx
/**
 * Example Tutorial Video Composition
 *
 * Demonstrates how to assemble a tutorial video with:
 * - Screen recordings
 * - Annotations
 * - Audio sync
 */
// @ts-nocheck
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion'
import React from 'react'
import { FullBleed, ContentArea, Title, FadeIn, font } from '../FullBleedLayout'
import { ScreenRecording } from '../ScreenRecording'
import { Arrow, Highlight, ParsedAnnotation } from '../Annotations'

// Example timing data (normally from timing.json)
const timing = {
  fps: 30,
  total_frames: 2700, // 90 seconds
  sections: [
    { name: '01_intro', start_frame: 0, duration_frames: 450 },
    { name: '02_setup', start_frame: 450, duration_frames: 900 },
    { name: '03_demo', start_frame: 1350, duration_frames: 900 },
    { name: '04_summary', start_frame: 2250, duration_frames: 450 },
  ]
}

// Example annotations
const annotations: Record<string, ParsedAnnotation[]> = {
  '02_setup': [
    { type: 'arrow', startFrame: 480, x: 500, y: 300, text: 'Click Settings' },
    { type: 'highlight', startFrame: 600, x: 100, y: 200, width: 400, height: 50 },
  ],
  '03_demo': [
    { type: 'circle', startFrame: 1400, x: 800, y: 400, radius: 60 },
    { type: 'text', startFrame: 1500, x: 600, y: 500, text: 'Enter your query' },
  ],
}

export const TutorialExample: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Audio track */}
      <Audio src={staticFile('audio.wav')} />

      {/* Section 1: Intro - title card */}
      <Sequence from={0} durationInFrames={450}>
        <FullBleed background="#fff">
          <ContentArea>
            <FadeIn>
              <Title size="hero">How to Use LM Studio</Title>
            </FadeIn>
            <FadeIn delay={15}>
              <Title size="medium" color="rgba(0,0,0,0.5)">Web Search Feature</Title>
            </FadeIn>
          </ContentArea>
        </FullBleed>
      </Sequence>

      {/* Section 2: Setup - screen recording */}
      <Sequence from={450} durationInFrames={900}>
        <ScreenRecording
          src={staticFile('media/02_setup.mp4')}
          annotations={annotations['02_setup']}
          startFrame={450}
        />
      </Sequence>

      {/* Section 3: Demo - screen recording */}
      <Sequence from={1350} durationInFrames={900}>
        <ScreenRecording
          src={staticFile('media/03_demo.mp4')}
          annotations={annotations['03_demo']}
          startFrame={1350}
        />
      </Sequence>

      {/* Section 4: Summary */}
      <Sequence from={2250} durationInFrames={450}>
        <FullBleed background="#fff">
          <ContentArea>
            <FadeIn>
              <Title size="large">That's it!</Title>
            </FadeIn>
            <FadeIn delay={15}>
              <div style={{
                fontSize: 40,
                color: 'rgba(0,0,0,0.6)',
                textAlign: 'center',
                fontFamily: font,
              }}>
                Like, subscribe, and share!
              </div>
            </FadeIn>
          </ContentArea>
        </FullBleed>
      </Sequence>
    </AbsoluteFill>
  )
}
```

**Step 2: Commit**

```bash
git add examples/
git commit -m "Add example tutorial composition"
```

---

## Task 8: Final Skill Documentation Update

**Files:**
- Modify: `SKILL.md` - add complete workflow details

**Step 1: Update SKILL.md with complete workflow**

Add detailed step-by-step instructions covering all 14 workflow steps, validation checkpoints, and common mistakes section similar to video-podcast-maker.

**Step 2: Commit**

```bash
git add SKILL.md
git commit -m "Complete SKILL.md with full workflow documentation"
```

---

## Task 9: Test with Real Tutorial

**Files:**
- Create: `tutorials/lm-studio-web-search/` (test project)

**Step 1: Create test project structure**

```bash
mkdir -p tutorials/lm-studio-web-search/assets
cp templates/outline.md tutorials/lm-studio-web-search/
```

**Step 2: Document test results**

Record any issues found during testing and update SKILL.md accordingly.

**Step 3: Commit**

```bash
git add tutorials/
git commit -m "Add test tutorial project structure"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Skill skeleton | SKILL.md, CLAUDE.md, README.md, templates/ |
| 2 | Annotation components | Annotations.tsx |
| 3 | Screen recording component | ScreenRecording.tsx |
| 4 | Outline parser | scripts/parse_outline.py |
| 5 | Script prompt template | templates/script_prompt.md |
| 6 | Shared components | FullBleedLayout.tsx, generate_tts.py |
| 7 | Example composition | examples/TutorialExample.tsx |
| 8 | Documentation | SKILL.md update |
| 9 | Test project | tutorials/lm-studio-web-search/ |

Total commits: 9
