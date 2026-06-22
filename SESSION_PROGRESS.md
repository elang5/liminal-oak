# Session Progress

## Status: Live at liminaloaktherapy.com

---

## Completed This Session

### Migration
- Migrated from Next.js to Astro — pure static output, zero framework overhead
- Removed React, Framer Motion, Tailwind, Next.js adapter entirely
- New repo: github.com/elang5/liminal-oak

### Site
- Full copy rewrite: new bio, approach pillars (root-to-sky arc), credential corrections (LSWAIC)
- Rebranded to Liminal Oak Therapy (footer retains Elan Green PLLC — no DBA yet)
- Rate updated to $150
- Contact form working via Netlify Forms — submissions confirmed live
- CSS parallax hero (smooth, no JS)
- Scroll animations via IntersectionObserver
- Thank-you page on form submission
- Updated headshot

### Infrastructure
- Netlify deployment connected to main branch (auto-deploys on push)
- DNS live on liminaloaktherapy.com via Mailchimp
- Netlify Forms email notification configured

---

## Remaining

- [ ] Add SimplePractice booking URL to `src/components/sections/Contact.astro` (`#schedule-link` anchor)
- [ ] Minor copy touch-ups (Elan to review)
- [ ] Get DBA for Liminal Oak Therapy → update footer copyright

---

## Key Files

| What | Where |
|---|---|
| Site config (name, email, credentials) | `src/config/site.ts` |
| Copy / sections | `src/components/sections/` |
| Headshot | `public/images/about/headshot.jpg` |
| Animations | `src/scripts/animations.js` |
| Styles | `src/styles/global.css` |
