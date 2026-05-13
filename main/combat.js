import { t } from "./lang.js";
import { createEnemiesForLevel, createEnemySummon, getEnemyPosition } from "./enemy.js";
import {
  addInventoryItem,
  BOMB_ITEM_ID,
  BURGER_ITEM_ID,
  CHERRY_ITEM_ID,
  consumeInventoryItem,
  getInventoryMenuActions,
  SALAD_ITEM_ID
} from "./inventory.js";
import { getPlayerCompanionPosition, getPlayerPosition } from "./party.js";
import { getSceneMetrics, TILE_SIZE } from "./tile.js";
import {
  createJacobPlayerState,
  JACOB_ACTIONS,
  JACOB_ABILITY_REWARD_DEFINITIONS,
  JACOB_CHARACTER_ID,
  JACOB_MAX_HP_CAP,
  JACOB_UPGRADE_DEFINITIONS,
  createJacobUnlockedActionState,
  canJacobUseDefend,
  canJacobUseGuard,
  getJacobBallBaseDamage,
  getJacobBallWindowBonusStep,
  getJacobDefenseValue,
  getJacobEnduranceMaxHp,
  getJacobMeleeDodgeWindowBonus,
  getJacobRangedDodgeWindowBonus,
  getJacobVisibleActions,
  isJacobActionUnlocked,
  unlockJacobAction
} from "./player/jacob.js";
import {
  KOSTYA_ABILITY_REWARD_DEFINITIONS,
  KOSTYA_CHARACTER_ID,
  KOSTYA_MAX_HP_CAP,
  KOSTYA_SHADOW_SUMMON_SC_COST,
  KOSTYA_SHADOW_SUMMON_SP_COST,
  KOSTYA_UPGRADE_DEFINITIONS,
  createKostyaPlayerState,
  createKostyaShadowState,
  getKostyaVisibleActions,
  getKostyaCounterWindowBonusSize,
  getKostyaShadowBaseHp,
  getKostyaShadowBonusHealth,
  getKostyaCounterDamage,
  getKostyaCounterWindowSize,
  getKostyaDashBaseDamage,
  getKostyaShadowChargeGainRatio,
  getKostyaSwordBaseDamage,
  isKostyaActionUnlocked,
  unlockKostyaAction
} from "./player/kostya.js";
import {
  PATRICK_ACTIONS,
  PATRICK_ACES_MENU_ACTIONS,
  PATRICK_ABILITY_REWARD_DEFINITIONS,
  PATRICK_CHARACTER_ID,
  PATRICK_INVENTORY_MENU_ACTIONS,
  PATRICK_NEGATIVE_STATUS_KEYS,
  PATRICK_REVOLVER_MENU_ACTIONS,
  PATRICK_UPGRADE_DEFINITIONS,
  createPatrickPlayerState,
  formatRomanNumeral,
  getPatrickCoinFlipConfig,
  getPatrickCoinFlipLuckyChargeGain,
  getPatrickFeelinFineCleansedPower,
  getPatrickHeadsChancePercent,
  getPatrickMarkedDamageMultiplier,
  getPatrickMaxLuckyCharges,
  getPatrickRevolverBaseDamage,
  isPatrickActionUnlocked,
  unlockPatrickAction
} from "./player/patrick.js";

const PLAYER_ATTACK_DAMAGE = 5;
const RANGED_ATTACK_DAMAGE = 5;
const TIMED_ATTACK_DAMAGE = 5;
const ACTION_SKILL_BONUS_DAMAGE = 2;
const ENEMY_ATTACK_DAMAGE = 5;
const BOSS_SUMMON_CHANCE = 0.15;
const ENEMY_ITEM_DROP_CHANCE = 0.015;
const ENEMY_ACTION_DELAY_MS = 450;
const DODGE_TIMEOUT_MS = 4000;
const DODGE_MAX_VALUE = 100;
const DODGE_RATE_PER_MS = 0.13;
const DODGE_GREEN_WIDTH = 16;
const DODGE_YELLOW_PADDING = 13;
const DODGE_FORGIVENESS = 2;
const ACTION_CHECK_FORGIVENESS = 0;
const ACTION_CHECK_TIMEOUT_MS = 4000;
const MELEE_GREEN_WIDTH = 16;
const RANGED_GREEN_WIDTH = 16;
const REVOLVER_GREEN_WIDTH = 16;
const REVOLVER_YELLOW_PADDING = 13;
const RANGED_DRIFT_SPEED_PER_MS = 0.055;
const RANGED_DRIFT_DECAY_PER_MS = 0.00014;
const RANGED_JITTER_CHANGE_MIN_MS = 200;
const RANGED_JITTER_CHANGE_MAX_MS = 400;
const RANGED_NUDGE_STRENGTH = 9;
const RANGED_STOPSHOT_RATE_PER_MS = 0.14;
const TIMED_PULSE_DELAY_MIN_MS = 500;
const TIMED_PULSE_DELAY_MAX_MS = 2000;
const TIMED_PULSE_DURATION_MS = 620;
const TIMED_PULSE_BASE_OPACITY = 0.12;
const ENEMY_TIMED_DODGE_YELLOW_DISPLAY_HOLD_MS = 140;
const ENEMY_TIMED_PROJECTILE_SPEED_PX_PER_MS = (28 * TILE_SIZE) / 1000;
const ENEMY_TIMED_DODGE_YELLOW_MIN_TILES = 5.5;
const ENEMY_TIMED_DODGE_YELLOW_MAX_TILES = 7;
const ENEMY_TIMED_DODGE_VISUAL_YELLOW_MAX_TILES = 9;
const ENEMY_TIMED_DODGE_GREEN_MIN_TILES = 0;
const ENEMY_TIMED_DODGE_GREEN_MAX_TILES = 5.5;
const KOSTYA_DEEP_FOCUS_TIMED_COUNTER_MIN_TILES = 0;
const KOSTYA_DEEP_FOCUS_TIMED_COUNTER_MAX_TILES = 4;
const MAX_LEVEL = 50;
const STATUS_POWER_CAP = 10;
const STATUS_MAX_ACTIVE_COUNT = 9;
const STATUS_DEFAULT_DURATION = 3;
const STATUS_DAMAGE_STEP = 0.1;
const STUN_SKIP_CHANCE_STEP = 0.1;
const PATRICK_MAGNUM_SHOT_STUN_POWER = 10;
const PATRICK_MAGNUM_SHOT_BASE_TURNS = 1;
const PATRICK_SIX_SHOOTER_BASE_BULLETS = 3;
const PATRICK_DUAL_WIELDING_SLOWNESS_POWER = 2;
const PATRICK_DUAL_WIELDING_SLOWNESS_TURNS = 1;
const PATRICK_COIN_TOSS_DAMAGE_MULTIPLIER_MISS = 0;
const PATRICK_COIN_TOSS_DAMAGE_MULTIPLIER_YELLOW = 6;
const PATRICK_COIN_TOSS_DAMAGE_MULTIPLIER_GREEN = 9;
const PATRICK_ACE_OF_SPADES_SP_REGEN_POWER = 4;
const PATRICK_ACE_OF_SPADES_SP_REGEN_TURNS = 3;
const PATRICK_ACE_OF_SPADES_INSTANT_SP = 7;
const PATRICK_ACE_OF_DIAMONDS_ABSORPTION_POWER = 3;
const PATRICK_ACE_OF_DIAMONDS_STRENGTH_POWER = 3;
const PATRICK_ACE_OF_DIAMONDS_STATUS_TURNS = 4;
const PATRICK_ACE_OF_CLUBS_SLOWNESS_POWER = 1;
const PATRICK_ACE_OF_CLUBS_MARKED_POWER = 3;
const PATRICK_ACE_OF_CLUBS_STATUS_TURNS = 4;
const PATRICK_INSURANCE_HEAL = 7;
const PATRICK_INSURANCE_REGEN_POWER = 3;
const PATRICK_INSURANCE_REGEN_TURNS = 5;
const PATRICK_BURGER_HEAL = 10;
const PATRICK_BURGER_REGEN_POWER = 1;
const PATRICK_BURGER_REGEN_TURNS = 2;
const SALAD_CLEANSED_TURNS = 3;
const SALAD_CLEANSED_POWER = 10;
const CHERRY_FIRE_POWER = 5;
const CHERRY_FIRE_TURNS = 2;
const CHERRY_STRENGTH_POWER = 10;
const CHERRY_STRENGTH_TURNS = 2;
const BOMB_DAMAGE = 25;
const BOMB_STUN_POWER = 10;
const BOMB_STUN_TURNS = 2;
const BOMB_SELF_SLOWNESS_POWER = 2;
const BOMB_SELF_SLOWNESS_TURNS = 1;
const PATRICK_REGULAR_FRAME_DURATION_MS = 250;
const PATRICK_SLOWED_FRAME_DURATION_MS = 325;
const PATRICK_FASTER_FRAME_DURATION_MS = 175;
const PATRICK_COIN_FLIP_ANIMATION_DURATION_MS = 75 * 6;
const PATRICK_DODGE_ANIMATION_DURATION_MS = PATRICK_FASTER_FRAME_DURATION_MS * 2;
const PATRICK_DAMAGED_ANIMATION_DURATION_MS = PATRICK_FASTER_FRAME_DURATION_MS * 2;
const KOSTYA_CLASH_DODGE_ANIMATION_DURATION_MS = PATRICK_FASTER_FRAME_DURATION_MS * 2;
const KOSTYA_RANGED_DODGE_ANIMATION_DURATION_MS = PATRICK_FASTER_FRAME_DURATION_MS * 2;
const PATRICK_REVOLVER_FRAME_DURATION_MS = PATRICK_FASTER_FRAME_DURATION_MS;
const PATRICK_REVOLVER_INTRO_DURATION_MS = PATRICK_REVOLVER_FRAME_DURATION_MS * 2;
const PATRICK_REVOLVER_OUTRO_DURATION_MS = PATRICK_REVOLVER_FRAME_DURATION_MS * 3;
const KOSTYA_KATANA_FRAME_DURATION_MS = 90;
const KOSTYA_KATANA_INTRO_DURATION_MS = 0;
const KOSTYA_KATANA_OUTRO_DURATION_MS = KOSTYA_KATANA_FRAME_DURATION_MS * 3;
const KOSTYA_SHADOW_SUMMON_ANIMATION_DURATION_MS = PATRICK_REGULAR_FRAME_DURATION_MS * 2;
const KOSTYA_SHADOW_SUMMON_FADE_DURATION_MS = KOSTYA_KATANA_FRAME_DURATION_MS * 3;
const PATRICK_FEELIN_FINE_ANIMATION_DURATION_MS = 125 * 4;
const PATRICK_ACE_CAST_ANIMATION_DURATION_MS = PATRICK_REGULAR_FRAME_DURATION_MS * 4;
const PATRICK_ACE_CARD_EFFECT_DURATION_MS = PATRICK_REGULAR_FRAME_DURATION_MS * 4;
const PATRICK_COIN_TOSS_FLIP_DURATION_MS = PATRICK_REGULAR_FRAME_DURATION_MS;
const PATRICK_COIN_TOSS_REVOLVER_INTRO_DURATION_MS = PATRICK_REVOLVER_FRAME_DURATION_MS * 2;
const PATRICK_COIN_TOSS_SHOT_DURATION_MS = PATRICK_FASTER_FRAME_DURATION_MS;
const PATRICK_COIN_TOSS_COIN_AIR_DURATION_MS = 1200;
const PATRICK_COIN_TOSS_CHECKPOINT_X_TILES = 8;
const PATRICK_COIN_TOSS_CHECKPOINT_Y_TILES = 8;
const PATRICK_COIN_TOSS_END_X_TILES = 10;
const PATRICK_COIN_TOSS_GREEN_WINDOW_RADIUS_TILES = 1;
const PATRICK_COIN_TOSS_YELLOW_WINDOW_RADIUS_TILES = 2;
const PATRICK_DUAL_WIELD_INTRO_DURATION_MS = PATRICK_REVOLVER_FRAME_DURATION_MS * 2;
const PATRICK_DUAL_WIELD_SECOND_SHOT_DURATION_MS = PATRICK_REVOLVER_FRAME_DURATION_MS * 3;
const PATRICK_DUAL_WIELD_OUTRO_DURATION_MS = PATRICK_REVOLVER_FRAME_DURATION_MS * 3;
const DEBUG_SLOW_MO_FACTOR = 0.35;
const PATRICK_PROJECTILE_SPEED_PX_PER_MS = (64 * 32) / 1000;
const PATRICK_PROJECTILE_MIN_DURATION_MS = 80;
const PATRICK_MUZZLE_FLASH_DURATION_MS = 80;
const PATRICK_FEELIN_FINE_CLEANSED_TURNS = 3;
const PATRICK_HALLOW_MARKED_POWER = 3;
const PATRICK_HALLOW_MARKED_TURNS = 2;
const SLOT_MACHINE_MAX_HP_GAIN = 7;
const SLOT_MACHINE_WEAKNESS_TOLERANCE_STEP = 0.5;
const KOSTYA_COUNTER_GREEN_SIDE_SHRINK = 1.5;
const KOSTYA_SLASH_SP_COST = 8;
const KOSTYA_LUNGE_SP_COST = 16;
const KOSTYA_LUNGE_STUN_POWER = 5;
const KOSTYA_LUNGE_STUN_TURNS = 2;
const KOSTYA_DECAY_CURSE_SP_COST = 16;
const KOSTYA_DECAY_CURSE_SC_COST = 20;
const KOSTYA_DECAY_CURSE_POWER = 3;
const KOSTYA_DECAY_CURSE_TURNS = 4;
const KOSTYA_CRIPPLING_STAB_SP_COST = 32;
const KOSTYA_CRIPPLING_STAB_SC_COST = 50;
const KOSTYA_CRIPPLING_STAB_SLOWNESS_POWER = 1;
const KOSTYA_CRIPPLING_STAB_SLOWNESS_TURNS = 2;
const KOSTYA_ACTION_RECALL_SP_COST = 24;
const KOSTYA_ACTION_RECALL_SC_COST = 30;
const KOSTYA_MASS_INFECTION_SP_COST = 24;
const KOSTYA_MASS_INFECTION_SC_COST = 40;
const KOSTYA_MASS_INFECTION_DECAY_POWER = 2;
const KOSTYA_MASS_INFECTION_DECAY_TURNS = 3;
const KOSTYA_MASS_INFECTION_PROJECTILE_SPEED_PX_PER_MS = (42 * TILE_SIZE) / 1000;
const KOSTYA_DARK_PLATING_SP_COST = 32;
const KOSTYA_DARK_PLATING_SC_COST = 50;
const KOSTYA_DARK_PLATING_SPEED_POWER = 2;
const KOSTYA_DARK_PLATING_SPEED_TURNS = 1;
const KOSTYA_DEEP_FOCUS_SP_COST = 56;
const KOSTYA_DEEP_FOCUS_COUNTER_WINDOW_BONUS = 2;
const KOSTYA_DEEP_FOCUS_COUNTER_DAMAGE_MULTIPLIER = 5;
const KOSTYA_SHADOW_TARGET_WEIGHT = 0.525;
const KOSTYA_FIELD_PROMOTION_SP_COST = 48;
const KOSTYA_FIELD_PROMOTION_SC_COST = 80;
const KOSTYA_FIELD_PROMOTION_MISSING_HP_RATIO = 0.15;
const KOSTYA_FIELD_PROMOTION_MISSING_SHP_RATIO = 0.1;
const KOSTYA_FIELD_PROMOTION_POWER_GAIN = 1;
const KOSTYA_FIELD_PROMOTION_MAX_POWER = 10;
const KOSTYA_FIELD_PROMOTION_EFFECT_DURATION_MS = 360;
const PLAYER_SOFTLOCK_SP_COMPENSATION = 8;
const JACOB_BLOCK_SP_GAIN = 4;
const JACOB_BLOCK_UPGRADED_SP_GAIN = 6;
const JACOB_BLOCK_RESISTANCE_POWER = 5;
const JACOB_BLOCK_SPEED_POWER = 1;
const JACOB_BLOCK_SPEED_TURNS = 2;
const JACOB_GROUP_BUFF_COST = 16;
const JACOB_GROUP_BUFF_UPGRADED_COST = 20;
const JACOB_GROUP_BUFF_STRENGTH_POWER = 4;
const JACOB_GROUP_BUFF_STRENGTH_TURNS = 4;
const JACOB_GROUP_BUFF_UPGRADED_STRENGTH_POWER = 6;
const JACOB_GROUP_BUFF_UPGRADED_STRENGTH_TURNS = 5;
const JACOB_GROUP_BUFF_SPEED_POWER = 2;
const JACOB_GROUP_BUFF_SPEED_TURNS = 2;
const JACOB_GOOD_VIBES_COST = 24;
const JACOB_GOOD_VIBES_BASE_HEAL = 8;
const JACOB_GOOD_VIBES_TEAM_HEAL = 4;
const JACOB_GOOD_VIBES_HEAL_CAP = 16;
const JACOB_GOOD_VIBES_REGEN_POWER = 2;
const JACOB_GOOD_VIBES_REGEN_TURNS = 2;
const JACOB_GOOD_VIBES_CLEANSED_POWER = 5;
const JACOB_GOOD_VIBES_CLEANSED_TURNS = 2;
const JACOB_GOOD_VIBES_SLOWNESS_POWER = 2;
const JACOB_GOOD_VIBES_SLOWNESS_TURNS = 1;
const JACOB_FIREBALL_COST = 8;
const JACOB_FIREBALL_BASE_POWER = 4;
const JACOB_FIREBALL_TURNS = 4;
const JACOB_SLOWBALL_COST = 8;
const JACOB_SLOWBALL_BASE_POWER = 1;
const JACOB_SLOWBALL_TURNS = 4;
const JACOB_CORNER_SHOT_COST = 16;
const JACOB_GOAL_COST = 28;
const JACOB_GOAL_HP = 50;
const JACOB_GOAL_TARGET_WEIGHT = 0.2;
const JACOB_GOAL_BREAK_RESISTANCE_POWER = 4;
const JACOB_GOAL_BREAK_ABSORPTION_POWER = 2;
const JACOB_GOAL_BREAK_TURNS = 4;
const JACOB_FRIENDLY_CHATTER_COST = 28;
const JACOB_FRIENDLY_CHATTER_REGEN_POWER = 4;
const JACOB_FRIENDLY_CHATTER_ABSORPTION_POWER = 2;
const JACOB_FRIENDLY_CHATTER_TURNS = 3;
const JACOB_GUARD_COST = 32;
const JACOB_GUARD_SP_REGEN_POWER = 1;
const JACOB_GUARD_TURNS = 3;
const JACOB_VOLLEY_COST = 36;
const JACOB_VOLLEY_STUN_POWER = 4;
const JACOB_VOLLEY_STUN_MAX_TURNS = 3;
const JACOB_BALL_PROJECTILE_SPEED_PX_PER_MS = (52 * TILE_SIZE) / 1000;
const JACOB_BALL_MIN_DURATION_MS = 140;
const JACOB_BALL_BAR_DURATION_MS = 2325;
const JACOB_BALL_START_SPEED_MULTIPLIER = 1.1;
const JACOB_BALL_WINDOW_ORIGIN_RANDOM_OFFSET = 5;
const SFX_PATHS = {
  skillCheck: "sound/sfx/skill_check.mp3",
  coinFlip: "sound/sfx/coin_flip.mp3",
  lockNLoad: "sound/sfx/lock_n_load.mp3",
  massInfection: "sound/sfx/charge.mp3",
  revolverShot: "sound/sfx/revolver_shot.mp3",
  impact: "sound/sfx/impact.mp3",
  dodge: "sound/sfx/dodge.mp3",
  clash: "sound/sfx/clash.mp3",
  counter: "sound/sfx/counter.mp3",
  supercounter: "sound/sfx/supercounter.mp3",
  swordDrawn: "sound/sfx/sword_drawn.mp3",
  swordSlash: "sound/sfx/sword_slash.mp3",
  bling: "sound/sfx/bling.mp3",
  damSon: "sound/sfx/dam_son.mp3",
  fingerSnap: "sound/sfx/finger_snap.mp3",
  skillFailed: "sound/sfx/skill_failed.mp3",
  summon: "sound/sfx/summon.mp3",
  block: "sound/sfx/block.mp3",
  parry: "sound/sfx/parry.mp3",
  ball: "sound/sfx/ball.mp3",
  bounce: "sound/sfx/bounce.mp3"
};
const SFX_VOLUME_STORAGE_KEY = "burger-dungeon-sfx-volume";
const DEFAULT_SFX_VOLUME = 0.5;
const SFX_POOL_SIZE = 3;
const AUDIO_PRELOAD_TIMEOUT_MS = 15000;
const MELEE_CONTACT_HOLD_MS = 120;
const MELEE_DESIRED_CENTER_GAP_PX = 80;
const MELEE_MOVE_SPEED_PX_PER_MS = 0.52;
const MELEE_MIN_TRAVEL_DURATION_MS = 90;
const LEVEL_MUSIC_GENERIC_KEY = "generic";
const LEVEL_MUSIC_FINAL_STAND_KEY = "final-stand";
const LEVEL_MUSIC_FINAL_STAND_ALT_KEY = "final-stand-alt";
const LEVEL_MUSIC_FINAL_STAND_ALT_CHANCE = 1 / 3;
const sfxAudioPools = new Map();
const sfxAudioPreloadPromises = new Map();
const sfxAudioReservationState = new WeakMap();

