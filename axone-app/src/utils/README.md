# Scroll Pinned Metrics System

## Overview

This system provides a scroll-driven "pinned" experience for Section 2 (metrics). When users scroll into the metrics section, the page pins (stops vertical movement) and user scroll input drives animation progress instead of page movement.

## Features

- **Pin Behavior**: Section 2 gets pinned to viewport when entered
- **Scroll Mapping**: Virtual scroll distance (1500px) maps to animation progress (0-1)
- **Progressive Animation**: Metrics appear one by one based on scroll progress
- **Accessibility**: Keyboard navigation support (Arrow keys, Page Up/Down, Space, Home, End)
- **Skip Option**: "Skip animations" button for users who want to bypass
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Mobile Support**: Touch-friendly with proper overscroll handling

## Usage

### Basic Implementation

```typescript
import { initPinnedMetrics } from '@/utils/scrollPinnedMetrics';

// Initialize for a section element
const controller = initPinnedMetrics(sectionElement, {
  virtualDistance: 1500, // Virtual scroll distance in pixels
  skipButton: true,      // Show skip button
  respectReducedMotion: true // Respect accessibility preferences
});

// Set up progress callback
controller.setOnProgressUpdate((progress: number) => {
  // progress goes from 0 to 1
  const visibleMetrics = Math.floor(progress * 5);
  setVisibleMetrics(visibleMetrics);
});

// Set up pin state callback
controller.setOnPinChange((isPinned: boolean) => {
  setIsPinned(isPinned);
});

// Cleanup on unmount
controller.destroy();
```

### React Integration

```tsx
import { useEffect, useRef, useState } from 'react';
import { initPinnedMetrics, PinnedMetricsController } from '@/utils/scrollPinnedMetrics';

function MetricsSection() {
  const [visibleMetrics, setVisibleMetrics] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<PinnedMetricsController | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const controller = initPinnedMetrics(sectionRef.current, {
      virtualDistance: 1500,
      skipButton: true,
      respectReducedMotion: true
    });

    controller.setOnProgressUpdate((progress: number) => {
      const targetMetrics = Math.floor(progress * 5);
      setVisibleMetrics(targetMetrics);
    });

    controller.setOnPinChange((pinned: boolean) => {
      setIsPinned(pinned);
    });

    controllerRef.current = controller;

    return () => {
      controller.destroy();
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`py-16 bg-black transition-all duration-300 ${
        isPinned ? 'fixed inset-0 z-40' : 'relative'
      }`}
      style={{ minHeight: '100vh' }}
    >
      {/* Your metrics content */}
    </section>
  );
}
```

## Configuration Options

### PinnedMetricsOptions

```typescript
interface PinnedMetricsOptions {
  virtualDistance?: number; // Virtual scroll distance in pixels (default: 1500)
  skipButton?: boolean;     // Show skip button (default: true)
  respectReducedMotion?: boolean; // Respect prefers-reduced-motion (default: true)
}
```

## Math Explanation

### Virtual Distance Mapping

The system maps a fixed virtual scroll distance (e.g., 1500px) to animation progress from 0 to 1:

```
progress = scrollDelta / virtualDistance
```

This ensures:
- Consistent behavior regardless of actual section height
- Smooth, predictable animation progression
- Progress always clamped to [0, 1] to prevent overshooting

### Progress Calculation

```typescript
// Convert wheel delta to progress delta
const delta = e.deltaY;
const progressDelta = delta / this.options.virtualDistance;
this.updateProgress(this.state.progress + progressDelta);
```

### Animation Mapping

```typescript
// Map progress (0-1) to number of visible metrics (0-5)
const targetMetrics = Math.floor(progress * 5);
setVisibleMetrics(targetMetrics);
```

## Event Handling

### Wheel Events
- Converts `deltaY` to progress delta
- Prevents default scroll behavior while pinned
- Clamps progress to [0, 1]

### Touch Events
- Handles touch movement for mobile devices
- Prevents overscroll bounce
- Maps touch delta to progress delta

### Keyboard Events
- **Arrow Down/Page Down/Space**: Advance progress by 0.1
- **Arrow Up/Page Up**: Decrease progress by 0.1
- **Home**: Jump to progress 0
- **End**: Jump to progress 1

## Accessibility

### Reduced Motion Support

```typescript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  this.setProgress(1); // Skip animations
  return;
}
```

### Keyboard Navigation

All standard keyboard navigation keys are supported:
- Arrow keys for fine control
- Page Up/Down for larger steps
- Space for forward movement
- Home/End for jumping to extremes

## Mobile Considerations

### Touch Handling
- Prevents default touch behavior while pinned
- Maps touch movement to progress
- Handles overscroll properly

### CSS Properties
```css
.section {
  overscroll-behavior: contain; /* Prevent scroll chaining */
  min-height: 100vh;            /* Fill viewport */
  position: relative;           /* For positioning context */
}
```

## Performance

### RequestAnimationFrame
- Uses `requestAnimationFrame` for smooth 60fps updates
- Debounces rapid scroll events
- Only renders when pinned

### Memory Management
- Properly removes all event listeners on destroy
- Cleans up intersection observers
- Cancels pending timeouts

## Test Cases

### Slow Scroll
- Animations advance smoothly until complete
- Page resumes scrolling to next section

### Fast Flick
- Progress clamps to 1
- Immediate unpin

### Reverse Scroll
- Progress decreases from mid-progress
- If reaches 0, unpin upward to previous section

### Reduced Motion
- No pinning occurs
- Metrics appear in final state
- Normal scroll throughout

### Mobile Safari/Chrome Android
- No scroll jitter
- No stuck states
- Proper touch handling

## Troubleshooting

### Common Issues

1. **Section not pinning**: Check that the section has proper ref and is mounted
2. **Animations not updating**: Verify progress callback is set correctly
3. **Scroll not working**: Ensure event listeners are properly attached
4. **Memory leaks**: Always call `destroy()` on unmount

### Debug Mode

Add logging to track progress:

```typescript
controller.setOnProgressUpdate((progress: number) => {
  console.log('Progress:', progress);
  // Your animation logic
});
```

## Browser Support

- **Modern browsers**: Full support
- **IE11**: Not supported (uses modern APIs)
- **Mobile Safari**: Full support
- **Chrome Android**: Full support
- **Firefox Mobile**: Full support

## Dependencies

- **React**: For React integration (optional)
- **TypeScript**: For type safety
- **Modern DOM APIs**: IntersectionObserver, requestAnimationFrame
- **CSS**: Modern CSS properties (overscroll-behavior, etc.)
