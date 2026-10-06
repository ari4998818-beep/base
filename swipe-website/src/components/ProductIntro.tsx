import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './ProductIntro.module.css';

const ROLL = '/assets/swipe/source/products/dish-towel-roll-green-unpackaged.webp';

export default function ProductIntro() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // headline lines wipe in
      gsap.from(`.${styles.line}`, {
        yPercent: 110,
        stagger: 0.1,
        duration: 0.85,
        ease: 'power4.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 62%' },
      });

      // the roll drifts up slightly slower than the page (parallax)
      gsap.fromTo(
        `.${styles.roll}`,
        { y: 120, rotate: 10 },
        {
          y: -60,
          rotate: 4,
          ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );

      // the cloth unrolls out of the roll as the section scrolls through
      gsap.fromTo(
        `.${styles.clothStrip}`,
        { scaleY: 0.08 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: `.${styles.clothTrack}`,
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: 0.4,
          },
        },
      );

      gsap.from(`.${styles.body}`, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.body}`, start: 'top 80%' },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.root} id="product" ref={rootRef}>
      <div className={styles.edge} aria-hidden="true" />
      <div className={styles.inner}>
        <h2 className={`display ${styles.headline}`}>
          <span className={styles.mask}>
            <span className={styles.line}>Dish towels,</span>
          </span>
          <span className={styles.mask}>
            <span className={`${styles.line} ${styles.green}`}>reimagined.</span>
          </span>
        </h2>

        <div className={styles.stage}>
          <img
            className={`${styles.roll} photo-card`}
            src={ROLL}
            alt="The Swipe roll — white cloths with a woven green grid"
          />

          {/* CSS stand-in for the unrolling cloth — replaced later by a real
              unrolled-cloth photograph */}
          <div className={styles.clothTrack} aria-hidden="true">
            <div className={`${styles.clothStrip} cloth-grid`}>
              <span className={styles.perf} />
              <span className={styles.perf} />
              <span className={styles.perf} />
            </div>
          </div>
        </div>

        <p className={styles.body}>
          A fresh cloth when you need one. Tear it, use it, wash it and bring it
          back for the next mess. <strong>30 cloths on every roll.</strong>
        </p>
      </div>
    </section>
  );
}
