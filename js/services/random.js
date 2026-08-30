function validStrings(items) {
  return Array.isArray(items)
    ? items.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
}

export function randomFrom(items, exclude = null) {
  const pool = validStrings(items).filter((item) => item !== exclude);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
