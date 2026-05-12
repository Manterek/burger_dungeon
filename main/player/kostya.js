import { getInventoryMenuActions } from "../inventory.js";
import { createPlayerInventoryState } from "../inventory.js";
export const KOSTYA_CHARACTER_ID = "kostya";
const KOSTYA_FRAME_SIZE = 32;
const KOSTYA_IDLE_FRAME = { row: 0, col: 0 };
const KOSTYA_FRAME_BOUNDS_PADDING = 1;
const KOSTYA_SWORD_BASE_DAMAGE = 6;
const KOSTYA_SHARPER_BLADE_DAMAGE_GAIN = 1;
const KOSTYA_COUNTER_BASE_WINDOW = 3;
const KOSTYA_COUNTER_WINDOW_GAIN = 0.15;
const KOSTYA_SHADOW_BASE_RESISTANCE_POWER = 2;
const KOSTYA_SHADOW_FIELD_PROMOTION_MAX_POWER = 10;
const KOSTYA_SHADOW_BASE_HP_MULTIPLIER = 1.5;
const KOSTYA_SHADOW_BOSS_HP_MULTIPLIER_STEP = 0.125;
const KOSTYA_SHADOW_MAX_MILESTONE_RANK = 4;
export const KOSTYA_MAX_HP_CAP = 95;
export const KOSTYA_STARTING_STATS = {
  hp: 25,
  maxHp: 25,
  sp: 0,
  maxSp: 100,
  shadowCharge: 0,
  maxShadowCharge: 100,
  baseActionsPerTurn: 1
};
export const KOSTYA_SHADOW_SUMMON_SP_COST = 56;
export const KOSTYA_SHADOW_SUMMON_SC_COST = 100;
const KOSTYA_SHADOW_DEFAULT_ACTIONS = 1;
const KOSTYA_SHADOW_DEFAULT_DAMAGE_MULTIPLIER = 1;
const KOSTYA_SHADOW_DEFAULT_TARGET_WEIGHT = 0.525;
const KOSTYA_GHOST_SHADOW_HP_MULTIPLIER = 2;
const KOSTYA_GHOST_SHADOW_SHP_MULTIPLIER = 2;
const KOSTYA_GHOST_SHADOW_DAMAGE_MULTIPLIER = 0.5;
const KOSTYA_GHOST_SHADOW_TARGET_WEIGHT = 0.575;
const KOSTYA_WRAITH_SHADOW_HP_MULTIPLIER = 0.5;
const KOSTYA_WRAITH_SHADOW_SHP_MULTIPLIER = 0.5;
const KOSTYA_WRAITH_SHADOW_DAMAGE_MULTIPLIER = 2;
const KOSTYA_WRAITH_SHADOW_TARGET_WEIGHT = 0.5;
export const KOSTYA_ACTION_ICON_MAP = {
  "katana-menu": { sheet: "kostya", row: 1, column: 1 },
  "katana-menu-back": { sheet: "kostya", row: 1, column: 1 },
  "casts-menu": { sheet: "kostya", row: 3, column: 1 },
  "casts-menu-back": { sheet: "kostya", row: 3, column: 1 },
  katana: { sheet: "kostya", row: 1, column: 2 },
  slash: { sheet: "kostya", row: 1, column: 1 },
  lunge: { sheet: "kostya", row: 1, column: 3 },
  "decay-curse": { sheet: "kostya", row: 1, column: 4 },
  "crippling-stab": { sheet: "kostya", row: 2, column: 3 },
  "dark-plating": { sheet: "kostya", row: 2, column: 4 },
  "deep-focus": { sheet: "kostya", row: 2, column: 5 },
  "mass-infection": { sheet: "kostya", row: 1, column: 8 },
  "field-promotion": { sheet: "kostya", row: 1, column: 6 },
  "action-recall": { sheet: "kostya", row: 1, column: 7 },
  shadow: { sheet: "kostya", row: 1, column: 5 },
  ghost: { sheet: "kostya", row: 2, column: 1 },
  wraith: { sheet: "kostya", row: 2, column: 2 },
  "inventory-menu": { sheet: "ui", row: 1, column: 1 },
  "inventory-menu-back": { sheet: "ui", row: 1, column: 1 },
  "burger-item": { sheet: "item", row: 2, column: 2 },
  "bomb-item": { sheet: "item", row: 1, column: 1 },
  "cherry-item": { sheet: "item", row: 1, column: 2 },
  "salad-item": { sheet: "item", row: 1, column: 4 }
};
export const KOSTYA_UPGRADE_ICON_MAP = {
  "sharper-blade": { sheet: "kostya", row: 2, column: 6 },
  "corrupted-heart": { sheet: "kostya", row: 2, column: 7 },
  "darkness-pull": { sheet: "kostya", row: 2, column: 8 }
};
export const KOSTYA_UPGRADE_DEFINITIONS = [
  {
    id: "sharper-blade",
    labelKey: "upgrade_sharper_blade_name",
    descriptionKey: "upgrade_sharper_blade_description",
    maxRank: 20
  },
  {
    id: "corrupted-heart",
    labelKey: "upgrade_corrupted_heart_name",
    descriptionKey: "upgrade_corrupted_heart_description",
    maxRank: 14
  },
  {
    id: "darkness-pull",
    labelKey: "upgrade_darkness_pull_name",
    descriptionKey: "upgrade_darkness_pull_description",
    maxRank: 10
  }
];

