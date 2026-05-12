import { createPlayerInventoryState } from "../inventory.js";
export const PATRICK_CHARACTER_ID = "patrick";
const PATRICK_FRAME_SIZE = 32;
const PATRICK_IDLE_FRAME = { row: 0, col: 0 };
const PATRICK_FRAME_BOUNDS_PADDING = 1;
const PATRICK_MILESTONE_MAX_RANK = 4;
const PATRICK_MILESTONE_LUCKY_CHARGES_GAIN = 5;
const PATRICK_FEELIN_FINE_CLEANSED_POWER = 3;
const PATRICK_COIN_SP_HEADS = 16;
const PATRICK_COIN_SP_TAILS = 8;
const PATRICK_COIN_WEAKNESS_POWER = 1;
const PATRICK_COIN_WEAKNESS_TURNS = 2;
const PATRICK_REVOLVER_DAMAGE = 10;
const PATRICK_MARKED_DAMAGE_STEP = 0.05;
const BULLET_ENHANCEMENT_DAMAGE_GAIN = 2;
const LUCK_EXPERTISE_HEADS_CHANCE_STEP = 0.01;
const LUCK_EXPERTISE_LUCKY_CHARGE_GAIN_STEP = 0.05;
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const PATRICK_STARTING_STATS = {
  hp: 30,
  maxHp: 30,
  sp: 0,
  maxSp: 100,
  luckyCharges: 0,
  maxLuckyCharges: 5,
  baseActionsPerTurn: 1
};
export const PATRICK_NEGATIVE_STATUS_KEYS = ["weakness", "slowness", "stunned", "decaying", "poison", "fire"];
export const PATRICK_ACTION_ICON_MAP = {
  "coin-flip": { sheet: "patrick", row: 1, column: 1 },
  "revolver-menu": { sheet: "patrick", row: 1, column: 2 },
  "revolver-menu-back": { sheet: "patrick", row: 1, column: 2 },
  "aces-menu-back": { sheet: "patrick", row: 3, column: 1 },
  "inventory-menu-back": { sheet: "ui", row: 1, column: 1 },
  "aces-menu": { sheet: "patrick", row: 3, column: 1 },
  "inventory-menu": { sheet: "ui", row: 1, column: 1 },
  revolver: { sheet: "patrick", row: 1, column: 2 },
  "revolver-shot": { sheet: "patrick", row: 1, column: 2 },
  "piercing-shot": { sheet: "patrick", row: 1, column: 3 },
  "hallow-shot": { sheet: "patrick", row: 1, column: 4 },
  "magnum-shot": { sheet: "patrick", row: 1, column: 5 },
  "six-shooter": { sheet: "patrick", row: 1, column: 7 },
  "dual-wielding": { sheet: "patrick", row: 1, column: 6 },
  "coin-toss": { sheet: "patrick", row: 1, column: 8 },
  "feelin-fine": { sheet: "patrick", row: 2, column: 1 },
  "health-insurance": { sheet: "patrick", row: 2, column: 2 },
  "ace-of-spades": { sheet: "patrick", row: 2, column: 3 },
  "ace-of-diamonds": { sheet: "patrick", row: 2, column: 4 },
  "ace-of-clubs": { sheet: "patrick", row: 2, column: 5 },
  "burger-item": { sheet: "item", row: 2, column: 2 },
  "bomb-item": { sheet: "item", row: 1, column: 1 },
  "cherry-item": { sheet: "item", row: 1, column: 2 },
  "salad-item": { sheet: "item", row: 1, column: 4 }
};
export const PATRICK_UPGRADE_ICON_MAP = {
  "bullet-enhancement": { row: 2, column: 6 },
  "slot-machine": { row: 2, column: 7 },
  "luck-expertise": { row: 2, column: 8 }
};
export const PATRICK_STARTING_UNLOCKED_ACTION_IDS = [
  "revolver-shot",
  "feelin-fine",
  "health-insurance"
];
export const PATRICK_ABILITY_REWARD_DEFINITIONS = [
  { id: "piercing-shot", labelKey: "action_piercing_shot", descriptionKey: "reward_piercing_shot_description" },
  { id: "hallow-shot", labelKey: "action_hollow_shot", descriptionKey: "reward_hollow_shot_description" },
  { id: "magnum-shot", labelKey: "action_magnum_shot", descriptionKey: "reward_magnum_shot_description" },
  { id: "ace-of-spades", labelKey: "action_ace_of_spades", descriptionKey: "reward_ace_of_spades_description" },
  { id: "ace-of-diamonds", labelKey: "action_ace_of_diamonds", descriptionKey: "reward_ace_of_diamonds_description" },
  { id: "ace-of-clubs", labelKey: "action_ace_of_clubs", descriptionKey: "reward_ace_of_clubs_description" },
  { id: "six-shooter", labelKey: "action_bullet_storm", descriptionKey: "reward_bullet_storm_description" },
  { id: "dual-wielding", labelKey: "action_quickdrawer", descriptionKey: "reward_quickdrawer_description" },
  { id: "coin-toss", labelKey: "action_coin_toss", descriptionKey: "reward_coin_toss_description" }
];
export const PATRICK_UPGRADE_DEFINITIONS = [
  {
    id: "luck-expertise",
    labelKey: "upgrade_luck_expertise_name",
    descriptionKey: "upgrade_luck_expertise_description",
    maxRank: 20
  },
  {
    id: "slot-machine",
    labelKey: "upgrade_slot_machine_name",
    descriptionKey: "upgrade_slot_machine_description",
    maxRank: 10
  },
  {
    id: "bullet-enhancement",
    labelKey: "upgrade_bullet_enhancement_name",
    descriptionKey: "upgrade_bullet_enhancement_description",
    maxRank: 14
  }
];

