import { TILE_SIZE, waitForImage } from "./tile.js";
import { getCoinTossCoinPosition, getTargetableEnemiesForAction, isEnemyTargetableForAction } from "./combat.js";
import { ENEMY_ATTRIBUTE_DEFENSE, ENEMY_ATTRIBUTE_FIRE_IMMUNITY, ENEMY_ATTRIBUTE_FLYING, ENEMY_ATTRIBUTE_ICON_MAP, ENEMY_ATTRIBUTE_MOBILE, ENEMY_ATTRIBUTE_REPEATABLE, getEnemyImage, getEnemyPosition, getEnemyStatusAnchor, getEnemyUiAnchor } from "./enemy.js";
import {
  canJacobUseDefend,
  getJacobActionIconImage,
  getJacobBallBaseDamage,
  getJacobDefenseValue,
  getJacobEnduranceMaxHp,
  getJacobIndicatorImage,
  JACOB_ACTION_ICON_MAP,
  JACOB_CHARACTER_ID,
  JACOB_UPGRADE_DEFINITIONS
} from "./player/jacob.js";
import {
  getKostyaActionIconImage,
  getKostyaDashBaseDamage,
  getKostyaSheetImage,
  getKostyaShadowBaseHp,
  getKostyaShadowBonusHealth,
  getKostyaSwordBaseDamage,
  KOSTYA_ACTION_ICON_MAP,
  KOSTYA_CASTS_MENU_ACTIONS,
  KOSTYA_KATANA_MENU_ACTIONS,
  KOSTYA_UPGRADE_ICON_MAP
} from "./player/kostya.js";
import {
  formatRomanNumeral,
  getPatrickCoinFlipConfig,
  getPatrickCoinFlipLuckyChargeGain,
  getPatrickFeelinFineCleansedPower,
  getPatrickHeadsChancePercent,
  getPatrickRevolverBaseDamage,
  PATRICK_ACES_MENU_ACTIONS,
  PATRICK_ACTION_ICON_MAP,
  PATRICK_REVOLVER_MENU_ACTIONS,
  PATRICK_UPGRADE_ICON_MAP
} from "./player/patrick.js";
import { getPlayerCompanionStatusAnchor, getPlayerCompanionUiAnchor, getPlayerPortraitImage, getPlayerStatusAnchor, getPlayerUiAnchor } from "./party.js";
import { t } from "./lang.js";

const UI_SCALE = 1;
const scaleUi = (value) => Math.max(1, Math.round(value * UI_SCALE));
const CONTAINER_FILL = "#0d121a";
const CONTAINER_STROKE = "#3a4558";
const TEXT_COLOR = "#e8edf7";
const MUTED_TEXT_COLOR = "#9ba7ba";
const PLAYER_BAR_COLOR = "#6db06d";
const ENEMY_BAR_COLOR = "#c25757";
const BUTTON_ACTIVE_FILL = "#2f3640";
const BUTTON_DISABLED_FILL = "#1a1f26";
const BUTTON_STROKE = "#5b6678";
const BUTTON_HOVER_STROKE = "#f2bd73";
const BUTTON_HOVER_INNER_STROKE = "#b9893f";
const INSPECT_HOVER_STROKE = "#9fd8ff";
const INSPECT_HOVER_INNER_STROKE = "#4f93c7";
const BUTTON_TEXT_DISABLED = "#708095";
const BAR_BACKGROUND = "#091018";
const ACTION_ICON_SIZE = scaleUi(72);
const BATTLE_CARD_BAR_HP = "#5f9a56";
const BATTLE_CARD_BAR_SP = "#b98a3b";
const ENEMY_BAR_WIDTH = scaleUi(78);
const ENEMY_BAR_HEIGHT = scaleUi(12);
const BATTLE_CARD_BAR_LC = "#4f86d8";
const BATTLE_CARD_BAR_SC = "#6a67d8";
const SHADOW_BAR_HP = "#5f9a56";
const SHADOW_BAR_SHP = "#4f86d8";
const DODGE_PANEL_FILL = "#10161f";
const DODGE_PANEL_STROKE = "#4a586f";
const DODGE_GREEN = "#78d96f";
const DODGE_YELLOW = "#e2c55f";
const DODGE_COUNTER = "#d86f6f";
const DODGE_MARKER = "#f5f7fb";
const TARGET_OUTLINE_COLOR = "#efe1b2";
const ACTION_BUTTON_GAP = scaleUi(10);
const ACTION_PANEL_HORIZONTAL_PADDING = scaleUi(10);
const ACTION_PANEL_VERTICAL_PADDING = scaleUi(8);
const ACTION_BUTTON_MIN_SIZE = scaleUi(72);
const ACTION_BUTTON_MAX_SIZE = scaleUi(112);
const MODE_TOGGLE_GAP = scaleUi(8);
const MODE_TOGGLE_HEIGHT = scaleUi(22);
const MODE_TOGGLE_WIDTH = scaleUi(92);
const SUBMENU_BACK_SIZE = scaleUi(34);
const ACTION_PANEL_LIFT = 0;
const INSPECT_PANEL_WIDTH = scaleUi(280);
const INSPECT_PANEL_GAP = scaleUi(12);
const UPGRADE_PANEL_WIDTH = scaleUi(620);
const UPGRADE_PANEL_PADDING = scaleUi(16);
const UPGRADE_CARD_GAP = scaleUi(12);
const UPGRADE_CARD_HEIGHT = scaleUi(124);
const UPGRADE_ICON_SIZE = scaleUi(48);
const UPGRADE_DESCRIPTION_FONT_SIZE_PX = scaleUi(7);
const UPGRADE_DESCRIPTION_LINE_HEIGHT = scaleUi(8);
const UPGRADE_DESCRIPTION_TEXT_COLOR = "#8f99aa";
const UPGRADE_CONFIRM_BUTTON_WIDTH = scaleUi(132);
const UPGRADE_CONFIRM_BUTTON_HEIGHT = scaleUi(22);
const DEBUG_BUTTON_HEIGHT = scaleUi(22);
const DEBUG_BUTTON_GAP = scaleUi(8);
const DEBUG_BUTTON_PADDING = scaleUi(8);
const INSPECT_BODY_SCALE = 1;
const INSPECT_BODY_LINE_HEIGHT = scaleUi(10);
const INSPECT_BODY_PARAGRAPH_GAP = scaleUi(4);
const INSPECT_BODY_TEXT_COLOR = "#cfd7e4";
const INSPECT_COLOR_GOOD = "#90d77a";
const INSPECT_COLOR_BAD = "#a691c9";
const INSPECT_COLOR_RESOURCE = "#e3c46b";
const INSPECT_COLOR_INFO = "#8fb4d9";
const INSPECT_COLOR_DAMAGE = "#d86f6f";
const INSPECT_COLOR_STRENGTH = "#e07aa8";
const INSPECT_COLOR_YELLOW = "#e2c55f";
const INSPECT_COLOR_CLEANSED = "#fff08a";
const INSPECT_COLOR_CHARGE = "#6fa0f0";
const INSPECT_COLOR_ABSORPTION = "#c9783a";
const INSPECT_INLINE_COLORS = {
  good: INSPECT_COLOR_GOOD,
  bad: INSPECT_COLOR_BAD,
  resource: INSPECT_COLOR_RESOURCE,
  info: INSPECT_COLOR_INFO,
  damage: INSPECT_COLOR_DAMAGE,
  marked: INSPECT_COLOR_DAMAGE,
  strength: INSPECT_COLOR_STRENGTH,
  yellow: INSPECT_COLOR_YELLOW,
  cleansed: INSPECT_COLOR_CLEANSED,
  charge: INSPECT_COLOR_CHARGE,
  absorption: INSPECT_COLOR_ABSORPTION
};
const FONT_FAMILY = "\"Press Start 2P\", monospace";
const BASE_FONT_SIZE_PX = scaleUi(8);
const WIDTH_FUDGE = 1.02;
const TEXT_PADDING = scaleUi(6);
const ALPHA_THRESHOLD = 170;
const STATUS_ICON_TILE_SIZE = 8;
const STATUS_ICON_DRAW_SIZE = scaleUi(18);
const ATTRIBUTE_ICON_TILE_SIZE = 8;
const ATTRIBUTE_ICON_DRAW_SIZE = scaleUi(16);
const ATTRIBUTE_ICON_GAP = scaleUi(4);
const PATRICK_ACTION_ICON_TILE_SIZE = 16;
const ACTION_ICON_TILE_SIZE = 16;
const SKILL_FEEDBACK_TILE_SIZE = 16;
const STATUS_CHIP_HEIGHT = scaleUi(24);
const STATUS_CHIP_HORIZONTAL_PADDING = scaleUi(1);
const STATUS_CHIP_GAP = scaleUi(2);
const STATUS_CHIP_ROW_GAP = scaleUi(2);
const STATUS_CHIP_Y_OFFSET = scaleUi(52);
const STATUS_CHIP_COLUMNS = 3;
const measureCanvas = document.createElement("canvas");
const measureContext = measureCanvas.getContext("2d");
const feedbackTintCanvas = document.createElement("canvas");
feedbackTintCanvas.width = SKILL_FEEDBACK_TILE_SIZE;
feedbackTintCanvas.height = SKILL_FEEDBACK_TILE_SIZE;
const feedbackTintContext = feedbackTintCanvas.getContext("2d");
let uiCanvas = null;
let uiContext = null;
const textBitmapCache = new Map();
const statusEffectImage = new Image();
statusEffectImage.src = "sprites/indicator/effect.png";
const patrickActionIconImage = new Image();
patrickActionIconImage.src = "sprites/player/patrick/patrick_icon.png";
const jacobActionIconImage = getJacobActionIconImage();
const kostyaActionIconImage = getKostyaActionIconImage();
const uiIconSheetImage = new Image();
uiIconSheetImage.src = "sprites/indicator/ui.png";
const itemIconSheetImage = new Image();
itemIconSheetImage.src = "sprites/indicator/item.png";
const skillFeedbackImage = new Image();
skillFeedbackImage.src = "sprites/indicator/skill_feedback.png";
const attributeImage = new Image();
attributeImage.src = "sprites/indicator/attribute.png";
const patrickIndicatorImage = new Image();
patrickIndicatorImage.src = "sprites/player/patrick/patrick_indicator.png";
const jacobIndicatorImage = getJacobIndicatorImage();

const STATUS_ICON_MAP = {
  absorption: { row: 1, column: 6 },
  resistance: { row: 1, column: 3 },
  weakness: { row: 2, column: 1 },
  marked: { row: 2, column: 6 },
  cleansed: { row: 2, column: 5 },
  strength: { row: 1, column: 5 },
  speed: { row: 1, column: 4 },
  slowness: { row: 2, column: 2 },
  stunned: { row: 2, column: 3 },
  decaying: { row: 1, column: 8 },
  poison: { row: 1, column: 7 },
  fire: { row: 2, column: 4 },
  hpRegen: { row: 1, column: 1 },
  spRegen: { row: 1, column: 2 }
};

const STATUS_DRAW_ORDER = [
  "absorption",
  "resistance",
  "weakness",
  "marked",
  "cleansed",
  "strength",
  "speed",
  "slowness",
  "stunned",
  "decaying",
  "poison",
  "fire",
  "hpRegen",
  "spRegen"
];

const ACTION_ICON_MAP = {
  ...JACOB_ACTION_ICON_MAP,
  ...KOSTYA_ACTION_ICON_MAP,
  ...PATRICK_ACTION_ICON_MAP
};

const UPGRADE_ICON_MAP = {
  ...Object.fromEntries(JACOB_UPGRADE_DEFINITIONS.map((definition) => [definition.id, null])),
  ...KOSTYA_UPGRADE_ICON_MAP,
  ...PATRICK_UPGRADE_ICON_MAP
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function loadUiAssets() {
  return Promise.all([
    waitForImage(statusEffectImage),
    waitForImage(patrickActionIconImage),
    waitForImage(jacobActionIconImage),
    waitForImage(kostyaActionIconImage),
    waitForImage(uiIconSheetImage),
    waitForImage(itemIconSheetImage),
    waitForImage(skillFeedbackImage),
    waitForImage(attributeImage),
    waitForImage(patrickIndicatorImage),
    waitForImage(jacobIndicatorImage)
  ]);
}

export function measurePixelTextWidth(text, scale) {
  return getTextBitmap(String(text), scale, "#ffffff").width;
}

function measurePixelTextWidthAtSize(text, fontSizePx, drawScale = 1, preserveAlpha = false) {
  return Math.ceil(getTextBitmapAtSize(String(text), fontSizePx, "#ffffff", preserveAlpha).width * drawScale);
}

function measurePixelTextAdvance(text, scale) {
  if (!measureContext) {
    return measurePixelTextWidth(text, scale);
  }

  const fontSize = getFontSize(scale);
  measureContext.font = `${fontSize}px ${FONT_FAMILY}`;
  measureContext.textBaseline = "top";
  return Math.ceil(measureContext.measureText(String(text).toUpperCase()).width * WIDTH_FUDGE);
}

export function drawPixelText(context, text, x, y, scale, color, align = "left") {
  const normalizedText = String(text).toUpperCase();
  const bitmap = getTextBitmap(normalizedText, scale, color);
  const width = bitmap.width;
  const startX = align === "right"
    ? Math.floor(x - width)
    : align === "center"
      ? Math.floor(x - width / 2)
      : Math.floor(x);

  context.imageSmoothingEnabled = false;
  context.drawImage(bitmap.canvas, startX, Math.floor(y));
}

function drawPixelTextAtSize(context, text, x, y, fontSizePx, color, align = "left", drawScale = 1, preserveAlpha = false) {
  const normalizedText = String(text).toUpperCase();
  const bitmap = getTextBitmapAtSize(normalizedText, fontSizePx, color, preserveAlpha);
  const width = Math.ceil(bitmap.width * drawScale);
  const height = Math.ceil(bitmap.height * drawScale);
  const startX = align === "right"
    ? Math.floor(x - width)
    : align === "center"
      ? Math.floor(x - width / 2)
      : Math.floor(x);

  context.imageSmoothingEnabled = drawScale < 1;
  context.drawImage(bitmap.canvas, startX, Math.floor(y), width, height);
}

function getFontSize(scale) {
  return Math.max(BASE_FONT_SIZE_PX, Math.round(BASE_FONT_SIZE_PX * scale));
}

function getTextBitmap(text, scale, color) {
  return getTextBitmapAtSize(text, getFontSize(scale), color);
}

function getTextBitmapAtSize(text, fontSize, color, preserveAlpha = false) {
  if (!measureContext) {
    return { canvas: document.createElement("canvas"), width: 0, height: 0 };
  }

  const cacheKeyWithSize = `${text}|${fontSize}|${color}|${preserveAlpha ? "soft" : "hard"}`;
  const cachedBySize = textBitmapCache.get(cacheKeyWithSize);

  if (cachedBySize) {
    return cachedBySize;
  }

  const paddedText = String(text).toUpperCase();
  measureContext.font = `${fontSize}px ${FONT_FAMILY}`;
  measureContext.textBaseline = "top";

  const measuredWidth = Math.ceil(measureContext.measureText(paddedText).width * WIDTH_FUDGE);
  const rawCanvas = document.createElement("canvas");
  const rawContext = rawCanvas.getContext("2d", { willReadFrequently: true });
  const rawWidth = measuredWidth + TEXT_PADDING * 2;
  const rawHeight = Math.ceil(fontSize * 1.6) + TEXT_PADDING * 2;

  rawCanvas.width = Math.max(1, rawWidth);
  rawCanvas.height = Math.max(1, rawHeight);

  if (!rawContext) {
    return { canvas: rawCanvas, width: 0, height: 0 };
  }

  rawContext.imageSmoothingEnabled = false;
  rawContext.font = `${fontSize}px ${FONT_FAMILY}`;
  rawContext.textBaseline = "top";
  rawContext.textAlign = "left";
  rawContext.fillStyle = color;
  rawContext.fillText(paddedText, TEXT_PADDING, TEXT_PADDING);

  const imageData = rawContext.getImageData(0, 0, rawCanvas.width, rawCanvas.height);
  const data = imageData.data;
  let minX = rawCanvas.width;
  let minY = rawCanvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha >= (preserveAlpha ? 1 : ALPHA_THRESHOLD)) {
      data[index + 3] = preserveAlpha ? alpha : 255;
      const pixelIndex = index / 4;
      const px = pixelIndex % rawCanvas.width;
      const py = Math.floor(pixelIndex / rawCanvas.width);
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    } else {
      data[index + 3] = 0;
    }
  }

  rawContext.putImageData(imageData, 0, 0);

  if (maxX < minX || maxY < minY) {
    const empty = { canvas: document.createElement("canvas"), width: 0, height: 0 };
    textBitmapCache.set(cacheKeyWithSize, empty);
    return empty;
  }

  const croppedCanvas = document.createElement("canvas");
  const croppedWidth = maxX - minX + 1;
  const croppedHeight = maxY - minY + 1;
  croppedCanvas.width = croppedWidth;
  croppedCanvas.height = croppedHeight;
  const croppedContext = croppedCanvas.getContext("2d");

  if (!croppedContext) {
    const fallback = { canvas: rawCanvas, width: measuredWidth, height: rawHeight };
    textBitmapCache.set(cacheKeyWithSize, fallback);
    return fallback;
  }

  croppedContext.imageSmoothingEnabled = false;
  croppedContext.drawImage(
    rawCanvas,
    minX,
    minY,
    croppedWidth,
    croppedHeight,
    0,
    0,
    croppedWidth,
    croppedHeight
  );

  const result = {
    canvas: croppedCanvas,
    width: croppedWidth,
    height: croppedHeight
  };

  textBitmapCache.set(cacheKeyWithSize, result);
  return result;
}


