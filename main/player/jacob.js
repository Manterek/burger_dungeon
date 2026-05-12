import { getInventoryMenuActions } from "../inventory.js";
import { createPlayerInventoryState } from "../inventory.js";

export const JACOB_CHARACTER_ID = "jacob";
const JACOB_BALL_BASE_DAMAGE = 4;
const JACOB_APPLIED_FORCE_DAMAGE_GAIN = 1;
const JACOB_APPLIED_FORCE_WINDOW_BONUS_GAIN = 0.01;
const JACOB_BASE_DEFENSE = 1;
const JACOB_TEAMMATE_DEFENSE_GAIN = 1;
const JACOB_TEAMMATE_DEFENSE_CAP = 2;
const JACOB_ENDURANCE_HP_GAIN = 10;
const JACOB_ENDURANCE_DEFENSE_GAIN = 1;
const JACOB_DRIBBLING_MELEE_GREEN_GAIN = 0.05;
const JACOB_DRIBBLING_MELEE_YELLOW_GAIN = 0.025;
const JACOB_DRIBBLING_RANGED_WINDOW_GAIN = 0.05;
const JACOB_FRAME_SIZE = 32;
const JACOB_FRAME_BOUNDS_PADDING = 1;
export const JACOB_MAX_HP_CAP = 110;

export const JACOB_STARTING_STATS = {
  hp: 40,
  maxHp: 40,
  sp: 0,
  maxSp: 100,
  baseActionsPerTurn: 1
};

export const JACOB_ACTION_ICON_MAP = {
  kick: { sheet: "jacob", row: 1, column: 1 },
  fireball: { sheet: "jacob", row: 1, column: 2 },
  slowball: { sheet: "jacob", row: 1, column: 3 },
  defend: { sheet: "jacob", row: 1, column: 4 },
  block: { sheet: "jacob", row: 1, column: 5 },
  "group-buff": { sheet: "jacob", row: 1, column: 6 },
  "group-buff-upgrade": { sheet: "jacob", row: 1, column: 7 },
  "good-vibes": { sheet: "jacob", row: 1, column: 8 },
  "corner-shot": { sheet: "jacob", row: 2, column: 1 },
  goal: { sheet: "jacob", row: 2, column: 2 },
  guard: { sheet: "jacob", row: 2, column: 3 },
  "friendly-chatter": { sheet: "jacob", row: 2, column: 4 },
  volley: { sheet: "jacob", row: 2, column: 5 },
  "applied-force": { sheet: "jacob", row: 2, column: 6 },
  "endurance-training": { sheet: "jacob", row: 2, column: 7 },
  "dribbling-mastery": { sheet: "jacob", row: 2, column: 8 },
  "ball-menu": { sheet: "jacob", row: 3, column: 1 },
  "ball-menu-back": { sheet: "jacob", row: 3, column: 1 },
  "support-menu": { sheet: "jacob", row: 3, column: 2 },
  "support-menu-back": { sheet: "jacob", row: 3, column: 2 },
  "inventory-menu": { sheet: "ui", row: 1, column: 1 },
  "inventory-menu-back": { sheet: "ui", row: 1, column: 1 },
  "burger-item": { sheet: "item", row: 2, column: 2 },
  "bomb-item": { sheet: "item", row: 1, column: 1 },
  "cherry-item": { sheet: "item", row: 1, column: 2 },
  "salad-item": { sheet: "item", row: 1, column: 4 }
};

export const JACOB_UPGRADE_DEFINITIONS = [
  {
    id: "applied-force",
    labelKey: "upgrade_applied_force_name",
    descriptionKey: "upgrade_applied_force_description",
    maxRank: 20
  },
  {
    id: "endurance-training",
    labelKey: "upgrade_endurance_training_name",
    descriptionKey: "upgrade_endurance_training_description",
    maxRank: 7
  },
  {
    id: "dribbling-mastery",
    labelKey: "upgrade_dribbling_mastery_name",
    descriptionKey: "upgrade_dribbling_mastery_description",
    maxRank: 17
  }
];

