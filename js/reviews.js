// ─────────────────────────────────────────────
//  Reviews page — show approved reviews, and let
//  anyone leave one (no account, no email).
//  New reviews are saved as unapproved and only
//  appear after an admin approves them in admin.html.
// ─────────────────────────────────────────────
(function () {
  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Stars with halves: grey row underneath, gold row on top cut to the rating
  function fmt(n) { n = Number(n); return n % 1 ? n.toFixed(1) : String(n); }
  function starsHTML(n, cls) {
    var pct = Math.max(0, Math.min(5, Number(n))) / 5 * 100;
    return '<span class="stars ' + (cls || '') + '" role="img" aria-label="' + fmt(n) + ' out of 5 stars">' +
      '<span class="stars-bg" aria-hidden="true">★★★★★</span>' +
      '<span class="stars-fg" aria-hidden="true" style="width:' + pct + '%">★★★★★</span></span>';
  }

  function updateSummary(reviews) {
    var section = document.querySelector('.reviews-summary-section');
    if (!section || !reviews || reviews.length === 0) return;

    section.style.display = '';
    var total = reviews.length;
    var sum = reviews.reduce(function (acc, r) { return acc + Number(r.rating); }, 0);
    var avg = sum / total;

    section.querySelector('.rs-number').textContent = avg.toFixed(1);
    section.querySelector('.rs-stars').innerHTML = starsHTML(Math.round(avg * 2) / 2, 'stars--lg');
    section.querySelector('.rs-count').textContent = 'Based on ' + total + ' review' + (total === 1 ? '' : 's');

    var fills = section.querySelectorAll('.rs-bar-fill');
    // Rows: 5 | 4–4.5 | 3–3.5 | 2–2.5 | 0.5–1.5
    function bucket(r) { r = Number(r); return r >= 5 ? 5 : Math.max(1, Math.floor(r)); }
    [5, 4, 3, 2, 1].forEach(function (s, i) {
      var count = reviews.filter(function (r) { return bucket(r.rating) === s; }).length;
      fills[i].style.width = Math.round((count / total) * 100) + '%';
    });
  }

  async function loadReviews() {
    var grid = document.getElementById('reviews-grid');
    if (!grid) return;

    if (!db) {
      grid.innerHTML = '<p class="reviews-empty">Unable to load reviews right now — please try again later.</p>';
      return;
    }

    var res = await db
      .from('reviews')
      .select('name, dog, rating, review_text, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (res.error) {
      grid.innerHTML = '<p class="reviews-empty">Unable to load reviews right now — please try again later.</p>';
      return;
    }

    var reviews = res.data || [];
    updateSummary(reviews);

    if (reviews.length === 0) {
      grid.innerHTML = '<p class="reviews-empty">No reviews yet — be the first to leave one below.</p>';
      return;
    }

    grid.innerHTML = reviews.map(function (r) {
      var name = r.name || 'Visitor';
      return '<div class="review-card">' +
        '<div class="review-header">' +
          '<div class="review-avatar" aria-hidden="true">' + escHtml(name.charAt(0).toUpperCase()) + '</div>' +
          '<div>' +
            '<p class="review-name">' + escHtml(name) + '</p>' +
            (r.dog ? '<p class="review-dog">with ' + escHtml(r.dog) + '</p>' : '') +
          '</div>' +
          '<div class="review-stars">' + starsHTML(r.rating) + '</div>' +
        '</div>' +
        '<p class="review-text">“' + escHtml(r.review_text) + '”</p>' +
        '<p class="review-date">' + new Date(r.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) + '</p>' +
      '</div>';
    }).join('');
  }

  function showMsg(text, type) {
    var msg = document.getElementById('review-msg');
    msg.textContent = text;
    msg.className = 'review-submit-msg review-submit-msg--' + type;
    msg.hidden = false;
  }

  function initForm() {
    var btn = document.getElementById('rv-submit');
    if (!btn) return;

    // "Post anonymously" greys out the name box
    var anonBox = document.getElementById('rv-anon');
    var nameBox = document.getElementById('rv-name');
    anonBox.addEventListener('change', function () {
      nameBox.disabled = anonBox.checked;
      if (anonBox.checked) nameBox.value = '';
    });

    btn.addEventListener('click', async function () {
      var anon    = document.getElementById('rv-anon').checked;
      var name    = anon ? 'Anonymous' : document.getElementById('rv-name').value.trim();
      var dog     = document.getElementById('rv-dog').value.trim();
      var text    = document.getElementById('rv-review').value.trim();
      var trap    = document.getElementById('rv-website').value;
      var ratingEl = document.querySelector('input[name="rating"]:checked');

      if (!name)       { showMsg('Please add your name, or tick "Post anonymously".', 'error'); document.getElementById('rv-name').focus(); return; }
      if (!ratingEl)   { showMsg('Please choose a star rating.', 'error'); return; }
      if (text.length < 10) { showMsg('Please write a little more about your visit.', 'error'); document.getElementById('rv-review').focus(); return; }

      // Bots fill in the hidden field: pretend it worked and do nothing
      if (trap) { showMsg('Thank you! Your review will appear once we have read it.', 'success'); return; }

      if (!db) { showMsg('Connection error — please refresh the page and try again.', 'error'); return; }

      btn.disabled = true;
      btn.textContent = 'Submitting…';

      var res = await db.from('reviews').insert({
        name:        name.slice(0, 40),
        dog:         dog ? dog.slice(0, 60) : null,
        rating:      parseFloat(ratingEl.value),
        review_text: text.slice(0, 1500)
      });

      btn.disabled = false;
      btn.textContent = 'Submit review';

      if (res.error) {
        console.error(res.error);
        showMsg('Something went wrong — please try again, or email us your review.', 'error');
        return;
      }

      showMsg('Thank you! Your review will appear once we have read it.', 'success');
      ['rv-name', 'rv-dog', 'rv-review'].forEach(function (id) { document.getElementById(id).value = ''; });
      document.getElementById('rv-anon').checked = false;
      document.getElementById('rv-name').disabled = false;
      ratingEl.checked = false;
    });
  }

  loadReviews();
  initForm();
})();
