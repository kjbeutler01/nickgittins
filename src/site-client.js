// Native links and server-rendered HTML keep the portfolio usable without JavaScript.
// Keyboard navigation should never wait for an entrance animation.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('[data-reveal]')];
let revealObserver;

function showAllContent() {
  revealObserver?.disconnect();
  revealElements.forEach(element => element.classList.remove('reveal-pending'));
}

// Only queue content below the viewport. Deep links and restored scroll positions
// remain immediately readable, and each section appears at most once per visit.
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('reveal-pending');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  revealElements.forEach(element => {
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add('reveal-pending');
    revealObserver.observe(element);
  });
}

motionPreference.addEventListener('change', showAllContent);
window.addEventListener('beforeprint', showAllContent);
document.addEventListener('keydown', (event) => {
  if (!['Tab', 'Enter', ' '].includes(event.key)) return;
  document.documentElement.dataset.input = 'keyboard';
  document.querySelectorAll('.enter').forEach(element => {
    element.style.animation = 'none';
  });
  showAllContent();
});
document.addEventListener('focusin', event => {
  event.target.closest('[data-reveal]')?.classList.remove('reveal-pending');
});
document.addEventListener('pointerdown', () => {
  delete document.documentElement.dataset.input;
});
