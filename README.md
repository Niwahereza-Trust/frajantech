# Frajan Tech Unlimited — React starter

A from-scratch React + Vite rebuild of the Frajan Tech Unlimited landing page
(internet subscriptions & renewals for Android users in Uganda).

## Stack
- React 18 + Vite (plain CSS, no framework — easy to swap for Tailwind later)
- Design tokens live in `src/index.css` (`:root` variables)
- One component per section, plus a shared `SignalBars` signature element

## Getting started
```bash
npm install
npm run dev
```
Then open the printed local URL (usually http://localhost:5173).

To build for production:
```bash
npm run build
npm run preview
```

## Structure
```
src/
  components/
    Navbar.jsx        sticky header + mobile menu
    Announcements.jsx  CEO announcement carousel
    Hero.jsx           headline, CTAs, live-status mock panel
    CheckStatus.jsx     client ID / Airtel number lookup form
    Packages.jsx        pricing cards (first-time + 2 renewal tiers)
    WhyChoose.jsx        3-up value props
    HowItWorks.jsx       4-step process
    Referral.jsx         reviews slot + collapsible refer-a-friend
    FAQ.jsx              accordion
    Support.jsx          WhatsApp / call CTAs
    Footer.jsx
  App.jsx
  index.css            design tokens + base styles
```

## Next steps to wire up
- `CheckStatus.jsx` — replace the placeholder `handleSubmit` with a real API
  call to your status-check endpoint (respect the 5-checks/24h and CAPTCHA
  rules from the original site).
- `Referral.jsx` — connect the reviews slot to wherever client reviews live.
- Swap the `href="#"` renewal buttons in `Packages.jsx` for your real renewal
  flow/links.
- Update the WhatsApp number and phone number in `Referral.jsx` and
  `Support.jsx` if they change.
