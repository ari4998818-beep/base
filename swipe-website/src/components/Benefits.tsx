import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './Benefits.module.css';

const MASCOT_3D = '/assets/swipe/source/mascot/mascot-3d.webp';

const BENEFITS = [
  { word: 'Washable', note: 'again and again' },
  { word: 'Reusable', note: 'not single-use' },
  { word: 'Super absorbent', note: 'soaks it right up' },
  { word: 'Machine washable', note: 'straight in the drum' },
  { word: 'Tear-off roll', note: '30 cloths, always ready' },
  { word: 'Made for messes', note: 'everyday kitchen chaos' },
] as const;

/** Oversized benefit words sliding in from alternating sides — no icon cards.
 *  The 3D helper peeks in from the edge as the list ends. */
export default function Benefits() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(`.${styles.row}`).forEach((row, i) => {
        gsap.from(row, {
          x: (i % 2 === 0 ? -1 : 1) * 120,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 86%' },
        });
      });

      // the 3D helper peeks in from the right edge
      gsap.fromTo(
        `.${styles.peek}`,
        { xPercent: 105, rotate: 10 },
        {
          xPercent: 28,
          rotate: -4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: `.${styles.peek}`,
            start: 'top 95%',
            end: 'top 55%',
            scrub: 0.6,
          },
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.root} ref={rootRef}>
      <div className={styles.edge} aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.kicker}>Why people keep them around</p>
        <ul className={styles.list}>
          {BENEFITS.map((b, i) => (
            <li key={b.word} className={styles.row}>
              <span className={`display ${styles.word} ${i % 2 ? styles.outline : ''}`}>
                {b.word}
              </span>
              <span className={styles.note}>
                <span className={styles.noteSpark}>✦</span>
                {b.note}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <img
        className={styles.peek}
        src={MASCOT_3D}
        alt="The Swipe helper peeking into the page"
      />
    </section>
  );
}
