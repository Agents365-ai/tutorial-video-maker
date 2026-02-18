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