export const JACOB_BALL_ACTION_IDS = [
  "kick",
  "fireball",
  "slowball",
  "corner-shot",
  "volley"
];

export const JACOB_SUPPORT_ACTION_IDS = [
  "group-buff",
  "good-vibes",
  "friendly-chatter",
  "guard"
];

export const JACOB_STARTING_UNLOCKED_ACTION_IDS = [
  "kick",
  "defend",
  "group-buff",
  "good-vibes"
];

export const JACOB_ABILITY_REWARD_DEFINITIONS = [
  { id: "fireball", labelKey: "action_fireball", descriptionKey: "reward_fireball_description" },
  { id: "slowball", labelKey: "action_slowball", descriptionKey: "reward_slowball_description" },
  { id: "block", labelKey: "action_block", descriptionKey: "reward_block_description" },
  { id: "corner-shot", labelKey: "action_corner_shot", descriptionKey: "reward_corner_shot_description" },
  { id: "goal", labelKey: "action_goal", descriptionKey: "reward_goal_description" },
  { id: "friendly-chatter", labelKey: "action_friendly_chatter", descriptionKey: "reward_friendly_chatter_description" },
  { id: "guard", labelKey: "action_guard", descriptionKey: "reward_guard_description" },
  { id: "group-buff-upgrade", labelKey: "action_group_buff_plus", descriptionKey: "reward_group_buff_plus_description" },
  { id: "volley", labelKey: "action_volley", descriptionKey: "reward_volley_description" }
];

export const JACOB_ACTIONS = [
  {
    id: "kick",
    labelKey: "action_kick",
    labelScale: 1,
    requiresTarget: true,
    baseDamage: JACOB_BALL_BASE_DAMAGE
  },
  {
    id: "defend",
    labelKey: "action_defend",
    labelScale: 1
  },
  {
    id: "group-buff",
    labelKey: "action_group_buff",
    costSp: 16
  },
  {
    id: "good-vibes",
    labelKey: "action_good_vibes",
    costSp: 24
  },
  {
    id: "fireball",
    labelKey: "action_fireball",
    costSp: 8,
    requiresTarget: true
  },
  {
    id: "slowball",
    labelKey: "action_slowball",
    costSp: 8,
    requiresTarget: true
  },
  {
    id: "corner-shot",
    labelKey: "action_corner_shot",
    costSp: 16,
    requiresTarget: true
  },
  {
    id: "goal",
    labelKey: "action_goal",
    labelScale: 1,
    costSp: 28
  },
  {
    id: "friendly-chatter",
    labelKey: "action_friendly_chatter",
    costSp: 28
  },
  {
    id: "guard",
    labelKey: "action_guard",
    labelScale: 1,
    costSp: 32
  },
  {
    id: "volley",
    labelKey: "action_volley",
    costSp: 36,
    requiresTarget: true
  },
  {
    id: "ball-menu",
    labelKey: "action_ball_menu",
    actionType: "menu",
    menuId: "ball"
  },
  {
    id: "support-menu",
    labelKey: "action_support_menu",
    actionType: "menu",
    menuId: "support"
  },
  {
    id: "inventory-menu",
    labelKey: "action_inventory",
    actionType: "menu",
    menuId: "inventory"
  }
];

const jacobImage = new Image();
jacobImage.src = "sprites/player/jacob/jacob.png";

const jacobProfileImage = new Image();
jacobProfileImage.src = "sprites/player/jacob/jacob_profile.png";

const jacobActionIconImage = new Image();
jacobActionIconImage.src = "sprites/player/jacob/jacob_icon.png";

const jacobIndicatorImage = new Image();
jacobIndicatorImage.src = "sprites/player/jacob/jacob_indicator.png";
const jacobFrameBoundsCache = new Map();
const jacobAnimationBoundsCache = new Map();

export function getJacobImage() {
  return jacobImage;
}

export function getJacobSheetImage() {
  return jacobImage;
}

export function getJacobProfileImage() {
  return jacobProfileImage;
}

export function getJacobActionIconImage() {
  return jacobActionIconImage;
}