function ensureUiCanvas() {
  if (uiCanvas instanceof HTMLCanvasElement && uiContext) {
    return { canvas: uiCanvas, context: uiContext };
  }

  const gameShell = document.getElementById("game-shell");
  if (!(gameShell instanceof HTMLElement)) {
    return { canvas: null, context: null };
  }

  uiCanvas = document.createElement("canvas");
  uiCanvas.id = "ui-canvas";
  uiCanvas.className = "game-ui-canvas";
  uiCanvas.setAttribute("aria-hidden", "true");
  gameShell.appendChild(uiCanvas);

  uiContext = uiCanvas.getContext("2d");
  if (uiContext) {
    uiContext.imageSmoothingEnabled = false;
  }

  return { canvas: uiCanvas, context: uiContext };
}

function syncUiCanvas(sceneCanvas) {
  const overlay = ensureUiCanvas();
  if (!(overlay.canvas instanceof HTMLCanvasElement) || !overlay.context) {
    return overlay;
  }

  if (overlay.canvas.width !== sceneCanvas.width) {
    overlay.canvas.width = sceneCanvas.width;
  }
  if (overlay.canvas.height !== sceneCanvas.height) {
    overlay.canvas.height = sceneCanvas.height;
  }

  overlay.canvas.style.width = sceneCanvas.style.width || `${window.innerWidth}px`;
  overlay.canvas.style.height = sceneCanvas.style.height || `${window.innerHeight}px`;
  overlay.context.imageSmoothingEnabled = false;
  return overlay;
}

export function getUiCanvas() {
  return ensureUiCanvas().canvas;
}

export function renderUiLayer({ sceneCanvas, battleState, actions }) {
  const overlay = syncUiCanvas(sceneCanvas);
  if (!(overlay.canvas instanceof HTMLCanvasElement) || !overlay.context) {
    return;
  }

  overlay.context.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);
  drawBattleUi(overlay.context, overlay.canvas, battleState, actions);
}

export function clearUiLayer() {
  const overlay = ensureUiCanvas();
  if (!(overlay.canvas instanceof HTMLCanvasElement) || !overlay.context) {
    return;
  }

  overlay.context.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);
}

export function getActionAtPoint({ x, y, canvas, battleState, actions }) {
  const target = getUiClickTarget({ x, y, canvas, battleState, actions });
  return target?.type === "action" ? target.id : null;
}

export function getUiClickTarget({ x, y, canvas, battleState, actions }) {
  if (battleState.pendingUpgradeSelection) {
    return getUpgradeTargetAtPoint({ x, y, canvas, battleState });
  }

  if (battleState.pendingTargetActionId) {
    return getEnemyTargetAtPoint({ x, y, battleState });
  }

  const layout = getUiLayout(canvas, actions, battleState);
  const buttons = getActionButtons(layout, battleState, actions);
  const modeButtons = getModeButtons(layout, battleState);
  const debugButtons = getDebugButtons(layout, battleState);

  for (const button of debugButtons) {
    if (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    ) {
      return { type: "debug", id: button.id };
    }
  }

  for (const button of modeButtons) {
    if (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    ) {
      return { type: "mode", id: button.id };
    }
  }

  for (const button of buttons) {
    if (button.isScrollable && !isPointInsideActionStrip(x, y, layout)) {
      continue;
    }

    if (button.disabled && !button.allowDisabledClick && battleState.uiMode !== "inspect") {
      continue;
    }

    if (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    ) {
      return { type: "action", id: button.id };
    }
  }

  return null;
}

export function getActionStripBounds(canvas, actions, battleState = null) {
  const layout = getUiLayout(canvas, actions, battleState);
  return {
    x: layout.actionPanel.x + ACTION_PANEL_HORIZONTAL_PADDING,
    y: layout.actionPanel.y + ACTION_PANEL_VERTICAL_PADDING,
    width: Math.max(0, layout.actionPanel.width - ACTION_PANEL_HORIZONTAL_PADDING * 2),
    height: Math.max(0, layout.actionPanel.height - ACTION_PANEL_VERTICAL_PADDING * 2)
  };
}

export function getActionScrollMaxOffset(canvas, actions, battleState = null) {
  const layout = getUiLayout(canvas, actions, battleState);
  return getActionScrollMetrics(layout, actions).maxOffset;
}

function drawBattleUi(context, canvas, battleState, actions) {
  const layout = getUiLayout(canvas, actions, battleState);
  const buttons = getActionButtons(layout, battleState, actions);
  const modeButtons = getModeButtons(layout, battleState);
  const debugButtons = getDebugButtons(layout, battleState);
  const inspectAction = actions.find((entry) => entry.id === battleState.inspectedActionId) ?? null;
  const inspectPanel = battleState.uiMode === "inspect" && inspectAction?.actionType !== "menu-back"
    ? getInspectPanelLayout(layout, canvas, battleState, actions)
    : null;
  drawBattlefieldForegroundGradient(context, canvas, layout);
  drawBattleCard(context, layout, battleState);
  drawStatusChipsForUnit(context, battleState.player, getPlayerStatusAnchor(battleState.player));
  if (battleState.player.shadow && (battleState.player.shadow.hp ?? 0) > 0) {
    drawShadowHpLabel(context, battleState.player.shadow);
    drawStatusChipsForUnit(context, battleState.player.shadow, getPlayerCompanionStatusAnchor(0, battleState.player.shadow));
  }
  battleState.enemies.forEach((enemy, index) => {
    if (enemy.hp <= 0) {
      return;
    }
    drawEnemyHpLabel(context, enemy, index);
    drawStatusChipsForUnit(context, enemy, getEnemyStatusAnchor(index, enemy));
  });
  drawPatrickProjectileEffects(context, battleState);
  drawSkillFeedback(context, battleState);
  debugButtons.forEach((button) => drawDebugButton(context, button));
  if (battleState.pendingTargetActionId) {
    drawEnemyTargetOutline(context, battleState);
    drawTargetSelectionPrompt(context, canvas, battleState, layout);
  }
  modeButtons.forEach((button) => drawModeButton(context, button));
  drawPanel(context, layout.actionPanel.x, layout.actionPanel.y, layout.actionPanel.width, layout.actionPanel.height);
  context.save();
  context.beginPath();
  context.rect(
    layout.actionPanel.x + ACTION_PANEL_HORIZONTAL_PADDING,
    layout.actionPanel.y + ACTION_PANEL_VERTICAL_PADDING,
    Math.max(0, layout.actionPanel.width - ACTION_PANEL_HORIZONTAL_PADDING * 2),
    Math.max(0, layout.actionPanel.height - ACTION_PANEL_VERTICAL_PADDING * 2)
  );
  context.clip();
  buttons.filter((button) => button.isScrollable).forEach((button) => drawActionButton(context, button, battleState.hoveredActionId, battleState));
  context.restore();
  buttons.filter((button) => !button.isScrollable).forEach((button) => drawActionButton(context, button, battleState.hoveredActionId, battleState));
  if (inspectPanel) {
    drawInspectPanel(context, inspectPanel, battleState, actions);
  }
  if (battleState.pendingUpgradeSelection) {
    drawUpgradeOverlay(context, canvas, battleState);
  }

  if (battleState.dodgeCheck?.active) {
    drawDodgeCheck(context, canvas, battleState.dodgeCheck);
  }

  if (battleState.actionCheck?.active) {
    drawActionCheck(context, canvas, battleState.actionCheck);
  }
}

function drawBattlefieldForegroundGradient(context, canvas, layout) {
  const gradientBottom = canvas.height;
  const gradientStartY = Math.floor(canvas.height * 0.58);

  if (gradientBottom <= gradientStartY) {
    return;
  }

  const gradient = context.createLinearGradient(0, gradientStartY, 0, gradientBottom);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.45, "rgba(0, 0, 0, 0.08)");
  gradient.addColorStop(0.78, "rgba(0, 0, 0, 0.22)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.42)");

  context.save();
  context.fillStyle = gradient;
  context.fillRect(0, gradientStartY, canvas.width, gradientBottom - gradientStartY);
  context.restore();
}

function drawSkillFeedback(context, battleState) {
  const feedback = battleState.skillFeedback;
  if (!feedback || Number(feedback.endsAt ?? 0) <= performance.now()) {
    return;
  }

  const letters = getSkillFeedbackLetters(feedback.type);
  if (letters.length === 0) {
    return;
  }

  const now = performance.now();
  const elapsed = Math.max(0, now - Number(feedback.startedAt ?? 0));
  const letterDelayMs = 70;
  const letterRiseDurationMs = 170;
  const fadeOutDurationMs = 220;
  const visibleCount = Math.min(letters.length, Math.max(1, Math.floor(elapsed / letterDelayMs) + 1));
  const anchor = getPlayerUiAnchor(battleState.player);
  const drawSize = 20;
  const positions = getSkillFeedbackLetterPositions(letters.length, drawSize, feedback.type);
  const totalWidth = positions.length > 0 ? positions[positions.length - 1] + drawSize : drawSize;
  const feedbackAnchorOffsetX = Number.isFinite(feedback.anchorOffsetX) ? feedback.anchorOffsetX : 72;
  const startX = Math.floor(anchor.x * TILE_SIZE - totalWidth / 2 + feedbackAnchorOffsetX);
  const startY = Math.floor(anchor.y * TILE_SIZE - 78);
  const fadeOutAlpha = now >= feedback.endsAt - fadeOutDurationMs
    ? Math.max(0, (feedback.endsAt - now) / fadeOutDurationMs)
    : 1;

  context.save();
  context.imageSmoothingEnabled = false;

  for (let index = 0; index < visibleCount; index += 1) {
    const sprite = letters[index];
    const letterElapsed = Math.max(0, now - (Number(feedback.startedAt ?? 0) + index * letterDelayMs));
    const revealProgress = Math.max(0, Math.min(1, letterElapsed / letterRiseDurationMs));
    const offsetY = Math.round((1 - revealProgress) * 10);
    const drawX = startX + positions[index];
    const drawY = startY + offsetY;
    const whiteAlpha = (1 - revealProgress) * fadeOutAlpha;
    const colorAlpha = revealProgress * fadeOutAlpha;

    if (whiteAlpha > 0.01) {
      drawFeedbackLetterSilhouette(
        context,
        sprite,
        drawX,
        drawY,
        drawSize,
        whiteAlpha
      );
    }

    if (colorAlpha > 0.01) {
      context.save();
      context.globalAlpha = colorAlpha;
      context.drawImage(
        skillFeedbackImage,
        (sprite.column - 1) * SKILL_FEEDBACK_TILE_SIZE,
        (sprite.row - 1) * SKILL_FEEDBACK_TILE_SIZE,
        SKILL_FEEDBACK_TILE_SIZE,
        SKILL_FEEDBACK_TILE_SIZE,
        drawX,
        drawY,
        drawSize,
        drawSize
      );
      context.restore();
    }
  }

  context.restore();
}

function drawPatrickProjectileEffects(context, battleState) {
  const effects = (battleState.projectileEffects ?? []).filter((effect) => Number(effect.endsAt ?? 0) > performance.now());
  if (effects.length === 0) {
    return;
  }

  effects.forEach((effect) => {
    drawPatrickProjectileEffect(context, effect);
  });
}

