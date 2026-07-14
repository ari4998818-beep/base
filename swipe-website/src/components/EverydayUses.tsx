import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './EverydayUses.module.css';

const PACK = '/assets/swipe/source/packaging/dish-towel-roll-green-packaged.webp';
const MASCOT_FLAT = '/assets/swipe/source/mascot/mascot-flat.webp';

const USES = [
  'Kitchen counters',
  'Tables',
  'High chairs',
  'Appliances',
  'Everyday spills',
] as const;

/** Playful editorial collage — typography, color blocks, the real pack shot,
 *  and neutral placeholder frames where lifestyle photos will land later. */
export default function EverydayUses() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(`.${styles.item}`, {
        y: 70,
        opacity: 0,
        rotate: () => gsap.utils.random(-7, 7),
        stagger: 0.09,
        duration: 0.8,
        ease: 'back.out(1.5)',
        scrollTrigger: { trigger: `.${styles.collage}`, start: 'top 74%' },
      });

      gsap.from(`.${styles.headline}`, {
        yPercent: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power4.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 68%' },
      });

      // gentle drift at different speeds while scrolling past
      gsap.utils.toArray<HTMLElement>(`.${styles.item}`).forEach((el, i) => {
        gsap.to(el, {
          y: (i % 2 === 0 ? -1 : 1) * gsap.utils.random(14, 34),
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.root} ref={rootRef}>
      <div className={styles.inner}>
        <h2 className={`display ${styles.headline}`}>
          Made for <span className={styles.pink}>every</span> mess
        </h2>

        <div className={styles.collage}>
          <div className={`${styles.item} ${styles.wordCard} ${styles.cardPink}`}>
            <span className="display">{USES[0]}</span>
          </div>

          {/* PLACEHOLDER frame — lifestyle photo: cloth wiping a table */}
          <div className={`${styles.item} ${styles.photoPh}`}>
            <span className={styles.phIcon}>✦</span>
            <span className="ph-tag">Table photo — coming soon</span>
          </div>

          <div className={`${styles.item} ${styles.wordCard} ${styles.cardGreen}`}>
            <span className="display">{USES[2]}</span>
          </div>

          <div className={`${styles.item} ${styles.packCard}`}>
            <img className="photo-card" src={PACK} alt="Swipe Dish Towel Roll — the pack" />
          </div>

          <div className={`${styles.item} ${styles.wordCard} ${styles.cardNavy}`}>
            <span className="display">{USES[3]}</span>
          </div>

          {/* PLACEHOLDER frame — lifestyle photo: kitchen counter scene */}
          <div className={`${styles.item} ${styles.photoPh} ${styles.photoPhTall}`}>
            <span className={styles.phIcon}>✦</span>
            <span className="ph-tag">Counter photo — coming soon</span>
          </div>

          <div className={`${styles.item} ${styles.wordCard} ${styles.cardCream}`}>
            <span className="display">{USES[4]}</span>
          </div>

          <img
            className={`${styles.item} ${styles.mascot}`}
            src={MASCOT_FLAT}
            alt="The Swipe helper illustration, holding a cloth"
          />
        </div>
      </div>
    </section>
  );
}