export const STATUS_KEYS = [
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

export const PLAYER_ACTIONS = [
  {
    id: "attack",
    labelKey: "action_attack",
    baseDamage: PLAYER_ATTACK_DAMAGE,
    bonusDamage: ACTION_SKILL_BONUS_DAMAGE,
    requiresTarget: true
  },
  {
    id: "ranged-attack",
    labelKey: "action_ranged",
    baseDamage: RANGED_ATTACK_DAMAGE,
    bonusDamage: ACTION_SKILL_BONUS_DAMAGE,
    requiresTarget: true
  },
  {
    id: "timed-attack",
    labelKey: "action_timed",
    baseDamage: TIMED_ATTACK_DAMAGE,
    bonusDamage: ACTION_SKILL_BONUS_DAMAGE,
    requiresTarget: true
  }
];

const PHASE = {
  PLAYER_TURN: "player-turn",
  PLAYER_ACTION: "player-action",
  ENEMY_TURN: "enemy-turn",
  ENEMY_ACTION: "enemy-action",
  UPGRADE: "upgrade",
  BATTLE_OVER: "battle-over"
};

export function createBattleState(characterId = PATRICK_CHARACTER_ID, options = {}) {
  const level = 1;
  const player = createPlayerUnitState(characterId, options);
  const actions = getRootPlayerActions(characterId, player);

  return {
    level,
    levelSeed: createLevelSeed(level),
    musicTrackKey: getMusicTrackKeyForLevel(level),
    musicTrackResumeKey: null,
    globalTurn: 1,
    turnOwner: "player",
    phase: PHASE.PLAYER_TURN,
    message: t("battle_level_begins", { level }),
    battleOver: false,
    gameWon: false,
    hoveredActionId: null,
    hoveredEnemyId: null,
    pendingTargetActionId: null,
    lockedTargetEnemyId: null,
    targetSelectionMouseMoved: false,
    skillFeedback: null,
    projectileEffects: [],
    actionMenu: "root",
    actionScrollOffset: 0,
    upgradePoints: 0,
    pendingUpgradeSelection: false,
    uiMode: "play",
    inspectedActionId: null,
    upgradeCatalog: getUpgradeCatalog(characterId),
    rewardSelectionType: null,
    rewardSelectionCatalog: null,
    pendingAbilityConfirmId: null,
    dodgeCheck: null,
    actionCheck: null,
    deepFocusActive: false,
    debugSlowMo: false,
    enemyTurnToken: 0,
    player,
    actions,
    visibleActions: actions,
    enemies: createEnemiesForLevel(level, createEmptyStatuses)
  };
}

export function applyStatusToUnit(unit, statusKey, power, turns = STATUS_DEFAULT_DURATION) {
  if (!STATUS_KEYS.includes(statusKey) || !unit?.statuses) {
    return;
  }

  const clampedPower = Math.max(0, Math.min(STATUS_POWER_CAP, Math.floor(power)));
  const normalizedTurns = Math.max(0, Math.floor(turns));
  if (statusKey === "fire" && hasFireImmunity(unit)) {
    return;
  }
  if (shouldBlockNegativeStatus(unit, statusKey, clampedPower)) {
    return;
  }
  applyResolvedStatus(unit, statusKey, clampedPower, normalizedTurns);
}

export function addStatusPowerToUnit(unit, statusKey, powerIncrease, turns = STATUS_DEFAULT_DURATION) {
  if (!STATUS_KEYS.includes(statusKey) || !unit?.statuses) {
    return;
  }

  const normalizedIncrease = Math.max(0, Math.floor(powerIncrease));
  const normalizedTurns = Math.max(0, Math.floor(turns));
  if (statusKey === "fire" && hasFireImmunity(unit)) {
    return;
  }
  if (shouldBlockNegativeStatus(unit, statusKey, normalizedIncrease)) {
    return;
  }
  const current = unit.statuses[statusKey];
  applyResolvedStatus(
    unit,
    statusKey,
    Math.min(STATUS_POWER_CAP, (current?.power ?? 0) + normalizedIncrease),
    Math.max(current?.turns ?? 0, normalizedTurns)
  );
}

export function setStatusOnUnit(unit, statusKey, power, turns = STATUS_DEFAULT_DURATION) {
  if (!STATUS_KEYS.includes(statusKey) || !unit?.statuses) {
    return;
  }

  const normalizedPower = Math.max(0, Math.min(STATUS_POWER_CAP, Math.floor(power)));
  const normalizedTurns = Math.max(0, Math.floor(turns));
  if (statusKey === "fire" && hasFireImmunity(unit)) {
    return;
  }
  if (shouldBlockNegativeStatus(unit, statusKey, normalizedPower)) {
    return;
  }
  applyResolvedStatus(unit, statusKey, normalizedPower, normalizedTurns, { forceExact: true });
}

function applyResolvedStatus(unit, statusKey, power, turns, { forceExact = false } = {}) {
  const normalizedPower = Math.max(0, Math.min(STATUS_POWER_CAP, Math.floor(power)));
  const normalizedTurns = Math.max(0, Math.floor(turns));
  const current = unit?.statuses?.[statusKey];
  if (!current) {
    return;
  }

  if (normalizedPower <= 0 || normalizedTurns <= 0) {
    clearStatusEntry(current);
    return;
  }

  const currentActive = isStatusActive(statusKey, current);
  if (currentActive && shouldKeepExistingStatus(statusKey, current, normalizedPower, normalizedTurns)) {
    return;
  }

  if (!currentActive) {
    const weakestStatusKey = getWeakestReplaceableStatusKey(unit);
    if (weakestStatusKey && !canCandidateReplaceStatus(statusKey, normalizedPower, normalizedTurns, weakestStatusKey, unit.statuses[weakestStatusKey])) {
      return;
    }

    if (weakestStatusKey) {
      clearStatusEntry(unit.statuses[weakestStatusKey]);
    }
  }

  current.power = forceExact ? normalizedPower : Math.max(current.power, normalizedPower);
  current.turns = forceExact ? normalizedTurns : Math.max(current.turns, normalizedTurns);
  if (statusKey === "absorption") {
    current.points = getAbsorptionPointsForPower(unit, current.power);
  }
}

function clearStatusEntry(status) {
  status.power = 0;
  status.turns = 0;
  if ("points" in status) {
    status.points = 0;
  }
}

function isStatusActive(statusKey, status) {
  if (!status || status.power <= 0 || status.turns <= 0) {
    return false;
  }

  return statusKey !== "absorption" || (status.points ?? 0) > 0;
}

function shouldKeepExistingStatus(statusKey, current, nextPower, nextTurns) {
  if (nextPower > current.power) {
    return false;
  }

  if (nextPower < current.power) {
    return true;
  }

  if (nextTurns > current.turns) {
    return false;
  }

  if (nextTurns < current.turns) {
    return true;
  }

  return true;
}

function getWeakestReplaceableStatusKey(unit) {
  const activeStatuses = STATUS_KEYS.filter((statusKey) => isStatusActive(statusKey, unit?.statuses?.[statusKey]));
  if (activeStatuses.length < STATUS_MAX_ACTIVE_COUNT) {
    return null;
  }

  return activeStatuses.reduce((weakestKey, statusKey) => {
    if (!weakestKey) {
      return statusKey;
    }

    return compareStatusStrength(statusKey, unit.statuses[statusKey], weakestKey, unit.statuses[weakestKey]) < 0
      ? statusKey
      : weakestKey;
  }, null);
}

function canCandidateReplaceStatus(candidateKey, candidatePower, candidateTurns, currentKey, currentStatus) {
  return compareStatusStrength(
    candidateKey,
    { power: candidatePower, turns: candidateTurns },
    currentKey,
    currentStatus
  ) > 0;
}

function compareStatusStrength(leftKey, leftStatus, rightKey, rightStatus) {
  const leftPower = Math.max(0, Math.floor(Number(leftStatus?.power) || 0));
  const rightPower = Math.max(0, Math.floor(Number(rightStatus?.power) || 0));
  if (leftPower !== rightPower) {
    return leftPower - rightPower;
  }

  const leftTurns = Math.max(0, Math.floor(Number(leftStatus?.turns) || 0));
  const rightTurns = Math.max(0, Math.floor(Number(rightStatus?.turns) || 0));
  if (leftTurns !== rightTurns) {
    return leftTurns - rightTurns;
  }

  const leftDebuff = isNegativeStatusKey(leftKey);
  const rightDebuff = isNegativeStatusKey(rightKey);
  if (leftDebuff !== rightDebuff) {
    return leftDebuff ? 1 : -1;
  }

  return 0;
}

export async function handleBattleAction(actionId, state, render, rebuildLevelScene, targetId = null, selectedAction = null) {
  if (!canPlayerAct(state)) {
    return;
  }

  state.phase = PHASE.PLAYER_ACTION;
  state.hoveredActionId = null;
  state.hoveredEnemyId = null;
  state.pendingTargetActionId = null;
  state.lockedTargetEnemyId = null;
  state.targetSelectionMouseMoved = false;
  render();

  const resolvedSelectedAction = selectedAction ?? getVisibleActionsForState(state).find((action) => action.id === actionId) ?? null;

  if (resolvedSelectedAction?.itemId) {
    const outcome = await performInventoryItemAction(resolvedSelectedAction, state, render);
    resolvePlayerActionOutcome(outcome, state, render, rebuildLevelScene);
    return;
  }

  if (state.player.characterId === JACOB_CHARACTER_ID) {
    const outcome = await handleJacobAction(actionId, state, render, targetId, resolvedSelectedAction);
    resolvePlayerActionOutcome(outcome, state, render, rebuildLevelScene);
    return;
  }

  if (state.player.characterId === PATRICK_CHARACTER_ID) {
    const outcome = await handlePatrickAction(actionId, state, render, targetId, resolvedSelectedAction);
    resolvePlayerActionOutcome(outcome, state, render, rebuildLevelScene);
    return;
  }

  const outcome = state.player.characterId === KOSTYA_CHARACTER_ID
    ? await handleKostyaAction(actionId, state, render, targetId, resolvedSelectedAction)
    : "continue";
  resolvePlayerActionOutcome(outcome, state, render, rebuildLevelScene);
}

export function handleBattleKeyDown(event, state, render) {
  if (state.pendingUpgradeSelection) {
    return;
  }

  if (event.code !== "Space") {
    return;
  }

  if (state.dodgeCheck?.active) {
    event.preventDefault();

    if (state.dodgeCheck.type === "timed") {
      finalizeDodgeCheck(state, render, { forcedResult: getTimedDodgeResultForDisplayedTier(state.dodgeCheck) });
      return;
    }

    state.dodgeCheck.isHolding = true;
    return;
  }

  if (!state.actionCheck?.active) {
    return;
  }

  event.preventDefault();

  if (state.actionCheck.type === "jacob-ball") {
    registerJacobBallInput(state);
    render();
    return;
  }

  if (state.actionCheck.type === "melee") {
    state.actionCheck.isHolding = true;
    return;
  }

  if (state.actionCheck.type === "ranged" || state.actionCheck.type === "revolver") {
    finalizeActionCheck(state, render);
    return;
  }

  if (state.actionCheck.type === "timed") {
    finalizeActionCheck(state, render, { forcedSuccess: state.actionCheck.timedVisible });
    return;
  }

  if (state.actionCheck.type === "timed-tiered") {
    finalizeActionCheck(state, render, { forcedTimedTier: getTimedActionTier(state.actionCheck) });
    return;
  }

  if (state.actionCheck.type === "coin-toss-air") {
    finalizeActionCheck(state, render);
  }
}

export function handleBattleKeyUp(event, state, render) {
  if (state.pendingUpgradeSelection) {
    return;
  }

  if (event.code !== "Space") {
    return;
  }

  if (state.dodgeCheck?.active) {
    event.preventDefault();
    state.dodgeCheck.isHolding = false;
    finalizeDodgeCheck(state, render);
    return;
  }

  if (!state.actionCheck?.active) {
    return;
  }

  if (state.actionCheck.type === "melee") {
    event.preventDefault();
    state.actionCheck.isHolding = false;
    finalizeActionCheck(state, render);
    return;
  }

  if (state.actionCheck.type === "ranged" || state.actionCheck.type === "revolver") {
    event.preventDefault();
  }
}

function getPlayerActions(characterId) {
  return PLAYER_ACTIONS;
}

function getRootPlayerActions(characterId, player) {
  if (characterId === JACOB_CHARACTER_ID) {
    return getJacobVisibleActions(player, "root");
  }

  if (characterId === PATRICK_CHARACTER_ID) {
    return getPatrickRootActionsForPlayer(player);
  }

  if (characterId === KOSTYA_CHARACTER_ID) {
    return getKostyaVisibleActions(player, "root");
  }

  return player?.actions ?? getPlayerActions(characterId);
}

export function getVisibleActionsForState(state) {
  if (state?.player?.characterId === JACOB_CHARACTER_ID) {
    return getJacobVisibleActions(state.player, state?.actionMenu ?? "root");
  }

  if (state?.player?.characterId === PATRICK_CHARACTER_ID) {
    if (state?.actionMenu === "root") {
      return getPatrickRootActionsForPlayer(state.player);
    }

    if (state?.actionMenu === "revolver") {
      return getPatrickMenuActionsForPlayer(PATRICK_REVOLVER_MENU_ACTIONS, state.player);
    }

    if (state?.actionMenu === "aces") {
      return getPatrickMenuActionsForPlayer(PATRICK_ACES_MENU_ACTIONS, state.player);
    }

    if (state?.actionMenu === "inventory") {
      return getInventoryMenuActions(state.player, PATRICK_INVENTORY_MENU_ACTIONS[0] ?? null);
    }
  }

  if (state?.player?.characterId === KOSTYA_CHARACTER_ID) {
    return getKostyaVisibleActions(state.player, state?.actionMenu ?? "root");
  }

  if (state?.actionMenu === "inventory") {
    return getInventoryMenuActions(state.player, {
      id: "inventory-menu-back",
      labelKey: "action_back",
      actionType: "menu-back",
      iconId: "inventory-menu-back"
    });
  }

  return state?.actions ?? [];
}

function getPatrickMenuActionsForPlayer(actions, player) {
  return actions.filter((action) => action.actionType === "menu-back" || isPatrickActionUnlocked(player, action.id));
}

function getPatrickRootActionsForPlayer(player) {
  const actionById = new Map(PATRICK_ACTIONS.map((action) => [action.id, action]));
  const rootActions = [];

  rootActions.push(actionById.get("coin-flip"));
  rootActions.push(...getPatrickRootGroupActions(PATRICK_REVOLVER_MENU_ACTIONS, player, "revolver-menu", "revolver-shot", actionById));

  if (isPatrickActionUnlocked(player, "feelin-fine")) {
    rootActions.push(actionById.get("feelin-fine"));
  }

  rootActions.push(...getPatrickRootGroupActions(PATRICK_ACES_MENU_ACTIONS, player, "aces-menu", "health-insurance", actionById));
  rootActions.push(actionById.get("inventory-menu"));

  return rootActions.filter(Boolean);
}

function getPatrickRootGroupActions(actions, player, menuActionId, rootActionId, rootActionMap) {
  const unlockedActions = actions.filter((action) => action.actionType !== "menu-back" && isPatrickActionUnlocked(player, action.id));
  if (unlockedActions.length <= 1) {
    return unlockedActions;
  }

  return [rootActionMap.get(menuActionId) ?? actions.find((action) => action.id === rootActionId) ?? unlockedActions[0]];
}

export function setActionMenu(state, menuId = "root") {
  state.actionMenu = menuId;
  state.actionScrollOffset = 0;
  state.visibleActions = getVisibleActionsForState(state);
  const inspectedActionStillVisible = state.visibleActions.some((action) => action.id === state.inspectedActionId);
  if (!inspectedActionStillVisible) {
    state.inspectedActionId = null;
  }
}

export function refillPlayerForDebug(state) {
  if (!state?.player) {
    return;
  }

  state.player.hp = state.player.maxHp;
  state.player.sp = state.player.maxSp;
  state.player.luckyCharges = state.player.maxLuckyCharges;
  state.player.shadowCharge = state.player.maxShadowCharge ?? state.player.shadowCharge ?? 0;
  if (state.player.shadow) {
    state.player.shadow.hp = state.player.shadow.maxHp;
    state.player.shadow.shp = state.player.shadow.maxShp ?? 0;
  }
}

export function setupKostyaCounterEasterEggDebug(state) {
  if (state?.player?.characterId !== KOSTYA_CHARACTER_ID) {
    return false;
  }

  state.player.hp = Math.min(1, state.player.maxHp ?? 1);
  state.player.counterWindowBonus = 10;

  state.enemies.forEach((enemy) => {
    if ((enemy?.hp ?? 0) > 0) {
      enemy.hp = 1;
    }
  });

  state.message = "Debug: Kostya and living enemies set to 1 HP. Counter window +10.";
  return true;
}

export function skipPlayerTurnForDebug(state, render, rebuildLevelScene) {
  if (
    state?.battleOver ||
    state?.gameWon ||
    state?.pendingUpgradeSelection ||
    state?.turnOwner !== "player" ||
    state?.phase !== PHASE.PLAYER_TURN ||
    state?.dodgeCheck?.active ||
    state?.actionCheck?.active
  ) {
    return false;
  }

  state.player.actionsRemaining = 0;
  state.message = "Debug: Player turn skipped.";
  finishPlayerTurn(state, render, rebuildLevelScene);
  return true;
}

export function triggerCounterFeedbackDebug(state) {
  if (!state) {
    return false;
  }

  showSkillFeedback(state, "counter");
  return true;
}

export function clearCurrentLevelForDebug(state, render, rebuildLevelScene) {
  state.enemies.forEach((enemy) => {
    enemy.hp = 0;
  });
  handleAllEnemiesDefeated(state, render, rebuildLevelScene);
}

function unlockPatrickMilestoneIfEligible(state) {
  if (state?.player?.characterId !== PATRICK_CHARACTER_ID) {
    return;
  }

  const defeatedBossThisLevel = state.level % 10 === 0 && state.level < MAX_LEVEL && state.enemies.some((enemy) => enemy.isBoss);
  if (!defeatedBossThisLevel) {
    return;
  }

  const unlockedRank = Math.max(0, Math.min(4, Math.floor(state.level / 10)));
  state.player.milestoneRank = Math.max(state.player.milestoneRank ?? 0, unlockedRank);
  applyPatrickMilestoneBonuses(state.player);
}

function unlockKostyaMilestoneIfEligible(state) {
  if (state?.player?.characterId !== KOSTYA_CHARACTER_ID) {
    return;
  }

  const defeatedBossThisLevel = state.level % 10 === 0 && state.level < MAX_LEVEL && state.enemies.some((enemy) => enemy.isBoss);
  if (!defeatedBossThisLevel) {
    return;
  }

  const unlockedRank = Math.max(0, Math.min(4, Math.floor(state.level / 10)));
  const previousRank = Math.max(0, Math.floor(Number(state.player.milestoneRank) || 0));
  state.player.milestoneRank = Math.max(previousRank, unlockedRank);
  if ((state.player.milestoneRank ?? 0) !== previousRank) {
    syncKostyaShadowDerivedStats(state.player, { refillOnIncrease: true });
  }
}

function awardBossBurgerIfEligible(state) {
  if (state.level % 10 !== 0 || !state.enemies.some((enemy) => enemy.isBoss)) {
    return;
  }

  addInventoryItem(state.player, BURGER_ITEM_ID, 1);
}

function applyPatrickMilestoneBonuses(player) {
  if (player?.characterId !== PATRICK_CHARACTER_ID) {
    return;
  }

  player.maxLuckyCharges = getPatrickMaxLuckyCharges(player);
  player.luckyCharges = Math.min(player.maxLuckyCharges, player.luckyCharges ?? 0);
}

export function teleportToLevelForDebug(state, render, rebuildLevelScene, targetLevel) {
  const level = Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(targetLevel) || 1)));

  state.level = level;
  state.levelSeed = createLevelSeed(level);
  state.musicTrackKey = getMusicTrackKeyForLevel(level);
  state.globalTurn = 1;
  state.turnOwner = "player";
  state.phase = PHASE.PLAYER_TURN;
  state.message = t("battle_level_begins", { level });
  state.battleOver = false;
  state.gameWon = false;
  state.hoveredActionId = null;
  state.hoveredEnemyId = null;
  state.pendingTargetActionId = null;
  state.lockedTargetEnemyId = null;
  state.targetSelectionMouseMoved = false;
  state.skillFeedback = null;
  state.projectileEffects = [];
  state.pendingUpgradeSelection = false;
  state.rewardSelectionType = null;
  state.rewardSelectionCatalog = null;
  state.pendingAbilityConfirmId = null;
  state.upgradePoints = 0;
  state.dodgeCheck = null;
  state.actionCheck = null;
  state.enemyTurnToken += 1;
  state.player.renderOffsetX = 0;
  state.player.renderOffsetY = 0;
  state.player.animationOverride = null;
  state.player.playerEffect = null;
  state.player.currentGlobalTurn = state.globalTurn;
  if (state.player.characterId === JACOB_CHARACTER_ID) {
    syncJacobDerivedStats(state.player, state.globalTurn);
  }
  state.enemies = createEnemiesForLevel(level, createEmptyStatuses);
  setActionMenu(state, "root");
  rebuildLevelScene();
  render();
}

function resolvePlayerActionOutcome(outcome, state, render, rebuildLevelScene) {
  const spentActions = typeof outcome === "object" && outcome !== null
    ? Math.max(1, outcome.spentActions ?? 1)
    : 1;
  const enemyDefeated = outcome === "enemy-defeated" || (typeof outcome === "object" && outcome?.enemyDefeated === true);

  if (enemyDefeated) {
    awardPendingEnemyDrops(state);
    state.player.actionsRemaining = Math.max(0, state.player.actionsRemaining - spentActions);

    if (state.enemies.some((enemy) => enemy.hp > 0)) {
      if (state.player.actionsRemaining > 0) {
        state.phase = PHASE.PLAYER_TURN;
        if (maybeSkipPlayerTurnForFlyingSoftlock(state, render, rebuildLevelScene)) {
          return;
        }
        state.message = t("battle_enemy_defeated_choose");
        render();
        return;
      }

      finishPlayerTurn(state, render, rebuildLevelScene);
      return;
    }

    handleAllEnemiesDefeated(state, render, rebuildLevelScene);
    return;
  }

  state.player.actionsRemaining = Math.max(0, state.player.actionsRemaining - spentActions);

  if (state.player.actionsRemaining > 0) {
    state.phase = PHASE.PLAYER_TURN;
    if (maybeSkipPlayerTurnForFlyingSoftlock(state, render, rebuildLevelScene)) {
      return;
    }
    state.message = t("battle_choose_action_remaining", { count: state.player.actionsRemaining });
    render();
    return;
  }

  finishPlayerTurn(state, render, rebuildLevelScene);
}

async function handleJacobAction(actionId, state, render, targetId = null, selectedAction = null) {
  const resolvedAction = selectedAction ?? getVisibleActionsForState(state).find((action) => action.id === actionId) ?? null;
  if (!resolvedAction) {
    return "continue";
  }

  if (resolvedAction.itemId) {
    return performInventoryItemAction(resolvedAction, state, render);
  }

  if (!isJacobActionUnlocked(state.player, actionId)) {
    return "continue";
  }

  if (actionId === "defend") {
    if (!canJacobUseDefend(state.player)) {
      return "continue";
    }
    return performJacobDefend(state, render);
  }

  if (actionId === "group-buff") {
    const costSp = isJacobActionUnlocked(state.player, "group-buff-upgrade")
      ? JACOB_GROUP_BUFF_UPGRADED_COST
      : JACOB_GROUP_BUFF_COST;
    if ((state.player.sp ?? 0) < costSp) {
      return "continue";
    }
    state.player.sp -= costSp;
    return performJacobGroupBuff(state, render);
  }

  if (actionId === "good-vibes") {
    if ((state.player.sp ?? 0) < JACOB_GOOD_VIBES_COST) {
      return "continue";
    }
    state.player.sp -= JACOB_GOOD_VIBES_COST;
    return performJacobGoodVibes(state, render);
  }

  if (actionId === "goal") {
    if ((state.player.sp ?? 0) < JACOB_GOAL_COST || (state.player.shadow?.hp ?? 0) > 0) {
      return "continue";
    }
    state.player.sp -= JACOB_GOAL_COST;
    return performJacobGoal(state, render);
  }

  if (actionId === "friendly-chatter") {
    if ((state.player.sp ?? 0) < JACOB_FRIENDLY_CHATTER_COST) {
      return "continue";
    }
    state.player.sp -= JACOB_FRIENDLY_CHATTER_COST;
    return performJacobFriendlyChatter(state, render);
  }

  if (actionId === "guard") {
    if ((state.player.sp ?? 0) < JACOB_GUARD_COST || !canJacobUseGuard(state.player)) {
      return "continue";
    }
    state.player.sp -= JACOB_GUARD_COST;
    return performJacobGuard(state, render);
  }

  const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
  if (!target) {
    return "continue";
  }

  if (actionId === "kick") {
    return performJacobBallAttack(state, render, target, { actionId: "kick" });
  }

  if (actionId === "fireball") {
    if ((state.player.sp ?? 0) < JACOB_FIREBALL_COST) {
      return "continue";
    }
    state.player.sp -= JACOB_FIREBALL_COST;
    return performJacobBallAttack(state, render, target, { actionId: "fireball" });
  }

  if (actionId === "slowball") {
    if ((state.player.sp ?? 0) < JACOB_SLOWBALL_COST) {
      return "continue";
    }
    state.player.sp -= JACOB_SLOWBALL_COST;
    return performJacobBallAttack(state, render, target, { actionId: "slowball" });
  }

  if (actionId === "corner-shot") {
    if ((state.player.sp ?? 0) < JACOB_CORNER_SHOT_COST) {
      return "continue";
    }
    state.player.sp -= JACOB_CORNER_SHOT_COST;
    return performJacobBallAttack(state, render, target, { actionId: "corner-shot" });
  }

  if (actionId === "volley") {
    if ((state.player.sp ?? 0) < JACOB_VOLLEY_COST) {
      return "continue";
    }
    state.player.sp -= JACOB_VOLLEY_COST;
    return performJacobBallAttack(state, render, target, { actionId: "volley" });
  }

  return "continue";
}

async function handlePatrickAction(actionId, state, render, targetId = null, selectedAction = null) {
  const resolvedAction = selectedAction ?? getVisibleActionsForState(state).find((action) => action.id === actionId) ?? null;
  if (![
    "coin-flip",
    "revolver-menu",
    "aces-menu",
    "inventory-menu",
    "revolver-menu-back",
    "aces-menu-back",
    "inventory-menu-back"
  ].includes(actionId) && !resolvedAction?.itemId && !isPatrickActionUnlocked(state.player, actionId)) {
    return "continue";
  }

  if (actionId === "coin-flip") {
    return performPatrickCoinFlip(state, render);
  }

  if (actionId === "revolver-shot") {
    const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
    if (!target || !canAffordPatrickAbility(state.player, { costSp: 0, costLucky: 1 })) {
      return "continue";
    }
    return performPatrickRevolver(state, render, target);
  }

  if (actionId === "piercing-shot") {
    if (!canAffordPatrickAbility(state.player, { costSp: 8, costLucky: 2 })) {
      return "continue";
    }
    return performPatrickPiercingShot(state, render);
  }

  if (actionId === "hallow-shot") {
    const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
    if (!target || !canAffordPatrickAbility(state.player, { costSp: 8, costLucky: 2 })) {
      return "continue";
    }
    return performPatrickHallowShot(state, render, target);
  }

  if (actionId === "magnum-shot") {
    const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
    if (!target || !canAffordPatrickAbility(state.player, { costSp: 16, costLucky: 3 })) {
      return "continue";
    }
    return performPatrickMagnumShot(state, render, target);
  }

  if (actionId === "six-shooter") {
    const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
    if (!target || !canAffordPatrickAbility(state.player, { costSp: 24, costLucky: 4 })) {
      return "continue";
    }
    return performPatrickSixShooter(state, render, target);
  }

  if (actionId === "dual-wielding") {
    const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
    if (!target || !canAffordPatrickAbility(state.player, { costSp: 16, costLucky: 3 })) {
      return "continue";
    }
    return performPatrickDualWielding(state, render, target);
  }

  if (actionId === "coin-toss") {
    const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
    if (!target || (state.player.luckyCharges ?? 0) < 6 || (state.player.sp ?? 0) < 32) {
      return "continue";
    }
    return performPatrickCoinToss(state, render, target);
  }

  if (actionId === "feelin-fine") {
    if (!canAffordPatrickAbility(state.player, { costSp: 8, costLucky: 2 })) {
      return "continue";
    }
    return performPatrickFeelinFine(state, render);
  }

  if (actionId === "health-insurance") {
    if (!canUsePatrickAceOfHearts(state.player) || !canAffordPatrickAbility(state.player, { costSp: 24, costLucky: 4 })) {
      return "continue";
    }
    return performPatrickHealthInsurance(state, render);
  }

  if (actionId === "ace-of-spades") {
    if (!canAffordPatrickAbility(state.player, { costSp: 0, costLucky: 4 })) {
      return "continue";
    }
    return performPatrickAceOfSpades(state, render);
  }

  if (actionId === "ace-of-diamonds") {
    if (!canAffordPatrickAbility(state.player, { costSp: 24, costLucky: 4 })) {
      return "continue";
    }
    return performPatrickAceOfDiamonds(state, render);
  }

  if (actionId === "ace-of-clubs") {
    if (!canAffordPatrickAbility(state.player, { costSp: 24, costLucky: 4 })) {
      return "continue";
    }
    return performPatrickAceOfClubs(state, render);
  }

  if (resolvedAction?.itemId) {
    return performInventoryItemAction(resolvedAction, state, render);
  }

  return "continue";
}

async function handleKostyaAction(actionId, state, render, targetId = null, selectedAction = null) {
  const resolvedAction = selectedAction ?? getVisibleActionsForState(state).find((action) => action.id === actionId) ?? null;
  if (!resolvedAction) {
    return "continue";
  }

  if (resolvedAction.itemId) {
    return performInventoryItemAction(resolvedAction, state, render);
  }

  if (!isKostyaActionUnlocked(state.player, actionId)) {
    return "continue";
  }

  if (["shadow", "ghost", "wraith"].includes(actionId)) {
    if (state.player.shadow?.hp > 0) {
      state.phase = PHASE.PLAYER_TURN;
      render();
      return "continue";
    }

    return performKostyaShadowSummon(state, render, actionId);
  }

  if (actionId === "field-promotion") {
    if (!canAffordKostyaAbility(state.player, { costSp: KOSTYA_FIELD_PROMOTION_SP_COST, costShadowCharge: KOSTYA_FIELD_PROMOTION_SC_COST })) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_FIELD_PROMOTION_SP_COST, costShadowCharge: KOSTYA_FIELD_PROMOTION_SC_COST });
    return performKostyaFieldPromotion(state, render);
  }

  if (actionId === "action-recall") {
    if (
      state.player.actionRecallReady
      || state.player.pendingActionRecall
      || !canAffordKostyaAbility(state.player, { costSp: KOSTYA_ACTION_RECALL_SP_COST, costShadowCharge: KOSTYA_ACTION_RECALL_SC_COST })
    ) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_ACTION_RECALL_SP_COST, costShadowCharge: KOSTYA_ACTION_RECALL_SC_COST });
    return performKostyaActionRecall(state, render);
  }

  if (actionId === "dark-plating") {
    if (!canAffordKostyaAbility(state.player, { costSp: KOSTYA_DARK_PLATING_SP_COST, costShadowCharge: KOSTYA_DARK_PLATING_SC_COST })) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_DARK_PLATING_SP_COST, costShadowCharge: KOSTYA_DARK_PLATING_SC_COST });
    return performKostyaDarkPlating(state, render);
  }

  if (actionId === "deep-focus") {
    if (!canUseKostyaDeepFocus(state.player) || !canAffordKostyaAbility(state.player, { costSp: KOSTYA_DEEP_FOCUS_SP_COST })) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_DEEP_FOCUS_SP_COST });
    return performKostyaDeepFocus(state, render);
  }

  if (actionId === "slash") {
    const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
    if (!target || !canAffordKostyaAbility(state.player, { costSp: KOSTYA_SLASH_SP_COST })) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_SLASH_SP_COST });
    return maybeTriggerKostyaActionRecall(
      state,
      render,
      await performMeleeAttack(state, render, target, {
        ...resolvedAction,
        baseDamage: getKostyaDashBaseDamage(state.player)
      })
    );
  }

  if (actionId === "lunge") {
    if (!canAffordKostyaAbility(state.player, { costSp: KOSTYA_LUNGE_SP_COST })) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_LUNGE_SP_COST });
    return maybeTriggerKostyaActionRecall(
      state,
      render,
      await performKostyaLunge(state, render, resolvedAction)
    );
  }

  if (actionId === "decay-curse") {
    if (!canAffordKostyaAbility(state.player, { costSp: KOSTYA_DECAY_CURSE_SP_COST, costShadowCharge: KOSTYA_DECAY_CURSE_SC_COST })) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_DECAY_CURSE_SP_COST, costShadowCharge: KOSTYA_DECAY_CURSE_SC_COST });
    return maybeTriggerKostyaActionRecall(
      state,
      render,
      await performKostyaDecayCurse(state, render, {
        ...resolvedAction,
        baseDamage: getKostyaSwordBaseDamage(state.player)
      })
    );
  }

  if (actionId === "crippling-stab") {
    if (!canAffordKostyaAbility(state.player, { costSp: KOSTYA_CRIPPLING_STAB_SP_COST, costShadowCharge: KOSTYA_CRIPPLING_STAB_SC_COST })) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_CRIPPLING_STAB_SP_COST, costShadowCharge: KOSTYA_CRIPPLING_STAB_SC_COST });
    return maybeTriggerKostyaActionRecall(
      state,
      render,
      await performKostyaCripplingStab(state, render)
    );
  }

  if (actionId === "mass-infection") {
    if (!canAffordKostyaAbility(state.player, { costSp: KOSTYA_MASS_INFECTION_SP_COST, costShadowCharge: KOSTYA_MASS_INFECTION_SC_COST })) {
      return "continue";
    }

    spendKostyaAbilityCost(state.player, { costSp: KOSTYA_MASS_INFECTION_SP_COST, costShadowCharge: KOSTYA_MASS_INFECTION_SC_COST });
    return maybeTriggerKostyaActionRecall(
      state,
      render,
      await performKostyaMassInfection(state, render)
    );
  }

  const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: true }) : getFrontLivingEnemy(state, { canTargetFlying: true });
  if (!target) {
    return "continue";
  }

  if (actionId === "ranged-attack") {
    return performRangedAttack(state, render, target);
  }

  if (actionId === "timed-attack") {
    return performTimedAttack(state, render, target);
  }

  return maybeTriggerKostyaActionRecall(
    state,
    render,
    await performMeleeAttack(state, render, target, resolvedAction)
  );
}

function createPlayerUnitState(characterId = PATRICK_CHARACTER_ID, options = {}) {
  const isSolo = options.isSolo === true;
  if (characterId === JACOB_CHARACTER_ID) {
    const player = createJacobPlayerState(createEmptyStatuses, t);
    player.upgrades = createCharacterUpgradeState(characterId);
    applySoloPlayerBonuses(player, isSolo);
    syncJacobDerivedStats(player, 1);
    return player;
  }

  if (characterId === PATRICK_CHARACTER_ID) {
    const player = createPatrickPlayerState(createEmptyStatuses, t);

    player.upgrades = createCharacterUpgradeState(characterId);
    applySoloPlayerBonuses(player, isSolo);
    return player;
  }

  if (characterId === KOSTYA_CHARACTER_ID) {
    const player = createKostyaPlayerState(createEmptyStatuses, t);
    player.upgrades = createCharacterUpgradeState(characterId);
    applySoloPlayerBonuses(player, isSolo);
    return player;
  }

  return {
    id: "player",
    characterId,
    name: t("player_name"),
    hp: 30,
    maxHp: 30,
    sp: 0,
    maxSp: 100,
    luckyCharges: 0,
    maxLuckyCharges: 0,
    baseActionsPerTurn: isSolo ? 2 : 1,
    turnStartActionsRemaining: isSolo ? 2 : 1,
    upgrades: createCharacterUpgradeState(characterId),
    actionProgress: 0,
    actionsRemaining: isSolo ? 2 : 1,
    renderOffsetX: 0,
    renderOffsetY: 0,
    attributes: {
      defense: 0,
      fireImmunity: false,
      flying: false,
      mobile: isSolo
    },
    statuses: createEmptyStatuses()
  };
}

function applySoloPlayerBonuses(player, isSolo = false) {
  if (!player) {
    return;
  }

  if (!player.attributes) {
    player.attributes = {
      defense: 0,
      fireImmunity: false,
      flying: false,
      mobile: false
    };
  }

  player.attributes.mobile = isSolo;
  player.baseActionsPerTurn = isSolo ? 2 : 1;
  player.turnStartActionsRemaining = player.baseActionsPerTurn;
  player.actionsRemaining = player.baseActionsPerTurn;
}

function beginEnemyTurn(state, render, rebuildLevelScene) {
  if (state.battleOver || state.gameWon) {
    return;
  }

  state.turnOwner = "enemy";
  state.phase = PHASE.ENEMY_TURN;
  state.hoveredActionId = null;
  state.enemyTurnToken += 1;
  const enemyTurnToken = state.enemyTurnToken;

  let skippedEnemyCount = 0;
  state.enemies.forEach((enemy) => {
    if (enemy.hp <= 0) {
      enemy.actionsRemaining = 0;
      return;
    }

    prepareUnitForTurn(enemy);
    if (shouldSkipTurnFromStun(enemy)) {
      enemy.actionsRemaining = 0;
      skippedEnemyCount += 1;
      completeUnitTurn(enemy);
    } else if (enemy.actionsRemaining <= 0) {
      completeUnitTurn(enemy);
    }
  });

  state.message = skippedEnemyCount > 0
    ? t("battle_enemy_turn_stunned")
    : t("battle_enemy_turn_begins");
  render();

  window.setTimeout(() => {
    runNextEnemyAction(state, render, rebuildLevelScene, enemyTurnToken);
  }, ENEMY_ACTION_DELAY_MS);
}

