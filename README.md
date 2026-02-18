# Tutorial Video Maker

A Claude Code skill for creating tutorial videos from screen recordings with AI-generated narration and annotations.

## Workflow

```
Screen Recordings → Outline → Script → TTS → Remotion → FFmpeg → Final Video
```

| Step | Tool | Output |
|------|------|--------|
| Prepare | User | `assets/*.mp4` |
| Outline | Claude | `outline.md` |
| Analyze | FFmpeg | Duration info |
| Script | Claude | `script.txt` |
| TTS | Azure TTS | `audio.wav`, `audio.srt` |
| Timeline | Claude | `timing.json` |
| Compose | Remotion | `output.mp4` |
| Finalize | FFmpeg | `final_video.mp4` |

## Usage

```
/tutorial-video-maker "How to use LM Studio for web search"
```

## Installation

```bash
git clone https://github.com/Agents365-ai/tutorial-video-maker.git ~/.claude/skills/tutorial-video-maker
```

### Dependencies

- `video-podcast-maker` skill (for shared components)
- `remotion` skill
- `ffmpeg` skill

### System Requirements

```bash
# macOS
brew install ffmpeg node

# Python
pip install azure-cognitiveservices-speech requests
```

### Environment Variables

```bash
export AZURE_SPEECH_KEY="your-azure-speech-key"
export AZURE_SPEECH_REGION="eastasia"
```

## Features

- **Screen Recording Support** - Import MP4 recordings and PNG screenshots
- **AI Narration** - Generate scripts constrained by video duration (4 words/sec)
- **Annotations** - Arrow, highlight, circle, text, zoom, blur, cursor
- **Azure TTS** - Natural Chinese voice synthesis
- **Remotion Rendering** - Professional 1080p/4K output

## Annotation Syntax

```markdown
- Annotations:
  - 0:05 arrow (500, 300) "Click here"
  - 0:10 highlight (100, 200, 400, 60)
  - 0:15 circle (800, 400) radius=50
  - 0:20 text (500, 500) "Step 1"
  - 0:25 zoom (600, 300, 200, 100) scale=2
  - 0:30 blur (0, 0, 200, 50)
```

## Output Structure

```
tutorials/{name}/
├── outline.md          # Chapter structure
├── assets/             # Screen recordings
├── script.txt          # AI-generated narration
├── audio.wav           # TTS audio
├── audio.srt           # Subtitles
├── timing.json         # Timeline data
└── final_video.mp4     # Output
```

## License

MIT License

---

**探索未至之境**

[![GitHub](https://img.shields.io/badge/GitHub-Agents365--ai-blue?logo=github)](https://github.com/Agents365-ai)
[![Bilibili](https://img.shields.io/badge/Bilibili-441831884-pink?logo=bilibili)](https://space.bilibili.com/441831884)