export const KOSTYA_STARTING_UNLOCKED_ACTION_IDS = [
  "slash",
  "field-promotion"
];

export const KOSTYA_ABILITY_REWARD_DEFINITIONS = [
  { id: "lunge", labelKey: "action_lunge", descriptionKey: "reward_lunge_description" },
  { id: "decay-curse", labelKey: "action_decay_curse", descriptionKey: "reward_decay_curse_description" },
  { id: "action-recall", labelKey: "action_action_recall", descriptionKey: "reward_action_recall_description" },
  { id: "mass-infection", labelKey: "action_mass_infection", descriptionKey: "reward_mass_infection_description" },
  { id: "crippling-stab", labelKey: "action_crippling_stab", descriptionKey: "reward_crippling_stab_description" },
  { id: "dark-plating", labelKey: "action_dark_plating", descriptionKey: "reward_dark_plating_description" },
  { id: "ghost", labelKey: "action_ghost", descriptionKey: "reward_ghost_description" },
  { id: "wraith", labelKey: "action_wraith", descriptionKey: "reward_wraith_description" },
  { id: "deep-focus", labelKey: "action_deep_focus", descriptionKey: "reward_deep_focus_description" }
];

export const KOSTYA_ACTIONS = [
  {
    id: "katana-menu",
    labelKey: "action_katana",
    actionType: "menu",
    menuId: "katana"
  },
  {
    id: "shadow",
    labelKey: "action_shadow",
    labelScale: 1,
    requiresTarget: false
  },
  {
    id: "ghost",
    labelKey: "action_ghost",
    labelScale: 1,
    requiresTarget: false
  },
  {
    id: "wraith",
    labelKey: "action_wraith",
    labelScale: 1,
    requiresTarget: false
  },
  {
    id: "casts-menu",
    labelKey: "action_casts",
    actionType: "menu",
    menuId: "casts"
  },
  {
    id: "field-promotion",
    labelKey: "action_field_promotion",
    costSp: 48,
    costShadowCharge: 80,
    minShadowCharge: 80,
    requiresTarget: false,
    requiresShadow: true,
    menuGroup: "casts"
  },
  {
    id: "action-recall",
    labelKey: "action_action_recall",
    costSp: 24,
    costShadowCharge: 40,
    minShadowCharge: 40,
    requiresTarget: false,
    requiresShadow: true,
    menuGroup: "casts"
  },
  {
    id: "katana",
    labelKey: "action_slash",
    labelScale: 1,
    requiresTarget: false,
    baseDamage: 5,
    menuGroup: "katana"
  },
  {
    id: "slash",
    labelKey: "action_dash",
    labelScale: 1,
    costSp: 8,
    requiresTarget: true,
    baseDamage: 6,
    menuGroup: "katana"
  },
  {
    id: "lunge",
    labelKey: "action_lunge",
    labelScale: 1,
    costSp: 16,
    requiresTarget: false,
    baseDamage: 6,
    menuGroup: "katana"
  },
  {
    id: "decay-curse",
    labelKey: "action_decay_curse",
    costSp: 16,
    costShadowCharge: 20,
    minShadowCharge: 20,
    requiresTarget: false,
    baseDamage: 6,
    menuGroup: "casts"
  },
  {
    id: "mass-infection",
    labelKey: "action_mass_infection",
    labelScale: 1,
    costSp: 24,
    costShadowCharge: 40,
    minShadowCharge: 40,
    requiresTarget: false,
    baseDamage: 6,
    menuGroup: "katana"
  },
  {
    id: "crippling-stab",
    labelKey: "action_crippling_stab",
    labelScale: 0.9,
    costSp: 32,
    costShadowCharge: 50,
    minShadowCharge: 50,
    requiresTarget: false,
    baseDamage: 6,
    menuGroup: "katana"
  },
  {
    id: "dark-plating",
    labelKey: "action_dark_plating",
    labelScale: 0.9,
    costSp: 32,
    costShadowCharge: 50,
    minShadowCharge: 50,
    requiresTarget: false,
    requiresShadow: true,
    menuGroup: "casts"
  },
  {
    id: "deep-focus",
    labelKey: "action_deep_focus",
    labelScale: 0.9,
    costSp: 56,
    requiresTarget: false,
    menuGroup: "casts"
  },
  {
    id: "inventory-menu",
    labelKey: "action_inventory",
    actionType: "menu",
    menuId: "inventory"
  }
];