function runNextEnemyAction(state, render, rebuildLevelScene, enemyTurnToken) {
  if (
    state.battleOver ||
    state.gameWon ||
    state.enemyTurnToken !== enemyTurnToken ||
    state.phase === PHASE.BATTLE_OVER
  ) {
    render();
    return;
  }

  const actingEnemy = state.enemies.find((enemy) => enemy.hp > 0 && enemy.actionsRemaining > 0);

  if (!actingEnemy) {
    startNextPlayerTurn(state, render, rebuildLevelScene);
    return;
  }

  actingEnemy.actionsRemaining -= 1;
  state.phase = PHASE.ENEMY_ACTION;
  if (actingEnemy.isBoss && tryBossSummon(state, actingEnemy, render)) {
    if (actingEnemy.actionsRemaining <= 0) {
      completeUnitTurn(actingEnemy);
    }

    render();

    if (!state.enemies.some((enemy) => enemy.hp > 0 && enemy.actionsRemaining > 0)) {
      startNextPlayerTurn(state, render, rebuildLevelScene);
      return;
    }

    state.phase = PHASE.ENEMY_TURN;
    window.setTimeout(() => {
      runNextEnemyAction(state, render, rebuildLevelScene, enemyTurnToken);
    }, ENEMY_ACTION_DELAY_MS);
    return;
  }

  const attackProfile = getEnemyAttackProfile(actingEnemy);
  const defendingUnit = getFrontlineDefender(state);
  const deepFocusCounterEnabled = state.deepFocusActive
    && defendingUnit === state.player
    && state.player.characterId === KOSTYA_CHARACTER_ID;
  const shadowAbsorbsHit = defendingUnit === state.player.shadow;
  state.message = shadowAbsorbsHit
    ? t("battle_enemy_turn_begins")
    : deepFocusCounterEnabled
    ? t("battle_enemy_attack_deep_focus_prompt")
    : attackProfile.attackCheckType === "timed"
    ? t("battle_enemy_attack_timed_prompt")
    : defendingUnit === state.player && state.player.characterId === KOSTYA_CHARACTER_ID && attackProfile.attackStyle === "melee"
      ? t("battle_enemy_attack_counter_prompt")
      : t("battle_enemy_attack_prompt");

  const approachPromise = attackProfile.attackStyle === "melee"
    ? animateMeleeApproach(state, actingEnemy, defendingUnit, render)
    : Promise.resolve();

  approachPromise.then(() => {
    const dodgePromise = shadowAbsorbsHit
      ? attackProfile.attackCheckType === "timed"
        ? playEnemyTimedProjectileEffect(state, render, actingEnemy, defendingUnit).then(() => ({ result: "hit" }))
        : Promise.resolve({ result: "hit" })
      : deepFocusCounterEnabled
        ? attackProfile.attackCheckType === "timed"
          ? startTimedDodgeCheck(state, render, actingEnemy, defendingUnit, {
            allowCounter: true,
            counterOnly: true,
            timedWindowMinTiles: KOSTYA_DEEP_FOCUS_TIMED_COUNTER_MIN_TILES,
            timedWindowMaxTiles: KOSTYA_DEEP_FOCUS_TIMED_COUNTER_MAX_TILES,
            timedSuccessColor: "counter",
            timedNearColor: null
          })
          : startDodgeCheck(state, render, {
            attackStyle: attackProfile.attackStyle,
            allowCounter: true,
            counterOnly: true,
            counterWindowBonus: KOSTYA_DEEP_FOCUS_COUNTER_WINDOW_BONUS
          })
        : attackProfile.attackCheckType === "timed"
        ? startTimedDodgeCheck(state, render, actingEnemy, defendingUnit)
        : startDodgeCheck(state, render, {
          attackStyle: attackProfile.attackStyle,
          allowCounter: defendingUnit === state.player,
          defendingUnit
        });

    dodgePromise.then(async (dodgeResult) => {
      if (state.battleOver || state.gameWon || state.enemyTurnToken !== enemyTurnToken) {
        render();
        return;
      }

      const playerWouldBeKilledByHit = defendingUnit === state.player
        && state.player.characterId === KOSTYA_CHARACTER_ID
        && attackProfile.attackStyle === "melee"
        && wouldAttackBeLethal({
          attacker: actingEnemy,
          target: defendingUnit,
          baseDamage: attackProfile.baseDamage,
          attackStyle: attackProfile.attackStyle
        });
      const enemyHpBeforeCounter = actingEnemy.hp;
      const rawIncomingDamage = Math.max(
        0,
        Math.floor(attackProfile.baseDamage * getDamageMultiplier(actingEnemy, defendingUnit, attackProfile.attackStyle) * getDodgeDamageMultiplier(dodgeResult.result))
      );
      const defendedDamage = Math.min(rawIncomingDamage, getEffectiveDefenseValue(defendingUnit, attackProfile.attackStyle));
      const damageTaken = resolveDamageAgainstTarget({
        attacker: actingEnemy,
        target: defendingUnit,
        baseDamage: attackProfile.baseDamage,
        incomingMultiplier: getDodgeDamageMultiplier(dodgeResult.result),
        attackStyle: attackProfile.attackStyle
      });
      const counterDamage = dodgeResult.result === "counter"
        ? resolveDamageAgainstTarget({
          attacker: state.player,
          target: actingEnemy,
          baseDamage: getKostyaCounterDamage(state.player) * (deepFocusCounterEnabled ? KOSTYA_DEEP_FOCUS_COUNTER_DAMAGE_MULTIPLIER : 1),
          attackStyle: "melee"
        })
        : 0;
      let jacobParryAnimationPlayed = false;
      if (counterDamage > 0 && state.player.characterId === KOSTYA_CHARACTER_ID) {
        gainKostyaShadowCharge(state.player, counterDamage);
      }
      if (defendingUnit === state.player && state.player.characterId === KOSTYA_CHARACTER_ID) {
        gainKostyaSp(state.player, dodgeResult.result === "counter" ? 16 : dodgeResult.result === "perfect" ? 8 : 0);
      } else if (
        defendingUnit === state.player
        && state.player.characterId === JACOB_CHARACTER_ID
      ) {
        const defendedWithoutDamage = damageTaken === 0;
        if (defendedDamage > 0) {
          gainJacobSp(state.player, defendedDamage);
        }
        if (
          defendedWithoutDamage
          && (state.player.defendActiveUntilTurn ?? 0) >= state.globalTurn
        ) {
          playSfx("block");
        }
        if (dodgeResult.result === "perfect" && getEffectiveDefenseValue(state.player, attackProfile.attackStyle) > 0) {
          gainJacobSp(state.player, Math.floor(getEffectiveDefenseValue(state.player, attackProfile.attackStyle) / 2));
        }
        if (
          attackProfile.attackStyle === "melee"
          && dodgeResult.result === "perfect"
          && (state.player.defendActiveUntilTurn ?? 0) >= state.globalTurn
        ) {
          const spGain = isJacobActionUnlocked(state.player, "block") ? JACOB_BLOCK_UPGRADED_SP_GAIN : JACOB_BLOCK_SP_GAIN;
          getJacobTeamUnits(state).forEach((unit) => {
            gainJacobSp(unit, spGain);
            applyStatusToUnit(unit, "speed", JACOB_BLOCK_SPEED_POWER, JACOB_BLOCK_SPEED_TURNS);
          });
          if (state.player.blockParryReady) {
            state.player.blockParryReady = false;
            playSfx("parry");
            await playJacobParryAnimation(state, render);
            jacobParryAnimationPlayed = true;
            resolveDamageAgainstTarget({
              attacker: state.player,
              target: actingEnemy,
              baseDamage: Math.max(0, state.player.attributes?.defense ?? 0),
              attackStyle: "melee"
            });
            applyStatusToUnit(actingEnemy, "stunned", 5, 1);
          }
        }
      }

      state.message = getEnemyAttackMessage(damageTaken, dodgeResult.result, counterDamage);

      if (state.player.characterId === PATRICK_CHARACTER_ID && dodgeResult.result === "perfect" && damageTaken === 0) {
        await playPatrickDodgeAnimation(state, render);
      } else if (
        defendingUnit === state.player &&
        state.player.characterId === JACOB_CHARACTER_ID &&
        dodgeResult.result === "perfect" &&
        damageTaken === 0 &&
        !jacobParryAnimationPlayed
      ) {
        await playJacobDodgeAnimation(state, render);
      } else if (
        defendingUnit === state.player &&
        state.player.characterId === KOSTYA_CHARACTER_ID &&
        dodgeResult.result === "counter" &&
        damageTaken === 0
      ) {
        if (!dodgeResult.animationStarted) {
          await playKostyaClashDodgeAnimation(state, render);
        }
      } else if (
        defendingUnit === state.player &&
        state.player.characterId === KOSTYA_CHARACTER_ID &&
        dodgeResult.result === "perfect" &&
        damageTaken === 0
      ) {
        await (attackProfile.attackStyle === "melee"
          ? playKostyaClashDodgeAnimation(state, render)
          : playKostyaRangedDodgeAnimation(state, render));
      }

      if (
        defendingUnit === state.player &&
        state.player.characterId === KOSTYA_CHARACTER_ID &&
        dodgeResult.result === "counter" &&
        playerWouldBeKilledByHit &&
        counterDamage >= enemyHpBeforeCounter
      ) {
        state.musicTrackResumeKey = getMusicTrackKeyForLevel(state.level);
        state.musicTrackKey = "last-surprise";
      }

      if (
        defendingUnit === state.player.shadow
        && state.player.characterId === JACOB_CHARACTER_ID
        && state.player.shadow?.id === "goal"
        && state.player.shadow.goalBreakPending
      ) {
        getJacobTeamUnits(state).forEach((unit) => {
          applyStatusToUnit(unit, "resistance", JACOB_GOAL_BREAK_RESISTANCE_POWER, JACOB_GOAL_BREAK_TURNS);
          applyStatusToUnit(unit, "absorption", JACOB_GOAL_BREAK_ABSORPTION_POWER, JACOB_GOAL_BREAK_TURNS);
        });
        state.message = t("jacob_goal_break");
      }

      if (defendingUnit === state.player.shadow && state.player.shadow?.hp <= 0) {
        state.player.shadow = null;
        if (state.player.characterId === JACOB_CHARACTER_ID) {
          syncJacobDerivedStats(state.player, state.globalTurn);
        }
      }

      awardPendingEnemyDrops(state);

      if (state.player.hp === 0) {
        if (attackProfile.attackStyle === "melee") {
          await animateUnitReturn(actingEnemy, render);
        }
        state.battleOver = true;
        state.phase = PHASE.BATTLE_OVER;
        state.message = t("battle_player_defeated");
        render();
        return;
      }

      if (actingEnemy.actionsRemaining <= 0) {
        completeUnitTurn(actingEnemy);
      }

      if (!state.enemies.some((enemy) => enemy.hp > 0)) {
        render();
        handleAllEnemiesDefeated(state, render, rebuildLevelScene);
        return;
      }

      if (attackProfile.attackStyle === "melee" && actingEnemy.hp > 0) {
        await animateUnitReturn(actingEnemy, render);
      }
      render();

      if (!state.enemies.some((enemy) => enemy.hp > 0 && enemy.actionsRemaining > 0)) {
        startNextPlayerTurn(state, render, rebuildLevelScene);
        return;
      }

      state.phase = PHASE.ENEMY_TURN;
      window.setTimeout(() => {
        runNextEnemyAction(state, render, rebuildLevelScene, enemyTurnToken);
      }, ENEMY_ACTION_DELAY_MS);
    });
  });
}

function startNextPlayerTurn(state, render, rebuildLevelScene) {
  state.enemyTurnToken += 1;
  state.globalTurn += 1;
  state.deepFocusActive = false;
  state.player.deepFocusActive = false;
  state.player.currentGlobalTurn = state.globalTurn;
  if (state.player.characterId === JACOB_CHARACTER_ID) {
    syncJacobDerivedStats(state.player, state.globalTurn);
    if ((state.player.defendActiveUntilTurn ?? 0) < state.globalTurn) {
      state.player.blockParryReady = false;
    }
  }
  state.turnOwner = "player";
  state.phase = PHASE.PLAYER_TURN;
  prepareUnitForTurn(state.player);

  if (shouldSkipTurnFromStun(state.player)) {
    state.player.actionsRemaining = 0;
    completeUnitTurn(state.player);
    state.message = t("battle_player_stunned");
    render();
    beginEnemyTurn(state, render, rebuildLevelScene);
    return;
  }

  if (state.player.actionsRemaining <= 0) {
    completeUnitTurn(state.player);
    state.message = t("battle_player_too_slow");
    render();
    beginEnemyTurn(state, render, rebuildLevelScene);
    return;
  }

  state.message = t("battle_player_turn_begins", {
    count: state.player.actionsRemaining,
    actionsWord: state.player.actionsRemaining === 1 ? t("word_action_singular") : t("word_action_plural")
  });
  state.player.turnStartActionsRemaining = state.player.actionsRemaining;
  if (maybeSkipPlayerTurnForFlyingSoftlock(state, render, rebuildLevelScene)) {
    return;
  }
  render();
}

function finishPlayerTurn(state, render, rebuildLevelScene) {
  completeUnitTurn(state.player);

  if (state.player.hp === 0) {
    state.battleOver = true;
    state.phase = PHASE.BATTLE_OVER;
    state.message = t("battle_player_defeated");
    render();
    return;
  }

  if (state.player.characterId === KOSTYA_CHARACTER_ID && state.player.shadow?.hp > 0 && state.enemies.some((enemy) => enemy.hp > 0)) {
    performKostyaShadowEndTurnAction(state, render, rebuildLevelScene);
    return;
  }

  beginEnemyTurn(state, render, rebuildLevelScene);
}

function maybeSkipPlayerTurnForFlyingSoftlock(state, render, rebuildLevelScene) {
  if (
    state?.battleOver ||
    state?.gameWon ||
    state?.turnOwner !== "player" ||
    state?.phase !== PHASE.PLAYER_TURN ||
    (state?.player?.actionsRemaining ?? 0) <= 0
  ) {
    return false;
  }

  const livingEnemies = state.enemies.filter((enemy) => enemy.hp > 0);
  if (livingEnemies.length === 0 || livingEnemies.some((enemy) => !isFlyingUnit(enemy))) {
    return false;
  }

  if (state.player.characterId !== KOSTYA_CHARACTER_ID || canKostyaHitFlyingEnemyNow(state)) {
    return false;
  }

  state.player.sp = Math.min(state.player.maxSp ?? state.player.sp ?? 0, (state.player.sp ?? 0) + PLAYER_SOFTLOCK_SP_COMPENSATION);
  state.player.actionsRemaining = 0;
  state.message = t("battle_player_no_legal_move", { sp: PLAYER_SOFTLOCK_SP_COMPENSATION });
  finishPlayerTurn(state, render, rebuildLevelScene);
  return true;
}

function canKostyaHitFlyingEnemyNow(state) {
  if (
    isKostyaActionUnlocked(state.player, "slash")
    && canAffordKostyaAbility(state.player, { costSp: KOSTYA_SLASH_SP_COST })
    && getTargetableEnemiesForAction(state, "slash").length > 0
  ) {
    return true;
  }

  if (
    isKostyaActionUnlocked(state.player, "mass-infection")
    && canAffordKostyaAbility(state.player, { costSp: KOSTYA_MASS_INFECTION_SP_COST, costShadowCharge: KOSTYA_MASS_INFECTION_SC_COST })
    && getTargetableEnemiesForAction(state, "mass-infection").length > 0
  ) {
    return true;
  }

  return false;
}

async function performKostyaShadowEndTurnAction(state, render, rebuildLevelScene) {
  const shadow = state.player.shadow;
  if (!shadow || shadow.hp <= 0) {
    state.player.pendingActionRecall = null;
    setKostyaShadowRepeatableAttribute(state, false);
    beginEnemyTurn(state, render, rebuildLevelScene);
    return;
  }

  prepareUnitForTurn(shadow);
  if (shouldSkipTurnFromStun(shadow) || (shadow.actionsRemaining ?? 0) <= 0) {
    shadow.actionsRemaining = 0;
    completeUnitTurn(shadow);
    state.player.pendingActionRecall = null;
    setKostyaShadowRepeatableAttribute(state, false);
    beginEnemyTurn(state, render, rebuildLevelScene);
    return;
  }

  state.phase = PHASE.PLAYER_ACTION;
  while ((shadow.actionsRemaining ?? 0) > 0 && shadow.hp > 0) {
    const target = getFrontLivingEnemy(state, { canTargetFlying: false });
    if (!target) {
      break;
    }

    shadow.actionsRemaining -= 1;
    const pendingActionRecall = state.player.pendingActionRecall;
    state.player.pendingActionRecall = null;
    if (pendingActionRecall) {
      setKostyaShadowRepeatableAttribute(state, false);
    }
    const outcome = pendingActionRecall
      ? await performKostyaActionRecallFollowUp(state, render, pendingActionRecall)
      : await performKostyaShadowStrike(state, render, target);

    const enemyDefeated = outcome === "enemy-defeated" || (typeof outcome === "object" && outcome?.enemyDefeated === true);
    if (enemyDefeated && !state.enemies.some((enemy) => enemy.hp > 0)) {
      awardPendingEnemyDrops(state);
      completeUnitTurn(shadow);
      handleAllEnemiesDefeated(state, render, rebuildLevelScene);
      return;
    }
  }

  completeUnitTurn(shadow);
  beginEnemyTurn(state, render, rebuildLevelScene);
}

function handleAllEnemiesDefeated(state, render, rebuildLevelScene) {
  awardPendingEnemyDrops(state);
  unlockPatrickMilestoneIfEligible(state);
  unlockKostyaMilestoneIfEligible(state);
  awardBossBurgerIfEligible(state);
  if (state.level >= MAX_LEVEL) {
    state.battleOver = true;
    state.gameWon = true;
    state.phase = PHASE.BATTLE_OVER;
    state.message = t("battle_game_won");
    render();
    return;
  }

  state.turnOwner = "player";
  state.phase = PHASE.UPGRADE;
  const abilityRewardOptions = getAbilityRewardOptionsForLevel(state.player.characterId, state.level, state.player);
  if (abilityRewardOptions.length > 0) {
    state.pendingUpgradeSelection = true;
    state.rewardSelectionType = "ability";
    state.rewardSelectionCatalog = abilityRewardOptions;
    state.pendingAbilityConfirmId = null;
    state.hoveredActionId = null;
    state.inspectedActionId = null;
    state.message = t("battle_ability_prompt");
    render();
    return;
  }

  state.upgradePoints += 1;
  state.pendingUpgradeSelection = true;
  state.rewardSelectionType = "upgrade";
  state.rewardSelectionCatalog = state.upgradeCatalog;
  state.pendingAbilityConfirmId = null;
  state.hoveredActionId = null;
  state.inspectedActionId = null;
  state.message = t("battle_upgrade_prompt");
  render();
}

function canPlayerAct(state) {
  return (
    !state.battleOver &&
    !state.gameWon &&
    !state.pendingUpgradeSelection &&
    state.turnOwner === "player" &&
    state.phase === PHASE.PLAYER_TURN &&
    state.player.actionsRemaining > 0 &&
    !state.dodgeCheck?.active &&
    !state.actionCheck?.active &&
    state.enemies.some((enemy) => enemy.hp > 0)
  );
}

function getLivingEnemiesInFrontOrder(state, { canTargetFlying = true } = {}) {
  return state.enemies
    .map((enemy, index) => ({ enemy, index }))
    .filter(({ enemy }) => enemy.hp > 0 && (canTargetFlying || !isFlyingUnit(enemy)))
    .sort((left, right) => right.index - left.index)
    .map(({ enemy }) => enemy);
}

function getFrontLivingEnemy(state, options = {}) {
  return getLivingEnemiesInFrontOrder(state, options)[0] ?? null;
}

function getEnemyById(state, enemyId, options = {}) {
  const canTargetFlying = options.canTargetFlying ?? true;
  return state.enemies.find((enemy) => enemy.id === enemyId && enemy.hp > 0 && (canTargetFlying || !isFlyingUnit(enemy))) ?? null;
}

function getEnemyBehindTarget(state, target, { canTargetFlying = true } = {}) {
  const currentIndex = state.enemies.findIndex((enemy) => enemy.id === target?.id);
  if (currentIndex < 0) {
    return null;
  }

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    if (state.enemies[index].hp > 0 && (canTargetFlying || !isFlyingUnit(state.enemies[index]))) {
      return state.enemies[index];
    }
  }

  return null;
}

export function isEnemyTargetableForAction(state, enemy, actionId = null) {
  if (!enemy || (enemy.hp ?? 0) <= 0) {
    return false;
  }

  if (!isFlyingUnit(enemy)) {
    return true;
  }

  return canActionTargetFlying(actionId);
}

export function getTargetableEnemiesForAction(state, actionId = null) {
  const canTargetFlying = canActionTargetFlying(actionId);
  return getLivingEnemiesInFrontOrder(state, { canTargetFlying });
}

function prepareUnitForTurn(unit) {
  const speedPower = getActiveStatusPower(unit, "speed");
  const slownessPower = getActiveStatusPower(unit, "slowness");
  const modifierDelta = (speedPower * 0.5) - slownessPower;
  const accumulatedModifier = (unit.actionProgress ?? 0) + modifierDelta;
  const wholeActionAdjustment = Math.floor(accumulatedModifier);
  const effectiveActions = (unit.baseActionsPerTurn ?? 0) + wholeActionAdjustment;

  unit.actionProgress = accumulatedModifier - wholeActionAdjustment;
  unit.actionsRemaining = Math.max(0, effectiveActions);
  unit.pendingSlownessDurationLoss = effectiveActions < 0
    ? 1 + Math.abs(effectiveActions)
    : 1;
}

function shouldSkipTurnFromStun(unit) {
  const stunPower = getActiveStatusPower(unit, "stunned");
  if (stunPower <= 0) {
    return false;
  }

  return Math.random() < Math.min(1, stunPower * STUN_SKIP_CHANCE_STEP);
}

function completeUnitTurn(unit) {
  applyEndOfTurnEffects(unit);
  tickStatuses(unit);
}

function applyEndOfTurnEffects(unit) {
  if (unit.hp <= 0) {
    return;
  }

  const absorptionDecay = getActiveStatusPower(unit, "absorption");
  if (absorptionDecay > 0) {
    drainAbsorptionPoints(unit, absorptionDecay);
  }

  const decayingPower = getActiveStatusPower(unit, "decaying");
  if (decayingPower > 0) {
    dealDamage(unit, decayingPower);
  }

  const poisonPower = getActiveStatusPower(unit, "poison");
  if (poisonPower > 0) {
    const poisonDamagePerStack = (unit.maxHp ?? 0) > 60 ? 4 : 2;
    dealDamage(unit, poisonDamagePerStack * poisonPower);
  }

  const firePower = getActiveStatusPower(unit, "fire");
  if (firePower > 0 && unit.hp > 0 && !hasFireImmunity(unit)) {
    const fireDamagePerStack = (unit.maxHp ?? 0) > 60 ? 6 : 4;
    dealDamage(unit, fireDamagePerStack * firePower);
  }

  const hpRegenPower = getActiveStatusPower(unit, "hpRegen");
  if (hpRegenPower > 0 && unit.hp > 0) {
    const healAmount = hpRegenPower * 5;
    unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
  }

  const spRegenPower = getActiveStatusPower(unit, "spRegen");
  if (spRegenPower > 0 && unit.maxSp > 0) {
    const spAmount = spRegenPower * 5;
    unit.sp = Math.min(unit.maxSp, unit.sp + spAmount);
  }
}

function tickStatuses(unit) {
  STATUS_KEYS.forEach((statusKey) => {
    const status = unit.statuses[statusKey];
    if (status.power > 0 && status.turns > 0) {
      const durationLoss = statusKey === "slowness"
        ? Math.max(1, Math.floor(unit.pendingSlownessDurationLoss ?? 1))
        : 1;
      status.turns = Math.max(0, status.turns - durationLoss);
      if (status.turns === 0) {
        status.power = 0;
        if ("points" in status) {
          status.points = 0;
        }
      }
    }
  });
  unit.pendingSlownessDurationLoss = 1;
}

function startDodgeCheck(state, render, options = {}) {
  return new Promise((resolve) => {
    const dodgeLayout = state.player.characterId === KOSTYA_CHARACTER_ID && options.allowCounter === true
      ? createKostyaCounterDodgeLayout(state.player, {
        counterWindowBonus: options.counterWindowBonus ?? 0,
        counterOnly: options.counterOnly === true
      })
      : createStandardDodgeLayout(options.defendingUnit ?? state.player);

    state.dodgeCheck = {
      active: true,
      attackStyle: options.attackStyle ?? "melee",
      allowCounter: options.allowCounter === true,
      counterOnly: options.counterOnly === true,
      isHolding: false,
      value: 0,
      direction: 1,
      lastFrameAt: performance.now(),
      ...dodgeLayout,
      timeoutId: window.setTimeout(() => {
        finalizeDodgeCheck(state, render);
      }, DODGE_TIMEOUT_MS),
      resolve
    };

    function tick(now) {
      const dodgeCheck = state.dodgeCheck;

      if (!dodgeCheck?.active) {
        return;
      }

      const delta = now - dodgeCheck.lastFrameAt;
      dodgeCheck.lastFrameAt = now;

      if (dodgeCheck.isHolding) {
        dodgeCheck.value += delta * DODGE_RATE_PER_MS * dodgeCheck.direction;

        if (dodgeCheck.value >= DODGE_MAX_VALUE) {
          dodgeCheck.value = DODGE_MAX_VALUE;
          dodgeCheck.direction = -1;
        } else if (dodgeCheck.value <= 0) {
          dodgeCheck.value = 0;
          dodgeCheck.direction = 1;
        }
      }

      render();
      window.requestAnimationFrame(tick);
    }

    render();
    window.requestAnimationFrame(tick);
  });
}

function createStandardDodgeLayout(unit = null) {
  const jacobBonus = unit?.characterId === JACOB_CHARACTER_ID
    ? getJacobMeleeDodgeWindowBonus(unit)
    : { green: 0, yellowPerSide: 0 };
  const greenWidth = DODGE_GREEN_WIDTH + Math.max(0, Number(jacobBonus.green) || 0);
  const yellowPadding = DODGE_YELLOW_PADDING + Math.max(0, Number(jacobBonus.yellowPerSide) || 0);
  const greenStart = 10 + Math.floor(Math.random() * (DODGE_MAX_VALUE - greenWidth - (yellowPadding * 2) + 1));
  const greenEnd = greenStart + greenWidth;
  const yellowStart = greenStart - yellowPadding;
  const yellowEnd = greenEnd + yellowPadding;

  return {
    greenStart,
    greenEnd,
    yellowStart,
    yellowEnd
  };
}

function createKostyaCounterDodgeLayout(player, options = {}) {
  const counterWidth = getKostyaCounterWindowSize(player) + Math.max(0, Number(options.counterWindowBonus) || 0);
  const counterWidthBonus = getKostyaCounterWindowBonusSize(player) + Math.max(0, Number(options.counterWindowBonus) || 0);
  const greenHalfWidth = Math.max(0.5, (DODGE_GREEN_WIDTH / 2) - KOSTYA_COUNTER_GREEN_SIDE_SHRINK - (counterWidthBonus / 2));
  const center = DODGE_MAX_VALUE / 2;
  const counterStart = center - (counterWidth / 2);
  const counterEnd = counterStart + counterWidth;
  const leftGreenEnd = counterStart;
  const leftGreenStart = leftGreenEnd - greenHalfWidth;
  const leftYellowEnd = leftGreenStart;
  const leftYellowStart = leftYellowEnd - DODGE_YELLOW_PADDING;
  const rightGreenStart = counterEnd;
  const rightGreenEnd = rightGreenStart + greenHalfWidth;
  const rightYellowStart = rightGreenEnd;
  const rightYellowEnd = rightYellowStart + DODGE_YELLOW_PADDING;

  return {
    greenStart: leftGreenStart,
    greenEnd: rightGreenEnd,
    yellowStart: leftYellowStart,
    yellowEnd: rightYellowEnd,
    counterOnly: options.counterOnly === true,
    leftYellowStart,
    leftYellowEnd,
    leftGreenStart,
    leftGreenEnd,
    counterStart,
    counterEnd,
    rightGreenStart,
    rightGreenEnd,
    rightYellowStart,
    rightYellowEnd
  };
}

function startTimedDodgeCheck(state, render, attacker, target, options = {}) {
  return new Promise((resolve) => {
    const effect = createEnemyTimedProjectileEffect(state, attacker, target);
    const now = performance.now();
    addProjectileEffect(state, effect);
    const jacobBonus = target?.characterId === JACOB_CHARACTER_ID
      ? getJacobRangedDodgeWindowBonus(target)
      : { greenTiles: 0, yellowTiles: 0 };

    state.dodgeCheck = {
      active: true,
      type: "timed",
      attackStyle: options.attackStyle ?? "ranged",
      allowCounter: options.allowCounter === true,
      counterOnly: options.counterOnly === true,
      value: 0,
      timedOpacity: TIMED_PULSE_BASE_OPACITY,
      timedVisible: false,
      pulseStrength: 0,
      timedTier: "miss",
      timedDisplayTier: "miss",
      timedResultTier: "miss",
      timedYellowDisplayHoldUntil: 0,
      timedLastYellowDisplayValue: 0,
      timedSuccessColor: options.timedSuccessColor ?? "green",
      timedNearColor: Object.prototype.hasOwnProperty.call(options, "timedNearColor")
        ? options.timedNearColor
        : "yellow",
      timedWindowMinTiles: Math.max(0, Number(options.timedWindowMinTiles ?? ENEMY_TIMED_DODGE_GREEN_MIN_TILES) || 0),
      timedWindowMaxTiles: Math.max(
        0,
        Number(options.timedWindowMaxTiles ?? ENEMY_TIMED_DODGE_GREEN_MAX_TILES) + (Number(jacobBonus.greenTiles) || 0)
      ),
      timedNearWindowMaxTiles: options.timedNearColor == null
        ? null
        : Math.max(
          0,
          Number(options.timedNearWindowMaxTiles ?? ENEMY_TIMED_DODGE_YELLOW_MAX_TILES) + (Number(jacobBonus.yellowTiles) || 0)
        ),
      projectileEffect: effect,
      projectileAttacker: attacker,
      timeoutId: window.setTimeout(() => {
        finalizeDodgeCheck(state, render, { forcedResult: "fail" });
      }, Math.max(1, Number(effect.endsAt ?? now) - now)),
      resolve
    };

    function tick(frameNow) {
      const dodgeCheck = state.dodgeCheck;

      if (!dodgeCheck?.active) {
        return;
      }

      applyEnemyTimedDodgeVisualState(dodgeCheck, frameNow);

      render();
      window.requestAnimationFrame(tick);
    }

    applyEnemyTimedDodgeVisualState(state.dodgeCheck, now);
    render();
    window.requestAnimationFrame(tick);
  });
}

async function performMeleeAttack(state, render, target, action = null) {
  await animateMeleeApproach(state, state.player, target, render);
  state.message = t("battle_hold_release_prompt");
  render();

  const isKostyaKatanaFamily = state.player.characterId === KOSTYA_CHARACTER_ID && [
    "katana",
    "slash",
    "lunge",
    "decay-curse"
  ].includes(action?.id ?? "");
  if (isKostyaKatanaFamily) {
    playSfx("swordDrawn");
    await playKostyaKatanaIntroAnimation(state, render);
    setKostyaKatanaReadyPose(state.player, render);
  }

  const result = await startActionCheck(state, render, "melee");
  if (isKostyaKatanaFamily) {
    playSfx("swordSlash");
    await playKostyaKatanaOutroAnimation(state, render);
  }
  const isKostyaBasicKatana = state.player.characterId === KOSTYA_CHARACTER_ID && (action?.id ?? "") === "katana";
  const isKostyaDash = state.player.characterId === KOSTYA_CHARACTER_ID && (action?.id ?? "") === "slash";
  const baseDamage = isKostyaBasicKatana
    ? getKostyaSwordBaseDamage(state.player)
    : isKostyaDash
      ? getKostyaDashBaseDamage(state.player)
    : (typeof action?.baseDamage === "number" ? action.baseDamage : PLAYER_ATTACK_DAMAGE);
  const bonusDamage = typeof action?.bonusDamage === "number" ? action.bonusDamage : ACTION_SKILL_BONUS_DAMAGE;
  const actionDamageMultiplier = typeof action?.damageMultiplier === "number" ? action.damageMultiplier : 1;
  const greenDamageMultiplier = typeof action?.greenDamageMultiplier === "number" ? action.greenDamageMultiplier : 1;
  const damage = getActionDamage({
    attacker: state.player,
    target,
    baseDamage,
    bonusDamage: (isKostyaBasicKatana || isKostyaDash) ? 0 : (result.success ? bonusDamage : 0),
    damageMultiplier: actionDamageMultiplier * (
      result.tier === "green"
        ? ((isKostyaBasicKatana || isKostyaDash) ? 1.5 : greenDamageMultiplier)
        : 1
    ),
    attackStyle: "melee"
  });

  dealDamage(target, damage);
  if (state.player.characterId === KOSTYA_CHARACTER_ID) {
    gainKostyaShadowCharge(state.player, damage);
  }
  state.message = ["katana", "slash"].includes(action?.id ?? "")
    ? t("kostya_katana_hit", { damage })
    : t("battle_melee_hit", { damage });
  const outcome = {
    damage,
    enemyDefeated: target.hp === 0,
    actionRecall: state.player.characterId === KOSTYA_CHARACTER_ID && isKostyaKatanaRelatedAction(action?.id ?? "")
      ? {
        actionId: action.id,
        targetId: target.id,
        greenTier: result.tier
      }
      : null
  };

  if (target.hp === 0) {
    await animateUnitReturn(state.player, render);
    return outcome;
  }

  await animateUnitReturn(state.player, render);
  render();
  return outcome;
}