export function getJacobIndicatorImage() {
  return jacobIndicatorImage;
}

export function getJacobFrameSourceRect(row, col) {
  const cacheKey = `${row}:${col}`;
  const cached = jacobFrameBoundsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement("canvas");
  canvas.width = JACOB_FRAME_SIZE;
  canvas.height = JACOB_FRAME_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const fallback = {
    sx: col * JACOB_FRAME_SIZE,
    sy: row * JACOB_FRAME_SIZE,
    sw: JACOB_FRAME_SIZE,
    sh: JACOB_FRAME_SIZE
  };

  if (!context) {
    jacobFrameBoundsCache.set(cacheKey, fallback);
    return fallback;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, JACOB_FRAME_SIZE, JACOB_FRAME_SIZE);
  context.drawImage(
    jacobImage,
    col * JACOB_FRAME_SIZE,
    row * JACOB_FRAME_SIZE,
    JACOB_FRAME_SIZE,
    JACOB_FRAME_SIZE,
    0,
    0,
    JACOB_FRAME_SIZE,
    JACOB_FRAME_SIZE
  );

  const { data } = context.getImageData(0, 0, JACOB_FRAME_SIZE, JACOB_FRAME_SIZE);
  let minX = JACOB_FRAME_SIZE;
  let minY = JACOB_FRAME_SIZE;
  let maxX = -1;
  let maxY = -1;

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] <= 0) {
      continue;
    }
    const pixelIndex = (index - 3) / 4;
    const px = pixelIndex % JACOB_FRAME_SIZE;
    const py = Math.floor(pixelIndex / JACOB_FRAME_SIZE);
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  }

  if (maxX < minX || maxY < minY) {
    jacobFrameBoundsCache.set(cacheKey, fallback);
    return fallback;
  }

  const localX = Math.max(0, minX - JACOB_FRAME_BOUNDS_PADDING);
  const localY = Math.max(0, minY - JACOB_FRAME_BOUNDS_PADDING);
  const bounds = {
    sx: col * JACOB_FRAME_SIZE + localX,
    sy: row * JACOB_FRAME_SIZE + localY,
    sw: Math.min(JACOB_FRAME_SIZE - localX, maxX - minX + 1 + JACOB_FRAME_BOUNDS_PADDING * 2),
    sh: Math.min(JACOB_FRAME_SIZE - localY, maxY - minY + 1 + JACOB_FRAME_BOUNDS_PADDING * 2)
  };

  jacobFrameBoundsCache.set(cacheKey, bounds);
  return bounds;
}

export function getJacobAnimationSourceRect(row, frameColumns) {
  const cacheKey = `${row}:${frameColumns.join(",")}`;
  const cached = jacobAnimationBoundsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let minLocalX = JACOB_FRAME_SIZE;
  let minLocalY = JACOB_FRAME_SIZE;
  let maxLocalX = -1;
  let maxLocalY = -1;

  frameColumns.forEach((column) => {
    const frameRect = getJacobFrameSourceRect(row, column);
    const localX = frameRect.sx - column * JACOB_FRAME_SIZE;
    const localY = frameRect.sy - row * JACOB_FRAME_SIZE;
    minLocalX = Math.min(minLocalX, localX);
    minLocalY = Math.min(minLocalY, localY);
    maxLocalX = Math.max(maxLocalX, localX + frameRect.sw);
    maxLocalY = Math.max(maxLocalY, localY + frameRect.sh);
  });

  const bounds = {
    localX: Math.max(0, minLocalX),
    localY: Math.max(0, minLocalY),
    sw: Math.min(JACOB_FRAME_SIZE, maxLocalX - minLocalX),
    sh: Math.min(JACOB_FRAME_SIZE, maxLocalY - minLocalY)
  };

  jacobAnimationBoundsCache.set(cacheKey, bounds);
  return bounds;
}

export function loadJacobAssets(waitForImage) {
  return Promise.all([
    waitForImage(jacobImage),
    waitForImage(jacobProfileImage),
    waitForImage(jacobActionIconImage),
    waitForImage(jacobIndicatorImage)
  ]);
}

