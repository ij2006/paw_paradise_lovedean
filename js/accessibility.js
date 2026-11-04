(function () {
  var LS = {
    size:     'pp-fontsize',
    contrast: 'pp-contrast',
    dyslexia: 'pp-dyslexia',
    motion:   'pp-motion',
  };

  var motionDefault = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ? 'reduced' : 'on';

  var prefs = {
    size:     localStorage.getItem(LS.size)     || 'md',
    contrast: localStorage.getItem(LS.contrast) || 'off',
    dyslexia: localStorage.getItem(LS.dyslexia) || 'off',
    motion:   localStorage.getItem(LS.motion)   || motionDefault,
  };

  function apply() {
    var h = document.documentElement;
    h.setAttribute('data-fontsize', prefs.size);
    h.setAttribute('data-contrast', prefs.contrast);
    h.setAttribute('data-dyslexia', prefs.dyslexia);
    h.setAttribute('data-motion',   prefs.motion);
  }

  apply(); // before DOM renders to avoid flash

  document.addEventListener('DOMContentLoaded', function () {
    var widget = document.createElement('div');
    widget.className = 'a11y-widget';
    widget.innerHTML =
      '<button class="a11y-trigger" aria-label="Accessibility options" aria-expanded="false">' +
        'Accessibility' +
      '</button>' +
      '<div class="a11y-panel" role="dialog" aria-label="Accessibility options" hidden>' +
        '<p class="a11y-panel-title">Accessibility</p>' +

        '<div class="a11y-row">' +
          '<span class="a11y-label">Text size</span>' +
          '<div class="a11y-size-btns">' +
            '<button class="a11y-size-btn" data-size="sm" aria-label="Small text" style="font-size:12px">A</button>' +
            '<button class="a11y-size-btn" data-size="md" aria-label="Default text" style="font-size:15px">A</button>' +
            '<button class="a11y-size-btn" data-size="lg" aria-label="Large text" style="font-size:19px">A</button>' +
          '</div>' +
        '</div>' +

        '<div class="a11y-row">' +
          '<span class="a11y-label">High contrast</span>' +
          '<button class="a11y-toggle" data-pref="contrast" aria-pressed="false">' +
            '<span class="a11y-toggle-track"><span class="a11y-toggle-thumb"></span></span>' +
          '</button>' +
        '</div>' +

        '<div class="a11y-row">' +
          '<span class="a11y-label">Dyslexia-friendly font</span>' +
          '<button class="a11y-toggle" data-pref="dyslexia" aria-pressed="false">' +
            '<span class="a11y-toggle-track"><span class="a11y-toggle-thumb"></span></span>' +
          '</button>' +
        '</div>' +

        '<div class="a11y-row">' +
          '<span class="a11y-label">Reduce motion</span>' +
          '<button class="a11y-toggle" data-pref="motion" aria-pressed="false">' +
            '<span class="a11y-toggle-track"><span class="a11y-toggle-thumb"></span></span>' +
          '</button>' +
        '</div>' +

      '</div>';

    document.body.appendChild(widget);

    var trigger  = widget.querySelector('.a11y-trigger');
    var panelEl  = widget.querySelector('.a11y-panel');

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var opening = panelEl.hidden;
      panelEl.hidden = !opening;
      trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
    });

    document.addEventListener('click', function () {
      panelEl.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    });

    panelEl.addEventListener('click', function (e) { e.stopPropagation(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panelEl.hidden) {
        panelEl.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });

    // Text size buttons
    widget.querySelectorAll('.a11y-size-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        prefs.size = btn.dataset.size;
        localStorage.setItem(LS.size, prefs.size);
        apply();
        updateUI();
      });
    });

    // Toggle buttons
    widget.querySelectorAll('.a11y-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.pref;
        if (key === 'contrast') {
          prefs.contrast = prefs.contrast === 'on' ? 'off' : 'on';
          localStorage.setItem(LS.contrast, prefs.contrast);
        } else if (key === 'dyslexia') {
          prefs.dyslexia = prefs.dyslexia === 'on' ? 'off' : 'on';
          localStorage.setItem(LS.dyslexia, prefs.dyslexia);
        } else if (key === 'motion') {
          prefs.motion = prefs.motion === 'reduced' ? 'on' : 'reduced';
          localStorage.setItem(LS.motion, prefs.motion);
        }
        apply();
        updateUI();
      });
    });

    function updateUI() {
      widget.querySelectorAll('.a11y-size-btn').forEach(function (btn) {
        var active = btn.dataset.size === prefs.size;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      widget.querySelectorAll('.a11y-toggle').forEach(function (btn) {
        var key = btn.dataset.pref;
        var on = (key === 'contrast' && prefs.contrast === 'on') ||
                 (key === 'dyslexia' && prefs.dyslexia === 'on') ||
                 (key === 'motion'   && prefs.motion   === 'reduced');
        btn.classList.toggle('on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    updateUI();
  });
})();
