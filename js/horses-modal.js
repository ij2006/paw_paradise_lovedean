(function () {
  var btn     = document.getElementById('horses-note-btn');
  var overlay = document.getElementById('horses-modal');
  if (!btn || !overlay) return;

  var box = overlay.querySelector('.hm-box');

  function openModal() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var focusable = box.querySelector('button, a');
    if (focusable) focusable.focus();
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', openModal);

  document.getElementById('horses-modal-close').addEventListener('click', closeModal);
  document.getElementById('horses-modal-x').addEventListener('click', closeModal);
  document.getElementById('horses-modal-ok').addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });
})();
