const MIN_GAME_SPEED = 0.1;
const MAX_GAME_SPEED = 1;
const DEFAULT_GAME_SPEED = 1;

let gameSpeedMultiplier = DEFAULT_GAME_SPEED;
const listeners = new Set();

function clampGameSpeed(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_GAME_SPEED;
  return Math.max(MIN_GAME_SPEED, Math.min(MAX_GAME_SPEED, num));
}

function syncSpeedCssVar() {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--game-speed-multiplier", String(gameSpeedMultiplier));
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(gameSpeedMultiplier);
    } catch (err) {
      console.error("Game speed listener failed:", err);
    }
  });
}

function normalizePositiveDuration(value) {
  const base = Number(value);
  if (!Number.isFinite(base) || base <= 0) return 0;
  return base;
}

export function getGameSpeedMultiplier() {
  return gameSpeedMultiplier;
}

export function getGameSpeedPercent() {
  return Math.round(gameSpeedMultiplier * 100);
}

export function setGameSpeedMultiplier(value) {
  const next = clampGameSpeed(value);
  if (next === gameSpeedMultiplier) return gameSpeedMultiplier;
  gameSpeedMultiplier = next;
  syncSpeedCssVar();
  notifyListeners();
  return gameSpeedMultiplier;
}

export function onGameSpeedChange(listener) {
  if (typeof listener !== "function") return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function scaleDuration(ms) {
  const base = normalizePositiveDuration(ms);
  if (!base) return 0;
  return Math.max(1, Math.round(base / gameSpeedMultiplier));
}

export function scaleDeltaMs(ms) {
  const base = normalizePositiveDuration(ms);
  if (!base) return 0;
  return base * gameSpeedMultiplier;
}

syncSpeedCssVar();
