    /* -------- HEADER SCROLL -------- */
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    /* -------- HAMBURGER / DRAWER -------- */
    const hamburger = document.getElementById('hamburger-btn');
    const drawer    = document.getElementById('mobile-drawer');
    const overlay   = document.getElementById('drawer-overlay');

    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      drawer.removeAttribute('aria-hidden');
      overlay.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    overlay.addEventListener('click', closeDrawer);
    document.querySelectorAll('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

    /* -------- SCROLL REVEAL -------- */
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));

    /* -------- GALLERY LIGHTBOX -------- */
    const galleryItems = document.querySelectorAll('.gallery-item[data-src]');
    const lightbox     = document.getElementById('lightbox');
    const lbImg        = document.getElementById('lightbox-img');
    const lbClose      = document.getElementById('lb-close');
    const lbPrev       = document.getElementById('lb-prev');
    const lbNext       = document.getElementById('lb-next');
    let galleryData = [];
    let currentLbIndex = 0;

    galleryItems.forEach((item, i) => {
      galleryData.push({ src: item.dataset.src, alt: item.dataset.alt });
      item.addEventListener('click', () => openLightbox(i));
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
    });

    function openLightbox(i) {
      currentLbIndex = i;
      lbImg.src = galleryData[i].src;
      lbImg.alt = galleryData[i].alt;
      lightbox.classList.add('open');
      lightbox.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    function lbNavigate(dir) {
      currentLbIndex = (currentLbIndex + dir + galleryData.length) % galleryData.length;
      lbImg.src = galleryData[currentLbIndex].src;
      lbImg.alt = galleryData[currentLbIndex].alt;
    }

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    lbPrev.addEventListener('click', () => lbNavigate(-1));
    lbNext.addEventListener('click', () => lbNavigate(1));
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbNavigate(-1);
      if (e.key === 'ArrowRight') lbNavigate(1);
    });

    /* -------- CAROUSEL TESTIMONIOS -------- */
    const track    = document.getElementById('carousel-track');
    const prevBtn  = document.getElementById('carousel-prev');
    const nextBtn  = document.getElementById('carousel-next');
    const dots     = document.querySelectorAll('.dot');
    const cards    = document.querySelectorAll('.testimonial-card');
    let currentSlide = 0;

    function getVisibleCards() {
      return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    }
    function getMaxSlide() {
      return Math.max(0, cards.length - getVisibleCards());
    }
    function goToSlide(n) {
      const max = getMaxSlide();
      currentSlide = Math.max(0, Math.min(n, max));
      const cardWidth = cards[0].offsetWidth + 24; // gap 24px
      track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
        d.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
      });
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    dots.forEach(d => d.addEventListener('click', () => goToSlide(parseInt(d.dataset.index))));

    // Touch/swipe
    let tsX = 0;
    track.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = tsX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
    }, { passive: true });

    window.addEventListener('resize', () => goToSlide(currentSlide), { passive: true });

    /* -------- FORM VALIDATION -------- */
    const form = document.getElementById('contact-form');
    function validateField(input, errorId, validFn) {
      const err = document.getElementById(errorId);
      const valid = validFn(input.value.trim());
      input.classList.toggle('error', !valid);
      err.classList.toggle('show', !valid);
      return valid;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRx = /^[\d\s\+\-\(\)]{7,}$/;

    form.addEventListener('submit', e => {
      e.preventDefault();

      // honeypot check
      const hp = form.querySelector('input[name="_hp_name"]');
      if (hp && hp.value) return;

      const vNombre   = validateField(document.getElementById('f-nombre'),   'e-nombre',   v => v.length >= 2);
      const vTelefono = validateField(document.getElementById('f-telefono'), 'e-telefono', v => phoneRx.test(v));
      const vEmail    = validateField(document.getElementById('f-email'),    'e-email',    v => emailRx.test(v));
      const vMensaje  = validateField(document.getElementById('f-mensaje'),  'e-mensaje',  v => v.length >= 10);

      if (vNombre && vTelefono && vEmail && vMensaje) {
        const btn = document.getElementById('form-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Enviando...';
        // Simulate send (replace with Formspree or EmailJS integration)
        setTimeout(() => {
          document.getElementById('form-success').classList.add('show');
          form.reset();
          btn.disabled = false;
          btn.textContent = 'Enviar Consulta';
        }, 1200);
      }
    });

    // Real-time validation on blur
    ['f-nombre','f-telefono','f-email','f-mensaje'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', () => {
        if (id === 'f-nombre')   validateField(el, 'e-nombre',   v => v.length >= 2);
        if (id === 'f-telefono') validateField(el, 'e-telefono', v => phoneRx.test(v));
        if (id === 'f-email')    validateField(el, 'e-email',    v => emailRx.test(v));
        if (id === 'f-mensaje')  validateField(el, 'e-mensaje',  v => v.length >= 10);
      });
    });

    /* -------- VIDEO THUMB FEEDBACK -------- */
    document.getElementById('main-play-btn').addEventListener('click', () => {
      alert('El video de demostración estará disponible próximamente. ¡Gracias por su interés en BIORUST!');
    });
    document.querySelectorAll('.video-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        alert('El video estará disponible próximamente. ¡Gracias por su interés en BIORUST!');
      });
      thumb.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); thumb.click(); }
      });
    });
