const slides = Array.from(document.querySelectorAll('.slide'));
const prevButton = document.querySelector('[data-prev]');
const nextButton = document.querySelector('[data-next]');
const dots = document.querySelector('.dots');
let current = 0;

function buildDots() {
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goTo(index));
    dots.appendChild(dot);
  });
}

function goTo(index) {
  if (index < 0 || index >= slides.length || index === current) return;
  const old = current;
  current = index;
  slides[old].classList.remove('active');
  slides[old].classList.toggle('prev', index < old);
  slides[current].classList.add('active');
  slides[current].classList.remove('prev');
  updateControls();
}

function updateControls() {
  prevButton.disabled = current === 0;
  nextButton.disabled = current === slides.length - 1;
  Array.from(dots.children).forEach((dot, index) => {
    dot.classList.toggle('active', index === current);
  });
  const hash = `slide-${current + 1}`;
  if (location.hash.replace('#', '') !== hash) {
    history.replaceState(null, '', `#${hash}`);
  }
}

function fromHash() {
  const match = location.hash.match(/slide-(\d+)/);
  if (!match) return 0;
  const index = Number(match[1]) - 1;
  return Number.isFinite(index) ? Math.min(Math.max(index, 0), slides.length - 1) : 0;
}

prevButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault();
    goTo(current + 1);
  }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    goTo(current - 1);
  }
  if (event.key === 'Home') goTo(0);
  if (event.key === 'End') goTo(slides.length - 1);
});

let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

document.addEventListener('touchend', (event) => {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    goTo(dx < 0 ? current + 1 : current - 1);
  }
}, { passive: true });

buildDots();
current = fromHash();
slides.forEach((slide, index) => slide.classList.toggle('active', index === current));
updateControls();