function drawPatrickProjectileEffect(context, effect) {
  const now = performance.now();
  if (effect.type === "coin-toss-coin") {
    drawPatrickCoinTossCoinEffect(context, effect, now);
    return;
  }
  if (effect.type === "mass-infection-wave") {
    drawKostyaMassInfectionWaveEffect(context, effect, now);
    return;
  }

  const totalDuration = Math.max(1, Number(effect.endsAt ?? now) - Number(effect.startedAt ?? now));
  const progress = Math.max(0, Math.min(1, (now - Number(effect.startedAt ?? now)) / totalDuration));
  const projectileX = Math.floor(effect.startX + (effect.endX - effect.startX) * progress);
  const projectileY = Math.floor(getProjectileY(effect, progress));
  const bulletSprite = getPatrickProjectileSprite(effect.type);
  const bulletSize = Number(effect.bulletSize ?? 16);
  const flashSize = Number(effect.flashSize ?? 20);
  const spinTurns = Number(effect.spinTurns ?? 0);
  const angle = Number.isFinite(effect.rotationAngle)
    ? Number(effect.rotationAngle) + progress * Math.PI * 2 * spinTurns
    : Number.isFinite(effect.flashAngle)
    ? Number(effect.flashAngle)
    : Math.atan2(effect.endY - effect.startY, effect.endX - effect.startX);

  context.save();
  context.imageSmoothingEnabled = false;

  if (Number(effect.flashEndsAt ?? 0) > now) {
    context.save();
    context.globalAlpha = 0.42;
    context.fillStyle = effect.glowColor ?? "#fff2a8";
    context.beginPath();
    context.arc(effect.startX + 2, effect.startY - 1, Number(effect.glowRadius ?? 10), 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.save();
    context.translate(effect.startX, effect.startY);
    context.rotate(angle);
    context.drawImage(
      patrickIndicatorImage,
      (5 - 1) * 8,
      0,
      8,
      8,
      -Math.floor(flashSize / 2),
      -Math.floor(flashSize / 2),
      flashSize,
      flashSize
    );
    context.restore();
  }

  const trailAlpha = effect.disableTrail === true ? 0 : Math.max(0, 1 - progress * 1.2);
  if (trailAlpha > 0.02) {
    context.save();
    context.globalAlpha = trailAlpha;
    context.strokeStyle = effect.trailColor ?? "#ffffff";
    context.lineWidth = Number(effect.trailWidth ?? 3);
    context.lineCap = "round";
    drawProjectileTrailPath(context, effect, progress);
    context.restore();
  }

  context.save();
  context.translate(projectileX + 1, projectileY);
  context.rotate(angle);
  if (effect.spriteSheet === "enemy") {
    context.drawImage(
      getEnemyImage(),
      -Math.floor(bulletSize / 2),
      -Math.floor(bulletSize / 2),
      bulletSize,
      bulletSize
    );
  } else if (effect.spriteSheet === "jacob-indicator") {
    const sprite = effect.sprite ?? { row: 1, column: 1 };
    context.drawImage(
      jacobIndicatorImage,
      (sprite.column - 1) * 8,
      (sprite.row - 1) * 8,
      8,
      8,
      -Math.floor(bulletSize / 2),
      -Math.floor(bulletSize / 2),
      bulletSize,
      bulletSize
    );
  } else {
    context.drawImage(
      patrickIndicatorImage,
      (bulletSprite.column - 1) * 8,
      (bulletSprite.row - 1) * 8,
      8,
      8,
      -Math.floor(bulletSize / 2),
      -Math.floor(bulletSize / 2),
      bulletSize,
      bulletSize
    );
  }
  context.restore();

  context.restore();
}

function getProjectileY(effect, progress) {
  const linearY = effect.startY + (effect.endY - effect.startY) * progress;
  const arcHeight = Number(effect.arcHeight ?? 0);
  if (arcHeight <= 0) {
    return linearY;
  }

  return linearY - Math.sin(progress * Math.PI) * arcHeight;
}

function drawProjectileTrailPath(context, effect, progress) {
  const arcHeight = Number(effect.arcHeight ?? 0);
  if (arcHeight <= 0) {
    context.beginPath();
    context.moveTo(effect.startX + 1, effect.startY + (Number(effect.trailStartYOffset) || 0));
    context.lineTo(
      Math.floor(effect.startX + (effect.endX - effect.startX) * progress) + 1,
      Math.floor(getProjectileY(effect, progress))
    );
    context.stroke();
    return;
  }

  const samples = 8;
  const trailLength = Number(effect.trailLength ?? 0.22);
  const startProgress = Math.max(0, progress - trailLength);
  context.beginPath();
  for (let index = 0; index <= samples; index += 1) {
    const sampleProgress = startProgress + ((progress - startProgress) * (index / samples));
    const sampleX = Math.floor(effect.startX + (effect.endX - effect.startX) * sampleProgress) + 1;
    const sampleY = Math.floor(getProjectileY(effect, sampleProgress));
    if (index === 0) {
      context.moveTo(sampleX, sampleY);
    } else {
      context.lineTo(sampleX, sampleY);
    }
  }
  context.stroke();
}

function drawKostyaMassInfectionWaveEffect(context, effect, now) {
  const totalDuration = Math.max(1, Number(effect.endsAt ?? now) - Number(effect.startedAt ?? now));
  const progress = Math.max(0, Math.min(1, (now - Number(effect.startedAt ?? now)) / totalDuration));
  const projectileX = Math.floor(effect.startX + (effect.endX - effect.startX) * progress);
  const projectileY = Math.floor(effect.startY + (effect.endY - effect.startY) * progress);
  const angle = Math.atan2(effect.endY - effect.startY, effect.endX - effect.startX);
  const trailAlpha = Math.max(0.12, 1 - progress * 0.95);
  const spriteSize = Number(effect.spriteSize ?? 24);
  const drawOffsetX = -Math.floor(spriteSize * 0.36);
  const drawOffsetY = -Math.floor(spriteSize * 0.56);

  context.save();
  context.imageSmoothingEnabled = false;
  context.translate(projectileX, projectileY);
  context.rotate(angle);

  context.save();
  context.globalAlpha = trailAlpha * 0.35;
  context.strokeStyle = "#8fefb7";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(-20, 0);
  context.lineTo(8, 0);
  context.stroke();
  context.restore();

  context.drawImage(
    getKostyaSheetImage(),
    2 * 32,
    7 * 32,
    32,
    32,
    drawOffsetX,
    drawOffsetY,
    spriteSize,
    spriteSize
  );

  context.restore();
}

function drawPatrickCoinTossCoinEffect(context, effect, now) {
  const totalDuration = Math.max(1, Number(effect.endsAt ?? now) - Number(effect.startedAt ?? now));
  const progress = Math.max(0, Math.min(1, (now - Number(effect.startedAt ?? now)) / totalDuration));
  const coinPosition = getCoinTossCoinPosition(effect, now);
  const drawX = coinPosition.x;
  const drawY = coinPosition.y;

  const frameIndex = Math.floor((now - Number(effect.startedAt ?? now)) / 90) % 2;
  const coinSpriteColumn = frameIndex === 0 ? 6 : 7;
  const drawSize = 24;

  context.save();
  context.imageSmoothingEnabled = false;
  if (progress > 0.8) {
    context.globalAlpha = Math.max(0, 1 - ((progress - 0.8) / 0.2));
  }
  context.drawImage(
    patrickIndicatorImage,
    (coinSpriteColumn - 1) * 8,
    0,
    8,
    8,
    drawX - Math.floor(drawSize / 2),
    drawY - Math.floor(drawSize / 2),
    drawSize,
    drawSize
  );
  context.restore();
}

function getPatrickProjectileSprite(type) {
  if (type === "hollow") {
    return { row: 1, column: 2 };
  }

  if (type === "magnum") {
    return { row: 1, column: 3 };
  }

  return { row: 1, column: 1 };
}

function drawFeedbackLetterSilhouette(context, sprite, x, y, size, alpha) {
  if (!feedbackTintContext) {
    return;
  }

  feedbackTintContext.clearRect(0, 0, SKILL_FEEDBACK_TILE_SIZE, SKILL_FEEDBACK_TILE_SIZE);
  feedbackTintContext.save();
  feedbackTintContext.imageSmoothingEnabled = false;
  feedbackTintContext.drawImage(
    skillFeedbackImage,
    (sprite.column - 1) * SKILL_FEEDBACK_TILE_SIZE,
    (sprite.row - 1) * SKILL_FEEDBACK_TILE_SIZE,
    SKILL_FEEDBACK_TILE_SIZE,
    SKILL_FEEDBACK_TILE_SIZE,
    0,
    0,
    SKILL_FEEDBACK_TILE_SIZE,
    SKILL_FEEDBACK_TILE_SIZE
  );
  feedbackTintContext.globalCompositeOperation = "source-in";
  feedbackTintContext.fillStyle = "#ffffff";
  feedbackTintContext.fillRect(0, 0, SKILL_FEEDBACK_TILE_SIZE, SKILL_FEEDBACK_TILE_SIZE);
  feedbackTintContext.restore();

  context.save();
  context.globalAlpha = alpha;
  context.drawImage(feedbackTintCanvas, x, y, size, size);
  context.restore();
}

function getSkillFeedbackLetters(type) {
  if (type === "good") {
    return [
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 1, column: 2 },
      { row: 1, column: 3 },
      { row: 1, column: 4 }
    ];
  }

  if (type === "great") {
    return [
      { row: 2, column: 1 },
      { row: 2, column: 2 },
      { row: 2, column: 3 },
      { row: 2, column: 4 },
      { row: 2, column: 5 },
      { row: 2, column: 6 }
    ];
  }

  if (type === "counter") {
    return [
      { row: 3, column: 1 },
      { row: 3, column: 2 },
      { row: 3, column: 3 },
      { row: 3, column: 4 },
      { row: 3, column: 5 },
      { row: 3, column: 6 },
      { row: 3, column: 7 },
      { row: 3, column: 8 }
    ];
  }

  if (type === "amazing") {
    return [
      { row: 4, column: 1 },
      { row: 4, column: 2 },
      { row: 4, column: 3 },
      { row: 4, column: 4 },
      { row: 4, column: 5 },
      { row: 4, column: 6 },
      { row: 4, column: 7 },
      { row: 4, column: 8 }
    ];
  }

  return [];
}

function getSkillFeedbackLetterPositions(letterCount, drawSize, type) {
  const positions = [];
  let cursorX = 0;
  const defaultAdvance = drawSize - 2;
  const greatAdvances = [
    Math.floor(drawSize * 0.95),
    Math.floor(drawSize * (2 / 3)),
    Math.floor(drawSize * 0.5),
    Math.floor(drawSize * (2 / 3)),
    Math.floor(drawSize * (2 / 3))
  ];
  const counterAdvances = [
    Math.floor(drawSize * 0.8),
    Math.floor(drawSize * 0.74),
    Math.floor(drawSize * 0.78),
    Math.floor(drawSize * 0.84),
    Math.floor(drawSize * 0.54),
    Math.floor(drawSize * 0.64),
    Math.floor(drawSize * 0.56)
  ];
  const amazingAdvances = [
    Math.floor(drawSize * 0.61),
    Math.floor(drawSize * 0.92),
    Math.floor(drawSize * 0.6),
    Math.floor(drawSize * 0.82),
    Math.floor(drawSize * 0.38),
    Math.floor(drawSize * 0.82),
    Math.floor(drawSize * 0.9)
  ];

  for (let index = 0; index < letterCount; index += 1) {
    positions.push(cursorX);
    if (type === "great") {
      cursorX += greatAdvances[index] ?? Math.floor(drawSize * (2 / 3));
    } else if (type === "counter") {
      cursorX += counterAdvances[index] ?? defaultAdvance;
    } else if (type === "amazing") {
      cursorX += amazingAdvances[index] ?? defaultAdvance;
    } else {
      cursorX += defaultAdvance;
    }
  }

  return positions;
}

function getUiLayout(canvas, actions = [], battleState = null) {
  const margin = Math.max(scaleUi(16), Math.floor(canvas.width * 0.018));
  const panelPadding = ACTION_PANEL_HORIZONTAL_PADDING;
  const inspectPanelReservedWidth = shouldReserveInspectPanelSpace(battleState, actions)
    ? getInspectPanelWidth(canvas, margin) + INSPECT_PANEL_GAP
    : 0;
  const battleCardHeight = scaleUi(78);
  const battleCardWidth = Math.min(
    Math.max(scaleUi(360), Math.floor(canvas.width / 3)),
    Math.max(scaleUi(280), canvas.width - margin * 2 - inspectPanelReservedWidth)
  );
  const bottomInset = Math.max(scaleUi(20), Math.floor(canvas.height * 0.008) + scaleUi(16));
  const actionPanelMetrics = getActionPanelMetrics({
    width: Math.max(0, canvas.width - margin * 2 - inspectPanelReservedWidth),
    height: canvas.height
  }, actions);
  const battleCard = {
    x: margin,
    y: margin,
    width: battleCardWidth,
    height: battleCardHeight
  };
  const actionPanel = {
    x: margin,
    y: canvas.height - bottomInset - actionPanelMetrics.height - MODE_TOGGLE_HEIGHT - MODE_TOGGLE_GAP - ACTION_PANEL_LIFT,
    width: actionPanelMetrics.width,
    height: actionPanelMetrics.height
  };

  return {
    margin,
    panelPadding,
    battleCard,
    actionPanel,
    smallTextScale: 2
  };
}

function getModeButtons(layout, battleState) {
  const y = layout.actionPanel.y + layout.actionPanel.height + MODE_TOGGLE_GAP;
  const firstActionX = layout.actionPanel.x + ACTION_PANEL_HORIZONTAL_PADDING;
  const secondActionX = firstActionX + MODE_TOGGLE_WIDTH + ACTION_BUTTON_GAP;
  return [
    {
      id: "play",
      label: t("ui_mode_play"),
      x: firstActionX,
      y,
      width: MODE_TOGGLE_WIDTH,
      height: MODE_TOGGLE_HEIGHT,
      selected: battleState.uiMode !== "inspect",
      fill: "#2f6f43"
    },
    {
      id: "inspect",
      label: t("ui_mode_inspect"),
      x: secondActionX,
      y,
      width: MODE_TOGGLE_WIDTH,
      height: MODE_TOGGLE_HEIGHT,
      selected: battleState.uiMode === "inspect",
      fill: "#9d874e"
    }
  ];
}

