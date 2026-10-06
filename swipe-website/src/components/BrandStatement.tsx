import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './BrandStatement.module.css';

const ROWS = [
  { text: 'Wipe it.', dir: 1, speed: 1 },
  { text: 'Wash it.', dir: -1, speed: 1.5 },
  { text: 'Reuse it.', dir: 1, speed: 1.2 },
  { text: 'Swipe again.', dir: -1, speed: 1.8 },
] as const;

/** Big moving typography — four marquee rows at layered speeds, driven by
 *  scroll so the movement feels physical rather than looping ambient. */
export default function BrandStatement() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(`.${styles.track}`).forEach((track, i) => {
        const { dir, speed } = ROWS[i];
        gsap.fromTo(
          track,
          { xPercent: dir === 1 ? -14 * speed : 0 },
          {
            xPercent: dir === 1 ? 0 : -14 * speed,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.root} ref={rootRef} aria-label="Wipe it. Wash it. Reuse it. Swipe again.">
      <div className={styles.edge} aria-hidden="true" />
      {ROWS.map((row, i) => (
        <div key={row.text} className={styles.row} aria-hidden="true">
          <div className={`${styles.track} display`} data-row={i}>
            {Array.from({ length: 6 }).map((_, j) => (
              <span key={j} className={i % 2 ? styles.alt : undefined}>
                {row.text}&nbsp;<span className={styles.spark}>✦</span>&nbsp;
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className={styles.edgeBottom} aria-hidden="true" />
    </section>
  );
}
