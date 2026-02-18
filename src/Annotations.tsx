/**
 * Annotation Components for Tutorial Videos
 *
 * Provides: Arrow, Highlight, Circle, TextLabel, Zoom, Blur, Cursor
 */
// @ts-nocheck
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'
import React from 'react'

// Animation hook for fade in/out
export const useAnnotationOpacity = (startFrame: number, duration: number = 30) => {
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

// Arrow pointing to a location with optional text label
export const Arrow: React.FC<{
  x: number
  y: number
  label?: string
  color?: string
  startFrame?: number
  duration?: number
}> = ({ x, y, label, color = '#FF4444', startFrame = 0, duration = 60 }) => {
  const frame = useCurrentFrame()
  const opacity = useAnnotationOpacity(startFrame, duration)

  // Bounce animation
  const bounce = interpolate(
    (frame - startFrame) % 30,
    [0, 15, 30],
    [0, -8, 0],
    { extrapolateRight: 'clamp' }
  )

  if (opacity === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 60,
        top: y - 80 + bounce,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <svg width="120" height="80" viewBox="0 0 120 80">
        <defs>
          <filter id="arrow-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>
        <path
          d="M60 10 L60 50 L45 35 L60 70 L75 35 L60 50"
          fill={color}
          filter="url(#arrow-shadow)"
        />
      </svg>
      {label && (
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            background: color,
            color: 'white',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 16,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

// Rectangle highlight box with pulse animation
export const Highlight: React.FC<{
  x: number
  y: number
  width: number
  height: number
  color?: string
  startFrame?: number
  duration?: number
}> = ({ x, y, width, height, color = '#FFCC00', startFrame = 0, duration = 60 }) => {
  const frame = useCurrentFrame()
  const opacity = useAnnotationOpacity(startFrame, duration)

  // Pulse animation
  const pulse = interpolate(
    (frame - startFrame) % 40,
    [0, 20, 40],
    [1, 1.05, 1],
    { extrapolateRight: 'clamp' }
  )

  if (opacity === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width * pulse,
        height: height * pulse,
        border: `4px solid ${color}`,
        borderRadius: 8,
        boxShadow: `0 0 20px ${color}80, inset 0 0 10px ${color}40`,
        opacity,
        pointerEvents: 'none',
        transform: `translate(-${(pulse - 1) * 50}%, -${(pulse - 1) * 50}%)`,
      }}
    />
  )
}

// Circle emphasis with pulse animation
export const Circle: React.FC<{
  x: number
  y: number
  radius?: number
  color?: string
  startFrame?: number
  duration?: number
}> = ({ x, y, radius = 40, color = '#FF4444', startFrame = 0, duration = 60 }) => {
  const frame = useCurrentFrame()
  const opacity = useAnnotationOpacity(startFrame, duration)

  // Pulse animation
  const pulse = interpolate(
    (frame - startFrame) % 30,
    [0, 15, 30],
    [1, 1.15, 1],
    { extrapolateRight: 'clamp' }
  )

  if (opacity === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x - radius * pulse,
        top: y - radius * pulse,
        width: radius * 2 * pulse,
        height: radius * 2 * pulse,
        border: `4px solid ${color}`,
        borderRadius: '50%',
        boxShadow: `0 0 20px ${color}80`,
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}

// Text label at position
export const TextLabel: React.FC<{
  x: number
  y: number
  text: string
  color?: string
  fontSize?: number
  background?: string
  startFrame?: number
  duration?: number
}> = ({
  x,
  y,
  text,
  color = '#FFFFFF',
  fontSize = 20,
  background = '#333333',
  startFrame = 0,
  duration = 60,
}) => {
  const opacity = useAnnotationOpacity(startFrame, duration)

  if (opacity === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        background,
        color,
        padding: '8px 16px',
        borderRadius: 8,
        fontSize,
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        opacity,
        pointerEvents: 'none',
      }}
    >
      {text}
    </div>
  )
}

// Magnifier showing zoomed area
export const Zoom: React.FC<{
  x: number
  y: number
  radius?: number
  scale?: number
  startFrame?: number
  duration?: number
}> = ({ x, y, radius = 100, scale = 2, startFrame = 0, duration = 60 }) => {
  const opacity = useAnnotationOpacity(startFrame, duration)

  if (opacity === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: '50%',
        border: '4px solid #333',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Content to zoom would be clipped from parent */}
      </div>
    </div>
  )
}

// Blur mask for hiding sensitive info
export const Blur: React.FC<{
  x: number
  y: number
  width: number
  height: number
  intensity?: number
  startFrame?: number
  duration?: number
}> = ({ x, y, width, height, intensity = 10, startFrame = 0, duration = 9999 }) => {
  const opacity = useAnnotationOpacity(startFrame, duration)

  if (opacity === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        backdropFilter: `blur(${intensity}px)`,
        WebkitBackdropFilter: `blur(${intensity}px)`,
        background: 'rgba(128, 128, 128, 0.3)',
        borderRadius: 4,
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}

// Virtual mouse cursor SVG
export const Cursor: React.FC<{
  x: number
  y: number
  clicking?: boolean
  startFrame?: number
  duration?: number
}> = ({ x, y, clicking = false, startFrame = 0, duration = 60 }) => {
  const opacity = useAnnotationOpacity(startFrame, duration)

  if (opacity === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        pointerEvents: 'none',
        transform: clicking ? 'scale(0.9)' : 'scale(1)',
        transition: 'transform 0.1s',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 2L5 20L9.5 15.5L13 22L16 20.5L12.5 14L19 14L5 2Z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
        />
      </svg>
      {clicking && (
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: -10,
            width: 44,
            height: 44,
            border: '2px solid rgba(255, 100, 100, 0.8)',
            borderRadius: '50%',
            animation: 'ripple 0.3s ease-out',
          }}
        />
      )}
    </div>
  )
}