function getDebugButtons(layout, battleState) {
  if (!battleState?.devModeEnabled) {
    return [];
  }

  const buttonIds = [
    { id: "kill-all", label: t("debug_kill_all"), fill: "#7d3535" },
    { id: "teleport", label: t("debug_teleport"), fill: "#35577d" },
    { id: "refill-all", label: t("debug_refill_all"), fill: "#3f6f46" },
    { id: "slow-mo", label: t("debug_slow_mo"), fill: battleState?.debugSlowMo ? "#8f6ac9" : "#4d4165" },
    { id: "skip-turn", label: t("debug_skip_turn"), fill: "#6b4b2d" },
    { id: "counter-feedback", label: t("debug_counter_feedback"), fill: "#6e3f2d" }
  ];

  if (battleState?.player?.characterId === "kostya") {
    buttonIds.push({ id: "kostya-counter-egg", label: t("debug_kostya_counter_egg"), fill: "#8b6b2d" });
  }

  let x = layout.margin;
  const y = layout.battleCard.y + layout.battleCard.height + scaleUi(10);

  return buttonIds.map((button) => {
    const width = Math.max(scaleUi(82), measurePixelTextWidth(button.label, 1) + DEBUG_BUTTON_PADDING * 2);
    const entry = {
      ...button,
      x,
      y,
      width,
      height: DEBUG_BUTTON_HEIGHT
    };
    x += width + DEBUG_BUTTON_GAP;
    return entry;
  });
}

function shouldReserveInspectPanelSpace(battleState, actions) {
  if (battleState?.uiMode !== "inspect") {
    return false;
  }

  return actions.some((action) => action.id === battleState.inspectedActionId && action.actionType !== "menu-back");
}

function getActionButtons(layout, battleState, actions) {
  const disabled = !canUsePlayerAction(battleState);
  const { squareSize } = getActionPanelMetrics(layout.actionPanel, actions);
  const scrollMetrics = getActionScrollMetrics(layout, actions);
  const scrollOffset = Math.max(0, Math.min(scrollMetrics.maxOffset, battleState.actionScrollOffset ?? 0));
  const startX = layout.actionPanel.x + ACTION_PANEL_HORIZONTAL_PADDING - scrollOffset;
  const startY = layout.actionPanel.y + Math.floor((layout.actionPanel.height - squareSize) / 2);
  const mainActions = actions.filter((action) => action.actionType !== "menu-back");
  const backAction = actions.find((action) => action.actionType === "menu-back");
  const buttons = mainActions.map((action, index) => ({
    id: action.id,
    iconId: action.iconId ?? action.id,
    label: action.label ?? t(action.labelKey),
    labelScale: action.labelScale,
    detail: getActionDetailLabel(action, battleState),
    x: startX + index * (squareSize + ACTION_BUTTON_GAP),
    y: startY,
    width: squareSize,
    height: squareSize,
    isScrollable: true,
    allowDisabledClick: action.disabledInSolo === true,
    disabled: disabled
      || (action.id === "defend" && !canJacobUseDefend(battleState.player))
      || (action.id === "health-insurance" && (battleState.player.actionsRemaining ?? 0) !== (battleState.player.turnStartActionsRemaining ?? 0))
      || (action.id === "deep-focus" && (battleState.player.actionsRemaining ?? 0) !== (battleState.player.turnStartActionsRemaining ?? 0))
      || (action.id === "action-recall" && (battleState.player.actionRecallReady || battleState.player.pendingActionRecall))
      || (action.disabledInSolo === true)
      || (["shadow", "ghost", "wraith"].includes(action.id) && battleState.player.characterId === "kostya" && (battleState.player.shadow?.hp ?? 0) > 0)
      || (action.requiresShadow === true && (battleState.player.shadow?.hp ?? 0) <= 0)
      || (action.requiresTarget && getTargetableEnemiesForAction(battleState, action.id).length === 0)
      || (battleState.pendingTargetActionId !== null && battleState.pendingTargetActionId !== action.id)
      || ((action.costSp ?? 0) > (battleState.player.sp ?? 0))
      || ((action.minShadowCharge ?? action.costShadowCharge ?? 0) > (battleState.player.shadowCharge ?? 0))
      || ((action.minLuckyCharges ?? action.costLucky ?? 0) > (battleState.player.luckyCharges ?? 0))
  }));

  if (backAction) {
    buttons.push({
      id: backAction.id,
      iconId: backAction.iconId ?? backAction.id,
      label: t(backAction.labelKey),
      detail: "",
      x: layout.actionPanel.x + layout.actionPanel.width - Math.floor(SUBMENU_BACK_SIZE / 2),
      y: layout.actionPanel.y - Math.floor(SUBMENU_BACK_SIZE / 2),
      width: SUBMENU_BACK_SIZE,
      height: SUBMENU_BACK_SIZE,
      isScrollable: false,
      disabled: false
    });
  }

  return buttons;
}

function getActionPanelMetrics(bounds, actions) {
  const actionCount = Math.max(1, actions.filter((action) => action.actionType !== "menu-back").length);
  const availableWidth = Math.max(0, bounds.width - ACTION_PANEL_HORIZONTAL_PADDING * 2);
  const maxSquareFromWidth = Math.floor((availableWidth - Math.max(0, actionCount - 1) * ACTION_BUTTON_GAP) / actionCount);
  const squareSize = Math.max(
    ACTION_BUTTON_MIN_SIZE,
    Math.min(
      ACTION_BUTTON_MAX_SIZE,
      maxSquareFromWidth || ACTION_BUTTON_MAX_SIZE
    )
  );

  return {
    squareSize,
    width: Math.min(
      bounds.width,
      ACTION_PANEL_HORIZONTAL_PADDING * 2 + actionCount * squareSize + Math.max(0, actionCount - 1) * ACTION_BUTTON_GAP
    ),
    height: ACTION_PANEL_VERTICAL_PADDING * 2 + squareSize
  };
}

function getActionScrollMetrics(layout, actions) {
  const actionCount = Math.max(1, actions.filter((action) => action.actionType !== "menu-back").length);
  const { squareSize } = getActionPanelMetrics(layout.actionPanel, actions);
  const visibleWidth = Math.max(0, layout.actionPanel.width - ACTION_PANEL_HORIZONTAL_PADDING * 2);
  const contentWidth = actionCount * squareSize + Math.max(0, actionCount - 1) * ACTION_BUTTON_GAP;

  return {
    visibleWidth,
    contentWidth,
    maxOffset: Math.max(0, contentWidth - visibleWidth)
  };
}

function isPointInsideActionStrip(x, y, layout) {
  const stripX = layout.actionPanel.x + ACTION_PANEL_HORIZONTAL_PADDING;
  const stripY = layout.actionPanel.y + ACTION_PANEL_VERTICAL_PADDING;
  const stripWidth = Math.max(0, layout.actionPanel.width - ACTION_PANEL_HORIZONTAL_PADDING * 2);
  const stripHeight = Math.max(0, layout.actionPanel.height - ACTION_PANEL_VERTICAL_PADDING * 2);

  return x >= stripX && x <= stripX + stripWidth && y >= stripY && y <= stripY + stripHeight;
}

function getInspectPanelWidth(canvas, margin) {
  return Math.min(INSPECT_PANEL_WIDTH, Math.max(scaleUi(196), canvas.width - margin * 2));
}

function canUsePlayerAction(battleState) {
  return (
    !battleState.battleOver &&
    battleState.turnOwner === "player" &&
    battleState.phase === "player-turn" &&
    battleState.player.actionsRemaining > 0 &&
    !battleState.dodgeCheck?.active &&
    !battleState.actionCheck?.active &&
    battleState.enemies.some((enemy) => enemy.hp > 0)
  );
}

function drawPanel(context, x, y, width, height) {
  context.fillStyle = CONTAINER_FILL;
  context.fillRect(x, y, width, height);

  context.fillStyle = CONTAINER_STROKE;
  context.fillRect(x + 2, y + 2, width - 4, 2);
  context.fillRect(x + 2, y + height - 4, width - 4, 2);
  context.fillRect(x + 2, y + 2, 2, height - 4);
  context.fillRect(x + width - 4, y + 2, 2, height - 4);
}

function drawBattleCard(context, layout, battleState) {
  const portraitSize = scaleUi(56);
  const portraitColumnWidth = scaleUi(66);
  const portraitX = layout.battleCard.x + scaleUi(10) + Math.floor((portraitColumnWidth - portraitSize) / 2);
  const portraitY = layout.battleCard.y + Math.floor((layout.battleCard.height - portraitSize) / 2) - scaleUi(1);
  const barLabelX = layout.battleCard.x + scaleUi(82);
  const barX = barLabelX;
  const barWidth = Math.max(scaleUi(92), layout.battleCard.width - (barX - layout.battleCard.x) - scaleUi(20));
  const outerInset = scaleUi(12);
  const headerY = layout.battleCard.y + outerInset;
  const nameScale = 2;
  const levelScale = 1;
  const levelLabel = `${t("ui_level_short")} ${battleState.level}`;
  const nameX = barX + scaleUi(4);
  const levelX = nameX + measurePixelTextWidth(battleState.player.name, nameScale) + scaleUi(10);
  const hpRatio = battleState.player.hp / battleState.player.maxHp;
  const spRatio = battleState.player.sp / battleState.player.maxSp;
  const hasLuckyCharges = (battleState.player.maxLuckyCharges ?? 0) > 0;
  const hasShadowCharge = (battleState.player.maxShadowCharge ?? 0) > 0;
  const totalBars = 2 + (hasLuckyCharges ? 1 : 0) + (hasShadowCharge ? 1 : 0);
  const totalBarSlots = Math.max(3, totalBars);
  const barHeight = scaleUi(11);
  const barGap = scaleUi(3);
  const barBlockHeight = totalBarSlots * barHeight + Math.max(0, totalBarSlots - 1) * barGap;
  const barBlockTop = layout.battleCard.y + layout.battleCard.height - outerInset - barBlockHeight;
  const attributeEntries = getPlayerAttributesForDraw(battleState.player);
  const attributeRowY = layout.battleCard.y + layout.battleCard.height - scaleUi(8);
  const luckyRatio = hasLuckyCharges
    ? battleState.player.luckyCharges / battleState.player.maxLuckyCharges
    : 0;
  const shadowRatio = hasShadowCharge
    ? battleState.player.shadowCharge / battleState.player.maxShadowCharge
    : 0;

  drawPanel(context, layout.battleCard.x, layout.battleCard.y, layout.battleCard.width, layout.battleCard.height);
  drawPortraitIcon(context, portraitX, portraitY, portraitSize);
  drawPixelText(context, battleState.player.name, nameX, headerY, nameScale, TEXT_COLOR, "left");
  drawPixelText(context, levelLabel, levelX, headerY + scaleUi(3), levelScale, MUTED_TEXT_COLOR, "left");
  drawPlayerAttributeContainer(context, attributeEntries, barX, attributeRowY);
  drawPlayerAttributeRow(context, attributeEntries, barX, attributeRowY);
  drawInsideValueBar(context, {
    text: `${battleState.player.hp}/${battleState.player.maxHp} ${t("ui_hp_short")}`,
    x: barX,
    y: barBlockTop,
    width: barWidth,
    height: scaleUi(11),
    ratio: hpRatio,
    fillColor: BATTLE_CARD_BAR_HP
  });
  drawInsideValueBar(context, {
    text: `${battleState.player.sp}/${battleState.player.maxSp} ${t("ui_sp_short")}`,
    x: barX,
    y: barBlockTop + barHeight + barGap,
    width: barWidth,
    height: scaleUi(11),
    ratio: spRatio,
    fillColor: BATTLE_CARD_BAR_SP
  });

  if (hasLuckyCharges) {
    drawInsideValueBar(context, {
      text: `${battleState.player.luckyCharges}/${battleState.player.maxLuckyCharges} ${t("ui_lc_short")}`,
      x: barX,
      y: barBlockTop + (barHeight + barGap) * 2,
      width: barWidth,
      height: scaleUi(11),
      ratio: luckyRatio,
      fillColor: BATTLE_CARD_BAR_LC,
      icon: { sheet: "patrick-indicator", row: 1, column: 4 }
    });
  }

  if (hasShadowCharge) {
    drawInsideValueBar(context, {
      text: `${Math.round(battleState.player.shadowCharge ?? 0)}% ${t("ui_sh_short")}`,
      x: barX,
      y: barBlockTop + (barHeight + barGap) * (hasLuckyCharges ? 3 : 2),
      width: barWidth,
      height: scaleUi(11),
      ratio: shadowRatio,
      fillColor: BATTLE_CARD_BAR_SC,
      icon: { sheet: "attribute", row: 2, column: 2 }
    });
  }
}

function drawEnemyHpLabel(context, enemy, index) {
  const position = getEnemyPosition(index);
  const ratio = enemy.hp / enemy.maxHp;
  const spriteCenterX = (position.x * TILE_SIZE) + Math.floor((3 * TILE_SIZE) / 2) + Math.floor((enemy?.renderOffsetX ?? 0));
  const x = Math.floor(spriteCenterX - (ENEMY_BAR_WIDTH / 2));
  const y = Math.floor(position.y * TILE_SIZE + (3 * TILE_SIZE) + scaleUi(8));
  const label = `${enemy.hp}`;

  drawFlatBar(context, x, y, ENEMY_BAR_WIDTH, ENEMY_BAR_HEIGHT, ratio, ENEMY_BAR_COLOR);
  drawEnemyAttributes(context, enemy, x, y + ENEMY_BAR_HEIGHT + scaleUi(3));
  drawPixelText(context, label, x + ENEMY_BAR_WIDTH, y + ENEMY_BAR_HEIGHT + scaleUi(5), 1, TEXT_COLOR, "right");
}

function drawEnemyAttributes(context, enemy, leftX, y) {
  const attributes = getEnemyAttributesForDraw(enemy);
  if (attributes.length === 0) {
    return;
  }

  let drawX = leftX;

  attributes.forEach((attribute) => {
    drawEnemyAttributeIcon(context, attribute, drawX, y);
    drawX += getEnemyAttributeDrawWidth(attribute) + ATTRIBUTE_ICON_GAP;
  });
}

function getPlayerAttributesForDraw(player) {
  if (!player) {
    return [];
  }

  const attributes = [];
  const defenseValue = player.characterId === JACOB_CHARACTER_ID
    ? Math.max(0, Math.floor(Number(getJacobDefenseValue(player, (player?.shadow?.hp ?? 0) > 0 ? 1 : 0, player?.currentGlobalTurn ?? 0)) || 0))
    : Math.max(0, Math.floor(Number(player?.attributes?.defense) || 0));

  if (defenseValue > 0) {
    attributes.push({
      id: ENEMY_ATTRIBUTE_DEFENSE,
      value: defenseValue,
      label: t("ui_defense_short")
    });
  }

  if (player?.attributes?.mobile === true) {
    attributes.push({
      id: ENEMY_ATTRIBUTE_MOBILE,
      label: t("ui_mobile_short")
    });
  }

  return attributes;
}

