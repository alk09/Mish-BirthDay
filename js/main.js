import { birthdayConfig } from "./config/birthdayConfig.js";
import { gifts } from "./data/gifts.js";
import { cards } from "./data/cards.js";
import { celebrations } from "./data/celebrations.js";
import { $, $$ } from "./utils/dom.js";
import { loadState, saveState, clearState } from "./services/storage.js";
import { setupNavigation } from "./components/navigation.js";
import { setupGifts } from "./components/gifts.js";
import { setupCards } from "./components/cards.js";
import { setupCelebration } from "./components/celebration.js";
import { setupMusic } from "./components/music.js";
import { initRipple } from "./utils/ripple.js";
import { attachTilt } from "./utils/tilt.js";
import { reducedMotion } from "./utils/animation.js";

function createDefaultState() {
  return {
    currentStep: 0,
    openedGifts: [],
    viewedCards: [],
    lastCelebration: null,
    celebrationCount: 0,
    musicEnabled: false,
  };
}

const state = loadState(createDefaultState());
state.currentStep = Number.isInteger(state.currentStep) ? state.currentStep : 0;
state.openedGifts = Array.isArray(state.openedGifts) ? state.openedGifts : [];
state.viewedCards = Array.isArray(state.viewedCards) ? state.viewedCards : [];
state.celebrationCount = Number.isFinite(state.celebrationCount) ? Math.max(0, state.celebrationCount) : 0;
state.lastCelebration = typeof state.lastCelebration === "string" ? state.lastCelebration : null;
state.musicEnabled = state.musicEnabled === true;

function applyTheme(config) {
  const root = document.documentElement;
  if (!config?.theme) return;
  if (config.theme.primary) root.style.setProperty("--color-primary", config.theme.primary);
  if (config.theme.secondary) root.style.setProperty("--color-secondary", config.theme.secondary);
  if (config.theme.accent) root.style.setProperty("--color-accent", config.theme.accent);
}

function bindConfig(config) {
  $$('[data-bind]').forEach((element) => {
    const key = element.dataset.bind;
    const value = config[key];
    if (typeof value === "string") element.textContent = value;
  });

  $$('[data-bind-html]').forEach((element) => {
    const key = element.dataset.bindHtml;
    const value = config[key];
    if (typeof value === "string") element.innerHTML = value;
    $$("p", element).forEach((paragraph, index) => paragraph.style.setProperty("--i", index));
  });

  document.title = `${config.title || "Happy Birthday"} — ${config.name || "You"}`;
}

function setupDialog() {
  const dialog = $("#detailDialog");
  const close = $("#dialogClose");
  const next = $("#dialogNext");
  const title = $("#dialogTitle");
  const eyebrow = $("#dialogEyebrow");
  const description = $("#dialogDescription");
  const media = $("#dialogMedia");
  const link = $("#dialogLink");
  let lastFocused = null;

  const closeDialog = () => {
    if (dialog?.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
    document.body.classList.remove("is-dialog-open");
    lastFocused?.focus?.({ preventScroll: true });
  };

  const openDetail = ({ title: dialogTitle, eyebrow: dialogEyebrow, description: dialogDescription, emoji = "✨", image = "", link: dialogLink = "" }) => {
    lastFocused = document.activeElement;
    eyebrow.textContent = dialogEyebrow || "A little surprise";
    title.textContent = dialogTitle || "Surprise";
    description.textContent = dialogDescription || "";
    media.innerHTML = `<span class="dialog-emoji" aria-hidden="true">${emoji}</span>`;

    if (image) {
      const img = new Image();
      img.alt = "Birthday surprise illustration";
      img.src = image;
      img.addEventListener("load", () => {
        media.replaceChildren(img);
      }, { once: true });
    }

    if (dialogLink) {
      link.href = dialogLink;
      link.hidden = false;
    } else {
      link.hidden = true;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("is-dialog-open");
  };

  close?.addEventListener("click", closeDialog);
  next?.addEventListener("click", closeDialog);
  dialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  return { openDetail };
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
  document.addEventListener("pointerenter", () => document.body.classList.add("has-cursor-glow"));
  document.addEventListener("pointerleave", () => document.body.classList.remove("has-cursor-glow"));
  document.body.classList.add("has-cursor-glow");
}

function setupRestart({ navigation }) {
  $("#restartButton")?.addEventListener("click", () => {
    const keepPrefs = { musicEnabled: state.musicEnabled };
    clearState();
    Object.assign(state, createDefaultState(), keepPrefs);
    navigation.setStep(0, { force: true });
    window.scrollTo(0, 0);
  });
}

function init() {
  applyTheme(birthdayConfig);
  bindConfig(birthdayConfig);
  setupLiquidCursor();
  attachTilt($(".memory-card"));
  attachTilt($(".celebrate-panel"));

  const screens = $$(".screen");
  const chrome = $$('[data-chrome]');
  const navigation = setupNavigation({
    screens,
    state,
    onStepChanged(step) {
      chrome.forEach((element) => { element.hidden = step === 0; });
      saveState(state);
    }
  });

  setupRestart({ navigation });
  const birthdayMusic = $("#birthdayMusic");
  const musicButton = $("#musicToggle");
  const musicReady = Boolean(birthdayConfig.music?.enabled && birthdayConfig.music?.src);
  if (musicReady) {
    birthdayMusic.src = birthdayConfig.music.src;
    setupMusic({ audio: birthdayMusic, button: musicButton, state });
  } else if (musicButton) {
    musicButton.hidden = true;
  }

  const dialog = setupDialog();
  setupGifts({ gifts, state, openDetail: dialog.openDetail });
  setupCards({ cards, state, openDetail: dialog.openDetail });
  setupCelebration({ messages: celebrations, state });
  initRipple();

  const restoredStep = Number.isInteger(state.currentStep) ? state.currentStep : 0;
  if (restoredStep > 0) navigation.setStep(restoredStep, { skipScroll: true, force: true });
  else chrome.forEach((element) => { element.hidden = true; });

  window.addEventListener("pageshow", () => saveState(state), { once: true });
}

document.addEventListener("DOMContentLoaded", init, { once: true });