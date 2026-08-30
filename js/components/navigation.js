import { $, $$ } from "../utils/dom.js";
import { reducedMotion } from "../utils/animation.js";

const labels = ["Start", "Welcome", "Gifts", "Cards", "Celebrate", "Final"];

export function setupNavigation({ screens, state, onStepChanged }) {
  const progressList = $("#progressList");
  if (!progressList) return { setStep: () => {} };
  let navigating = false;

  progressList.innerHTML = `${labels.map((label, index) => `
    <li><button type="button" data-go-step="${index}" aria-label="Go to ${label}" ${index === 0 ? 'aria-current="step"' : ""}>${index + 1}</button></li>
  `).join("")}<span class="progress-liquid" aria-hidden="true"></span>`;

  const progressLiquid = $(".progress-liquid", progressList);

  const setStep = (nextStep, options = {}) => {
    const step = Math.max(0, Math.min(screens.length - 1, Number(nextStep)));
    if (step === state.currentStep && !options.force) return;
    const current = screens[state.currentStep];
    const next = screens[step];
    if (!current || !next) return;

    navigating = true;
    current.hidden = true;
    current.classList.remove("is-active");
    next.hidden = false;
    next.classList.add("is-active");
    state.currentStep = step;

    $$("[data-go-step]", progressList).forEach((button) => {
      if (Number(button.dataset.goStep) === step) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    if (progressLiquid) {
      const currentButton = $(`[data-go-step="${step}"]`, progressList);
      if (currentButton) {
        const listRect = progressList.getBoundingClientRect();
        const buttonRect = currentButton.getBoundingClientRect();
        const left = buttonRect.left - listRect.left;
        progressLiquid.style.width = `${buttonRect.width}px`;
        progressLiquid.style.transform = `translateX(${left}px)`;
      }
    }

    onStepChanged?.(step);
    const experience = $("#experience");
    experience?.focus({ preventScroll: true });
    if (!reducedMotion && !options.skipScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
    requestAnimationFrame(() => { navigating = false; });
  };

  progressList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-go-step]");
    if (!button || navigating) return;
    setStep(button.dataset.goStep);
  });

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const name = action.dataset.action;
    if (name === "next" && state.currentStep < screens.length - 1) setStep(state.currentStep + 1);
    if (name === "start") setStep(1);
    if (name === "restart") setStep(0, { force: true });
  });

  return { setStep };
}
