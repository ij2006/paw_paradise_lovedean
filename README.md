# Paw Paradise Lovedean

The website for [Paw Paradise Lovedean](https://pawparadiselovedean.co.uk), a secure, private dog field in the South Downs National Park, Hampshire. It's a family-run business, and I designed and built the site from scratch.

## What it does

- **Booking hand-off**: session cards link out to Acuity Scheduling for booking and payment. A short pop-up warns that booking opens in a new tab, and the browser's Back button still returns to the booking page.
- **Reviews with moderation**: visitors can leave a review (including half-star ratings and an anonymous option) without an account. Reviews stay hidden until a staff member approves them.
- **Suggestions box**: visitors can send ideas with optional contact details, read only by staff.
- **Staff area**: a single staff login (hidden from the main navigation) for approving or hiding reviews, reading suggestions and writing blog posts. A staff bar with a log-out button appears on every page while signed in.
- **Gallery** with a keyboard-accessible lightbox for photos and videos.
- **Accessibility panel**: text size, dyslexia-friendly font, high contrast and reduced motion, remembered across pages. Dark mode too.
- **Privacy and terms pop-ups** so visitors don't lose their place.

## How it's built

- Plain **HTML, CSS and JavaScript**, with no framework or build step.
- **Supabase** (Postgres) for reviews, suggestions, blog posts and staff sign-in. Data access is controlled by **row-level security** policies, so the public key in the code can only do what the policies allow: anyone can submit a review, only approved reviews are readable, and only the staff account can moderate.
- **Acuity Scheduling** for bookings and payments.
- Hosted on **Cloudflare Pages**, deployed automatically from this repository.

## Accessibility and testing

- Tested with axe-core against WCAG 2.2 AA in light, dark and high-contrast modes, with zero violations.
- Automated browser tests (Playwright) for keyboard navigation, the pop-ups, the gallery, the review and suggestion forms, and the staff flows.
- Responsive layout checked at phone, tablet and desktop widths with no sideways scrolling.

## Running it locally

No install needed. From this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Structure

```
index.html        Home page
pages/            Booking, information/FAQs, gallery, reviews, about, blog, suggestions, contact, privacy, terms, staff login
css/              One shared stylesheet plus one per page
js/               Small single-purpose scripts (theme, accessibility, reviews, admin, lightbox, booking hand-off...)
images/           Photos, gallery videos and posters, logo and icons
```