export function createJacobPlayerState(createStatuses, translate) {
  return {
    id: "player",
    characterId: JACOB_CHARACTER_ID,
    name: translate("menu_character_jacob"),
    hp: JACOB_STARTING_STATS.hp,
    maxHp: JACOB_STARTING_STATS.maxHp,
    sp: JACOB_STARTING_STATS.sp,
    maxSp: JACOB_STARTING_STATS.maxSp,
    luckyCharges: 0,
    maxLuckyCharges: 0,
    shadowCharge: 0,
    maxShadowCharge: 0,
    baseActionsPerTurn: JACOB_STARTING_STATS.baseActionsPerTurn,
    turnStartActionsRemaining: JACOB_STARTING_STATS.baseActionsPerTurn,
    actionProgress: 0,
    actionsRemaining: JACOB_STARTING_STATS.baseActionsPerTurn,
    renderOffsetX: 0,
    renderOffsetY: 0,
    currentGlobalTurn: 1,
    blockParryReady: false,
    defendActiveUntilTurn: 0,
    guardDefenseUntilTurn: 0,
    goalBreakPending: false,
    shadow: null,
    attributes: {
      defense: JACOB_BASE_DEFENSE,
      fireImmunity: false,
      flying: false,
      mobile: false
    },
    statuses: createStatuses(),
    inventory: createPlayerInventoryState(),
    unlockedActions: createJacobUnlockedActionState(),
    actions: JACOB_ACTIONS.map((action) => ({ ...action }))
  };
}

export function createJacobUnlockedActionState() {
  return Object.fromEntries(JACOB_STARTING_UNLOCKED_ACTION_IDS.map((actionId) => [actionId, true]));
}

export function isJacobActionUnlocked(player, actionId) {
  if ([
    "ball-menu",
    "ball-menu-back",
    "support-menu",
    "support-menu-back",
    "inventory-menu",
    "inventory-menu-back",
    "kick"
  ].includes(actionId)) {
    return true;
  }

  return !!player?.unlockedActions?.[actionId];
}

export function unlockJacobAction(player, actionId) {
  if (!player?.unlockedActions) {
    player.unlockedActions = {};
  }

  player.unlockedActions[actionId] = true;
}

export function getJacobVisibleActions(player, actionMenu = "root") {
  const actionById = new Map(JACOB_ACTIONS.map((action) => [action.id, action]));
  if (actionMenu === "inventory") {
    return getInventoryMenuActions(player, {
      id: "inventory-menu-back",
      labelKey: "action_back",
      actionType: "menu-back",
      iconId: "inventory-menu-back"
    });
  }

  if (actionMenu === "ball") {
    return getJacobSubmenuActions(player, JACOB_BALL_ACTION_IDS, {
      id: "ball-menu-back",
      labelKey: "action_back",
      actionType: "menu-back",
      iconId: "ball-menu-back"
    }, actionById);
  }

  if (actionMenu === "support") {
    return getJacobSubmenuActions(player, JACOB_SUPPORT_ACTION_IDS, {
      id: "support-menu-back",
      labelKey: "action_back",
      actionType: "menu-back",
      iconId: "support-menu-back"
    }, actionById).map((action) => {
      if (action.id === "guard" && !canJacobUseGuard(player)) {
        return {
          ...action,
          disabledInSolo: true
        };
      }

      return action;
    });
  }

  const rootActions = [];
  const visibleBallActions = getJacobUnlockedActions(player, JACOB_BALL_ACTION_IDS, actionById);
  if (visibleBallActions.length > 1) {
    rootActions.push(actionById.get("ball-menu"));
  } else if (visibleBallActions.length === 1) {
    rootActions.push(visibleBallActions[0]);
  }

  rootActions.push(getJacobDisplayedAction(actionById.get("defend"), player));

  const visibleSupportActions = getJacobUnlockedActions(player, JACOB_SUPPORT_ACTION_IDS, actionById);
  if (visibleSupportActions.length > 0) {
    rootActions.push(actionById.get("support-menu"));
  }
  if (isJacobActionUnlocked(player, "goal")) {
    rootActions.push(getJacobDisplayedAction(actionById.get("goal"), player));
  }

  rootActions.push(actionById.get("inventory-menu"));
  return rootActions.filter(Boolean);
}

