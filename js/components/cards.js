import { $ } from "../utils/dom.js";
import { saveState } from "../services/storage.js";
import { attachTiltAll } from "../utils/tilt.js";

function isValidCard(card) {
  return (
    card &&
    card.enabled !== false &&
    typeof card.id === "string" &&
    typeof card.title === "string" &&
    typeof card.message === "string"
  );
}

export function setupCards({ cards = [], state, openDetail }) {
  const grid = $("#cardGrid");
  if (!grid) return;

  const valid = (Array.isArray(cards) ? cards : [])
    .filter(isValidCard)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  if (!valid.length) {
    grid.innerHTML = `<div class="empty-state">No cards are available right now — and that’s okay.</div>`;
    return;
  }

  grid.innerHTML = valid
    .map(
      (card) => `
        <article class="birthday-card birthday-card--${["soft", "chaos", "real"].includes(card.style) ? card.style : "real"}">
          <div class="card-top" aria-hidden="true"><div class="card-icon">${card.emoji || "💌"}</div></div>
          <div class="card-copy">
            <h3>${card.title}</h3>
            <p>${card.description || "A birthday note."}</p>
            <div class="card-footer">
              <button class="secondary-button" type="button" data-card-id="${card.id}">
                <span class="button-label">${state.viewedCards.includes(card.id) ? "Read again" : "Read card"}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  attachTiltAll(".birthday-card", grid);

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-id]");
    if (!button || !grid.contains(button)) return;

    const card = valid.find((item) => item.id === button.dataset.cardId);
    if (!card) return;

    if (!state.viewedCards.includes(card.id)) state.viewedCards.push(card.id);
    saveState(state);

    const label = button.querySelector(".button-label");
    if (label) label.textContent = "Read again";

    openDetail?.({
      eyebrow: card.title,
      title: card.footer || "A birthday card",
      description: card.message,
      emoji: card.emoji,
      image: card.image,
      link: card.link,
    });
  });
}
