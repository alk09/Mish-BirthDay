import { reducedMotion } from "./animation.js";

function canTilt() {
  return !reducedMotion && (window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false);
}

export function attachTilt(element, { max = 5 } = {}) {
  if (!element || !canTilt()) return () => {};

  let frame = null;
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
      element.style.setProperty("--glare-x", "50%");
      element.style.setProperty("--glare-y", "20%");
      frame = null;
    });
  };

  const move = (event) => {
    const rect = element.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const rotateY = (px - 0.5) * max;
    const rotateX = (0.5 - py) * max;

    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      element.style.setProperty("--tilt-x", `${rotateY.toFixed(2)}deg`);
      element.style.setProperty("--tilt-y", `${rotateX.toFixed(2)}deg`);
      element.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      element.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
      frame = null;
    });
  };

  element.addEventListener("pointermove", move, { passive: true });
  element.addEventListener("pointerleave", reset, { passive: true });
  element.addEventListener("pointercancel", reset, { passive: true });
  return () => {
    if (frame) cancelAnimationFrame(frame);
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerleave", reset);
    element.removeEventListener("pointercancel", reset);
    reset();
  };
}

export function attachTiltAll(selector, root = document) {
  return [...root.querySelectorAll(selector)].map((element) => attachTilt(element));
}
