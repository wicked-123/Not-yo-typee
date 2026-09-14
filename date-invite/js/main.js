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

  /* ── 1.5. SCANNER AUTHENTICATION ──────────────────────── */
  const scannerOverlay = document.getElementById('scanner-overlay');
  const scannerBtn = document.getElementById('scanner-btn');
  const scannerProgress = document.getElementById('scanner-ring-progress');
  const scannerText = document.getElementById('scanner-text');
  const envWrapper = document.getElementById('envelope-letter-wrapper');
  
  let scanTimer;
  let isScanning = false;
  let authSuccess = false;

  function startScan(e) {
    if (authSuccess || e.button === 2) return;
    isScanning = true;
    scannerBtn.classList.add('holding');
    scannerBtn.classList.remove('failed');
    scannerText.classList.remove('failed');
    scannerText.textContent = "Scanning...";
    
    // Start progress animation
    if(scannerProgress) {
      scannerProgress.style.transition = "stroke-dashoffset 3s linear";
      scannerProgress.style.strokeDashoffset = "0";
    }

    scanTimer = setTimeout(() => {
      authSuccess = true;
      isScanning = false;
      scannerBtn.classList.remove('holding');
      scannerBtn.classList.add('success');
      scannerText.classList.add('success');
      
      const configName = (typeof dateConfig !== 'undefined' && dateConfig.herName) ? dateConfig.herName : 'Miss Charismatic';
      scannerText.textContent = `Match Found: ${configName}`;
      
      if(scannerProgress) {
        scannerProgress.style.stroke = "#10b981";
      }

      setTimeout(() => {
        scannerOverlay.classList.add('auth-success');
        if(envWrapper) envWrapper.classList.remove('hidden-until-auth');
        
        // Trigger background music play attempt here as well!
        if (typeof playMusic === 'function') playMusic();
        
        setTimeout(() => scannerOverlay.remove(), 1000);
      }, 1500);
      
    }, 3000);
  }

  function stopScan() {
    if (authSuccess || !isScanning) return;
    isScanning = false;
    clearTimeout(scanTimer);
    scannerBtn.classList.remove('holding');
    scannerBtn.classList.add('failed');
    scannerText.classList.add('failed');
    scannerText.textContent = "Authentication Failed";
    
    // Reset progress
    if(scannerProgress) {
      scannerProgress.style.transition = "stroke-dashoffset 0.3s ease";
      scannerProgress.style.strokeDashoffset = "340";
    }

    setTimeout(() => {
      if (!isScanning && !authSuccess) {
        scannerBtn.classList.remove('failed');
        scannerText.classList.remove('failed');
        scannerText.textContent = "Hold to authenticate";
      }
    }, 1200);
  }

  if (scannerBtn) {
    scannerBtn.addEventListener('mousedown', startScan);
    scannerBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startScan(e); }, { passive: false });
    
    window.addEventListener('mouseup', stopScan);
    window.addEventListener('touchend', stopScan);
  }

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

  /* ── 3. BACKGROUND MUSIC LOGIC ─────────────────────────── */
  const bgMusic       = document.getElementById('bg-music');
  const musicBtn      = document.getElementById('music-control-btn');
  const musicStatus   = document.getElementById('music-status-text');
  let isMusicPlaying  = false;
  let musicStarted    = false;

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      musicStarted = true;
      musicBtn.classList.add('playing', 'visible');
      if (musicStatus) musicStatus.textContent = 'Playing ♡';
    }).catch(err => {
      console.log('Autoplay deferred until touch:', err);
      musicBtn.classList.add('visible');
      if (musicStatus) musicStatus.textContent = 'Play Music';
    });
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isMusicPlaying = false;
    musicBtn.classList.remove('playing');
    if (musicStatus) musicStatus.textContent = 'Play Music';
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  // Attempt immediate autoplay on load
  playMusic();

  // Auto-play fallback on first touch/swipe/scroll anywhere on the page
  function enableAutoPlayOnFirstTouch() {
    if (musicStarted) return;
    playMusic();
    window.removeEventListener('touchstart', enableAutoPlayOnFirstTouch);
    window.removeEventListener('click', enableAutoPlayOnFirstTouch);
    window.removeEventListener('scroll', enableAutoPlayOnFirstTouch);
  }

  window.addEventListener('touchstart', enableAutoPlayOnFirstTouch, { passive: true, once: true });
  window.addEventListener('click', enableAutoPlayOnFirstTouch, { passive: true, once: true });
  window.addEventListener('scroll', enableAutoPlayOnFirstTouch, { passive: true, once: true });

  /* ── 3b. ENVELOPE INTERACTION ──────────────────────────── */
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const swipeCta        = document.getElementById('swipe-cta');
  const secLetter       = document.getElementById('sec-letter');
  let envelopeOpened = false;

  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    envelopeWrapper.classList.add('opened');
    
    // Start music on envelope open
    playMusic();

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
  const btnReplay = document.getElementById('btn-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
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
      const thinkMsg = document.getElementById('think-msg');
      if (thinkMsg) thinkMsg.classList.add('hidden');
      document.body.style.overflow = '';

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 9. TOUCH & CURSOR SPARKLE TRAIL ─────────────────── */
  let lastTrailTime = 0;
  function createHeartTrail(x, y) {
    const now = Date.now();
    if (now - lastTrailTime < 65) return; // limit spawn rate
    lastTrailTime = now;

    const spark = document.createElement('div');
    const items = ['✨', '💖', '🌸', '✨', '💕', '🌷'];
    const item = items[Math.floor(Math.random() * items.length)];
    
    spark.textContent = item;
    spark.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 9999;
      font-size: ${10 + Math.random() * 12}px;
      transform: translate(-50%, -50%) scale(0.6);
      opacity: 0.9;
      transition: transform 0.8s ease-out, opacity 0.8s ease-out;
    `;
    document.body.appendChild(spark);

    requestAnimationFrame(() => {
      spark.style.transform = `translate(-50%, ${-25 - Math.random() * 25}px) scale(1.2) rotate(${(Math.random() - 0.5) * 40}deg)`;
      spark.style.opacity = '0';
    });

    setTimeout(() => spark.remove(), 850);
  }

  window.addEventListener('pointermove', (e) => {
    createHeartTrail(e.clientX, e.clientY);
  }, { passive: true });

  /* ── 9. SCRATCH-OFF CANVAS FOR ALL CARDS ────────────────── */
  const scratchCanvases = document.querySelectorAll('.scratch-canvas');
  
  scratchCanvases.forEach((canvas, index) => {
    const sCtx = canvas.getContext('2d');
    const contentId = `scratch-content-${index + 1}`;
    let isDrawing = false;
    let hasRevealed = false;

    function initScratchCard() {
      if (canvas.width !== canvas.parentElement.clientWidth && canvas.parentElement.clientWidth > 0) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        
        // Draw highly realistic metallic gradient
        const grad = sCtx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0.0, "#f8f9fa"); // white-ish
        grad.addColorStop(0.2, "#a1a5ab"); // dark silver
        grad.addColorStop(0.4, "#f8f9fa"); // white-ish
        grad.addColorStop(0.6, "#71767d"); // deeper grey
        grad.addColorStop(0.8, "#f8f9fa"); // white-ish
        grad.addColorStop(1.0, "#a1a5ab"); // dark silver
        
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Add subtle glitter/noise texture
        for(let i=0; i<3000; i++) {
          sCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)';
          sCtx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
        }
        
        // Draw beautiful text
        sCtx.font = "bold 22px 'Playfair Display'";
        sCtx.textAlign = "center";
        sCtx.textBaseline = "middle";
        
        sCtx.shadowColor = "rgba(0,0,0,0.6)";
        sCtx.shadowBlur = 6;
        sCtx.shadowOffsetX = 0;
        sCtx.shadowOffsetY = 2;
        
        sCtx.fillStyle = '#ffffff';
        sCtx.fillText("✨ Scratch Me ✨", canvas.width / 2, canvas.height / 2);

        // Reset shadow for erasing
        sCtx.shadowBlur = 0;
        sCtx.shadowOffsetX = 0;
        sCtx.shadowOffsetY = 0;

        // Enable eraser mode
        sCtx.globalCompositeOperation = 'destination-out';
      }
    }

    const scratchObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRevealed) {
          initScratchCard();
        }
      });
    });
    scratchObserver.observe(canvas);

    // Also try to init on window resize just in case
    window.addEventListener('resize', () => {
      if (!hasRevealed && canvas.parentElement.clientWidth > 0) {
        initScratchCard();
      }
    });

    function getMousePos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function startScratch(e) {
      if (hasRevealed || !canvas.width) return;
      isDrawing = true;
      scratch(e);
    }
    function endScratch() {
      if (isDrawing) {
        isDrawing = false;
        checkReveal();
      }
    }
    function scratch(e) {
      if (!isDrawing || hasRevealed) return;
      if (e.cancelable) e.preventDefault(); 
      
      const pos = getMousePos(e);
      sCtx.beginPath();
      // Use shadow to create a soft brush edge like real scratching
      sCtx.shadowBlur = 10;
      sCtx.shadowColor = 'black';
      sCtx.arc(pos.x, pos.y, 35, 0, Math.PI * 2);
      sCtx.fill();
    }

    function checkReveal() {
      if (hasRevealed || !canvas.width) return;
      const imageData = sCtx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) transparentPixels++;
      }
      const percent = (transparentPixels / (pixels.length / 4)) * 100;
      if (percent > 45) { // If 45% scratched, reveal it
        hasRevealed = true;
        canvas.style.opacity = '0';
        const contentEl = document.getElementById(contentId);
        if(contentEl) contentEl.classList.add('revealed');
        setTimeout(() => { canvas.style.display = 'none'; }, 1000);
      }
    }

    canvas.addEventListener('mousedown', startScratch);
    canvas.addEventListener('touchstart', startScratch, { passive: false });
    window.addEventListener('mousemove', (e) => {
      if(e.target === canvas) scratch(e);
    });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    window.addEventListener('mouseup', endScratch);
    window.addEventListener('touchend', endScratch);
  });

});

