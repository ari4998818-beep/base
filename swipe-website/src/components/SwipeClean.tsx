import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './SwipeClean.module.css';

/**
 * A cloth wipes across the screen as you scroll, revealing the clean surface.
 * The messy/clean panels are TEMPORARY CSS textures — they will be replaced
 * by real before/after surface photography in the image-generation phase.
 *
 * The headline exists twice (light version on the messy layer, navy version
 * inside the clipped clean layer) so the wipe recolors it at the reveal edge.
 */
export default function SwipeClean() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // static fallback: show the clean state
      gsap.set(`.${styles.clean}`, { clipPath: 'inset(0 0% 0 0)' });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '+=220%',
          pin: true,
          scrub: 0.5,
        },
      });

      tl.fromTo(
        `.${styles.clean}`,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 -2% 0 0)', duration: 1 },
      );
      tl.fromTo(`.${styles.wiper}`, { left: '-14%' }, { left: '104%', duration: 1 }, 0);
      tl.fromTo(`.${styles.wiper}`, { rotate: -4 }, { rotate: 5, duration: 1 }, 0);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const headline = (
    <h2 className={`display ${styles.headline}`}>
      <span className={styles.hlAccent}>One swipe</span>
      <span>changes everything.</span>
    </h2>
  );

  return (
    <section className={styles.root} ref={rootRef}>
      <div className={styles.stage}>
        {/* BEFORE — temporary messy texture (PLACEHOLDER: replace with real
            before-surface photo) */}
        <div className={styles.before} aria-hidden="true">
          <span className={styles.stainA} />
          <span className={styles.stainB} />
          <span className={styles.stainC} />
          <span className={styles.crumbs} />
          <span className="ph-tag">Before photo — coming soon</span>
        </div>
        <div className={styles.messyText} aria-hidden="true">
          {headline}
        </div>

        {/* AFTER — temporary clean panel (PLACEHOLDER: replace with real
            after-surface photo) */}
        <div className={styles.clean}>
          <span className={styles.shine} aria-hidden="true">
            ✦
          </span>
          {headline}
          <span className="ph-tag">After photo — coming soon</span>
        </div>

        {/* the cloth that rides the reveal edge */}
        <div className={`${styles.wiper} cloth-grid`} aria-hidden="true" />
      </div>
    </section>
  );
}