async function performKostyaShadowSummon(state, render, summonActionId = "shadow") {
  if ((state.player.sp ?? 0) < KOSTYA_SHADOW_SUMMON_SP_COST || (state.player.shadowCharge ?? 0) < KOSTYA_SHADOW_SUMMON_SC_COST) {
    return "continue";
  }

  await playKostyaShadowSummonAnimation(state, render);
  state.player.sp = Math.max(0, (state.player.sp ?? 0) - KOSTYA_SHADOW_SUMMON_SP_COST);
  state.player.shadowCharge = Math.max(0, (state.player.shadowCharge ?? 0) - KOSTYA_SHADOW_SUMMON_SC_COST);
  state.player.shadow = createKostyaShadowState(createEmptyStatuses, state.player);
  const now = performance.now();
  state.player.shadow.summonFadeStartedAt = now;
  state.player.shadow.summonFadeEndsAt = now + getScaledDuration(state, KOSTYA_SHADOW_SUMMON_FADE_DURATION_MS);
  playSfx("summon");
  state.message = summonActionId === "ghost"
    ? t("kostya_ghost_summoned")
    : summonActionId === "wraith"
      ? t("kostya_wraith_summoned")
      : t("kostya_shadow_summoned");
  render();
  return "continue";
}

async function performKostyaFieldPromotion(state, render) {
  if (!state.player.shadow || state.player.shadow.hp <= 0) {
    return "continue";
  }

  await playKostyaShadowCastAnimation(state, render);
  const shadow = state.player.shadow;
  const missingHp = Math.max(0, (shadow.maxHp ?? 0) - (shadow.hp ?? 0));
  const restoredHp = missingHp > 0
    ? Math.max(1, Math.ceil(missingHp * KOSTYA_FIELD_PROMOTION_MISSING_HP_RATIO))
    : 0;
  shadow.hp = Math.min(shadow.maxHp ?? shadow.hp ?? 0, (shadow.hp ?? 0) + restoredHp);

  const missingShp = Math.max(0, (shadow.maxShp ?? 0) - (shadow.shp ?? 0));
  const restoredShp = missingShp > 0
    ? Math.max(1, Math.ceil(missingShp * KOSTYA_FIELD_PROMOTION_MISSING_SHP_RATIO))
    : 0;
  shadow.shp = Math.min(shadow.maxShp ?? shadow.shp ?? 0, (shadow.shp ?? 0) + restoredShp);

  state.player.shadowFieldPromotionPower = Math.min(
    KOSTYA_FIELD_PROMOTION_MAX_POWER,
    Math.max(0, Math.floor(Number(state.player.shadowFieldPromotionPower) || 0)) + KOSTYA_FIELD_PROMOTION_POWER_GAIN
  );
  shadow.naturalStrengthPower = state.player.shadowFieldPromotionPower;
  shadow.unitEffect = null;
  state.message = t("kostya_field_promotion", {
    hp: restoredHp,
    shp: restoredShp,
    power: formatRomanNumeral(state.player.shadowFieldPromotionPower)
  });
  render();
  return "continue";
}

async function performKostyaActionRecall(state, render) {
  await playKostyaShadowCastAnimation(state, render);
  state.player.actionRecallReady = true;
  state.player.pendingActionRecall = null;
  setKostyaShadowRepeatableAttribute(state, true);
  playSfx("fingerSnap");
  state.message = t("kostya_action_recall_ready");
  render();
  return "continue";
}

async function performKostyaDarkPlating(state, render) {
  const shadow = state.player.shadow;
  if (!shadow || shadow.hp <= 0) {
    return "continue";
  }

  await playKostyaShadowCastAnimation(state, render);
  playSfx("bling");
  const restoredShp = Math.max(0, (shadow.maxShp ?? 0) - (shadow.shp ?? 0));
  shadow.shp = shadow.maxShp ?? shadow.shp ?? 0;
  applyStatusToUnit(shadow, "speed", KOSTYA_DARK_PLATING_SPEED_POWER, KOSTYA_DARK_PLATING_SPEED_TURNS);
  state.message = t("kostya_dark_plating", {
    shp: restoredShp,
    power: formatRomanNumeral(KOSTYA_DARK_PLATING_SPEED_POWER),
    turns: KOSTYA_DARK_PLATING_SPEED_TURNS
  });
  render();
  return "continue";
}

async function performKostyaDeepFocus(state, render) {
  state.deepFocusActive = true;
  state.player.deepFocusActive = true;
  state.message = t("kostya_deep_focus_ready");
  render();
  return {
    spentActions: Math.max(1, state.player.actionsRemaining ?? 1)
  };
}

async function performKostyaShadowStrike(state, render, target) {
  if (!target || !state.player.shadow || state.player.shadow.hp <= 0) {
    return "continue";
  }

  await animateMeleeApproach(state, state.player.shadow, target, render);
  await playKostyaKatanaIntroAnimation(state, render, state.player.shadow);
  setKostyaKatanaReadyPose(state.player.shadow, render);
  playSfx("swordSlash");
  await playKostyaKatanaOutroAnimation(state, render, state.player.shadow);
  const damage = getActionDamage({
    attacker: state.player.shadow,
    target,
    baseDamage: getKostyaSwordBaseDamage(state.player),
    damageMultiplier: getKostyaShadowAttackDamageMultiplier(state.player.shadow),
    attackStyle: "melee"
  });
  dealDamage(target, damage);
  gainKostyaShadowCharge(state.player, damage);
  state.message = t("kostya_shadow_hit", { damage });

  if (target.hp === 0) {
    await animateUnitReturn(state.player.shadow, render);
    return "enemy-defeated";
  }

  await animateUnitReturn(state.player.shadow, render);
  render();
  return "continue";
}

async function performKostyaLunge(state, render, action) {
  const primaryTarget = getFrontLivingEnemy(state, { canTargetFlying: false });
  if (!primaryTarget) {
    return "continue";
  }

  const secondaryTarget = getEnemyBehindTarget(state, primaryTarget, { canTargetFlying: false });
  await animateMeleeApproach(state, state.player, primaryTarget, render);
  state.message = t("battle_hold_release_prompt");
  render();
  playSfx("swordDrawn");
  await playKostyaKatanaIntroAnimation(state, render);
  setKostyaKatanaReadyPose(state.player, render);

  const result = await startActionCheck(state, render, "melee");
  playSfx("swordSlash");
  await playKostyaKatanaOutroAnimation(state, render);

  const lungeBaseDamage = getKostyaSwordBaseDamage(state.player);
  const primaryDamage = getActionDamage({
    attacker: state.player,
    target: primaryTarget,
    baseDamage: lungeBaseDamage,
    damageMultiplier: result.tier === "green" ? 1.5 : 1,
    attackStyle: "melee"
  });
  dealDamage(primaryTarget, primaryDamage);
  gainKostyaShadowCharge(state.player, primaryDamage);
  let secondaryDamage = 0;
  if (secondaryTarget) {
    secondaryDamage = getActionDamage({
      attacker: state.player,
      target: secondaryTarget,
      baseDamage: Math.max(1, Math.floor(
        (result.tier === "green" ? lungeBaseDamage * 1.5 : lungeBaseDamage) / 2
      )),
      attackStyle: "melee"
    });
    dealDamage(secondaryTarget, secondaryDamage);
    gainKostyaShadowCharge(state.player, secondaryDamage);
    applyStatusToUnit(secondaryTarget, "stunned", KOSTYA_LUNGE_STUN_POWER, KOSTYA_LUNGE_STUN_TURNS);
  }

  state.message = t("kostya_lunge_hit", {
    primaryDamage,
    secondaryDamage,
    stunPower: formatRomanNumeral(KOSTYA_LUNGE_STUN_POWER),
    turns: KOSTYA_LUNGE_STUN_TURNS
  });

  const primaryDefeated = primaryTarget.hp === 0;
  const secondaryDefeated = secondaryTarget ? secondaryTarget.hp === 0 : false;
  await animateUnitReturn(state.player, render);
  render();
  return {
    enemyDefeated: primaryDefeated || secondaryDefeated,
    actionRecall: {
      actionId: "lunge",
      greenTier: result.tier
    }
  };
}

async function performKostyaDecayCurse(state, render, action) {
  const target = getFrontLivingEnemy(state, { canTargetFlying: false });
  if (!target) {
    return "continue";
  }

  const outcome = await performMeleeAttack(state, render, target, {
    ...action,
    bonusDamage: 0,
    greenDamageMultiplier: 1.5
  });
  applyStatusToUnit(target, "decaying", KOSTYA_DECAY_CURSE_POWER, KOSTYA_DECAY_CURSE_TURNS);
  state.message = t("kostya_decay_curse_hit", {
    damage: typeof outcome === "object" && outcome !== null ? outcome.damage ?? 0 : 0,
    power: formatRomanNumeral(KOSTYA_DECAY_CURSE_POWER),
    turns: KOSTYA_DECAY_CURSE_TURNS
  });
  render();
  return {
    ...(typeof outcome === "object" && outcome !== null ? outcome : {}),
    actionRecall: {
      actionId: "decay-curse",
      greenTier: outcome?.actionRecall?.greenTier ?? "miss"
    }
  };
}

async function performKostyaCripplingStab(state, render, attacker = state.player, { doubledBaseDamage = false, greenTier = null, targetId = null } = {}) {
  const target = targetId ? getEnemyById(state, targetId, { canTargetFlying: false }) : getFrontLivingEnemy(state, { canTargetFlying: false });
  if (!target) {
    return "continue";
  }

  await animateMeleeApproach(state, attacker, target, render);
  if (attacker === state.player) {
    state.message = t("battle_hold_release_prompt");
    render();
    playSfx("swordDrawn");
  }
  await playKostyaKatanaIntroAnimation(state, render, attacker);
  setKostyaKatanaReadyPose(attacker, render);

  const resolvedGreenTier = attacker === state.player
    ? (await startActionCheck(state, render, "melee")).tier
    : (greenTier ?? "miss");
  playSfx("swordSlash");
  await playKostyaKatanaOutroAnimation(state, render, attacker);

  const damage = getActionDamage({
    attacker,
    target,
    baseDamage: getKostyaSwordBaseDamage(state.player) * (doubledBaseDamage ? 2 : 1),
    damageMultiplier: attacker === state.player.shadow ? getKostyaShadowAttackDamageMultiplier(attacker) : 1,
    attackStyle: "melee"
  });
  dealDamage(target, damage);
  gainKostyaShadowCharge(state.player, damage);
  applyStatusToUnit(target, "slowness", KOSTYA_CRIPPLING_STAB_SLOWNESS_POWER, KOSTYA_CRIPPLING_STAB_SLOWNESS_TURNS);

  const heal = Math.max(0, Math.floor(damage * (resolvedGreenTier === "green" ? 1.5 : 1)));
  attacker.hp = Math.min(attacker.maxHp ?? attacker.hp ?? 0, (attacker.hp ?? 0) + heal);

  state.message = attacker === state.player.shadow
    ? t("kostya_action_recall_crippling_stab", {
      damage,
      heal,
      power: formatRomanNumeral(KOSTYA_CRIPPLING_STAB_SLOWNESS_POWER),
      turns: KOSTYA_CRIPPLING_STAB_SLOWNESS_TURNS
    })
    : t("kostya_crippling_stab_hit", {
      damage,
      heal,
      power: formatRomanNumeral(KOSTYA_CRIPPLING_STAB_SLOWNESS_POWER),
      turns: KOSTYA_CRIPPLING_STAB_SLOWNESS_TURNS
    });

  const enemyDefeated = target.hp === 0;
  await animateUnitReturn(attacker, render);
  render();
  return {
    enemyDefeated,
    actionRecall: attacker === state.player
      ? {
        actionId: "crippling-stab",
        greenTier: resolvedGreenTier,
        targetId: target.id
      }
      : null
  };
}

async function performKostyaMassInfection(state, render, attacker = state.player, { doubledBaseDamage = false, greenTier = null } = {}) {
  const livingEnemies = getLivingEnemiesInFrontOrder(state);
  if (livingEnemies.length === 0) {
    return "continue";
  }

  let resolvedGreenTier = greenTier ?? "miss";
  const baseDamage = getKostyaSwordBaseDamage(state.player) * (doubledBaseDamage ? 2 : 1);
  let damageMultiplier = resolvedGreenTier === "green" ? 1.25 : 1;
  const projectileImpacts = () => livingEnemies.map((enemy) => ({
    point: getEnemyProjectileImpactPoint(state, enemy, { xOffsetTiles: 1.1, yOffsetTiles: 1.34 }),
    onImpact: () => {
      const damage = getActionDamage({
        attacker,
        target: enemy,
        baseDamage,
        damageMultiplier: damageMultiplier * (attacker === state.player.shadow ? getKostyaShadowAttackDamageMultiplier(attacker) : 1),
        attackStyle: "ranged"
      });
      dealDamage(enemy, damage);
      gainKostyaShadowCharge(state.player, damage);
      applyStatusToUnit(enemy, "decaying", KOSTYA_MASS_INFECTION_DECAY_POWER, KOSTYA_MASS_INFECTION_DECAY_TURNS);
    }
  }));

  if (attacker === state.player) {
    state.message = t("battle_ranged_prompt");
    setKostyaMassInfectionReadyPose(state.player, render);
    playSfx("swordDrawn");
    const result = await startActionCheck(state, render, "ranged", { hasYellowWindow: false });
    resolvedGreenTier = result.tier;
    damageMultiplier = resolvedGreenTier === "green" ? 1.25 : 1;
    playSfx("massInfection");
    await Promise.all([
      playKostyaMassInfectionOutroAnimation(state, render),
      playKostyaMassInfectionWaveEffect(state, render, attacker, projectileImpacts())
    ]);
  } else {
    setKostyaMassInfectionReadyPose(attacker, render);
    playSfx("massInfection");
    await Promise.all([
      playKostyaMassInfectionOutroAnimation(state, render, attacker),
      playKostyaMassInfectionWaveEffect(state, render, attacker, projectileImpacts())
    ]);
  }

  const displayDamage = Math.max(0, Math.floor(baseDamage * damageMultiplier));

  state.message = attacker === state.player.shadow
    ? t("kostya_action_recall_mass_infection", {
      count: livingEnemies.length,
      damage: displayDamage,
      power: formatRomanNumeral(KOSTYA_MASS_INFECTION_DECAY_POWER),
      turns: KOSTYA_MASS_INFECTION_DECAY_TURNS
    })
    : t("kostya_mass_infection_hit", {
      count: livingEnemies.length,
      damage: displayDamage,
      power: formatRomanNumeral(KOSTYA_MASS_INFECTION_DECAY_POWER),
      turns: KOSTYA_MASS_INFECTION_DECAY_TURNS
    });
  render();

  return {
    enemyDefeated: livingEnemies.some((enemy) => enemy.hp === 0),
    actionRecall: attacker === state.player
      ? {
        actionId: "mass-infection",
        greenTier: resolvedGreenTier
      }
      : null
  };
}

async function performRangedAttack(state, render, target) {
  state.message = t("battle_ranged_prompt");
  render();

  const result = await startActionCheck(state, render, "ranged");
  const damage = getActionDamage({
    attacker: state.player,
    target,
    baseDamage: RANGED_ATTACK_DAMAGE,
    bonusDamage: result.success ? ACTION_SKILL_BONUS_DAMAGE : 0,
    attackStyle: "ranged"
  });

  dealDamage(target, damage);
  state.message = t("battle_ranged_hit", { damage });

  if (target.hp === 0) {
    return "enemy-defeated";
  }

  render();
  return "continue";
}

async function performTimedAttack(state, render, target) {
  state.message = t("battle_timed_prompt");
  render();

  const result = await startActionCheck(state, render, "timed");
  const damage = getActionDamage({
    attacker: state.player,
    target,
    baseDamage: TIMED_ATTACK_DAMAGE,
    bonusDamage: result.success ? ACTION_SKILL_BONUS_DAMAGE : 0,
    attackStyle: "timed"
  });

  dealDamage(target, damage);
  state.message = t("battle_timed_hit", { damage });

  if (target.hp === 0) {
    return "enemy-defeated";
  }

  render();
  return "continue";
}

async function performPatrickCoinFlip(state, render) {
  playSfx("coinFlip");
  await playPatrickCoinFlipAnimation(state, render);
  const coinFlipConfig = getPatrickCoinFlipConfig(state.player);
  const headsChance = Math.min(1, getPatrickHeadsChancePercent(state.player) / 100);
  const heads = Math.random() < headsChance;
  const player = state.player;
  player.luckyCharges = Math.min(player.maxLuckyCharges, player.luckyCharges + getPatrickCoinFlipLuckyChargeGain(player));

  if (heads) {
    player.sp = Math.min(player.maxSp, player.sp + coinFlipConfig.headsSp);
    state.message = t("patrick_coin_flip_heads");
  } else {
    player.sp = Math.min(player.maxSp, player.sp + coinFlipConfig.tailsSp);
    if (!shouldBlockNegativeStatus(player, "weakness", coinFlipConfig.weaknessPower)) {
      player.storedWeaknessPower = Math.min(
        STATUS_POWER_CAP,
        (player.storedWeaknessPower ?? 0) + coinFlipConfig.weaknessPower
      );
      setStatusOnUnit(player, "weakness", player.storedWeaknessPower, coinFlipConfig.weaknessTurns);
    }
    state.message = t("patrick_coin_flip_tails");
  }

  render();
  return "continue";
}

async function performPatrickRevolver(state, render, target) {
  spendPatrickAbilityCost(state.player, { costSp: 0, costLucky: 1 });
  state.message = t("battle_ranged_prompt");
  playSfx("lockNLoad");
  await playPatrickRevolverIntroAnimation(state, render);
  render();

  const result = await startActionCheck(state, render, "revolver");
  playSfx("revolverShot");
  await Promise.all([
    playPatrickRevolverOutroAnimation(state, render),
    playPatrickProjectileEffect(state, render, {
      bulletType: "regular",
      target
    })
  ]);
  const damageMultiplier = result.tier === "green"
    ? 1.5
    : result.tier === "yellow"
      ? 1.25
      : 1;
  const damage = getPatrickRevolverActionDamage({
    attacker: state.player,
    target,
    baseDamage: getPatrickRevolverBaseDamage(state.player),
    damageMultiplier
  });

  dealDamage(target, damage);
  state.message = t("patrick_revolver_hit", { damage });

  if (target.hp === 0) {
    return "enemy-defeated";
  }

  render();
  return "continue";
}

async function performPatrickPiercingShot(state, render) {
  spendPatrickAbilityCost(state.player, { costSp: 8, costLucky: 2 });
  state.message = t("battle_ranged_prompt");
  playSfx("lockNLoad");
  await playPatrickRevolverIntroAnimation(state, render);
  render();

  const result = await startActionCheck(state, render, "revolver");
  playSfx("revolverShot");
  const pierceCount = result.tier === "green"
    ? 4
    : result.tier === "yellow"
      ? 3
      : 2;
  const targets = getLivingEnemiesInFrontOrder(state).slice(0, pierceCount);
  const projectileTarget = targets[targets.length - 1] ?? null;
  const baseDamage = getPatrickRevolverBaseDamage(state.player);
  await Promise.all([
    playPatrickRevolverOutroAnimation(state, render),
    projectileTarget
      ? playLinearProjectileEffect(
        state,
        render,
        createPatrickProjectileEffect(state, projectileTarget, "regular"),
        targets.map((target) => ({
          point: getEnemyProjectileImpactPoint(state, target),
          onImpact: () => {
            const damage = getPatrickRevolverActionDamage({
              attacker: state.player,
              target,
              baseDamage
            });
            dealDamage(target, damage);
          }
        }))
      )
      : Promise.resolve()
  ]);

  state.message = t("patrick_piercing_shot_hit", { count: targets.length, damage: baseDamage });
  render();
  return targets.some((target) => target.hp === 0) && !state.enemies.some((enemy) => enemy.hp > 0)
    ? "enemy-defeated"
    : "continue";
}

async function performPatrickHallowShot(state, render, target) {
  spendPatrickAbilityCost(state.player, { costSp: 8, costLucky: 2 });
  state.message = t("battle_ranged_prompt");
  playSfx("lockNLoad");
  await playPatrickRevolverIntroAnimation(state, render);
  render();

  const result = await startActionCheck(state, render, "revolver");
  playSfx("revolverShot");
  await Promise.all([
    playPatrickRevolverOutroAnimation(state, render),
    playPatrickProjectileEffect(state, render, {
      bulletType: "hollow",
      target
    })
  ]);
  const damageMultiplier = result.tier === "green"
    ? 1.5
    : result.tier === "yellow"
      ? 1.25
      : 1;
  const damage = getPatrickRevolverActionDamage({
    attacker: state.player,
    target,
    baseDamage: getPatrickRevolverBaseDamage(state.player) * 2,
    damageMultiplier
  });

  dealDamage(target, damage);
  applyStatusToUnit(target, "marked", PATRICK_HALLOW_MARKED_POWER, PATRICK_HALLOW_MARKED_TURNS);
  state.message = t("patrick_hallow_shot_hit", { damage });

  if (target.hp === 0) {
    return "enemy-defeated";
  }

  render();
  return "continue";
}

async function performPatrickMagnumShot(state, render, target) {
  spendPatrickAbilityCost(state.player, { costSp: 16, costLucky: 3 });
  state.message = t("battle_ranged_prompt");
  playSfx("lockNLoad");
  await playPatrickRevolverIntroAnimation(state, render);
  render();

  const result = await startActionCheck(state, render, "revolver");
  playSfx("revolverShot");
  await Promise.all([
    playPatrickRevolverOutroAnimation(state, render),
    playPatrickProjectileEffect(state, render, {
      bulletType: "magnum",
      target
    })
  ]);
  const damage = getPatrickRevolverActionDamage({
    attacker: state.player,
    target,
    baseDamage: getPatrickRevolverBaseDamage(state.player),
    damageMultiplier: 1.2
  });
  const stunTurns = PATRICK_MAGNUM_SHOT_BASE_TURNS + getPatrickMagnumShotTurnBonus(result.tier);

  dealDamage(target, damage);
  applyStatusToUnit(target, "stunned", PATRICK_MAGNUM_SHOT_STUN_POWER, stunTurns);
  state.message = t("patrick_magnum_shot_hit", { damage, turns: stunTurns });

  if (target.hp === 0) {
    return "enemy-defeated";
  }

  render();
  return "continue";
}

async function performPatrickSixShooter(state, render, target) {
  spendPatrickAbilityCost(state.player, { costSp: 24, costLucky: 4 });
  state.message = t("battle_ranged_prompt");
  playSfx("lockNLoad");
  await playPatrickRevolverIntroAnimation(state, render);
  render();

  const result = await startActionCheck(state, render, "revolver");
  setPatrickRevolverReadyPose(state, render);
  const bulletCount = PATRICK_SIX_SHOOTER_BASE_BULLETS + getPatrickSixShooterBulletBonus(result.tier);
  const damagePerBullet = getPatrickRevolverBaseDamage(state.player);
  let landedShots = 0;
  let totalDamage = 0;

  for (let shotIndex = 0; shotIndex < bulletCount; shotIndex += 1) {
    if (target.hp <= 0) {
      break;
    }

    playSfx("revolverShot");
    await Promise.all([
      playPatrickRevolverShotLoopAnimation(state, render, { settleToReady: true }),
      playPatrickProjectileEffect(state, render, {
        bulletType: "regular",
        target
      })
    ]);
    totalDamage += dealDamage(target, getPatrickRevolverActionDamage({
      attacker: state.player,
      target,
      baseDamage: damagePerBullet
    }));
    landedShots += 1;
    render();
  }
  state.player.animationOverride = null;
  state.message = t("patrick_six_shooter_hit", { count: landedShots, totalDamage });

  if (target.hp === 0) {
    return "enemy-defeated";
  }

  render();
  return "continue";
}

async function performPatrickDualWielding(state, render, target) {
  spendPatrickAbilityCost(state.player, { costSp: 24, costLucky: 3 });
  state.message = t("battle_ranged_prompt");
  playSfx("lockNLoad");
  await playPatrickDualWieldIntroAnimation(state, render);
  setPatrickDualWieldReadyPose(state, render);
  render();

  const result = await startActionCheck(state, render, "revolver");
  const secondaryTarget = getEnemyBehindTarget(state, target);
  const followUpTarget = secondaryTarget?.hp > 0 ? secondaryTarget : target;
  const damageMultiplier = getPatrickRevolverDamageMultiplier(result.tier);

  playSfx("revolverShot");
  await Promise.all([
    playPatrickDualWieldOutroAnimation(state, render, { settleToHold: true }),
    playPatrickProjectileEffect(state, render, {
      bulletType: "regular",
      target
    })
  ]);
  const primaryDamage = getPatrickRevolverActionDamage({
    attacker: state.player,
    target,
    baseDamage: getPatrickRevolverBaseDamage(state.player),
    damageMultiplier
  });
  dealDamage(target, primaryDamage);
  applyStatusToUnit(target, "slowness", PATRICK_DUAL_WIELDING_SLOWNESS_POWER, PATRICK_DUAL_WIELDING_SLOWNESS_TURNS);

  let secondaryDamage = 0;
  if (followUpTarget?.hp > 0) {
    playSfx("revolverShot");
    await Promise.all([
      playPatrickDualWieldSecondShotAnimation(state, render),
      playPatrickProjectileEffect(state, render, {
        bulletType: "regular",
        target: followUpTarget
      })
    ]);
    secondaryDamage = getPatrickRevolverActionDamage({
      attacker: state.player,
      target: followUpTarget,
      baseDamage: getPatrickRevolverBaseDamage(state.player),
      damageMultiplier
    });
    dealDamage(followUpTarget, secondaryDamage);
    applyStatusToUnit(followUpTarget, "slowness", PATRICK_DUAL_WIELDING_SLOWNESS_POWER, PATRICK_DUAL_WIELDING_SLOWNESS_TURNS);
  }

  state.message = t("patrick_dual_wielding_hit", { primaryDamage, secondaryDamage });
  render();
  return state.enemies.every((enemy) => enemy.hp <= 0) ? "enemy-defeated" : "continue";
}

async function performPatrickCoinToss(state, render, target) {
  spendPatrickAbilityCost(state.player, { costSp: 32, costLucky: 5 });
  state.message = t("battle_hold_release_prompt");
  setPatrickCoinTossAimPose(state, render);
  render();

  const firstCheck = await startActionCheck(state, render, "melee");
  spendPatrickAbilityCost(state.player, { costLucky: 1 });
  playSfx("coinFlip");
  await playPatrickTimedAnimation(state, render, "coin-toss-flip", PATRICK_COIN_TOSS_FLIP_DURATION_MS);
  if (!firstCheck.success) {
    state.player.animationOverride = null;
    playSfx("skillFailed");
    state.message = t("patrick_coin_toss_fail");
    render();
    return "continue";
  }

  const coinEffect = createPatrickCoinTossCoinEffect(state);
  state.projectileEffects = [
    ...(state.projectileEffects ?? []).filter((entry) => entry.endsAt > performance.now()),
    coinEffect
  ];
  state.message = t("battle_timed_prompt");
  render();
  playSfx("lockNLoad");
  const secondCheckPromise = startCoinTossAirCheck(state, render, coinEffect);
  await playPatrickCoinTossRevolverIntroAnimation(state, render, { settleToReady: true });
  const secondCheck = await secondCheckPromise;
  const coinPosition = getCoinTossCoinPosition(coinEffect);

  if (!secondCheck.success) {
    state.projectileEffects = (state.projectileEffects ?? []).filter((entry) => entry !== coinEffect && entry.endsAt > performance.now());
    state.player.animationOverride = null;
    playSfx("skillFailed");
    state.message = t("patrick_coin_toss_fail_timed");
    render();
    return "continue";
  }

  state.projectileEffects = (state.projectileEffects ?? []).filter((entry) => entry !== coinEffect && entry.endsAt > performance.now());
  render();
  playSfx("revolverShot");
  await Promise.all([
    playPatrickTimedAnimation(state, render, "coin-toss-shot", PATRICK_COIN_TOSS_SHOT_DURATION_MS),
    playPatrickCoinTossRicochetEffect(state, render, { coinPosition, target })
  ]);
  const damageMultiplier = getPatrickCoinTossDamageMultiplier(secondCheck.tier);
  const damage = getPatrickRevolverActionDamage({
    attacker: state.player,
    target,
    baseDamage: getPatrickRevolverBaseDamage(state.player),
    damageMultiplier
  });
  dealDamage(target, damage);
  state.message = damage > 0
    ? t("patrick_coin_toss_hit", { damage, multiplier: damageMultiplier })
    : t("patrick_coin_toss_miss");

  if (target.hp === 0) {
    return "enemy-defeated";
  }

  render();
  return "continue";
}

async function performPatrickFeelinFine(state, render) {
  spendPatrickAbilityCost(state.player, { costSp: 8, costLucky: 2 });
  playSfx("damSon", { playbackRate: 1.0 });
  const animationPromise = playPatrickTimedAnimation(state, render, "feelin-fine", PATRICK_FEELIN_FINE_ANIMATION_DURATION_MS);
  await wait(PATRICK_FEELIN_FINE_ANIMATION_DURATION_MS / 4);
  playSfx("fingerSnap");
  await animationPromise;
  state.player.storedWeaknessPower = 0;
  clearUnitStatuses(state.player, PATRICK_NEGATIVE_STATUS_KEYS);
  applyStatusToUnit(state.player, "cleansed", getPatrickFeelinFineCleansedPower(state.player), PATRICK_FEELIN_FINE_CLEANSED_TURNS);
  state.message = t("patrick_feelin_fine", { cleansedPower: formatRomanNumeral(getPatrickFeelinFineCleansedPower(state.player)) });
  render();
  return "continue";
}

