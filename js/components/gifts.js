import { $ } from "../utils/dom.js";
import { saveState } from "../services/storage.js";
import { attachTiltAll } from "../utils/tilt.js";

function isValidGift(gift) {
  return (
    gift &&
    gift.enabled !== false &&
    typeof gift.id === "string" &&
    typeof gift.title === "string" &&
    typeof gift.message === "string"
  );
}

export function setupGifts({ gifts = [], state, openDetail }) {
  const grid = $("#giftGrid");
  if (!grid) return;

  const valid = (Array.isArray(gifts) ? gifts : [])
    .filter(isValidGift)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  if (!valid.length) {
    grid.innerHTML = `<div class="empty-state">The gift shelf is taking a tiny nap. Try the next surprise.</div>`;
    return;
  }

  grid.innerHTML = valid
    .map(
      (gift, index) => `
        <article class="gift-card">
          <div class="gift-visual" aria-hidden="true"><span class="gift-emoji">${gift.emoji || "🎁"}</span></div>
          <h3>${gift.title}</h3>
          <p>${gift.description || "A little surprise for you."}</p>
          <div class="gift-footer">
            <span class="gift-order">GIFT ${String(index + 1).padStart(2, "0")}</span>
            <button class="secondary-button gift-open" type="button" data-gift-id="${gift.id}">
              <span class="button-label">${state.openedGifts.includes(gift.id) ? "Open again" : "Open gift"}</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gift-id]");
    if (!button || !grid.contains(button)) return;

    const gift = valid.find((item) => item.id === button.dataset.giftId);
    if (!gift) return;

    if (!state.openedGifts.includes(gift.id)) state.openedGifts.push(gift.id);
    saveState(state);

    const label = button.querySelector(".button-label");
    if (label) label.textContent = "Open again";

    openDetail?.({
      eyebrow: gift.title,
      title: "A little gift for you",
      description: gift.message,
      emoji: gift.emoji,
      image: gift.image,
      link: gift.link,
    });
  });

  attachTiltAll(".gift-card", grid);
}