export const PATRICK_ACTIONS = [
  {
    id: "coin-flip",
    labelKey: "action_coin_flip",
    costLucky: 0,
    costSp: 0
  },
  {
    id: "revolver-menu",
    labelKey: "action_revolver",
    actionType: "menu",
    menuId: "revolver"
  },
  {
    id: "feelin-fine",
    labelKey: "action_feelin_fine",
    costLucky: 2,
    costSp: 8
  },
  {
    id: "aces-menu",
    labelKey: "action_aces",
    actionType: "menu",
    menuId: "aces"
  },
  {
    id: "inventory-menu",
    labelKey: "action_inventory",
    actionType: "menu",
    menuId: "inventory"
  }
];

export const PATRICK_REVOLVER_MENU_ACTIONS = [
  {
    id: "revolver-menu-back",
    labelKey: "action_back",
    actionType: "menu-back"
  },
  {
    id: "revolver-shot",
    labelKey: "action_revolver",
    costLucky: 1,
    costSp: 0,
    requiresTarget: true,
    baseDamage: 10
  },
  {
    id: "piercing-shot",
    labelKey: "action_piercing_shot",
    costLucky: 2,
    costSp: 8,
    baseDamage: 10
  },
  {
    id: "hallow-shot",
    labelKey: "action_hollow_shot",
    inspectId: "hollow-shot",
    costLucky: 2,
    costSp: 8,
    requiresTarget: true,
    baseDamage: 20
  },
  {
    id: "magnum-shot",
    labelKey: "action_magnum_shot",
    costLucky: 3,
    costSp: 16,
    requiresTarget: true,
    baseDamage: 10
  },
  {
    id: "six-shooter",
    labelKey: "action_bullet_storm",
    inspectId: "bullet-storm",
    costLucky: 4,
    costSp: 24,
    requiresTarget: true,
    baseDamage: 10
  },
  {
    id: "dual-wielding",
    labelKey: "action_quickdrawer",
    inspectId: "quickdrawer",
    costLucky: 3,
    costSp: 24,
    requiresTarget: true,
    baseDamage: 10
  },
  {
    id: "coin-toss",
    labelKey: "action_coin_toss",
    costLucky: 5,
    minLuckyCharges: 6,
    costSp: 32,
    requiresTarget: true,
    baseDamage: 10
  }
];

export const PATRICK_ACES_MENU_ACTIONS = [
  {
    id: "aces-menu-back",
    labelKey: "action_back",
    actionType: "menu-back"
  },
  {
    id: "health-insurance",
    labelKey: "action_ace_of_hearts",
    inspectId: "ace-of-hearts",
    costLucky: 4,
    costSp: 24
  },
  {
    id: "ace-of-spades",
    labelKey: "action_ace_of_spades",
    costLucky: 4,
    costSp: 0
  },
  {
    id: "ace-of-diamonds",
    labelKey: "action_ace_of_diamonds",
    costLucky: 3,
    costSp: 16
  },
  {
    id: "ace-of-clubs",
    labelKey: "action_ace_of_clubs",
    costLucky: 3,
    costSp: 16
  }
];