export const KOSTYA_KATANA_MENU_ACTIONS = [
  {
    id: "katana-menu-back",
    labelKey: "action_back",
    actionType: "menu-back"
  }
].concat(KOSTYA_ACTIONS.filter((action) => action.menuGroup === "katana"));

export const KOSTYA_CASTS_MENU_ACTIONS = [
  {
    id: "casts-menu-back",
    labelKey: "action_back",
    actionType: "menu-back"
  }
].concat(KOSTYA_ACTIONS.filter((action) => action.menuGroup === "casts" && action.id !== "deep-focus"));

export const KOSTYA_INVENTORY_MENU_ACTIONS = [
  {
    id: "inventory-menu-back",
    labelKey: "action_back",
    actionType: "menu-back"
  }
];

const kostyaImage = new Image();
kostyaImage.src = "sprites/player/kostya/kostya.png";
const kostyaMilestoneImages = [
  kostyaImage,
  new Image(),
  new Image(),
  new Image(),
  new Image()
];
kostyaMilestoneImages[1].src = "sprites/player/kostya/kostya_ms1.png";
kostyaMilestoneImages[2].src = "sprites/player/kostya/kostya_ms2.png";
kostyaMilestoneImages[3].src = "sprites/player/kostya/kostya_ms3.png";
kostyaMilestoneImages[4].src = "sprites/player/kostya/kostya_ms4.png";
const kostyaProfileImage = new Image();
kostyaProfileImage.src = "sprites/player/kostya/kostya_profile.png";
const kostyaActionIconImage = new Image();
kostyaActionIconImage.src = "sprites/player/kostya/kostya_icon.png";
let kostyaIdleFrameImage = null;
let kostyaCurrentMilestoneRank = 0;
const kostyaFrameBoundsCache = new Map();
const kostyaAnimationBoundsCache = new Map();

export function getKostyaImage() {
  return kostyaIdleFrameImage ?? kostyaProfileImage ?? getKostyaSheetImage();
}

export function getKostyaSheetImage() {
  return kostyaMilestoneImages[kostyaCurrentMilestoneRank] ?? kostyaImage;
}

export function getKostyaProfileImage() {
  return kostyaProfileImage;
}

export function getKostyaActionIconImage() {
  return kostyaActionIconImage;
}