function drawPlayerAttributeRow(context, attributes, x, y) {
  if (!attributes?.length) {
    return;
  }

  let drawX = x;
  attributes.forEach((attribute) => {
    drawPlayerAttribute(context, attribute, drawX, y);
    drawX += getPlayerAttributeWidth(attribute) + scaleUi(10);
  });
}

function drawPlayerAttributeContainer(context, attributes, x, y) {
  if (!attributes?.length) {
    return;
  }

  const contentWidth = attributes.reduce((sum, attribute, index) => {
    return sum + getPlayerAttributeWidth(attribute) + (index > 0 ? scaleUi(10) : 0);
  }, 0);
  const containerX = x - scaleUi(6);
  const containerY = y - scaleUi(4);
  const containerWidth = contentWidth + scaleUi(12);
  const containerHeight = scaleUi(22);

  context.fillStyle = CONTAINER_FILL;
  context.fillRect(containerX, containerY, containerWidth, containerHeight);
  context.fillStyle = CONTAINER_STROKE;
  context.fillRect(containerX + 2, containerY + 2, containerWidth - 4, 2);
  context.fillRect(containerX + 2, containerY + containerHeight - 4, containerWidth - 4, 2);
  context.fillRect(containerX + 2, containerY + 2, 2, containerHeight - 4);
  context.fillRect(containerX + containerWidth - 4, containerY + 2, 2, containerHeight - 4);
}

function drawPlayerAttribute(context, attribute, x, y) {
  const sprite = ENEMY_ATTRIBUTE_ICON_MAP[attribute.id];
  if (!sprite) {
    return;
  }

  const iconSize = attribute.id === ENEMY_ATTRIBUTE_DEFENSE ? scaleUi(12) : ATTRIBUTE_ICON_DRAW_SIZE;
  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    attributeImage,
    (sprite.column - 1) * ATTRIBUTE_ICON_TILE_SIZE,
    (sprite.row - 1) * ATTRIBUTE_ICON_TILE_SIZE,
    ATTRIBUTE_ICON_TILE_SIZE,
    ATTRIBUTE_ICON_TILE_SIZE,
    x,
    y,
    iconSize,
    iconSize
  );
  context.restore();

  let textX = x + iconSize + scaleUi(3);
  if ((attribute.value ?? 0) > 0) {
    drawPixelText(context, String(attribute.value), textX, y + scaleUi(3), 1, TEXT_COLOR, "left");
    textX += measurePixelTextWidth(String(attribute.value), 1) + scaleUi(4);
  }
  drawPixelText(context, attribute.label ?? "", textX, y + scaleUi(3), 1, TEXT_COLOR, "left");
}

function getPlayerAttributeWidth(attribute) {
  const iconSize = attribute.id === ENEMY_ATTRIBUTE_DEFENSE ? scaleUi(12) : ATTRIBUTE_ICON_DRAW_SIZE;
  const valueWidth = (attribute.value ?? 0) > 0
    ? measurePixelTextWidth(String(attribute.value), 1) + scaleUi(4)
    : 0;
  const labelWidth = measurePixelTextWidth(attribute.label ?? "", 1);
  return iconSize + scaleUi(3) + valueWidth + labelWidth;
}

function drawEnemyAttributeIcon(context, attribute, x, y) {
  const sprite = ENEMY_ATTRIBUTE_ICON_MAP[attribute.id];
  if (!sprite) {
    return;
  }

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    attributeImage,
    (sprite.column - 1) * ATTRIBUTE_ICON_TILE_SIZE,
    (sprite.row - 1) * ATTRIBUTE_ICON_TILE_SIZE,
    ATTRIBUTE_ICON_TILE_SIZE,
    ATTRIBUTE_ICON_TILE_SIZE,
    x,
    y,
    ATTRIBUTE_ICON_DRAW_SIZE,
    ATTRIBUTE_ICON_DRAW_SIZE
  );
  context.restore();

  if (attribute.id === ENEMY_ATTRIBUTE_DEFENSE && (attribute.value ?? 0) > 0) {
    drawPixelText(context, String(attribute.value), x + ATTRIBUTE_ICON_DRAW_SIZE + 2, y + scaleUi(5), 1, TEXT_COLOR, "left");
  }
}

function getEnemyAttributeDrawWidth(attribute) {
  if (attribute.id === ENEMY_ATTRIBUTE_DEFENSE && (attribute.value ?? 0) > 0) {
    return ATTRIBUTE_ICON_DRAW_SIZE + 2 + measurePixelTextWidth(String(attribute.value), 1);
  }

  return ATTRIBUTE_ICON_DRAW_SIZE;
}

function getEnemyAttributesForDraw(enemy) {
  if (!enemy?.attributes) {
    return [];
  }

  const attributes = [];
  if ((enemy.attributes.defense ?? 0) > 0) {
    attributes.push({ id: ENEMY_ATTRIBUTE_DEFENSE, value: enemy.attributes.defense });
  }
  if (enemy.attributes.fireImmunity === true) {
    attributes.push({ id: ENEMY_ATTRIBUTE_FIRE_IMMUNITY });
  }
  if (enemy.attributes.flying === true) {
    attributes.push({ id: ENEMY_ATTRIBUTE_FLYING });
  }
  if (enemy.attributes.mobile === true) {
    attributes.push({ id: ENEMY_ATTRIBUTE_MOBILE });
  }
  if (enemy.attributes.repeatable === true) {
    attributes.push({ id: ENEMY_ATTRIBUTE_REPEATABLE });
  }
  return attributes;
}

function drawShadowHpLabel(context, shadow) {
  const anchor = getPlayerCompanionUiAnchor(0, shadow);
  const spriteCenterX = anchor.x * TILE_SIZE;
  const y = (anchor.y * TILE_SIZE) - scaleUi(12);
  const hpRatio = shadow.hp / shadow.maxHp;
  const shpRatio = (shadow.maxShp ?? 0) > 0 ? (shadow.shp ?? 0) / shadow.maxShp : 0;
  const roundedShp = Math.max(0, Math.floor(shadow.shp ?? 0));
  const hpLabel = String(Math.round(shadow.hp) + roundedShp);
  const labelColor = roundedShp > 0 ? SHADOW_BAR_SHP : TEXT_COLOR;
  const x = Math.floor(spriteCenterX - (ENEMY_BAR_WIDTH / 2));

  drawFlatBar(context, x, y, ENEMY_BAR_WIDTH, ENEMY_BAR_HEIGHT, hpRatio, SHADOW_BAR_HP);

  if ((shadow.maxShp ?? 0) > 0) {
    const innerX = x + 2;
    const innerY = y + 2;
    const innerWidth = ENEMY_BAR_WIDTH - 4;
    const overlayHeight = ENEMY_BAR_HEIGHT - 4;
    context.fillStyle = SHADOW_BAR_SHP;
    context.fillRect(innerX, innerY, Math.max(0, Math.floor(innerWidth * shpRatio)), overlayHeight);
  }

  drawEnemyAttributes(context, shadow, x, y + ENEMY_BAR_HEIGHT + scaleUi(3));
  drawPixelText(context, hpLabel, x + ENEMY_BAR_WIDTH, y + ENEMY_BAR_HEIGHT + scaleUi(5), 1, labelColor, "right");
}

function drawFlatBar(context, x, y, width, height, ratio, fillColor) {
  context.fillStyle = BAR_BACKGROUND;
  context.fillRect(x, y, width, height);

  context.fillStyle = fillColor;
  context.fillRect(x + 2, y + 2, Math.max(0, Math.floor((width - 4) * ratio)), height - 4);
}

function drawInsideValueBar(context, { text, x, y, width, height, ratio, fillColor, icon = null }) {
  drawFlatBar(context, x, y, width, height, ratio, fillColor);
  if (!icon) {
    drawPixelText(context, text, x + Math.floor(width / 2), y + Math.max(1, Math.floor((height - 7) / 2)), 1, TEXT_COLOR, "center");
    return;
  }

  const iconDrawSize = 8;
  const textWidth = measurePixelTextWidth(text, 1);
  const gap = 3;
  const contentWidth = iconDrawSize + gap + textWidth;
  const contentX = x + Math.floor((width - contentWidth) / 2);
  const iconY = y + 1;
  drawInlineBarIcon(context, icon, contentX, iconY, iconDrawSize);
  drawPixelText(context, text, contentX + iconDrawSize + gap, y + Math.max(1, Math.floor((height - 7) / 2)), 1, TEXT_COLOR, "left");
}

function drawInlineBarIcon(context, icon, x, y, size) {
  const sourceImage = icon.sheet === "patrick-indicator"
    ? patrickIndicatorImage
    : icon.sheet === "attribute"
      ? attributeImage
    : icon.sheet === "indicator"
      ? uiIconSheetImage
      : icon.sheet === "jacob"
        ? jacobActionIconImage
        : patrickActionIconImage;
  const tileSize = icon.sheet === "patrick-indicator" || icon.sheet === "attribute" ? 8 : ACTION_ICON_TILE_SIZE;
  if (!sourceImage) {
    return;
  }

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    sourceImage,
    (icon.column - 1) * tileSize,
    (icon.row - 1) * tileSize,
    tileSize,
    tileSize,
    x,
    y,
    size,
    size
  );
  context.restore();
}

function drawDodgeCheck(context, canvas, dodgeCheck) {
  const panelWidth = 276;
  const panelHeight = 48;
  const panelX = Math.floor((canvas.width - panelWidth) / 2);
  const panelY = Math.floor(canvas.height * 0.58);
  const meterX = panelX + 22;
  const meterY = panelY + Math.floor((panelHeight - 16) / 2);
  const meterWidth = panelWidth - 44;
  const meterHeight = 16;
  const innerX = meterX + 2;
  const innerY = meterY + 2;
  const innerWidth = meterWidth - 4;
  const innerHeight = meterHeight - 4;
  const markerX = meterX + Math.floor((dodgeCheck.value / 100) * meterWidth);

  context.fillStyle = DODGE_PANEL_FILL;
  context.fillRect(panelX, panelY, panelWidth, panelHeight);
  context.fillStyle = DODGE_PANEL_STROKE;
  context.fillRect(panelX + 2, panelY + 2, panelWidth - 4, 2);
  context.fillRect(panelX + 2, panelY + panelHeight - 4, panelWidth - 4, 2);
  context.fillRect(panelX + 2, panelY + 2, 2, panelHeight - 4);
  context.fillRect(panelX + panelWidth - 4, panelY + 2, 2, panelHeight - 4);

  context.fillStyle = BAR_BACKGROUND;
  context.fillRect(meterX, meterY, meterWidth, meterHeight);

  if (dodgeCheck.type === "timed") {
    context.save();
    const timedDisplayTier = dodgeCheck.timedDisplayTier ?? dodgeCheck.timedTier;
    if (timedDisplayTier === "green" || timedDisplayTier === "counter") {
      context.globalAlpha = 1;
      context.fillStyle = dodgeCheck.timedSuccessColor === "counter" ? DODGE_COUNTER : DODGE_GREEN;
      context.fillRect(innerX, innerY, innerWidth, innerHeight);
    } else if (timedDisplayTier === "yellow") {
      context.globalAlpha = 1;
      context.fillStyle = DODGE_YELLOW;
      context.fillRect(innerX, innerY, innerWidth, innerHeight);
    }
    context.restore();
    return;
  }

  if (typeof dodgeCheck.counterStart === "number" && typeof dodgeCheck.counterEnd === "number") {
    const leftYellowStartX = innerX + Math.round((dodgeCheck.leftYellowStart / 100) * innerWidth);
    const leftYellowEndX = innerX + Math.round((dodgeCheck.leftYellowEnd / 100) * innerWidth);
    const leftGreenStartX = innerX + Math.round((dodgeCheck.leftGreenStart / 100) * innerWidth);
    const leftGreenEndX = innerX + Math.round((dodgeCheck.leftGreenEnd / 100) * innerWidth);
    const counterStartX = innerX + Math.round((dodgeCheck.counterStart / 100) * innerWidth);
    const counterEndX = innerX + Math.round((dodgeCheck.counterEnd / 100) * innerWidth);
    const rightGreenStartX = innerX + Math.round((dodgeCheck.rightGreenStart / 100) * innerWidth);
    const rightGreenEndX = innerX + Math.round((dodgeCheck.rightGreenEnd / 100) * innerWidth);
    const rightYellowStartX = innerX + Math.round((dodgeCheck.rightYellowStart / 100) * innerWidth);
    const rightYellowEndX = innerX + Math.round((dodgeCheck.rightYellowEnd / 100) * innerWidth);

    if (dodgeCheck.counterOnly !== true) {
      context.fillStyle = DODGE_YELLOW;
      context.fillRect(leftYellowStartX, innerY, Math.max(0, leftYellowEndX - leftYellowStartX), innerHeight);
      context.fillRect(rightYellowStartX, innerY, Math.max(0, rightYellowEndX - rightYellowStartX), innerHeight);
      context.fillStyle = DODGE_GREEN;
      context.fillRect(leftGreenStartX, innerY, Math.max(0, leftGreenEndX - leftGreenStartX), innerHeight);
      context.fillRect(rightGreenStartX, innerY, Math.max(0, rightGreenEndX - rightGreenStartX), innerHeight);
    }
    context.fillStyle = DODGE_COUNTER;
    context.fillRect(counterStartX, innerY, Math.max(0, counterEndX - counterStartX), innerHeight);
    context.fillStyle = DODGE_MARKER;
    context.fillRect(markerX - 1, meterY - 3, 3, meterHeight + 6);
    return;
  }

  const greenX = innerX + Math.round((dodgeCheck.greenStart / 100) * innerWidth);
  const greenEndX = innerX + Math.round((dodgeCheck.greenEnd / 100) * innerWidth);
  const greenWidth = Math.max(0, greenEndX - greenX);
  const yellowPaddingPx = Math.round((Math.max(0, dodgeCheck.yellowEnd - dodgeCheck.greenEnd) / 100) * innerWidth);
  const yellowX = Math.max(innerX, greenX - yellowPaddingPx);
  const yellowEndX = Math.min(innerX + innerWidth, greenEndX + yellowPaddingPx);
  const leftYellowWidth = Math.max(0, greenX - yellowX);
  const rightYellowWidth = Math.max(0, yellowEndX - greenEndX);

  context.fillStyle = DODGE_YELLOW;
  if (leftYellowWidth > 0) {
    context.fillRect(yellowX, innerY, leftYellowWidth, innerHeight);
  }
  if (rightYellowWidth > 0) {
    context.fillRect(greenEndX, innerY, rightYellowWidth, innerHeight);
  }
  context.fillStyle = DODGE_GREEN;
  context.fillRect(greenX, innerY, greenWidth, innerHeight);
  context.fillStyle = DODGE_MARKER;
  context.fillRect(markerX - 1, meterY - 3, 3, meterHeight + 6);
}