export const PATRICK_INVENTORY_MENU_ACTIONS = [
  {
    id: "inventory-menu-back",
    labelKey: "action_back",
    actionType: "menu-back"
  }
];

const patrickImage = new Image();
patrickImage.src = "sprites/player/patrick/patrick.png";
const patrickMilestoneImages = [
  patrickImage,
  Object.assign(new Image(), { src: "sprites/player/patrick/patrick_ms1.png" }),
  Object.assign(new Image(), { src: "sprites/player/patrick/patrick_ms2.png" }),
  Object.assign(new Image(), { src: "sprites/player/patrick/patrick_ms3.png" }),
  Object.assign(new Image(), { src: "sprites/player/patrick/patrick_ms4.png" })
];
const patrickProfileImage = new Image();
patrickProfileImage.src = "sprites/player/patrick/patrick_profile.png";
const patrickActionIconImage = new Image();
patrickActionIconImage.src = "sprites/player/patrick/patrick_icon.png";
const patrickIndicatorImage = new Image();
patrickIndicatorImage.src = "sprites/player/patrick/patrick_indicator.png";
let patrickIdleFrameImage = null;
let patrickCurrentMilestoneRank = 0;
const patrickFrameBoundsCache = new Map();
const patrickAnimationBoundsCache = new Map();

export function getPatrickImage() {
  return patrickIdleFrameImage ?? patrickProfileImage ?? getPatrickSheetImage();
}

export function getPatrickSheetImage() {
  return patrickMilestoneImages[patrickCurrentMilestoneRank] ?? patrickImage;
}

export function getPatrickActionIconImage() {
  return patrickActionIconImage;
}

export function getPatrickIndicatorImage() {
  return patrickIndicatorImage;
}

export function getPatrickFrameSourceRect(row, col) {
  const sheetImage = getPatrickSheetImage();
  const cacheKey = `${row}:${col}`;
  const cached = patrickFrameBoundsCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const canvas = document.createElement("canvas");
  canvas.width = PATRICK_FRAME_SIZE;
  canvas.height = PATRICK_FRAME_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    const fallback = {
      sx: col * PATRICK_FRAME_SIZE,
      sy: row * PATRICK_FRAME_SIZE,
      sw: PATRICK_FRAME_SIZE,
      sh: PATRICK_FRAME_SIZE
    };
    patrickFrameBoundsCache.set(cacheKey, fallback);
    return fallback;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, PATRICK_FRAME_SIZE, PATRICK_FRAME_SIZE);
  context.drawImage(
    sheetImage,
    col * PATRICK_FRAME_SIZE,
    row * PATRICK_FRAME_SIZE,
    PATRICK_FRAME_SIZE,
    PATRICK_FRAME_SIZE,
    0,
    0,
    PATRICK_FRAME_SIZE,
    PATRICK_FRAME_SIZE
  );

  const imageData = context.getImageData(0, 0, PATRICK_FRAME_SIZE, PATRICK_FRAME_SIZE);
  const data = imageData.data;
  let minX = PATRICK_FRAME_SIZE;
  let minY = PATRICK_FRAME_SIZE;
  let maxX = -1;
  let maxY = -1;

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 0) {
      const pixelIndex = (index - 3) / 4;
      const px = pixelIndex % PATRICK_FRAME_SIZE;
      const py = Math.floor(pixelIndex / PATRICK_FRAME_SIZE);
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
  }

  const fallback = {
    sx: col * PATRICK_FRAME_SIZE,
    sy: row * PATRICK_FRAME_SIZE,
    sw: PATRICK_FRAME_SIZE,
    sh: PATRICK_FRAME_SIZE
  };

  if (maxX < minX || maxY < minY) {
    patrickFrameBoundsCache.set(cacheKey, fallback);
    return fallback;
  }

  const localX = Math.max(0, minX - PATRICK_FRAME_BOUNDS_PADDING);
  const localY = Math.max(0, minY - PATRICK_FRAME_BOUNDS_PADDING);
  const bounds = {
    sx: col * PATRICK_FRAME_SIZE + localX,
    sy: row * PATRICK_FRAME_SIZE + localY,
    sw: Math.min(PATRICK_FRAME_SIZE - localX, maxX - minX + 1 + PATRICK_FRAME_BOUNDS_PADDING * 2),
    sh: Math.min(PATRICK_FRAME_SIZE - localY, maxY - minY + 1 + PATRICK_FRAME_BOUNDS_PADDING * 2)
  };

  patrickFrameBoundsCache.set(cacheKey, bounds);
  return bounds;
}

