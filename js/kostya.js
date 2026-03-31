import { scaleDuration } from "./timing.js";

export const KOSTYA_SPRITES = {
  spriteSheet: "sprites/player/kostya/kostya.png",
  iconSheet: "sprites/player/kostya/kostya_icon.png",
  base: "sprites/player/kostya/kostya.png",
  idleSheet: "sprites/player/kostya/kostya.png",
  thinkingSheet: "sprites/player/kostya/kostya.png",
  walkingSheet: "sprites/player/kostya/kostya.png",
  attackSheet: "sprites/player/kostya/kostya.png",
  damaged: "sprites/player/kostya/kostya.png",
  collapsed: "sprites/player/kostya/kostya.png",
  dodgeCounterPose: "sprites/player/kostya/kostya.png",
  slashFx: "sprites/player/kostya/kostya.png",
  stabFx: "sprites/player/kostya/kostya.png",
  counterFx: "sprites/player/kostya/kostya.png",
  battleCard: "sprites/player/kostya/kostya_profile.png",
  shadow: "sprites/player/kostya/kostya.png",
  shadowIdleSheet: "sprites/player/kostya/kostya.png",
  shadowCharges: "sprites/player/kostya/kostya_indicator.png",
  abilityStab: "",
  abilitySlash: "",
  abilityLunge: "",
  abilityUpgradeShadow: "",
  abilityShadow: "",
  abilityHealthSteal: "",
  abilityDecay: "",
  abilitySharpTip: "",
  abilityTransform: "",
  abilityCleave: "",
  abilityHeartyRecovery: "",
  abilityShadowRecast: "",
  abilityDarkerLayer: "",
  templateAbilityIcon: "",
  upgradeBlade: "",
  upgradeHealth: "",
  upgradeShadow: ""
};

export const KOSTYA_SHADOW_STRENGTH_TURNS = 999;

function kostyaAbility(id, name, icon, cost = {}) {
  return {
    id,
    name,
    icon: icon || KOSTYA_SPRITES.templateAbilityIcon,
    charges: 0,
    sp: cost.sp || 0,
    sc: cost.sc || 0,
    scGain: cost.scGain || 0,
    hp: cost.hp || 0
  };
}

function kostyaAbilityCostRank(ability) {
  if (!ability) return 0;
  return ((ability.sp || 0) * 1000) + ((ability.sc || 0) * 10) + (ability.hp || 0) - (ability.scGain || 0);
}

