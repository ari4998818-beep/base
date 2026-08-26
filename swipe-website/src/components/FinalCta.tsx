import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './FinalCta.module.css';

const PACK = '/assets/swipe/source/packaging/dish-towel-roll-green-packaged.webp';
const MASCOT_3D = '/assets/swipe/source/mascot/mascot-3d.webp';

export default function FinalCta() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(`.${styles.line}`, {
        yPercent: 115,
        stagger: 0.1,
        duration: 0.85,
        ease: 'power4.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 60%' },
      });

      gsap.from(`.${styles.pack}, .${styles.helper}`, {
        y: 80,
        opacity: 0,
        rotate: (i) => (i === 0 ? -8 : 8),
        stagger: 0.12,
        duration: 1.1,
        ease: 'elastic.out(1, 0.65)',
        scrollTrigger: { trigger: rootRef.current, start: 'top 55%' },
      });

      gsap.to(`.${styles.helper}`, {
        y: -12,
        duration: 2.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.root} id="cta" ref={rootRef}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={`display ${styles.headline}`}>
            <span className={styles.mask}>
              <span className={styles.line}>Ready for</span>
            </span>
            <span className={styles.mask}>
              <span className={`${styles.line} ${styles.pink}`}>the next mess.</span>
            </span>
          </h2>
          <div className={styles.actions}>
            {/* TODO(final links): replace href="#" with the real store locator URL */}
            <a href="#" className="btn btn--pink" onClick={(e) => e.preventDefault()}>
              Find Swipe Near You
            </a>
            {/* TODO(final links): replace with the real contact email/page */}
            <a href="#" className="btn btn--line" onClick={(e) => e.preventDefault()}>
              Contact Swipe
            </a>
          </div>
          <p className={styles.finePrint}>The people's cleaning brand.</p>
        </div>

        <div className={styles.art} aria-hidden="true">
          <img className={`${styles.pack} photo-card`} src={PACK} alt="" />
          <img className={`${styles.helper} photo-card`} src={MASCOT_3D} alt="" />
        </div>
      </div>
    </section>
  );
}
