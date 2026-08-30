export const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function animateMessage(element) {
  if (!element || reducedMotion) return;
  element.classList.remove("message-pop");
  void element.offsetWidth;
  element.classList.add("message-pop");
}
