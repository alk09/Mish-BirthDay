/**
 * Add a lightweight touch/mouse ripple to buttons and other small controls.
 *
 * Important: cards are intentionally NOT included here. A ripple is positioned
 * inside the control that was pressed; applying it to large card containers can
 * make the dynamically-created ripple affect the card's layout.
 */
export function initRipple() {
  const reduceMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  if (reduceMotion) return;

  const selectors = [
    '.primary-button',
    '.secondary-button',
    '.ghost-button',
    '.celebrate-button',
    '.icon-button'
  ].join(',');

  document.querySelectorAll(selectors).forEach((element) => {
    if (element.dataset.rippleReady === 'true') return;
    element.dataset.rippleReady = 'true';

    const createRipple = (x, y) => {
      const rect = element.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 1.35;
      const ripple = document.createElement('span');

      ripple.className = 'ripple';
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${x - diameter / 2}px`;
      ripple.style.top = `${y - diameter / 2}px`;

      element.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), {
        once: true
      });
    };

    element.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      const rect = element.getBoundingClientRect();
      createRipple(event.clientX - rect.left, event.clientY - rect.top);
    });

    element.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      const rect = element.getBoundingClientRect();
      createRipple(rect.width / 2, rect.height / 2);
    });
  });
}
