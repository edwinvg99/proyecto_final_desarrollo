import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const noMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Stagger-reveal for a grid/list container.
 * Animates each direct child when the container scrolls into view.
 */
export function useFadeInStagger(threshold = 0.05) {
  const ref = useRef(null);

  useEffect(() => {
    if (noMotion()) return;
    const el = ref.current;
    if (!el) return;

    const items = Array.from(el.children);
    items.forEach(t => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(22px)';
    });

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animate(items, {
        opacity: 1,
        translateY: 0,
        delay: stagger(75),
        duration: 520,
        ease: 'outExpo',
      });
      io.unobserve(el);
    }, { threshold });

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Single-element fade-in + slide-up on scroll.
 */
export function useFadeInReveal(threshold = 0.1) {
  const ref = useRef(null);

  useEffect(() => {
    if (noMotion()) return;
    const el = ref.current;
    if (!el) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animate(el, { opacity: 1, translateY: 0, duration: 520, ease: 'outExpo' });
      io.unobserve(el);
    }, { threshold });

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Hero entrance — runs immediately on mount, no scroll trigger.
 * Targets every element with [data-hero] attribute inside the ref.
 */
export function useHeroEntrance() {
  const ref = useRef(null);

  useEffect(() => {
    if (noMotion()) return;
    const el = ref.current;
    if (!el) return;

    const targets = Array.from(el.querySelectorAll('[data-hero]'));
    targets.forEach(t => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(28px)';
    });

    animate(targets, {
      opacity: 1,
      translateY: 0,
      delay: stagger(130),
      duration: 750,
      ease: 'outExpo',
    });
  }, []);

  return ref;
}