function sortKostyaAbilitiesByCost(abilities) {
  return [...abilities].sort((a, b) => {
    const costDiff = kostyaAbilityCostRank(a) - kostyaAbilityCostRank(b);
    if (costDiff !== 0) return costDiff;
    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

function kostyaEnemyLabel(ctx, target) {
  if (!target) return "enemy";
  if (typeof ctx?.enemyLabel === "function") {
    const resolved = ctx.enemyLabel(target);
    if (resolved) return resolved;
  }
  return target.name || target.label || "enemy";
}

export function getKostyaAbilities({
  lungeUnlocked = false,
  decayingStabUnlocked = false,
  sharpTipUnlocked = false,
  transformationUnlocked = false,
  cleaveUnlocked = false,
  heartyRecoveryUnlocked = false,
  shadowRecastUnlocked = false,
  darkerLayerUnlocked = false
} = {}) {
  const sword = kostyaAbility("stab", "Sword", KOSTYA_SPRITES.abilityStab);
  const swordAbilities = [
    kostyaAbility("slash", "Slash", KOSTYA_SPRITES.abilitySlash, { sp: 12 }),
    lungeUnlocked ? kostyaAbility("lunge", "Lunge", KOSTYA_SPRITES.abilityLunge, { sp: 18 }) : null,
    decayingStabUnlocked ? kostyaAbility("decayingStab", "Decaying Stab", KOSTYA_SPRITES.abilityDecay, { sp: 16, sc: 6 }) : null,
    sharpTipUnlocked ? kostyaAbility("sharpTip", "Sharp Tip", KOSTYA_SPRITES.abilitySharpTip, { sp: 32 }) : null,
    cleaveUnlocked ? kostyaAbility("cleave", "Cleave", KOSTYA_SPRITES.abilityCleave, { sp: 40 }) : null
  ].filter(Boolean);

  const shadow = kostyaAbility("dark", "Shadow", KOSTYA_SPRITES.abilityShadow, { sp: 42, sc: 100 });
  const shadowUpgrade = kostyaAbility("shadowStrengthen", "Upgrade Shadow", KOSTYA_SPRITES.abilityUpgradeShadow, { sp: 50, sc: 100 });
  const shadowAbilities = [
    transformationUnlocked ? kostyaAbility("transformation", "Transform", KOSTYA_SPRITES.abilityTransform, { sp: 28, sc: 16 }) : null,
    heartyRecoveryUnlocked ? kostyaAbility("heartyRecovery", "Hearty Recovery", KOSTYA_SPRITES.abilityHeartyRecovery, { sp: 26, sc: 16 }) : null,
    shadowRecastUnlocked ? kostyaAbility("shadowRecast", "Shadow Recast", KOSTYA_SPRITES.abilityShadowRecast, { sp: 50, sc: 36 }) : null,
    darkerLayerUnlocked ? kostyaAbility("darkerLayer", "Darker Layer", KOSTYA_SPRITES.abilityDarkerLayer, { sp: 64, sc: 36 }) : null
  ].filter(Boolean);

  return [
    sword,
    ...sortKostyaAbilitiesByCost(swordAbilities),
    shadow,
    shadowUpgrade,
    ...sortKostyaAbilitiesByCost(shadowAbilities)
  ];
}

function kostyaDecayBossBonus(level) {
  return Math.max(0, Math.floor((Math.max(1, level) - 1) / 10) - 1);
}

export function getKostyaDecayPowerForLevel(level, empowered = false) {
  const base = empowered ? 5 : 3;
  return Math.min(10, base + kostyaDecayBossBonus(level));
}

export function getKostyaCurrentUnlocks() {
  return {
    lungeUnlocked: kostyaState.lungeUnlocked,
    decayingStabUnlocked: kostyaState.decayingStabUnlocked,
    sharpTipUnlocked: kostyaState.sharpTipUnlocked,
    transformationUnlocked: kostyaState.transformationUnlocked,
    cleaveUnlocked: kostyaState.cleaveUnlocked,
    heartyRecoveryUnlocked: kostyaState.heartyRecoveryUnlocked,
    shadowRecastUnlocked: kostyaState.shadowRecastUnlocked,
    darkerLayerUnlocked: kostyaState.darkerLayerUnlocked
  };
}

export function getKostyaHoverHints(ctx = null) {
  const level = ctx?.getLevel?.() || 1;
  const decayLow = getKostyaDecayPowerForLevel(level, false);
  const decayHigh = getKostyaDecayPowerForLevel(level, true);
  const transformBonus = getKostyaShadowAttackBonusDamage();
  const baseSwordDamage = getKostyaStabBaseDamageFromState();
  return {
    stab: `Cold steel first.\nDeals ${baseSwordDamage} damage.`,
    slash: "Cut through the line.\nSplashes 50% behind.",
    lunge: "Nobody is safe.\nPick any enemy.",
    decayingStab: `Let it rot.\nDecay ${decayLow}/${decayHigh} for 3 turns.`,
    sharpTip: "Straight through guard.\n+50% damage.",
    transformation: `Feed the dark.\nStores +${transformBonus > 0 ? transformBonus : "SHP"} damage.`,
    cleave: "One perfect cut.\nGreen deals 4x base.",
    heartyRecovery: "Blood for shadow.\n20 HP -> 40 SHP max.",
    shadowRecast: "Drag it back.\nLose 15 HP to resummon.",
    darkerLayer: "Drown it in violet.\nPurple layer = max SHP.",
    dark: "Call the shade.\nSummons Shadow with 20 SHP.",
    shadowStrengthen: "Sharpen the shade.\n+3 max SHP, +1 Strength."
  };
}

export function hasKostyaForSlashUnlock({ duoMode, duoCharacters, soloIsKostya }) {
  return duoMode ? duoCharacters.includes("kostya") : soloIsKostya;
}

export function getKostyaStabBaseDamage(strongerBladeUpgrades) {
  return 8 + strongerBladeUpgrades * 2;
}

export function getKostyaStabGreenBonusDamage(strongerBladeUpgrades) {
  const baseDamage = getKostyaStabBaseDamage(strongerBladeUpgrades);
  const bonusPct = 0.1 + strongerBladeUpgrades * 0.01;
  return Math.max(1, Math.ceil(baseDamage * bonusPct));
}

export function getKostyaShadowChargeGain(damageDealt, endarkementUpgrades) {
  const gainPerDamage = 0.5 + endarkementUpgrades * 0.35;
  const gainMultiplier = 1.05 - (getKostyaShadow() ? 0.08 : 0);
  return Math.max(0, damageDealt) * gainPerDamage * Math.max(0, gainMultiplier);
}

export function getKostyaSpGainFromDamage(damageDealt) {
  const spGainPerDamage = 0.5;
  return Math.ceil(Math.max(0, damageDealt) * spGainPerDamage);
}

const kostyaState = {
  strongerBladeUpgrades: 0,
  noLightUpgrades: 0,
  endarkementUpgrades: 0,
  slashUnlocked: true,
  strengthenUnlocked: true,
  lungeUnlocked: false,
  decayingStabUnlocked: false,
  sharpTipUnlocked: false,
  transformationUnlocked: false,
  cleaveUnlocked: false,
  heartyRecoveryUnlocked: false,
  shadowRecastUnlocked: false,
  darkerLayerUnlocked: false,
  shadowStrengthPower: 0,
  shadowUpgradeHpBonus: 0,
  shadowAttackBonusDamage: 0,
  shadowChargePct: 0,
  shadow: null,
  lastCollapsedShadowSnapshot: null,
  shadowHealProgressShp: 0,
  shadowHealthStealReady: false,
  idleFramesCache: null,
  idleFramesPromise: null,
  thinkingFramesCache: null,
  thinkingFramesPromise: null,
  walkingFramesCache: null,
  walkingFramesPromise: null,
  attackFramesCache: null,
  attackFramesPromise: null,
  parryFramesCache: null,
  parryFramesPromise: null,
  shadowIdleFramesCache: null,
  shadowIdleFramesPromise: null,
  shadowWalkFramesCache: null,
  shadowWalkFramesPromise: null,
  shadowAttackFramesCache: null,
  shadowAttackFramesPromise: null,
  shadowDamagedFramesCache: null,
  shadowDamagedFramesPromise: null,
  abilityController: null
};

const KOSTYA_FRAME_SIZE = 32;
const KOSTYA_ICON_SIZE = 16;

const KOSTYA_ICON_CELLS = {
  abilityStab: { row: 0, col: 0 },
  abilitySlash: { row: 0, col: 1 },
  abilityLunge: { row: 0, col: 2 },
  abilityDecay: { row: 0, col: 3 },
  abilityShadow: { row: 0, col: 4 },
  abilityUpgradeShadow: { row: 0, col: 5 },
  abilitySharpTip: { row: 0, col: 6 },
  abilityTransform: { row: 0, col: 7 },
  abilityCleave: { row: 1, col: 0 },
  abilityHeartyRecovery: { row: 1, col: 1 },
  abilityShadowRecast: { row: 1, col: 2 },
  abilityDarkerLayer: { row: 1, col: 3 },
  upgradeBlade: { row: 1, col: 4 },
  upgradeHealth: { row: 1, col: 5 },
  upgradeShadow: { row: 1, col: 6 }
};

const KOSTYA_SHEET_ROWS = {
  idle: { row: 0, startCol: 0, frameCount: 4 },
  thinking: { row: 0, startCol: 4, frameCount: 4 },
  walking: { row: 1, startCol: 0, frameCount: 4 },
  attack: { row: 1, startCol: 4, frameCount: 4 },
  damaged: { row: 2, col: 0 },
  collapsed: { row: 2, col: 1 },
  dodgeCounterPose: { row: 2, col: 2 },
  transformationCast: { row: 2, col: 3 },
  shadowRecastCast: { row: 2, startCol: 4, frameCount: 2 },
  shadowCast: { row: 2, startCol: 6, frameCount: 2 },
  shadowIdle: { row: 3, startCol: 0, frameCount: 4 },
  shadowWalk: { row: 3, startCol: 4, frameCount: 4 },
  shadowAttack: { row: 4, startCol: 0, frameCount: 4 },
  shadowDamaged: { row: 4, col: 4 },
  stabFx: { row: 4, col: 5 },
  slashFx: { row: 4, col: 6 },
  counterFx: { row: 4, col: 7 }
};

export function resetKostyaProgress() {
  kostyaState.shadowChargePct = 0;
  kostyaState.shadow = null;
  kostyaState.strongerBladeUpgrades = 0;
  kostyaState.noLightUpgrades = 0;
  kostyaState.endarkementUpgrades = 0;
  kostyaState.slashUnlocked = true;
  kostyaState.strengthenUnlocked = true;
  kostyaState.lungeUnlocked = false;
  kostyaState.decayingStabUnlocked = false;
  kostyaState.sharpTipUnlocked = false;
  kostyaState.transformationUnlocked = false;
  kostyaState.cleaveUnlocked = false;
  kostyaState.heartyRecoveryUnlocked = false;
  kostyaState.shadowRecastUnlocked = false;
  kostyaState.darkerLayerUnlocked = false;
  kostyaState.shadowStrengthPower = 0;
  kostyaState.shadowUpgradeHpBonus = 0;
  kostyaState.shadowAttackBonusDamage = 0;
  kostyaState.lastCollapsedShadowSnapshot = null;
  kostyaState.shadowHealthStealReady = false;
  kostyaState.shadowHealProgressShp = 0;
  kostyaState.idleFramesCache = null;
  kostyaState.idleFramesPromise = null;
  kostyaState.thinkingFramesCache = null;
  kostyaState.thinkingFramesPromise = null;
  kostyaState.walkingFramesCache = null;
  kostyaState.walkingFramesPromise = null;
  kostyaState.attackFramesCache = null;
  kostyaState.attackFramesPromise = null;
  kostyaState.parryFramesCache = null;
  kostyaState.parryFramesPromise = null;
  kostyaState.shadowIdleFramesCache = null;
  kostyaState.shadowIdleFramesPromise = null;
  kostyaState.shadowWalkFramesCache = null;
  kostyaState.shadowWalkFramesPromise = null;
  kostyaState.shadowAttackFramesCache = null;
  kostyaState.shadowAttackFramesPromise = null;
  kostyaState.shadowDamagedFramesCache = null;
  kostyaState.shadowDamagedFramesPromise = null;
  kostyaState.abilityController = null;
}

export function getKostyaUpgrades() {
  return {
    strongerBladeUpgrades: kostyaState.strongerBladeUpgrades,
    noLightUpgrades: kostyaState.noLightUpgrades,
    endarkementUpgrades: kostyaState.endarkementUpgrades
  };
}

export function setKostyaUpgrade(key, value) {
  if (key === "strongerBlade") kostyaState.strongerBladeUpgrades = value;
  if (key === "noLight") kostyaState.noLightUpgrades = value;
  if (key === "endarkement") kostyaState.endarkementUpgrades = value;
}

export function grantKostyaDebugMaxProgress(unit, { maxHpCap = 90 } = {}) {
  kostyaState.strongerBladeUpgrades = 17;
  kostyaState.noLightUpgrades = 16;
  kostyaState.endarkementUpgrades = 16;
  kostyaState.lungeUnlocked = true;
  kostyaState.decayingStabUnlocked = true;
  kostyaState.sharpTipUnlocked = true;
  kostyaState.transformationUnlocked = true;
  kostyaState.cleaveUnlocked = true;
  kostyaState.heartyRecoveryUnlocked = true;
  kostyaState.shadowRecastUnlocked = true;
  kostyaState.darkerLayerUnlocked = true;
  if (unit) {
    unit.maxHp = Math.max(unit.maxHp || 0, maxHpCap);
    unit.hp = unit.maxHp;
    unit.sp = unit.maxSp;
  }
}

export function isKostyaSlashUnlockedState() {
  return true;
}

export function isKostyaStrengthenUnlockedState() {
  return true;
}

export function setKostyaAbilityUnlock(id, value = true) {
  if (id === "slash") kostyaState.slashUnlocked = !!value;
  if (id === "shadowStrengthen") kostyaState.strengthenUnlocked = !!value;
  if (id === "lunge") kostyaState.lungeUnlocked = !!value;
  if (id === "decayingStab") kostyaState.decayingStabUnlocked = !!value;
  if (id === "sharpTip") kostyaState.sharpTipUnlocked = !!value;
  if (id === "transformation") kostyaState.transformationUnlocked = !!value;
  if (id === "cleave") kostyaState.cleaveUnlocked = !!value;
  if (id === "heartyRecovery") kostyaState.heartyRecoveryUnlocked = !!value;
  if (id === "shadowRecast") kostyaState.shadowRecastUnlocked = !!value;
  if (id === "darkerLayer") kostyaState.darkerLayerUnlocked = !!value;
}

export function getKostyaShadowChargePct() {
  return kostyaState.shadowChargePct;
}

export function setKostyaShadowChargePct(value) {
  kostyaState.shadowChargePct = Math.max(0, Math.min(100, value));
  return kostyaState.shadowChargePct;
}

export function addKostyaShadowCharge(amount) {
  return setKostyaShadowChargePct(kostyaState.shadowChargePct + Math.max(0, amount));
}

export function spendKostyaShadowCharge(amount) {
  return setKostyaShadowChargePct(kostyaState.shadowChargePct - Math.max(0, amount));
}

export function getKostyaShadow() {
  return kostyaState.shadow;
}

export function setKostyaShadow(shadow) {
  kostyaState.shadow = shadow;
  if (!shadow) {
    kostyaState.shadowUpgradeHpBonus = 0;
    kostyaState.shadowAttackBonusDamage = 0;
  }
}

export function storeCollapsedKostyaShadowSnapshot(shadow) {
  if (!shadow?.isShadow) return null;
  kostyaState.lastCollapsedShadowSnapshot = {
    maxHp: Math.max(1, Math.floor(shadow.maxHp || 1)),
    maxShp: Math.max(0, Math.floor(shadow.maxShp || 0)),
    shadowStrengthPower: Math.max(0, Math.floor(kostyaState.shadowStrengthPower || 0)),
    shadowUpgradeHpBonus: Math.max(0, Math.floor(kostyaState.shadowUpgradeHpBonus || 0))
  };
  return { ...kostyaState.lastCollapsedShadowSnapshot };
}

export function getStoredKostyaCollapsedShadowSnapshot() {
  return kostyaState.lastCollapsedShadowSnapshot
    ? { ...kostyaState.lastCollapsedShadowSnapshot }
    : null;
}

export function getKostyaShadowStrengthPower() {
  return kostyaState.shadowStrengthPower;
}

export function getKostyaShadowUpgradeHpBonus() {
  return kostyaState.shadowUpgradeHpBonus;
}

export function getKostyaShadowAttackBonusDamage() {
  return Math.max(0, kostyaState.shadowAttackBonusDamage || 0);
}

export function setKostyaShadowStrengthPower(value) {
  kostyaState.shadowStrengthPower = Math.max(0, value);
}

export function setKostyaShadowUpgradeHpBonus(value) {
  kostyaState.shadowUpgradeHpBonus = Math.max(0, value);
}

export function setKostyaShadowAttackBonusDamage(value) {
  kostyaState.shadowAttackBonusDamage = Math.max(0, Math.floor(value));
}

export function addKostyaShadowAttackBonusDamage(amount) {
  setKostyaShadowAttackBonusDamage(getKostyaShadowAttackBonusDamage() + Math.max(0, Math.floor(amount)));
  return getKostyaShadowAttackBonusDamage();
}

export function convertKostyaShadowShpLossToHeal(shpLost, kostyaUnit) {
  const safeLoss = Math.max(0, Math.floor(shpLost));
  if (safeLoss <= 0 || !kostyaUnit) return 0;
  kostyaState.shadowHealProgressShp += safeLoss;
  const healAmount = Math.floor(kostyaState.shadowHealProgressShp / 2);
  kostyaState.shadowHealProgressShp %= 2;
  if (healAmount <= 0) return 0;
  const prevHp = kostyaUnit.hp || 0;
  kostyaUnit.hp = Math.min(kostyaUnit.maxHp || 1, prevHp + healAmount);
  return Math.max(0, (kostyaUnit.hp || 0) - prevHp);
}

export function isShadowHealthStealReady() {
  return kostyaState.shadowHealthStealReady;
}

export function setShadowHealthStealReady(value) {
  kostyaState.shadowHealthStealReady = !!value;
}

export function getKostyaStabBaseDamageFromState() {
  const { strongerBladeUpgrades } = getKostyaUpgrades();
  return getKostyaStabBaseDamage(strongerBladeUpgrades);
}

export function getKostyaStabGreenBonusDamageFromState() {
  const { strongerBladeUpgrades } = getKostyaUpgrades();
  return getKostyaStabGreenBonusDamage(strongerBladeUpgrades);
}

export function getKostyaShadowDeployedBonusDamageFromState() {
  return 0;
}

export function awardKostyaShadowChargeFromDamage(damageDealt, multiplier = 1, hasKostyaInParty = false) {
  if (!hasKostyaInParty) return 0;
  const scaled = Math.max(0, damageDealt) * multiplier;
  const { endarkementUpgrades } = getKostyaUpgrades();
  const gain = getKostyaShadowChargeGain(scaled, endarkementUpgrades);
  return addKostyaShadowCharge(gain);
}

function getKostyaHealthStealTier(level) {
  return Math.max(0, Math.floor((Math.max(1, level) - 1) / 10));
}

export function createKostyaShadow(ctx, overrides = {}) {
  const { noLightUpgrades } = getKostyaUpgrades();
  const kostyaUnit = ctx.getKostyaUnit?.();
  const maxShp = Math.max(0, Math.floor(overrides.maxShp ?? (20 + noLightUpgrades * 3 + getKostyaShadowUpgradeHpBonus())));
  const maxHp = Math.max(1, Math.floor(overrides.maxHp ?? (kostyaUnit?.maxHp || 25)));
  const hp = Math.max(1, Math.min(Math.floor(overrides.hp ?? (kostyaUnit?.hp || maxHp)), maxHp));
  const maxVhp = Math.max(0, Math.floor(overrides.maxVhp || 0));
  const vhp = Math.max(0, Math.min(Math.floor(overrides.vhp || 0), maxVhp));
  const created = {
    hp,
    maxHp,
    shp: maxShp,
    maxShp,
    vhp,
    maxVhp,
    maxSp: 0,
    sp: 0,
    def: 0,
    atk: 0,
    potions: 0,
    defending: false,
    animating: false,
    sprite: KOSTYA_SPRITES.shadow,
    idleFrames: getCachedKostyaShadowIdleFrames(),
    walkFrames: getCachedKostyaShadowWalkFrames(),
    attackFrames: getCachedKostyaShadowAttackFrames(),
    damagedFrames: getCachedKostyaShadowDamagedFrames(),
    isShadow: true
  };
  ctx.ensureStatuses(created);
  ctx.applyStatus(created, "stunned", 10, 1);
  const shadowPower = Math.max(0, Math.floor(overrides.shadowStrengthPower ?? getKostyaShadowStrengthPower()));
  if (shadowPower > 0) {
    ctx.applyStatus(created, "strenght", shadowPower, KOSTYA_SHADOW_STRENGTH_TURNS);
  }
  return created;
}

export function applyKostyaShadowLevelDecay(ctx) {
  const shadowPower = getKostyaShadowStrengthPower();
  if (shadowPower > 0) {
    setKostyaShadowStrengthPower(Math.max(0, shadowPower - 1));
  }
  const shadow = getKostyaShadow();
  const nextShadowPower = getKostyaShadowStrengthPower();
  if (shadow && nextShadowPower > 0) {
    ctx.applyStatus(shadow, "strenght", nextShadowPower, KOSTYA_SHADOW_STRENGTH_TURNS);
  }
}

export async function runKostyaShadowAutoAttack(ctx) {
  const shadow = getKostyaShadow();
  if (!shadow || !ctx.frontEnemy()) return;
  const target = ctx.frontEnemy();
  const storedBonus = getKostyaShadowAttackBonusDamage();
  const dmg = Math.max(1, getKostyaStabBaseDamageFromState() - target.def) + storedBonus;
  const walkFrames = shadow.walkFrames?.length ? shadow.walkFrames : getCachedKostyaShadowWalkFrames();
  const attackFrames = shadow.attackFrames?.length ? shadow.attackFrames : getCachedKostyaShadowAttackFrames();
  shadow.animating = true;
  ctx.playSfx?.("swordDrawn", 0.45);
  const stopLoop = ctx.startSpriteLoop?.("shadowSprite", walkFrames, 85) || (() => {});
  try {
    await ctx.dashToward("shadowChar", `enemy-entity-${target.id}`, 340, false);
  } finally {
    stopLoop();
  }
  spawnKostyaSlashFx("shadowSprite", "stab");
  await ctx.playFramesById("shadowSprite", attackFrames, 80);
  ctx.playSfx?.("attack", 0.5);
  const dealt = await ctx.applyDamageToEnemy(target, dmg, false, shadow);
  if (storedBonus > 0) setKostyaShadowAttackBonusDamage(0);
  if (dealt > 0) {
    const healPct = ctx.isDecaying(target) ? 0.2 : 0.1;
    const heal = Math.max(1, Math.ceil(dealt * healPct));
    shadow.shp = Math.min(shadow.maxShp, (shadow.shp || 0) + heal);
  }
  const stopReturnLoop = ctx.startSpriteLoop?.("shadowSprite", walkFrames, 85) || (() => {});
  try {
    await ctx.dashBack("shadowChar");
  } finally {
    stopReturnLoop();
    shadow.animating = false;
  }
  if (isShadowHealthStealReady() && dealt > 0) {
    const tier = getKostyaHealthStealTier(ctx.getLevel());
    const regenTurns = 3 + tier * 2;
    const kostyaUnit = ctx.getKostyaUnit();
    if (kostyaUnit) {
      kostyaUnit.hp = Math.min(kostyaUnit.maxHp, kostyaUnit.hp + dealt);
      ctx.applyStatus(kostyaUnit, "regen", 5, regenTurns);
    }
    setShadowHealthStealReady(false);
  }
}

function cropSpriteSheetCell(src, cellSize, row, col) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cellSize;
      canvas.height = cellSize;
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) {
        resolve(src);
        return;
      }
      canvasCtx.imageSmoothingEnabled = false;
      canvasCtx.clearRect(0, 0, cellSize, cellSize);
      canvasCtx.drawImage(
        image,
        col * cellSize,
        row * cellSize,
        cellSize,
        cellSize,
        0,
        0,
        cellSize,
        cellSize
      );
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => resolve(src);
    image.src = src;
  });
}