function drawActionCheck(context, canvas, actionCheck) {
  const panelWidth = 276;
  const panelHeight = 48;
  const panelX = Math.floor((canvas.width - panelWidth) / 2);
  const panelY = Math.floor(canvas.height * 0.58);
  const meterX = panelX + 22;
  const meterY = panelY + Math.floor((panelHeight - 16) / 2);
  const meterWidth = panelWidth - 44;
  const meterHeight = 16;
  const innerX = meterX + 2;
  const innerY = meterY + 2;
  const innerWidth = meterWidth - 4;
  const innerHeight = meterHeight - 4;
  const markerX = meterX + Math.floor((actionCheck.value / 100) * meterWidth);

  context.fillStyle = DODGE_PANEL_FILL;
  context.fillRect(panelX, panelY, panelWidth, panelHeight);
  context.fillStyle = DODGE_PANEL_STROKE;
  context.fillRect(panelX + 2, panelY + 2, panelWidth - 4, 2);
  context.fillRect(panelX + 2, panelY + panelHeight - 4, panelWidth - 4, 2);
  context.fillRect(panelX + 2, panelY + 2, 2, panelHeight - 4);
  context.fillRect(panelX + panelWidth - 4, panelY + 2, 2, panelHeight - 4);

  context.fillStyle = BAR_BACKGROUND;
  context.fillRect(meterX, meterY, meterWidth, meterHeight);

  if (actionCheck.type === "timed" || actionCheck.type === "timed-tiered") {
    context.save();
    context.globalAlpha = actionCheck.timedOpacity ?? 0.12;
    context.fillStyle = DODGE_GREEN;
    context.fillRect(innerX, innerY, innerWidth, innerHeight);
    context.restore();
    return;
  }

  if (actionCheck.type === "coin-toss-air") {
    context.save();
    if ((actionCheck.timedTransition ?? -1) < 0) {
      context.globalAlpha = 0.12;
      context.fillStyle = DODGE_YELLOW;
      context.fillRect(innerX, innerY, innerWidth, innerHeight);
      context.restore();
      return;
    }

    context.globalAlpha = 1;
    context.fillStyle = DODGE_YELLOW;
    context.fillRect(innerX, innerY, innerWidth, innerHeight);

    const greenAlpha = Math.max(0, Math.min(1, actionCheck.timedTransition ?? 0));
    if (greenAlpha > 0) {
      context.globalAlpha = greenAlpha;
      context.fillStyle = DODGE_GREEN;
      context.fillRect(innerX, innerY, innerWidth, innerHeight);
    }
    context.restore();
    return;
  }

  if (actionCheck.type === "ranged" || actionCheck.type === "revolver") {
    const greenX = innerX + Math.round((actionCheck.greenStart / 100) * innerWidth);
    const greenEndX = innerX + Math.round((actionCheck.greenEnd / 100) * innerWidth);
    const greenWidth = Math.max(0, greenEndX - greenX);

    if (typeof actionCheck.yellowStart === "number" && typeof actionCheck.yellowEnd === "number") {
      const yellowStartX = innerX + Math.round((actionCheck.yellowStart / 100) * innerWidth);
      const yellowEndX = innerX + Math.round((actionCheck.yellowEnd / 100) * innerWidth);
      const leftYellowWidth = Math.max(0, greenX - yellowStartX);
      const rightYellowWidth = Math.max(0, yellowEndX - greenEndX);

      context.fillStyle = DODGE_YELLOW;
      if (leftYellowWidth > 0) {
        context.fillRect(yellowStartX, innerY, leftYellowWidth, innerHeight);
      }
      if (rightYellowWidth > 0) {
        context.fillRect(greenEndX, innerY, rightYellowWidth, innerHeight);
      }
    }

    context.fillStyle = DODGE_GREEN;
    context.fillRect(greenX, innerY, greenWidth, innerHeight);
    context.fillStyle = DODGE_MARKER;
    context.fillRect(markerX - 1, meterY - 3, 3, meterHeight + 6);
    return;
  }

  if (actionCheck.type === "jacob-ball") {
    (actionCheck.windows ?? []).forEach((windowConfig) => {
      const startX = innerX + Math.round((windowConfig.start / 100) * innerWidth);
      const endX = innerX + Math.round((windowConfig.end / 100) * innerWidth);
      const width = Math.max(0, endX - startX);
      context.fillStyle = windowConfig.hit
        ? "#a7f082"
        : windowConfig.resolved
          ? "#425061"
          : DODGE_GREEN;
      context.fillRect(startX, innerY, width, innerHeight);
    });
    context.fillStyle = DODGE_MARKER;
    context.fillRect(markerX - 1, meterY - 3, 3, meterHeight + 6);
    return;
  }

  const greenX = innerX + Math.floor((actionCheck.greenStart / 100) * innerWidth);
  const greenEndX = innerX + Math.floor((actionCheck.greenEnd / 100) * innerWidth);
  const greenWidth = Math.max(0, greenEndX - greenX);

  context.fillStyle = DODGE_GREEN;
  context.fillRect(greenX, innerY, greenWidth, innerHeight);
  context.fillStyle = DODGE_MARKER;
  context.fillRect(markerX - 1, meterY - 3, 3, meterHeight + 6);
}

function drawActionButton(context, button, hoveredActionId, battleState = null) {
  if (button.id.endsWith("-menu-back")) {
    drawActionButtonFrame(context, button.x, button.y, button.width, button.height, BUTTON_ACTIVE_FILL, button, hoveredActionId, battleState);
    drawPixelText(
      context,
      button.label,
      button.x + Math.floor(button.width / 2),
      button.y + Math.floor((button.height - scaleUi(7)) / 2),
      1,
      TEXT_COLOR,
      "center"
    );
    return;
  }

  const fill = button.disabled ? BUTTON_DISABLED_FILL : BUTTON_ACTIVE_FILL;
  const labelLines = String(button.label).split("\n");
  const longestLabelLine = labelLines.reduce((longest, line) => Math.max(longest, line.length), 0);
  const labelScale = Number.isFinite(button.labelScale)
    ? button.labelScale
    : button.id.endsWith("-menu") || labelLines.length > 1 || longestLabelLine > 5
      ? 1
      : 2;
  const rawIconSize = Math.min(ACTION_ICON_SIZE, button.width - 18, button.height - 28);
  const iconSize = getPixelPerfectIconSize(rawIconSize);
  const labelLineHeight = labelScale * 7;
  const labelGap = labelLines.length > 1 ? 2 : 2;
  const labelHeight = labelLines.length * labelLineHeight + Math.max(0, labelLines.length - 1) * labelGap;
  const topPadding = 8;
  const bottomPadding = 10;
  const iconX = button.x + Math.floor((button.width - rawIconSize) / 2);
  const labelY = button.y + button.height - bottomPadding - labelHeight;
  const iconY = button.y + Math.floor((button.height - iconSize) / 2) - 10;
  let currentLabelY = labelY;

  drawActionButtonFrame(context, button.x, button.y, button.width, button.height, fill, button, hoveredActionId, battleState);
  drawActionIcon(context, button.iconId ?? button.id, iconX, iconY, rawIconSize);
  labelLines.forEach((line) => {
    drawPixelText(
      context,
      line,
      button.x + Math.floor(button.width / 2),
      currentLabelY,
      labelScale,
      button.disabled ? BUTTON_TEXT_DISABLED : TEXT_COLOR,
      "center"
    );
    currentLabelY += labelLineHeight + labelGap;
  });
}

function drawModeButton(context, button) {
  const fill = button.selected ? button.fill : "#20262f";
  drawModeButtonFrame(context, button.x, button.y, button.width, button.height, fill, button.selected, button.id);
  drawPixelText(context, button.label, button.x + Math.floor(button.width / 2), button.y + scaleUi(7), 1, TEXT_COLOR, "center");
}

function drawDebugButton(context, button) {
  drawModeButtonFrame(context, button.x, button.y, button.width, button.height, button.fill, true, button.id);
  drawPixelText(context, button.label, button.x + Math.floor(button.width / 2), button.y + scaleUi(7), 1, TEXT_COLOR, "center");
}

function drawModeButtonFrame(context, x, y, width, height, fill, selected, buttonId) {
  context.fillStyle = fill;
  context.fillRect(x, y, width, height);

  const outer = selected
    ? buttonId === "play"
      ? "#8fd39a"
      : "#efe1b2"
    : "#495563";
  const inner = selected ? "rgba(255,255,255,0.18)" : null;
  context.fillStyle = outer;
  context.fillRect(x + 2, y + 2, width - 4, 2);
  context.fillRect(x + 2, y + height - 4, width - 4, 2);
  context.fillRect(x + 2, y + 2, 2, height - 4);
  context.fillRect(x + width - 4, y + 2, 2, height - 4);

  if (inner) {
    context.fillStyle = inner;
    context.fillRect(x + 4, y + 4, width - 8, 1);
    context.fillRect(x + 4, y + height - 5, width - 8, 1);
  }
}

function getActionDetailLabel(action, battleState = null) {
  if (action.itemId) {
    return `x${Math.max(0, Math.floor(Number(action.quantity) || 0))}`;
  }

  if (action.id === "katana") {
    return t("action_hint_damage_only", {
      damage: getKostyaSwordBaseDamage(battleState?.player ?? null)
    });
  }

  const hasCosts = (action.costLucky ?? 0) > 0 || (action.costSp ?? 0) > 0 || (action.costShadowCharge ?? 0) > 0;
  if (hasCosts) {
    const parts = [];
    if ((action.costShadowCharge ?? 0) > 0) {
      parts.push(`${t("ui_sh_short")} ${action.costShadowCharge}%`);
    }
    if ((action.costLucky ?? 0) > 0) {
      parts.push(`${t("ui_lc_short")} ${action.costLucky}`);
    }
    if ((action.costSp ?? 0) > 0) {
      parts.push(`${t("ui_sp_short")} ${action.costSp}`);
    }
    return parts.join(" ");
  }

  if (typeof action.baseDamage === "number") {
    return t("action_hint_damage_bonus", {
      damage: action.baseDamage,
      bonus: action.bonusDamage ?? 0
    });
  }

  return "FREE";
}

function drawStatusChipsForUnit(context, unit, anchor) {
  const statuses = getActiveStatuses(unit);

  if (statuses.length === 0) {
    return;
  }

  const chipMetrics = statuses.map(({ power }) => {
    const numeral = getRomanNumeral(power);
    const width = STATUS_CHIP_HORIZONTAL_PADDING * 2 + STATUS_ICON_DRAW_SIZE;
    return { numeral, width };
  });

  const baseY = Math.floor(anchor.y * TILE_SIZE) - STATUS_CHIP_Y_OFFSET;
  const rowCount = Math.min(3, Math.ceil(statuses.length / STATUS_CHIP_COLUMNS));

  for (let row = 0; row < rowCount; row += 1) {
    const rowStatuses = statuses.slice(row * STATUS_CHIP_COLUMNS, (row + 1) * STATUS_CHIP_COLUMNS);
    const rowMetrics = chipMetrics.slice(row * STATUS_CHIP_COLUMNS, (row + 1) * STATUS_CHIP_COLUMNS);
    const totalWidth = rowMetrics.reduce((sum, chip) => sum + chip.width, 0) + Math.max(0, rowMetrics.length - 1) * STATUS_CHIP_GAP;
    let chipX = Math.floor(anchor.x * TILE_SIZE - totalWidth / 2);
    const chipY = baseY + row * (STATUS_ICON_DRAW_SIZE + STATUS_CHIP_ROW_GAP);

    rowStatuses.forEach((status, index) => {
      const metric = rowMetrics[index];
      drawStatusChip(context, chipX, chipY, status.key, metric.numeral, metric.width);
      chipX += metric.width + STATUS_CHIP_GAP;
    });
  }
}

function drawStatusChip(context, x, y, statusKey, numeral, width) {
  context.save();
  context.imageSmoothingEnabled = false;
  const sprite = STATUS_ICON_MAP[statusKey];
  if (sprite) {
    context.drawImage(
      statusEffectImage,
      (sprite.column - 1) * STATUS_ICON_TILE_SIZE,
      (sprite.row - 1) * STATUS_ICON_TILE_SIZE,
      STATUS_ICON_TILE_SIZE,
      STATUS_ICON_TILE_SIZE,
      x + STATUS_CHIP_HORIZONTAL_PADDING,
      y,
      STATUS_ICON_DRAW_SIZE,
      STATUS_ICON_DRAW_SIZE
    );
  }

  drawPixelText(
    context,
    numeral,
    x + STATUS_CHIP_HORIZONTAL_PADDING + STATUS_ICON_DRAW_SIZE - 2,
    y + STATUS_ICON_DRAW_SIZE - 5,
    1,
    TEXT_COLOR,
    "center"
  );
  context.restore();
}

function getActiveStatuses(unit) {
  if (!unit?.statuses) {
    return [];
  }

  const statuses = STATUS_DRAW_ORDER
    .map((key) => ({ key, ...(unit.statuses[key] ?? { power: 0, turns: 0 }) }))
    .filter((status) => {
      if (status.key === "absorption") {
        return status.power > 0 && status.turns > 0 && (status.points ?? 0) > 0;
      }

      return status.power > 0 && status.turns > 0;
    });

  if (!statuses.some((status) => status.key === "strength")) {
    const naturalStrengthPower = Math.max(0, Math.floor(Number(unit?.naturalStrengthPower) || 0));
    if (naturalStrengthPower > 0) {
      statuses.push({
        key: "strength",
        power: naturalStrengthPower,
        turns: 1
      });
    }
  }

  return statuses.slice(0, 9);
}

function getRomanNumeral(power) {
  return ROMAN_NUMERALS[Math.max(1, Math.min(10, power)) - 1];
}

function getButtonOutline(button, hoveredActionId, battleState = null) {
  const inspectHover = battleState?.uiMode === "inspect" && button.id === hoveredActionId;
  if (inspectHover) {
    return { outer: INSPECT_HOVER_INNER_STROKE, inner: INSPECT_HOVER_STROKE };
  }

  if (button.disabled) {
    return { outer: BUTTON_STROKE, inner: null };
  }

  if (button.id === hoveredActionId) {
    return { outer: BUTTON_HOVER_INNER_STROKE, inner: BUTTON_HOVER_STROKE };
  }

  return { outer: BUTTON_STROKE, inner: null };
}

