// ── Mobile nav ────────────────────────────────
const toggle = document.querySelector('.nav-toggle');
const nav    = document.querySelector('.site-nav');

if (toggle && nav) {
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Active nav link ───────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.site-nav a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

// ── Scroll-triggered fade-up ──────────────────
const REVEAL_SELECTORS = [
  '.why-card', '.step', '.humans-section .card',
  '.pricing-card', '.session-time-card', '.reactive-callout',
  '.faq-item', '.why-intro', '.acres-content', '.who-content',
  '.about-inner', '.location-content', '.contact-details',
  '.contact-form-wrap', '.gallery-coming-soon', '.insta-grid',
  '.parking-card', '.session-length-banner', '.bring-card',
  '.testimonial-card', '.review-card',
].join(', ');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll(REVEAL_SELECTORS).forEach((el, i) => {
  el.classList.add('fade-up');
  const siblings = el.parentElement ? [...el.parentElement.children] : [];
  const idx = siblings.indexOf(el);
  if (idx > 0 && idx <= 4) el.classList.add(`delay-${idx}`);
  observer.observe(el);
});

// Also observe elements that already carry fade-up in their HTML
document.querySelectorAll('.fade-up:not(.visible)').forEach(el => observer.observe(el));

// ── More dropdown ──────────────────────────────
const moreItem = document.querySelector('.nav-more');
const moreBtn  = document.querySelector('.nav-more-btn');

if (moreBtn && moreItem) {
  moreBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = moreItem.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', () => {
    moreItem.classList.remove('open');
    moreBtn.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && moreItem.classList.contains('open')) {
      moreItem.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.focus();
    }
  });

  // Highlight More button when current page is inside the dropdown
  if (moreItem.querySelector('a.active')) {
    moreItem.classList.add('has-active');
  }
}

// ── Opening date bar ──────────────────────────
// From 16 Nov 2026 the bar says "Now open"; after 30 Nov it disappears.
(function () {
  var bar = document.getElementById('opening-bar');
  if (!bar) return;
  var now = new Date();
  var openDay = new Date(2026, 10, 16);   // months are 0-based: 10 = November
  var hideAfter = new Date(2026, 11, 1);  // 1 December 2026
  if (now >= hideAfter) { bar.remove(); return; }
  if (now >= openDay) {
    var p = bar.querySelector('p');
    var link = bar.querySelector('.ob-link');
    p.innerHTML = '<span class="ob-label">Now open</span> <strong>Book your session</strong> ';
    if (link) p.appendChild(link);
  }
  document.querySelectorAll('.opening-badge, .opening-note').forEach(function (el) {
    if (now >= openDay) el.remove();
  });
})();
