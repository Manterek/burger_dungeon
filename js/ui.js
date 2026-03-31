import { scaleDuration } from "./timing.js";

const skillTimers = new Map();
const START_MENU_BURGER_SPRITE = "sprites/indicators/burger_menu.png";
const START_MENU_FRIES_SPRITE = "sprites/indicators/fries_menu.png";
const START_MENU_FRIES_CHANCE = 0.18;
const startMenuSceneState = {
  field: null,
  resizeHandler: null,
  ascendDotsTimer: null
};
const SKILL_CHECK_INDICATORS = {
  good: "sprites/indicators/good_skill_check.png",
  great: "sprites/indicators/great_skill_check.png",
  parry: "sprites/indicators/parry_skill_check.png",
  counter: "sprites/indicators/counter_skill_check.png"
};

function skillFeedbackOwner(target) {
  if (!target) return null;
  return target.closest(".ally-entity, .enemy-entity");
}

function setSkillFeedbackOwnerActive(target, active) {
  const owner = skillFeedbackOwner(target);
  if (!owner) return;
  owner.classList.toggle("skill-feedback-owner-active", !!active);
}

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function burgerCountForField(field) {
  const width = field?.clientWidth || window.innerWidth || 1280;
  const height = field?.clientHeight || window.innerHeight || 720;
  return Math.max(18, Math.min(42, Math.round((width * height) / 38000)));
}

function createStartBurger(field, idx, total) {
  const burger = document.createElement("img");
  const sprite = Math.random() < START_MENU_FRIES_CHANCE ? START_MENU_FRIES_SPRITE : START_MENU_BURGER_SPRITE;
  const depthRoll = Math.random();
  const scale = depthRoll > 0.72 ? randomFloat(1, 1.35) : depthRoll < 0.28 ? randomFloat(0.58, 0.82) : randomFloat(0.8, 1.05);
  const lane = (idx + Math.random() * 0.8) / total;
  const left = Math.max(1, Math.min(97, lane * 100));
  const startOffset = randomFloat(0, 100);
  const drift = randomFloat(-28, 28);
  const rotate = randomFloat(-7, 7);
  const duration = randomFloat(10, 18);
  const delay = randomFloat(-duration, 0);
  const opacity = depthRoll > 0.72 ? randomFloat(0.82, 0.98) : depthRoll < 0.28 ? randomFloat(0.3, 0.52) : randomFloat(0.56, 0.78);
  const ascendDuration = randomFloat(420, 760);
  const ascendDelay = randomFloat(0, 160);
  const ascendX = randomFloat(-70, 70);
  const ascendSpin = randomFloat(-160, 160);
  const ascendExtraRise = randomFloat(0, 90);

  burger.className = `start-burger ${depthRoll > 0.72 ? "near" : depthRoll < 0.28 ? "far" : ""}`.trim();
  burger.src = sprite;
  burger.alt = "";
  burger.decoding = "async";
  burger.loading = "eager";
  burger.style.left = `${left}%`;
  burger.style.top = `${100 + startOffset}%`;
  burger.style.setProperty("--burger-scale", scale.toFixed(2));
  burger.style.setProperty("--float-drift", `${drift.toFixed(1)}px`);
  burger.style.setProperty("--burger-rotate", `${rotate.toFixed(1)}deg`);
  burger.style.setProperty("--float-duration", `${duration.toFixed(2)}s`);
  burger.style.setProperty("--float-delay", `${delay.toFixed(2)}s`);
  burger.style.setProperty("--burger-opacity", opacity.toFixed(2));
  burger.style.setProperty("--ascend-duration", `${ascendDuration.toFixed(0)}ms`);
  burger.style.setProperty("--ascend-delay", `${ascendDelay.toFixed(0)}ms`);
  burger.style.setProperty("--ascend-x", `${ascendX.toFixed(1)}px`);
  burger.style.setProperty("--ascend-spin", `${ascendSpin.toFixed(1)}deg`);
  burger.style.setProperty("--ascend-extra-rise", `${ascendExtraRise.toFixed(1)}px`);
  return burger;
}

function renderStartMenuBurgers(field) {
  if (!field) return;
  const total = burgerCountForField(field);
  field.innerHTML = "";
  for (let idx = 0; idx < total; idx += 1) {
    field.appendChild(createStartBurger(field, idx, total));
  }
}

