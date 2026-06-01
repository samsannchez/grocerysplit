export function encodeState(obj) {
  return btoa(encodeURIComponent(JSON.stringify(obj)));
}

export function decodeState(str) {
  try {
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch {
    return null;
  }
}

export function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

export function formatCurrency(n) {
  return `$${Number(n).toFixed(2)}`;
}

/** Generate a short random session ID */
export function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export const PERSON_COLORS = [
  '#3b82f6', '#a855f7', '#ec4899',
  '#f97316', '#14b8a6', '#eab308',
];
