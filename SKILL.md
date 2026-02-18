---
name: tutorial-video-maker
description: Create tutorial videos from screen recordings with AI-generated narration and annotations
---

# Tutorial Video Maker

Create polished tutorial videos from screen recordings with AI-generated narration and synchronized annotations.

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

## Step Details

### Step 0: Initialize Project
Create project directory with standard structure:
```
project_name/
├── assets/           # User places recordings here
├── output/           # Generated files
├── outline.md        # Tutorial structure
├── script.txt        # Narration script
└── timing.json       # Annotation timing
```

### Step 1: Add Recordings
User places screen recordings in `assets/` folder:
- Supported formats: MP4, MOV, MKV, WebM
- Name files descriptively (e.g., `01_open_app.mp4`, `02_configure_settings.mp4`)

### Step 2: Create Outline
Claude analyzes recordings and creates `outline.md`:
- Chapter structure with timestamps
- Key points to cover
- Suggested annotations

### Step 3: Duration Analysis
FFmpeg extracts duration and metadata from each recording:
```bash
ffprobe -v quiet -print_format json -show_format -show_streams assets/*.mp4
```

### Step 4: Generate Script
Claude writes narration script in `script.txt`:
- Natural, conversational tone
- Timed to match video segments
- Includes pause markers `[PAUSE 0.5s]`

### Step 5: Generate Audio
`generate_tts.py` creates narration:
- Outputs: `audio.wav` (full narration) and `audio.srt` (subtitles)
- Uses OpenAI TTS or local alternative
- Matches script timing

### Step 6: Create Timing
Claude generates `timing.json` with annotation data:
```json
{
  "annotations": [
    {"time": 2.5, "type": "highlight", "target": "button", "duration": 1.5},
    {"time": 5.0, "type": "callout", "text": "Click here", "position": "top-right"}
  ]
}
```

### Step 7: Remotion Composition
Remotion combines all elements:
- Video tracks from recordings
- Audio narration overlay
- Annotation overlays
- Transitions between segments

### Step 8: Final Export
FFmpeg renders final video:
- Resolution: 1920x1080 (default)
- Format: MP4 with H.264
- Audio: AAC 192kbps

## Annotation Syntax

Use these markers in `script.txt` for synchronized annotations:

| Syntax | Description | Example |
|--------|-------------|---------|
| `[HIGHLIGHT box]` | Draw attention box | `[HIGHLIGHT search-button]` |
| `[ARROW target]` | Point to element | `[ARROW menu-icon]` |
| `[CALLOUT text]` | Show text bubble | `[CALLOUT "Click Settings"]` |
| `[ZOOM region]` | Zoom into area | `[ZOOM top-right]` |
| `[PAUSE Ns]` | Pause narration | `[PAUSE 1.5s]` |
| `[CUT]` | Transition marker | `[CUT]` |

## Output Structure

```
project_name/
├── assets/
│   ├── 01_intro.mp4
│   └── 02_demo.mp4
├── output/
│   ├── audio.wav
│   ├── audio.srt
│   └── final_video.mp4
├── outline.md
├── script.txt
└── timing.json
```

## Requirements

- FFmpeg (video processing)
- Node.js 18+ (Remotion)
- Python 3.10+ (TTS generation)
- OpenAI API key (for TTS, optional)

## Related Skills

- `/video-editor` - General video editing
- `/tts` - Text-to-speech generation
- `/transcribe` - Audio transcription
