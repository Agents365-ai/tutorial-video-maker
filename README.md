# Tutorial Video Maker

Create tutorial videos from screen recordings with AI-generated narration and annotations.

## Features

- AI-generated narration from scripts
- Synchronized annotations (highlights, arrows, callouts)
- Automatic subtitle generation
- Remotion-based video composition
- FFmpeg final rendering

## Usage

```
/tutorial-video-maker "Tutorial topic title"
```

## Requirements

- FFmpeg
- Node.js 18+
- Python 3.10+
- OpenAI API key (optional, for TTS)

## Workflow

1. Initialize project directory
2. Add screen recordings to `assets/`
3. Generate outline and script
4. Create TTS audio and subtitles
5. Define annotation timing
6. Render final video with Remotion

See SKILL.md for detailed documentation.