// TypeScript interface for parsed annotations
export interface ParsedAnnotation {
  type: 'arrow' | 'highlight' | 'circle' | 'text' | 'zoom' | 'blur' | 'cursor'
  timestamp: string
  startFrame: number
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  label?: string
  color?: string
  duration?: number
}

// Parse annotation syntax like "0:05 arrow (1200, 300) "Click here""
export const parseAnnotation = (line: string, fps: number = 30): ParsedAnnotation | null => {
  // Match timestamp at start: "0:05" or "1:30:45"
  const timestampMatch = line.match(/^(\d+:)?(\d+):(\d+)/)
  if (!timestampMatch) return null

  const hours = timestampMatch[1] ? parseInt(timestampMatch[1]) : 0
  const minutes = parseInt(timestampMatch[2])
  const seconds = parseInt(timestampMatch[3])
  const timestamp = `${hours ? hours + ':' : ''}${minutes}:${seconds.toString().padStart(2, '0')}`
  const startFrame = (hours * 3600 + minutes * 60 + seconds) * fps

  // Parse annotation type
  const rest = line.slice(timestampMatch[0].length).trim()

  // Arrow: "arrow (x, y) "label""
  const arrowMatch = rest.match(/^arrow\s+\((\d+),\s*(\d+)\)(?:\s+"([^"]*)")?/)
  if (arrowMatch) {
    return {
      type: 'arrow',
      timestamp,
      startFrame,
      x: parseInt(arrowMatch[1]),
      y: parseInt(arrowMatch[2]),
      label: arrowMatch[3],
    }
  }

  // Highlight: "highlight (x, y, w, h)"
  const highlightMatch = rest.match(/^highlight\s+\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/)
  if (highlightMatch) {
    return {
      type: 'highlight',
      timestamp,
      startFrame,
      x: parseInt(highlightMatch[1]),
      y: parseInt(highlightMatch[2]),
      width: parseInt(highlightMatch[3]),
      height: parseInt(highlightMatch[4]),
    }
  }

  // Circle: "circle (x, y) r=50"
  const circleMatch = rest.match(/^circle\s+\((\d+),\s*(\d+)\)(?:\s+r=(\d+))?/)
  if (circleMatch) {
    return {
      type: 'circle',
      timestamp,
      startFrame,
      x: parseInt(circleMatch[1]),
      y: parseInt(circleMatch[2]),
      radius: circleMatch[3] ? parseInt(circleMatch[3]) : 40,
    }
  }

  // Text: "text (x, y) "label""
  const textMatch = rest.match(/^text\s+\((\d+),\s*(\d+)\)\s+"([^"]*)"/)
  if (textMatch) {
    return {
      type: 'text',
      timestamp,
      startFrame,
      x: parseInt(textMatch[1]),
      y: parseInt(textMatch[2]),
      label: textMatch[3],
    }
  }

  // Blur: "blur (x, y, w, h)"
  const blurMatch = rest.match(/^blur\s+\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/)
  if (blurMatch) {
    return {
      type: 'blur',
      timestamp,
      startFrame,
      x: parseInt(blurMatch[1]),
      y: parseInt(blurMatch[2]),
      width: parseInt(blurMatch[3]),
      height: parseInt(blurMatch[4]),
    }
  }

  // Cursor: "cursor (x, y)"
  const cursorMatch = rest.match(/^cursor\s+\((\d+),\s*(\d+)\)/)
  if (cursorMatch) {
    return {
      type: 'cursor',
      timestamp,
      startFrame,
      x: parseInt(cursorMatch[1]),
      y: parseInt(cursorMatch[2]),
    }
  }

  // Zoom: "zoom (x, y) scale=2"
  const zoomMatch = rest.match(/^zoom\s+\((\d+),\s*(\d+)\)/)
  if (zoomMatch) {
    return {
      type: 'zoom',
      timestamp,
      startFrame,
      x: parseInt(zoomMatch[1]),
      y: parseInt(zoomMatch[2]),
    }
  }

  return null
}