async function preloadKostyaIcons() {
  const iconEntries = Object.entries(KOSTYA_ICON_CELLS);
  const resolved = await Promise.all(iconEntries.map(async ([key, cell]) => ([
    key,
    await cropSpriteSheetCell(KOSTYA_SPRITES.iconSheet, KOSTYA_ICON_SIZE, cell.row, cell.col)
  ])));
  resolved.forEach(([key, value]) => {
    KOSTYA_SPRITES[key] = value;
  });
  KOSTYA_SPRITES.abilityHealthSteal = "";
  KOSTYA_SPRITES.templateAbilityIcon = "";
}

async function getKostyaSheetFrames(entry) {
  if (!entry) return [KOSTYA_SPRITES.base];
  if (typeof entry.col === "number") {
    return [await cropSpriteSheetCell(
      KOSTYA_SPRITES.spriteSheet,
      KOSTYA_FRAME_SIZE,
      entry.row,
      entry.col
    )];
  }
  const frames = [];
  for (let idx = 0; idx < entry.frameCount; idx += 1) {
    frames.push(await cropSpriteSheetCell(
      KOSTYA_SPRITES.spriteSheet,
      KOSTYA_FRAME_SIZE,
      entry.row,
      entry.startCol + idx
    ));
  }
  return frames;
}

