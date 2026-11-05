// Gallery lightbox - images and videos
(function () {
  let items = [];
  function collect() {
    items = [...document.querySelectorAll('.gallery-item')].filter(
      item => item.querySelector('img') || item.querySelector('video')
    );
  }
  collect();
  if (!document.querySelector('.gallery-grid, .visitor-grid')) return;

  let current = 0;

  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">&times;</button>
    <button class="lb-prev" aria-label="Previous">&#8592;</button>
    <div class="lb-img-wrap">
      <img class="lb-img" alt="" />
      <video class="lb-video" controls playsinline></video>
    </div>
    <button class="lb-next" aria-label="Next">&#8594;</button>
    <p class="lb-counter"></p>
  `;
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('.lb-img');
  const lbVideo   = overlay.querySelector('.lb-video');
  const lbCounter = overlay.querySelector('.lb-counter');

  function isVideo(item) { return !!item.querySelector('video'); }

  // Resolve a relative src to absolute using an anchor element
  function resolveUrl(src) {
    const a = document.createElement('a');
    a.href = src;
    return a.href;
  }

  function load(index) {
    const item = items[index];
    lbCounter.textContent = `${index + 1} / ${items.length}`;

    if (isVideo(item)) {
      const source = item.querySelector('source');
      const src    = resolveUrl(source.getAttribute('src'));
      const thumb  = item.querySelector('img');
      lbVideo.pause();
      lbVideo.removeAttribute('src');
      lbVideo.removeAttribute('poster');
      lbVideo.load();
      lbVideo.src = src;
      if (thumb) lbVideo.poster = thumb.src;
      lbImg.style.display   = 'none';
      lbVideo.style.display = 'block';
    } else {
      lbVideo.pause();
      lbVideo.removeAttribute('src');
      lbVideo.load();
      const img   = item.querySelector('img');
      lbImg.src   = img.src;
      lbImg.alt   = img.alt;
      lbImg.style.display   = '';
      lbVideo.style.display = 'none';
    }
  }

  let lastFocus = null;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Gallery viewer');

  function open(index) {
    current = index;
    lastFocus = document.activeElement;
    load(current);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('.lb-close').focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    lbVideo.pause();
    lbVideo.removeAttribute('src');
    lbVideo.load();
    setTimeout(() => { lbImg.src = ''; }, 300);
    if (lastFocus) lastFocus.focus();
  }

  function go(direction) {
    lbVideo.pause();
    current = (current + direction + items.length) % items.length;
    lbImg.style.opacity   = 0;
    lbVideo.style.opacity = 0;
    setTimeout(() => {
      load(current);
      lbImg.style.opacity   = 1;
      lbVideo.style.opacity = 1;
    }, 150);
  }

  // Make each photo/video tile usable with the keyboard and screen readers.
  // Called again by gallery-submit.js once visitor photos have loaded.
  function setup() {
    collect();
    items.forEach((item) => {
      if (item.dataset.lb) return;
      item.dataset.lb = '1';
      const img = item.querySelector('img');
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', (isVideo(item) ? 'Play video: ' : 'View photo: ') + ((img && img.alt) || 'gallery item'));
      item.addEventListener('click', () => open(items.indexOf(item)));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(items.indexOf(item)); }
      });
    });
  }
  setup();
  window.ppLightboxRefresh = setup;

  overlay.querySelector('.lb-close').addEventListener('click', close);
  overlay.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
  overlay.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); go(1); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  overlay.addEventListener('touchend',   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? go(1) : go(-1);
  });
})();
