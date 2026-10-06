import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './ColorMoment.module.css';

const ROLL = '/assets/swipe/source/products/dish-towel-roll-green-unpackaged.webp';

const COLORS = [
  { name: 'Green', bg: 'var(--green-deep)' },
  { name: 'Blue', bg: 'var(--variant-blue)' },
  { name: 'Red', bg: 'var(--variant-red)' },
] as const;

/**
 * Pinned full-screen moment that flows green → blue → red.
 * Green shows the real product; blue and red use TEMPORARY CSS roll
 * silhouettes until the recolored product photos are generated.
 */
export default function ColorMoment() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const stage = `.${styles.stage}`;
      const rolls = gsap.utils.toArray<HTMLElement>(`.${styles.rollSlot}`);
      const names = gsap.utils.toArray<HTMLElement>(`.${styles.colorName}`);

      gsap.set(rolls.slice(1), { yPercent: 30, opacity: 0, rotate: 8 });
      gsap.set(names.slice(1), { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '+=260%',
          pin: true,
          scrub: 0.6,
        },
      });

      COLORS.forEach((c, i) => {
        if (i === 0) return;
        tl.to(stage, { backgroundColor: c.bg, duration: 1 });
        tl.to(rolls[i - 1], { yPercent: -30, opacity: 0, rotate: -8, duration: 0.7 }, '<');
        tl.to(names[i - 1], { opacity: 0, duration: 0.4 }, '<');
        tl.to(rolls[i], { yPercent: 0, opacity: 1, rotate: 0, duration: 0.7 }, '<0.15');
        tl.to(names[i], { opacity: 1, duration: 0.4 }, '<');
        tl.to({}, { duration: 0.5 }); // rest on each color
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.root} id="colors" ref={rootRef}>
      <div className={styles.stage}>
        <h2 className={`display ${styles.headline}`}>
          Pick a color.
          <br />
          Start swiping.
        </h2>

        {/* giant color word behind the product */}
        <div className={styles.names} aria-hidden="true">
          {COLORS.map((c) => (
            <span key={c.name} className={`display ${styles.colorName}`}>
              {c.name}
            </span>
          ))}
        </div>

        <div className={styles.rolls}>
          {/* GREEN — the real product */}
          <div className={styles.rollSlot}>
            <img className="photo-card" src={ROLL} alt="Swipe roll with green stitching" />
          </div>

          {/* BLUE — TEMPORARY silhouette placeholder (real blue product photo
              will be generated later) */}
          <div className={styles.rollSlot} aria-label="Blue roll — image coming soon">
            <div className={`${styles.silhouette} ${styles.silhouetteBlue}`}>
              <span className="ph-tag">Blue roll — coming soon</span>
            </div>
          </div>

          {/* RED — TEMPORARY silhouette placeholder (real red product photo
              will be generated later) */}
          <div className={styles.rollSlot} aria-label="Red roll — image coming soon">
            <div className={`${styles.silhouette} ${styles.silhouetteRed}`}>
              <span className="ph-tag">Red roll — coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