async function performPatrickHealthInsurance(state, render) {
  spendPatrickAbilityCost(state.player, { costSp: 24, costLucky: 4 });
  playSfx("bling");
  await playPatrickAceCastAnimation(state, render, {
    icon: { row: 2, column: 2 }
  });
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + PATRICK_INSURANCE_HEAL);
  applyStatusToUnit(state.player, "hpRegen", PATRICK_INSURANCE_REGEN_POWER, PATRICK_INSURANCE_REGEN_TURNS);
  state.message = t("patrick_health_insurance");
  render();
  return { spentActions: 2 };
}

async function performPatrickAceOfSpades(state, render) {
  spendPatrickAbilityCost(state.player, { costSp: 0, costLucky: 4 });
  playSfx("bling");
  await playPatrickAceCastAnimation(state, render, {
    icon: { row: 2, column: 3 }
  });
  state.player.sp = Math.min(state.player.maxSp, state.player.sp + PATRICK_ACE_OF_SPADES_INSTANT_SP);
  applyStatusToUnit(state.player, "spRegen", PATRICK_ACE_OF_SPADES_SP_REGEN_POWER, PATRICK_ACE_OF_SPADES_SP_REGEN_TURNS);
  state.message = t("patrick_ace_of_spades");
  render();
  return "continue";
}

async function performPatrickAceOfDiamonds(state, render) {
  spendPatrickAbilityCost(state.player, { costSp: 16, costLucky: 3 });
  playSfx("bling");
  await playPatrickAceCastAnimation(state, render, {
    icon: { row: 2, column: 4 }
  });
  applyStatusToUnit(state.player, "absorption", PATRICK_ACE_OF_DIAMONDS_ABSORPTION_POWER, PATRICK_ACE_OF_DIAMONDS_STATUS_TURNS);
  applyStatusToUnit(state.player, "strength", PATRICK_ACE_OF_DIAMONDS_STRENGTH_POWER, PATRICK_ACE_OF_DIAMONDS_STATUS_TURNS);
  state.message = t("patrick_ace_of_diamonds");
  render();
  return "continue";
}

async function performPatrickAceOfClubs(state, render) {
  spendPatrickAbilityCost(state.player, { costSp: 16, costLucky: 3 });
  playSfx("bling");
  await playPatrickAceCastAnimation(state, render, {
    icon: { row: 2, column: 5 }
  });

  const livingEnemies = state.enemies.filter((enemy) => enemy.hp > 0);
  livingEnemies.forEach((enemy) => {
    applyStatusToUnit(enemy, "slowness", PATRICK_ACE_OF_CLUBS_SLOWNESS_POWER, PATRICK_ACE_OF_CLUBS_STATUS_TURNS);
    applyStatusToUnit(enemy, "marked", PATRICK_ACE_OF_CLUBS_MARKED_POWER, PATRICK_ACE_OF_CLUBS_STATUS_TURNS);
  });

  state.message = t("patrick_ace_of_clubs");
  render();
  return livingEnemies.length > 0 && !state.enemies.some((enemy) => enemy.hp > 0)
    ? "enemy-defeated"
    : "continue";
}

async function performBurgerItem(state, render) {
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + PATRICK_BURGER_HEAL);
  applyStatusToUnit(state.player, "hpRegen", PATRICK_BURGER_REGEN_POWER, PATRICK_BURGER_REGEN_TURNS);
  state.message = t("battle_burger_item");
  render();
  return "continue";
}

function clearNegativeStatuses(unit, negativeStatusKeys = PATRICK_NEGATIVE_STATUS_KEYS) {
  negativeStatusKeys.forEach((statusKey) => {
    if (!unit?.statuses?.[statusKey]) {
      return;
    }

    unit.statuses[statusKey].power = 0;
    unit.statuses[statusKey].turns = 0;
  });
}

async function performSaladItem(state, render) {
  clearNegativeStatuses(state.player);
  applyStatusToUnit(state.player, "cleansed", SALAD_CLEANSED_POWER, SALAD_CLEANSED_TURNS);
  state.message = t("battle_salad_item", { power: formatRomanNumeral(SALAD_CLEANSED_POWER), turns: SALAD_CLEANSED_TURNS });
  render();
  return "continue";
}

async function performCherryItem(state, render) {
  const livingEnemies = state.enemies.filter((enemy) => enemy.hp > 0);
  livingEnemies.forEach((enemy) => {
    applyStatusToUnit(enemy, "fire", CHERRY_FIRE_POWER, CHERRY_FIRE_TURNS);
  });
  applyStatusToUnit(state.player, "strength", CHERRY_STRENGTH_POWER, CHERRY_STRENGTH_TURNS);
  state.message = t("battle_cherry_item", {
    firePower: formatRomanNumeral(CHERRY_FIRE_POWER),
    fireTurns: CHERRY_FIRE_TURNS,
    strengthPower: formatRomanNumeral(CHERRY_STRENGTH_POWER),
    strengthTurns: CHERRY_STRENGTH_TURNS
  });
  render();
  return "continue";
}

async function performBombItem(state, render) {
  const livingEnemies = state.enemies.filter((enemy) => enemy.hp > 0);
  let enemyDefeated = false;
  livingEnemies.forEach((enemy) => {
    dealDamage(enemy, BOMB_DAMAGE);
    applyStatusToUnit(enemy, "stunned", BOMB_STUN_POWER, BOMB_STUN_TURNS);
    enemyDefeated = enemyDefeated || enemy.hp <= 0;
  });
  applyStatusToUnit(state.player, "slowness", BOMB_SELF_SLOWNESS_POWER, BOMB_SELF_SLOWNESS_TURNS + 1);
  state.message = t("battle_bomb_item", {
    damage: BOMB_DAMAGE,
    stunPower: formatRomanNumeral(BOMB_STUN_POWER),
    stunTurns: BOMB_STUN_TURNS,
    slowPower: formatRomanNumeral(BOMB_SELF_SLOWNESS_POWER),
    slowTurns: BOMB_SELF_SLOWNESS_TURNS
  });
  render();
  if (state.enemies.every((enemy) => enemy.hp <= 0)) {
    return "enemy-defeated";
  }

  return enemyDefeated ? { enemyDefeated: true } : "continue";
}

async function performInventoryItemAction(action, state, render) {
  if (!action?.itemId) {
    return "continue";
  }

  if (action.itemId === BURGER_ITEM_ID) {
    const consumed = consumeInventoryItem(state.player, action.inventorySlotIndex, 1);
    if (consumed <= 0) {
      return "continue";
    }

    setActionMenu(state, state.actionMenu ?? "root");
    return performBurgerItem(state, render);
  }

  if ([SALAD_ITEM_ID, CHERRY_ITEM_ID, BOMB_ITEM_ID].includes(action.itemId)) {
    const consumed = consumeInventoryItem(state.player, action.inventorySlotIndex, 1);
    if (consumed <= 0) {
      return "continue";
    }

    setActionMenu(state, state.actionMenu ?? "root");
    if (action.itemId === SALAD_ITEM_ID) {
      return performSaladItem(state, render);
    }
    if (action.itemId === CHERRY_ITEM_ID) {
      return performCherryItem(state, render);
    }
    return performBombItem(state, render);
  }

  return "continue";
}

function getJacobTeamUnits(state) {
  return [state.player, state.player.shadow].filter((unit) => unit && (unit.hp ?? 0) > 0);
}

function getJacobAliveTeammateCount(player) {
  return player?.shadow && (player.shadow.hp ?? 0) > 0 ? 1 : 0;
}

function syncJacobDerivedStats(player, currentTurn = null) {
  if (!player || player.characterId !== JACOB_CHARACTER_ID) {
    return;
  }

  const turn = currentTurn ?? player.currentGlobalTurn ?? 0;
  const previousMaxHp = Number(player.maxHp) || 0;
  const nextMaxHp = getJacobEnduranceMaxHp(player);
  player.maxHp = nextMaxHp;
  if (previousMaxHp <= 0) {
    player.hp = Math.min(nextMaxHp, Math.max(0, player.hp ?? nextMaxHp));
  } else {
    player.hp = Math.min(nextMaxHp, Math.max(0, (player.hp ?? 0) + Math.max(0, nextMaxHp - previousMaxHp)));
  }
  if (!player.attributes) {
    player.attributes = { defense: 0, fireImmunity: false, flying: false, mobile: false };
  }
  player.attributes.defense = getJacobDefenseValue(player, getJacobAliveTeammateCount(player), turn);
}

function gainJacobSp(player, amount) {
  const gain = Math.max(0, Math.floor(Number(amount) || 0));
  if (gain <= 0 || (player?.maxSp ?? 0) <= 0) {
    return;
  }

  player.sp = Math.min(player.maxSp, (player.sp ?? 0) + gain);
}

function createJacobGoalState(createStatuses) {
  return {
    id: "goal",
    summonActionId: "goal",
    hp: JACOB_GOAL_HP,
    maxHp: JACOB_GOAL_HP,
    shp: 0,
    maxShp: 0,
    baseActionsPerTurn: 0,
    actionProgress: 0,
    actionsRemaining: 0,
    renderOffsetX: 0,
    renderOffsetY: 0,
    targetWeight: JACOB_GOAL_TARGET_WEIGHT,
    attributes: {
      defense: 0,
      fireImmunity: false,
      flying: false,
      mobile: false
    },
    statuses: createStatuses()
  };
}

async function performJacobDefend(state, render) {
  const spGain = isJacobActionUnlocked(state.player, "block") ? JACOB_BLOCK_UPGRADED_SP_GAIN : JACOB_BLOCK_SP_GAIN;
  state.player.defendActiveUntilTurn = state.globalTurn;
  state.player.blockParryReady = isJacobActionUnlocked(state.player, "block");
  gainJacobSp(state.player, spGain);
  applyStatusToUnit(state.player, "resistance", JACOB_BLOCK_RESISTANCE_POWER, 2);
  syncJacobDerivedStats(state.player, state.globalTurn);
  state.message = t("jacob_defend", { sp: spGain });
  render();
  return { spentActions: 2 };
}

async function performJacobGroupBuff(state, render) {
  const upgraded = isJacobActionUnlocked(state.player, "group-buff-upgrade");
  const strengthPower = upgraded ? JACOB_GROUP_BUFF_UPGRADED_STRENGTH_POWER : JACOB_GROUP_BUFF_STRENGTH_POWER;
  const strengthTurns = upgraded ? JACOB_GROUP_BUFF_UPGRADED_STRENGTH_TURNS : JACOB_GROUP_BUFF_STRENGTH_TURNS;
  getJacobTeamUnits(state).forEach((unit) => {
    applyStatusToUnit(unit, "strength", strengthPower, strengthTurns);
    if (upgraded) {
      applyStatusToUnit(unit, "speed", JACOB_GROUP_BUFF_SPEED_POWER, JACOB_GROUP_BUFF_SPEED_TURNS);
    }
  });
  state.message = t(upgraded ? "jacob_group_buff_plus" : "jacob_group_buff");
  render();
  return "continue";
}

function getJacobGoodVibesHealAmount(state) {
  return Math.min(
    JACOB_GOOD_VIBES_HEAL_CAP,
    JACOB_GOOD_VIBES_BASE_HEAL + getJacobAliveTeammateCount(state.player) * JACOB_GOOD_VIBES_TEAM_HEAL
  );
}

async function performJacobGoodVibes(state, render) {
  const healAmount = getJacobGoodVibesHealAmount(state);
  applyStatusToUnit(state.player, "slowness", JACOB_GOOD_VIBES_SLOWNESS_POWER, JACOB_GOOD_VIBES_SLOWNESS_TURNS + 1);
  getJacobTeamUnits(state).forEach((unit) => {
    unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
    applyStatusToUnit(unit, "hpRegen", JACOB_GOOD_VIBES_REGEN_POWER, JACOB_GOOD_VIBES_REGEN_TURNS);
    applyStatusToUnit(unit, "spRegen", JACOB_GOOD_VIBES_REGEN_POWER, JACOB_GOOD_VIBES_REGEN_TURNS);
    applyStatusToUnit(unit, "cleansed", JACOB_GOOD_VIBES_CLEANSED_POWER, JACOB_GOOD_VIBES_CLEANSED_TURNS);
  });
  state.message = t("jacob_good_vibes", { heal: healAmount });
  render();
  return "continue";
}

async function performJacobGoal(state, render) {
  state.player.shadow = createJacobGoalState(createEmptyStatuses);
  syncJacobDerivedStats(state.player, state.globalTurn);
  state.message = t("jacob_goal");
  render();
  return "continue";
}

async function performJacobFriendlyChatter(state, render) {
  getJacobTeamUnits(state).forEach((unit) => {
    applyStatusToUnit(unit, "hpRegen", JACOB_FRIENDLY_CHATTER_REGEN_POWER, JACOB_FRIENDLY_CHATTER_TURNS);
    applyStatusToUnit(unit, "absorption", JACOB_FRIENDLY_CHATTER_ABSORPTION_POWER, JACOB_FRIENDLY_CHATTER_TURNS);
  });
  state.message = t("jacob_friendly_chatter");
  render();
  return "continue";
}

async function performJacobGuard(state, render) {
  state.player.guardDefenseUntilTurn = state.globalTurn + JACOB_GUARD_TURNS;
  applyStatusToUnit(state.player, "spRegen", JACOB_GUARD_SP_REGEN_POWER, JACOB_GUARD_TURNS + 1);
  syncJacobDerivedStats(state.player, state.globalTurn);
  state.message = t("jacob_guard");
  render();
  return "continue";
}

async function performJacobBallAttack(state, render, target, { actionId }) {
  const readyProjectile = createJacobBallProjectileEffect(state, target, actionId, {
    bulletSize: 24,
    disableTrail: true
  });
  readyProjectile.endX = readyProjectile.startX;
  readyProjectile.endY = readyProjectile.startY;
  readyProjectile.arcHeight = 0;
  readyProjectile.endsAt = performance.now() + getScaledDuration(state, JACOB_BALL_BAR_DURATION_MS + 250);
  addProjectileEffect(state, readyProjectile);
  render();

  const result = await startJacobBallActionCheck(state, render, {
    actionId,
    windows: actionId === "volley"
      ? [
        { center: 18, width: 12 },
        { center: 51, width: 6 },
        { center: 84, width: 3 }
      ]
      : [
        { center: 18, width: 16 },
        { center: 51, width: 10 },
        { center: 84, width: 6 }
      ]
  });

  removeProjectileEffect(state, readyProjectile);
  playSfx("ball");
  render();
  await playLinearProjectileEffect(
    state,
    render,
    createJacobBallProjectileEffect(state, target, actionId, {
      speedPxPerMs: JACOB_BALL_PROJECTILE_SPEED_PX_PER_MS,
      minDurationMs: JACOB_BALL_MIN_DURATION_MS,
      bulletSize: 24,
      flashSize: 0,
      disableTrail: false
    }),
    [{
      progress: 1,
      sfxKey: "bounce",
      onImpact: () => {}
    }]
  );
  if (state.player.animationOverride?.type === "jacob-ball") {
    state.player.animationOverride = null;
  }

  const step = getJacobBallWindowBonusStep(state.player);
  const baseDamage = getJacobBallBaseDamage(state.player);
  const hits = result.hits;
  const misses = result.misses;
  let scaledBaseDamage = actionId === "corner-shot" ? baseDamage * 2 : baseDamage;
  let bonusDamage = 0;
  let stunTurns = 0;

  if (actionId === "volley") {
    bonusDamage = scaledBaseDamage * hits;
    scaledBaseDamage = Math.max(0, scaledBaseDamage - misses * 4);
    stunTurns = Math.min(JACOB_VOLLEY_STUN_MAX_TURNS, 1 + hits);
  } else {
    bonusDamage = Math.ceil(scaledBaseDamage * Math.min(1, hits * step));
  }

  const damage = getActionDamage({
    attacker: state.player,
    target,
    baseDamage: scaledBaseDamage,
    bonusDamage,
    attackStyle: "ranged",
    attackElement: actionId === "fireball" ? "fire" : null
  });

  dealDamage(target, damage);
  if (actionId === "fireball") {
    applyStatusToUnit(target, "fire", JACOB_FIREBALL_BASE_POWER + hits, JACOB_FIREBALL_TURNS);
  } else if (actionId === "slowball") {
    applyStatusToUnit(target, "slowness", JACOB_SLOWBALL_BASE_POWER + hits, JACOB_SLOWBALL_TURNS);
  } else if (actionId === "corner-shot") {
    applyStatusToUnit(target, "weakness", 6, 2);
  } else if (actionId === "volley" && stunTurns > 0) {
    applyStatusToUnit(target, "stunned", JACOB_VOLLEY_STUN_POWER, stunTurns);
  }

  state.message = t(`jacob_${String(actionId).replace(/-/g, "_")}`, { damage, hits });
  render();
  return target.hp <= 0 ? "enemy-defeated" : "continue";
}

function awardPendingEnemyDrops(state) {
  const dropTable = [BOMB_ITEM_ID, CHERRY_ITEM_ID, SALAD_ITEM_ID];
  state.enemies.forEach((enemy) => {
    if (!enemy || enemy.hp > 0 || enemy.lootRolled === true) {
      return;
    }

    enemy.lootRolled = true;
    dropTable.forEach((itemId) => {
      if (Math.random() < ENEMY_ITEM_DROP_CHANCE) {
        addInventoryItem(state.player, itemId, 1);
      }
    });
  });
}

function startActionCheck(state, render, type, options = {}) {
  return new Promise((resolve) => {
    const hasYellowWindow = options.hasYellowWindow ?? (type === "ranged" || type === "revolver");
    const greenWidth = type === "melee"
      ? MELEE_GREEN_WIDTH
      : type === "revolver"
        ? REVOLVER_GREEN_WIDTH
      : type === "ranged"
        ? RANGED_GREEN_WIDTH
        : DODGE_MAX_VALUE;
    const yellowPadding = hasYellowWindow ? REVOLVER_YELLOW_PADDING : 0;
    const speedFactor = getBattleSpeedFactor(state);
    const greenStart = type === "timed"
      ? 0
      : 10 + Math.floor(Math.random() * (DODGE_MAX_VALUE - greenWidth - (yellowPadding * 2) - 10 + 1)) + yellowPadding;
    const greenEnd = greenStart + greenWidth;
    const pulseDelayMs = getScaledDuration(
      state,
      TIMED_PULSE_DELAY_MIN_MS + Math.random() * (TIMED_PULSE_DELAY_MAX_MS - TIMED_PULSE_DELAY_MIN_MS)
    );
    const now = performance.now();

    state.actionCheck = {
      active: true,
      type,
      isHolding: false,
      value: type === "ranged" || type === "revolver" ? 50 : 0,
      direction: 1,
      greenStart,
      greenEnd,
      yellowStart: hasYellowWindow ? Math.max(0, greenStart - REVOLVER_YELLOW_PADDING) : null,
      yellowEnd: hasYellowWindow ? Math.min(DODGE_MAX_VALUE, greenEnd + REVOLVER_YELLOW_PADDING) : null,
      driftVelocity: (Math.random() < 0.5 ? -1 : 1) * RANGED_DRIFT_SPEED_PER_MS,
      nextJitterChangeAt: now + getRangedJitterIntervalMs(),
      timedOpacity: TIMED_PULSE_BASE_OPACITY,
      timedVisible: false,
      pulseStartAt: now + pulseDelayMs,
      pulseEndAt: now + pulseDelayMs + getScaledDuration(state, TIMED_PULSE_DURATION_MS),
      lastFrameAt: now,
      timeoutId: window.setTimeout(() => {
        finalizeActionCheck(state, render);
      }, getScaledDuration(state, ACTION_CHECK_TIMEOUT_MS)),
      resolve
    };
    function tick(frameNow) {
      const actionCheck = state.actionCheck;

      if (!actionCheck?.active) {
        return;
      }

      const delta = (frameNow - actionCheck.lastFrameAt) * speedFactor;
      actionCheck.lastFrameAt = frameNow;

      if (actionCheck.type === "melee") {
        if (actionCheck.isHolding) {
          actionCheck.value += delta * DODGE_RATE_PER_MS * actionCheck.direction;

          if (actionCheck.value >= DODGE_MAX_VALUE) {
            actionCheck.value = DODGE_MAX_VALUE;
            actionCheck.direction = -1;
          } else if (actionCheck.value <= 0) {
            actionCheck.value = 0;
            actionCheck.direction = 1;
          }
        }
      } else if (actionCheck.type === "ranged" || actionCheck.type === "revolver") {
        actionCheck.value += delta * RANGED_STOPSHOT_RATE_PER_MS * actionCheck.direction;

        if (actionCheck.value >= DODGE_MAX_VALUE) {
          actionCheck.value = DODGE_MAX_VALUE;
          actionCheck.direction = -1;
        } else if (actionCheck.value <= 0) {
          actionCheck.value = 0;
          actionCheck.direction = 1;
        }
      } else if (actionCheck.type === "timed") {
        if (frameNow >= actionCheck.pulseStartAt && frameNow <= actionCheck.pulseEndAt) {
          const progress = (frameNow - actionCheck.pulseStartAt) / TIMED_PULSE_DURATION_MS;
          const pulseStrength = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
          actionCheck.timedOpacity = TIMED_PULSE_BASE_OPACITY + pulseStrength * (1 - TIMED_PULSE_BASE_OPACITY);
          actionCheck.timedVisible = true;
          actionCheck.timedPulseStrength = pulseStrength;
        } else {
          actionCheck.timedOpacity = TIMED_PULSE_BASE_OPACITY;
          actionCheck.timedVisible = false;
          actionCheck.timedPulseStrength = 0;
        }
      } else if (actionCheck.type === "timed-tiered") {
        if (frameNow >= actionCheck.pulseStartAt && frameNow <= actionCheck.pulseEndAt) {
          const progress = (frameNow - actionCheck.pulseStartAt) / TIMED_PULSE_DURATION_MS;
          const pulseStrength = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
          actionCheck.timedOpacity = TIMED_PULSE_BASE_OPACITY + pulseStrength * (1 - TIMED_PULSE_BASE_OPACITY);
          actionCheck.timedVisible = true;
          actionCheck.timedPulseStrength = pulseStrength;
        } else {
          actionCheck.timedOpacity = TIMED_PULSE_BASE_OPACITY;
          actionCheck.timedVisible = false;
          actionCheck.timedPulseStrength = 0;
        }
      } else if (actionCheck.type === "coin-toss-air") {
        const coinState = getCoinTossAirCheckState(actionCheck.coinEffect, frameNow);
        actionCheck.value = coinState.value;
        actionCheck.coinTier = coinState.tier;
      }

      render();
      window.requestAnimationFrame(tick);
    }

    render();
    window.requestAnimationFrame(tick);
  });
}

function startCoinTossAirCheck(state, render, coinEffect) {
  return new Promise((resolve) => {
    const now = performance.now();
    const timeoutMs = Math.max(1, Number(coinEffect?.endsAt ?? now) - now);

    state.actionCheck = {
      active: true,
      type: "coin-toss-air",
      value: 0,
      greenStart: 100 / 3,
      greenEnd: 200 / 3,
      yellowStart: 0,
      yellowEnd: 100,
      coinEffect,
      coinTier: "miss",
      timedOpacity: TIMED_PULSE_BASE_OPACITY,
      timedTransition: 0,
      timeoutId: window.setTimeout(() => {
        finalizeActionCheck(state, render, { forcedTimedTier: "miss" });
      }, timeoutMs),
      resolve
    };

    function tick() {
      const actionCheck = state.actionCheck;
      if (!actionCheck?.active || actionCheck.type !== "coin-toss-air") {
        return;
      }

      const coinState = getCoinTossAirCheckState(actionCheck.coinEffect, performance.now());
      actionCheck.value = coinState.value;
      actionCheck.coinTier = coinState.tier;
      actionCheck.timedTransition = getCoinTossAirTransition(actionCheck.coinTier);
      actionCheck.timedOpacity = 1;
      render();
      window.requestAnimationFrame(tick);
    }

    render();
    window.requestAnimationFrame(tick);
  });
}

function startJacobBallActionCheck(state, render, options = {}) {
  return new Promise((resolve) => {
    const now = performance.now();
    const windows = (options.windows ?? []).map((windowConfig) => {
      const width = Math.max(0.5, Number(windowConfig.width) || 0);
      const originCenter = Math.max(0, Math.min(100, Number(windowConfig.center) || 0));
      const center = Math.max(
        width / 2,
        Math.min(
          100 - (width / 2),
          originCenter + (Math.random() * (JACOB_BALL_WINDOW_ORIGIN_RANDOM_OFFSET * 2)) - JACOB_BALL_WINDOW_ORIGIN_RANDOM_OFFSET
        )
      );
      return {
        center,
        width,
        start: center - (width / 2),
        end: center + (width / 2),
        hit: false,
        resolved: false
      };
    });

    state.actionCheck = {
      active: true,
      type: "jacob-ball",
      actionId: options.actionId ?? "kick",
      value: 0,
      windows,
      currentWindowIndex: 0,
      animationWindowIndex: 0,
      lastFrameAt: now,
      timeoutId: window.setTimeout(() => {
        finalizeActionCheck(state, render);
      }, getScaledDuration(state, JACOB_BALL_BAR_DURATION_MS + 120)),
      resolve
    };
    state.player.animationOverride = {
      type: "jacob-ball",
      startedAt: now,
      endsAt: now + getScaledDuration(state, JACOB_BALL_BAR_DURATION_MS + 120),
      windowIndex: 0
    };

    function tick(frameNow) {
      const actionCheck = state.actionCheck;
      if (!actionCheck?.active || actionCheck.type !== "jacob-ball") {
        return;
      }

      const delta = frameNow - actionCheck.lastFrameAt;
      actionCheck.lastFrameAt = frameNow;
      const acceleration = JACOB_BALL_START_SPEED_MULTIPLIER + 0.125 * Math.min(1, actionCheck.value / 90);
      actionCheck.value = Math.min(100, actionCheck.value + ((100 / JACOB_BALL_BAR_DURATION_MS) * delta * acceleration));

      while ((actionCheck.currentWindowIndex ?? 0) < actionCheck.windows.length) {
        const currentWindow = actionCheck.windows[actionCheck.currentWindowIndex];
        if (actionCheck.value <= currentWindow.end) {
          break;
        }
        currentWindow.resolved = true;
        actionCheck.currentWindowIndex += 1;
        actionCheck.animationWindowIndex = Math.min(actionCheck.windows.length, actionCheck.currentWindowIndex);
        if (state.player.animationOverride?.type === "jacob-ball") {
          state.player.animationOverride.windowIndex = actionCheck.animationWindowIndex;
        }
      }

      if (actionCheck.value >= 100) {
        finalizeActionCheck(state, render);
        return;
      }

      render();
      window.requestAnimationFrame(tick);
    }

    render();
    window.requestAnimationFrame(tick);
  });
}

function registerJacobBallInput(state) {
  const actionCheck = state?.actionCheck;
  if (!actionCheck?.active || actionCheck.type !== "jacob-ball") {
    return;
  }

  const currentWindow = actionCheck.windows[actionCheck.currentWindowIndex];
  if (!currentWindow) {
    return;
  }

  currentWindow.resolved = true;
  if (actionCheck.value >= currentWindow.start && actionCheck.value <= currentWindow.end) {
    currentWindow.hit = true;
    playSfx("skillCheck");
    showSkillFeedback(state, "great");
  } else {
    playSfx("skillFailed");
  }
  actionCheck.currentWindowIndex += 1;
  actionCheck.animationWindowIndex = Math.min(actionCheck.windows.length, actionCheck.currentWindowIndex);
  if (state.player.animationOverride?.type === "jacob-ball") {
    state.player.animationOverride.windowIndex = actionCheck.animationWindowIndex;
  }
}

function finalizeActionCheck(state, render, options = {}) {
  const actionCheck = state.actionCheck;

  if (!actionCheck?.active) {
    return;
  }

  actionCheck.active = false;
  window.clearTimeout(actionCheck.timeoutId);
  actionCheck.isHolding = false;

  let success;
  let tier = "miss";
  if (actionCheck.type === "jacob-ball") {
    const hits = actionCheck.windows.filter((window) => window.hit).length;
    const misses = actionCheck.windows.length - hits;
    actionCheck.animationWindowIndex = actionCheck.windows.length;
    state.actionCheck = null;
    if (state.player.animationOverride?.type === "jacob-ball") {
      state.player.animationOverride.windowIndex = actionCheck.windows.length;
      state.player.animationOverride.endsAt = performance.now() + getScaledDuration(state, 450);
    }
    actionCheck.resolve({
      success: hits > 0,
      tier: hits > 0 ? "green" : "miss",
      hits,
      misses
    });
    render();
    return;
  } else if (actionCheck.type === "ranged") {
    tier = actionCheck.value >= actionCheck.greenStart - ACTION_CHECK_FORGIVENESS
      && actionCheck.value <= actionCheck.greenEnd + ACTION_CHECK_FORGIVENESS
      ? "green"
      : "miss";
    success = tier === "green";
  } else if (actionCheck.type === "timed") {
    success = Boolean(options.forcedSuccess);
    tier = success ? "green" : "miss";
  } else if (actionCheck.type === "timed-tiered") {
    tier = options.forcedTimedTier ?? getTimedActionTier(actionCheck);
    success = tier !== "miss";
  } else if (actionCheck.type === "coin-toss-air") {
    tier = options.forcedTimedTier ?? actionCheck.coinTier ?? "miss";
    success = tier === "green" || tier === "yellow";
  } else if (actionCheck.type === "revolver") {
    tier = actionCheck.value >= actionCheck.greenStart - ACTION_CHECK_FORGIVENESS
      && actionCheck.value <= actionCheck.greenEnd + ACTION_CHECK_FORGIVENESS
      ? "green"
      : actionCheck.value >= actionCheck.yellowStart - ACTION_CHECK_FORGIVENESS
        && actionCheck.value <= actionCheck.yellowEnd + ACTION_CHECK_FORGIVENESS
        ? "yellow"
        : "miss";
    success = tier === "green" || tier === "yellow";
  } else {
    success = (
      actionCheck.value >= actionCheck.greenStart - ACTION_CHECK_FORGIVENESS &&
      actionCheck.value <= actionCheck.greenEnd + ACTION_CHECK_FORGIVENESS
    );
    tier = success ? "green" : "miss";
  }

  state.actionCheck = null;
  if (tier === "yellow" || tier === "green") {
    playSfx("skillCheck");
    showSkillFeedback(
      state,
      tier === "green"
        ? actionCheck.type === "coin-toss-air"
          ? "amazing"
          : "great"
        : "good"
    );
  }
  actionCheck.resolve({ success, tier });
  render();
}

