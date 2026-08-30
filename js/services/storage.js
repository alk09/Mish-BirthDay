const KEY = "birthday-surprise-state-v1";

export function loadState(fallback) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private browsing or storage quotas should never break the experience.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore storage failures.
  }
}
