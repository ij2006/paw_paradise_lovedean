(function () {

  // ── Build modal ──────────────────────────────
  const modal = document.createElement('div');
  modal.id = 'pp-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'pp-title');
  modal.style.cssText = [
    'display:none',
    'position:fixed',
    'inset:0',
    'z-index:3000',
    'align-items:center',
    'justify-content:center',
    'padding:20px',
  ].join(';');

  modal.innerHTML = `
    <div id="pp-backdrop" style="position:absolute;inset:0;background:rgba(26,18,10,0.8);backdrop-filter:blur(4px);"></div>
    <div id="pp-box">
      <div id="pp-head">
        <h2 id="pp-title"></h2>
        <button id="pp-x" type="button" aria-label="Close">×</button>
      </div>
      <div id="pp-body" tabindex="0"></div>
      <div id="pp-foot">
        <span></span>
        <button id="pp-close-btn" type="button">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // ── Documents shown in the pop-up ─────────────
  //  Edit the text here. (pages/privacy.html and pages/terms.html
  //  are full-page copies kept for linking from elsewhere, e.g. Acuity.)
  var ROOT = window.location.pathname.indexOf('/pages/') !== -1 ? '../' : '';
  var DOCS = {
    privacy: { title: 'Privacy Policy', html: "<p class=\"pp-updated\">Last updated: November 2026</p>\n<h3>1. Who we are</h3>\n<p>Paw Paradise Lovedean is a family-run dog field on Tagdell Lane, Lovedean, Hampshire (PO8 0QN), run by Emma Jewitt and Adam Jewitt, trading as Paw Paradise Lovedean. We are the data controller for the personal information collected through this website. Contact: <a href=\"mailto:pawparadiselovedean@gmail.com\">pawparadiselovedean@gmail.com</a>.</p>\n<h3>2. What we collect</h3>\n<ul>\n<li><strong>Bookings</strong> (through Acuity Scheduling): name, email, phone number and booking details</li>\n<li><strong>Reviews:</strong> name (or \"Anonymous\"), dog's name (optional), rating and review. No email.</li>\n<li><strong>Suggestions:</strong> your suggestion, plus name and email only if you give them</li>\n<li><strong>Gallery submissions:</strong> name, email, dog's name (optional) and photo</li>\n</ul>\n<h3>3. Why we collect it</h3>\n<ul>\n<li>To take and manage your bookings</li>\n<li>To reply to your messages</li>\n<li>To publish reviews and photos you have agreed to share</li>\n<li>To meet our legal obligations</li>\n</ul>\n<h3>4. Who handles it for us</h3>\n<p>Acuity Scheduling (bookings and payments), Supabase (suggestions and reviews from this website), Netlify (website hosting) and Google (email). They act on our instructions under data processing agreements. Some are based in the US; where data leaves the UK it is protected by UK-approved safeguards. We never sell your data or see your card details.</p>\n<h3>5. How long we keep it</h3>\n<ul>\n<li>Booking records: up to 2 years</li>\n<li>Messages and suggestions: up to 12 months</li>\n<li>Reviews: while published. Ask us any time to remove yours.</li>\n<li>Financial records: up to 7 years (HMRC requirement)</li>\n</ul>\n<h3>6. Your rights</h3>\n<p>You can ask to see, correct, delete or get a copy of your data. Email us and we will respond within 30 days.</p>\n<h3>7. Cookies</h3>\n<p>No tracking or advertising cookies. Your browser only stores your dark mode and accessibility settings (and the staff login, for our team). Acuity may set its own cookies on the booking page. Our website host and database provider keep short-term technical logs (including IP addresses) to keep the site running and secure. We don't use them to identify visitors.</p>\n<h3>8. Complaints</h3>\n<p>Please email us first: we'll acknowledge your complaint within 30 days and let you know the outcome. If you're still unhappy, you can contact the <strong>Information Commissioner's Office (ICO)</strong> at <a href=\"https://ico.org.uk\" target=\"_blank\" rel=\"noopener\">ico.org.uk</a> or call 0303 123 1113.</p>" },
    terms:   { title: 'Terms &amp; Conditions', html: "<p class=\"pp-updated\">Last updated: November 2026</p>\n            <p>Welcome to Paw Paradise. To ensure a safe, secure, and enjoyable environment for all visitors, dogs, and neighbours, please read and adhere to the following terms and conditions before using our facilities.</p>\n            <h3>1. Responsibility &amp; Liability</h3>\n            <ul>\n<li><strong>Use at Own Risk:</strong> Use of the park and its facilities is entirely at your own risk, save for any liability that cannot be excluded by law (such as death or personal injury caused directly by our negligence).</li>\n<li><strong>Supervision &amp; Control:</strong> You must always supervise and remain in control of your dog(s) and any members of your party while on the premises.</li>\n<li><strong>Limitation of Property Liability:</strong> Subject to the legal limits above, we accept no responsibility for any loss, theft, or damage to personal belongings, vehicles, or their contents brought onto the premises, or for injury or accidents involving cars, property, people, or animals.</li>\n<li><strong>No Unaccompanied Dogs:</strong> Dogs must not be left unattended at any time. If you need to step outside or leave the field, you must take your dog(s) with you.</li>\n</ul>\n            <h3>2. Parking &amp; Arrival</h3>\n            <ul>\n<li><strong>Vehicle Limit &amp; Designated Parking:</strong> A maximum of <strong>2 cars</strong> are permitted in the car park per booking. All vehicles must park strictly within the designated hard-standing car park area and are strictly prohibited from parking on the entrance, track or the verges of Tagdell Lane.</li>\n<li><strong>Arrival &amp; Buffer Protocol:</strong> Please remain outside/wait in your vehicle until the previous user has safely loaded their dogs and completely exited the car park. You must take care not to block the track or restrict access for other users at any time.</li>\n<li><strong>Gate Access &amp; Security:</strong></p>\n<ul>\n<li><p>To open the gate, use your unique gate access code sent to you via email and text message.</li>\n<li>Open the gate, secure it open safely, and drive your vehicle into the car park.</li>\n<li><strong>Important:</strong> You must keep all dogs safely secured inside your vehicle until you have closed and padlocked the car park vehicle gate.</li>\n</ul></li>\n</ul>\n            <h3>3. Dogs, Health &amp; Breed Guidelines</h3>\n            <ul>\n<li><strong>Breed-Specific Legislation (XL Bullies &amp; Banned Breeds):</strong> Any dog subject to the Dangerous Dogs Act (including XL Bullies) must comply strictly with current UK legislation. This includes holding a valid Certificate of Exemption, third-party public liability insurance, being neutered and microchipped, and being kept on a lead and muzzled until securely inside the locked paddock with all gates closed. (Note: These dogs must only be exercised solo by members of the same household unless exempt under specific multi-dog rules).</li>\n<li><strong>Vaccinations, Worming &amp; Health:</strong> All dogs visiting the park must be up to date with their vaccinations, worming, or have valid, up-to-date <strong>titer test results</strong> confirming adequate immunity. Kennel cough vaccinations are strongly recommended.</li>\n<li><strong>Sickness Policy:</strong> If your dog is ill, showing signs of illness, or displaying symptoms of infectious illness (such as coughing, vomiting, or diarrhoea), please <strong>do not</strong> bring them to the park. Please reschedule your session for when your dog is completely free of symptoms.</li>\n<li><strong>Waste Disposal:</strong> You are fully responsible for cleaning up after your dog(s) immediately. All dog waste must be securely bagged and placed in the designated bins provided on site. Leaving dog mess behind poses health risks and may result in your booking privileges being revoked.</li>\n<li><strong>Agility &amp; Play Equipment:</strong></p>\n<ul>\n<li><p><strong>Dogs Only:</strong> All agility and play equipment provided on site is strictly for canine use only. <strong>Humans are strictly prohibited from climbing, sitting, or playing on any equipment.</strong></li>\n<li><strong>Use at Own Risk:</strong> Any equipment is used entirely at your dog's own risk. Please ensure your dog is physically fit and sufficiently warmed up before using obstacles. Management accepts no liability for injuries resulting from the use of agility equipment.</li>\n</ul></li>\n</ul>\n            <h3>4. Digging &amp; Site Protection</h3>\n            <ul>\n<li><strong>Digging Restricted:</strong> Dogs are strictly prohibited from digging anywhere on the premises, except within the designated sandpit area provided. Owners must actively stop and redirect their dogs if they attempt to dig elsewhere.</li>\n<li><strong>Under-Fence Digging &amp; Supervision:</strong> Fences and gates are 6 foot high and either have an additional fence line or buried rabbit wire on all sides. Any digging or tunnelling under fences is strictly forbidden and the sole responsibility of the handler. Owners must monitor their dogs at all times to prevent escape attempts or boundary damage. Please report any holes under the fences or gates to the owner on: <a href=\"tel:+442394222052\">02394 222052</a></li>\n<li><strong>Protection of Trees &amp; Grounds:</strong> Owners must ensure their dogs do not cause damage to trees, hedging, fencing, gates, or any other natural and physical features of the site. Do not climb on gates, fencing, or structural shelters. Any resulting damage must be reported to management immediately.</li>\n</ul>\n            <h3>5. Site Conditions, Weather &amp; General Rules</h3>\n            <ul>\n<li><strong>No Smoking:</strong> Paw Paradise is a strictly no-smoking site. This is to prevent litter, fire risks and dangerous debris that dogs might ingest.</li>\n<li><strong>Weather &amp; Ground Conditions:</strong> After periods of heavy or constant rain, the field, grass, and equipment may be wet, slippery, and muddy in places. Please take appropriate care and wear suitable footwear.</li>\n<li><strong>Hours of Darkness:</strong> If your appointment is during hours of darkness, please bring a torch and a light up collar or harness for your dog(s) as the park does not feature any lighting to comply with planning regulations. Please be extra vigilant when supervising your dog(s) to ensure proper use of the facility.</li>\n<li><strong>Force Majeure:</strong> We reserve the right to temporarily suspend bookings or reschedule sessions during extreme or unsafe weather conditions for the safety of our customers and dogs.</li>\n</ul>\n            <h3>6. Booking Capacities, Timings, Cancellations &amp; Trial Period</h3>\n            <ul>\n<li><strong>Booking Numbers:</strong> Please only bring the maximum number of dogs and cars that you have paid and booked for.</li>\n<li><strong>Strict Time Slots:</strong> Your booking is for a strict time slot. Please ensure you leave the field promptly at the end of your session so the next user can enter without delay.</li>\n<li><strong>Gate Security on Departure:</strong> Please ensure the vehicle gate is fully closed and securely padlocked every time you leave the premises.</li>\n<li><strong>Cancellations &amp; Refunds:</strong> Changes and cancellations can be made via our booking system up to 24 hours before your allocated arrival time for a refund or to reschedule your slot. Unfortunately, no refunds can be given for cancellations made within 24 hours of your appointment or for no-shows.</li>\n<li><strong>Your statutory cancellation rights:</strong> Because each booking is for a specific date and time, the 14-day cancellation period under the Consumer Contracts Regulations 2013 does not apply to sessions. Our 24-hour cancellation policy above applies instead. This does not affect your other legal rights.</li>\n<li><strong>Block bookings &amp; gift certificates:</strong> You can cancel a block booking or gift certificate within 14 days of purchase for a full refund, as long as no sessions have been booked or used. To cancel, email us at pawparadiselovedean@gmail.com and we will refund you within 14 days. After 14 days, block bookings and gift certificates are non-refundable.</li>\n<li><strong>Commercial Use:</strong> Professional dog walkers or trainers using the facility must hold their own valid commercial insurance covering them for the number and type of dogs they walk.</li>\n<li><strong>High-Capacity Trial:</strong> Bookings allowing up to 8 dogs are currently being offered on a <strong>trial basis</strong>. Please note that if this trial results in excessive wear and tear, unmanaged dog waste, or damage to the facility, we reserve the right to reduce the maximum number of dogs permitted per booking, per handler or withdraw access entirely to individuals not complying with these terms and conditions.</li>\n</ul>\n<p>Questions? Email <a href=\"mailto:pawparadiselovedean@gmail.com\">pawparadiselovedean@gmail.com</a>.</p>".split('{ROOT}').join(ROOT) }
  };


  // ── Styles ───────────────────────────────────
  const s = document.createElement('style');
  s.textContent = `
    #pp-box {
      position:relative; z-index:1;
      background:#F7F2E9; border-radius:16px;
      max-width:640px; width:100%; max-height:86vh;
      display:flex; flex-direction:column;
      box-shadow:0 24px 80px rgba(0,0,0,0.45);
      overflow:hidden;
      animation: ppIn .25s cubic-bezier(.22,1,.36,1);
    }
    @keyframes ppIn { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:none} }
    #pp-head {
      display:flex; align-items:center; justify-content:space-between;
      padding:22px 28px 18px; border-bottom:1px solid #D4C4A8; flex-shrink:0;
    }
    #pp-title {
      font-family:'Cormorant Garamond',Georgia,serif;
      font-style:italic; font-size:1.4rem; color:#1C3D28; margin:0;
    }
    #pp-x {
      background:none; border:none; font-size:2rem; cursor:pointer;
      color:#9C8472; line-height:1; padding:0 6px; border-radius:6px;
      transition:color .15s,background .15s;
    }
    #pp-x:hover { color:#1C3D28; background:#EBF0E8; }
    #pp-body {
      padding:22px 28px; overflow-y:auto; flex:1;
      font-family:'Jost',system-ui,sans-serif; font-size:.92rem; line-height:1.75;
    }
    #pp-body h3 {
      font-family:'Cormorant Garamond',Georgia,serif;
      font-style:italic; font-size:1.05rem; color:#1C3D28; margin:18px 0 8px;
    }
    #pp-body p  { color:#5C4A38; margin-bottom:8px; font-weight:300; }
    #pp-body ul { padding-left:1.4em; margin-bottom:10px; }
    #pp-body li { color:#5C4A38; font-weight:300; margin-bottom:6px; }
    #pp-body ul ul { margin:6px 0 4px; }
    #pp-body .pp-updated { font-size:0.78rem; color:#7A6656; font-style:italic; }
    #pp-body a  { color:#1C3D28; text-decoration:underline; }
    #pp-foot {
      padding:14px 28px 20px; border-top:1px solid #D4C4A8; flex-shrink:0;
      display:flex; align-items:center; justify-content:space-between; gap:16px;
    }
        #pp-close-btn {
      background:#1C3D28; color:#F7F2E9; border:none;
      padding:10px 26px; border-radius:8px; cursor:pointer;
      font-family:'Jost',system-ui,sans-serif; font-size:.85rem;
      font-weight:600; letter-spacing:.05em; text-transform:uppercase;
      transition:background .2s;
    }
    #pp-close-btn:hover { background:#B87333; }
    @media(max-width:480px) {
      #pp-box { border-radius:16px 16px 0 0; max-height:90vh; }
      #pp-modal { align-items:flex-end; padding:0; }
    }
  `;
  document.head.appendChild(s);

  // ── Open / close ─────────────────────────────
  var lastFocus = null;

  function open(which) {
    var doc = DOCS[which] || DOCS.privacy;
    document.getElementById('pp-title').innerHTML = doc.title;
    document.getElementById('pp-body').innerHTML = doc.html;
    document.getElementById('pp-body').scrollTop = 0;
    lastFocus = document.activeElement;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('pp-x').focus();
  }

  function close() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.getElementById('pp-backdrop').addEventListener('click', close);
  document.getElementById('pp-x').addEventListener('click', close);
  document.getElementById('pp-close-btn').addEventListener('click', close);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display !== 'none') close();
  });

  // ── Intercept links to privacy.html and terms.html ──
  // (links with target="_blank" still open the full page)
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (!link || link.target === '_blank') return;
    var href = (link.getAttribute('href') || '').split('#')[0];
    var m = href.match(/(?:^|\/)(privacy|terms)\.html$/);
    if (!m) return;
    e.preventDefault();
    open(m[1]);
  });

})();
