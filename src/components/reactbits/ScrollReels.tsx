/**
 * Native vertical scroll-snap pager — reliable touch UX (TikTok-style).
 */
import { useCallback, useEffect, useRef } from 'react';

/** ~50% faster than browser default smooth scroll (~400ms). */
const SCROLL_DURATION_MS = 200;
const WHEEL_COOLDOWN_MS = 180;

type ScrollReelsProps<T> = {
  items: T[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  renderSlide: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => string;
};

function indexFromScroll(root: HTMLElement, slideCount: number): number {
  if (slideCount === 0) return 0;
  const slideHeight = root.clientHeight;
  if (slideHeight <= 0) return 0;
  const raw = Math.round(root.scrollTop / slideHeight);
  return Math.max(0, Math.min(raw, slideCount - 1));
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function ScrollReels<T>({
  items,
  activeIndex,
  onIndexChange,
  renderSlide,
  getKey,
}: ScrollReelsProps<T>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = useRef(activeIndex);
  const syncingRef = useRef(false);
  const skipProgrammaticScrollRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const wheelLockRef = useRef(false);

  activeIndexRef.current = activeIndex;

  const animateScrollTo = useCallback((targetTop: number, instant = false) => {
    const root = scrollerRef.current;
    if (!root) return;

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (instant) {
      root.scrollTop = targetTop;
      return;
    }

    syncingRef.current = true;
    const startTop = root.scrollTop;
    const distance = targetTop - startTop;
    if (distance === 0) {
      syncingRef.current = false;
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / SCROLL_DURATION_MS);
      root.scrollTop = startTop + distance * easeOutCubic(t);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        animFrameRef.current = null;
        syncingRef.current = false;
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const scrollToIndex = useCallback(
    (index: number, instant = false) => {
      const slide = slideRefs.current[index];
      if (!slide) return;
      animateScrollTo(slide.offsetTop, instant);
    },
    [animateScrollTo]
  );

  const goToIndex = useCallback(
    (index: number, instant = false) => {
      if (index < 0 || index >= items.length || index === activeIndexRef.current) return;
      skipProgrammaticScrollRef.current = true;
      onIndexChange(index);
      scrollToIndex(index, instant);
    },
    [items.length, onIndexChange, scrollToIndex]
  );

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || items.length === 0) return;

    const commitActiveIndex = () => {
      if (syncingRef.current) return;
      const idx = indexFromScroll(root, items.length);
      if (idx === activeIndexRef.current) return;
      skipProgrammaticScrollRef.current = true;
      onIndexChange(idx);
    };

    root.addEventListener('scrollend', commitActiveIndex);

    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (syncingRef.current) return;
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(commitActiveIndex, 90);
    };
    root.addEventListener('scroll', onScroll, { passive: true });

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      if (syncingRef.current || wheelLockRef.current) return;

      const delta = e.deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(activeIndexRef.current + delta, items.length - 1));
      if (next === activeIndexRef.current) return;

      wheelLockRef.current = true;
      goToIndex(next);
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, WHEEL_COOLDOWN_MS);
    };
    root.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      root.removeEventListener('scrollend', commitActiveIndex);
      root.removeEventListener('scroll', onScroll);
      root.removeEventListener('wheel', onWheel);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [items.length, onIndexChange, goToIndex]);

  useEffect(() => {
    if (skipProgrammaticScrollRef.current) {
      skipProgrammaticScrollRef.current = false;
      return;
    }
    scrollToIndex(activeIndex);
  }, [activeIndex, scrollToIndex]);

  if (items.length === 0) return null;

  return (
    <div ref={scrollerRef} className="signal-reels-feed" aria-label="Stories">
      {items.map((item, index) => (
        <section
          key={getKey(item, index)}
          ref={(node) => {
            slideRefs.current[index] = node;
          }}
          className="signal-reel-slide"
          data-index={index}
          aria-current={index === activeIndex ? 'true' : undefined}
        >
          {renderSlide(item, index)}
        </section>
      ))}
    </div>
  );
}

export default ScrollReels;