export function getKostyaFrameSourceRect(row, col) {
  const sheetImage = getKostyaSheetImage();
  const cacheKey = `${row}:${col}`;
  const cached = kostyaFrameBoundsCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const canvas = document.createElement("canvas");
  canvas.width = KOSTYA_FRAME_SIZE;
  canvas.height = KOSTYA_FRAME_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    const fallback = {
      sx: col * KOSTYA_FRAME_SIZE,
      sy: row * KOSTYA_FRAME_SIZE,
      sw: KOSTYA_FRAME_SIZE,
      sh: KOSTYA_FRAME_SIZE
    };
    kostyaFrameBoundsCache.set(cacheKey, fallback);
    return fallback;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, KOSTYA_FRAME_SIZE, KOSTYA_FRAME_SIZE);
  context.drawImage(
    sheetImage,
    col * KOSTYA_FRAME_SIZE,
    row * KOSTYA_FRAME_SIZE,
    KOSTYA_FRAME_SIZE,
    KOSTYA_FRAME_SIZE,
    0,
    0,
    KOSTYA_FRAME_SIZE,
    KOSTYA_FRAME_SIZE
  );

  const imageData = context.getImageData(0, 0, KOSTYA_FRAME_SIZE, KOSTYA_FRAME_SIZE);
  const data = imageData.data;
  let minX = KOSTYA_FRAME_SIZE;
  let minY = KOSTYA_FRAME_SIZE;
  let maxX = -1;
  let maxY = -1;

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 0) {
      const pixelIndex = (index - 3) / 4;
      const px = pixelIndex % KOSTYA_FRAME_SIZE;
      const py = Math.floor(pixelIndex / KOSTYA_FRAME_SIZE);
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
  }

  const fallback = {
    sx: col * KOSTYA_FRAME_SIZE,
    sy: row * KOSTYA_FRAME_SIZE,
    sw: KOSTYA_FRAME_SIZE,
    sh: KOSTYA_FRAME_SIZE
  };

  if (maxX < minX || maxY < minY) {
    kostyaFrameBoundsCache.set(cacheKey, fallback);
    return fallback;
  }

  const localX = Math.max(0, minX - KOSTYA_FRAME_BOUNDS_PADDING);
  const localY = Math.max(0, minY - KOSTYA_FRAME_BOUNDS_PADDING);
  const bounds = {
    sx: col * KOSTYA_FRAME_SIZE + localX,
    sy: row * KOSTYA_FRAME_SIZE + localY,
    sw: Math.min(KOSTYA_FRAME_SIZE - localX, maxX - minX + 1 + KOSTYA_FRAME_BOUNDS_PADDING * 2),
    sh: Math.min(KOSTYA_FRAME_SIZE - localY, maxY - minY + 1 + KOSTYA_FRAME_BOUNDS_PADDING * 2)
  };

  kostyaFrameBoundsCache.set(cacheKey, bounds);
  return bounds;
}

export function getKostyaAnimationSourceRect(row, frameColumns) {
  const cacheKey = `${row}:${frameColumns.join(",")}`;
  const cached = kostyaAnimationBoundsCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  let minLocalX = KOSTYA_FRAME_SIZE;
  let minLocalY = KOSTYA_FRAME_SIZE;
  let maxLocalX = -1;
  let maxLocalY = -1;

  frameColumns.forEach((column) => {
    const frameRect = getKostyaFrameSourceRect(row, column);
    const localX = frameRect.sx - column * KOSTYA_FRAME_SIZE;
    const localY = frameRect.sy - row * KOSTYA_FRAME_SIZE;
    minLocalX = Math.min(minLocalX, localX);
    minLocalY = Math.min(minLocalY, localY);
    maxLocalX = Math.max(maxLocalX, localX + frameRect.sw);
    maxLocalY = Math.max(maxLocalY, localY + frameRect.sh);
  });

  const bounds = {
    localX: Math.max(0, minLocalX),
    localY: Math.max(0, minLocalY),
    sw: Math.min(KOSTYA_FRAME_SIZE, maxLocalX - minLocalX),
    sh: Math.min(KOSTYA_FRAME_SIZE, maxLocalY - minLocalY)
  };

  kostyaAnimationBoundsCache.set(cacheKey, bounds);
  return bounds;
}

export async function loadKostyaAssets(waitForImage) {
  await Promise.all([
    ...kostyaMilestoneImages.map((image) => waitForImage(image)),
    waitForImage(kostyaProfileImage),
    waitForImage(kostyaActionIconImage)
  ]);

  kostyaIdleFrameImage = cropKostyaFrame(KOSTYA_IDLE_FRAME.row, KOSTYA_IDLE_FRAME.col);
}

