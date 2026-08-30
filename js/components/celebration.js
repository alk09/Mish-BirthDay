import { $, $$ } from "../utils/dom.js";
import { animateMessage, reducedMotion } from "../utils/animation.js";
import { randomFrom } from "../services/random.js";
import { saveState } from "../services/storage.js";

const palette = ["#ff7b9c", "#a77cff", "#ffd27d", "#fff3f8", "#88d3ff"];

export function getRandomCelebration(messages, previous = null) {
  return randomFrom(messages, previous);
}

function launchConfetti(layer, count = 34) {
  if (!layer || reducedMotion) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--piece-color", palette[i % palette.length]);
    piece.style.setProperty("--duration", `${1.1 + Math.random() * 1.1}s`);
    piece.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    piece.style.setProperty("--spin", `${180 + Math.random() * 540}deg`);
    piece.style.animationDelay = `${Math.random() * .18}s`;
    fragment.appendChild(piece);
  }
  layer.replaceChildren(fragment);
  window.setTimeout(() => layer.replaceChildren(), 2500);
}

export function setupCelebration({ messages, state }) {
  const button = $("#celebrateButton");
  const message = $("#celebrationMessage");
  const count = $("#celebrateCount");
  const layer = $("#confettiLayer");

  if (!button || !message || !count) return;

  const valid = Array.isArray(messages) ? messages.filter((item) => typeof item === "string" && item.trim()) : [];
  if (!valid.length) {
    button.disabled = true;
    message.textContent = "Your celebration messages are taking the day off. Add some in js/data/celebrations.js.";
    return;
  }

  const renderCount = () => {
    count.textContent = `${state.celebrationCount || 0} ${state.celebrationCount === 1 ? "celebration" : "celebrations"}`;
  };

  button.addEventListener("click", () => {
    const next = getRandomCelebration(valid, state.lastCelebration) || valid[0];
    state.lastCelebration = next;
    state.celebrationCount = (state.celebrationCount || 0) + 1;
    saveState(state);
    message.textContent = next;
    animateMessage(message);
    launchConfetti(layer, window.innerWidth < 560 ? 26 : 42);
    renderCount();
  });

  renderCount();
}
