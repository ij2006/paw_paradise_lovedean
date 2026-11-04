// Blog page — load posts and handle admin write/delete

(function () {
  // Shared connection from auth.js (so the admin sign-in is recognised here)
  var sb = (typeof db !== 'undefined' && db) ? db : null;

  var isAdmin = false;

  // ── Init ────────────────────────────────────
  async function init() {
    await checkAdmin();
    await loadPosts();
  }

  // ── Admin check ──────────────────────────────
  async function checkAdmin() {
    if (!sb) return;
    var res = await sb.auth.getUser();
    if (!res.data || !res.data.user) return;
    var uid = res.data.user.id;
    var profileRes = await sb.from('profiles').select('full_name, is_admin').eq('id', uid).single();
    if (profileRes.data && profileRes.data.is_admin) {
      isAdmin = true;
      var authorInput = document.getElementById('post-author');
      if (authorInput && profileRes.data.full_name) {
        authorInput.value = profileRes.data.full_name;
      }
      var writeSection = document.getElementById('blog-write-section');
      if (writeSection) writeSection.classList.add('visible');
    }
  }

  // ── Load posts ───────────────────────────────
  async function loadPosts() {
    var listEl = document.getElementById('posts-list');
    if (!listEl) return;

    listEl.innerHTML = '<div class="blog-loading">Loading posts&hellip;</div>';

    if (!sb) {
      listEl.innerHTML = '<div class="blog-empty"><p>Unable to load posts — please refresh the page.</p></div>';
      return;
    }

    var res = await sb.from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (res.error || !res.data || res.data.length === 0) {
      listEl.innerHTML = '<div class="blog-empty"><p>No posts yet — check back soon.</p></div>';
      return;
    }

    listEl.innerHTML = '';
    res.data.forEach(function (post) {
      listEl.appendChild(buildPostCard(post));
    });
  }

  // ── Build post card ──────────────────────────
  function buildPostCard(post) {
    var card = document.createElement('article');
    card.className = 'blog-post-card';
    card.dataset.id = post.id;

    var date = new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    var initial = (post.author_name || 'P').charAt(0).toUpperCase();
    var bodyHtml = formatBody(post.body || '');
    var excerptHtml = post.excerpt ? '<p class="blog-post-excerpt">' + esc(post.excerpt) + '</p>' : '';
    var deleteBtn = isAdmin
      ? '<button class="btn-delete-post admin-visible" onclick="deleteBlogPost(' + post.id + ')">Delete</button>'
      : '';

    card.innerHTML =
      '<div class="blog-post-header">' +
        '<div class="blog-post-meta">' +
          '<div class="blog-post-author-avatar">' + esc(initial) + '</div>' +
          '<div class="blog-post-byline">' +
            '<span class="blog-post-author-name">' + esc(post.author_name || 'Paw Paradise') + '</span>' +
            '<span class="blog-post-date">' + date + '</span>' +
          '</div>' +
        '</div>' +
        '<h2 class="blog-post-title">' + esc(post.title) + '</h2>' +
        excerptHtml +
      '</div>' +
      '<div class="blog-post-body-wrap" id="body-' + post.id + '">' +
        '<div class="blog-post-body">' + bodyHtml + '</div>' +
      '</div>' +
      '<div class="blog-post-footer">' +
        '<button class="btn-read-more" id="toggle-' + post.id + '" onclick="togglePost(' + post.id + ')">Read more</button>' +
        deleteBtn +
      '</div>';

    return card;
  }

  // ── Toggle post body open/closed ─────────────
  window.togglePost = function (id) {
    var bodyWrap = document.getElementById('body-' + id);
    var btn = document.getElementById('toggle-' + id);
    if (!bodyWrap || !btn) return;
    var open = bodyWrap.classList.toggle('open');
    btn.textContent = open ? 'Close' : 'Read more';
    btn.classList.toggle('open', open);
  };

  // ── Publish post ─────────────────────────────
  window.publishPost = async function () {
    var title   = (document.getElementById('post-title')  || {}).value || '';
    var excerpt = (document.getElementById('post-excerpt')|| {}).value || '';
    var body    = (document.getElementById('post-body')   || {}).value || '';
    var author  = (document.getElementById('post-author') || {}).value || 'Paw Paradise';
    var msgEl   = document.getElementById('write-msg');

    if (!title.trim()) { setWriteMsg('Please add a title.', 'error'); return; }
    if (!body.trim())  { setWriteMsg('Please write something in the post body.', 'error'); return; }
    if (!sb) { setWriteMsg('Connection error — please refresh.', 'error'); return; }

    var btn = document.getElementById('btn-publish');
    btn.disabled = true; btn.textContent = 'Publishing…';

    var userRes = await sb.auth.getUser();
    if (!userRes.data || !userRes.data.user) {
      setWriteMsg('You must be signed in to publish.', 'error');
      btn.disabled = false; btn.textContent = 'Publish post';
      return;
    }

    var res = await sb.from('blog_posts').insert({
      author_id:   userRes.data.user.id,
      author_name: author.trim(),
      title:       title.trim(),
      excerpt:     excerpt.trim() || null,
      body:        body.trim(),
      published:   true
    });

    btn.disabled = false; btn.textContent = 'Publish post';

    if (res.error) {
      setWriteMsg('Could not publish: ' + res.error.message, 'error');
    } else {
      setWriteMsg('Post published.', 'success');
      document.getElementById('post-title').value   = '';
      document.getElementById('post-excerpt').value = '';
      document.getElementById('post-body').value    = '';
      await loadPosts();
    }
  };

  // ── Delete post ──────────────────────────────
  window.deleteBlogPost = async function (id) {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    if (!sb) return;
    var res = await sb.from('blog_posts').delete().eq('id', id);
    if (!res.error) {
      var card = document.querySelector('[data-id="' + id + '"]');
      if (card) card.remove();
      var list = document.getElementById('posts-list');
      if (list && !list.querySelector('.blog-post-card')) {
        list.innerHTML = '<div class="blog-empty"><p>No posts yet — check back soon.</p></div>';
      }
    }
  };

  // ── Helpers ──────────────────────────────────
  function setWriteMsg(msg, type) {
    var el = document.getElementById('write-msg');
    if (!el) return;
    el.textContent = msg;
    el.className = 'write-msg--' + type;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBody(text) {
    return '<p>' + esc(text).replace(/\r?\n\r?\n/g, '</p><p>').replace(/\r?\n/g, '<br>') + '</p>';
  }

  // ── Run ──────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
