// ─────────────────────────────────────────────
//  Admin page - family sign-in, suggestions and gallery photos.
//  Not linked from the site. Only accounts with
//  profiles.is_admin = true get past the sign-in.
// ─────────────────────────────────────────────
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var views = ['admin-loading', 'admin-signin', 'admin-newpass', 'admin-dash', 'admin-notadmin'];
  var recovering = /type=recovery/.test(window.location.hash);

  function show(id) { views.forEach(function (v) { $(v).hidden = (v !== id); }); }

  function msg(id, text, type) {
    var el = $(id);
    el.textContent = text;
    el.className = 'admin-msg admin-msg--' + (type || 'info');
    el.hidden = !text;
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ── Who is signed in? ───────────────────────
  async function route() {
    if (!db) { show('admin-signin'); msg('ad-signin-msg', 'Cannot reach the database. Check your internet connection and refresh.', 'error'); return; }
    if (recovering) { show('admin-newpass'); return; }

    var user = await getUser();
    if (!user) { show('admin-signin'); return; }

    var admin = await getAdmin();
    if (!admin) { show('admin-notadmin'); return; }

    $('ad-name').textContent = admin.name;
    show('admin-dash');
    loadSuggestions();
    loadPhotos();
  }

  // ── Sign in / out / password ────────────────
  $('ad-signin-btn').addEventListener('click', async function () {
    var email = $('ad-email').value.trim();
    var pass  = $('ad-pass').value;
    if (!email || !pass) { msg('ad-signin-msg', 'Please enter your email and password.', 'error'); return; }

    var btn = this;
    btn.disabled = true; btn.textContent = 'Signing in…';
    var res = await signIn(email, pass);
    btn.disabled = false; btn.textContent = 'Sign in';

    if (res.error) {
      var m = res.error.message || '';
      msg('ad-signin-msg', m.indexOf('Invalid login') !== -1 ? 'Incorrect email or password.' : m, 'error');
      return;
    }
    msg('ad-signin-msg', '');
    $('ad-pass').value = '';
    route();
  });

  $('ad-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('ad-signin-btn').click(); });

  $('ad-forgot-btn').addEventListener('click', async function () {
    var email = $('ad-email').value.trim();
    if (!email) { msg('ad-signin-msg', 'Type your email above first, then press this again.', 'error'); return; }
    var back = window.location.href.split('#')[0];
    var res = await resetPassword(email, back);
    msg('ad-signin-msg', res.error ? res.error.message : 'If that email has an admin account, a reset link is on its way.', res.error ? 'error' : 'success');
  });

  $('ad-newpass-btn').addEventListener('click', async function () {
    var pw = $('ad-newpass').value;
    if (pw.length < 8) { msg('ad-newpass-msg', 'Please use at least 8 characters.', 'error'); return; }
    var res = await db.auth.updateUser({ password: pw });
    if (res.error) { msg('ad-newpass-msg', res.error.message, 'error'); return; }
    msg('ad-newpass-msg', 'Password saved.', 'success');
    recovering = false;
    history.replaceState(null, '', window.location.pathname);
    setTimeout(route, 800);
  });

  async function doSignOut() { await signOut(); show('admin-signin'); }
  $('ad-signout-btn').addEventListener('click', doSignOut);
  $('ad-signout-btn2').addEventListener('click', doSignOut);

  // ── Reviews ─────────────────────────────────
  // ── Suggestions ─────────────────────────────
  var CATS = { facilities: 'Field & facilities', booking: 'Booking & sessions', website: 'Website', dogs: 'Dogs & welfare', other: 'Other' };

  async function loadSuggestions() {
    var box = $('ad-sugg');
    box.innerHTML = '<p class="admin-dim">Loading…</p>';
    var res = await db.from('suggestions').select('id, category, suggestion, name, email, created_at').order('created_at', { ascending: false });
    if (res.error) {
      box.innerHTML = '<p class="admin-msg admin-msg--error">Could not load suggestions: ' + esc(res.error.message) + '. Has the database update (database/setup-all.sql) been run?</p>';
      return;
    }
    $('ad-sugg-count').textContent = res.data.length ? '(' + res.data.length + ')' : '';
    if (!res.data.length) { box.innerHTML = '<p class="admin-dim">No suggestions yet.</p>'; return; }
    var yearAgo = Date.now() - 365 * 864e5;
    box.innerHTML = res.data.map(function (r) {
      var who = r.name || r.email
        ? esc(r.name || '') + (r.email ? ' <a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a>' : '')
        : '<span class="admin-dim">Anonymous</span>';
      var old = new Date(r.created_at).getTime() < yearAgo ? ' <span class="admin-old">Over 12 months old</span>' : '';
      return '<div class="admin-review" id="sug-' + r.id + '">' +
        '<div class="admin-review-head">' +
          (r.category ? '<strong>' + esc(CATS[r.category] || r.category) + '</strong>' : '<strong>Suggestion</strong>') +
          '<span class="admin-dim admin-date">' + fmtDate(r.created_at) + old + '</span>' +
        '</div>' +
        '<p class="admin-review-text">' + esc(r.suggestion) + '</p>' +
        '<div class="admin-review-actions"><span class="admin-dim">From: ' + who + '</span>' +
          '<button type="button" class="admin-danger" data-act="delete-sugg" data-id="' + r.id + '">Delete</button></div>' +
      '</div>';
    }).join('');
  }


  // ── Gallery photo submissions ───────────────
  function photoCard(p, url, live) {
    var who = [p.dog, p.name].filter(Boolean).map(esc).join(' with ') || '<span class="admin-dim">No names given</span>';
    var actions = live
      ? '<button type="button" class="admin-danger" data-act="delete-photo" data-id="' + p.id + '" data-path="' + esc(p.path) + '" data-live="1">Delete</button>'
      : '<button type="button" class="btn btn-primary btn-sm" data-act="approve-photo" data-id="' + p.id + '" data-path="' + esc(p.path) + '">Approve</button>' +
        '<button type="button" class="admin-danger" data-act="delete-photo" data-id="' + p.id + '" data-path="' + esc(p.path) + '">Delete</button>';
    return '<div class="admin-photo">' +
      (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener"><img src="' + esc(url) + '" alt="Submitted photo" loading="lazy" /></a>' : '<div class="admin-photo-missing">Photo missing</div>') +
      '<p class="admin-photo-who">' + who + '</p>' +
      '<p class="admin-dim admin-date">' + fmtDate(p.created_at) + '</p>' +
      '<div class="admin-review-actions">' + actions + '</div>' +
    '</div>';
  }

  async function loadPhotos() {
    var box = $('ad-photos'), liveBox = $('ad-photos-live');
    box.innerHTML = '<p class="admin-dim">Loading…</p>';
    liveBox.innerHTML = '';
    var res = await db.from('gallery_submissions').select('id, name, dog, path, approved, created_at').order('created_at', { ascending: false });
    if (res.error) {
      box.innerHTML = '<p class="admin-msg admin-msg--error">Could not load gallery photos: ' + esc(res.error.message) + '. Has database/gallery-submissions.sql been run in Supabase?</p>';
      return;
    }
    var pending = res.data.filter(function (p) { return !p.approved; });
    var live = res.data.filter(function (p) { return p.approved; });
    $('ad-photos-count').textContent = pending.length ? '(' + pending.length + ')' : '';
    $('ad-photos-live-count').textContent = live.length ? '(' + live.length + ')' : '';

    var urls = {};
    if (pending.length) {
      var signed = await db.storage.from('gallery-pending').createSignedUrls(pending.map(function (p) { return p.path; }), 3600);
      (signed.data || []).forEach(function (s) { if (s.signedUrl) urls[s.path] = s.signedUrl; });
    }
    box.innerHTML = pending.length ? pending.map(function (p) { return photoCard(p, urls[p.path], false); }).join('') : '<p class="admin-dim">Nothing waiting. All caught up.</p>';
    liveBox.innerHTML = live.length ? live.map(function (p) {
      return photoCard(p, db.storage.from('gallery-public').getPublicUrl(p.path).data.publicUrl, true);
    }).join('') : '<p class="admin-dim">No visitor photos published yet.</p>';
  }

  document.addEventListener('click', async function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var id = b.getAttribute('data-id');
    var act = b.getAttribute('data-act');
    if (act === 'approve-photo' || act === 'delete-photo') {
      var path = b.getAttribute('data-path');
      if (act === 'delete-photo' && !window.confirm('Delete this photo for good?')) return;
      b.disabled = true;
      var err = null;
      if (act === 'approve-photo') {
        var mv = await db.storage.from('gallery-pending').move(path, path, { destinationBucket: 'gallery-public' });
        if (mv.error) err = mv.error;
        else { var up = await db.from('gallery_submissions').update({ approved: true }).eq('id', id); err = up.error; }
      } else {
        var bucket = b.getAttribute('data-live') ? 'gallery-public' : 'gallery-pending';
        await db.storage.from(bucket).remove([path]);
        var del = await db.from('gallery_submissions').delete().eq('id', id);
        err = del.error;
      }
      if (err) { b.disabled = false; alert('That did not work: ' + err.message); return; }
      loadPhotos();
      return;
    }
    if (act === 'delete-sugg') {
      if (!window.confirm('Delete this suggestion for good?')) return;
      b.disabled = true;
      var r2 = await db.from('suggestions').delete().eq('id', id);
      if (r2.error) { b.disabled = false; alert('That did not work: ' + r2.error.message); return; }
      loadSuggestions();
      return;
    }
  });

  if (db) {
    db.auth.onAuthStateChange(function (event) {
      if (event === 'PASSWORD_RECOVERY') { recovering = true; show('admin-newpass'); }
    });
  }

  route();
})();
