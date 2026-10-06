import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './Loader.module.css';

const LOGO = '/assets/swipe/source/logo/swipe-logo.webp';

/** ~1.5s branded opening: a cloth shape wipes across and reveals the logo. */
export default function Loader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    };

    document.body.style.overflow = 'hidden';

    if (prefersReducedMotion()) {
      const t = window.setTimeout(() => {
        document.body.style.overflow = '';
        finish();
      }, 400);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = '';
      };
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          document.body.style.overflow = '';
          finish();
        },
      });

      tl.fromTo(
        `.${styles.cloth}`,
        { xPercent: -130, rotate: -6 },
        { xPercent: 130, rotate: 6, duration: 0.85 },
      )
        .fromTo(
          `.${styles.logo}`,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power2.out' },
          0.18,
        )
        .to(`.${styles.logo}`, { scale: 1.04, duration: 0.25, ease: 'power1.inOut' }, '>-0.05')
        .to(
          rootRef.current,
          { yPercent: -100, duration: 0.5, ease: 'power4.inOut' },
          '>+0.15',
        );
    }, rootRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [onDone]);

  return (
    <div className={styles.root} ref={rootRef} aria-hidden="true">
      <img className={styles.logo} src={LOGO} alt="" />
      <div className={`${styles.cloth} cloth-grid`} />
      <div className={styles.edge} />
    </div>
  );
}
