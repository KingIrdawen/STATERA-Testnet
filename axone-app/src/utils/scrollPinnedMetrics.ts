/**
 * Scroll-driven pinned metrics animation system
 * 
 * This module provides a pinned scroll experience where Section 2 (metrics) 
 * gets pinned to the viewport and user scroll input drives animation progress
 * instead of page movement.
 */

interface PinnedMetricsOptions {
  virtualDistance?: number; // Virtual scroll distance in pixels (default: 1500)
  respectReducedMotion?: boolean; // Respect prefers-reduced-motion (default: true)
}

interface ScrollState {
  isPinned: boolean;
  progress: number; // 0 to 1
  lastScrollY: number;
  isScrolling: boolean;
}

export class PinnedMetricsController {
  private section: HTMLElement;
  private options: Required<PinnedMetricsOptions>;
  private state: ScrollState;
  private rafId: number | null = null;
  
  // Event listeners
  private boundHandleWheel: (e: WheelEvent) => void;
  private boundHandleTouch: (e: TouchEvent) => void;
  private boundHandleKeydown: (e: KeyboardEvent) => void;
  private boundHandleScroll: () => void;
  
  // Intersection observer
  private observer: IntersectionObserver | null = null;
  
  // Callbacks
  private onProgressUpdate?: (progress: number) => void;
  private onPinChange?: (isPinned: boolean) => void;

  constructor(section: HTMLElement, options: PinnedMetricsOptions = {}) {
    this.section = section;
    this.options = {
      virtualDistance: 1500,
      respectReducedMotion: true,
      ...options
    };
    
    this.state = {
      isPinned: false,
      progress: 0,
      lastScrollY: 0,
      isScrolling: false
    };
    
    // Bind event handlers
    this.boundHandleWheel = this.handleWheel.bind(this);
    this.boundHandleTouch = this.handleTouch.bind(this);
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    this.boundHandleScroll = this.handleScroll.bind(this);
    
    this.init();
  }

  private init(): void {
    // Check for reduced motion preference
    if (this.options.respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.setProgress(1); // Skip animations
      return;
    }

    // Setup section styling
    this.setupSection();
    
    // Setup intersection observer
    this.setupIntersectionObserver();
    
    // Add scroll listener for initial detection
    window.addEventListener('scroll', this.boundHandleScroll, { passive: true });
  }