export function canJacobUseDefend(player) {
  return (player?.actionsRemaining ?? 0) === (player?.turnStartActionsRemaining ?? 0);
}

export function canJacobUseGuard(player) {
  return (player?.shadow?.hp ?? 0) > 0;
}

export function getJacobBallBaseDamage(unit) {
  return JACOB_BALL_BASE_DAMAGE + getJacobUpgradeRank(unit, "applied-force") * JACOB_APPLIED_FORCE_DAMAGE_GAIN;
}

export function getJacobBallWindowBonusStep(unit) {
  return 0.2 + getJacobUpgradeRank(unit, "applied-force") * JACOB_APPLIED_FORCE_WINDOW_BONUS_GAIN;
}

export function getJacobMeleeDodgeWindowBonus(unit) {
  const rank = getJacobUpgradeRank(unit, "dribbling-mastery");
  return {
    green: rank * JACOB_DRIBBLING_MELEE_GREEN_GAIN,
    yellowPerSide: rank * JACOB_DRIBBLING_MELEE_YELLOW_GAIN
  };
}

export function getJacobRangedDodgeWindowBonus(unit) {
  const rank = getJacobUpgradeRank(unit, "dribbling-mastery");
  return {
    greenTiles: rank * JACOB_DRIBBLING_RANGED_WINDOW_GAIN,
    yellowTiles: rank * JACOB_DRIBBLING_RANGED_WINDOW_GAIN
  };
}

export function getJacobEnduranceMaxHp(unit) {
  return Math.min(JACOB_MAX_HP_CAP, JACOB_STARTING_STATS.maxHp + getJacobUpgradeRank(unit, "endurance-training") * JACOB_ENDURANCE_HP_GAIN);
}

export function getJacobDefenseValue(unit, aliveTeammates = 0, currentTurn = 0) {
  const safeTurn = Math.max(0, Math.floor(Number(currentTurn) || 0));
  const baseDefense = JACOB_BASE_DEFENSE;
  const teammateDefense = Math.min(
    JACOB_TEAMMATE_DEFENSE_CAP,
    Math.max(0, Math.floor(Number(aliveTeammates) || 0)) * JACOB_TEAMMATE_DEFENSE_GAIN
  );
  const enduranceDefense = getJacobUpgradeRank(unit, "endurance-training") * JACOB_ENDURANCE_DEFENSE_GAIN;
  const defendDefense = Number(unit?.defendActiveUntilTurn) >= safeTurn ? 1 : 0;
  const guardDefense = Number(unit?.guardDefenseUntilTurn) >= safeTurn ? 1 : 0;

  return Math.max(0, baseDefense + teammateDefense + enduranceDefense + defendDefense + guardDefense);
}

function getJacobUpgradeRank(unit, upgradeId) {
  return unit?.upgrades?.[upgradeId] ?? 0;
}

function getJacobUnlockedActions(player, actionIds, actionById) {
  return actionIds
    .filter((actionId) => isJacobActionUnlocked(player, actionId))
    .map((actionId) => getJacobDisplayedAction(actionById.get(actionId), player))
    .filter(Boolean);
}

function getJacobSubmenuActions(player, actionIds, backAction, actionById) {
  return [
    ...getJacobUnlockedActions(player, actionIds, actionById),
    backAction
  ];
}

function getJacobDisplayedAction(action, player) {
  if (!action) {
    return null;
  }

  if (action.id === "defend" && isJacobActionUnlocked(player, "block")) {
    return {
      ...action,
      inspectId: "block"
    };
  }

  if (action.id === "group-buff" && isJacobActionUnlocked(player, "group-buff-upgrade")) {
    return {
      ...action,
      inspectId: "group-buff-upgrade"
    };
  }

  return { ...action };
}
