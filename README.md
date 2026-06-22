# Liminal Oak Therapy

Personal website for Elan Green, MSW, LSWAIC — a private practice therapist based in Seattle, WA. The site serves as the public-facing presence for Liminal Oak Therapy (legal entity: Elan Green PLLC), covering services, approach, credentials, and client contact.

Live site: [liminaloaktherapy.com](https://liminaloaktherapy.com)

---

## Stack

- **[Astro](https://astro.build)** — static site generator, outputs pure HTML/CSS/JS with no client-side framework overhead
- **Vanilla JS** — scroll animations (IntersectionObserver), mobile nav, active nav highlighting
- **CSS** — all styling via inline styles and a single `global.css`; no CSS framework
- **[Netlify](https://netlify.com)** — hosting, deployment, and contact form handling (Netlify Forms)
- **[Mailchimp](https://mailchimp.com)** — DNS hosting

---

## Infrastructure

### Deployment
Netlify watches the `main` branch. Every push triggers a build (`npm run build`) and deploys the `dist/` directory automatically. No manual deploy steps needed.

### Contact Form
The contact form uses **Netlify Forms** — no backend required. Netlify detects the `data-netlify="true"` attribute in the static HTML at build time and handles submissions. On submit, the visitor is redirected to `/thank-you`.

To configure email notifications for form submissions:
1. Go to Netlify dashboard → Site configuration → Notifications → Form submission notifications
2. Add an email notification for the `contact` form

### DNS
DNS is managed through **Mailchimp**. The domain `liminaloaktherapy.com` points to Netlify via Mailchimp's DNS settings.

### Booking
The "Book Online" button in the Contact section links to SimplePractice. Update the `href` on the `#schedule-link` anchor in `src/components/sections/Contact.astro` when the link is available.

---

## Local Development

Requires Node.js 22+. If using nvm:

```bash
nvm use 22
```

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
# Site available at http://localhost:4321
```

Build for production:

```bash
npm run build
# Output in dist/
```

Preview the production build locally:

```bash
npm run preview
```

---

## Project Structure

```
liminal-oak/
├── public/
│   ├── images/about/headshot.jpg
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── config/
│   │   └── site.ts           # Site name, email, credentials, URL
│   ├── layouts/
│   │   └── BaseLayout.astro  # <html>, <head>, metadata, fonts
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── sections/
│   │       ├── Hero.astro
│   │       ├── Approach.astro
│   │       ├── About.astro
│   │       ├── Services.astro
│   │       └── Contact.astro
│   ├── pages/
│   │   ├── index.astro       # Home page
│   │   └── thank-you.astro   # Post-form-submission page
│   ├── scripts/
│   │   └── animations.js     # IntersectionObserver, mobile nav, header scroll
│   └── styles/
│       └── global.css        # Reset, fonts, animation classes, header/nav styles
├── netlify.toml              # Build config for Netlify
└── astro.config.ts           # Astro config (static output, site URL)
```

---

## Content Updates

Most content lives directly in the component files under `src/components/sections/`. Site-wide values (name, email, credentials, URL) are in `src/config/site.ts`.

To update the headshot, replace `public/images/about/headshot.jpg`.
