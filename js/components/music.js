import { on } from "../utils/dom.js";
import { saveState } from "../services/storage.js";

export function setupMusic({ audio, button, state }) {
  if (!audio || !button) return;

  const sync = () => {
    const active = !audio.paused;
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? "Turn music off" : "Turn music on");
    button.querySelector("span").textContent = active ? "♫" : "♪";
  };

  on(audio, "play", sync);
  on(audio, "pause", sync);
  on(audio, "error", () => {
    button.disabled = true;
    button.title = "Add assets/music/birthday.mp3 to enable music.";
    button.setAttribute("aria-label", "Music unavailable");
  });

  on(button, "click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
        state.musicEnabled = true;
      } else {
        audio.pause();
        state.musicEnabled = false;
      }
      saveState(state);
      sync();
    } catch {
      state.musicEnabled = false;
      saveState(state);
      sync();
    }
  });

  if (state.musicEnabled) {
    audio.play().catch(() => {
      state.musicEnabled = false;
      saveState(state);
      sync();
    });
  }

  sync();
}
