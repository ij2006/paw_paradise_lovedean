// ─────────────────────────────────────────────
//  Suggestions page: anyone can send one.
//  Name and email are optional (blank = anonymous).
//  Admins read and delete them on pages/admin.html.
// ─────────────────────────────────────────────
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var textarea = $('sg-text'), counter = $('sg-count'), msgEl = $('suggestion-msg'), btn = $('sg-submit');
  if (!textarea || !btn) return;

  function msg(text, type) {
    msgEl.innerHTML = text ? '<p class="sg-msg sg-msg--' + type + '"></p>' : '';
    if (text) msgEl.firstChild.textContent = text;
  }

  textarea.addEventListener('input', function () {
    counter.textContent = textarea.value.length;
  });

  btn.addEventListener('click', async function () {
    var text  = textarea.value.trim();
    var cat   = $('sg-category').value;
    var name  = $('sg-name').value.trim();
    var email = $('sg-email').value.trim();
    msg('');

    if (text.length < 10) { msg('Please write a little more (at least 10 characters).', 'error'); textarea.focus(); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg('That email address doesn\'t look right. Check it, or leave it blank.', 'error'); $('sg-email').focus(); return; }

    // Spam trap: bots fill in the hidden field. Pretend it worked.
    if ($('sg-website').value) { done(); return; }

    if (typeof db === 'undefined' || !db) { msg('Connection problem. Please refresh the page and try again.', 'error'); return; }

    btn.disabled = true; btn.textContent = 'Sending…';
    var res = await db.from('suggestions').insert({
      category:   cat || null,
      suggestion: text.slice(0, 1000),
      name:       name || null,
      email:      email || null
    });
    btn.disabled = false; btn.textContent = 'Send suggestion';

    if (res.error) { console.error(res.error); msg('Something went wrong. Please try again, or email us instead.', 'error'); return; }
    done();
  });

  function done() {
    $('suggestion-form-wrap').hidden = true;
    $('suggestion-success').hidden = false;
  }

  $('another-btn').addEventListener('click', function () {
    ['sg-text', 'sg-name', 'sg-email', 'sg-category'].forEach(function (id) { $(id).value = ''; });
    counter.textContent = '0';
    msg('');
    $('suggestion-success').hidden = true;
    $('suggestion-form-wrap').hidden = false;
    textarea.focus();
  });
})();
