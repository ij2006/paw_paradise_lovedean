// ─────────────────────────────────────────────
//  Supabase connection + admin sign-in helpers
//
//  The site has no customer accounts. Customers book and
//  manage bookings through Acuity. Sign-in is only for the
//  family (admins), via pages/admin.html.
//
//  Note: the Supabase library itself is called `supabase`,
//  so our connection is called `db`. Don't rename it back.
// ─────────────────────────────────────────────
var db = (window.supabase && typeof SUPABASE_URL !== 'undefined')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!db) console.error('Supabase not loaded — check your internet connection.');

async function signIn(email, password) {
  if (!db) return { error: { message: 'Connection error — please refresh and try again.' } };
  return db.auth.signInWithPassword({ email: email, password: password });
}

async function signOut() {
  if (db) await db.auth.signOut();
}

async function resetPassword(email, redirectTo) {
  if (!db) return { error: { message: 'Connection error — please refresh and try again.' } };
  return db.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
}

async function getUser() {
  if (!db) return null;
  var res = await db.auth.getUser();
  return (res.data && res.data.user) || null;
}

// Returns the signed-in admin's profile, or null if not signed in / not an admin
async function getAdmin() {
  var user = await getUser();
  if (!user) return null;
  var res = await db.from('profiles').select('full_name, is_admin').eq('id', user.id).single();
  if (res.error || !res.data || !res.data.is_admin) return null;
  return { id: user.id, email: user.email, name: res.data.full_name || user.email.split('@')[0] };
}

// ─────────────────────────────────────────────
//  Staff bar: when the staff account is signed in, show a slim bar
//  at the top of every page with links to the admin page and Log out.
// ─────────────────────────────────────────────
(function () {
  if (!db) return;
  var inPages = window.location.pathname.indexOf('/pages/') !== -1;
  var adminHref = inPages ? 'admin.html' : 'pages/admin.html';

  function render(session) {
    var bar = document.getElementById('staff-bar');
    if (!session) { if (bar) bar.remove(); return; }
    if (bar) return;
    bar = document.createElement('div');
    bar.id = 'staff-bar';
    bar.className = 'staff-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Staff');
    bar.innerHTML =
      '<span class="staff-bar-label">Signed in as staff</span>' +
      '<a href="' + adminHref + '">Admin page</a>' +
      '<button type="button" id="staff-logout">Log out</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('#staff-logout').addEventListener('click', async function () {
      this.disabled = true; this.textContent = 'Logging out…';
      await signOut();
      window.location.href = adminHref;
    });
    // Footer "Staff login" becomes "Admin" while signed in
    document.querySelectorAll('.footer-admin-link').forEach(function (a) { a.textContent = 'Admin'; });
  }

  function start() {
    db.auth.getSession().then(function (res) { render(res.data && res.data.session); });
    db.auth.onAuthStateChange(function (_event, session) { render(session); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
