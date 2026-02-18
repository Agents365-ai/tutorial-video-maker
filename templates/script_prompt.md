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
