/* ==========================================================================
   בונה הירדן המערבי — Interactions v3.1
   ========================================================================== */

(function () {
  'use strict';

  // Apply cached font immediately to prevent FOUT
  const cachedFont = localStorage.getItem('selectedFont');
  if (cachedFont) {
    document.documentElement.style.setProperty('--font-heading', `'${cachedFont}', 'Space Grotesk', 'Heebo', sans-serif`);
    document.documentElement.style.setProperty('--font-body', `'${cachedFont}', 'DM Sans', 'Heebo', sans-serif`);
  }

  // Sync font from Firestore asynchronously if db is loaded
  if (typeof db !== 'undefined') {
    db.collection('settings').doc('admin').get()
      .then(doc => {
        if (doc.exists) {
          const font = doc.data().selectedFont;
          if (font !== cachedFont) {
            if (font) {
              localStorage.setItem('selectedFont', font);
              document.documentElement.style.setProperty('--font-heading', `'${font}', 'Space Grotesk', 'Heebo', sans-serif`);
              document.documentElement.style.setProperty('--font-body', `'${font}', 'DM Sans', 'Heebo', sans-serif`);
            } else {
              localStorage.removeItem('selectedFont');
              document.documentElement.style.setProperty('--font-heading', '');
              document.documentElement.style.setProperty('--font-body', '');
            }
          }
        }
      })
      .catch(err => console.error('Error syncing font settings:', err));
  }

  /* ═══ HEADER — Transparent → Solid (ONLY on pages with .hero or .project-hero) ═══ */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.header__nav-link[data-section]');
  const navSections = [];

  navLinks.forEach(link => {
    const sectionId = link.getAttribute('data-section');
    const section = document.getElementById(sectionId);
    if (section) navSections.push({ link, section });
  });

  function handleHeaderTransition() {
    if (!header) return;
    const hero = document.querySelector('.hero, .project-hero');

    if (window.scrollY > 20) {
      header.classList.remove('header--transparent');
      header.classList.add('header--solid');
    } else {
      if (hero) {
        header.classList.remove('header--solid');
        header.classList.add('header--transparent');
      }
    }

    // Clear active class from nav links if at the top of the page
    if (window.scrollY < 50) {
      navLinks.forEach(l => l.classList.remove('active'));
    }
  }

  handleHeaderTransition();
  window.addEventListener('scroll', () => {
    requestAnimationFrame(handleHeaderTransition);
  }, { passive: true });

  if (navSections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(l => l.classList.remove('active'));
            const activeLink = document.querySelector(`.header__nav-link[data-section="${id}"]`);
            if (activeLink) activeLink.classList.add('active');
          }
        });
      },
      { threshold: 0.15, rootMargin: '-100px 0px -50% 0px' }
    );
    navSections.forEach(({ section }) => navObserver.observe(section));
  }

  /* ═══ MOBILE MENU ═══ */
  const menuToggle = document.getElementById('menuToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');

  if (menuToggle && mobileOverlay) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileOverlay.classList.toggle('open');
      document.body.style.overflow = mobileOverlay.classList.contains('open') ? 'hidden' : '';
    });
    mobileOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileOverlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ═══ CUSTOM SMOOTH SCROLL ═══ */
  function smoothScrollTo(targetPosition, duration = 800) {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      window.scrollTo(0, startPosition + distance * ease);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }
    requestAnimationFrame(animation);
  }

  /* ═══ SMOOTH SCROLL ═══ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = 90;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        smoothScrollTo(targetPosition, 900);
      }
    });
  });

  /* ═══ PARALLAX HERO ═══ */
  const parallaxHero = document.querySelector('.hero');
  if (parallaxHero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        parallaxHero.style.backgroundPositionY = (scrolled * 0.3) + 'px';
      }
    }, { passive: true });
  }

  /* ═══ STAT COUNTER ANIMATION ═══ */
  const statNumbers = document.querySelectorAll('.stat__number');
  if (statNumbers.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNumbers.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(element) {
    const text = element.textContent.trim();
    const match = text.match(/^([+]?)([0-9,]+)([+]?)$/);
    if (!match) return;
    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const target = parseInt(numStr, 10);
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * target);
      element.textContent = prefix + current.toLocaleString('en-US') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ═══ LOAD PROJECTS FROM FIRESTORE ═══ */
  const tilesContainer = document.getElementById('tilesContainer');
  const tilesLoading = document.getElementById('tilesLoading');

  if (tilesContainer && typeof db !== 'undefined') {
    loadProjects();
  }

  async function loadProjects() {
    try {
      const snapshot = await db.collection('projects').get();
      const projects = [];
      snapshot.forEach(doc => {
        projects.push({ id: doc.id, ...doc.data() });
      });

      // Shuffle projects randomly
      for (let i = projects.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [projects[i], projects[j]] = [projects[j], projects[i]];
      }

      const displayProjects = projects.slice(0, 4);
      renderTiles(displayProjects);

      if (tilesLoading) tilesLoading.style.display = 'none';
      tilesContainer.style.display = '';

      if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (err) {
      console.error('Error loading projects:', err);
      if (tilesLoading) tilesLoading.style.display = 'none';
      tilesContainer.innerHTML = '<p style="text-align:center;color:var(--color-brown-400)">שגיאה בטעינת פרויקטים</p>';
      tilesContainer.style.display = '';
    }
  }

  function getStatusLabel(status) {
    const map = {
      'marketing': 'בשיווק',
      'sold': 'נמכר',
      'building': 'בבנייה',
      'planning': 'בתכנון',
      'occupied': 'מאוכלס'
    };
    return map[status] || status || '';
  }

  function buildMeta(p) {
    const parts = [];
    if (p.location) parts.push(p.location);
    if (p.specs) {
      if (p.specs.sqm && p.specs.sqm > 0) parts.push(p.specs.sqm + ' מ״ר');
      if (p.specs.beds && p.specs.beds > 0) parts.push(p.specs.beds + ' חד׳ שינה');
      if (p.specs.baths && p.specs.baths > 0) parts.push(p.specs.baths + ' חד׳ רחצה');
    }
    return parts.join(' · ');
  }

  function renderTiles(projects) {
    const isFile = window.location.protocol === 'file:';
    tilesContainer.innerHTML = projects.map((p, i) => {
      const projectUrl = isFile ? `project.html?id=${p.id}` : `project?id=${p.id}`;
      return `
      <article class="tile" data-aos="fade-up" data-aos-delay="${i * 100}">
        <a href="${projectUrl}" class="tile__link">
          <div class="tile__photos">
            <img src="${p.imageUrl || ''}" alt="${p.title || ''}" loading="lazy">
            ${p.status ? `<span class="tile__status">${getStatusLabel(p.status)}</span>` : ''}
          </div>
          <h3 class="tile__title">${p.title || ''}</h3>
          <p class="tile__meta">${buildMeta(p)}</p>
          ${p.description ? `<p class="tile__desc">${p.description.substring(0, 80)}${p.description.length > 80 ? '...' : ''}</p>` : ''}
          <div class="tile__btn">
            <span class="btn btn--outline btn--arrow">לפרויקט</span>
          </div>
        </a>
      </article>
      `;
    }).join('');
  }

  /* ═══ LEAD FORM → FIRESTORE ═══ */
  async function handleFormSubmit(formEl, leadType) {
    if (!formEl || typeof db === 'undefined') return;

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formEl.querySelector('button[type="submit"]');
      if (!submitBtn) return;
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'שולח...';
      submitBtn.disabled = true;

      try {
        const nameInput = formEl.querySelector('input[type="text"][id$="Name"]') || formEl.querySelector('input[id*="Name"]');
        const phoneInput = formEl.querySelector('input[type="tel"]') || formEl.querySelector('input[id*="Phone"]');
        const messageInput = formEl.querySelector('input[id*="Message"]') || formEl.querySelector('textarea[id*="Message"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        await db.collection('leads').add({
          name,
          phone,
          message,
          type: leadType,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        submitBtn.textContent = 'נשלח בהצלחה ✓';
        submitBtn.style.backgroundColor = '#2E7D32';
        formEl.reset();

        const drawer = formEl.closest('.service-row__drawer');
        if (drawer) {
          drawer.style.maxHeight = drawer.scrollHeight + 'px';
        }

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.backgroundColor = '';
          submitBtn.disabled = false;
        }, 3000);
      } catch (err) {
        console.error('Error submitting lead:', err);
        submitBtn.textContent = 'שגיאה — נסו שוב';
        submitBtn.style.backgroundColor = '#C62828';
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.backgroundColor = '';
          submitBtn.disabled = false;
        }, 3000);
      }
    });
  }

  const noahForm = document.getElementById('noahForm');
  if (noahForm) handleFormSubmit(noahForm, 'noah');

  const contactForm = document.getElementById('contactForm');
  if (contactForm) handleFormSubmit(contactForm, 'general');

  /* ═══ OFFICE HOURS ═══ */
  function updateOfficeHours() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const hourText = document.getElementById('hourText');
    const hourDot = document.getElementById('hourDot');
    if (!hourText || !hourDot) return;

    const isOpen = (day >= 0 && day <= 4) && (hour >= 9 && hour < 18);
    hourDot.classList.toggle('closed', !isOpen);
    hourText.textContent = isOpen ? 'פתוח עכשיו · א׳–ה׳ 09:00–18:00' : 'סגור כרגע · א׳–ה׳ 09:00–18:00';
  }
  updateOfficeHours();
  setInterval(updateOfficeHours, 60000);

  /* ═══ ACCESSIBILITY PANEL ═══ */
  const a11yBtn = document.getElementById('a11yBtn');
  const a11yPanel = document.getElementById('a11yPanel');
  const a11yClose = document.getElementById('a11yClose');

  if (a11yBtn && a11yPanel) {
    a11yBtn.addEventListener('click', () => {
      const isOpen = a11yPanel.classList.toggle('open');
      a11yPanel.setAttribute('aria-hidden', !isOpen);
    });

    if (a11yClose) {
      a11yClose.addEventListener('click', () => {
        a11yPanel.classList.remove('open');
        a11yPanel.setAttribute('aria-hidden', 'true');
      });
    }

    document.addEventListener('click', (e) => {
      if (!a11yPanel.contains(e.target) && !a11yBtn.contains(e.target)) {
        a11yPanel.classList.remove('open');
        a11yPanel.setAttribute('aria-hidden', 'true');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && a11yPanel.classList.contains('open')) {
        a11yPanel.classList.remove('open');
        a11yPanel.setAttribute('aria-hidden', 'true');
        a11yBtn.focus();
      }
    });

    let fontSize = 100;

    function saveA11yState() {
      const state = {
        fontSize: fontSize,
        highContrast: document.body.classList.contains('a11y-high-contrast'),
        grayscale: document.body.classList.contains('a11y-grayscale'),
        underlineLinks: document.body.classList.contains('a11y-underline-links'),
        readableFont: document.body.classList.contains('a11y-readable-font'),
        stopAnimations: document.body.classList.contains('a11y-stop-animations')
      };
      localStorage.setItem('a11y_state', JSON.stringify(state));
    }

    function loadA11yState() {
      const saved = localStorage.getItem('a11y_state');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          if (state) {
            if (state.fontSize) {
              fontSize = state.fontSize;
              document.documentElement.style.fontSize = fontSize + '%';
            }
            if (state.highContrast) {
              document.body.classList.add('a11y-high-contrast');
              const opt = document.querySelector('.a11y-option[data-action="high-contrast"]');
              if (opt) opt.classList.add('active');
            }
            if (state.grayscale) {
              document.body.classList.add('a11y-grayscale');
              const opt = document.querySelector('.a11y-option[data-action="grayscale"]');
              if (opt) opt.classList.add('active');
            }
            if (state.underlineLinks) {
              document.body.classList.add('a11y-underline-links');
              const opt = document.querySelector('.a11y-option[data-action="underline-links"]');
              if (opt) opt.classList.add('active');
            }
            if (state.readableFont) {
              document.body.classList.add('a11y-readable-font');
              const opt = document.querySelector('.a11y-option[data-action="readable-font"]');
              if (opt) opt.classList.add('active');
            }
            if (state.stopAnimations) {
              document.body.classList.add('a11y-stop-animations');
              const opt = document.querySelector('.a11y-option[data-action="stop-animations"]');
              if (opt) opt.classList.add('active');
            }
          }
        } catch (e) {
          console.error('Error loading a11y state:', e);
        }
      }
    }

    // Load state on startup
    loadA11yState();

    document.querySelectorAll('.a11y-option').forEach(option => {
      option.addEventListener('click', () => {
        const action = option.getAttribute('data-action');
        switch (action) {
          case 'increase-font':
            fontSize = Math.min(fontSize + 10, 150);
            document.documentElement.style.fontSize = fontSize + '%';
            saveA11yState();
            break;
          case 'decrease-font':
            fontSize = Math.max(fontSize - 10, 70);
            document.documentElement.style.fontSize = fontSize + '%';
            saveA11yState();
            break;
          case 'high-contrast':
            document.body.classList.toggle('a11y-high-contrast');
            option.classList.toggle('active');
            saveA11yState();
            break;
          case 'grayscale':
            document.body.classList.toggle('a11y-grayscale');
            option.classList.toggle('active');
            saveA11yState();
            break;
          case 'underline-links':
            document.body.classList.toggle('a11y-underline-links');
            option.classList.toggle('active');
            saveA11yState();
            break;
          case 'readable-font':
            document.body.classList.toggle('a11y-readable-font');
            option.classList.toggle('active');
            saveA11yState();
            break;
          case 'stop-animations':
            document.body.classList.toggle('a11y-stop-animations');
            option.classList.toggle('active');
            saveA11yState();
            break;
          case 'reset':
            fontSize = 100;
            document.documentElement.style.fontSize = '';
            document.body.classList.remove('a11y-high-contrast', 'a11y-grayscale', 'a11y-underline-links', 'a11y-readable-font', 'a11y-stop-animations');
            document.querySelectorAll('.a11y-option.active').forEach(o => o.classList.remove('active'));
            localStorage.removeItem('a11y_state');
            break;
        }
      });
    });
  }

  /* ═══ SERVICES ACCORDION (OPTION A) ═══ */
  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(item => {
    const row = item.querySelector('.service-row');
    const drawer = item.querySelector('.service-row__drawer');

    if (row && drawer) {
      row.addEventListener('click', () => {
        const isExpanded = item.classList.contains('is-expanded');

        // Close all other drawers (standard accordion behavior)
        serviceItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('is-expanded')) {
            otherItem.classList.remove('is-expanded');
            const otherDrawer = otherItem.querySelector('.service-row__drawer');
            const otherRow = otherItem.querySelector('.service-row');
            if (otherDrawer) otherDrawer.style.maxHeight = '0px';
            if (otherRow) otherRow.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current drawer
        if (isExpanded) {
          item.classList.remove('is-expanded');
          drawer.style.maxHeight = '0px';
          row.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-expanded');
          drawer.style.maxHeight = drawer.scrollHeight + 'px';
          row.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard accessibility (Space/Enter to trigger click)
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });

      // Update height on window resize if expanded
      window.addEventListener('resize', () => {
        if (item.classList.contains('is-expanded')) {
          drawer.style.maxHeight = drawer.scrollHeight + 'px';
        }
      });
    }
  });

  /* ═══ MOMENTUM SMOOTH SCROLL FOR MOUSE WHEEL ═══ */
  (function() {
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isMoving = false;
    const lerpSpeed = 0.075;

    window.addEventListener('wheel', (e) => {
      if (document.body.classList.contains('a11y-stop-animations')) return;
      
      e.preventDefault();
      
      targetY += e.deltaY;
      
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(targetY, maxScroll));
      
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(updateScroll);
      }
    }, { passive: false });

    function updateScroll() {
      const diff = targetY - currentY;
      currentY += diff * lerpSpeed;
      
      window.scrollTo(0, currentY);
      
      if (Math.abs(diff) > 0.5) {
        requestAnimationFrame(updateScroll);
      } else {
        currentY = targetY;
        window.scrollTo(0, currentY);
        isMoving = false;
      }
    }

    window.addEventListener('scroll', () => {
      if (!isMoving) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    }, { passive: true });
  })();

  /* ═══ COOKIE CONSENT BANNER ═══ */
  function initCookieBanner() {
    if (localStorage.getItem('cookie_consent_accepted')) return;

    setTimeout(() => {
      const banner = document.createElement('div');
      banner.className = 'cookie-banner';
      banner.setAttribute('role', 'status');
      banner.innerHTML = `
        <div class="cookie-banner__text">
          אנו משתמשים בקבצי עוגיות (Cookies) כדי להעניק לכם את החוויה הטובה ביותר באתר. המשך הגלישה מהווה הסכמה לשימוש זה. למידע נוסף עיינו ב<a href="privacy.html">מדיניות הפרטיות</a> שלנו.
        </div>
        <div class="cookie-banner__actions">
          <button class="cookie-banner__btn cookie-banner__btn--accept" id="cookieAcceptBtn">הבנתי</button>
        </div>
      `;
      document.body.appendChild(banner);

      // Force reflow
      banner.offsetHeight;
      banner.classList.add('show');

      const acceptBtn = document.getElementById('cookieAcceptBtn');

      const dismissBanner = () => {
        banner.classList.remove('show');
        localStorage.setItem('cookie_consent_accepted', 'true');
        setTimeout(() => banner.remove(), 500);
      };

      if (acceptBtn) acceptBtn.addEventListener('click', dismissBanner);
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }

})();