export function initStartMenuScene(fieldId = "startBurgerField") {
  const field = document.getElementById(fieldId);
  if (!field) return;

  if (startMenuSceneState.resizeHandler) {
    window.removeEventListener("resize", startMenuSceneState.resizeHandler);
  }

  startMenuSceneState.field = field;
  const resizeHandler = () => renderStartMenuBurgers(field);
  startMenuSceneState.resizeHandler = resizeHandler;
  renderStartMenuBurgers(field);
  window.addEventListener("resize", resizeHandler);
}

function nextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

export async function playStartMenuAscendTransition({
  screenId = "startScreen",
  overlayId = "startAscendOverlay"
} = {}) {
  const screen = document.getElementById(screenId);
  const overlay = document.getElementById(overlayId);
  const text = overlay?.querySelector(".start-ascend-text");
  if (!screen) return;

  if (startMenuSceneState.ascendDotsTimer) {
    clearInterval(startMenuSceneState.ascendDotsTimer);
    startMenuSceneState.ascendDotsTimer = null;
  }

  let dotIndex = 0;
  const dotFrames = [".", "..", "...", ".."];
  const syncAscendText = () => {
    if (!text) return;
    text.textContent = `Ascending${dotFrames[dotIndex]}`;
    dotIndex = (dotIndex + 1) % dotFrames.length;
  };

  overlay?.setAttribute("aria-hidden", "false");
  screen.classList.add("start-screen-ascending");
  await nextFrame();
  await new Promise((resolve) => setTimeout(resolve, scaleDuration(420)));
  screen.classList.add("start-screen-loading");
  syncAscendText();
  startMenuSceneState.ascendDotsTimer = window.setInterval(() => {
    syncAscendText();
  }, scaleDuration(280));
  await new Promise((resolve) => setTimeout(resolve, scaleDuration(480)));

  return () => {
    if (startMenuSceneState.ascendDotsTimer) {
      clearInterval(startMenuSceneState.ascendDotsTimer);
      startMenuSceneState.ascendDotsTimer = null;
    }
    if (text) text.textContent = "Ascending...";
  };
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function typedLogHtml(text) {
  const chars = [...(text || "")];
  return chars.map((ch, idx) => {
    const safe = ch === " " ? "&nbsp;" : escapeHtml(ch);
    return `<span class="log-char" style="--char-i:${idx};">${safe}</span>`;
  }).join("");
}

export function updateUI(player, enemies, level, bladeUpgrades = 0, strengthenUpgrades = 0, headerLabel = "PLAYER", options = {}) {
  const hpPct = player.maxHp > 0 ? Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100)) : 0;
  const spPct = player.maxSp > 0 ? Math.max(0, Math.min(100, (player.sp / player.maxSp) * 100)) : 0;
  const luckyCap = options.luckyCap ?? 10;
  const luckyCharges = options.luckyCharges ?? 0;
  const luckyPct = luckyCap > 0 ? Math.max(0, Math.min(100, (luckyCharges / luckyCap) * 100)) : 0;
  const shadowChargePct = Math.max(0, Math.min(100, options.shadowChargePct ?? 0));
  const absorptionHp = Math.max(0, options.absorptionHp ?? 0);
  const absorptionPct = Math.max(0, Math.min(100, options.absorptionPct ?? 0));
  const luckyRow = options.showLucky
    ? `<div class="resource-row"><span class="resource-label">LC</span><div class="resource-track"><div class="resource-fill lucky-fill" style="width:${luckyPct}%"></div></div><span class="resource-value">${luckyCharges}</span></div>`
    : "";
  const shadowRow = options.showShadowCharge
    ? `<div class="resource-row"><span class="resource-label">SC</span><div class="resource-track"><div class="resource-fill lucky-fill" style="width:${shadowChargePct}%"></div></div><span class="resource-value">${Math.round(shadowChargePct)}</span></div>`
    : "";
  const hpRow = options.showAbsorption
    ? (
      `<div class="resource-row"><span class="resource-label">HP</span><div class="resource-track resource-track-overlay">` +
      `<div class="resource-fill hp-fill resource-fill-base" style="width:${hpPct}%"></div>` +
      `<div class="resource-fill ahp-fill resource-fill-overlay" style="width:${absorptionPct}%"></div>` +
      `</div><span class="resource-value">${Math.round(absorptionHp)}</span></div>`
    )
    : `<div class="resource-row"><span class="resource-label">HP</span><div class="resource-track"><div class="resource-fill hp-fill" style="width:${hpPct}%"></div></div><span class="resource-value">${player.hp}</span></div>`;
  const stats = document.getElementById("playerStats");
  if (stats) {
    stats.innerHTML =
      `<div class="card-name-line">${headerLabel}</div>` +
      hpRow +
      `<div class="resource-row"><span class="resource-label">SP</span><div class="resource-track"><div class="resource-fill sp-fill" style="width:${spPct}%"></div></div><span class="resource-value">${player.sp}</span></div>` +
      luckyRow +
      shadowRow;
  }

  const bonus = document.getElementById("playerCardBonus");
  if (bonus) {
    void bladeUpgrades;
    const slateskinDef = Math.max(0, Math.floor(options.slateskinDef ?? 0));
    const defBonus = strengthenUpgrades;
    if (slateskinDef > 0) {
      bonus.innerText = `+${slateskinDef} DEF`;
      bonus.className = "battle-card-bonus battle-card-bonus-temporary";
    } else if (defBonus > 0) {
      bonus.innerText = `+${defBonus} DEF`;
      bonus.className = "battle-card-bonus";
    } else {
      bonus.innerText = "";
      bonus.className = "battle-card-bonus hidden-bonus";
    }
  }

  void enemies;
  const levelCorner = document.getElementById("levelCorner");
  if (levelCorner) levelCorner.innerText = `LVL ${level}`;
}