  private setupSection(): void {
    // Ensure section has proper positioning
    this.section.style.position = 'relative';
    this.section.style.overscrollBehavior = 'contain';
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            this.pin();
          }
        });
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '0px'
      }
    );
    
    this.observer.observe(this.section);
  }

  private pin(): void {
    if (this.state.isPinned) return;
    
    this.state.isPinned = true;
    this.state.lastScrollY = window.scrollY;
    
    // Lock the page scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.state.lastScrollY}px`;
    document.body.style.width = '100%';
    
    // Add event listeners for scroll input
    window.addEventListener('wheel', this.boundHandleWheel, { passive: false });
    window.addEventListener('touchmove', this.boundHandleTouch, { passive: false });
    window.addEventListener('keydown', this.boundHandleKeydown, { passive: false });
    
    this.onPinChange?.(true);
    this.startRenderLoop();
  }

  private unpin(): void {
    if (!this.state.isPinned) return;
    
    this.state.isPinned = false;
    
    // Restore page scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Remove event listeners
    window.removeEventListener('wheel', this.boundHandleWheel);
    window.removeEventListener('touchmove', this.boundHandleTouch);
    window.removeEventListener('keydown', this.boundHandleKeydown);
    
    // Restore scroll position
    window.scrollTo(0, this.state.lastScrollY);
    
    this.onPinChange?.(false);
    this.stopRenderLoop();
  }

  private handleWheel(e: WheelEvent): void {
    if (!this.state.isPinned) return;
    
    e.preventDefault();
    
    // Convert wheel delta to progress delta
    const delta = e.deltaY;
    const progressDelta = delta / this.options.virtualDistance;
    
    this.updateProgress(this.state.progress + progressDelta);
  }

  private handleTouch(e: TouchEvent): void {
    if (!this.state.isPinned) return;
    
    e.preventDefault();
    
    // Simple touch handling - could be enhanced with touch start/end tracking
    const touch = e.touches[0];
    if (touch) {
      const delta = touch.clientY - (this.state.lastScrollY || touch.clientY);
      const progressDelta = -delta / this.options.virtualDistance;
      
      this.updateProgress(this.state.progress + progressDelta);
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (!this.state.isPinned) return;
    
    // Handle keyboard navigation
    const key = e.key;
    let progressDelta = 0;
    
    switch (key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ': // Space
        progressDelta = 0.1;
        break;
      case 'ArrowUp':
      case 'PageUp':
        progressDelta = -0.1;
        break;
      case 'Home':
        progressDelta = -this.state.progress;
        break;
      case 'End':
        progressDelta = 1 - this.state.progress;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    this.updateProgress(this.state.progress + progressDelta);
  }

  private handleScroll(): void {
    // This handles the initial detection and cleanup
    if (!this.state.isPinned) {
      const sectionRect = this.section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if we should unpin (scrolled past section)
      if (sectionRect.bottom < 0 || sectionRect.top > windowHeight) {
        if (this.state.isPinned) {
          this.unpin();
        }
      }
    }
  }

  private updateProgress(newProgress: number): void {
    // Clamp progress to [0, 1]
    const clampedProgress = Math.max(0, Math.min(1, newProgress));
    
    if (clampedProgress !== this.state.progress) {
      this.setProgress(clampedProgress);
      
      // Check for completion
      if (clampedProgress >= 1) {
        // All animations complete, unpin after a short delay
        setTimeout(() => this.unpin(), 500);
      } else if (clampedProgress <= 0 && this.state.isPinned) {
        // Scrolled back to start, allow unpinning upward
        this.unpin();
      }
    }
  }

  private setProgress(progress: number): void {
    this.state.progress = Math.max(0, Math.min(1, progress));
    this.onProgressUpdate?.(this.state.progress);
  }

  private startRenderLoop(): void {
    if (this.rafId) return;
    
    const render = () => {
      // Update any visual elements based on progress
      this.updateVisuals();
      
      if (this.state.isPinned) {
        this.rafId = requestAnimationFrame(render);
      }
    };
    
    this.rafId = requestAnimationFrame(render);
  }

  private stopRenderLoop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updateVisuals(): void {
    // This method can be overridden or extended
    // Currently no visual updates needed
  }

  // Public API
  public setOnProgressUpdate(callback: (progress: number) => void): void {
    this.onProgressUpdate = callback;
  }

  public setOnPinChange(callback: (isPinned: boolean) => void): void {
    this.onPinChange = callback;
  }

  public getProgress(): number {
    return this.state.progress;
  }

  public isPinned(): boolean {
    return this.state.isPinned;
  }

  public destroy(): void {
    // Cleanup all listeners and observers
    this.unpin();
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    window.removeEventListener('scroll', this.boundHandleScroll);
    
    
    this.stopRenderLoop();
  }
}

/**
 * Initialize pinned metrics for a section
 * 
 * @param sectionEl - The section element to pin
 * @param options - Configuration options
 * @returns Controller instance
 */
export function initPinnedMetrics(
  sectionEl: HTMLElement, 
  options?: PinnedMetricsOptions
): PinnedMetricsController {
  return new PinnedMetricsController(sectionEl, options);
}

/**
 * Math explanation:
 * 
 * 1. Virtual Distance: We map a fixed virtual scroll distance (e.g., 1500px) 
 *    to animation progress from 0 to 1. This gives consistent behavior regardless 
 *    of actual section height.
 * 
 * 2. Progress Calculation: 
 *    progress = scrollDelta / virtualDistance
 *    This ensures smooth, predictable animation progression.
 * 
 * 3. Clamping: Progress is always clamped to [0, 1] to prevent overshooting
 *    and ensure animations complete properly.
 * 
 * 4. Frame Updates: requestAnimationFrame ensures smooth 60fps updates
 *    while debouncing rapid scroll events.
 */
