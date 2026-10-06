import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, scrollToTarget } from '../lib/motion';
import styles from './Nav.module.css';

const LOGO = '/assets/swipe/source/logo/swipe-logo.webp';

const LINKS = [
  { label: 'The Roll', target: '#product' },
  { label: 'How It Works', target: '#how' },
  { label: 'Colors', target: '#colors' },
];

export default function Nav() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // slide away scrolling down, return scrolling up
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          gsap.to(rootRef.current, {
            yPercent: self.direction === 1 && self.scroll() > 200 ? -110 : 0,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const go = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    scrollToTarget(target);
  };

  return (
    <header className={styles.root} ref={rootRef}>
      <a href="#top" className={styles.logo} onClick={(e) => go(e, '#top')}>
        <img src={LOGO} alt="Swipe — home" />
      </a>
      <nav className={styles.links} aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.target} href={l.target} onClick={(e) => go(e, l.target)}>
            {l.label}
          </a>
        ))}
      </nav>
      <a href="#cta" className={`btn btn--pink ${styles.cta}`} onClick={(e) => go(e, '#cta')}>
        Find Swipe
      </a>
    </header>
  );
}