function finalizeDodgeCheck(state, render, options = {}) {
  const dodgeCheck = state.dodgeCheck;

  if (!dodgeCheck?.active) {
    return;
  }

  dodgeCheck.active = false;
  window.clearTimeout(dodgeCheck.timeoutId);
  if ("isHolding" in dodgeCheck) {
    dodgeCheck.isHolding = false;
  }
  const result = options.forcedResult ?? getDodgeResult(dodgeCheck.value, dodgeCheck);
  state.dodgeCheck = null;
  const isKostyaCounterCheck = isKostyaCounterDodgeCheck(state.player, dodgeCheck);
  const isJacobDefendBlock = state.player.characterId === JACOB_CHARACTER_ID
    && result === "perfect"
    && (state.player.defendActiveUntilTurn ?? 0) >= state.globalTurn;
  let counterAnimationStarted = false;
  if (result === "counter" && isKostyaCounterCheck) {
    playSfx("skillCheck");
    playSfx("counter");
    playSfx("clash");
    showSkillFeedback(state, "counter");
    if (dodgeCheck.type === "timed") {
      counterAnimationStarted = true;
      playKostyaClashDodgeAnimation(state, render);
    }
  } else if (result === "perfect") {
    playSfx("skillCheck");
    if (!isJacobDefendBlock) {
      playSfx(isKostyaCounterCheck ? "clash" : "dodge");
    }
    showSkillFeedback(state, "great");
  } else if (result === "partial") {
    playSfx("skillCheck");
    showSkillFeedback(state, "good");
  } else if (result === "fail" && dodgeCheck.type === "timed") {
    playSfx("skillFailed");
  }

  const resolvePayload = {
    value: dodgeCheck.value ?? 0,
    result,
    animationStarted: counterAnimationStarted
  };

  if (dodgeCheck.type === "timed" && dodgeCheck.projectileEffect) {
    if (result === "fail") {
      settleTimedProjectileOnImpact(state, render, dodgeCheck.projectileEffect, () => {
        dodgeCheck.resolve(resolvePayload);
        render();
      });
      return;
    }

    if (result === "partial") {
      settleTimedProjectileOnImpact(state, render, dodgeCheck.projectileEffect, () => {
        dodgeCheck.resolve(resolvePayload);
        render();
      });
      return;
    }

    if (result === "counter") {
      returnTimedProjectileToAttacker(state, render, dodgeCheck.projectileEffect, dodgeCheck.projectileAttacker, () => {
        dodgeCheck.resolve(resolvePayload);
        render();
      });
      return;
    }

    continueTimedProjectileAfterDodge(state, render, dodgeCheck.projectileEffect);
  }

  dodgeCheck.resolve(resolvePayload);
  render();
}

function getDodgeResult(value, dodgeCheck) {
  if (dodgeCheck.type === "timed") {
    return getTimedDodgeResult(dodgeCheck);
  }

  if (typeof dodgeCheck.counterStart === "number" && typeof dodgeCheck.counterEnd === "number") {
    if (value >= dodgeCheck.counterStart - DODGE_FORGIVENESS && value <= dodgeCheck.counterEnd + DODGE_FORGIVENESS) {
      return "counter";
    }

    if (dodgeCheck.counterOnly === true) {
      return "fail";
    }

    if (
      (value >= dodgeCheck.leftGreenStart - DODGE_FORGIVENESS && value <= dodgeCheck.leftGreenEnd + DODGE_FORGIVENESS)
      || (value >= dodgeCheck.rightGreenStart - DODGE_FORGIVENESS && value <= dodgeCheck.rightGreenEnd + DODGE_FORGIVENESS)
    ) {
      return "perfect";
    }

    if (
      (value >= dodgeCheck.leftYellowStart - DODGE_FORGIVENESS && value <= dodgeCheck.leftYellowEnd + DODGE_FORGIVENESS)
      || (value >= dodgeCheck.rightYellowStart - DODGE_FORGIVENESS && value <= dodgeCheck.rightYellowEnd + DODGE_FORGIVENESS)
    ) {
      return "partial";
    }

    return "fail";
  }

  if (value >= dodgeCheck.greenStart - DODGE_FORGIVENESS && value <= dodgeCheck.greenEnd + DODGE_FORGIVENESS) {
    return "perfect";
  }

  if (value >= dodgeCheck.yellowStart - DODGE_FORGIVENESS && value <= dodgeCheck.yellowEnd + DODGE_FORGIVENESS) {
    return "partial";
  }

  return "fail";
}

function getTimedDodgeResult(dodgeCheck) {
  if (dodgeCheck.projectileEffect) {
    applyEnemyTimedDodgeVisualState(dodgeCheck, performance.now());
  }

  return getTimedDodgeResultForTier(dodgeCheck?.timedResultTier ?? dodgeCheck?.timedTier ?? "miss", dodgeCheck);
}

function getTimedDodgeResultForDisplayedTier(dodgeCheck) {
  return getTimedDodgeResultForTier(dodgeCheck?.timedDisplayTier ?? dodgeCheck?.timedTier ?? "miss", dodgeCheck);
}

function getTimedDodgeResultForTier(tier, dodgeCheck) {
  if (dodgeCheck.counterOnly === true) {
    return tier === "counter" ? "counter" : "fail";
  }

  if (tier === "green") {
    return "perfect";
  }

  if (tier === "yellow") {
    return "partial";
  }

  return "fail";
}

function getDodgeDamageMultiplier(dodgeResult) {
  if (dodgeResult === "perfect" || dodgeResult === "counter") {
    return 0;
  }

  if (dodgeResult === "partial") {
    return 0.5;
  }

  return 1;
}

function getActionDamage({ attacker, target, baseDamage, bonusDamage = 0, damageMultiplier = 1, attackStyle = "melee", attackElement = null }) {
  const totalBase = (baseDamage + bonusDamage) * damageMultiplier;
  const rawDamage = Math.max(0, Math.floor(totalBase * getDamageMultiplier(attacker, target, attackStyle)));
  return getMitigatedDamage(rawDamage, target, { attackStyle, attackElement });
}

function getPatrickRevolverActionDamage({ attacker, target, baseDamage, bonusDamage = 0, damageMultiplier = 1, attackElement = null }) {
  return getActionDamage({
    attacker,
    target,
    baseDamage,
    bonusDamage,
    damageMultiplier: damageMultiplier * getPatrickMarkedDamageMultiplier(target),
    attackStyle: "ranged",
    attackElement
  });
}

function resolveDamageAgainstTarget({ attacker, target, baseDamage, incomingMultiplier = 1, attackStyle = "melee", attackElement = null }) {
  const rawDamage = Math.max(0, Math.floor(baseDamage * getDamageMultiplier(attacker, target, attackStyle) * incomingMultiplier));
  const amount = getMitigatedDamage(rawDamage, target, { attackStyle, attackElement });
  return dealDamage(target, amount);
}

function wouldAttackBeLethal({ attacker, target, baseDamage, attackStyle = "melee", attackElement = null }) {
  const rawDamage = Math.max(0, Math.floor(baseDamage * getDamageMultiplier(attacker, target, attackStyle)));
  const amount = getMitigatedDamage(rawDamage, target, { attackStyle, attackElement });
  return amount >= (target?.hp ?? 0);
}

function getMitigatedDamage(amount, target, { attackStyle = "melee", attackElement = null } = {}) {
  const normalizedAmount = Math.max(0, Math.floor(amount));
  if (normalizedAmount <= 0) {
    return 0;
  }

  if (attackElement === "fire" && hasFireImmunity(target)) {
    return 0;
  }

  const defense = getEffectiveDefenseValue(target, attackStyle);
  const mitigatedAmount = Math.max(0, normalizedAmount - defense);
  if (mitigatedAmount <= 0) {
    return 0;
  }

  if (attackStyle !== "melee") {
    return mitigatedAmount;
  }

  const naturalResistancePower = Math.max(0, Number(target?.naturalResistancePower) || 0);
  const shadowHealth = Math.max(0, Math.floor(Number(target?.shp) || 0));
  if (naturalResistancePower <= 0 || shadowHealth <= 0) {
    return mitigatedAmount;
  }

  const protectedDamage = Math.min(mitigatedAmount, shadowHealth);
  const overflowDamage = mitigatedAmount - protectedDamage;
  const resistanceMultiplier = Math.max(0, 1 - naturalResistancePower * STATUS_DAMAGE_STEP);
  return Math.max(0, Math.floor(protectedDamage * resistanceMultiplier)) + overflowDamage;
}

function getDamageMultiplier(attacker, target, attackStyle = "melee") {
  const strengthMultiplier = 1 + (
    getActiveStatusPower(attacker, "strength") + Math.max(0, Number(attacker?.naturalStrengthPower) || 0)
  ) * STATUS_DAMAGE_STEP;
  const weaknessMultiplier = 1 + getEffectiveWeaknessPower(target) * STATUS_DAMAGE_STEP;
  const resistancePower = attackStyle === "melee"
    ? getActiveStatusPower(target, "resistance")
    : 0;
  const resistanceMultiplier = Math.max(0, 1 - resistancePower * STATUS_DAMAGE_STEP);
  const decayingMultiplier = isKostyaShadowUnit(attacker)
    ? 1 + getActiveStatusPower(target, "decaying") * 0.05
    : 1;
  return strengthMultiplier * weaknessMultiplier * resistanceMultiplier * decayingMultiplier;
}

function getEffectiveWeaknessPower(unit) {
  const weaknessPower = getActiveStatusPower(unit, "weakness");
  const tolerance = getUpgradeRank(unit, "slot-machine") * SLOT_MACHINE_WEAKNESS_TOLERANCE_STEP;
  return Math.max(0, weaknessPower - tolerance);
}

function getEffectiveDefenseValue(unit, attackStyle = "melee") {
  const baseDefense = Math.max(0, Math.floor(Number(unit?.attributes?.defense) || 0));
  if (baseDefense <= 0) {
    return 0;
  }

  if (unit?.characterId === JACOB_CHARACTER_ID || attackStyle === "ranged") {
    return baseDefense;
  }
  return Math.max(0, Math.floor(baseDefense * 0.5));
}

function hasFireImmunity(unit) {
  return unit?.attributes?.fireImmunity === true;
}

function isFlyingUnit(unit) {
  return unit?.attributes?.flying === true;
}

function canActionTargetFlying(actionId = null) {
  if (isGroundMeleeActionId(actionId)) {
    return false;
  }

  return [
    "ranged-attack",
    "timed-attack",
    "revolver-shot",
    "hallow-shot",
    "magnum-shot",
    "six-shooter",
    "dual-wielding",
    "coin-toss",
    "slash",
    "mass-infection",
    "piercing-shot",
    "kick",
    "fireball",
    "slowball",
    "corner-shot",
    "volley"
  ].includes(actionId ?? "");
}

function isGroundMeleeActionId(actionId = null) {
  return [
    "attack",
    "katana",
    "lunge",
    "decay-curse",
    "crippling-stab"
  ].includes(actionId ?? "");
}

function canAffordPatrickAbility(player, { costSp = 0, costLucky = 0 }) {
  return (player.sp ?? 0) >= costSp && (player.luckyCharges ?? 0) >= costLucky;
}

function canAffordKostyaAbility(player, { costSp = 0, costShadowCharge = 0 }) {
  return (player.sp ?? 0) >= costSp && (player.shadowCharge ?? 0) >= costShadowCharge;
}

function canUsePatrickAceOfHearts(player) {
  return (player?.actionsRemaining ?? 0) === (player?.turnStartActionsRemaining ?? 0);
}

function canUseKostyaDeepFocus(player) {
  return (player?.actionsRemaining ?? 0) === (player?.turnStartActionsRemaining ?? 0);
}

function spendPatrickAbilityCost(player, { costSp = 0, costLucky = 0 }) {
  player.sp = Math.max(0, (player.sp ?? 0) - costSp);
  player.luckyCharges = Math.max(0, (player.luckyCharges ?? 0) - costLucky);
}

function spendKostyaAbilityCost(player, { costSp = 0, costShadowCharge = 0 }) {
  player.sp = Math.max(0, (player.sp ?? 0) - costSp);
  player.shadowCharge = Math.max(0, (player.shadowCharge ?? 0) - costShadowCharge);
}

function clearUnitStatuses(unit, statusKeys) {
  statusKeys.forEach((statusKey) => {
    const status = unit.statuses?.[statusKey];
    if (!status) {
      return;
    }

    status.power = 0;
    status.turns = 0;
    if ("points" in status) {
      status.points = 0;
    }
  });
}

function shouldBlockNegativeStatus(unit, statusKey, incomingPower) {
  if (statusKey === "fire" && hasFireImmunity(unit)) {
    return true;
  }

  if (!isNegativeStatusKey(statusKey)) {
    return false;
  }

  const cleansedPower = getActiveStatusPower(unit, "cleansed");
  return cleansedPower > 0 && cleansedPower >= Math.max(0, Math.floor(incomingPower));
}

function isNegativeStatusKey(statusKey) {
  return [...PATRICK_NEGATIVE_STATUS_KEYS, "decaying"].includes(statusKey);
}

function createCharacterUpgradeState(characterId) {
  const definitions = getUpgradeCatalog(characterId);
  return Object.fromEntries(definitions.map((upgrade) => [upgrade.id, 0]));
}

function getUpgradeCatalog(characterId) {
  if (characterId === JACOB_CHARACTER_ID) {
    return JACOB_UPGRADE_DEFINITIONS;
  }

  if (characterId === PATRICK_CHARACTER_ID) {
    return PATRICK_UPGRADE_DEFINITIONS;
  }

  if (characterId === KOSTYA_CHARACTER_ID) {
    return KOSTYA_UPGRADE_DEFINITIONS;
  }

  return [];
}

function getAbilityRewardOptionsForLevel(characterId, clearedLevel, player) {
  if (characterId === JACOB_CHARACTER_ID) {
    const rewardIds = clearedLevel === 10
      ? ["fireball", "slowball"]
      : clearedLevel === 20
        ? ["block", "corner-shot"]
      : clearedLevel === 30
          ? ["goal", "friendly-chatter"]
          : clearedLevel === 40
            ? ["guard", "group-buff-upgrade"]
            : clearedLevel === 49
              ? getJacobFinalAbilityRewardIds(player)
              : [];

    return JACOB_ABILITY_REWARD_DEFINITIONS.filter((definition) => (
      rewardIds.includes(definition.id) && !isJacobActionUnlocked(player, definition.id)
    ));
  }

  if (characterId === PATRICK_CHARACTER_ID) {
    const rewardIds = clearedLevel === 10
      ? ["piercing-shot", "hallow-shot"]
      : clearedLevel === 20
        ? ["magnum-shot", "ace-of-spades"]
      : clearedLevel === 30
          ? ["ace-of-diamonds", "ace-of-clubs"]
          : clearedLevel === 40
            ? ["six-shooter", "dual-wielding"]
            : clearedLevel === 49
              ? getPatrickFinalAbilityRewardIds(player)
              : [];

    return PATRICK_ABILITY_REWARD_DEFINITIONS.filter((definition) => (
      rewardIds.includes(definition.id) && !isPatrickActionUnlocked(player, definition.id)
    ));
  }

  if (characterId === KOSTYA_CHARACTER_ID) {
    const rewardIds = clearedLevel === 10
      ? ["lunge", "decay-curse"]
      : clearedLevel === 20
        ? ["action-recall", "mass-infection"]
        : clearedLevel === 30
          ? ["crippling-stab", "dark-plating"]
          : clearedLevel === 40
            ? ["ghost", "wraith"]
            : clearedLevel === 49
              ? getKostyaFinalAbilityRewardIds(player)
      : [];

    return KOSTYA_ABILITY_REWARD_DEFINITIONS.filter((definition) => (
      rewardIds.includes(definition.id) && !isKostyaActionUnlocked(player, definition.id)
    ));
  }

  return [];
}

function getPatrickFinalAbilityRewardIds(player) {
  const earlyLeftovers = [
    ["piercing-shot", "hallow-shot"],
    ["magnum-shot", "ace-of-spades"]
  ]
    .map((pair) => getRandomLockedActionFromPair(pair, (actionId) => isPatrickActionUnlocked(player, actionId)))
    .filter(Boolean);
  const lateLeftovers = [
    ["ace-of-diamonds", "ace-of-clubs"],
    ["six-shooter", "dual-wielding"]
  ]
    .map((pair) => getRandomLockedActionFromPair(pair, (actionId) => isPatrickActionUnlocked(player, actionId)))
    .filter(Boolean);

  const rewardIds = [];
  const earlyChoice = getRandomArrayItem(earlyLeftovers);
  const lateChoice = getRandomArrayItem(lateLeftovers);

  if (earlyChoice) {
    rewardIds.push(earlyChoice);
  }

  if (lateChoice) {
    rewardIds.push(lateChoice);
  }

  if (!isPatrickActionUnlocked(player, "coin-toss")) {
    rewardIds.push("coin-toss");
  }

  return rewardIds;
}

function getJacobFinalAbilityRewardIds(player) {
  const earlyLeftovers = [
    ["fireball", "slowball"],
    ["block", "corner-shot"]
  ]
    .map((pair) => getRandomLockedActionFromPair(pair, (actionId) => isJacobActionUnlocked(player, actionId)))
    .filter(Boolean);
  const lateLeftovers = [
    ["goal", "friendly-chatter"],
    ["guard", "group-buff-upgrade"]
  ]
    .map((pair) => getRandomLockedActionFromPair(pair, (actionId) => isJacobActionUnlocked(player, actionId)))
    .filter(Boolean);

  const rewardIds = [];
  const earlyChoice = getRandomArrayItem(earlyLeftovers);
  const lateChoice = getRandomArrayItem(lateLeftovers);

  if (earlyChoice) {
    rewardIds.push(earlyChoice);
  }

  if (lateChoice) {
    rewardIds.push(lateChoice);
  }

  if (!isJacobActionUnlocked(player, "volley")) {
    rewardIds.push("volley");
  }

  return rewardIds;
}

function getKostyaFinalAbilityRewardIds(player) {
  const earlyLeftovers = [
    ["lunge", "decay-curse"],
    ["action-recall", "mass-infection"]
  ]
    .map((pair) => getRandomLockedActionFromPair(pair, (actionId) => isKostyaActionUnlocked(player, actionId)))
    .filter(Boolean);
  const lateLeftovers = [
    ["crippling-stab", "dark-plating"],
    ["ghost", "wraith"]
  ]
    .map((pair) => getRandomLockedActionFromPair(pair, (actionId) => isKostyaActionUnlocked(player, actionId)))
    .filter(Boolean);

  const rewardIds = [];
  const earlyChoice = getRandomArrayItem(earlyLeftovers);
  const lateChoice = getRandomArrayItem(lateLeftovers);

  if (earlyChoice) {
    rewardIds.push(earlyChoice);
  }

  if (lateChoice) {
    rewardIds.push(lateChoice);
  }

  if (!isKostyaActionUnlocked(player, "deep-focus")) {
    rewardIds.push("deep-focus");
  }

  return rewardIds;
}

function getRandomLockedActionFromPair(pair, isUnlocked) {
  const lockedActions = pair.filter((actionId) => !isUnlocked(actionId));
  return getRandomArrayItem(lockedActions);
}

function getRandomArrayItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)] ?? null;
}

export function getUpgradeRank(unit, upgradeId) {
  return unit?.upgrades?.[upgradeId] ?? 0;
}

function gainKostyaShadowCharge(player, damageDealt) {
  if ((player?.maxShadowCharge ?? 0) <= 0 || damageDealt <= 0) {
    return;
  }

  const gain = damageDealt * getKostyaShadowChargeGainRatio(player);
  player.shadowCharge = Math.min(player.maxShadowCharge, (player.shadowCharge ?? 0) + gain);
}

function setKostyaShadowRepeatableAttribute(state, active) {
  if (!state?.player?.shadow?.attributes) {
    return;
  }

  state.player.shadow.attributes.repeatable = active === true;
}

function getKostyaShadowAttackDamageMultiplier(shadow) {
  const multiplier = Number(shadow?.damageMultiplier);
  return multiplier > 0 ? multiplier : 1;
}

function isKostyaKatanaRelatedAction(actionId) {
  return ["katana", "slash", "lunge", "decay-curse", "mass-infection", "crippling-stab"].includes(actionId);
}

async function maybeTriggerKostyaActionRecall(state, render, outcome) {
  if (!state.player.actionRecallReady) {
    return outcome;
  }

  const actionRecall = typeof outcome === "object" && outcome !== null
    ? outcome.actionRecall ?? null
    : null;
  if (!actionRecall || !isKostyaKatanaRelatedAction(actionRecall.actionId)) {
    return outcome;
  }

  state.player.actionRecallReady = false;
  state.player.pendingActionRecall = actionRecall;
  return outcome;
}

function mergeActionOutcomes(primaryOutcome, secondaryOutcome) {
  const primary = typeof primaryOutcome === "object" && primaryOutcome !== null
    ? primaryOutcome
    : { enemyDefeated: primaryOutcome === "enemy-defeated" };
  const secondary = typeof secondaryOutcome === "object" && secondaryOutcome !== null
    ? secondaryOutcome
    : { enemyDefeated: secondaryOutcome === "enemy-defeated" };

  return {
    ...primary,
    enemyDefeated: Boolean(primary.enemyDefeated || secondary.enemyDefeated)
  };
}

async function performKostyaActionRecallFollowUp(state, render, actionRecall) {
  const shadow = state.player.shadow;
  if (!shadow || shadow.hp <= 0) {
    return "continue";
  }

  if (actionRecall.actionId === "katana" || actionRecall.actionId === "slash") {
    return performKostyaShadowRepeatedSingleStrike(state, render, actionRecall);
  }

  if (actionRecall.actionId === "lunge") {
    return performKostyaShadowRepeatedLunge(state, render, actionRecall);
  }

  if (actionRecall.actionId === "decay-curse") {
    return performKostyaShadowRepeatedDecayCurse(state, render, actionRecall);
  }

  if (actionRecall.actionId === "crippling-stab") {
    return performKostyaShadowRepeatedCripplingStab(state, render, actionRecall);
  }

  if (actionRecall.actionId === "mass-infection") {
    return performKostyaMassInfection(state, render, shadow, {
      doubledBaseDamage: true,
      greenTier: actionRecall.greenTier
    });
  }

  return "continue";
}

async function performKostyaShadowRepeatedSingleStrike(state, render, actionRecall) {
  const target = getEnemyById(state, actionRecall.targetId);
  const shadow = state.player.shadow;
  if (!target || !shadow || shadow.hp <= 0) {
    return "continue";
  }

  await animateMeleeApproach(state, shadow, target, render);
  await playKostyaKatanaIntroAnimation(state, render, shadow);
  setKostyaKatanaReadyPose(shadow, render);
  playSfx("swordSlash");
  await playKostyaKatanaOutroAnimation(state, render, shadow);
  const damage = getActionDamage({
    attacker: shadow,
    target,
    baseDamage: (actionRecall.actionId === "slash" ? getKostyaDashBaseDamage(state.player) : getKostyaSwordBaseDamage(state.player)) * 2,
    damageMultiplier: (actionRecall.greenTier === "green" ? 1.5 : 1) * getKostyaShadowAttackDamageMultiplier(shadow),
    attackStyle: "melee"
  });
  dealDamage(target, damage);
  gainKostyaShadowCharge(state.player, damage);
  state.message = t("kostya_action_recall_single", {
    action: t(actionRecall.actionId === "katana" ? "action_slash" : "action_dash").replace(/\n/g, " "),
    damage
  });

  const enemyDefeated = target.hp === 0;
  await animateUnitReturn(shadow, render);
  render();
  return { enemyDefeated };
}

async function performKostyaShadowRepeatedLunge(state, render, actionRecall) {
  const shadow = state.player.shadow;
  const primaryTarget = getFrontLivingEnemy(state, { canTargetFlying: false });
  if (!shadow || shadow.hp <= 0 || !primaryTarget) {
    return "continue";
  }

  const secondaryTarget = getEnemyBehindTarget(state, primaryTarget, { canTargetFlying: false });
  await animateMeleeApproach(state, shadow, primaryTarget, render);
  await playKostyaKatanaIntroAnimation(state, render, shadow);
  setKostyaKatanaReadyPose(shadow, render);
  playSfx("swordSlash");
  await playKostyaKatanaOutroAnimation(state, render, shadow);
  const doubledBaseDamage = getKostyaSwordBaseDamage(state.player) * 2;
  const damageMultiplier = actionRecall.greenTier === "green" ? 1.5 : 1;
  const primaryDamage = getActionDamage({
    attacker: shadow,
    target: primaryTarget,
    baseDamage: doubledBaseDamage,
    damageMultiplier: damageMultiplier * getKostyaShadowAttackDamageMultiplier(shadow),
    attackStyle: "melee"
  });
  dealDamage(primaryTarget, primaryDamage);
  gainKostyaShadowCharge(state.player, primaryDamage);
  let secondaryDamage = 0;
  if (secondaryTarget) {
    secondaryDamage = getActionDamage({
      attacker: shadow,
      target: secondaryTarget,
      baseDamage: Math.max(1, Math.floor(doubledBaseDamage * damageMultiplier / 2)),
      damageMultiplier: getKostyaShadowAttackDamageMultiplier(shadow),
      attackStyle: "melee"
    });
    dealDamage(secondaryTarget, secondaryDamage);
    gainKostyaShadowCharge(state.player, secondaryDamage);
    applyStatusToUnit(secondaryTarget, "stunned", KOSTYA_LUNGE_STUN_POWER, KOSTYA_LUNGE_STUN_TURNS);
  }

  state.message = t("kostya_action_recall_lunge", {
    primaryDamage,
    secondaryDamage
  });
  const enemyDefeated = primaryTarget.hp === 0 || (secondaryTarget?.hp ?? 1) === 0;
  await animateUnitReturn(shadow, render);
  render();
  return { enemyDefeated };
}

async function performKostyaShadowRepeatedDecayCurse(state, render, actionRecall) {
  const shadow = state.player.shadow;
  const target = getFrontLivingEnemy(state, { canTargetFlying: false });
  if (!shadow || shadow.hp <= 0 || !target) {
    return "continue";
  }

  await animateMeleeApproach(state, shadow, target, render);
  await playKostyaKatanaIntroAnimation(state, render, shadow);
  setKostyaKatanaReadyPose(shadow, render);
  playSfx("swordSlash");
  await playKostyaKatanaOutroAnimation(state, render, shadow);
  const damage = getActionDamage({
    attacker: shadow,
    target,
    baseDamage: getKostyaSwordBaseDamage(state.player) * 2,
    damageMultiplier: (actionRecall.greenTier === "green" ? 1.5 : 1) * getKostyaShadowAttackDamageMultiplier(shadow),
    attackStyle: "melee"
  });
  dealDamage(target, damage);
  gainKostyaShadowCharge(state.player, damage);
  applyStatusToUnit(target, "decaying", KOSTYA_DECAY_CURSE_POWER, KOSTYA_DECAY_CURSE_TURNS);
  state.message = t("kostya_action_recall_decay_curse", {
    damage,
    power: formatRomanNumeral(KOSTYA_DECAY_CURSE_POWER),
    turns: KOSTYA_DECAY_CURSE_TURNS
  });
  const enemyDefeated = target.hp === 0;
  await animateUnitReturn(shadow, render);
  render();
  return { enemyDefeated };
}

async function performKostyaShadowRepeatedCripplingStab(state, render, actionRecall) {
  return performKostyaCripplingStab(state, render, state.player.shadow, {
    doubledBaseDamage: true,
    greenTier: actionRecall.greenTier,
    targetId: actionRecall.targetId
  });
}

function gainKostyaSp(player, amount) {
  const gain = Math.max(0, Math.floor(amount));
  if (gain <= 0 || (player?.maxSp ?? 0) <= 0) {
    return;
  }

  player.sp = Math.min(player.maxSp, (player.sp ?? 0) + gain);
}

export function canSelectUpgrade(state, upgradeId) {
  if (!state?.pendingUpgradeSelection) {
    return false;
  }

  if (state.rewardSelectionType !== "ability" && state.upgradePoints <= 0) {
    return false;
  }

  const definition = (state.rewardSelectionCatalog ?? state.upgradeCatalog ?? []).find((upgrade) => upgrade.id === upgradeId);
  if (!definition) {
    return false;
  }

  if (state.rewardSelectionType === "ability") {
    if (state.player.characterId === JACOB_CHARACTER_ID) {
      return !isJacobActionUnlocked(state.player, upgradeId);
    }

    return state.player.characterId === KOSTYA_CHARACTER_ID
      ? !isKostyaActionUnlocked(state.player, upgradeId)
      : !isPatrickActionUnlocked(state.player, upgradeId);
  }

  const currentRank = getUpgradeRank(state.player, upgradeId);
  return definition.maxRank === null || currentRank < definition.maxRank;
}

export function handleUpgradeSelection(state, upgradeId, render, rebuildLevelScene) {
  if (!canSelectUpgrade(state, upgradeId)) {
    return;
  }

  if (state.rewardSelectionType === "ability") {
    if (state.player.characterId === JACOB_CHARACTER_ID) {
      unlockJacobAction(state.player, upgradeId);
    } else if (state.player.characterId === KOSTYA_CHARACTER_ID) {
      unlockKostyaAction(state.player, upgradeId);
      refreshKostyaShadowVariantAfterUnlock(state, upgradeId);
    } else {
      unlockPatrickAction(state.player, upgradeId);
    }
  } else {
    applyUpgradeToPlayer(state.player, upgradeId);
    state.upgradePoints = Math.max(0, state.upgradePoints - 1);
  }
  state.pendingUpgradeSelection = false;
  state.rewardSelectionType = null;
  state.rewardSelectionCatalog = null;
  state.pendingAbilityConfirmId = null;
  advanceToNextLevel(state, render, rebuildLevelScene);
}

function refreshKostyaShadowVariantAfterUnlock(state, actionId) {
  if (state?.player?.characterId !== KOSTYA_CHARACTER_ID) {
    return;
  }

  if (!["ghost", "wraith"].includes(actionId)) {
    return;
  }

  if ((state.player.shadow?.hp ?? 0) <= 0) {
    return;
  }

  const previousShadow = state.player.shadow;
  const nextShadow = createKostyaShadowState(createEmptyStatuses, state.player);
  nextShadow.hp = Math.min(
    nextShadow.maxHp,
    Math.max(0, Math.round(((previousShadow.hp ?? 0) / Math.max(1, previousShadow.maxHp ?? 1)) * nextShadow.maxHp))
  );
  nextShadow.shp = Math.min(
    nextShadow.maxShp,
    Math.max(0, Math.round(((previousShadow.shp ?? 0) / Math.max(1, previousShadow.maxShp ?? 1)) * nextShadow.maxShp))
  );
  nextShadow.actionsRemaining = previousShadow.actionsRemaining ?? 0;
  nextShadow.actionProgress = previousShadow.actionProgress ?? 0;
  nextShadow.statuses = previousShadow.statuses ?? nextShadow.statuses;
  nextShadow.animationOverride = previousShadow.animationOverride ?? null;
  nextShadow.renderOffsetX = previousShadow.renderOffsetX ?? 0;
  nextShadow.renderOffsetY = previousShadow.renderOffsetY ?? 0;
  state.player.shadow = nextShadow;
}