function cropKostyaFrame(row, col) {
  const canvas = document.createElement("canvas");
  canvas.width = KOSTYA_FRAME_SIZE;
  canvas.height = KOSTYA_FRAME_SIZE;
  const context = canvas.getContext("2d");

  if (!context) {
    return kostyaProfileImage;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, KOSTYA_FRAME_SIZE, KOSTYA_FRAME_SIZE);
  context.drawImage(
    getKostyaSheetImage(),
    col * KOSTYA_FRAME_SIZE,
    row * KOSTYA_FRAME_SIZE,
    KOSTYA_FRAME_SIZE,
    KOSTYA_FRAME_SIZE,
    0,
    0,
    KOSTYA_FRAME_SIZE,
    KOSTYA_FRAME_SIZE
  );

  return canvas;
}

function getKostyaUpgradeRank(unit, upgradeId) {
  return unit?.upgrades?.[upgradeId] ?? 0;
}

function getKostyaShadowBonusHealthPercent(unit) {
  return getKostyaUpgradeRank(unit, "corrupted-heart") * 0.04;
}

export function getKostyaShadowBaseHp(unit) {
  const playerMaxHp = Number(unit?.maxHp) || KOSTYA_STARTING_STATS.maxHp;
  const milestoneRank = Math.max(
    0,
    Math.min(KOSTYA_SHADOW_MAX_MILESTONE_RANK, Math.floor(Number(unit?.milestoneRank) || 0))
  );
  const multiplier = KOSTYA_SHADOW_BASE_HP_MULTIPLIER + milestoneRank * KOSTYA_SHADOW_BOSS_HP_MULTIPLIER_STEP;
  return Math.max(1, Math.ceil(playerMaxHp * multiplier));
}

export function getKostyaShadowBonusHealth(unit) {
  return Math.floor(getKostyaShadowBaseHp(unit) * getKostyaShadowBonusHealthPercent(unit));
}

export function createKostyaPlayerState(createStatuses, translate) {
  return {
    id: "player",
    characterId: KOSTYA_CHARACTER_ID,
    name: translate("menu_character_kostya"),
    hp: KOSTYA_STARTING_STATS.hp,
    maxHp: KOSTYA_STARTING_STATS.maxHp,
    sp: KOSTYA_STARTING_STATS.sp,
    maxSp: KOSTYA_STARTING_STATS.maxSp,
    shadowCharge: KOSTYA_STARTING_STATS.shadowCharge,
    maxShadowCharge: KOSTYA_STARTING_STATS.maxShadowCharge,
    baseActionsPerTurn: KOSTYA_STARTING_STATS.baseActionsPerTurn,
    turnStartActionsRemaining: KOSTYA_STARTING_STATS.baseActionsPerTurn,
    shadow: null,
    actionProgress: 0,
    actionsRemaining: KOSTYA_STARTING_STATS.baseActionsPerTurn,
    milestoneRank: 0,
    counterWindowBonus: 0,
    preferredSummonActionId: "shadow",
    actionRecallReady: false,
    pendingActionRecall: null,
    deepFocusActive: false,
    renderOffsetX: 0,
    renderOffsetY: 0,
    shadowFieldPromotionPower: 0,
    attributes: {
      defense: 0,
      fireImmunity: false,
      flying: false,
      mobile: false
    },
    inventory: createPlayerInventoryState(),
    unlockedActions: createKostyaUnlockedActionState(),
    statuses: createStatuses()
  };
}

export function createKostyaUnlockedActionState() {
  return Object.fromEntries(KOSTYA_STARTING_UNLOCKED_ACTION_IDS.map((actionId) => [actionId, true]));
}

export function isKostyaActionUnlocked(player, actionId) {
  if ([
    "katana-menu",
    "katana-menu-back",
    "casts-menu",
    "casts-menu-back",
    "katana",
    "shadow",
    "inventory-menu",
    "inventory-menu-back"
  ].includes(actionId)) {
    return true;
  }

  return !!player?.unlockedActions?.[actionId];
}

