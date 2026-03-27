/* ========================================
   BridgeTech Corporate Site - JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();
  initCounterAnimation();
  initMobileMenu();
  initAccordion();
  initFilterButtons();
  initSmoothScroll();
  initContactForm();
});

/* --- Reveal Animation (IntersectionObserver) --- */
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* --- Counter Animation --- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    /* easeOutCubic */
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * ease);
    el.textContent = prefix + current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const trigger = document.querySelector('.header__menu-trigger');
  const header = document.querySelector('.header');
  if (!trigger || !header) return;

  trigger.addEventListener('click', () => {
    header.classList.toggle('header--nav-open');
    const isOpen = header.classList.contains('header--nav-open');
    trigger.setAttribute('aria-expanded', isOpen);
  });

  /* ナビリンクをクリックしたらメニューを閉じる */
  const navLinks = document.querySelectorAll('.header__nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('header--nav-open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --- Accordion --- */
function initAccordion() {
  const triggers = document.querySelectorAll('.accordion__trigger');
  if (!triggers.length) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const content = item.querySelector('.accordion__content');
      const isOpen = item.classList.contains('accordion__item--open');

      /* 現在開いているアイテムを閉じる */
      document.querySelectorAll('.accordion__item--open').forEach(openItem => {
        openItem.classList.remove('accordion__item--open');
        openItem.querySelector('.accordion__content').style.maxHeight = '0';
      });

      /* クリックされたアイテムをトグル */
      if (!isOpen) {
        item.classList.add('accordion__item--open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* --- Filter Buttons --- */
function initFilterButtons() {
  const buttons = document.querySelectorAll('.filter__btn');
  const cards = document.querySelectorAll('[data-category]');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      /* ボタンのアクティブ状態 */
      buttons.forEach(b => b.classList.remove('filter__btn--active'));
      btn.classList.add('filter__btn--active');

      /* カードのフィルタリング */
      cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
          card.style.opacity = '0';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
          });
        } else {
          card.style.opacity = '0';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

/* --- Smooth Scroll for anchor links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* --- Contact Form (demo) --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return;
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = 'Sent!';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    }
    form.reset();
  });
}

/* --- Hero Animation on Load --- */
window.addEventListener('load', () => {
  const heroElements = document.querySelectorAll('.hero__subtitle, .hero__title, .hero__description, .hero__actions');
  heroElements.forEach((el, i) => {
    setTimeout(() => {
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + i * 150);
  });
});