function pingPongKostyaFrames(frames) {
  if (!Array.isArray(frames) || frames.length <= 1) return Array.isArray(frames) ? [...frames] : [];
  const backward = frames.slice(1, frames.length - 1).reverse();
  return [...frames, ...backward, frames[0]];
}

export async function getKostyaIdleFrames(ctx) {
  if (kostyaState.idleFramesCache) return kostyaState.idleFramesCache;
  if (!kostyaState.idleFramesPromise) {
    kostyaState.idleFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.idle).then((frames) => {
      const idleFrames = frames.length ? frames : [KOSTYA_SPRITES.base];
      kostyaState.idleFramesCache = idleFrames;
      return idleFrames;
    });
  }
  return kostyaState.idleFramesPromise;
}

export async function getKostyaThinkingFrames(ctx) {
  if (kostyaState.thinkingFramesCache) return kostyaState.thinkingFramesCache;
  if (!kostyaState.thinkingFramesPromise) {
    kostyaState.thinkingFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.thinking).then((frames) => {
      const thinkingFrames = frames.length ? frames : [KOSTYA_SPRITES.base];
      kostyaState.thinkingFramesCache = thinkingFrames;
      return thinkingFrames;
    });
  }
  return kostyaState.thinkingFramesPromise;
}

export async function getKostyaWalkingFrames(ctx) {
  if (kostyaState.walkingFramesCache) return kostyaState.walkingFramesCache;
  if (!kostyaState.walkingFramesPromise) {
    kostyaState.walkingFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.walking).then((frames) => {
      const walkingFrames = frames.length
        ? pingPongKostyaFrames(frames)
        : [KOSTYA_SPRITES.base];
      kostyaState.walkingFramesCache = walkingFrames;
      return walkingFrames;
    });
  }
  return kostyaState.walkingFramesPromise;
}

export async function getKostyaAttackFrames(ctx) {
  if (kostyaState.attackFramesCache) return kostyaState.attackFramesCache;
  if (!kostyaState.attackFramesPromise) {
    kostyaState.attackFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.attack).then((frames) => {
      const attackFrames = frames.length ? frames : [KOSTYA_SPRITES.base];
      kostyaState.attackFramesCache = attackFrames;
      return attackFrames;
    });
  }
  return kostyaState.attackFramesPromise;
}

export async function getKostyaParryFrames(ctx) {
  if (kostyaState.parryFramesCache) return kostyaState.parryFramesCache;
  if (!kostyaState.parryFramesPromise) {
    kostyaState.parryFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.dodgeCounterPose).then((frames) => {
      const parryFrames = frames.length ? [...frames, frames[0]] : [KOSTYA_SPRITES.base];
      kostyaState.parryFramesCache = parryFrames;
      return parryFrames;
    });
  }
  return kostyaState.parryFramesPromise;
}

export async function getKostyaCounterFxFrame() {
  const frames = await getKostyaSheetFrames(KOSTYA_SHEET_ROWS.counterFx);
  return frames[0] || KOSTYA_SPRITES.counterFx;
}

function ensureKostyaFxLayer() {
  let layer = document.getElementById("kostyaFxLayer");
  if (layer) return layer;
  layer = document.createElement("div");
  layer.id = "kostyaFxLayer";
  layer.style.position = "fixed";
  layer.style.left = "0";
  layer.style.top = "0";
  layer.style.width = "100vw";
  layer.style.height = "100vh";
  layer.style.pointerEvents = "none";
  layer.style.zIndex = "96";
  document.body.appendChild(layer);
  return layer;
}

function waitKostyaFrameDuration(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, scaleDuration(ms)));
}

async function playKostyaSpriteSequence(ctx, frames, {
  speedMs = 110,
  onFrame = null
} = {}) {
  const spriteId = ctx.activePlayerSpriteId?.();
  const sprite = ctx.getEl?.(spriteId);
  if (!sprite || !Array.isArray(frames) || !frames.length) return;
  ctx.setPlayerAnimating(true, spriteId);
  try {
    for (let idx = 0; idx < frames.length; idx += 1) {
      sprite.src = frames[idx];
      if (typeof onFrame === "function") onFrame(idx, frames[idx], sprite, spriteId);
      if (idx < frames.length - 1) {
        await waitKostyaFrameDuration(speedMs);
      }
    }
  } finally {
    ctx.setPlayerAnimating(false, "");
  }
}

function spawnKostyaCastGlow(spriteOrId, {
  color = "rgba(181, 93, 255, 0.72)",
  sizePx = 132,
  lifetimeMs = 440,
  yOffsetPx = -4
} = {}) {
  const sprite = typeof spriteOrId === "string"
    ? document.getElementById(spriteOrId)
    : spriteOrId;
  if (!sprite) return;
  const rect = sprite.getBoundingClientRect();
  const glow = document.createElement("div");
  glow.style.position = "fixed";
  glow.style.left = `${rect.left + rect.width * 0.5}px`;
  glow.style.top = `${rect.top + rect.height * 0.5 + yOffsetPx}px`;
  glow.style.width = `${sizePx}px`;
  glow.style.height = `${sizePx}px`;
  glow.style.borderRadius = "50%";
  glow.style.pointerEvents = "none";
  glow.style.opacity = "0.82";
  glow.style.transform = "translate(-50%, -50%) scale(0.64)";
  glow.style.background = `radial-gradient(circle, ${color} 0%, rgba(181, 93, 255, 0.32) 34%, rgba(181, 93, 255, 0.08) 58%, rgba(181, 93, 255, 0) 76%)`;
  glow.style.mixBlendMode = "screen";
  glow.style.filter = "blur(2px)";
  glow.style.transition = "opacity 380ms ease-out, transform 380ms ease-out";
  glow.style.zIndex = "97";
  ensureKostyaFxLayer().appendChild(glow);
  requestAnimationFrame(() => {
    glow.style.opacity = "0";
    glow.style.transform = "translate(-50%, -50%) scale(1.18)";
  });
  window.setTimeout(() => glow.remove(), scaleDuration(lifetimeMs));
}

export async function getKostyaShadowIdleFrames(ctx) {
  if (kostyaState.shadowIdleFramesCache) return kostyaState.shadowIdleFramesCache;
  if (!kostyaState.shadowIdleFramesPromise) {
    kostyaState.shadowIdleFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.shadowIdle).then((frames) => {
      const idleFrames = frames.length ? frames : [KOSTYA_SPRITES.shadow];
      kostyaState.shadowIdleFramesCache = idleFrames;
      return idleFrames;
    });
  }
  return kostyaState.shadowIdleFramesPromise;
}

export async function getKostyaShadowWalkFrames(ctx) {
  if (kostyaState.shadowWalkFramesCache) return kostyaState.shadowWalkFramesCache;
  if (!kostyaState.shadowWalkFramesPromise) {
    kostyaState.shadowWalkFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.shadowWalk).then((frames) => {
      const walkFrames = frames.length ? pingPongKostyaFrames(frames) : [KOSTYA_SPRITES.shadow];
      kostyaState.shadowWalkFramesCache = walkFrames;
      return walkFrames;
    });
  }
  return kostyaState.shadowWalkFramesPromise;
}

export async function getKostyaShadowAttackFrames(ctx) {
  if (kostyaState.shadowAttackFramesCache) return kostyaState.shadowAttackFramesCache;
  if (!kostyaState.shadowAttackFramesPromise) {
    kostyaState.shadowAttackFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.shadowAttack).then((frames) => {
      const attackFrames = frames.length ? frames : [KOSTYA_SPRITES.shadow];
      kostyaState.shadowAttackFramesCache = attackFrames;
      return attackFrames;
    });
  }
  return kostyaState.shadowAttackFramesPromise;
}

export async function getKostyaShadowDamagedFrames(ctx) {
  if (kostyaState.shadowDamagedFramesCache) return kostyaState.shadowDamagedFramesCache;
  if (!kostyaState.shadowDamagedFramesPromise) {
    kostyaState.shadowDamagedFramesPromise = getKostyaSheetFrames(KOSTYA_SHEET_ROWS.shadowDamaged).then((frames) => {
      const damagedFrames = frames.length ? [...frames, frames[0]] : [KOSTYA_SPRITES.shadow];
      kostyaState.shadowDamagedFramesCache = damagedFrames;
      return damagedFrames;
    });
  }
  return kostyaState.shadowDamagedFramesPromise;
}

export function getCachedKostyaIdleFrames() {
  return kostyaState.idleFramesCache && kostyaState.idleFramesCache.length
    ? kostyaState.idleFramesCache
    : [KOSTYA_SPRITES.base];
}

export function selectKostyaIdleFrames({ sprites, isActiveTurn, actionsLocked }) {
  if (!sprites) return [KOSTYA_SPRITES.base];
  if (isActiveTurn && !actionsLocked) {
    if (Array.isArray(sprites.thinking) && sprites.thinking.length) return sprites.thinking;
  }
  if (Array.isArray(sprites.idle) && sprites.idle.length) return sprites.idle;
  return [KOSTYA_SPRITES.base];
}

export function getCachedKostyaShadowIdleFrames() {
  return kostyaState.shadowIdleFramesCache && kostyaState.shadowIdleFramesCache.length
    ? kostyaState.shadowIdleFramesCache
    : [KOSTYA_SPRITES.shadow];
}

export function getCachedKostyaShadowWalkFrames() {
  return kostyaState.shadowWalkFramesCache && kostyaState.shadowWalkFramesCache.length
    ? kostyaState.shadowWalkFramesCache
    : getCachedKostyaShadowIdleFrames();
}

