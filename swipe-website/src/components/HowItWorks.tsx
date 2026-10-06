import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import styles from './HowItWorks.module.css';

const STEPS = ['Tear.', 'Use.', 'Wash.', 'Repeat.'] as const;

/**
 * One continuous pinned sequence: the word and a cloth element move through
 * TEAR → USE → WASH → REPEAT as the visitor scrolls. No cards.
 */
export default function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(`.${styles.word}`);
      const nums = gsap.utils.toArray<HTMLElement>(`.${styles.num}`);
      const cloth = `.${styles.cloth}`;
      const smear = `.${styles.smear}`;
      const drum = `.${styles.drum}`;

      gsap.set(words.slice(1), { yPercent: 120 });
      gsap.set(nums.slice(1), { opacity: 0 });
      gsap.set(drum, { scale: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '+=340%',
          pin: true,
          scrub: 0.6,
        },
      });

      // word + counter swap, anchored to an explicit label
      const swapTo = (i: number, label: string) => {
        tl.to(words[i - 1], { yPercent: -120, duration: 0.45 }, label);
        tl.to(words[i], { yPercent: 0, duration: 0.45 }, `${label}+=0.08`);
        tl.to(nums[i - 1], { opacity: 0, duration: 0.2 }, label);
        tl.to(nums[i], { opacity: 1, duration: 0.2 }, `${label}+=0.1`);
      };

      // 1 — TEAR: the cloth rips away from the strip above it
      tl.addLabel('tear');
      tl.fromTo(
        cloth,
        { y: -40, rotate: 0 },
        { y: 60, rotate: -10, duration: 1, ease: 'back.out(1.6)' },
        'tear',
      );
      tl.to(`.${styles.stub}`, { y: -18, duration: 1 }, 'tear');

      // 2 — USE: the cloth wipes across, leaving a pink streak
      tl.addLabel('use', '+=0.25');
      swapTo(1, 'use');
      tl.to(cloth, { x: () => -window.innerWidth * 0.22, rotate: -22, duration: 0.6 }, 'use');
      tl.fromTo(
        smear,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0.85 },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'none' },
        'use+=0.6',
      );
      tl.to(cloth, { x: () => window.innerWidth * 0.22, rotate: 14, duration: 1.2 }, 'use+=0.6');

      // 3 — WASH: the cloth tumbles in a drum
      tl.addLabel('wash', '+=0.25');
      swapTo(2, 'wash');
      tl.to(smear, { opacity: 0, duration: 0.3 }, 'wash');
      tl.to(drum, { scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, 'wash');
      tl.to(cloth, { x: 0, y: 40, scale: 0.42, rotate: 360, duration: 1 }, 'wash+=0.2');
      tl.to(cloth, { rotate: 720, duration: 1, ease: 'power1.inOut' }, 'wash+=1.2');

      // 4 — REPEAT: everything resets, cloth pops back fresh
      tl.addLabel('repeat', '+=0.25');
      swapTo(3, 'repeat');
      tl.to(drum, { scale: 0, duration: 0.4 }, 'repeat');
      tl.to(
        cloth,
        { x: 0, y: -40, scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.4)' },
        'repeat+=0.1',
      );
      tl.to(`.${styles.stub}`, { y: 0, duration: 0.9 }, 'repeat+=0.1');
      tl.to({}, { duration: 0.5 }); // hold at the end
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.root} id="how" ref={rootRef}>
      <div className={styles.stage}>
        <p className={styles.kicker}>How it works</p>

        <div className={styles.words} aria-hidden="false">
          {STEPS.map((w, i) => (
            <span key={w} className={`display ${styles.word}`} data-step={i}>
              {w}
            </span>
          ))}
        </div>

        <div className={styles.play} aria-hidden="true">
          {/* strip left hanging after the tear */}
          <div className={`${styles.stub} cloth-grid`} />
          {/* the hero cloth that tears, wipes, washes, repeats */}
          <div className={`${styles.cloth} cloth-grid`} />
          {/* pink streak the wipe leaves behind */}
          <div className={styles.smear} />
          {/* washing-machine drum */}
          <div className={styles.drum}>
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className={styles.counter} aria-hidden="true">
          {STEPS.map((w, i) => (
            <span key={w} className={styles.num}>
              0{i + 1}
            </span>
          ))}
          <span className={styles.of}>/ 04</span>
        </div>
      </div>
    </section>
  );
}
