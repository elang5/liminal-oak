// Content is visible without JavaScript. The menu also works natively.
const menu = document.querySelector('.mobile-nav');
const summary = menu?.querySelector('summary');
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.open = false;
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.open) {
    menu.open = false;
    summary?.focus();
  }
});
document.addEventListener('click', event => {
  if (menu?.open && !menu.contains(event.target)) menu.open = false;
});
const desktop = window.matchMedia('(min-width: 800px)');
desktop.addEventListener('change', event => { if (event.matches && menu) menu.open = false; });

// Bring the growing tree into view without moving focus away from its toggle.
const littleOak = document.querySelector('.little-oak');
littleOak?.addEventListener('toggle', () => {
  if (!littleOak.open) return;
  const tree = littleOak.querySelector('.little-oak-reveal');
  if (!tree) return;
  const bounds = tree.getBoundingClientRect();
  if (bounds.bottom > window.innerHeight || bounds.top < 0) {
    tree.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'nearest',
    });
  }
});
