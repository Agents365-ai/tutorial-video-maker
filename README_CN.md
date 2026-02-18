# Tutorial Video Maker - 教程视频制作

一个 Claude Code 技能，用于从屏幕录制创建带 AI 配音和标注的教程视频。

## 工作流程

```
屏幕录制 → 大纲 → 脚本 → TTS → Remotion → FFmpeg → 最终视频
```

| 步骤 | 工具 | 输出 |
|------|------|------|
| 准备素材 | 用户 | `assets/*.mp4` |
| 编写大纲 | Claude | `outline.md` |
| 分析时长 | FFmpeg | 时长信息 |
| 生成脚本 | Claude | `script.txt` |
| 语音合成 | Azure TTS | `audio.wav`, `audio.srt` |
| 时间轴 | Claude | `timing.json` |
| 视频合成 | Remotion | `output.mp4` |
| 最终处理 | FFmpeg | `final_video.mp4` |

## 使用方法

```
/tutorial-video-maker "如何使用 LM Studio 进行网络检索"
```

## 安装

```bash
git clone https://github.com/Agents365-ai/tutorial-video-maker.git ~/.claude/skills/tutorial-video-maker
```

### 依赖技能

- `video-podcast-maker` 技能（共享组件）
- `remotion` 技能
- `ffmpeg` 技能

### 系统要求

```bash
# macOS
brew install ffmpeg node

# Python
pip install azure-cognitiveservices-speech requests
```

### 环境变量

```bash
export AZURE_SPEECH_KEY="your-azure-speech-key"
export AZURE_SPEECH_REGION="eastasia"
```

## 功能特点

- **屏幕录制支持** - 导入 MP4 录屏和 PNG 截图
- **AI 配音** - 根据视频时长限制生成脚本（每秒 4 字）
- **标注系统** - 箭头、高亮、圆圈、文字、放大、模糊、鼠标
- **Azure TTS** - 自然的中文语音合成
- **Remotion 渲染** - 专业的 1080p/4K 输出

## 标注语法

```markdown
- Annotations:
  - 0:05 arrow (500, 300) "点击这里"
  - 0:10 highlight (100, 200, 400, 60)
  - 0:15 circle (800, 400) radius=50
  - 0:20 text (500, 500) "步骤 1"
  - 0:25 zoom (600, 300, 200, 100) scale=2
  - 0:30 blur (0, 0, 200, 50)
```

## 输出结构

```
tutorials/{name}/
├── outline.md          # 章节结构
├── assets/             # 屏幕录制
├── script.txt          # AI 生成的旁白
├── audio.wav           # TTS 音频
├── audio.srt           # 字幕
├── timing.json         # 时间轴数据
└── final_video.mp4     # 输出视频
```

## 许可证

MIT 许可证

---

**探索未至之境**

[![GitHub](https://img.shields.io/badge/GitHub-Agents365--ai-blue?logo=github)](https://github.com/Agents365-ai)
[![Bilibili](https://img.shields.io/badge/Bilibili-441831884-pink?logo=bilibili)](https://space.bilibili.com/441831884)