export function getCachedKostyaShadowAttackFrames() {
  return kostyaState.shadowAttackFramesCache && kostyaState.shadowAttackFramesCache.length
    ? kostyaState.shadowAttackFramesCache
    : [KOSTYA_SPRITES.shadow];
}

export function getCachedKostyaShadowDamagedFrames() {
  return kostyaState.shadowDamagedFramesCache && kostyaState.shadowDamagedFramesCache.length
    ? kostyaState.shadowDamagedFramesCache
    : [KOSTYA_SPRITES.shadow];
}

export async function preloadKostyaVisuals(ctx) {
  const [idleFrames, thinkingFrames, walkingFrames, attackFrames, damagedFrame, collapsedFrame, parryFrames, shadowFrames, shadowWalkFrames, shadowAttackFrames, shadowDamagedFrames, slashFxFrame, stabFxFrame, counterFxFrame] = await Promise.all([
    preloadKostyaIcons(),
    getKostyaIdleFrames(ctx),
    getKostyaThinkingFrames(ctx),
    getKostyaWalkingFrames(ctx),
    getKostyaAttackFrames(ctx),
    getKostyaSheetFrames(KOSTYA_SHEET_ROWS.damaged),
    getKostyaSheetFrames(KOSTYA_SHEET_ROWS.collapsed),
    getKostyaParryFrames(ctx),
    getKostyaShadowIdleFrames(ctx),
    getKostyaShadowWalkFrames(ctx),
    getKostyaShadowAttackFrames(ctx),
    getKostyaShadowDamagedFrames(ctx),
    getKostyaSheetFrames(KOSTYA_SHEET_ROWS.slashFx),
    getKostyaSheetFrames(KOSTYA_SHEET_ROWS.stabFx),
    getKostyaSheetFrames(KOSTYA_SHEET_ROWS.counterFx)
  ]).then((results) => results.slice(1));
  if (idleFrames.length) ctx.playerSprites.kostya.idle = idleFrames;
  if (thinkingFrames.length) ctx.playerSprites.kostya.thinking = thinkingFrames;
  if (walkingFrames.length) ctx.playerSprites.kostya.walk = walkingFrames;
  if (attackFrames.length) ctx.playerSprites.kostya.attack = attackFrames;
  if (parryFrames.length) ctx.playerSprites.kostya.parry = parryFrames;
  ctx.playerSprites.kostya.damaged = damagedFrame.length ? damagedFrame : [KOSTYA_SPRITES.base];
  ctx.playerSprites.kostya.collapsed = collapsedFrame.length ? collapsedFrame : [KOSTYA_SPRITES.base];
  if (shadowFrames.length) kostyaState.shadowIdleFramesCache = shadowFrames;
  if (shadowWalkFrames.length) kostyaState.shadowWalkFramesCache = shadowWalkFrames;
  if (shadowAttackFrames.length) kostyaState.shadowAttackFramesCache = shadowAttackFrames;
  if (shadowDamagedFrames.length) kostyaState.shadowDamagedFramesCache = shadowDamagedFrames;
  KOSTYA_SPRITES.base = idleFrames[0] || KOSTYA_SPRITES.base;
  KOSTYA_SPRITES.damaged = damagedFrame[0] || KOSTYA_SPRITES.damaged;
  KOSTYA_SPRITES.collapsed = collapsedFrame[0] || KOSTYA_SPRITES.collapsed;
  KOSTYA_SPRITES.dodgeCounterPose = parryFrames[0] || KOSTYA_SPRITES.dodgeCounterPose;
  KOSTYA_SPRITES.shadow = shadowFrames[0] || KOSTYA_SPRITES.shadow;
  KOSTYA_SPRITES.slashFx = slashFxFrame[0] || KOSTYA_SPRITES.slashFx;
  KOSTYA_SPRITES.stabFx = stabFxFrame[0] || KOSTYA_SPRITES.stabFx;
  KOSTYA_SPRITES.counterFx = counterFxFrame[0] || KOSTYA_SPRITES.counterFx;
}

export function renderKostyaCombatActions(ctx) {
  const abilities = getKostyaAbilities(getKostyaCurrentUnlocks());
  ctx.getEl("actions").innerHTML = abilities.map((ability) => ctx.abilityButtonHtml(ability)).join("");

  const controller = ensureKostyaAbilityController(ctx);
  const player = ctx.getPlayer();
  const shadow = getKostyaShadow();

  const bindAbility = (id, handler, disabled, locked = disabled) => {
    const button = ctx.getEl(id);
    if (!button) return;
    const ability = abilities.find((entry) => entry.id === id) || null;
    button.onclick = () => {
      ctx.setQueuedActionPreview?.(ability);
      return handler();
    };
    button.disabled = !!disabled;
    ctx.setAbilityLocked(button, !!locked);
  };

  bindAbility("stab", controller.stab, !ctx.frontEnemy(), false);
  bindAbility("slash", controller.slash, player.sp < 12 || !ctx.frontEnemy(), player.sp < 12);
  bindAbility("dark", controller.darknessCalling, player.sp < 42 || kostyaState.shadowChargePct < 100 || !!shadow, player.sp < 42 || kostyaState.shadowChargePct < 100 || !!shadow);
  bindAbility("lunge", controller.lunge, player.sp < 18 || !ctx.getEnemies().length, player.sp < 18);
  bindAbility("decayingStab", controller.decayingStab, player.sp < 16 || kostyaState.shadowChargePct < 6 || !ctx.frontEnemy(), player.sp < 16 || kostyaState.shadowChargePct < 6);
  bindAbility("sharpTip", controller.sharpTip, player.sp < 32 || !ctx.frontEnemy(), player.sp < 32);
  bindAbility("transformation", controller.transformation, player.sp < 28 || kostyaState.shadowChargePct < 16 || !shadow, player.sp < 28 || kostyaState.shadowChargePct < 16 || !shadow);
  bindAbility("cleave", controller.cleave, player.sp < 40 || !ctx.frontEnemy(), player.sp < 40);
  bindAbility("heartyRecovery", controller.heartyRecovery, player.sp < 26 || getKostyaShadowChargePct() < 16 || !shadow || player.hp <= 1, player.sp < 26 || getKostyaShadowChargePct() < 16 || !shadow);
  bindAbility("shadowRecast", controller.shadowRecast, player.sp < 50 || kostyaState.shadowChargePct < 36 || !!shadow || !getStoredKostyaCollapsedShadowSnapshot() || player.hp <= 15, player.sp < 50 || kostyaState.shadowChargePct < 36 || !!shadow);
  bindAbility("darkerLayer", controller.darkerLayer, player.sp < 64 || kostyaState.shadowChargePct < 36 || !shadow || (shadow.vhp || 0) > 0, player.sp < 64 || kostyaState.shadowChargePct < 36 || !shadow);
  bindAbility("shadowStrengthen", controller.shadowStrengthen, player.sp < 50 || kostyaState.shadowChargePct < 100 || !shadow, player.sp < 50 || kostyaState.shadowChargePct < 100 || !shadow);

  const hoverHints = getKostyaHoverHints(ctx);
  Object.entries(hoverHints).forEach(([id, text]) => {
    const btn = ctx.getEl(id);
    if (!btn) return;
    ctx.bindActionButtonHint(btn, text);
  });
  ctx.updateAbilityGridScale();
  ctx.resetActionSelection();
}

function awardKostyaSpFromDamage(damageDealt, ctx) {
  if (!ctx.isKostya()) return;
  const totalGain = getKostyaSpGainFromDamage(damageDealt);
  if (totalGain <= 0) return;
  const player = ctx.getPlayer();
  player.sp = Math.min(player.maxSp, player.sp + totalGain);
}

async function animateKostyaAdvance(ctx, targetId, durationMs = 340) {
  const spriteId = ctx.activePlayerSpriteId();
  const walkFrames = await getKostyaWalkingFrames(ctx);
  ctx.setPlayerAnimating(true, spriteId);
  const stopLoop = ctx.startSpriteLoop(spriteId, walkFrames, 85);
  try {
    await ctx.dashToward(ctx.activePlayerCharId(), targetId, durationMs, false);
  } finally {
    stopLoop();
    ctx.setPlayerAnimating(false, "");
  }
}

async function animateKostyaRetreat(ctx, durationMs = 260) {
  const spriteId = ctx.activePlayerSpriteId();
  const walkFrames = await getKostyaWalkingFrames(ctx);
  ctx.setPlayerAnimating(true, spriteId);
  const stopLoop = ctx.startSpriteLoop(spriteId, walkFrames, 85);
  try {
    await ctx.dashBack(ctx.activePlayerCharId(), durationMs);
  } finally {
    stopLoop();
    ctx.setPlayerAnimating(false, "");
  }
}

async function holdKostyaAttackStartFrameDuringSkillCheck(ctx, runCheck) {
  const spriteId = ctx.activePlayerSpriteId();
  const sprite = ctx.getEl?.(spriteId);
  const attackFrames = await getKostyaAttackFrames(ctx);
  const firstFrame = attackFrames[0] || KOSTYA_SPRITES.base;
  ctx.setPlayerAnimating(true, spriteId);
  if (sprite) sprite.src = firstFrame;
  try {
    return await runCheck();
  } finally {
    ctx.setPlayerAnimating(false, "");
  }
}

