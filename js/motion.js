/* Scroll motion: masked headline reveals, fade-ups, parallax covers,
   hero entrance and parallax.
   Transform and opacity only. Skipped entirely for reduced motion. */

export function initMotion({ reduced, gsap, ScrollTrigger }) {
  if (reduced || !gsap || !ScrollTrigger) return;

  const ease = 'expo.out';

  // Masked headlines: the inner span slides up from below its mask.
  gsap.utils.toArray('.mask > span').forEach((el) => {
    gsap.from(el, {
      yPercent: 108, duration: 1.1, ease,
      scrollTrigger: { trigger: el.parentElement, start: 'top 92%', once: true },
    });
  });

  // Fade-up groups. Elements are visible until their trigger is set up.
  const groups = ['.case__intro .block', '.gallery > *', '.ai-table__grid', '.sub__grid > *'];
  groups.forEach((sel) => {
    const els = gsap.utils.toArray(sel);
    if (!els.length) return;
    // Only pre-hide what is still below the fold; anything already on screen stays put.
    const below = els.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
    if (!below.length) return;
    gsap.set(below, { y: 36, opacity: 0 });
    ScrollTrigger.batch(below, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease, stagger: 0.08, overwrite: true }),
    });
  });

  // Parallax covers
  gsap.utils.toArray('[data-parallax] .shot__frame img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -3.5 }, {
      yPercent: 3.5, ease: 'none',
      scrollTrigger: { trigger: img.closest('.shot'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Hero: drift the foot and fade slightly as the page scrolls away
  const heroFoot = document.querySelector('.hero__foot');
  const heroStage = document.querySelector('.hero__stage');
  if (heroFoot && heroStage) {
    gsap.to(heroStage, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(heroFoot, { y: -40, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
  }
  // Background: as the hero scrolls away, its light dims and the softer lights come in (opacity only).
  const glowHero = document.querySelector('.glow__hero');
  const glowLow = document.querySelector('.glow__low');
  if (glowHero && glowLow) {
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .fromTo(glowHero, { opacity: 1 }, { opacity: 0.18, ease: 'none' }, 0)
      .fromTo(glowLow, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0);
  }
  // Hero entrance for the lead and the buttons is a CSS animation (.motion-ok .hero__lead / .hero__cta),
  // so it never shares the transform with the magnetic hover (which uses the separate `translate` property).

  // Refresh after images load to keep pin positions right
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

