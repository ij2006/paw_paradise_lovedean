// 3D mouse-tracking tilt effect for .clickable-card elements

(function () {
  const TILT    = 10;    // max tilt degrees
  const SCALE   = 1.03;  // scale on hover
  const SHINE   = true;  // moving light reflection

  function init(card) {
    // Wrap in perspective container
    card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
    card.style.willChange = 'transform';

    // Add shine overlay
    if (SHINE) {
      const shine = document.createElement('div');
      shine.className = 'card-shine';
      shine.style.cssText = [
        'position:absolute',
        'inset:0',
        'border-radius:inherit',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 0.2s',
        'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, transparent 65%)',
        'z-index:2',
      ].join(';');
      card.appendChild(shine);
    }

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
      const shine = card.querySelector('.card-shine');
      if (shine) shine.style.opacity = '1';
    });

    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2); // -1 to 1
      const dy     = (e.clientY - cy) / (rect.height / 2); // -1 to 1
      const rotX   = -dy * TILT;  // tilt up when cursor is top
      const rotY   =  dx * TILT;  // tilt right when cursor is right

      // Layered shadow — shifts direction with tilt, depth increases with movement
      const dist  = Math.sqrt(dx * dx + dy * dy); // 0–1.41
      const sx    = -dx * 18;
      const sy    = -dy * 18;
      const near  = `${sx * 0.4}px ${sy * 0.4}px ${8  + dist * 6}px  rgba(28,61,40,0.12)`;
      const mid   = `${sx * 0.7}px ${sy * 0.7}px ${20 + dist * 14}px rgba(28,61,40,0.10)`;
      const far   = `${sx       }px ${sy       }px ${44 + dist * 20}px rgba(28,61,40,0.08)`;
      const amber = `${sx * 0.3}px ${sy * 0.3}px ${16 + dist * 8}px  rgba(184,115,51,0.12)`;

      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE})`;
      card.style.boxShadow = `${near}, ${mid}, ${far}, ${amber}`;

      // Move shine to cursor position
      const shine = card.querySelector('.card-shine');
      if (shine) {
        const px = ((e.clientX - rect.left) / rect.width)  * 100;
        const py = ((e.clientY - rect.top)  / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.22) 0%, transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s cubic-bezier(0.22,1,0.36,1)';
      card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow  = '0 2px 8px rgba(28,61,40,0.06), 0 4px 24px rgba(28,61,40,0.07)';
      const shine = card.querySelector('.card-shine');
      if (shine) shine.style.opacity = '0';
      // Clear resting shadow after transition
      setTimeout(() => { card.style.boxShadow = ''; }, 500);
    });
  }

  // Apply to all clickable cards
  function applyAll() {
    document.querySelectorAll('.clickable-card').forEach(card => {
      // Skip list items (who-list) — tilt doesn't suit horizontal items
      if (card.tagName === 'LI') return;
      // Ensure position:relative for shine overlay
      const pos = getComputedStyle(card).position;
      if (pos === 'static') card.style.position = 'relative';
      init(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }

  // Also re-apply after scroll reveals add .visible (they may not be in DOM yet)
  setTimeout(applyAll, 800);
})();