export function unlockKostyaAction(player, actionId) {
  if (!player?.unlockedActions) {
    player.unlockedActions = {};
  }

  player.unlockedActions[actionId] = true;
  if (["ghost", "wraith"].includes(actionId)) {
    player.preferredSummonActionId = actionId;
  }
}

export function getKostyaVisibleActions(player, actionMenu = "root") {
  if (actionMenu === "root") {
    return getKostyaRootActionsForMenu(player);
  }

  if (actionMenu === "katana") {
    return getKostyaActionsForMenu(KOSTYA_KATANA_MENU_ACTIONS, player);
  }

  if (actionMenu === "casts") {
    return getKostyaActionsForMenu(KOSTYA_CASTS_MENU_ACTIONS, player);
  }

  if (actionMenu === "inventory") {
    return getInventoryMenuActions(player, KOSTYA_INVENTORY_MENU_ACTIONS[0] ?? null);
  }

  return getKostyaActionsForMenu(KOSTYA_ACTIONS.filter((action) => !action.menuGroup), player);
}

function getKostyaRootActionsForMenu(player) {
  const rootActions = [];
  const actionById = new Map(KOSTYA_ACTIONS.map((action) => [action.id, action]));
  const accessibleCastActions = KOSTYA_CASTS_MENU_ACTIONS
    .filter((action) => action.actionType !== "menu-back" && action.id !== "deep-focus" && isKostyaActionUnlocked(player, action.id));

  rootActions.push(actionById.get("katana-menu"));
  rootActions.push(actionById.get(getKostyaSummonActionId(player)));

  if (accessibleCastActions.length > 1) {
    rootActions.push(actionById.get("casts-menu"));
  } else {
    rootActions.push(...accessibleCastActions);
  }

  if (isKostyaActionUnlocked(player, "deep-focus")) {
    rootActions.push(actionById.get("deep-focus"));
  }

  rootActions.push(actionById.get("inventory-menu"));
  return getKostyaActionsForMenu(rootActions.filter(Boolean), player);
}

function getKostyaActionsForMenu(actions, player) {
  return actions
    .filter((action) => action.actionType === "menu-back" || isKostyaActionUnlocked(player, action.id))
    .map((action) => {
      if (!["shadow", "ghost", "wraith"].includes(action.id)) {
        return action;
      }

      return {
        ...action,
        costSp: KOSTYA_SHADOW_SUMMON_SP_COST,
        costShadowCharge: KOSTYA_SHADOW_SUMMON_SC_COST,
        minShadowCharge: KOSTYA_SHADOW_SUMMON_SC_COST
      };
    });
}

function getKostyaSummonActionId(player) {
  const preferredSummonActionId = player?.preferredSummonActionId;
  if (
    ["ghost", "wraith"].includes(preferredSummonActionId)
    && isKostyaActionUnlocked(player, preferredSummonActionId)
  ) {
    return preferredSummonActionId;
  }

  return "shadow";
}

export function getKostyaSwordBaseDamage(unit) {
  return KOSTYA_SWORD_BASE_DAMAGE + getKostyaUpgradeRank(unit, "sharper-blade") * KOSTYA_SHARPER_BLADE_DAMAGE_GAIN;
}

export function getKostyaDashBaseDamage(unit) {
  return Math.max(1, Math.ceil(getKostyaSwordBaseDamage(unit) * 0.8));
}

export function getKostyaCounterDamage(unit) {
  return getKostyaSwordBaseDamage(unit);
}

export function getKostyaCounterWindowSize(unit) {
  return KOSTYA_COUNTER_BASE_WINDOW
    + getKostyaUpgradeRank(unit, "sharper-blade") * KOSTYA_COUNTER_WINDOW_GAIN
    + Math.max(0, Number(unit?.counterWindowBonus) || 0);
}

export function getKostyaCounterWindowBonusSize(unit) {
  return getKostyaUpgradeRank(unit, "sharper-blade") * KOSTYA_COUNTER_WINDOW_GAIN
    + Math.max(0, Number(unit?.counterWindowBonus) || 0);
}