export function getPatrickAnimationSourceRect(row, frameColumns) {
  const cacheKey = `${row}:${frameColumns.join(",")}`;
  const cached = patrickAnimationBoundsCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  let minLocalX = PATRICK_FRAME_SIZE;
  let minLocalY = PATRICK_FRAME_SIZE;
  let maxLocalX = -1;
  let maxLocalY = -1;

  frameColumns.forEach((column) => {
    const frameRect = getPatrickFrameSourceRect(row, column);
    const localX = frameRect.sx - column * PATRICK_FRAME_SIZE;
    const localY = frameRect.sy - row * PATRICK_FRAME_SIZE;
    minLocalX = Math.min(minLocalX, localX);
    minLocalY = Math.min(minLocalY, localY);
    maxLocalX = Math.max(maxLocalX, localX + frameRect.sw);
    maxLocalY = Math.max(maxLocalY, localY + frameRect.sh);
  });

  const bounds = {
    localX: Math.max(0, minLocalX),
    localY: Math.max(0, minLocalY),
    sw: Math.min(PATRICK_FRAME_SIZE, maxLocalX - minLocalX),
    sh: Math.min(PATRICK_FRAME_SIZE, maxLocalY - minLocalY)
  };

  patrickAnimationBoundsCache.set(cacheKey, bounds);
  return bounds;
}

export function getPatrickProfileImage() {
  return patrickProfileImage;
}

export async function loadPatrickAssets(waitForImage) {
  await Promise.all([
    ...patrickMilestoneImages.map((image) => waitForImage(image)),
    waitForImage(patrickProfileImage),
    waitForImage(patrickActionIconImage),
    waitForImage(patrickIndicatorImage)
  ]);

  patrickIdleFrameImage = cropPatrickFrame(PATRICK_IDLE_FRAME.row, PATRICK_IDLE_FRAME.col);
}

function cropPatrickFrame(row, col) {
  const canvas = document.createElement("canvas");
  canvas.width = PATRICK_FRAME_SIZE;
  canvas.height = PATRICK_FRAME_SIZE;
  const context = canvas.getContext("2d");

  if (!context) {
    return patrickProfileImage;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, PATRICK_FRAME_SIZE, PATRICK_FRAME_SIZE);
  context.drawImage(
    getPatrickSheetImage(),
    col * PATRICK_FRAME_SIZE,
    row * PATRICK_FRAME_SIZE,
    PATRICK_FRAME_SIZE,
    PATRICK_FRAME_SIZE,
    0,
    0,
    PATRICK_FRAME_SIZE,
    PATRICK_FRAME_SIZE
  );

  return canvas;
}

export function setPatrickMilestoneRank(rank) {
  const nextRank = Math.max(0, Math.min(4, Math.floor(Number(rank) || 0)));
  if (nextRank === patrickCurrentMilestoneRank) {
    return;
  }

  patrickCurrentMilestoneRank = nextRank;
  patrickFrameBoundsCache.clear();
  patrickAnimationBoundsCache.clear();
  patrickIdleFrameImage = cropPatrickFrame(PATRICK_IDLE_FRAME.row, PATRICK_IDLE_FRAME.col);
}

function getPatrickUpgradeRank(unit, upgradeId) {
  return unit?.upgrades?.[upgradeId] ?? 0;
}

function getPatrickMilestoneRank(unit) {
  return Math.max(0, Math.min(PATRICK_MILESTONE_MAX_RANK, Math.floor(Number(unit?.milestoneRank) || 0)));
}

export function createPatrickUnlockedActionState() {
  return Object.fromEntries(PATRICK_STARTING_UNLOCKED_ACTION_IDS.map((actionId) => [actionId, true]));
}