function drawActionButtonFrame(context, x, y, width, height, fill, button, hoveredActionId, battleState = null) {
  const outline = getButtonOutline(button, hoveredActionId, battleState);
  context.fillStyle = fill;
  context.fillRect(x, y, width, height);

  context.fillStyle = outline.outer;
  context.fillRect(x + 2, y + 2, width - 4, 2);
  context.fillRect(x + 2, y + height - 4, width - 4, 2);
  context.fillRect(x + 2, y + 2, 2, height - 4);
  context.fillRect(x + width - 4, y + 2, 2, height - 4);

  if (outline.inner) {
    context.fillStyle = outline.inner;
    context.fillRect(x + 4, y + 4, width - 8, 2);
    context.fillRect(x + 4, y + height - 6, width - 8, 2);
    context.fillRect(x + 4, y + 4, 2, height - 8);
    context.fillRect(x + width - 6, y + 4, 2, height - 8);
  }
}

function drawActionIcon(context, actionId, x, y, size) {
  const sprite = ACTION_ICON_MAP[actionId];
  if (!sprite) {
    return;
  }

  const drawSize = getPixelPerfectIconSize(size);
  const drawX = Math.floor(x + (size - drawSize) / 2);
  const drawY = Math.floor(y + (size - drawSize) / 2);
  const sourceImage = sprite.sheet === "ui"
    ? uiIconSheetImage
    : sprite.sheet === "item"
      ? itemIconSheetImage
      : sprite.sheet === "jacob"
        ? jacobActionIconImage
      : sprite.sheet === "kostya"
        ? kostyaActionIconImage
      : patrickActionIconImage;
  const tileSize = sprite.sheet === "patrick" || sprite.sheet === "kostya" || sprite.sheet === "jacob"
    ? PATRICK_ACTION_ICON_TILE_SIZE
    : ACTION_ICON_TILE_SIZE;

  if (!sourceImage) {
    return;
  }

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    sourceImage,
    (sprite.column - 1) * tileSize,
    (sprite.row - 1) * tileSize,
    tileSize,
    tileSize,
    drawX,
    drawY,
    drawSize,
    drawSize
  );
  context.restore();
}

function drawUpgradeIcon(context, upgradeId, x, y, size) {
  const upgradeSprite = UPGRADE_ICON_MAP[upgradeId];
  const actionSprite = upgradeSprite ? null : ACTION_ICON_MAP[upgradeId];
  if (!upgradeSprite && !actionSprite) {
    return;
  }

  const drawSize = getPixelPerfectIconSize(size);
  const drawX = Math.floor(x + (size - drawSize) / 2);
  const drawY = Math.floor(y + (size - drawSize) / 2);
  const sourceImage = upgradeSprite
    ? upgradeSprite.sheet === "kostya"
      ? kostyaActionIconImage
      : upgradeSprite.sheet === "jacob"
        ? jacobActionIconImage
      : patrickActionIconImage
    : actionSprite?.sheet === "ui"
      ? uiIconSheetImage
      : actionSprite?.sheet === "item"
        ? itemIconSheetImage
        : actionSprite?.sheet === "jacob"
          ? jacobActionIconImage
        : actionSprite?.sheet === "kostya"
          ? kostyaActionIconImage
        : patrickActionIconImage;
  const tileSize = upgradeSprite
    ? PATRICK_ACTION_ICON_TILE_SIZE
    : actionSprite?.sheet === "patrick" || actionSprite?.sheet === "kostya" || actionSprite?.sheet === "jacob"
      ? PATRICK_ACTION_ICON_TILE_SIZE
      : ACTION_ICON_TILE_SIZE;
  const sprite = upgradeSprite ?? actionSprite;

  if (!sourceImage) {
    return;
  }

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(sourceImage, (sprite.column - 1) * tileSize, (sprite.row - 1) * tileSize, tileSize, tileSize, drawX, drawY, drawSize, drawSize);
  context.restore();
}

function getPixelPerfectIconSize(size) {
  const sourceSize = 16;
  const scale = Math.max(1, Math.floor(size / sourceSize));
  return sourceSize * scale;
}

function drawPortraitIcon(context, x, y, size) {
  const image = getPlayerPortraitImage();
  if (!image) {
    return;
  }

  const sourceSize = Math.max(1, Math.min(image.naturalWidth || image.width || size, image.naturalHeight || image.height || size));
  const scale = Math.max(1, Math.floor(size / sourceSize));
  const drawSize = sourceSize * scale;
  const drawX = Math.floor(x + (size - drawSize) / 2);
  const drawY = Math.floor(y + (size - drawSize) / 2);

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(image, drawX, drawY, drawSize, drawSize);
  context.restore();
}

function drawInspectPanel(context, panel, battleState, actions) {
  const action = actions.find((entry) => entry.id === battleState.inspectedActionId) ?? null;
  if (!action) {
    return;
  }

  drawPanel(context, panel.x, panel.y, panel.width, panel.height);

  const titleY = panel.y + 10;
  drawPixelText(context, t(action.labelKey), panel.x + 10, titleY, 2, TEXT_COLOR, "left");

  const detailLines = getInspectLines(action, battleState);
  let lineY = titleY + 20;
  detailLines.forEach((line) => {
    const wrappedParagraphs = getWrappedInspectParagraphs(line.text, panel.width - 20, INSPECT_BODY_SCALE);
    wrappedParagraphs.forEach((paragraphLines, paragraphIndex) => {
      paragraphLines.forEach((wrappedLine) => {
        drawInspectRichLine(context, wrappedLine, panel.x + 10, lineY, INSPECT_BODY_SCALE);
        lineY += INSPECT_BODY_LINE_HEIGHT;
      });

      if (paragraphIndex < wrappedParagraphs.length - 1) {
        lineY += INSPECT_BODY_PARAGRAPH_GAP;
      }
    });
  });
}

function getInspectPanelLayout(layout, canvas, battleState, actions) {
  const action = actions.find((entry) => entry.id === battleState.inspectedActionId) ?? null;
  const width = getInspectPanelWidth(canvas, layout.margin);
  const detailLines = action ? getInspectLines(action, battleState) : [];
  let contentHeight = 32;

  detailLines.forEach((line) => {
    const wrappedParagraphs = getWrappedInspectParagraphs(line.text, width - 20, INSPECT_BODY_SCALE);
    wrappedParagraphs.forEach((paragraphLines, paragraphIndex) => {
      contentHeight += paragraphLines.length * INSPECT_BODY_LINE_HEIGHT;
      if (paragraphIndex < wrappedParagraphs.length - 1) {
        contentHeight += INSPECT_BODY_PARAGRAPH_GAP;
      }
    });
  });

  const height = Math.max(layout.actionPanel.height, 110, contentHeight + 10);
  const x = canvas.width - layout.margin - width;
  const y = layout.actionPanel.y + layout.actionPanel.height - height;

  return { x, y, width, height };
}

function getInspectLines(action, battleState = null) {
  const inspectId = action.inspectId ?? action.itemId ?? action.id;
  return [
    {
      kind: "text",
      text: t(`inspect_${normalizeInspectId(inspectId)}_description`, getInspectDescriptionVars(action, battleState))
    }
  ];
}

function getInspectDescriptionVars(action, battleState = null) {
  const player = battleState?.player ?? null;
  const inspectId = action.inspectId ?? action.itemId ?? action.id;

  switch (inspectId) {
    case "katana-menu":
      return {
        contains: getKostyaMenuContainsText(KOSTYA_KATANA_MENU_ACTIONS, player, "damage")
      };
    case "casts-menu":
      return {
        contains: getKostyaMenuContainsText(KOSTYA_CASTS_MENU_ACTIONS, player, "resource")
      };
    case "revolver-menu":
      return {
        contains: getPatrickMenuContainsText(PATRICK_REVOLVER_MENU_ACTIONS, player, "damage")
      };
    case "aces-menu":
      return {
        contains: getPatrickAcesMenuContainsText(PATRICK_ACES_MENU_ACTIONS, player)
      };
    case "ball-menu":
      return {
        contains: getJacobMenuContainsText(["kick", "fireball", "slowball", "corner-shot", "volley"], player, "damage")
      };
    case "support-menu":
      return {
        contains: getJacobMenuContainsText(["group-buff", "good-vibes", "goal", "friendly-chatter", "guard"], player)
      };
    case "inventory-menu":
      return {
        contains: getInventoryContainsText(player)
      };
    case "kick":
    case "fireball":
    case "slowball":
      return {
        damage: getJacobBallBaseDamage(player)
      };
    case "corner-shot":
      return {
        damage: getJacobBallBaseDamage(player) * 2
      };
    case "good-vibes":
      return {
        heal: Math.min(16, 8 + ((player?.shadow?.hp ?? 0) > 0 ? 4 : 0))
      };
    case "goal":
      return {
        hp: 50
      };
    case "volley":
      return {
        damage: getJacobBallBaseDamage(player)
      };
    case "coin-flip":
      {
        const luckyChargeGain = getPatrickCoinFlipLuckyChargeGain(player);
        const luckyChargeWord = luckyChargeGain === 1
          ? t("inspect_lucky_charge_word_singular")
          : t("inspect_lucky_charge_word_plural");
      return {
        chance: getPatrickHeadsChancePercent(player),
        luckyChargeGain,
        headsSp: getPatrickCoinFlipConfig(player).headsSp,
        tailsSp: getPatrickCoinFlipConfig(player).tailsSp,
        luckyChargeWord
      };
      }
    case "katana":
      return {
        damage: getKostyaSwordBaseDamage(player)
      };
    case "slash":
      return {
        damage: getKostyaDashBaseDamage(player)
      };
    case "lunge":
      return {
        damage: getKostyaSwordBaseDamage(player),
        splashDamage: Math.max(1, Math.floor(getKostyaSwordBaseDamage(player) / 2))
      };
    case "decay-curse":
      return {
        damage: getKostyaSwordBaseDamage(player)
      };
    case "crippling-stab":
      return {
        damage: getKostyaSwordBaseDamage(player),
        heal: getKostyaSwordBaseDamage(player)
      };
    case "mass-infection":
      return {
        damage: getKostyaSwordBaseDamage(player)
      };
    case "dark-plating":
      return {
        shp: getKostyaShadowBonusHealth(player)
      };
    case "ghost":
      return {
        hp: Math.max(1, Math.floor(getKostyaShadowBaseHp(player) * 2)),
        shp: Math.max(0, Math.floor(getKostyaShadowBonusHealth(player) * 2)),
        damage: Math.max(1, Math.floor(getKostyaSwordBaseDamage(player) * 0.5))
      };
    case "wraith":
      return {
        hp: Math.max(1, Math.floor(getKostyaShadowBaseHp(player) * 0.5)),
        shp: Math.max(0, Math.floor(getKostyaShadowBonusHealth(player) * 0.5)),
        damage: Math.max(1, Math.floor(getKostyaSwordBaseDamage(player) * 2))
      };
    case "shadow":
      return {
        hp: getKostyaShadowBaseHp(player),
        shp: getKostyaShadowBonusHealth(player),
        damage: getKostyaSwordBaseDamage(player)
      };
    case "revolver-shot":
      return {
        damage: getPatrickRevolverBaseDamage(player)
      };
    case "piercing-shot":
      return {
        damage: getPatrickRevolverBaseDamage(player)
      };
    case "hallow-shot":
    case "hollow-shot":
      return {
        damage: getPatrickRevolverBaseDamage(player) * 2
      };
    case "magnum-shot":
      return {
        damage: Math.floor(getPatrickRevolverBaseDamage(player) * 1.2)
      };
    case "six-shooter":
    case "bullet-storm":
      return {
        damage: getPatrickRevolverBaseDamage(player)
      };
    case "coin-toss":
      return {
        damage: getPatrickRevolverBaseDamage(player)
      };
    case "dual-wielding":
    case "quickdrawer":
      return {
        damage: getPatrickRevolverBaseDamage(player)
      };
    case "feelin-fine":
      return {
        cleansedPower: formatRomanNumeral(getPatrickFeelinFineCleansedPower(player))
      };
    case "ace-of-clubs":
      return {
        damage: 4
      };
    default:
      return {};
  }
}

function getPatrickMenuContainsText(actions, player, colorTag) {
  const unlockedLabels = actions
    .filter((action) => action.actionType !== "menu-back" && player?.unlockedActions?.[action.id])
    .map((action) => `[${colorTag}]${t(action.labelKey).replace(/\n/g, " ")}[/${colorTag}]`);

  return unlockedLabels.join(" | ");
}

function getJacobMenuContainsText(actionIds, player, colorTag = null) {
  const labels = actionIds
    .filter((actionId) => actionId === "kick" || player?.unlockedActions?.[actionId])
    .map((actionId) => {
      const labelKey = `action_${actionId.replace(/-/g, "_")}`;
      const translated = t(labelKey).replace(/\n/g, " ");
      return colorTag ? `[${colorTag}]${translated}[/${colorTag}]` : translated;
    });

  return labels.join(" | ");
}

function getKostyaMenuContainsText(actions, player, colorTag) {
  const unlockedLabels = actions
    .filter((action) => action.actionType !== "menu-back" && (action.id === "katana" || player?.unlockedActions?.[action.id]))
    .map((action) => {
      const actionColorTag = action.id === "decay-curse"
        ? "damage"
        : action.id === "deep-focus"
          ? "damage"
          : colorTag;
      return `[${actionColorTag}]${t(action.labelKey).replace(/\n/g, " ")}[/${actionColorTag}]`;
    });

  return unlockedLabels.join(" | ");
}

function getPatrickAcesMenuContainsText(actions, player) {
  const unlockedLabels = actions
    .filter((action) => action.actionType !== "menu-back" && player?.unlockedActions?.[action.id])
    .map((action) => {
      const colorTag = action.id === "health-insurance"
        ? "good"
        : action.id === "ace-of-clubs"
          ? "damage"
          : "yellow";
      return `[${colorTag}]${t(action.labelKey).replace(/\n/g, " ")}[/${colorTag}]`;
    });

  return unlockedLabels.join(" | ");
}

function getInventoryContainsText(player) {
  const inventory = Array.isArray(player?.inventory) ? player.inventory : [];
  const labels = inventory
    .filter((slot) => (slot?.quantity ?? 0) > 0)
    .map((slot) => {
      if (slot.itemId === "burger-item") {
        return `[good]${t("action_burger_item")} x${Math.max(0, Math.floor(Number(slot.quantity) || 0))}[/good]`;
      }
      if (slot.itemId === "bomb-item") {
        return `[bad]${t("action_bomb_item")} x${Math.max(0, Math.floor(Number(slot.quantity) || 0))}[/bad]`;
      }
      if (slot.itemId === "cherry-item") {
        return `[strength]${t("action_cherry_item")} x${Math.max(0, Math.floor(Number(slot.quantity) || 0))}[/strength]`;
      }
      if (slot.itemId === "salad-item") {
        return `[cleansed]${t("action_salad_item")} x${Math.max(0, Math.floor(Number(slot.quantity) || 0))}[/cleansed]`;
      }

      return null;
    })
    .filter(Boolean);

  return labels.length > 0 ? labels.join(" | ") : t("inspect_inventory_empty");
}

