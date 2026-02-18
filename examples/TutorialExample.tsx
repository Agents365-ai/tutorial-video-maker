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
import { ScreenRecording } from '../src/ScreenRecording'
import { Arrow, Highlight, ParsedAnnotation } from '../src/Annotations'

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