export function setLog(messages) {
  const count = messages.length;
  const colorForTone = (tone = "default") => {
    if (tone === "attack-green") return [130, 230, 148];
    if (tone === "attack-yellow") return [239, 210, 122];
    if (tone === "attack-blue") return [116, 182, 255];
    if (tone === "attack-bright-red") return [255, 78, 78];
    if (tone === "attack-white") return [234, 238, 246];
    if (tone === "cast-red") return [240, 108, 108];
    if (tone === "cast-yellow") return [239, 210, 122];
    if (tone === "cast-green") return [130, 230, 148];
    if (tone === "fatal-red") return [240, 108, 108];
    if (tone === "collapse-enemy") return [122, 220, 132];
    if (tone === "collapse-ally") return [240, 108, 108];
    return [215, 224, 240];
  };

  const lines = messages.map((entry, idx) => {
    const item = typeof entry === "string" ? { msg: entry, tone: "default" } : entry;
    const newest = idx === count - 1;
    const t = count <= 1 ? 1 : idx / (count - 1);
    const base = colorForTone(item?.tone);
    const gray = [145, 151, 162];
    const mix = 0.48 * (1 - t);
    const r = Math.round(base[0] * (1 - mix) + gray[0] * mix);
    const g = Math.round(base[1] * (1 - mix) + gray[1] * mix);
    const b = Math.round(base[2] * (1 - mix) + gray[2] * mix);
    const color = `rgb(${r}, ${g}, ${b})`;
    const opacity = (0.58 + t * 0.42).toFixed(2);
    const cls = newest ? "log-line log-typing" : "log-line";
    const text = item?.msg || "";
    const content = newest ? typedLogHtml(text) : escapeHtml(text);
    return `<div class="${cls}" style="color:${color};opacity:${opacity};">${content}</div>`;
  });
  document.getElementById("log").innerHTML = lines.join("");
}

export function setPlayerSkillFeedback(message = "", tone = "", ttlMs = 1800, targetId = "playerSkill") {
  const target = document.getElementById(targetId);
  if (!target) return;

  const existingTimer = skillTimers.get(targetId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    skillTimers.delete(targetId);
  }

  if (!message) {
    target.innerHTML = "";
    target.className = "skill-feedback";
    setSkillFeedbackOwnerActive(target, false);
    return;
  }

  const indicatorSrc = SKILL_CHECK_INDICATORS[tone] || "";
  if (indicatorSrc) {
    const toneClass = tone ? ` skill-feedback-${tone}` : "";
    target.innerHTML = `<img class="skill-feedback-indicator${toneClass}" src="${indicatorSrc}" alt="${message}">`;
  } else {
    target.innerText = message;
  }
  target.className = `skill-feedback feedback-${tone}`;
  setSkillFeedbackOwnerActive(target, true);

  const timer = setTimeout(() => {
    target.innerHTML = "";
    target.className = "skill-feedback";
    setSkillFeedbackOwnerActive(target, false);
    skillTimers.delete(targetId);
  }, scaleDuration(ttlMs));
  skillTimers.set(targetId, timer);
}
