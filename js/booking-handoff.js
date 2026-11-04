// ─────────────────────────────────────────────
//  Booking hand-off pop-up
//  Links with data-book="standard|large|all" show a short note that
//  booking opens in a new tab, then open pages/book.html in that tab.
//  book.html forwards to Acuity, and sends Back presses to booking.html.
// ─────────────────────────────────────────────
(function () {
  var links = document.querySelectorAll('a[data-book]');
  if (!links.length) return;

  var modal = document.createElement('div');
  modal.className = 'bh-overlay';
  modal.hidden = true;
  modal.innerHTML =
    '<div class="bh-backdrop" data-bh-close></div>' +
    '<div class="bh-box" role="dialog" aria-modal="true" aria-labelledby="bh-title">' +
      '<h2 id="bh-title">Booking opens in a new tab</h2>' +
      '<p class="bh-small">This page stays open here.</p>' +
      '<div class="bh-actions">' +
        '<button type="button" class="btn btn-primary" id="bh-go">Continue</button>' +
        '<button type="button" class="bh-cancel" data-bh-close>Cancel</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var goBtn = modal.querySelector('#bh-go');
  var current = null, lastFocus = null;

  function open(link) {
    current = link;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    goBtn.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let people choose for themselves
      e.preventDefault();
      open(link);
    });
  });

  goBtn.addEventListener('click', function () {
    if (!current) return;
    var w = window.open(current.href, '_blank');
    if (w) { try { w.opener = null; } catch (err) {} }
    else { window.location.href = current.href; } // pop-up blocked: open here instead
    close();
  });

  modal.addEventListener('click', function (e) { if (e.target.closest('[data-bh-close]')) close(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // keep focus inside the pop-up
      var f = modal.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
