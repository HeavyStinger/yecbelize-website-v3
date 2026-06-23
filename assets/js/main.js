/* ============================================================
   YOUNG'S ENGINEERING — interactions & motion
   Vanilla core (robust, offline). Motion (motion.dev) enhances
   the hero when available. Everything degrades gracefully and
   respects prefers-reduced-motion.
   ============================================================ */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const M = window.Motion || null;   // motion.dev (UMD) — present, file://-safe
  const spring = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 };

  /* ---- Sticky header state ---- */
  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', scrollY > 6);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile drawer ---- */
  const toggle = $('.nav__toggle');
  const drawer = $('#drawer');
  if (toggle && drawer) {
    const links = $$('a', drawer);
    const set = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open && M && !reduce) {
        M.animate(links,
          { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
          { delay: M.stagger(0.05, { start: 0.08 }), duration: 0.5, easing: [0.16, 1, 0.3, 1] }
        );
      }
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', drawer).forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
    addEventListener('resize', () => { if (innerWidth >= 1000) set(false); });
  }

  /* ---- Reveal on scroll ---- */
  const reveals = $$('[data-reveal]');
  if (reveals.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(el => io.observe(el));
    }
  }

  /* ---- Count-up for stats ---- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      if (reduce) { el.textContent = target.toFixed(dec); return; }
      const dur = 1400, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(dec);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(el => io.observe(el));
  }

  /* ---- Current year ---- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---- Project filters ---- */
  const filters = $$('.filter');
  if (filters.length) {
    const items = $$('#projectGrid .proj');
    const empty = $('#noResults');
    filters.forEach(btn => btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filters.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      let shown = 0;
      items.forEach(it => {
        const match = cat === 'all' || it.dataset.cat === cat;
        it.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    }));
  }

  /* ---- Contact form → mailto (no backend on a static site) ---- */
  const form = $('#contactForm');
  if (form) {
    const clearErrors = () => $$('.field__error', form).forEach(el => { el.textContent = ''; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();
      const note = $('#formNote');
      if (!form.checkValidity()) {
        const bad = form.querySelector(':invalid');
        if (bad) {
          const errEl = document.getElementById(bad.id + 'Err');
          const msg = bad.validity.valueMissing ? 'This field is required.'
                    : bad.validity.typeMismatch  ? `Please enter a valid ${bad.type}.`
                    : bad.validationMessage;
          if (errEl) errEl.textContent = msg;
          if (note) note.textContent = 'Please fix the highlighted field above.';
          bad.focus();
        }
        return;
      }
      const data = new FormData(form);
      const subject = `Project enquiry — ${data.get('subject')}`;
      const body =
        `Name: ${data.get('name')}\n` +
        `Email: ${data.get('email')}\n` +
        `Project type: ${data.get('subject')}\n\n` +
        `${data.get('message')}\n`;
      location.href = `mailto:info@yecbelize.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (note) note.textContent = 'Opening your email app… if nothing happens, email info@yecbelize.com directly.';
    });
    /* Clear inline error as soon as the user starts correcting a field */
    $$('input, textarea, select', form).forEach(el => {
      el.addEventListener('input', () => {
        const errEl = document.getElementById(el.id + 'Err');
        if (errEl) errEl.textContent = '';
      });
    });
  }

  /* ---- Subtle hero parallax (pointer) ---- */
  const heroMedia = $('.hero__media img');
  if (heroMedia && !reduce && matchMedia('(pointer:fine)').matches) {
    const hero = $('.hero');
    let heroRect = hero.getBoundingClientRect();
    /* Cache rect on entry + resize — avoid layout read every pointermove frame */
    hero.addEventListener('pointerenter', () => { heroRect = hero.getBoundingClientRect(); }, { passive: true });
    addEventListener('resize', () => { heroRect = hero.getBoundingClientRect(); }, { passive: true });
    hero.addEventListener('pointermove', (e) => {
      const x = (e.clientX / heroRect.width - 0.5), y = (e.clientY / heroRect.height - 0.5);
      heroMedia.style.transform = `scale(1.08) translate(${x * -14}px, ${y * -14}px)`;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { heroMedia.style.transform = 'scale(1.06)'; });
  }

  /* ---- Hero entrance — Motion spring (falls back to WAAPI, then plain) ---- */
  const heroItems = $$('[data-hero]');
  if (heroItems.length && !reduce) {
    if (M) {
      M.animate(heroItems,
        { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'] },
        { delay: M.stagger(0.08, { start: 0.12 }), duration: 0.9, easing: [0.16, 1, 0.3, 1] }
      );
    } else if ('animate' in Element.prototype) {
      heroItems.forEach((el, i) => el.animate(
        [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 900, delay: 150 + i * 90, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }
      ));
    }
  }

  /* ---- Spring hover on project tiles & service rows (whileHover) ---- */
  if (M && !reduce && matchMedia('(pointer:fine)').matches) {
    $$('.proj, .person').forEach(el => {
      el.addEventListener('pointerenter', () => M.animate(el, { y: -6 }, spring));
      el.addEventListener('pointerleave', () => M.animate(el, { y: 0 }, spring));
    });
  }
})();
