import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, scrollToTarget } from '../lib/motion';
import styles from './Hero.module.css';

const ROLL = '/assets/swipe/source/products/dish-towel-roll-green-unpackaged.webp';
const PACK = '/assets/swipe/source/packaging/dish-towel-roll-green-packaged.webp';

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // entrance
      gsap
        .timeline({ delay: 1.3, defaults: { ease: 'power4.out', duration: 0.9 } })
        .from(`.${styles.line}`, { yPercent: 118, stagger: 0.12 })
        .from(`.${styles.sub}, .${styles.actions}`, { y: 26, opacity: 0, stagger: 0.08 }, '-=0.5')
        .from(
          `.${styles.roll}`,
          { y: 90, rotate: 14, opacity: 0, ease: 'elastic.out(1, 0.6)', duration: 1.4 },
          '-=0.7',
        )
        .from(
          `.${styles.pack}`,
          { y: 70, rotate: -12, opacity: 0, ease: 'elastic.out(1, 0.6)', duration: 1.4 },
          '-=1.2',
        )
        .from(`.${styles.sparkA}, .${styles.sparkB}`, { scale: 0, stagger: 0.1, duration: 0.4 }, '-=1');

      // idle float
      gsap.to(`.${styles.roll}`, {
        y: -16,
        rotate: -2,
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(`.${styles.pack}`, {
        y: -12,
        rotate: 2,
        duration: 2.7,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 0.4,
      });

      // mouse parallax
      const move = (e: MouseEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        gsap.to(`.${styles.art}`, { x: nx * -26, y: ny * -14, duration: 0.8, ease: 'power2.out' });
        gsap.to(`.${styles.sparks}`, { x: nx * 34, y: ny * 22, duration: 1, ease: 'power2.out' });
      };
      window.addEventListener('mousemove', move);
      return () => window.removeEventListener('mousemove', move);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const go = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    scrollToTarget(target);
  };

  return (
    <section className={styles.root} id="top" ref={rootRef}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={`display ${styles.headline}`}>
            <span className={styles.mask}>
              <span className={styles.line}>Messes</span>
            </span>
            <span className={styles.mask}>
              <span className={styles.line}>happen.</span>
            </span>
            <span className={styles.mask}>
              <span className={`${styles.line} ${styles.pinkLine}`}>
                Just swipe<span className={styles.dot}>.</span>
              </span>
            </span>
          </h1>
          <p className={styles.sub}>
            Grab a cloth. Handle the mess. Wash it, reuse it, and keep going.
          </p>
          <div className={styles.actions}>
            <a href="#product" className="btn btn--pink" onClick={(e) => go(e, '#product')}>
              Meet the Roll
            </a>
            <a href="#how" className="btn btn--line" onClick={(e) => go(e, '#how')}>
              How It Works
            </a>
          </div>
        </div>

        <div className={styles.art} aria-hidden="true">
          <img className={`${styles.roll} photo-card`} src={ROLL} alt="" />
          <img
            className={`${styles.pack} photo-card`}
            src={PACK}
            alt="Swipe Dish Towel Roll — 30 reusable, tearable, washable cloths"
          />
        </div>

        <div className={styles.sparks} aria-hidden="true">
          <span className={`${styles.sparkA} ${styles.spark}`}>✦</span>
          <span className={`${styles.sparkB} ${styles.spark}`}>✦</span>
        </div>
      </div>

      <div className={styles.tear} aria-hidden="true" />
    </section>
  );
}
