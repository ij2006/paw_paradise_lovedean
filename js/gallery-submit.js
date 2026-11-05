// ─────────────────────────────────────────────
//  Gallery page — visitor photos.
//  • Shows approved visitor photos under the main gallery.
//  • Lets anyone send up to 3 photos. Each one is shrunk in the
//    browser first (about 300 KB, location data removed), then
//    stored privately until staff approve it on the admin page.
// ─────────────────────────────────────────────
(function () {
  var MAX_FILES = 3;
  var MAX_SIDE  = 1600;   // longest edge in pixels after shrinking
  var QUALITY   = 0.82;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // ── Approved visitor photos ─────────────────
  async function loadVisitorPhotos() {
    var section = $('visitor-photos');
    var grid = $('visitor-grid');
    if (!section || !grid || !db) return;
    var res = await db.from('gallery_submissions')
      .select('name, dog, path, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (res.error || !res.data || !res.data.length) return;

    grid.innerHTML = res.data.map(function (p) {
      var url = db.storage.from('gallery-public').getPublicUrl(p.path).data.publicUrl;
      var who = [p.dog, p.name].filter(Boolean).join(' with ');
      var alt = who ? 'Visitor photo: ' + who : 'Visitor photo from the field';
      return '<figure class="visitor-figure">' +
        '<div class="gallery-item visitor-item"><img src="' + esc(url) + '" alt="' + esc(alt) + '" loading="lazy" /></div>' +
        (who ? '<figcaption class="gallery-caption">' + esc(who) + '</figcaption>' : '') +
      '</figure>';
    }).join('');
    section.hidden = false;
    if (window.ppLightboxRefresh) window.ppLightboxRefresh();
  }

  // ── Shrink a photo in the browser ───────────
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
      img.src = url;
    });
  }

  async function shrink(file) {
    var loaded = await loadImage(file);   // browsers apply the photo's rotation automatically
    var img = loaded.img;
    var w = img.naturalWidth, h = img.naturalHeight;
    var scale = Math.min(1, MAX_SIDE / Math.max(w, h));
    var canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);   // PNGs with see-through areas get a white background
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(loaded.url);
    // Redrawing on a canvas leaves out the camera's hidden data, including GPS location
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (b) { b ? resolve(b) : reject(new Error('convert')); }, 'image/jpeg', QUALITY);
    });
  }

  // ── Form ────────────────────────────────────
  function showMsg(text, type) {
    var m = $('gs-msg');
    m.textContent = text;
    m.className = 'gs-msg gs-msg--' + type;
    m.hidden = false;
  }

  // Photos picked so far. Choosing again ADDS to the list (phones often
  // let you pick only one at a time), up to MAX_FILES.
  var chosen = [];

  function renderPreview() {
    var box = $('gs-preview');
    box.innerHTML = '';
    chosen.forEach(function (f, i) {
      var wrap = document.createElement('div');
      wrap.className = 'gs-thumb';
      var img = document.createElement('img');
      var url = URL.createObjectURL(f);
      img.src = url; img.alt = '';
      img.onload = function () { URL.revokeObjectURL(url); };
      img.onerror = function () { img.replaceWith(Object.assign(document.createElement('span'), { className: 'gs-thumb-name', textContent: f.name })); };
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'gs-remove';
      rm.setAttribute('aria-label', 'Remove photo ' + (i + 1));
      rm.textContent = '×';
      rm.addEventListener('click', function () { chosen.splice(i, 1); renderPreview(); });
      wrap.appendChild(img); wrap.appendChild(rm);
      box.appendChild(wrap);
    });
    var label = $('gs-count');
    if (label) label.textContent = chosen.length ? chosen.length + ' of ' + MAX_FILES + ' chosen' + (chosen.length < MAX_FILES ? '. Tap again to add more.' : '.') : '';
  }

  function addFiles() {
    var input = $('gs-files');
    var picked = Array.prototype.slice.call(input.files || []);
    input.value = '';   // so the same photo can be picked again after removing it
    $('gs-msg').hidden = true;
    var room = MAX_FILES - chosen.length;
    if (picked.length > room) {
      if (room <= 0) showMsg('You\'ve already chosen ' + MAX_FILES + ' photos, the most you can send at once. Remove one to add another.', 'error');
      else showMsg('You can send up to ' + MAX_FILES + ' photos at a time, so only ' + room + ' more ' + (room === 1 ? 'was' : 'were') + ' added.', 'error');
      picked = picked.slice(0, Math.max(room, 0));
    }
    chosen = chosen.concat(picked);
    renderPreview();
  }

  function initForm() {
    var btn = $('gs-submit');
    if (!btn) return;
    $('gs-files').addEventListener('change', addFiles);

    btn.addEventListener('click', async function () {
      var files = chosen.slice();
      var name = $('gs-name').value.trim().slice(0, 40);
      var dog  = $('gs-dog').value.trim().slice(0, 60);
      var consent = $('gs-consent').checked;

      if (!files.length) { showMsg('Please choose at least one photo.', 'error'); $('gs-files').focus(); return; }
      if (files.length > MAX_FILES) { showMsg('Please choose up to ' + MAX_FILES + ' photos at a time.', 'error'); return; }
      if (!consent) { showMsg('Please tick the box to confirm we can show your photos.', 'error'); $('gs-consent').focus(); return; }

      // Bots fill in the hidden field: pretend it worked and do nothing
      if ($('gs-website').value) { showMsg('Thank you! We\'ll take a look and add your photos to the gallery soon.', 'success'); return; }
      if (!db) { showMsg('Connection error. Please refresh the page and try again.', 'error'); return; }

      btn.disabled = true;
      var sent = 0, failed = 0, unreadable = 0;
      for (var i = 0; i < files.length; i++) {
        btn.textContent = 'Sending photo ' + (i + 1) + ' of ' + files.length + '…';
        var blob;
        try { blob = await shrink(files[i]); }
        catch (e) { unreadable++; continue; }
        var path = uuid() + '.jpg';
        var up = await db.storage.from('gallery-pending').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
        if (up.error) { console.error(up.error); failed++; continue; }
        var row = await db.from('gallery_submissions').insert({ name: name || null, dog: dog || null, path: path, consent: true });
        if (row.error) { console.error(row.error); failed++; continue; }
        sent++;
      }
      btn.disabled = false;
      btn.textContent = 'Send photos';

      if (sent && !failed && !unreadable) {
        showMsg('Thank you! We\'ll take a look and add your ' + (sent === 1 ? 'photo' : 'photos') + ' to the gallery soon.', 'success');
        ['gs-name', 'gs-dog'].forEach(function (id) { $(id).value = ''; });
        $('gs-consent').checked = false;
        chosen = [];
        renderPreview();
      } else if (sent) {
        showMsg(sent + ' sent, but ' + (failed + unreadable) + ' didn\'t go through. ' + (unreadable ? 'Try a JPEG or PNG photo, or ' : 'Please try again, or ') + 'email it to us.', 'error');
      } else if (unreadable && !failed) {
        showMsg('We couldn\'t read that photo. Please try a JPEG or PNG, or email it to us.', 'error');
      } else {
        showMsg('Something went wrong. Please try again, or email your photos to pawparadiselovedean@gmail.com.', 'error');
      }
    });
  }

  loadVisitorPhotos();
  initForm();
})();