export function spawnKostyaSlashFx(spriteOrId, variant = "slash", srcOverride = "", useFixedLayer = false) {
  const sprite = typeof spriteOrId === "string"
    ? document.getElementById(spriteOrId)
    : spriteOrId;
  const host = sprite?.parentElement;
  if (!sprite || (!host && !useFixedLayer)) return;

  let slashSrc = srcOverride || KOSTYA_SPRITES.slashFx;
  let xOffsetPx = 44;
  let sizePx = 108;
  let lifetimeMs = 520;
  let zIndex = "3";
  if (!srcOverride && variant === "stab") slashSrc = KOSTYA_SPRITES.stabFx;
  if (variant === "counter") {
    if (!srcOverride) slashSrc = KOSTYA_SPRITES.counterFx;
    xOffsetPx = 56;
    sizePx = 116;
    lifetimeMs = 620;
    zIndex = "4";
  }

  const slash = document.createElement("img");
  slash.src = slashSrc;
  slash.alt = "";
  slash.decoding = "async";
  slash.style.position = useFixedLayer ? "fixed" : "absolute";
  if (useFixedLayer) {
    const rect = sprite.getBoundingClientRect();
    slash.style.left = `${rect.left + rect.width * 0.5 + xOffsetPx}px`;
    slash.style.top = `${rect.top + rect.height * 0.5}px`;
  } else {
    slash.style.left = `calc(50% + ${xOffsetPx}px)`;
    slash.style.top = "50%";
  }
  slash.style.width = `${sizePx}px`;
  slash.style.height = `${sizePx}px`;
  slash.style.pointerEvents = "none";
  slash.style.imageRendering = "pixelated";
  slash.style.opacity = "0.96";
  slash.style.transform = "translate(-50%, -50%) scale(0.82)";
  slash.style.transformOrigin = "center";
  slash.style.transition = "opacity 440ms ease-out, transform 440ms ease-out";
  slash.style.zIndex = zIndex;
  (useFixedLayer ? ensureKostyaFxLayer() : host).appendChild(slash);

  requestAnimationFrame(() => {
    slash.style.opacity = "0";
    slash.style.transform = "translate(-50%, -50%) scale(1.06)";
  });

  window.setTimeout(() => {
    slash.remove();
  }, lifetimeMs);
}

async function playKostyaSwordStrike(ctx, variant = "slash") {
  spawnKostyaSlashFx(ctx.activePlayerSpriteId?.(), variant);
  await ctx.animatePlayerAttack();
}

function livingEnemies(ctx) {
  return (ctx.getEnemies?.() || []).filter((enemy) => enemy && enemy.hp > 0);
}

function refreshKostyaUi(ctx) {
  ctx.refreshUI?.();
  ctx.renderCombatActions?.();
}

function safeKostyaAction(ctx, action) {
  return async () => {
    if (ctx.isActionsLocked?.()) return;
    try {
      await action();
    } catch (err) {
      console.error("Kostya ability failed:", err);
      ctx.addLog?.("Kostya ability failed.", "fatal-red");
      ctx.setActionsLocked?.(false);
    }
  };
}

async function runKostyaSwordSkillCheck(ctx, options = {}) {
  ctx.positionSkillCheckBelow(ctx.activePlayerCharId());
  ctx.playSfx("swordDrawn", 0.5);
  return holdKostyaAttackStartFrameDuringSkillCheck(ctx, () => ctx.runSkillCheck({
    yellowEnabled: false,
    greenWidth: options.greenWidth ?? 0.165,
    holdFillDurationMs: options.holdFillDurationMs ?? 900,
    hintHtml: options.hintHtml ?? 'Release SPACE on <span class="skill-hint-green">green</span> for bonus!'
  }));
}

async function runKostyaSwordAttack(ctx, target, {
  variant = "stab",
  bonusOnGreen = true,
  damageMultiplier = 1,
  ignoreResistance = false,
  skillCheckOptions = null,
  afterHit = null
} = {}) {
  if (!target) return { success: false, dealt: 0 };

  await animateKostyaAdvance(ctx, `enemy-entity-${target.id}`, 340);
  const { success } = await runKostyaSwordSkillCheck(ctx, skillCheckOptions || {});

  await playKostyaSwordStrike(ctx, variant);
  ctx.playSfx("attack", 0.6);

  let damage = getKostyaStabBaseDamageFromState() + getKostyaShadowDeployedBonusDamageFromState();
  if (success && bonusOnGreen) {
    damage += getKostyaStabGreenBonusDamageFromState();
    ctx.setPlayerSkillFeedback("Great!", "great");
  }
  damage = Math.max(1, Math.ceil(damage * damageMultiplier));

  const dealt = await ctx.applyDamageToEnemy(
    target,
    damage,
    ignoreResistance,
    ctx.getPlayer?.(),
    ignoreResistance ? { ignoreResistance: true } : null
  );

  if (typeof afterHit === "function") {
    await afterHit({ success, target, dealt, damage });
  }

  await animateKostyaRetreat(ctx);
  awardKostyaShadowChargeFromDamage(
    dealt,
    ctx.shadowChargeMultiplierForTarget(target),
    ctx.hasKostyaInParty()
  );
  awardKostyaSpFromDamage(dealt, ctx);
  return { success, dealt };
}

function hasKostyaInParty(ctx) {
  return ctx.isDuoMode?.()
    ? ctx.duoCharacters?.includes("kostya")
    : ctx.isKostya?.();
}

async function withKostyaFocus(ctx, run) {
  if (!ctx.isDuoMode?.()) {
    await run();
    return;
  }
  const idx = ctx.duoCharacters?.findIndex((key) => key === "kostya") ?? -1;
  if (idx < 0) {
    await run();
    return;
  }
  const prev = ctx.isKostya?.() ? idx : null;
  if (ctx.switchToDuoPlayer && idx >= 0) ctx.switchToDuoPlayer(idx, true);
  await run();
  if (prev === null && ctx.switchToDuoPlayer) ctx.switchToDuoPlayer(0, true);
}

