/* ═══════════════════════════════════════════════════════
   DATE INVITATION — MAIN SCRIPT
   Scroll animations · Envelope · Floating elements
   Confetti · Button interactions · Background particles
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // Force scroll to top on refresh
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /* ── 1. CONFIG INJECTION ──────────────────────────────── */
  document.querySelectorAll('[id^="cfg-"]').forEach(el => {
    const key = el.id.replace('cfg-', '');
    if (typeof dateConfig !== 'undefined' && dateConfig[key] != null) {
      el.textContent = dateConfig[key];
    }
  });

  /* ── 2. SCROLL-TRIGGERED ANIMATIONS ───────────────────── */
  const animEls = document.querySelectorAll('.anim');
  const animObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      if (delay > 0) {
        setTimeout(() => el.classList.add('in-view'), delay);
      } else {
        el.classList.add('in-view');
      }
      obs.unobserve(el);
    });
  }, { threshold: 0.12 });

  animEls.forEach(el => animObserver.observe(el));

  /* ── 3. ENVELOPE INTERACTION ──────────────────────────── */
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const swipeCta        = document.getElementById('swipe-cta');
  const secLetter       = document.getElementById('sec-letter');
  let envelopeOpened = false;

  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    envelopeWrapper.classList.add('opened');
    setTimeout(() => swipeCta.classList.add('hidden'), 900);
    
    // Drop the main letter card out of the envelope
    const letterCard = document.querySelector('.letter-card');
    if (letterCard) {
      setTimeout(() => {
        letterCard.classList.add('dropped');
      }, 300);
      
      // Fade out the envelope and top text after the letter has fully dropped
      setTimeout(() => {
        const envTitle = document.querySelector('.envelope-title');
        const envSub = document.querySelector('.envelope-subtitle');
        const envWrap = document.querySelector('.envelope-wrapper');
        if (envTitle) envTitle.classList.add('fade-out');
        if (envSub) envSub.classList.add('fade-out');
        if (envWrap) envWrap.classList.add('fade-out');
      }, 1500);
    }
  }

  // Open on scroll
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      if (!envelopeOpened && window.scrollY > window.innerHeight * 0.35) {
        openEnvelope();
      }
      scrollTick = false;
    });
  }, { passive: true });

  // Open on tap
  swipeCta.addEventListener('click', () => {
    openEnvelope();
    secLetter.scrollIntoView({ behavior: 'smooth' });
  });

  /* ── 4. FLOATING ELEMENTS (Section 2) ─────────────────── */
  const floatingLayer = document.getElementById('floating-layer');
  const floatColors = ['#ff6b8a','#ec407a','#d4af37','#b19cd9','#ff8a80','#f48fb1','#ffab91'];
  const hearts = ['♡','💗','💕','💖','🌸','🌺','🌷'];
  let floatInterval = null;

  function spawnFloatTo(layer) {
    const el = document.createElement('div');
    const isHeart = Math.random() > 0.45;
    const size = Math.random() * 14 + 8;

    const layerRect = layer.getBoundingClientRect();
    // Spawn just below the bottom of the current viewport, relative to the layer
    let spawnY = -layerRect.top + window.innerHeight + 24;
    // But don't spawn below the actual layer height
    if (spawnY > layer.offsetHeight) spawnY = layer.offsetHeight;

    el.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 0;
      left: ${5 + Math.random() * 90}%;
      top: ${spawnY}px;
    `;

    if (isHeart) {
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.fontSize = size + 'px';
      el.style.lineHeight = '1';
    } else {
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.borderRadius = '50%';
      el.style.background = floatColors[Math.floor(Math.random() * floatColors.length)];
    }

    layer.appendChild(el);

    const dur = 4000 + Math.random() * 3000; // slightly slower for relaxed feel
    const drift = (Math.random() - 0.5) * 80;
    const distY = window.innerHeight + 150; // travel full screen height
    const anim = el.animate([
      { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 0.8, offset: 0 },
      { transform: `translateY(-${distY * 0.7}px) translateX(${drift * 0.8}px) rotate(${(Math.random()-0.5)*40}deg)`, opacity: 0.8, offset: 0.7 },
      { transform: `translateY(-${distY}px) translateX(${drift}px) rotate(${(Math.random()-0.5)*60}deg)`, opacity: 0, offset: 1 }
    ], { duration: dur, easing: 'linear', fill: 'forwards' });

    anim.onfinish = () => el.remove();
  }

  // Observe all floating layers (section 2)
  const floatLayers = [
    { layer: floatingLayer, section: secLetter, interval: null }
  ];

  floatLayers.forEach(fl => {
    if (!fl.layer || !fl.section) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!fl.interval) fl.interval = setInterval(() => spawnFloatTo(fl.layer), 320);
        } else {
          clearInterval(fl.interval);
          fl.interval = null;
          fl.layer.querySelectorAll('*').forEach(c => c.remove());
        }
      });
    }, { threshold: 0.05 });
    obs.observe(fl.section);
  });

  /* ── 5. BUTTON INTERACTIONS ───────────────────────────── */
  const btnYes     = document.getElementById('btn-yes');
  const btnNo      = document.getElementById('btn-no');
  const btnRow     = document.getElementById('btn-row');
  const noMsg      = document.getElementById('no-msg');
  const celebration = document.getElementById('celebration');

  btnYes.addEventListener('click', () => {
    btnRow.classList.add('hidden');
    celebration.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    launchConfetti();

    const celebScrollHint = document.getElementById('celeb-scroll-hint');
    
    // start pink heart/flower float animation
    const floatingLayerYes = document.getElementById('floating-layer-yes');
    let yesFloatInterval = setInterval(() => spawnFloatTo(floatingLayerYes), 150);

    setTimeout(() => {
      // stop float animation and cleanup
      clearInterval(yesFloatInterval);
      floatingLayerYes.innerHTML = '';
      
      // show scroll hint
      if (celebScrollHint) {
        celebScrollHint.classList.remove('hidden');
        celebScrollHint.classList.add('anim', 'in-view'); // use existing fade in
      }
      
      // Allow scrolling again
      document.body.style.overflow = '';
      
      let advanced = false;
      function advanceToPlan() {
        if (advanced) return;
        advanced = true;
        celebration.classList.add('hidden'); 
        const secPlan = document.getElementById('sec-plan');
        if (secPlan) {
          secPlan.classList.remove('hidden');
          secPlan.scrollIntoView({ behavior: 'smooth' });
          
          // ensure IntersectionObserver triggers on the newly revealed cards
          const planAnims = secPlan.querySelectorAll('.anim');
          planAnims.forEach(el => animObserver.observe(el));
        }
        window.removeEventListener('wheel', advanceToPlan);
        window.removeEventListener('touchmove', advanceToPlan);
      }

      window.addEventListener('wheel', advanceToPlan);
      window.addEventListener('touchmove', advanceToPlan);
      if (celebScrollHint) {
        celebScrollHint.addEventListener('click', advanceToPlan);
      }
    }, 4000);
  });

  btnNo.addEventListener('click', () => {
    btnRow.classList.add('hidden');
    noMsg.classList.remove('hidden');
  });

  // Replay from no response
  document.getElementById('btn-replay-no').addEventListener('click', () => {
    noMsg.classList.add('hidden');
    btnRow.classList.remove('hidden');
    // Reset scroll to top or to final section if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Dismiss celebration on tap
  celebration.addEventListener('click', () => {
    document.body.style.overflow = '';
    celebration.classList.add('hidden');
    secFinal.scrollIntoView({ behavior: 'smooth' });
  });

  /* ── 6. CONFETTI ──────────────────────────────────────── */
  const confCanvas = document.getElementById('confetti-canvas');
  const confCtx    = confCanvas.getContext('2d');
  const confColors = ['#ec407a','#d4af37','#f48fb1','#ff6b8a','#b19cd9','#ffab91','#ffffff'];

  function launchConfetti() {
    confCanvas.width  = window.innerWidth;
    confCanvas.height = window.innerHeight;

    const particles = Array.from({ length: 180 }, () => ({
      x: Math.random() * confCanvas.width,
      y: Math.random() * confCanvas.height * -0.4,
      w: 3 + Math.random() * 5,
      h: 6 + Math.random() * 6,
      color: confColors[Math.floor(Math.random() * confColors.length)],
      vx: (Math.random() - 0.5) * 3 + 0.5,
      vy: 1.5 + Math.random() * 3,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 12,
      opacity: 1,
    }));

    const start = performance.now();
    const duration = 3500;

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.vy += 0.04; // gravity
        p.y += p.vy;
        p.rot += p.rv;
        // fade out in last 30%
        p.opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

        confCtx.save();
        confCtx.globalAlpha = p.opacity;
        confCtx.translate(p.x, p.y);
        confCtx.rotate(p.rot * Math.PI / 180);
        confCtx.fillStyle = p.color;
        confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confCtx.restore();
      });

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
      }
    }
    requestAnimationFrame(frame);
  }

  /* ── 7. BACKGROUND PARTICLES ──────────────────────────── */
  const bgCanvas = document.getElementById('particles-canvas');
  const bgCtx    = bgCanvas.getContext('2d');

  function resizeBg() {
    bgCanvas.width  = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resizeBg();
  window.addEventListener('resize', resizeBg);

  const dots = Array.from({ length: 45 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 0.8 + Math.random() * 1.8,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    alpha: 0.15 + Math.random() * 0.2,
  }));

  function drawDots() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = bgCanvas.width;
      if (d.x > bgCanvas.width) d.x = 0;
      if (d.y < 0) d.y = bgCanvas.height;
      if (d.y > bgCanvas.height) d.y = 0;

      bgCtx.beginPath();
      bgCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(255,255,255,${d.alpha})`;
      bgCtx.fill();
    });
    requestAnimationFrame(drawDots);
  }
  requestAnimationFrame(drawDots);

  /* ── 8. REPLAY ────────────────────────────────────────── */
  document.getElementById('btn-replay').addEventListener('click', () => {
    // Reset envelope
    envelopeOpened = false;
    envelopeWrapper.classList.remove('opened');
    swipeCta.classList.remove('hidden');

    // Reset all animations
    animEls.forEach(el => {
      el.classList.remove('in-view');
      animObserver.observe(el);
    });

    // Reset buttons / celebration
    celebration.classList.add('hidden');
    btnRow.classList.remove('hidden');
    thinkMsg.classList.add('hidden');
    document.body.style.overflow = '';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
