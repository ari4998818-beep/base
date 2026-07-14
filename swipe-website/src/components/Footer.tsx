import { scrollToTarget } from '../lib/motion';
import styles from './Footer.module.css';

const LOGO = '/assets/swipe/source/logo/swipe-logo.webp';

const LINKS = [
  { label: 'The Roll', target: '#product' },
  { label: 'How It Works', target: '#how' },
  { label: 'Colors', target: '#colors' },
  { label: 'Find Swipe', target: '#cta' },
];

export default function Footer() {
  const go = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    scrollToTarget(target);
  };

  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img className={styles.logo} src={LOGO} alt="Swipe" />
          <p className={styles.statement}>
            Dish towels, reimagined. Tear. Use. Wash. Repeat.
          </p>
        </div>

        <nav className={styles.nav} aria-label="Footer">
          {LINKS.map((l) => (
            <a key={l.target} href={l.target} onClick={(e) => go(e, l.target)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className={styles.meta}>
          {/* TODO(final links): real Instagram profile URL */}
          <a href="#" onClick={(e) => e.preventDefault()}>
            Instagram <span className={styles.soon}>(coming soon)</span>
          </a>
          {/* TODO(final links): real contact email */}
          <a href="#" onClick={(e) => e.preventDefault()}>
            Contact <span className={styles.soon}>(coming soon)</span>
          </a>
        </div>
      </div>

      <div className={styles.legal}>
        <span>© 2026 Swipe. The people's cleaning brand.</span>
      </div>
    </footer>
  );
}