function applyUpgradeToPlayer(player, upgradeId) {
  player.upgrades[upgradeId] = (player.upgrades[upgradeId] ?? 0) + 1;

  if (player.characterId === JACOB_CHARACTER_ID) {
    syncJacobDerivedStats(player, player.currentGlobalTurn ?? 0);
    return;
  }

  if (upgradeId === "slot-machine") {
    player.maxHp += SLOT_MACHINE_MAX_HP_GAIN;
    player.hp = Math.min(player.maxHp, player.hp + SLOT_MACHINE_MAX_HP_GAIN);
    return;
  }

  if (upgradeId === "corrupted-heart") {
    const previousMaxHp = Number(player.maxHp) || 0;
    player.maxHp = Math.min(KOSTYA_MAX_HP_CAP, previousMaxHp + 5);
    player.hp = Math.min(player.maxHp, player.hp + Math.max(0, player.maxHp - previousMaxHp));
    syncKostyaShadowDerivedStats(player, { refillOnIncrease: true });
  }
}

function syncKostyaShadowDerivedStats(player, { refillOnIncrease = false } = {}) {
  if (!player?.shadow) {
    return;
  }

  const previousMaxHp = Number(player.shadow.maxHp) || 0;
  const previousMaxShp = Number(player.shadow.maxShp) || 0;
  const hpMultiplier = Number(player.shadow.hpMultiplier) > 0 ? Number(player.shadow.hpMultiplier) : 1;
  const shpMultiplier = Number(player.shadow.shpMultiplier) >= 0 ? Number(player.shadow.shpMultiplier) : 1;
  const nextMaxHp = Math.max(1, Math.floor(getKostyaShadowBaseHp(player) * hpMultiplier));
  const nextMaxShp = Math.max(0, Math.floor(getKostyaShadowBonusHealth(player) * shpMultiplier));
  player.shadow.maxHp = nextMaxHp;
  player.shadow.maxShp = nextMaxShp;
  player.shadow.milestoneRank = Math.max(0, Math.min(4, Math.floor(Number(player?.milestoneRank) || 0)));

  if (refillOnIncrease) {
    player.shadow.hp = Math.min(nextMaxHp, Math.max(0, (player.shadow.hp ?? 0) + Math.max(0, nextMaxHp - previousMaxHp)));
    player.shadow.shp = Math.min(nextMaxShp, Math.max(0, (player.shadow.shp ?? 0) + Math.max(0, nextMaxShp - previousMaxShp)));
    return;
  }

  player.shadow.hp = Math.min(nextMaxHp, Math.max(0, player.shadow.hp ?? 0));
  player.shadow.shp = Math.min(nextMaxShp, Math.max(0, player.shadow.shp ?? 0));
}

function advanceToNextLevel(state, render, rebuildLevelScene) {
  state.player.levelsCleared = Math.max(0, Math.floor(Number(state.player.levelsCleared) || 0)) + 1;
  state.level += 1;
  state.levelSeed = createLevelSeed(state.level);
  state.musicTrackKey = getMusicTrackKeyForLevel(state.level);
  state.globalTurn = 1;
  state.turnOwner = "player";
  state.phase = PHASE.PLAYER_TURN;
  state.player.actionProgress = 0;
  state.player.actionsRemaining = state.player.baseActionsPerTurn;
  state.player.turnStartActionsRemaining = state.player.baseActionsPerTurn;
  state.player.currentGlobalTurn = state.globalTurn;
  if (state.player.characterId === JACOB_CHARACTER_ID) {
    state.player.defendActiveUntilTurn = 0;
    state.player.guardDefenseUntilTurn = 0;
    state.player.blockParryReady = false;
    state.player.animationOverride = null;
    syncJacobDerivedStats(state.player, state.globalTurn);
  }
  if (state.player.characterId === KOSTYA_CHARACTER_ID) {
    state.player.actionRecallReady = false;
    state.player.pendingActionRecall = null;
    setKostyaShadowRepeatableAttribute(state, false);
    state.player.shadowFieldPromotionPower = Math.max(0, (state.player.shadowFieldPromotionPower ?? 0) - 1);
    if (state.player.shadow) {
      state.player.shadow.naturalStrengthPower = state.player.shadowFieldPromotionPower;
      state.player.shadow.unitEffect = null;
    }
  }
  state.enemies = createEnemiesForLevel(state.level, createEmptyStatuses);
  state.message = t("battle_level_begins", { level: state.level });
  setActionMenu(state, "root");
  rebuildLevelScene();
  render();
}

function dealDamage(target, amount) {
  if (amount <= 0 || target.hp <= 0) {
    return 0;
  }

  cancelRegenOnDamage(target);
  let remaining = amount;
  const absorption = target.statuses?.absorption;
  if (
    absorption
    && absorption.power > 0
    && absorption.turns > 0
    && (absorption.points ?? 0) > 0
  ) {
    const absorbed = Math.min(absorption.points, remaining);
    absorption.points -= absorbed;
    remaining -= absorbed;
    if (absorption.points <= 0) {
      clearAbsorptionStatus(target);
    }
  }
  if ((target.shp ?? 0) > 0) {
    const absorbed = Math.min(target.shp, remaining);
    target.shp -= absorbed;
    remaining -= absorbed;
  }
  target.hp = Math.max(0, target.hp - remaining);
  if (
    target.characterId === JACOB_CHARACTER_ID
    || target.characterId === PATRICK_CHARACTER_ID
    || target.characterId === KOSTYA_CHARACTER_ID
    || target.id === "shadow"
  ) {
    if (target.hp <= 0) {
      target.animationOverride = null;
    } else {
      target.animationOverride = {
        type: "damaged",
        endsAt: performance.now() + PATRICK_DAMAGED_ANIMATION_DURATION_MS
      };
    }
  }

  if (target?.id === "goal" && target.hp <= 0) {
    target.goalBreakPending = true;
  }
  return amount;
}

function cancelRegenOnDamage(target) {
  const hpRegen = target.statuses?.hpRegen;
  if (!hpRegen) {
    return;
  }

  hpRegen.power = 0;
  hpRegen.turns = 0;
}

function getActiveStatusPower(unit, statusKey) {
  const status = unit.statuses?.[statusKey];
  if (!status || status.power <= 0 || status.turns <= 0) {
    return 0;
  }

  if (statusKey === "absorption" && (status.points ?? 0) <= 0) {
    return 0;
  }

  return status.power;
}

function isKostyaShadowUnit(unit) {
  return unit?.id === "shadow";
}

function getAbsorptionPointsForPower(unit, power) {
  return Math.max(0, Math.ceil((Math.max(0, unit?.maxHp ?? 0) * 0.1) * Math.max(0, power)));
}

function drainAbsorptionPoints(unit, amount) {
  const absorption = unit?.statuses?.absorption;
  if (!absorption || absorption.power <= 0 || absorption.turns <= 0 || (absorption.points ?? 0) <= 0) {
    return;
  }

  absorption.points = Math.max(0, absorption.points - Math.max(0, Math.floor(amount)));
  if (absorption.points <= 0) {
    clearAbsorptionStatus(unit);
  }
}

function clearAbsorptionStatus(unit) {
  const absorption = unit?.statuses?.absorption;
  if (!absorption) {
    return;
  }

  absorption.power = 0;
  absorption.turns = 0;
  absorption.points = 0;
}

function getRangedJitterIntervalMs() {
  return RANGED_JITTER_CHANGE_MIN_MS + Math.random() * (RANGED_JITTER_CHANGE_MAX_MS - RANGED_JITTER_CHANGE_MIN_MS);
}

function nudgeRangedActionCheck(actionCheck) {
  if (!actionCheck?.active || (actionCheck.type !== "ranged" && actionCheck.type !== "revolver")) {
    return;
  }

  const windowCenter = (actionCheck.greenStart + actionCheck.greenEnd) / 2;
  const distanceToCenter = windowCenter - actionCheck.value;
  const directionToCenter = Math.sign(distanceToCenter);

  if (directionToCenter === 0) {
    return;
  }

  const distanceScale = Math.min(1.75, Math.max(0.6, Math.abs(distanceToCenter) / 12));
  actionCheck.value += directionToCenter * RANGED_NUDGE_STRENGTH * distanceScale;
  actionCheck.value = Math.max(0, Math.min(DODGE_MAX_VALUE, actionCheck.value));
}

function getNextRangedDriftVelocity(currentVelocity) {
  const currentDirection = Math.sign(currentVelocity) || (Math.random() < 0.5 ? -1 : 1);
  const nextDirection = Math.random() < 0.35
    ? currentDirection
    : (Math.random() < 0.5 ? -1 : 1);
  const speedScale = 0.55 + Math.random() * 0.45;

  return nextDirection * RANGED_DRIFT_SPEED_PER_MS * speedScale;
}

function dampTowardsZero(value, amount) {
  if (value > 0) {
    return Math.max(0, value - amount);
  }

  if (value < 0) {
    return Math.min(0, value + amount);
  }

  return 0;
}

function getEnemyAttackMessage(damageTaken, dodgeResult, counterDamage = 0) {
  if (dodgeResult === "counter") {
    return t("battle_counter_dodge", { damage: counterDamage });
  }

  if (dodgeResult === "perfect") {
    return t("battle_perfect_dodge");
  }

  if (dodgeResult === "partial") {
    return t("battle_partial_dodge", { damage: damageTaken });
  }

  return t("battle_full_hit", { damage: damageTaken });
}

function getPatrickMagnumShotTurnBonus(tier) {
  if (tier === "green") {
    return 2;
  }

  if (tier === "yellow") {
    return 1;
  }

  return 0;
}

function getPatrickSixShooterBulletBonus(tier) {
  if (tier === "green") {
    return 3;
  }

  if (tier === "yellow") {
    return 1;
  }

  return 0;
}

function getPatrickRevolverDamageMultiplier(tier) {
  if (tier === "green") {
    return 1.5;
  }

  if (tier === "yellow") {
    return 1.25;
  }

  return 1;
}

function getPatrickCoinTossDamageMultiplier(tier) {
  if (tier === "green") {
    return PATRICK_COIN_TOSS_DAMAGE_MULTIPLIER_GREEN;
  }

  if (tier === "yellow") {
    return PATRICK_COIN_TOSS_DAMAGE_MULTIPLIER_YELLOW;
  }

  return PATRICK_COIN_TOSS_DAMAGE_MULTIPLIER_MISS;
}

function getTimedActionTier(actionCheck) {
  const pulseStrength = Number(actionCheck?.timedPulseStrength ?? 0);
  if (pulseStrength >= 0.82) {
    return "green";
  }

  if (pulseStrength > 0) {
    return "yellow";
  }

  return "miss";
}

function getCoinTossAirCheckState(coinEffect, atTime = performance.now()) {
  if (!coinEffect) {
    return { value: 0, tier: "miss" };
  }

  const coinPosition = getCoinTossCoinPosition(coinEffect, atTime);
  const checkpointX = Number(coinEffect.checkpointX ?? coinPosition.x);
  const offsetTiles = (Number(coinPosition.x ?? checkpointX) - checkpointX) / TILE_SIZE;
  const value = Math.max(
    0,
    Math.min(
      100,
      ((offsetTiles + PATRICK_COIN_TOSS_YELLOW_WINDOW_RADIUS_TILES)
        / (PATRICK_COIN_TOSS_YELLOW_WINDOW_RADIUS_TILES * 2))
        * 100
    )
  );

  if (Math.abs(offsetTiles) <= PATRICK_COIN_TOSS_GREEN_WINDOW_RADIUS_TILES) {
    return { value, tier: "green" };
  }

  if (Math.abs(offsetTiles) <= PATRICK_COIN_TOSS_YELLOW_WINDOW_RADIUS_TILES) {
    return { value, tier: "yellow" };
  }

  return {
    value: offsetTiles < 0 ? 0 : 100,
    tier: "miss"
  };
}

function getCoinTossAirTransition(tier) {
  if (tier === "green") {
    return 1;
  }

  if (tier === "yellow") {
    return 0;
  }

  return -1;
}

function getBattleSpeedFactor(state) {
  return state?.debugSlowMo ? DEBUG_SLOW_MO_FACTOR : 1;
}

function getScaledDuration(state, durationMs) {
  return Math.max(1, Math.round(durationMs / Math.max(0.01, getBattleSpeedFactor(state))));
}

function playSfx(key, options = {}) {
  const path = SFX_PATHS[key];
  if (!path) {
    return;
  }

  const audio = getAvailableSfxAudio(key);
  const reservation = reserveSfxAudio(audio);

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = getSfxVolume();
    audio.playbackRate = Number(options.playbackRate) > 0 ? Number(options.playbackRate) : 1;
    const stopAfterMs = Number(options.stopAfterMs);
    if (stopAfterMs > 0) {
      window.setTimeout(() => {
        if (!isCurrentSfxReservation(audio, reservation)) {
          return;
        }
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // Ignore audio stop failures.
        }
        releaseSfxAudio(audio, reservation);
      }, stopAfterMs);
    }
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      void playPromise.catch(() => {
        releaseSfxAudio(audio, reservation);
      });
    }
  } catch {
    releaseSfxAudio(audio, reservation);
    // Ignore audio playback failures.
  }
}

export function preloadBattleAudioAssets() {
  return Promise.all(Object.keys(SFX_PATHS).map((key) => preloadSfx(key)));
}

export function primeBattleAudioPlayback() {
  Object.keys(SFX_PATHS).forEach((key) => {
    const pool = getSfxAudioPool(key);
    pool.forEach((audio) => {
      try {
        audio.volume = 0;
        audio.muted = true;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          void playPromise.then(() => {
            try {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
              audio.volume = getSfxVolume();
            } catch {
              // Ignore warm-up cleanup failures.
            }
          }).catch(() => {
            try {
              audio.muted = false;
              audio.volume = getSfxVolume();
            } catch {
              // Ignore reset failures after blocked warm-up.
            }
          });
        } else {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          audio.volume = getSfxVolume();
        }
      } catch {
        try {
          audio.muted = false;
          audio.volume = getSfxVolume();
        } catch {
          // Ignore warm-up failures.
        }
      }
    });
  });
}

function preloadSfx(key) {
  const existingPromise = sfxAudioPreloadPromises.get(key);
  if (existingPromise) {
    return existingPromise;
  }

  const pool = getSfxAudioPool(key);
  const preloadPromise = Promise.all(pool.map((audio) => waitForAudioReady(audio)));
  sfxAudioPreloadPromises.set(key, preloadPromise);
  return preloadPromise;
}

function getAvailableSfxAudio(key) {
  const pool = getSfxAudioPool(key);
  const availableAudio = pool.find((audio) => isSfxAudioAvailable(audio));
  if (availableAudio) {
    return availableAudio;
  }

  const audio = createSfxAudio(SFX_PATHS[key]);
  pool.push(audio);
  void waitForAudioReady(audio);
  return audio;
}

function getSfxAudioPool(key) {
  let pool = sfxAudioPools.get(key);
  if (!pool) {
    pool = Array.from({ length: SFX_POOL_SIZE }, () => createSfxAudio(SFX_PATHS[key]));
    sfxAudioPools.set(key, pool);
  }
  return pool;
}

function createSfxAudio(path) {
  const audio = new Audio(path);
  audio.preload = "auto";
  audio.addEventListener("ended", () => {
    clearSfxAudioReservation(audio);
  });
  try {
    audio.load();
  } catch {
    // Ignore preload failures and let playback attempt later.
  }
  return audio;
}

function isSfxAudioAvailable(audio) {
  const reservationState = sfxAudioReservationState.get(audio);
  return !reservationState?.reserved && (audio.paused || audio.ended);
}

function reserveSfxAudio(audio) {
  const nextToken = (sfxAudioReservationState.get(audio)?.token ?? 0) + 1;
  sfxAudioReservationState.set(audio, {
    reserved: true,
    token: nextToken
  });
  return nextToken;
}

function releaseSfxAudio(audio, token) {
  if (!isCurrentSfxReservation(audio, token)) {
    return;
  }

  clearSfxAudioReservation(audio);
}

function clearSfxAudioReservation(audio) {
  const previousToken = sfxAudioReservationState.get(audio)?.token ?? 0;
  sfxAudioReservationState.set(audio, {
    reserved: false,
    token: previousToken
  });
}

function isCurrentSfxReservation(audio, token) {
  const reservationState = sfxAudioReservationState.get(audio);
  return reservationState?.reserved === true && reservationState.token === token;
}

function waitForAudioReady(audio) {
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;
    let timeoutId = null;
    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      audio.removeEventListener("canplaythrough", finish);
      audio.removeEventListener("canplay", finish);
      audio.removeEventListener("error", finish);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      resolve();
    };

    audio.addEventListener("canplaythrough", finish, { once: true });
    audio.addEventListener("canplay", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    timeoutId = window.setTimeout(finish, AUDIO_PRELOAD_TIMEOUT_MS);

    try {
      audio.load();
    } catch {
      finish();
    }
  });
}

function getSfxVolume() {
  try {
    const stored = window.localStorage.getItem(SFX_VOLUME_STORAGE_KEY);
    if (stored === null) {
      return DEFAULT_SFX_VOLUME;
    }

    const parsed = Number(stored);
    if (Number.isNaN(parsed)) {
      return DEFAULT_SFX_VOLUME;
    }

    return Math.min(1, Math.max(0.1, parsed));
  } catch {
    return DEFAULT_SFX_VOLUME;
  }
}

function showSkillFeedback(state, type) {
  state.skillFeedback = {
    type,
    anchorOffsetX: type === "counter" ? 48 : 72,
    startedAt: performance.now(),
    endsAt: performance.now() + 900
  };
}

function isKostyaCounterDodgeCheck(player, dodgeCheck) {
  return player.characterId === KOSTYA_CHARACTER_ID
    && dodgeCheck.allowCounter === true
    && (
      (typeof dodgeCheck.counterStart === "number" && typeof dodgeCheck.counterEnd === "number")
      || (dodgeCheck.type === "timed" && dodgeCheck.counterOnly === true)
    );
}

function getEnemyAttackProfile(enemy) {
  if (enemy.isBoss) {
    const usesRanged = Math.random() < 0.5;
    return {
      attackStyle: usesRanged ? "ranged" : "melee",
      attackCheckType: usesRanged ? "timed" : "standard",
      baseDamage: enemy.baseDamage ?? ENEMY_ATTACK_DAMAGE
    };
  }

  return {
    attackStyle: enemy.attackCheckType === "timed" ? "ranged" : "melee",
    attackCheckType: enemy.attackCheckType ?? "standard",
    baseDamage: enemy.baseDamage ?? ENEMY_ATTACK_DAMAGE
  };
}

function tryBossSummon(state, boss, render) {
  if (!boss.isBoss || Math.random() >= BOSS_SUMMON_CHANCE) {
    return false;
  }

  const hasLivingSummon = state.enemies.some((enemy) => enemy.hp > 0 && enemy.isSummon);
  if (hasLivingSummon) {
    return false;
  }

  const reusableIndex = state.enemies.findIndex((enemy) => enemy.isSummon && enemy.hp <= 0);
  const summonIndex = reusableIndex >= 0 ? reusableIndex : state.enemies.length;
  const summon = createEnemySummon(state.level, summonIndex, createEmptyStatuses, { isSummon: true, forceType: "regular" });
  if (reusableIndex >= 0) {
    state.enemies[reusableIndex] = summon;
  } else {
    state.enemies.push(summon);
  }
  state.message = t("battle_boss_summon");
  render();
  return true;
}

async function animateMeleeApproach(state, attacker, target, render) {
  const signedDistance = getMeleeApproachDistance(state, attacker, target);
  if (Math.abs(signedDistance) <= 1) {
    return;
  }

  const shouldAnimateKostyaWalk = attacker?.id === "shadow" || (attacker === state.player && state.player.characterId === KOSTYA_CHARACTER_ID);
  if (shouldAnimateKostyaWalk) {
    attacker.animationOverride = {
      type: "walk",
      startedAt: performance.now()
    };
  }

  await animateUnitOffset(attacker, {
    fromX: attacker.renderOffsetX ?? 0,
    toX: signedDistance,
    render
  });

  if (shouldAnimateKostyaWalk && attacker.animationOverride?.type === "walk") {
    attacker.animationOverride = null;
    render();
  }

  await wait(MELEE_CONTACT_HOLD_MS);
}

async function animateUnitReturn(unit, render) {
  if (Math.abs(unit.renderOffsetX ?? 0) <= 1 && Math.abs(unit.renderOffsetY ?? 0) <= 1) {
    return;
  }

  const shouldAnimateKostyaWalk = unit?.id === "shadow" || (unit?.id === "player" && unit.characterId === KOSTYA_CHARACTER_ID);
  if (shouldAnimateKostyaWalk) {
    unit.animationOverride = {
      type: "walk",
      startedAt: performance.now()
    };
  }

  await animateUnitOffset(unit, {
    fromX: unit.renderOffsetX ?? 0,
    toX: 0,
    render
  });

  if (shouldAnimateKostyaWalk && unit.animationOverride?.type === "walk") {
    unit.animationOverride = null;
    render();
  }
}

function getMeleeApproachDistance(state, attacker, target) {
  const attackerCenter = getUnitCenterX(state, attacker);
  const targetCenter = getUnitCenterX(state, target);
  const currentGap = targetCenter - attackerCenter;
  const direction = Math.sign(currentGap) || 1;
  const desiredGap = direction * MELEE_DESIRED_CENTER_GAP_PX;
  return currentGap - desiredGap;
}

function getFrontlineDefender(state) {
  const shadow = state?.player?.shadow;
  if (
    state?.player?.characterId === KOSTYA_CHARACTER_ID
    && shadow
    && (shadow.hp ?? 0) > 0
  ) {
    return Math.random() < getKostyaShadowTargetWeight(shadow) ? shadow : state.player;
  }

  if (
    state?.player?.characterId === JACOB_CHARACTER_ID
    && shadow
    && shadow.id === "goal"
    && (shadow.hp ?? 0) > 0
  ) {
    return Math.random() < JACOB_GOAL_TARGET_WEIGHT ? shadow : state.player;
  }

  return state.player;
}

function getKostyaShadowTargetWeight(shadow) {
  const targetWeight = Number(shadow?.targetWeight);
  if (targetWeight >= 0 && targetWeight <= 1) {
    return targetWeight;
  }

  return KOSTYA_SHADOW_TARGET_WEIGHT;
}

function getUnitCenterX(state, unit) {
  if (unit === state.player) {
    const position = getPlayerPosition();
    return position.x * 32 + 32 + (unit.renderOffsetX ?? 0);
  }

  if (unit === state.player.shadow) {
    const position = getPlayerCompanionPosition(0);
    return position.x * 32 + 32 + (unit.renderOffsetX ?? 0);
  }

  const renderIndex = Math.max(0, state.enemies.findIndex((enemy) => enemy === unit));
  const position = getEnemyPosition(renderIndex);
  return position.x * 32 + 32 + (unit.renderOffsetX ?? 0);
}

function animateUnitOffset(unit, { fromX, toX, render }) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const distance = Math.abs(toX - fromX);
    const durationMs = Math.max(
      MELEE_MIN_TRAVEL_DURATION_MS,
      distance / Math.max(0.001, MELEE_MOVE_SPEED_PX_PER_MS)
    );

    const baseRenderOffsetY = Number(unit?.baseRenderOffsetY);
    const restingOffsetY = Number.isFinite(baseRenderOffsetY) ? baseRenderOffsetY : 0;
    function step(now) {
      const progress = Math.min(1, (now - startedAt) / Math.max(1, durationMs));
      unit.renderOffsetX = Math.round(fromX + (toX - fromX) * progress);
      unit.renderOffsetY = restingOffsetY;
      render();

      if (progress >= 1) {
        resolve();
        return;
      }

      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  });
}

