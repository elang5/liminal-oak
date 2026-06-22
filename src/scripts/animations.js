// 1. Scroll-triggered fade-in via IntersectionObserver
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => observer.observe(el));

// 2. Header scroll state
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header.dataset.scrolled = window.scrollY > 50;
}, { passive: true });

// 3. Active nav link highlight
const navLinks = document.querySelectorAll('[data-nav-link]');
const sections = ['home', 'about', 'services', 'contact'].map(id => document.getElementById(id)).filter(Boolean);

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  let active = '';
  sections.forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      active = section.id;
    }
  });
  navLinks.forEach(link => {
    const isActive = link.dataset.navLink === active;
    link.style.color = isActive ? '#2D5A3D' : '#4A3728';
    link.style.opacity = isActive ? '1' : '0.8';
    link.style.borderBottom = isActive ? '1px solid #2D5A3D' : '1px solid transparent';
  });
}, { passive: true });

// 4. Mobile nav
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('menu-close');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && closeBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
  closeBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  }));
}

