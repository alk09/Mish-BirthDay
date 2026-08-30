import { birthdayConfig } from "./config/birthdayConfig.js";
import { $, $$ } from "./utils/dom.js";
import { loadState, saveState } from "./services/storage.js";
import { setupMusic } from "./components/music.js";
import { initRipple } from "./utils/ripple.js";
import { reducedMotion } from "./utils/animation.js";

const defaults = {
  openedGifts: [],
  viewedCards: [],
  lastCelebration: null,
  celebrationCount: 0,
  musicEnabled: false,
};

export const state = loadState(defaults);
state.openedGifts = Array.isArray(state.openedGifts) ? state.openedGifts : [];
state.viewedCards = Array.isArray(state.viewedCards) ? state.viewedCards : [];
state.celebrationCount = Number.isFinite(state.celebrationCount) ? Math.max(0, state.celebrationCount) : 0;
state.lastCelebration = typeof state.lastCelebration === "string" ? state.lastCelebration : null;
state.musicEnabled = state.musicEnabled === true;

function applyTheme(config) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(config.theme || {})) {
    if (typeof value === "string") root.style.setProperty(`--color-${key}`, value);
  }
}

function bindConfig(config) {
  $$('[data-bind]').forEach((element) => {
    const value = config[element.dataset.bind];
    if (typeof value === "string") element.textContent = value;
  });
  $$('[data-bind-html]').forEach((element) => {
    const value = config[element.dataset.bindHtml];
    if (typeof value === "string") element.innerHTML = value;
  });
  document.title = `${config.title || "Happy Birthday"} — ${config.name || "You"}`;
}

function setupLiquidCursor() {
  const canHover = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
  if (!canHover || reducedMotion) return;
  let raf = null;
  document.addEventListener("pointermove", (event) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
      raf = null;
    });
  });
  document.body.classList.add("has-cursor-glow");
}

function setupDialog() {
  const dialog = $("#detailDialog");
  if (!dialog) return { openDetail: () => {} };
  const close = $("#dialogClose");
  const next = $("#dialogNext");
  const title = $("#dialogTitle");
  const eyebrow = $("#dialogEyebrow");
  const description = $("#dialogDescription");
  const media = $("#dialogMedia");
  const link = $("#dialogLink");
  let lastFocused = null;

  const closeDialog = () => {
    if (dialog.open) dialog.close();
    document.body.classList.remove("is-dialog-open");
    lastFocused?.focus?.({ preventScroll: true });
  };

  const openDetail = ({ title: nextTitle, eyebrow: nextEyebrow, description: nextDescription, emoji = "✨", image = "", link: nextLink = "" }) => {
    lastFocused = document.activeElement;
    eyebrow.textContent = nextEyebrow || "A little surprise";
    title.textContent = nextTitle || "Surprise";
    description.textContent = nextDescription || "";
    media.innerHTML = `<span class="dialog-emoji" aria-hidden="true">${emoji}</span>`;
    if (image) {
      const img = new Image();
      img.alt = "Birthday surprise illustration";
      img.src = image;
      img.addEventListener("load", () => media.replaceChildren(img), { once: true });
    }
    if (nextLink) {
      link.href = nextLink;
      link.hidden = false;
    } else {
      link.hidden = true;
    }
    dialog.showModal();
    document.body.classList.add("is-dialog-open");
  };

  close?.addEventListener("click", closeDialog);
  next?.addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  return { openDetail };
}

function setupSharedUI() {
  const audio = $("#birthdayMusic");
  const musicButton = $("#musicToggle");
  if (audio && musicButton) {
    if (birthdayConfig.music?.enabled && birthdayConfig.music?.src) {
      audio.src = birthdayConfig.music.src;
      setupMusic({ audio, button: musicButton, state });
    } else {
      musicButton.hidden = true;
    }
  }

  const restart = $("#restartButton");
  restart?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http")) return;
    saveState(state);
  });

  initRipple();
}

function setupPageTransitions() {
  document.querySelectorAll(".page-enter").forEach((element) => {
    requestAnimationFrame(() => element.classList.add("is-ready"));
  });
}

export function initPage() {
  applyTheme(birthdayConfig);
  bindConfig(birthdayConfig);
  setupLiquidCursor();
  setupSharedUI();
  setupPageTransitions();
}

export { setupDialog };

document.addEventListener("DOMContentLoaded", initPage, { once: true });
