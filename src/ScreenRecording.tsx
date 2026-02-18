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