export async function unlockKostyaFirstEvolutionAfterBoss(clearedLevel, ctx) {
  if (!hasKostyaInParty(ctx)) return;
  if (clearedLevel !== 10) return;
  if (kostyaState.lungeUnlocked || kostyaState.decayingStabUnlocked) return;

  await withKostyaFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Blade Upgrade",
      subtitle: "Choose one new strike.",
      options: [
        {
          id: "upLunge",
          name: "Lunge",
          icon: KOSTYA_SPRITES.abilityLunge,
          description: "Pick any enemy.",
          cost: { sp: 18 }
        },
        {
          id: "upDecay",
          name: "Decaying Stab",
          icon: KOSTYA_SPRITES.abilityDecay,
          description: "Trade green damage for Decay.",
          cost: { sp: 16, sc: 6 }
        }
      ],
      requireConfirm: true
    });
    if (choice === "upLunge") kostyaState.lungeUnlocked = true;
    if (choice === "upDecay") kostyaState.decayingStabUnlocked = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function unlockKostyaSecondEvolutionAfterBoss(clearedLevel, ctx) {
  if (!hasKostyaInParty(ctx)) return;
  if (clearedLevel !== 20) return;
  if (kostyaState.sharpTipUnlocked || kostyaState.transformationUnlocked) return;

  await withKostyaFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Shadow Upgrade",
      subtitle: "Choose one finisher.",
      options: [
        {
          id: "upSharpTip",
          name: "Sharp Tip",
          icon: KOSTYA_SPRITES.abilitySharpTip,
          description: "+50% sword damage. Ignores block.",
          cost: { sp: 32 }
        },
        {
          id: "upTransform",
          name: "Transformation",
          icon: KOSTYA_SPRITES.abilityTransform,
          description: "Turn Shadow SHP into attack damage.",
          cost: { sp: 28, sc: 16 }
        }
      ],
      requireConfirm: true
    });
    if (choice === "upSharpTip") kostyaState.sharpTipUnlocked = true;
    if (choice === "upTransform") kostyaState.transformationUnlocked = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function unlockKostyaThirdEvolutionAfterBoss(clearedLevel, ctx) {
  if (!hasKostyaInParty(ctx)) return;
  if (clearedLevel !== 30) return;
  if (kostyaState.cleaveUnlocked || kostyaState.heartyRecoveryUnlocked) return;

  await withKostyaFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Final Blade Upgrade",
      subtitle: "Choose one advanced technique.",
      options: [
        {
          id: "upCleave",
          name: "Cleave",
          icon: KOSTYA_SPRITES.abilityCleave,
          description: "Harder green. 4x base damage on green.",
          cost: { sp: 40 }
        },
        {
          id: "upHeartyRecovery",
          name: "Hearty Recovery",
          icon: KOSTYA_SPRITES.abilityHeartyRecovery,
          description: "Spend HP to restore double SHP.",
          cost: { sp: 26, sc: 16 }
        }
      ],
      requireConfirm: true
    });
    if (choice === "upCleave") kostyaState.cleaveUnlocked = true;
    if (choice === "upHeartyRecovery") kostyaState.heartyRecoveryUnlocked = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function unlockKostyaFourthEvolutionAfterBoss(clearedLevel, ctx) {
  if (!hasKostyaInParty(ctx)) return;
  if (clearedLevel !== 40) return;
  if (kostyaState.shadowRecastUnlocked || kostyaState.darkerLayerUnlocked) return;

  await withKostyaFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Shadow Mastery",
      subtitle: "Choose one forbidden rite.",
      options: [
        {
          id: "upShadowRecast",
          name: "Shadow Recast",
          icon: KOSTYA_SPRITES.abilityShadowRecast,
          description: "Lose 15 HP to resummon Shadow.",
          cost: { sp: 50, sc: 36 }
        },
        {
          id: "upDarkerLayer",
          name: "Darker Layer",
          icon: KOSTYA_SPRITES.abilityDarkerLayer,
          description: "Give Shadow a purple life layer.",
          cost: { sp: 64, sc: 36 }
        }
      ],
      requireConfirm: true
    });
    if (choice === "upShadowRecast") kostyaState.shadowRecastUnlocked = true;
    if (choice === "upDarkerLayer") kostyaState.darkerLayerUnlocked = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function chooseKostyaLeftoverEvolutionBeforeFinalBoss(ctx) {
  if (!hasKostyaInParty(ctx)) return;
  const options = [];

  if (!kostyaState.lungeUnlocked) {
    options.push({
      id: "leftoverLunge",
      name: "Lunge",
      icon: KOSTYA_SPRITES.abilityLunge,
      description: "Pick any enemy.",
      cost: { sp: 18 }
    });
  }
  if (!kostyaState.decayingStabUnlocked) {
    options.push({
      id: "leftoverDecay",
      name: "Decaying Stab",
      icon: KOSTYA_SPRITES.abilityDecay,
      description: "Trade green damage for Decay.",
      cost: { sp: 16, sc: 6 }
    });
  }
  if (!kostyaState.sharpTipUnlocked) {
    options.push({
      id: "leftoverSharpTip",
      name: "Sharp Tip",
      icon: KOSTYA_SPRITES.abilitySharpTip,
      description: "+50% sword damage. Ignores block.",
      cost: { sp: 32 }
    });
  }
  if (!kostyaState.transformationUnlocked) {
    options.push({
      id: "leftoverTransform",
      name: "Transformation",
      icon: KOSTYA_SPRITES.abilityTransform,
      description: "Turn Shadow SHP into attack damage.",
      cost: { sp: 28, sc: 16 }
    });
  }
  if (!kostyaState.cleaveUnlocked) {
    options.push({
      id: "leftoverCleave",
      name: "Cleave",
      icon: KOSTYA_SPRITES.abilityCleave,
      description: "Harder green. 4x base damage on green.",
      cost: { sp: 40 }
    });
  }
  if (!kostyaState.heartyRecoveryUnlocked) {
    options.push({
      id: "leftoverHeartyRecovery",
      name: "Hearty Recovery",
      icon: KOSTYA_SPRITES.abilityHeartyRecovery,
      description: "Spend HP to restore double SHP.",
      cost: { sp: 26, sc: 16 }
    });
  }
  if (!kostyaState.shadowRecastUnlocked) {
    options.push({
      id: "leftoverShadowRecast",
      name: "Shadow Recast",
      icon: KOSTYA_SPRITES.abilityShadowRecast,
      description: "Lose 15 HP to resummon Shadow.",
      cost: { sp: 50, sc: 36 }
    });
  }
  if (!kostyaState.darkerLayerUnlocked) {
    options.push({
      id: "leftoverDarkerLayer",
      name: "Darker Layer",
      icon: KOSTYA_SPRITES.abilityDarkerLayer,
      description: "Give Shadow a purple life layer.",
      cost: { sp: 64, sc: 36 }
    });
  }

  if (!options.length) return;

  await withKostyaFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Last Chance Upgrade",
      subtitle: "Choose one leftover boss skill before the final battle.",
      options,
      requireConfirm: true
    });
    if (choice === "leftoverLunge") kostyaState.lungeUnlocked = true;
    if (choice === "leftoverDecay") kostyaState.decayingStabUnlocked = true;
    if (choice === "leftoverSharpTip") kostyaState.sharpTipUnlocked = true;
    if (choice === "leftoverTransform") kostyaState.transformationUnlocked = true;
    if (choice === "leftoverCleave") kostyaState.cleaveUnlocked = true;
    if (choice === "leftoverHeartyRecovery") kostyaState.heartyRecoveryUnlocked = true;
    if (choice === "leftoverShadowRecast") kostyaState.shadowRecastUnlocked = true;
    if (choice === "leftoverDarkerLayer") kostyaState.darkerLayerUnlocked = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export function createKostyaAbilityController(ctx) {
  const queueOrRun = async (run) => {
    if (ctx.queuePlayerTurnAction?.(run)) return;
    await run();
  };

  const queuePreparedOrRun = async (ability, prepare, run) => {
    const prepared = await prepare();
    if (!prepared) return;
    const queuedPlayerIndex = typeof ctx.getActiveDuoPlayer === "function" ? ctx.getActiveDuoPlayer() : null;
    if (ctx.queuePlayerTurnAction?.({
      execute: () => run(prepared),
      display: ability
        ? {
          name: ability.name,
          icon: ability.icon || "",
          playerIndex: queuedPlayerIndex
        }
        : null
    })) return;
    await run(prepared);
  };

  const stab = safeKostyaAction(ctx, async () => {
    if (!ctx.frontEnemy()) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      const target = ctx.frontEnemy();
      if (!target) return;
      ctx.logCombatUse?.("Kostya", "Sword", kostyaEnemyLabel(ctx, target));
      await runKostyaSwordAttack(ctx, target, { variant: "stab" });
      await ctx.resolvePostPlayerAction();
    });
  });

  const slash = safeKostyaAction(ctx, async () => {
    if (!ctx.frontEnemy()) return;
    const player = ctx.getPlayer();
    if (player.sp < 12) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 12;
      const target = ctx.frontEnemy();
      if (!target) return;

      await animateKostyaAdvance(ctx, `enemy-entity-${target.id}`, 340);
      ctx.positionSkillCheckBelow(ctx.activePlayerCharId());
      ctx.playSfx("swordDrawn", 0.5);
      const { success } = await holdKostyaAttackStartFrameDuringSkillCheck(ctx, () => ctx.runSkillCheck({
        yellowEnabled: false,
        greenWidth: 0.165,
        hintHtml: 'Release SPACE on <span class="skill-hint-green">green</span> for bonus!'
      }));

      const splashTarget = ctx.getEnemies().find((enemy) => enemy.id !== target.id);
      if (splashTarget) ctx.logCombatUse?.("Kostya", "Slash");
      else ctx.logCombatUse?.("Kostya", "Slash", kostyaEnemyLabel(ctx, target));
      await playKostyaSwordStrike(ctx, "slash");
      ctx.playSfx("attack", 0.6);

      let damage = getKostyaStabBaseDamageFromState() + getKostyaShadowDeployedBonusDamageFromState();
      if (success) {
        damage += getKostyaStabGreenBonusDamageFromState();
        ctx.setPlayerSkillFeedback("Great!", "great");
      }

      const dealtFront = await ctx.applyDamageToEnemy(target, damage);
      awardKostyaShadowChargeFromDamage(
        dealtFront,
        ctx.shadowChargeMultiplierForTarget(target),
        ctx.hasKostyaInParty()
      );
      let totalDealt = dealtFront;
      const behind = ctx.getEnemies().find((enemy) => enemy.id !== target.id);
      if (behind && dealtFront > 0) {
        const splashDamage = Math.max(1, Math.ceil(dealtFront * 0.5));
        const dealtBehind = await ctx.applyDamageToEnemy(behind, splashDamage);
        totalDealt += dealtBehind;
        awardKostyaShadowChargeFromDamage(
          dealtBehind,
          ctx.shadowChargeMultiplierForTarget(behind),
          ctx.hasKostyaInParty()
        );
      }
      await animateKostyaRetreat(ctx);
      awardKostyaSpFromDamage(totalDealt, ctx);
      await ctx.resolvePostPlayerAction();
    });
  });

  const lunge = safeKostyaAction(ctx, async () => {
    const player = ctx.getPlayer();
    if (player.sp < 18 || !livingEnemies(ctx).length) return;
    ctx.setPlayerSkillFeedback?.();
    await queuePreparedOrRun(
      getKostyaAbilities(getKostyaCurrentUnlocks()).find((ability) => ability.id === "lunge") || { name: "Lunge", icon: "" },
      () => ctx.chooseEnemyTarget?.("Lunge"),
      async (target) => {
        ctx.setActionsLocked(true);
        player.sp -= 18;
        ctx.logCombatUse?.("Kostya", "Lunge", kostyaEnemyLabel(ctx, target));
        await runKostyaSwordAttack(ctx, target, { variant: "stab" });
        await ctx.resolvePostPlayerAction();
      }
    );
  });

  const decayingStab = safeKostyaAction(ctx, async () => {
    if (!ctx.frontEnemy()) return;
    const player = ctx.getPlayer();
    if (player.sp < 16 || getKostyaShadowChargePct() < 6) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 16;
      spendKostyaShadowCharge(6);
      const target = ctx.frontEnemy();
      if (!target) return;
      ctx.logCombatUse?.("Kostya", "Decaying Stab", kostyaEnemyLabel(ctx, target));
      await runKostyaSwordAttack(ctx, target, {
        variant: "stab",
        bonusOnGreen: false,
        afterHit: ({ success }) => {
          const decayPower = getKostyaDecayPowerForLevel(ctx.getLevel?.() || 1, success);
          ctx.applyStatus?.(target, "decay", decayPower, 3);
          ctx.setPlayerSkillFeedback?.(`Decay ${decayPower}`, success ? "great" : "good");
        }
      });
      await ctx.resolvePostPlayerAction();
    });
  });

  const sharpTip = safeKostyaAction(ctx, async () => {
    if (!ctx.frontEnemy()) return;
    const player = ctx.getPlayer();
    if (player.sp < 32) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 32;
      const target = ctx.frontEnemy();
      if (!target) return;
      ctx.logCombatUse?.("Kostya", "Sharp Tip", kostyaEnemyLabel(ctx, target));
      await runKostyaSwordAttack(ctx, target, {
        variant: "stab",
        damageMultiplier: 1.5,
        ignoreResistance: true
      });
      await ctx.resolvePostPlayerAction();
    });
  });

  const cleave = safeKostyaAction(ctx, async () => {
    if (!ctx.frontEnemy()) return;
    const player = ctx.getPlayer();
    if (player.sp < 40) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 40;
      const target = ctx.frontEnemy();
      if (!target) return;
      ctx.logCombatUse?.("Kostya", "Cleave", kostyaEnemyLabel(ctx, target));
      await runKostyaSwordAttack(ctx, target, {
        variant: "slash",
        bonusOnGreen: false,
        skillCheckOptions: {
          greenWidth: 0.115,
          holdFillDurationMs: 760,
          hintHtml: 'Release SPACE on the tighter <span class="skill-hint-green">green</span> for Cleave!'
        },
        afterHit: async ({ success, target: hitTarget }) => {
          if (!success) return;
          const baseDamage = getKostyaStabBaseDamageFromState();
          const extraDamage = Math.max(0, baseDamage * 3);
          const dealtExtra = await ctx.applyDamageToEnemy(hitTarget, extraDamage);
          if (dealtExtra > 0) {
            awardKostyaShadowChargeFromDamage(
              dealtExtra,
              ctx.shadowChargeMultiplierForTarget(hitTarget),
              ctx.hasKostyaInParty()
            );
            awardKostyaSpFromDamage(dealtExtra, ctx);
          }
          ctx.setPlayerSkillFeedback?.("Cleave!", "great");
        }
      });
      await ctx.resolvePostPlayerAction();
    });
  });

  const darknessCalling = safeKostyaAction(ctx, async () => {
    const player = ctx.getPlayer();
    if (player.sp < 42) return;
    if (getKostyaShadowChargePct() < 100) return;
    if (getKostyaShadow()) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 42;
      setKostyaShadowChargePct(0);
      const shadowCastFrames = await getKostyaSheetFrames(KOSTYA_SHEET_ROWS.shadowCast);
      if (shadowCastFrames.length >= 2) {
        await playKostyaSpriteSequence(ctx, [
          shadowCastFrames[0],
          shadowCastFrames[0],
          shadowCastFrames[1],
          shadowCastFrames[1]
        ], {
          speedMs: 95,
          onFrame: (idx, _frame, _sprite, spriteId) => {
            if (idx === 2) spawnKostyaCastGlow(spriteId);
          }
        });
      }
      ctx.logCombatSummon?.("Kostya", "Shadow");
      const shadow = createKostyaShadow(ctx);
      setKostyaShadow(shadow);
      ctx.refreshUI();
      await ctx.animateSummonArrival?.("shadowChar", {
        spriteId: "shadowSprite",
        walkFrames: shadow.walkFrames || [],
        from: "left",
        indicator: "SHADOW"
      });
      ctx.startIdleAnimations();
      ctx.renderCombatActions();
      await ctx.resolvePostPlayerAction();
    });
  });

  const transformation = safeKostyaAction(ctx, async () => {
    const shadow = getKostyaShadow();
    const player = ctx.getPlayer();
    if (!shadow || player.sp < 28 || getKostyaShadowChargePct() < 16) return;
    ctx.setActionsLocked(true);
    ctx.setPlayerSkillFeedback();
    player.sp -= 28;
    spendKostyaShadowCharge(16);
    const transformationFrame = (await getKostyaSheetFrames(KOSTYA_SHEET_ROWS.transformationCast))[0];
    if (transformationFrame) {
      ctx.playSfx?.("aceCast", 0.56);
      ctx.playSfx?.("summon", 0.58);
      await playKostyaSpriteSequence(ctx, [
        transformationFrame,
        transformationFrame,
        transformationFrame,
        transformationFrame
      ], { speedMs: 90 });
    }
    const consumedShp = Math.max(0, shadow.shp || 0);
    shadow.shp = 0;
    addKostyaShadowAttackBonusDamage(consumedShp);
    ctx.healKostyaFromShadowShpLoss?.(consumedShp);
    ctx.logCombatCast?.("Kostya", "Transformation");
    refreshKostyaUi(ctx);
    ctx.startIdleAnimations?.();
    ctx.setActionsLocked(false);
  });

  const heartyRecovery = safeKostyaAction(ctx, async () => {
    const shadow = getKostyaShadow();
    const player = ctx.getPlayer();
    if (!shadow || player.sp < 26 || getKostyaShadowChargePct() < 16 || player.hp <= 1) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 26;
      spendKostyaShadowCharge(16);
      const hpSpent = Math.min(20, Math.max(0, (player.hp || 0) - 1));
      if (hpSpent <= 0) {
        ctx.setActionsLocked(false);
        return;
      }
      player.hp = Math.max(1, player.hp - hpSpent);
      const shpGain = hpSpent * 2;
      shadow.shp = Math.min(shadow.maxShp || shpGain, (shadow.shp || 0) + shpGain);
      ctx.logCombatCast?.("Kostya", "Hearty Recovery", "Shadow");
      refreshKostyaUi(ctx);
      await ctx.resolvePostPlayerAction();
    });
  });

  const shadowRecast = safeKostyaAction(ctx, async () => {
    const player = ctx.getPlayer();
    const snapshot = getStoredKostyaCollapsedShadowSnapshot();
    if (getKostyaShadow() || !snapshot || player.sp < 50 || getKostyaShadowChargePct() < 36 || player.hp <= 15) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 50;
      spendKostyaShadowCharge(36);
      player.hp = Math.max(0, player.hp - 15);
      const shadowRecastFrames = await getKostyaSheetFrames(KOSTYA_SHEET_ROWS.shadowRecastCast);
      if (shadowRecastFrames.length >= 2) {
        await playKostyaSpriteSequence(ctx, [
          shadowRecastFrames[0],
          shadowRecastFrames[1],
          shadowRecastFrames[0],
          shadowRecastFrames[1]
        ], {
          speedMs: 100,
          onFrame: (idx) => {
            if (idx === 1 || idx === 3) ctx.playSfx?.("attack", 0.56);
            if (idx === 3) {
              ctx.playSfx?.("summon", 0.58);
              ctx.playSfx?.("aceCast", 0.52);
            }
          }
        });
      }
      setKostyaShadowStrengthPower(snapshot.shadowStrengthPower);
      setKostyaShadowUpgradeHpBonus(snapshot.shadowUpgradeHpBonus);
      const restoredShadow = createKostyaShadow(ctx, {
        hp: snapshot.maxHp,
        maxHp: snapshot.maxHp,
        shp: snapshot.maxShp,
        maxShp: snapshot.maxShp,
        shadowStrengthPower: snapshot.shadowStrengthPower
      });
      setKostyaShadow(restoredShadow);
      ctx.addLog?.("Kostya recasts his Shadow.", "cast-green");
      ctx.refreshUI();
      await ctx.animateSummonArrival?.("shadowChar", {
        spriteId: "shadowSprite",
        walkFrames: restoredShadow.walkFrames || [],
        from: "left",
        indicator: "RECAST"
      });
      ctx.startIdleAnimations();
      ctx.renderCombatActions();
      await ctx.resolvePostPlayerAction();
    });
  });

  const darkerLayer = safeKostyaAction(ctx, async () => {
    const shadow = getKostyaShadow();
    const player = ctx.getPlayer();
    if (!shadow || player.sp < 64 || getKostyaShadowChargePct() < 36 || (shadow.vhp || 0) > 0) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 64;
      spendKostyaShadowCharge(36);
      shadow.maxVhp = Math.max(0, shadow.maxShp || 0);
      shadow.vhp = shadow.maxVhp;
      ctx.logCombatCast?.("Kostya", "Darker Layer", "Shadow");
      refreshKostyaUi(ctx);
      await ctx.resolvePostPlayerAction();
    });
  });

  const shadowStrengthen = safeKostyaAction(ctx, async () => {
    const shadow = getKostyaShadow();
    if (!shadow) return;
    const player = ctx.getPlayer();
    if (player.sp < 50) return;
    if (getKostyaShadowChargePct() < 100) return;
    await queueOrRun(async () => {
      ctx.setActionsLocked(true);
      ctx.setPlayerSkillFeedback();
      player.sp -= 50;
      spendKostyaShadowCharge(100);
      const nextPower = Math.min(ctx.statusPowerCap, getKostyaShadowStrengthPower() + 1);
      setKostyaShadowStrengthPower(nextPower);
      setKostyaShadowUpgradeHpBonus(getKostyaShadowUpgradeHpBonus() + 3);
      shadow.maxShp += 3;
      shadow.shp = Math.min(shadow.maxShp, (shadow.shp || 0) + 3);
      if (shadow.maxVhp > 0) {
        shadow.maxVhp += 3;
        shadow.vhp = Math.min(shadow.maxVhp, (shadow.vhp || 0) + 3);
      }
      ctx.applyStatus(shadow, "strenght", nextPower, KOSTYA_SHADOW_STRENGTH_TURNS);
      ctx.addLog?.("Kostya upgrades his Shadow.", "cast-green");
      ctx.refreshUI();
      ctx.renderCombatActions();
      await ctx.resolvePostPlayerAction();
    });
  });

  return {
    stab,
    slash,
    lunge,
    decayingStab,
    sharpTip,
    cleave,
    darknessCalling,
    transformation,
    heartyRecovery,
    shadowRecast,
    darkerLayer,
    shadowStrengthen
  };
}

export function ensureKostyaAbilityController(baseCtx) {
  if (kostyaState.abilityController) return kostyaState.abilityController;
  kostyaState.abilityController = createKostyaAbilityController(baseCtx);
  return kostyaState.abilityController;
}
