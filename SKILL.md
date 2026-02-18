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
| **0. Initialize** | Claude | Project directory |
| **1. Add Recordings** | User | `assets/` with recordings |
| **2. Create Outline** | Claude | `outline.md` |
| **3. Duration Analysis** | FFmpeg | Duration metadata |
| **4. Generate Script** | Claude | `script.txt` |
| **5. Generate Audio** | generate_tts.py | `audio.wav`, `audio.srt`, `timing.json` |
| **6. Create Timing** | Claude | `timing.json` (annotations) |
| **7. Remotion Composition** | Remotion | Video composition |
| **8. Render Video** | remotion render | `output.mp4` |
| **9. Add BGM** | FFmpeg | `video_with_bgm.mp4` |
| **10. Add Subtitles** | FFmpeg | `final_video.mp4` |
| **11. Publish Info** | Claude | `publish_info.md` |
| **12. Thumbnail** | Remotion/AI | `thumbnail_*.png` |
| **13. Verify Output** | Claude | Verification report |
| **14. Cleanup** | Claude | Remove temp files |

### Validation Checkpoints

**After Step 5 (TTS)**:
- [ ] `output/audio.wav` exists and plays correctly
- [ ] `timing.json` has all sections with correct timestamps
- [ ] `output/audio.srt` encoding is UTF-8

**After Step 8 (Render)**:
- [ ] `output/output.mp4` resolution is 1920x1080
- [ ] Audio-video sync verified
- [ ] No black frames

**After Step 10 (Final)**:
- [ ] `output/final_video.mp4` resolution is 1920x1080
- [ ] Subtitles display correctly (if added)
- [ ] File size is reasonable

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

### Step 8: Render Video
Remotion renders the composed video:
```bash
npx remotion render src/remotion/index.ts CompositionId output/output.mp4 --video-bitrate 8M
```

Verify resolution:
```bash
ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 output/output.mp4
# Expected: 1920,1080
```

### Step 9: Add BGM
Mix background music with narration:
```bash
ffmpeg -y \
  -i output/output.mp4 \
  -stream_loop -1 -i bgm.mp3 \
  -filter_complex "[0:a]volume=1.0[a1];[1:a]volume=0.05[a2];[a1][a2]amix=inputs=2:duration=first[aout]" \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  output/video_with_bgm.mp4
```

### Step 10: Add Subtitles
Optional - ask user if subtitles are needed.

**Without subtitles**:
```bash
cp output/video_with_bgm.mp4 output/final_video.mp4
```

**With subtitles**:
```bash
ffmpeg -y -i output/video_with_bgm.mp4 \
  -vf "subtitles=output/audio.srt:force_style='FontName=PingFang SC,FontSize=12,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Bold=1,Outline=2,Shadow=0,MarginV=20'" \
  -c:v libx264 -crf 18 -preset slow -s 1920x1080 \
  -c:a copy output/final_video.mp4
```

### Step 11: Generate Publish Info
Create `publish_info.md` with:
- Title (topic + key feature)
- Description (100-200 words)
- Tags (10 relevant keywords)
- Chapters with timestamps from `timing.json`

### Step 12: Create Thumbnail
Generate thumbnail using Remotion:
```bash
npx remotion still src/remotion/index.ts Thumbnail output/thumbnail_16x9.png
```

Or use AI image generation if available.

### Step 13: Verify Output
Run verification checks:

```bash
echo "=== File Check ==="
for f in script.txt output/audio.wav output/audio.srt timing.json output/output.mp4 output/final_video.mp4; do
  [ -f "$f" ] && echo "✓ $f" || echo "✗ $f missing"
done

echo "=== Technical Check ==="
RES=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=p=0 output/final_video.mp4)
[ "$RES" = "1920,1080" ] && echo "✓ Resolution: 1920x1080" || echo "✗ Resolution: $RES"

DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 output/final_video.mp4 | cut -d. -f1)
echo "✓ Duration: ${DUR}s"

SIZE=$(ls -lh output/final_video.mp4 | awk '{print $5}')
echo "✓ File size: $SIZE"
```

### Step 14: Cleanup
**Requires user confirmation.**

List temp files:
```bash
echo "=== Temp files to delete ==="
ls -lh output/output.mp4 output/video_with_bgm.mp4 2>/dev/null
```

After confirmation:
```bash
rm -f output/output.mp4 output/video_with_bgm.mp4
echo "✓ Temp files cleaned"
```

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

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Output in `out/` instead of `output/` | Specify full path: `npx remotion render ... output/output.mp4` |
| Running `npx remotion studio` | **NEVER** - use `npx remotion render` |
| Audio/video timing mismatch | Use `timing.json`, don't hardcode frame counts |
| Missing assets folder | Create `assets/` before adding recordings |
| Wrong asset format | Use MP4, MOV, MKV, or WebM |
| TTS timing drift | Keep MAX_CHARS=400 in generate_tts.py |
| Subtitle font missing | Use PingFang SC (macOS), Microsoft YaHei (Windows) |
| Subtitles invisible | Match text color to video background |
| Video blurry | Use `--video-bitrate 8M` for 1080p |
| Annotation syntax errors | Check `[HIGHLIGHT]`, `[ARROW]`, `[CALLOUT]` markers |
| BGM too loud | Keep BGM volume at 0.05, narration at 1.0 |

## Requirements

### System Tools

```bash
brew install ffmpeg node  # macOS
```

### Python Dependencies

```bash
pip install azure-cognitiveservices-speech requests
```

### Node.js Dependencies

```bash
npm install remotion @remotion/cli @remotion/player
```

### Environment Variables

```bash
# Azure TTS (required for generate_tts.py)
export AZURE_SPEECH_KEY="your-azure-speech-key"
export AZURE_SPEECH_REGION="eastasia"
```

## Related Skills

- `/video-editor` - General video editing
- `/tts` - Text-to-speech generation
- `/transcribe` - Audio transcription