function wait(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

async function playPatrickDodgeAnimation(state, render) {
  const durationMs = getScaledDuration(state, PATRICK_DODGE_ANIMATION_DURATION_MS);
  state.player.animationOverride = {
    type: "dodge",
    endsAt: performance.now() + durationMs
  };
  render();
  await wait(durationMs);
  if (state.player.animationOverride?.type === "dodge") {
    state.player.animationOverride = null;
  }
  render();
}

async function playJacobDodgeAnimation(state, render, unit = state.player) {
  const durationMs = getScaledDuration(state, PATRICK_DODGE_ANIMATION_DURATION_MS);
  unit.animationOverride = {
    type: "dodge",
    endsAt: performance.now() + durationMs
  };
  render();
  await wait(durationMs);
  if (unit.animationOverride?.type === "dodge") {
    unit.animationOverride = null;
  }
  render();
}

async function playJacobParryAnimation(state, render, unit = state.player) {
  const durationMs = getScaledDuration(state, PATRICK_FASTER_FRAME_DURATION_MS);
  unit.animationOverride = {
    type: "parry",
    startedAt: performance.now(),
    endsAt: performance.now() + durationMs
  };
  render();
  await wait(durationMs);
  if (unit.animationOverride?.type === "parry") {
    unit.animationOverride = null;
  }
  render();
}

async function playKostyaClashDodgeAnimation(state, render, unit = state.player) {
  const durationMs = getScaledDuration(state, KOSTYA_CLASH_DODGE_ANIMATION_DURATION_MS);
  unit.animationOverride = {
    type: "dodge",
    endsAt: performance.now() + durationMs
  };
  render();
  await wait(durationMs);
  if (unit.animationOverride?.type === "dodge") {
    unit.animationOverride = null;
  }
  render();
}

async function playKostyaRangedDodgeAnimation(state, render, unit = state.player) {
  const durationMs = getScaledDuration(state, KOSTYA_RANGED_DODGE_ANIMATION_DURATION_MS);
  unit.animationOverride = {
    type: "dodge-ranged",
    endsAt: performance.now() + durationMs
  };
  render();
  await wait(durationMs);
  if (unit.animationOverride?.type === "dodge-ranged") {
    unit.animationOverride = null;
  }
  render();
}

async function playKostyaShadowSummonAnimation(state, render) {
  const durationMs = getScaledDuration(state, KOSTYA_SHADOW_SUMMON_ANIMATION_DURATION_MS);
  const now = performance.now();
  state.player.animationOverride = {
    type: "shadow-summon",
    startedAt: now,
    endsAt: now + durationMs
  };
  render();
  await wait(durationMs);
  if (state.player.animationOverride?.type === "shadow-summon") {
    state.player.animationOverride = null;
  }
  render();
}

async function playKostyaShadowCastAnimation(state, render) {
  await playKostyaShadowSummonAnimation(state, render);
}

async function playPatrickCoinFlipAnimation(state, render) {
  const durationMs = getScaledDuration(state, PATRICK_COIN_FLIP_ANIMATION_DURATION_MS);
  state.player.animationOverride = {
    type: "coin-flip",
    startedAt: performance.now(),
    endsAt: performance.now() + durationMs
  };
  render();
  await wait(durationMs);
  if (state.player.animationOverride?.type === "coin-flip") {
    state.player.animationOverride = null;
  }
  render();
}

function setPatrickCoinTossAimPose(state, render) {
  state.player.animationOverride = {
    type: "coin-toss-aim",
    startedAt: performance.now()
  };
  render();
}

async function playPatrickRevolverIntroAnimation(state, render) {
  const durationMs = getScaledDuration(state, PATRICK_REVOLVER_INTRO_DURATION_MS);
  state.player.animationOverride = {
    type: "revolver-intro",
    startedAt: performance.now(),
    endsAt: performance.now() + durationMs
  };
  render();
  await wait(durationMs);
}

function setPatrickRevolverReadyPose(state, render) {
  state.player.animationOverride = {
    type: "revolver-ready"
  };
  render();
}

async function playKostyaKatanaIntroAnimation(state, render, unit = state.player) {
  const durationMs = getScaledDuration(state, KOSTYA_KATANA_INTRO_DURATION_MS);
  const now = performance.now();
  unit.animationOverride = {
    type: "katana-intro",
    startedAt: now,
    endsAt: now + durationMs
  };
  render();
  if (durationMs > 0) {
    await wait(durationMs);
  }
}

function setKostyaKatanaReadyPose(unit, render) {
  unit.animationOverride = {
    type: "katana-ready"
  };
  render();
}

function setKostyaMassInfectionReadyPose(unit, render) {
  unit.animationOverride = {
    type: "mass-infection-ready"
  };
  render();
}

async function playKostyaKatanaOutroAnimation(state, render, unit = state.player) {
  const durationMs = getScaledDuration(state, KOSTYA_KATANA_OUTRO_DURATION_MS);
  const now = performance.now();
  unit.animationOverride = {
    type: "katana-outro",
    startedAt: now,
    endsAt: now + durationMs
  };
  render();
  await wait(durationMs);
  if (unit.animationOverride?.type === "katana-outro") {
    unit.animationOverride = null;
  }
  render();
}

async function playKostyaMassInfectionOutroAnimation(state, render, unit = state.player) {
  const durationMs = getScaledDuration(state, KOSTYA_KATANA_FRAME_DURATION_MS * 2);
  const now = performance.now();
  unit.animationOverride = {
    type: "mass-infection-outro",
    startedAt: now,
    endsAt: now + durationMs
  };
  render();
  await wait(durationMs);
  if (unit.animationOverride?.type === "mass-infection-outro") {
    unit.animationOverride = null;
  }
  render();
}

async function playPatrickRevolverShotLoopAnimation(state, render, { settleToReady = false } = {}) {
  const durationMs = getScaledDuration(state, PATRICK_REVOLVER_OUTRO_DURATION_MS);
  state.player.animationOverride = {
    type: "revolver-outro",
    startedAt: performance.now(),
    endsAt: performance.now() + durationMs
  };
  render();
  await wait(durationMs);
  if (state.player.animationOverride?.type === "revolver-outro") {
    state.player.animationOverride = settleToReady
      ? { type: "revolver-ready" }
      : null;
  }
  render();
}

async function playPatrickRevolverOutroAnimation(state, render) {
  await playPatrickRevolverShotLoopAnimation(state, render);
}

async function playPatrickTimedAnimation(state, render, animationType, durationMs) {
  const scaledDurationMs = getScaledDuration(state, durationMs);
  const now = performance.now();
  state.player.animationOverride = {
    type: animationType,
    startedAt: now,
    endsAt: now + scaledDurationMs
  };
  render();
  await wait(scaledDurationMs);
  if (state.player.animationOverride?.type === animationType) {
    state.player.animationOverride = null;
  }
  render();
}

async function playPatrickAceCastAnimation(state, render, { icon } = {}) {
  const now = performance.now();
  state.player.playerEffect = {
    type: "ace-cast-effect",
    icon: icon ?? { row: 2, column: 2 },
    startedAt: now,
    endsAt: now + getScaledDuration(state, PATRICK_ACE_CARD_EFFECT_DURATION_MS),
    maxAlpha: 0.92
  };
  await playPatrickTimedAnimation(state, render, "ace-cast", PATRICK_ACE_CAST_ANIMATION_DURATION_MS);
  if (state.player.playerEffect?.type === "ace-cast-effect" && Number(state.player.playerEffect.endsAt ?? 0) <= performance.now()) {
    state.player.playerEffect = null;
  } else {
    await wait(Math.max(0, Number(state.player.playerEffect?.endsAt ?? 0) - performance.now()));
    if (state.player.playerEffect?.type === "ace-cast-effect") {
      state.player.playerEffect = null;
    }
  }
  render();
}

async function playPatrickCoinTossRevolverIntroAnimation(state, render, { settleToReady = false } = {}) {
  const durationMs = getScaledDuration(state, PATRICK_COIN_TOSS_REVOLVER_INTRO_DURATION_MS);
  const now = performance.now();
  state.player.animationOverride = {
    type: "coin-toss-revolver-intro",
    startedAt: now,
    endsAt: now + durationMs
  };
  render();
  await wait(durationMs);
  if (state.player.animationOverride?.type === "coin-toss-revolver-intro") {
    state.player.animationOverride = settleToReady
      ? { type: "coin-toss-revolver-ready" }
      : null;
  }
  render();
}

async function playPatrickDualWieldIntroAnimation(state, render) {
  await playPatrickTimedAnimation(state, render, "dual-wield-intro", PATRICK_DUAL_WIELD_INTRO_DURATION_MS);
}

function setPatrickDualWieldReadyPose(state, render) {
  state.player.animationOverride = {
    type: "dual-wield-ready"
  };
  render();
}

async function playPatrickDualWieldSecondShotAnimation(state, render) {
  await playPatrickTimedAnimation(state, render, "dual-wield-second-shot", PATRICK_DUAL_WIELD_SECOND_SHOT_DURATION_MS);
}

async function playPatrickDualWieldOutroAnimation(state, render, { settleToHold = false } = {}) {
  const durationMs = getScaledDuration(state, PATRICK_DUAL_WIELD_OUTRO_DURATION_MS);
  const now = performance.now();
  state.player.animationOverride = {
    type: "dual-wield-outro",
    startedAt: now,
    endsAt: now + durationMs
  };
  render();
  await wait(durationMs);
  if (state.player.animationOverride?.type === "dual-wield-outro") {
    state.player.animationOverride = settleToHold
      ? { type: "dual-wield-outro-hold" }
      : null;
  }
  render();
}

async function playPatrickProjectileEffect(state, render, { bulletType = "regular", target = null } = {}) {
  if (!target) {
    return;
  }

  const effect = createPatrickProjectileEffect(state, target, bulletType);
  await playLinearProjectileEffect(state, render, effect, [{ progress: 1 }]);
}

async function playEnemyTimedProjectileEffect(state, render, attacker, target) {
  if (!attacker || !target) {
    return;
  }

  const effect = createEnemyTimedProjectileEffect(state, attacker, target);
  await playLinearProjectileEffect(state, render, effect, [{ progress: 1, playImpactSfx: false }]);
}

async function playPatrickCustomProjectileEffect(state, render, effect, { playImpactSfx = true } = {}) {
  await playLinearProjectileEffect(
    state,
    render,
    effect,
    playImpactSfx ? [{ progress: 1 }] : []
  );
}

async function playKostyaMassInfectionWaveEffect(state, render, attacker = state.player, impacts = []) {
  const effect = createKostyaMassInfectionWaveEffect(state, attacker);
  await playLinearProjectileEffect(state, render, effect, impacts);
}

function addProjectileEffect(state, effect) {
  state.projectileEffects = [...(state.projectileEffects ?? []).filter((entry) => entry.endsAt > performance.now()), effect];
}

function removeProjectileEffect(state, effect) {
  state.projectileEffects = (state.projectileEffects ?? []).filter((entry) => entry !== effect && entry.endsAt > performance.now());
}

function getLinearProjectileImpactProgress(effect, point) {
  const deltaX = Number(effect.endX ?? 0) - Number(effect.startX ?? 0);
  const deltaY = Number(effect.endY ?? 0) - Number(effect.startY ?? 0);
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  if (lengthSquared <= 0.001) {
    return 1;
  }

  const pointDeltaX = Number(point?.x ?? effect.endX ?? 0) - Number(effect.startX ?? 0);
  const pointDeltaY = Number(point?.y ?? effect.endY ?? 0) - Number(effect.startY ?? 0);
  return Math.max(0, Math.min(1, ((pointDeltaX * deltaX) + (pointDeltaY * deltaY)) / lengthSquared));
}

function getEnemyProjectileImpactPoint(state, target, { xOffsetTiles = 1.1, yOffsetTiles = 1.2 } = {}) {
  const targetIndex = Math.max(0, state.enemies.findIndex((enemy) => enemy.id === target?.id));
  const enemyPosition = getEnemyPosition(targetIndex);
  return {
    x: Math.floor((enemyPosition.x + xOffsetTiles) * TILE_SIZE),
    y: Math.floor((enemyPosition.y + yOffsetTiles) * TILE_SIZE)
  };
}

async function playLinearProjectileEffect(state, render, effect, impacts = []) {
  addProjectileEffect(state, effect);
  render();

  const now = performance.now();
  const startedAt = Number(effect.startedAt ?? now);
  const endsAt = Number(effect.endsAt ?? now);
  const totalDuration = Math.max(1, endsAt - startedAt);
  const scheduledImpacts = impacts
    .map((impact) => {
      const point = impact.point ?? { x: effect.endX, y: effect.endY };
      const progress = typeof impact.progress === "number"
        ? Math.max(0, Math.min(1, impact.progress))
        : getLinearProjectileImpactProgress(effect, point);
      return {
        ...impact,
        impactAt: startedAt + totalDuration * progress
      };
    })
    .sort((left, right) => left.impactAt - right.impactAt);

  for (const impact of scheduledImpacts) {
    await wait(Math.max(0, impact.impactAt - performance.now()));
    if (impact.playImpactSfx !== false) {
      playSfx(impact.sfxKey ?? "impact");
    }
    impact.onImpact?.();
    render();
  }

  await wait(Math.max(0, endsAt - performance.now()));
  removeProjectileEffect(state, effect);
  render();
}

function createPatrickProjectileEffect(state, target, bulletType, options = {}) {
  const playerPosition = getPlayerPosition();
  const targetIndex = Math.max(0, state.enemies.findIndex((enemy) => enemy.id === target.id));
  const enemyPosition = getEnemyPosition(targetIndex);
  const now = performance.now();
  const startX = Math.floor((playerPosition.x + 3.06) * 32) + 2;
  const startY = Math.floor((playerPosition.y + 1.18) * 32) - 2;
  const endX = Math.floor((enemyPosition.x + 1.1) * 32);
  const endY = Math.floor((enemyPosition.y + 1.2) * 32);
  const distancePx = Math.hypot(endX - startX, endY - startY);
  const durationMs = Math.max(
    Number(options.minDurationMs) > 0 ? Number(options.minDurationMs) : PATRICK_PROJECTILE_MIN_DURATION_MS,
    distancePx / Math.max(0.001, Number(options.speedPxPerMs) > 0 ? Number(options.speedPxPerMs) : PATRICK_PROJECTILE_SPEED_PX_PER_MS)
  );
  const scaledDurationMs = getScaledDuration(state, durationMs);

  return {
    id: `projectile-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type: bulletType,
    startX,
    startY,
    endX,
    endY,
    startedAt: now,
    flashEndsAt: now + getScaledDuration(
      state,
      Number.isFinite(options.flashDurationMs) ? Number(options.flashDurationMs) : PATRICK_MUZZLE_FLASH_DURATION_MS
    ),
    endsAt: now + scaledDurationMs,
    bulletSize: options.bulletSize,
    flashSize: options.flashSize,
    glowRadius: options.glowRadius,
    glowColor: options.glowColor,
    disableTrail: options.disableTrail,
    trailColor: options.trailColor,
    trailWidth: options.trailWidth,
    spriteSheet: options.spriteSheet
  };
}

function createJacobBallProjectileEffect(state, target, actionId, options = {}) {
  const playerPosition = getPlayerPosition();
  const targetIndex = Math.max(0, state.enemies.findIndex((enemy) => enemy.id === target.id));
  const enemyPosition = getEnemyPosition(targetIndex);
  const now = performance.now();
  const startX = Math.floor((playerPosition.x + 1.52) * TILE_SIZE);
  const startY = Math.floor((playerPosition.y + 2.9) * TILE_SIZE);
  const endX = Math.floor((enemyPosition.x + 1.08) * TILE_SIZE);
  const endY = Math.floor((enemyPosition.y + 1.72) * TILE_SIZE);
  const distancePx = Math.hypot(endX - startX, endY - startY);
  const durationMs = Math.max(
    Number(options.minDurationMs) > 0 ? Number(options.minDurationMs) : JACOB_BALL_MIN_DURATION_MS,
    distancePx / Math.max(0.001, Number(options.speedPxPerMs) > 0 ? Number(options.speedPxPerMs) : JACOB_BALL_PROJECTILE_SPEED_PX_PER_MS)
  );
  const scaledDurationMs = getScaledDuration(state, durationMs);
  const sprite = actionId === "fireball"
    ? { row: 1, column: 2 }
    : actionId === "slowball"
      ? { row: 1, column: 3 }
      : { row: 1, column: 1 };
  const trailColor = actionId === "fireball"
    ? "#ff9a3d"
    : actionId === "slowball"
      ? "#4f305f"
      : "#ffffff";

  return {
    id: `jacob-ball-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type: "jacob-ball",
    startX,
    startY,
    endX,
    endY,
    startedAt: now,
    endsAt: now + scaledDurationMs,
    bulletSize: options.bulletSize,
    disableTrail: options.disableTrail === true,
    trailColor,
    trailWidth: 3,
    trailStartYOffset: 8,
    trailLength: 0.26,
    arcHeight: Math.max(24, Math.floor(distancePx * 0.2)),
    rotationAngle: Math.atan2(endY - startY, endX - startX),
    spinTurns: options.disableTrail === true ? 0 : 3.25,
    spriteSheet: "jacob-indicator",
    sprite
  };
}

function createEnemyTimedProjectileEffect(state, attacker, target) {
  const attackerAnchor = getEnemyTimedProjectileAnchor(state, attacker, "attacker");
  const targetAnchor = getEnemyTimedProjectileAnchor(state, target, "target");
  const now = performance.now();
  const distancePx = Math.hypot(targetAnchor.x - attackerAnchor.x, targetAnchor.y - attackerAnchor.y);
  const durationMs = Math.max(
    PATRICK_PROJECTILE_MIN_DURATION_MS,
    distancePx / Math.max(0.001, ENEMY_TIMED_PROJECTILE_SPEED_PX_PER_MS)
  );
  const scaledDurationMs = getScaledDuration(state, durationMs);

  return {
    id: `enemy-timed-projectile-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type: "regular",
    startX: attackerAnchor.x,
    startY: attackerAnchor.y,
    endX: targetAnchor.x,
    endY: targetAnchor.y,
    startedAt: now,
    flashEndsAt: now + getScaledDuration(state, PATRICK_MUZZLE_FLASH_DURATION_MS),
    endsAt: now + scaledDurationMs,
    bulletSize: 18,
    flashSize: 18,
    glowRadius: 8,
    glowColor: "#ffd47a",
    disableTrail: true,
    spriteSheet: "enemy"
  };
}

function getEnemyTimedProjectileAnchor(state, unit, role = "target") {
  if (unit === state.player) {
    const position = getPlayerPosition();
    return {
      x: Math.floor((position.x + 1.85) * TILE_SIZE),
      y: Math.floor((position.y + 1.12) * TILE_SIZE)
    };
  }

  if (unit === state.player.shadow) {
    const position = getPlayerCompanionPosition(0);
    return {
      x: Math.floor((position.x + 1.65) * TILE_SIZE),
      y: Math.floor((position.y + 1.12) * TILE_SIZE)
    };
  }

  const enemyIndex = Math.max(0, state.enemies.findIndex((enemy) => enemy === unit));
  const position = getEnemyPosition(enemyIndex);
  return role === "attacker"
    ? {
      x: Math.floor((position.x + 1.1) * TILE_SIZE),
      y: Math.floor((position.y + 1.12) * TILE_SIZE)
    }
    : {
      x: Math.floor((position.x + 1.5) * TILE_SIZE),
      y: Math.floor((position.y + 1.12) * TILE_SIZE)
    };
}

function getLinearProjectilePosition(effect, atTime = performance.now()) {
  const startedAt = Number(effect?.startedAt ?? atTime);
  const endsAt = Number(effect?.endsAt ?? atTime);
  const progress = Math.max(0, Math.min(1, (atTime - startedAt) / Math.max(1, endsAt - startedAt)));

  return {
    x: Number(effect?.startX ?? 0) + (Number(effect?.endX ?? 0) - Number(effect?.startX ?? 0)) * progress,
    y: Number(effect?.startY ?? 0) + (Number(effect?.endY ?? 0) - Number(effect?.startY ?? 0)) * progress
  };
}

function settleTimedProjectileOnImpact(state, render, effect, onImpact = null) {
  const delayMs = Math.max(0, Number(effect?.endsAt ?? performance.now()) - performance.now());
  window.setTimeout(() => {
    removeProjectileEffect(state, effect);
    onImpact?.();
    render();
  }, delayMs);
}

function continueTimedProjectileAfterDodge(state, render, effect) {
  const now = performance.now();
  const currentPosition = getLinearProjectilePosition(effect, now);
  const deltaX = Number(effect.endX ?? currentPosition.x) - Number(effect.startX ?? currentPosition.x);
  const deltaY = Number(effect.endY ?? currentPosition.y) - Number(effect.startY ?? currentPosition.y);
  const exitX = Math.floor(-2 * TILE_SIZE);
  let exitY = currentPosition.y;

  if (Math.abs(deltaX) > 0.001) {
    const travelScale = (exitX - currentPosition.x) / deltaX;
    exitY = currentPosition.y + deltaY * travelScale;
  }

  effect.startX = currentPosition.x;
  effect.startY = currentPosition.y;
  effect.endX = exitX;
  effect.endY = exitY;
  effect.startedAt = now;
  effect.flashEndsAt = now;
  const distancePx = Math.hypot(effect.endX - effect.startX, effect.endY - effect.startY);
  const durationMs = Math.max(
    PATRICK_PROJECTILE_MIN_DURATION_MS,
    distancePx / Math.max(0.001, ENEMY_TIMED_PROJECTILE_SPEED_PX_PER_MS * 2)
  );
  effect.endsAt = now + getScaledDuration(state, durationMs);

  window.setTimeout(() => {
    removeProjectileEffect(state, effect);
    render();
  }, Math.max(0, Number(effect.endsAt ?? now) - now));
}

function returnTimedProjectileToAttacker(state, render, effect, attacker, onReturn = null) {
  if (!effect || !attacker) {
    removeProjectileEffect(state, effect);
    onReturn?.();
    render();
    return;
  }

  const now = performance.now();
  const currentPosition = getLinearProjectilePosition(effect, now);
  const attackerAnchor = getEnemyTimedProjectileAnchor(state, attacker, "attacker");
  effect.startX = currentPosition.x;
  effect.startY = currentPosition.y;
  effect.endX = attackerAnchor.x;
  effect.endY = attackerAnchor.y;
  effect.startedAt = now;
  effect.flashEndsAt = now;
  effect.glowColor = "#ff8f8f";
  effect.trailColor = "#ff7d7d";
  effect.trailWidth = 3;
  const distancePx = Math.hypot(effect.endX - effect.startX, effect.endY - effect.startY);
  const durationMs = Math.max(
    PATRICK_PROJECTILE_MIN_DURATION_MS,
    distancePx / Math.max(0.001, ENEMY_TIMED_PROJECTILE_SPEED_PX_PER_MS)
  );
  effect.endsAt = now + getScaledDuration(state, durationMs);

  window.setTimeout(() => {
    removeProjectileEffect(state, effect);
    onReturn?.();
    render();
  }, Math.max(0, Number(effect.endsAt ?? now) - now));
}

function getEnemyTimedDodgeState(effect, atTime = performance.now()) {
  return getTimedProjectileDodgeState(
    effect,
    {
      successMinTiles: ENEMY_TIMED_DODGE_GREEN_MIN_TILES,
      successMaxTiles: ENEMY_TIMED_DODGE_GREEN_MAX_TILES,
      nearMinTiles: ENEMY_TIMED_DODGE_YELLOW_MIN_TILES,
      nearMaxTiles: ENEMY_TIMED_DODGE_YELLOW_MAX_TILES,
      successTier: "green",
      nearTier: "yellow"
    },
    atTime
  );
}

function getTimedProjectileDodgeState(effect, windowConfig, atTime = performance.now()) {
  if (!effect) {
    return {
      value: 0,
      tier: "miss",
      timedVisible: false,
      timedOpacity: TIMED_PULSE_BASE_OPACITY,
      pulseStrength: 0
    };
  }

  const projectilePosition = getLinearProjectilePosition(effect, atTime);
  const remainingDistanceTiles = Math.hypot(
    Number(effect.endX ?? projectilePosition.x) - projectilePosition.x,
    Number(effect.endY ?? projectilePosition.y) - projectilePosition.y
  ) / TILE_SIZE;
  const successMinTiles = Math.max(0, Number(windowConfig?.successMinTiles ?? 0) || 0);
  const successMaxTiles = Math.max(successMinTiles, Number(windowConfig?.successMaxTiles ?? successMinTiles) || successMinTiles);
  const nearMinTiles = windowConfig?.nearMinTiles == null
    ? null
    : Math.max(successMaxTiles, Number(windowConfig.nearMinTiles) || successMaxTiles);
  const nearMaxTiles = nearMinTiles == null
    ? null
    : Math.max(nearMinTiles, Number(windowConfig?.nearMaxTiles ?? nearMinTiles) || nearMinTiles);
  const successTier = windowConfig?.successTier ?? "green";
  const nearTier = windowConfig?.nearTier ?? "yellow";

  if (
    remainingDistanceTiles >= successMinTiles
    && remainingDistanceTiles <= successMaxTiles
  ) {
    const successProgress = (successMaxTiles - Math.min(successMaxTiles, remainingDistanceTiles))
      / Math.max(0.001, successMaxTiles - successMinTiles);
    return {
      value: Math.max(0, Math.min(100, successProgress * 100)),
      tier: successTier,
      timedVisible: true,
      timedOpacity: 1,
      pulseStrength: 1
    };
  }

  if (
    nearMinTiles != null
    && nearMaxTiles != null
    && remainingDistanceTiles > nearMinTiles
    && remainingDistanceTiles <= nearMaxTiles
  ) {
    const nearProgress = (nearMaxTiles - remainingDistanceTiles)
      / Math.max(0.001, nearMaxTiles - nearMinTiles);
    return {
      value: Math.max(0, Math.min(100, nearProgress * 100)),
      tier: nearTier,
      timedVisible: true,
      timedOpacity: 1,
      pulseStrength: 0
    };
  }

  return {
    value: remainingDistanceTiles < ENEMY_TIMED_DODGE_GREEN_MIN_TILES ? 100 : 0,
    tier: "miss",
    timedVisible: false,
    timedOpacity: TIMED_PULSE_BASE_OPACITY,
    pulseStrength: 0
  };
}

function applyEnemyTimedDodgeVisualState(dodgeCheck, atTime = performance.now()) {
  const timedState = getTimedProjectileDodgeState(
    dodgeCheck?.projectileEffect,
    {
      successMinTiles: dodgeCheck?.timedWindowMinTiles,
      successMaxTiles: dodgeCheck?.timedWindowMaxTiles,
      nearMinTiles: dodgeCheck?.timedNearColor == null ? null : dodgeCheck?.timedWindowMaxTiles,
      nearMaxTiles: dodgeCheck?.timedNearWindowMaxTiles,
      successTier: dodgeCheck?.timedSuccessColor === "counter" ? "counter" : "green",
      nearTier: dodgeCheck?.timedNearColor === "yellow" ? "yellow" : "miss"
    },
    atTime
  );
  const visualState = getTimedProjectileDodgeState(
    dodgeCheck?.projectileEffect,
    {
      successMinTiles: dodgeCheck?.timedWindowMinTiles,
      successMaxTiles: dodgeCheck?.timedWindowMaxTiles,
      nearMinTiles: dodgeCheck?.timedNearColor == null ? null : dodgeCheck?.timedWindowMaxTiles,
      nearMaxTiles: dodgeCheck?.timedNearColor == null ? null : ENEMY_TIMED_DODGE_VISUAL_YELLOW_MAX_TILES,
      successTier: dodgeCheck?.timedSuccessColor === "counter" ? "counter" : "green",
      nearTier: dodgeCheck?.timedNearColor === "yellow" ? "yellow" : "miss"
    },
    atTime
  );
  let displayedTier = visualState.tier;
  let displayedValue = visualState.value;
  let displayedVisible = visualState.timedVisible;
  let displayedOpacity = visualState.timedOpacity;
  let displayedPulseStrength = visualState.pulseStrength;

  if (visualState.tier === "yellow") {
    dodgeCheck.timedYellowDisplayHoldUntil = atTime + ENEMY_TIMED_DODGE_YELLOW_DISPLAY_HOLD_MS;
    dodgeCheck.timedLastYellowDisplayValue = visualState.value;
  } else if (
    visualState.tier === "miss"
    && atTime <= (dodgeCheck.timedYellowDisplayHoldUntil ?? 0)
    && dodgeCheck?.timedNearColor === "yellow"
  ) {
    displayedTier = "yellow";
    displayedValue = dodgeCheck.timedLastYellowDisplayValue ?? visualState.value;
    displayedVisible = true;
    displayedOpacity = 1;
    displayedPulseStrength = 0;
  }

  dodgeCheck.value = displayedValue;
  dodgeCheck.timedTier = displayedTier;
  dodgeCheck.timedDisplayTier = displayedTier;
  dodgeCheck.timedResultTier = timedState.tier;
  dodgeCheck.timedVisible = displayedVisible;
  dodgeCheck.timedOpacity = displayedOpacity;
  dodgeCheck.pulseStrength = displayedPulseStrength;
}

function createKostyaMassInfectionWaveEffect(state, attacker = state.player) {
  const attackerPosition = attacker === state.player.shadow
    ? getPlayerCompanionPosition(0)
    : getPlayerPosition();
  const { gridWidth } = getSceneMetrics();
  const now = performance.now();
  const startX = Math.floor((attackerPosition.x + 2.62) * TILE_SIZE);
  const startY = Math.floor((attackerPosition.y + 1.34) * TILE_SIZE);
  const endX = Math.floor((gridWidth + 1.5) * TILE_SIZE);
  const endY = startY;
  const distancePx = Math.hypot(endX - startX, endY - startY);
  const durationMs = Math.max(
    PATRICK_PROJECTILE_MIN_DURATION_MS,
    distancePx / Math.max(0.001, KOSTYA_MASS_INFECTION_PROJECTILE_SPEED_PX_PER_MS)
  );

  return {
    id: `mass-infection-wave-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type: "mass-infection-wave",
    startX,
    startY,
    endX,
    endY,
    spriteSize: 96,
    startedAt: now,
    endsAt: now + getScaledDuration(state, durationMs)
  };
}

function createPatrickCoinTossCoinEffect(state) {
  const playerPosition = getPlayerPosition();
  const playerWidthPx = TILE_SIZE * 3;
  const playerHeightPx = TILE_SIZE * 3;
  const dx = Math.floor(playerPosition.x * TILE_SIZE);
  const dy = Math.floor(playerPosition.y * TILE_SIZE);
  const startX = dx + Math.floor(playerWidthPx * 0.69);
  const startY = dy + Math.floor(playerHeightPx * 0.27);
  const endY = dy + playerHeightPx + Math.floor(TILE_SIZE * 0.4);
  const checkpointX = startX + TILE_SIZE * PATRICK_COIN_TOSS_CHECKPOINT_X_TILES;
  const checkpointY = endY - TILE_SIZE * PATRICK_COIN_TOSS_CHECKPOINT_Y_TILES;
  const endX = startX + TILE_SIZE * PATRICK_COIN_TOSS_END_X_TILES;
  const now = performance.now();

  return {
    id: `coin-toss-coin-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type: "coin-toss-coin",
    startX,
    startY,
    checkpointX,
    checkpointY,
    endX,
    endY,
    checkpointProgress: PATRICK_COIN_TOSS_CHECKPOINT_X_TILES / PATRICK_COIN_TOSS_END_X_TILES,
    startedAt: now,
    endsAt: now + getScaledDuration(state, PATRICK_COIN_TOSS_COIN_AIR_DURATION_MS)
  };
}

export function getCoinTossCoinPosition(effect, atTime = performance.now()) {
  const startedAt = Number(effect?.startedAt ?? atTime);
  const endsAt = Number(effect?.endsAt ?? atTime);
  const progress = Math.max(0, Math.min(1, (atTime - startedAt) / Math.max(1, endsAt - startedAt)));
  const checkpointProgress = Math.max(0.05, Math.min(0.95, Number(effect?.checkpointProgress ?? 0.8)));
  const point = getParabolaPointThroughCheckpoint(
    effect.startX,
    effect.startY,
    effect.checkpointX,
    effect.checkpointY,
    effect.endX,
    effect.endY,
    checkpointProgress,
    progress
  );

  return {
    x: Math.floor(point.x),
    y: Math.floor(point.y)
  };
}

function getParabolaPointThroughCheckpoint(startX, startY, checkpointX, checkpointY, endX, endY, checkpointT, t) {
  const safeCheckpointT = Math.max(0.05, Math.min(0.95, checkpointT));
  const l0 = ((t - safeCheckpointT) * (t - 1)) / safeCheckpointT;
  const l1 = (t * (t - 1)) / (safeCheckpointT * (safeCheckpointT - 1));
  const l2 = (t * (t - safeCheckpointT)) / (1 - safeCheckpointT);

  return {
    x: startX * l0 + checkpointX * l1 + endX * l2,
    y: startY * l0 + checkpointY * l1 + endY * l2
  };
}

function createCoinTossBulletFromTopRightEffect(coinPosition, state) {
  const playerPosition = getPlayerPosition();
  const playerWidthPx = TILE_SIZE * 3;
  const playerHeightPx = TILE_SIZE * 3;
  const dx = Math.floor(playerPosition.x * TILE_SIZE);
  const dy = Math.floor(playerPosition.y * TILE_SIZE);
  const startX = dx + Math.floor(playerWidthPx * 0.8);
  const startY = dy + Math.floor(playerHeightPx * 0.12);
  const now = performance.now();
  const distancePx = Math.hypot(coinPosition.x - startX, coinPosition.y - startY);
  const durationMs = Math.max(
    PATRICK_PROJECTILE_MIN_DURATION_MS,
    distancePx / Math.max(0.001, PATRICK_PROJECTILE_SPEED_PX_PER_MS * 1.2)
  );
  const scaledDurationMs = getScaledDuration(state, durationMs);

  return {
    id: `coin-toss-bullet-a-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type: "regular",
    startX,
    startY,
    endX: coinPosition.x,
    endY: coinPosition.y,
    startedAt: now,
    flashEndsAt: now + getScaledDuration(state, PATRICK_MUZZLE_FLASH_DURATION_MS),
    endsAt: now + scaledDurationMs,
    bulletSize: 18,
    flashSize: 24,
    glowRadius: 14,
    glowColor: "#fff0a8",
    trailColor: "#fff6bf",
    trailWidth: 3,
    flashAngle: Math.atan2(coinPosition.y - startY, coinPosition.x - startX)
  };
}

function createCoinTossRicochetToTargetEffect(state, target, startPoint) {
  const targetIndex = Math.max(0, state.enemies.findIndex((enemy) => enemy.id === target.id));
  const enemyPosition = getEnemyPosition(targetIndex);
  const now = performance.now();
  const endX = Math.floor((enemyPosition.x + 1.1) * TILE_SIZE);
  const endY = Math.floor((enemyPosition.y + 1.2) * TILE_SIZE);
  const distancePx = Math.hypot(endX - startPoint.x, endY - startPoint.y);
  const durationMs = Math.max(
    PATRICK_PROJECTILE_MIN_DURATION_MS,
    distancePx / Math.max(0.001, PATRICK_PROJECTILE_SPEED_PX_PER_MS * 1.35)
  );
  const scaledDurationMs = getScaledDuration(state, durationMs);

  return {
    id: `coin-toss-bullet-b-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type: "regular",
    startX: startPoint.x,
    startY: startPoint.y,
    endX,
    endY,
    startedAt: now,
    flashEndsAt: now + getScaledDuration(state, 50),
    endsAt: now + scaledDurationMs,
    bulletSize: 16,
    flashSize: 18,
    glowRadius: 8,
    glowColor: "#fff6cc",
    trailColor: "#ffffff",
    trailWidth: 3,
    flashAngle: Math.atan2(endY - startPoint.y, endX - startPoint.x)
  };
}

async function playPatrickCoinTossRicochetEffect(state, render, { coinPosition, target }) {
  const bulletToCoin = createCoinTossBulletFromTopRightEffect(coinPosition, state);
  await playPatrickCustomProjectileEffect(state, render, bulletToCoin, { playImpactSfx: false });
  const ricochet = createCoinTossRicochetToTargetEffect(state, target, coinPosition);
  await playPatrickCustomProjectileEffect(state, render, ricochet, { playImpactSfx: true });
}

function createEmptyStatuses() {
  return Object.fromEntries(STATUS_KEYS.map((statusKey) => [
    statusKey,
    statusKey === "absorption"
      ? { power: 0, turns: 0, points: 0 }
      : { power: 0, turns: 0 }
  ]));
}

function createLevelSeed(level) {
  return Date.now() + Math.floor(Math.random() * 1000000) + level * 9973;
}

function getMusicTrackKeyForLevel(level) {
  if (level >= MAX_LEVEL) {
    return Math.random() < LEVEL_MUSIC_FINAL_STAND_ALT_CHANCE
      ? LEVEL_MUSIC_FINAL_STAND_ALT_KEY
      : LEVEL_MUSIC_FINAL_STAND_KEY;
  }

  return LEVEL_MUSIC_GENERIC_KEY;
}