export function getKostyaShadowChargeGainRatio(unit) {
  return Math.min(2, 1 + getKostyaUpgradeRank(unit, "darkness-pull") * 0.1);
}

export function createKostyaShadowState(createStatuses, player) {
  const summonActionId = getKostyaSummonActionId(player);
  const variantConfig = getKostyaShadowVariantConfig(summonActionId);
  const maxHp = Math.max(1, Math.floor(getKostyaShadowBaseHp(player) * variantConfig.hpMultiplier));
  const maxShp = Math.max(0, Math.floor(getKostyaShadowBonusHealth(player) * variantConfig.shpMultiplier));
  const attributes = {
    defense: 0,
    fireImmunity: false,
    flying: false,
    mobile: variantConfig.mobile === true,
    repeatable: false
  };
  return {
    id: "shadow",
    summonActionId,
    summonFadeStartedAt: 0,
    summonFadeEndsAt: 0,
    hp: maxHp,
    maxHp,
    shp: maxShp,
    maxShp,
    baseActionsPerTurn: attributes.mobile === true ? 2 : variantConfig.baseActionsPerTurn,
    actionProgress: 0,
    actionsRemaining: 0,
    milestoneRank: Math.max(0, Math.min(4, Math.floor(Number(player?.milestoneRank) || 0))),
    renderOffsetX: 0,
    renderOffsetY: 0,
    hpMultiplier: variantConfig.hpMultiplier,
    shpMultiplier: variantConfig.shpMultiplier,
    damageMultiplier: variantConfig.damageMultiplier,
    targetWeight: variantConfig.targetWeight,
    attributes,
    naturalStrengthPower: Math.max(
      0,
      Math.min(KOSTYA_SHADOW_FIELD_PROMOTION_MAX_POWER, Math.floor(Number(player?.shadowFieldPromotionPower) || 0))
    ),
    naturalResistancePower: KOSTYA_SHADOW_BASE_RESISTANCE_POWER,
    statuses: createStatuses()
  };
}

function getKostyaShadowVariantConfig(summonActionId) {
  if (summonActionId === "ghost") {
    return {
      hpMultiplier: KOSTYA_GHOST_SHADOW_HP_MULTIPLIER,
      shpMultiplier: KOSTYA_GHOST_SHADOW_SHP_MULTIPLIER,
      damageMultiplier: KOSTYA_GHOST_SHADOW_DAMAGE_MULTIPLIER,
      baseActionsPerTurn: KOSTYA_SHADOW_DEFAULT_ACTIONS,
      targetWeight: KOSTYA_GHOST_SHADOW_TARGET_WEIGHT
    };
  }

  if (summonActionId === "wraith") {
    return {
      hpMultiplier: KOSTYA_WRAITH_SHADOW_HP_MULTIPLIER,
      shpMultiplier: KOSTYA_WRAITH_SHADOW_SHP_MULTIPLIER,
      damageMultiplier: KOSTYA_WRAITH_SHADOW_DAMAGE_MULTIPLIER,
      baseActionsPerTurn: KOSTYA_SHADOW_DEFAULT_ACTIONS,
      mobile: true,
      targetWeight: KOSTYA_WRAITH_SHADOW_TARGET_WEIGHT
    };
  }

  return {
    hpMultiplier: 1,
    shpMultiplier: 1,
    damageMultiplier: KOSTYA_SHADOW_DEFAULT_DAMAGE_MULTIPLIER,
    baseActionsPerTurn: KOSTYA_SHADOW_DEFAULT_ACTIONS,
    targetWeight: KOSTYA_SHADOW_DEFAULT_TARGET_WEIGHT
  };
}

export function setKostyaMilestoneRank(rank) {
  const nextRank = Math.max(0, Math.min(4, Math.floor(Number(rank) || 0)));
  if (nextRank === kostyaCurrentMilestoneRank) {
    return;
  }

  kostyaCurrentMilestoneRank = nextRank;
  kostyaFrameBoundsCache.clear();
  kostyaAnimationBoundsCache.clear();
  kostyaIdleFrameImage = cropKostyaFrame(KOSTYA_IDLE_FRAME.row, KOSTYA_IDLE_FRAME.col);
}