export function isPatrickActionUnlocked(player, actionId) {
  return !!player?.unlockedActions?.[actionId];
}

export function unlockPatrickAction(player, actionId) {
  if (!player?.unlockedActions) {
    player.unlockedActions = {};
  }

  player.unlockedActions[actionId] = true;
}

export function createPatrickPlayerState(createStatuses, translate) {
  const player = {
    id: "player",
    characterId: PATRICK_CHARACTER_ID,
    name: translate("menu_character_patrick"),
    hp: PATRICK_STARTING_STATS.hp,
    maxHp: PATRICK_STARTING_STATS.maxHp,
    sp: PATRICK_STARTING_STATS.sp,
    maxSp: PATRICK_STARTING_STATS.maxSp,
    luckyCharges: PATRICK_STARTING_STATS.luckyCharges,
    maxLuckyCharges: PATRICK_STARTING_STATS.maxLuckyCharges,
    baseActionsPerTurn: PATRICK_STARTING_STATS.baseActionsPerTurn,
    turnStartActionsRemaining: PATRICK_STARTING_STATS.baseActionsPerTurn,
    storedWeaknessPower: 0,
    actionProgress: 0,
    actionsRemaining: PATRICK_STARTING_STATS.baseActionsPerTurn,
    renderOffsetX: 0,
    renderOffsetY: 0,
    milestoneRank: 0,
    levelsCleared: 0,
    playerEffect: null,
    attributes: {
      defense: 0,
      fireImmunity: false,
      flying: false,
      mobile: false
    },
    inventory: createPlayerInventoryState(),
    unlockedActions: createPatrickUnlockedActionState(),
    statuses: createStatuses()
  };

  applyPatrickMilestoneBonuses(player);
  return player;
}

function applyPatrickMilestoneBonuses(player) {
  if (player?.characterId !== PATRICK_CHARACTER_ID) {
    return;
  }

  player.maxLuckyCharges = getPatrickMaxLuckyCharges(player);
  player.luckyCharges = Math.min(player.maxLuckyCharges, player.luckyCharges ?? 0);
}

export function getPatrickHeadsChancePercent(unit) {
  return Math.round((0.5 + getPatrickUpgradeRank(unit, "luck-expertise") * LUCK_EXPERTISE_HEADS_CHANCE_STEP) * 100);
}

export function getPatrickCoinFlipLuckyChargeGain(unit) {
  const bonusGain = getPatrickUpgradeRank(unit, "luck-expertise") * LUCK_EXPERTISE_LUCKY_CHARGE_GAIN_STEP;
  return Math.min(2, 1 + Math.max(0, bonusGain));
}

export function getPatrickRevolverBaseDamage(unit) {
  return PATRICK_REVOLVER_DAMAGE + getPatrickUpgradeRank(unit, "bullet-enhancement") * BULLET_ENHANCEMENT_DAMAGE_GAIN;
}

export function getPatrickMarkedDamageMultiplier(target) {
  return 1 + (target?.statuses?.marked?.power ?? 0) * PATRICK_MARKED_DAMAGE_STEP;
}

export function getPatrickMaxLuckyCharges(unit) {
  return PATRICK_STARTING_STATS.maxLuckyCharges + getPatrickMilestoneRank(unit) * PATRICK_MILESTONE_LUCKY_CHARGES_GAIN;
}

export function getPatrickFeelinFineCleansedPower(unit) {
  return PATRICK_FEELIN_FINE_CLEANSED_POWER + getPatrickMilestoneRank(unit);
}

export function formatRomanNumeral(value) {
  return ROMAN_NUMERALS[Math.max(1, Math.min(10, Math.floor(Number(value) || 0))) - 1] ?? "I";
}

export function getPatrickCoinFlipConfig(unit = null) {
  const levelsCleared = Math.max(0, Math.floor(Number(unit?.levelsCleared) || 0));
  return {
    headsSp: PATRICK_COIN_SP_HEADS + Math.floor(levelsCleared / 10),
    tailsSp: PATRICK_COIN_SP_TAILS,
    weaknessPower: PATRICK_COIN_WEAKNESS_POWER,
    weaknessTurns: PATRICK_COIN_WEAKNESS_TURNS
  };
}