function normalizeInspectId(actionId) {
  return String(actionId).replace(/-/g, "_");
}

function wrapInspectText(text, maxWidth, scale = 1) {
  const paragraphs = String(text).toUpperCase().split(/\n+/);
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (measurePixelTextWidth(next, scale) <= maxWidth || !current) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) {
      lines.push(current);
    }
  });

  return lines;
}

function wrapPixelTextAtSize(text, maxWidth, fontSizePx, drawScale = 1, preserveAlpha = false) {
  const paragraphs = String(text).toUpperCase().split(/\n+/);
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (measurePixelTextWidthAtSize(next, fontSizePx, drawScale, preserveAlpha) <= maxWidth || !current) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) {
      lines.push(current);
    }
  });

  return lines;
}

function getWrappedInspectParagraphs(text, maxWidth, scale = 1) {
  return String(text)
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => wrapInspectRichText(paragraph, maxWidth, scale));
}

function getEnemyTargetAtPoint({ x, y, battleState }) {
  const lockedTargetEnemyId = battleState?.lockedTargetEnemyId ?? null;
  const pendingActionId = battleState?.pendingTargetActionId ?? null;

  for (let index = battleState.enemies.length - 1; index >= 0; index -= 1) {
    const enemy = battleState.enemies[index];
    if (
      enemy.hp <= 0
      || (lockedTargetEnemyId && enemy.id !== lockedTargetEnemyId)
      || (pendingActionId && !isEnemyTargetableForAction(battleState, enemy, pendingActionId))
    ) {
      continue;
    }

    const bounds = getEnemyDrawBounds(index, enemy);
    if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
      return { type: "enemy", id: enemy.id };
    }
  }

  return null;
}

function drawEnemyTargetOutline(context, battleState) {
  const targetIndex = battleState.enemies.findIndex((enemy) => enemy.id === battleState.hoveredEnemyId && enemy.hp > 0);

  if (targetIndex < 0) {
    return;
  }

  const enemy = battleState.enemies[targetIndex];
  const bounds = getEnemyDrawBounds(targetIndex, enemy);
  const x = bounds.x - 4;
  const y = bounds.y - 4;
  const width = bounds.width + 8;
  const height = bounds.height + 8;

  context.fillStyle = TARGET_OUTLINE_COLOR;
  context.fillRect(x, y, width, 2);
  context.fillRect(x, y + height - 2, width, 2);
  context.fillRect(x, y, 2, height);
  context.fillRect(x + width - 2, y, 2, height);
}

function drawTargetSelectionPrompt(context, canvas, battleState, layout) {
  const text = battleState.message || t("battle_choose_target_prompt");
  const scale = 1;
  const lines = String(text).split("\n");
  const textWidth = lines.reduce((maxWidth, line) => Math.max(maxWidth, measurePixelTextWidth(line, scale)), 0);
  const width = textWidth + scaleUi(24);
  const lineHeight = scaleUi(10);
  const height = scaleUi(12) + lines.length * lineHeight;
  const x = Math.floor((canvas.width - width) / 2);
  const y = Math.max(scaleUi(96), layout.actionPanel.y - scaleUi(34));

  drawPanel(context, x, y, width, height);
  lines.forEach((line, index) => {
    drawPixelText(
      context,
      line,
      x + Math.floor(width / 2),
      y + scaleUi(7) + index * lineHeight,
      scale,
      TEXT_COLOR,
      "center"
    );
  });
}

function getUpgradeTargetAtPoint({ x, y, canvas, battleState }) {
  const overlay = getUpgradeOverlayLayout(canvas, battleState);

  if (overlay.confirmButton && !overlay.confirmButton.disabled) {
    const button = overlay.confirmButton;
    if (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    ) {
      return { type: "upgrade-confirm", id: button.id };
    }
  }

  for (const card of overlay.cards) {
    if (
      x >= card.x &&
      x <= card.x + card.width &&
      y >= card.y &&
      y <= card.y + card.height
    ) {
      return { type: "upgrade", id: card.id };
    }
  }

  return null;
}

function drawUpgradeOverlay(context, canvas, battleState) {
  const overlay = getUpgradeOverlayLayout(canvas, battleState);
  const isAbilitySelection = battleState.rewardSelectionType === "ability";
  const topHintKey = getUpgradeOverlayTopHintKey(battleState, isAbilitySelection);
  context.save();
  context.fillStyle = "rgba(5,8,12,0.65)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();

  drawPanel(context, overlay.x, overlay.y, overlay.width, overlay.height);
  drawPixelText(context, t(isAbilitySelection ? "ability_title" : "upgrade_title"), overlay.x + Math.floor(overlay.width / 2), overlay.y + 10, 1, TEXT_COLOR, "center");
  drawPixelText(context, t(topHintKey), overlay.x + Math.floor(overlay.width / 2), overlay.y + 24, 1, MUTED_TEXT_COLOR, "center");

  overlay.cards.forEach((card) => drawUpgradeCard(context, card, battleState));

  if (overlay.confirmButton) {
    drawModeButtonFrame(
      context,
      overlay.confirmButton.x,
      overlay.confirmButton.y,
      overlay.confirmButton.width,
      overlay.confirmButton.height,
      overlay.confirmButton.disabled ? BUTTON_DISABLED_FILL : "#36533e",
      !overlay.confirmButton.disabled,
      overlay.confirmButton.id
    );
    drawPixelText(
      context,
      t("ability_confirm_button"),
      overlay.confirmButton.x + Math.floor(overlay.confirmButton.width / 2),
      overlay.confirmButton.y + 7,
      1,
      overlay.confirmButton.disabled ? BUTTON_TEXT_DISABLED : TEXT_COLOR,
      "center"
    );
  }
}

function getUpgradeOverlayTopHintKey(battleState, isAbilitySelection) {
  if (!isAbilitySelection || !battleState.pendingAbilityConfirmId) {
    return isAbilitySelection ? "ability_pick_hint" : "upgrade_pick_hint";
  }

  if (
    battleState.player?.characterId === JACOB_CHARACTER_ID
    && battleState.pendingAbilityConfirmId === "guard"
    && battleState.player?.attributes?.mobile === true
  ) {
    return "ability_confirm_guard_solo_prompt";
  }

  return "ability_confirm_prompt";
}

function getUpgradeOverlayLayout(canvas, battleState) {
  const rewards = battleState.rewardSelectionCatalog ?? battleState.upgradeCatalog ?? [];
  const isAbilitySelection = battleState.rewardSelectionType === "ability";
  const hasConfirmButton = isAbilitySelection;
  const confirmButtonDisabled = !battleState.pendingAbilityConfirmId;
  const width = Math.min(UPGRADE_PANEL_WIDTH, canvas.width - scaleUi(40));
  const cardWidth = Math.floor((width - UPGRADE_PANEL_PADDING * 2 - Math.max(0, rewards.length - 1) * UPGRADE_CARD_GAP) / Math.max(1, rewards.length));
  const cardsY = scaleUi(42);
  const confirmButtonY = cardsY + UPGRADE_CARD_HEIGHT + scaleUi(10);
  const height = hasConfirmButton
    ? confirmButtonY + UPGRADE_CONFIRM_BUTTON_HEIGHT + scaleUi(10)
    : scaleUi(180);
  const x = Math.floor((canvas.width - width) / 2);
  const y = Math.floor((canvas.height - height) / 2);
  const cards = rewards.map((reward, index) => ({
    ...reward,
    x: x + UPGRADE_PANEL_PADDING + index * (cardWidth + UPGRADE_CARD_GAP),
    y: y + cardsY,
    width: cardWidth,
    height: UPGRADE_CARD_HEIGHT
  }));
  const confirmButton = hasConfirmButton
    ? {
      id: battleState.pendingAbilityConfirmId ?? "ability-confirm-disabled",
      disabled: confirmButtonDisabled,
      x: x + Math.floor((width - UPGRADE_CONFIRM_BUTTON_WIDTH) / 2),
      y: y + confirmButtonY,
      width: UPGRADE_CONFIRM_BUTTON_WIDTH,
      height: UPGRADE_CONFIRM_BUTTON_HEIGHT
    }
    : null;

  return { x, y, width, height, cards, confirmButton };
}

function drawUpgradeCard(context, card, battleState) {
  const locked = battleState.rewardSelectionType === "upgrade"
    && card.maxRank !== null
    && (battleState.player.upgrades?.[card.id] ?? 0) >= card.maxRank;
  const selected = battleState.rewardSelectionType === "ability" && battleState.pendingAbilityConfirmId === card.id;
  const fill = locked ? "#1a1f26" : "#1f2732";
  drawPanel(context, card.x, card.y, card.width, card.height);
  context.fillStyle = fill;
  context.fillRect(card.x + 4, card.y + 4, card.width - 8, card.height - 8);
  drawUpgradeCardOutline(context, card, battleState, locked, selected);

  const iconSize = Math.min(UPGRADE_ICON_SIZE, card.width - 24);
  drawUpgradeIcon(
    context,
    card.id,
    card.x + Math.floor((card.width - iconSize) / 2),
    card.y + 14,
    iconSize
  );

  const titleLines = wrapInspectText(t(card.labelKey), card.width - 30, 1);
  const bodyLines = wrapPixelTextAtSize(
    t(card.descriptionKey),
    card.width - 20,
    UPGRADE_DESCRIPTION_FONT_SIZE_PX
  );
  const bodyBlockHeight = bodyLines.length * UPGRADE_DESCRIPTION_LINE_HEIGHT;
  const titleBlockHeight = titleLines.length * 10;
  const bodyStartY = card.y + card.height - 12 - bodyBlockHeight;
  const titleStartY = bodyStartY - 4 - titleBlockHeight;

  titleLines.forEach((line, index) => {
    drawPixelText(context, line, card.x + Math.floor(card.width / 2), titleStartY + index * 10, 1, TEXT_COLOR, "center");
  });

  bodyLines.forEach((line, index) => {
    drawPixelTextAtSize(
      context,
      line,
      card.x + Math.floor(card.width / 2),
      bodyStartY + index * UPGRADE_DESCRIPTION_LINE_HEIGHT,
      UPGRADE_DESCRIPTION_FONT_SIZE_PX,
      UPGRADE_DESCRIPTION_TEXT_COLOR,
      "center"
    );
  });

  if (locked) {
    drawPixelText(context, t("upgrade_locked"), card.x + Math.floor(card.width / 2), card.y + 8, 1, INSPECT_COLOR_BAD, "center");
  }
}

function drawUpgradeCardOutline(context, card, battleState, locked, selected = false) {
  const outline = selected
    ? { outer: BUTTON_HOVER_INNER_STROKE, inner: BUTTON_HOVER_STROKE }
    : getButtonOutline(
      { id: card.id, disabled: locked },
      battleState.hoveredActionId
    );

  context.fillStyle = outline.outer;
  context.fillRect(card.x + 2, card.y + 2, card.width - 4, 2);
  context.fillRect(card.x + 2, card.y + card.height - 4, card.width - 4, 2);
  context.fillRect(card.x + 2, card.y + 2, 2, card.height - 4);
  context.fillRect(card.x + card.width - 4, card.y + 2, 2, card.height - 4);

  if (!outline.inner) {
    return;
  }

  context.fillStyle = outline.inner;
  context.fillRect(card.x + 4, card.y + 4, card.width - 8, 2);
  context.fillRect(card.x + 4, card.y + card.height - 6, card.width - 8, 2);
  context.fillRect(card.x + 4, card.y + 4, 2, card.height - 8);
  context.fillRect(card.x + card.width - 6, card.y + 4, 2, card.height - 8);
}

function getEnemyDrawBounds(index, enemy) {
  const position = getEnemyPosition(index);
  return {
    x: Math.floor(position.x * TILE_SIZE + (enemy?.renderOffsetX ?? 0)),
    y: Math.floor(position.y * TILE_SIZE + (enemy?.renderOffsetY ?? 0)),
    width: TILE_SIZE * 3,
    height: TILE_SIZE * 3
  };
}

function drawInspectRichLine(context, segments, x, y, scale) {
  let cursorX = x;

  segments.forEach((segment) => {
    if (!segment.text) {
      return;
    }

    if (!/^\s+$/.test(segment.text)) {
      drawPixelText(context, segment.text, cursorX, y, scale, segment.color, "left");
    }
    cursorX += measurePixelTextAdvance(segment.text, scale);
  });
}

function wrapInspectRichText(text, maxWidth, scale = 1) {
  const segments = parseInspectRichText(text);
  const tokens = [];

  segments.forEach((segment) => {
    segment.text.split(/([ \t\r\n]+)/).forEach((part) => {
      if (!part) {
        return;
      }

      tokens.push({
        text: part,
        color: segment.color
      });
    });
  });

  const lines = [];
  let currentLine = [];
  let currentWidth = 0;

  tokens.forEach((token) => {
    const tokenWidth = measurePixelTextAdvance(token.text, scale);
    const isWhitespace = /^[ \t\r\n]+$/.test(token.text);

    if (isWhitespace && currentLine.length === 0) {
      return;
    }

    if (!isWhitespace && currentWidth > 0 && currentWidth + tokenWidth > maxWidth) {
      trimTrailingWhitespaceSegments(currentLine);
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentWidth = 0;
    }

    if (isWhitespace && currentLine.length === 0) {
      return;
    }

    currentLine.push(token);
    currentWidth += tokenWidth;
  });

  trimTrailingWhitespaceSegments(currentLine);
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

function parseInspectRichText(text) {
  const source = String(text);
  const segments = [];
  const pattern = /\[(good|bad|resource|info|damage|marked|strength|yellow|cleansed|charge|absorption)\]([\s\S]*?)\[\/\1\]/gi;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: source.slice(lastIndex, match.index), color: INSPECT_BODY_TEXT_COLOR });
    }

    segments.push({
      text: match[2],
      color: INSPECT_INLINE_COLORS[match[1].toLowerCase()] ?? TEXT_COLOR
    });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < source.length) {
    segments.push({ text: source.slice(lastIndex), color: INSPECT_BODY_TEXT_COLOR });
  }

  return segments;
}

function trimTrailingWhitespaceSegments(segments) {
  while (segments.length > 0 && /^\s+$/.test(segments[segments.length - 1].text)) {
    segments.pop();
  }
}
