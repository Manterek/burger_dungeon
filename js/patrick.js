import { scaleDuration } from "./timing.js";
import { KOSTYA_SPRITES } from "./kostya.js";

export const PATRICK_SPRITES = {
  spriteSheet: "sprites/player/patrick/patrick.png",
  iconSheet: "sprites/player/patrick/patrick_icon.png",
  indicatorSheet: "sprites/player/patrick/patrick_indicator.png",
  base: "sprites/player/patrick/patrick.png",
  idleSheet: "sprites/player/patrick/patrick.png",
  thinkingSheet: "sprites/player/patrick/patrick.png",
  damaged: "sprites/player/patrick/patrick.png",
  collapsed: "sprites/player/patrick/patrick.png",
  armed: "sprites/player/patrick/patrick.png",
  battleCard: "sprites/player/patrick/patrick_profile.png",
  coinFlipSheet: "sprites/player/patrick/patrick.png",
  revolverSheet: "sprites/player/patrick/patrick.png",
  dualWieldingSheet: "sprites/player/patrick/patrick.png",
  dodgeSheet: "sprites/player/patrick/patrick.png",
  abilityCoin: "sprites/player/patrick/patrick_icon.png",
  abilityFine: "sprites/player/patrick/patrick_icon.png",
  abilityHealth: "sprites/player/patrick/patrick_icon.png",
  abilityRevolver: "sprites/player/patrick/patrick_icon.png",
  abilityHallow: "sprites/player/patrick/patrick_icon.png",
  abilityPiercing: "sprites/player/patrick/patrick_icon.png",
  abilityClubs: "sprites/player/patrick/patrick_icon.png",
  abilityDiamonds: "sprites/player/patrick/patrick_icon.png",
  abilityDual: "sprites/player/patrick/patrick_icon.png",
  abilityMagnum: "sprites/player/patrick/patrick_icon.png",
  abilitySix: "sprites/player/patrick/patrick_icon.png",
  abilityHearts: "sprites/player/patrick/patrick_icon.png",
  upgradeLuck: "sprites/player/patrick/patrick_icon.png",
  upgradeHealth: "sprites/player/patrick/patrick_icon.png",
  upgradeBullet: "sprites/player/patrick/patrick_icon.png",
  luckyChargeIcon: "sprites/player/patrick/patrick_indicator.png",
  bullet: "sprites/player/patrick/patrick_indicator.png",
  hallowBullet: "sprites/player/patrick/patrick_indicator.png",
  magnumBullet: "sprites/player/patrick/patrick_indicator.png",
  muzzleFlash: "sprites/player/patrick/patrick_indicator.png",
  cursor: "sprites/player/patrick/cursor.png"
};

export const PATRICK_ABILITIES = {
  idle: { speedMultiplier: 0.96 },
  coinFlip: { id: "coin", name: "Coin Flip", charges: 0, sp: 0, icon: PATRICK_SPRITES.abilityCoin },
  revolver: { id: "rev", name: "Revolver", charges: 0, sp: 8, icon: PATRICK_SPRITES.abilityRevolver, damage: 9 },
  feelingFine: { id: "fine", name: "Feelin' Fine", charges: 1, sp: 12, icon: PATRICK_SPRITES.abilityFine },
  healthInsurance: {
    id: "ins",
    name: "Health Insurance",
    charges: 2,
    sp: 16,
    icon: PATRICK_SPRITES.abilityHealth,
    healAmount: 5,
    regenPower: 3,
    regenTurns: 5
  },
  hallowShot: { id: "hb", name: "Hallow Shot", charges: 1, sp: 12, icon: PATRICK_SPRITES.abilityHallow, damage: 9 },
  piercingShot: { id: "ps", name: "Piercing Shot", charges: 1, sp: 12, icon: PATRICK_SPRITES.abilityPiercing, damage: 9 },
  aceSpades: { id: "as", name: "Ace of Spades", charges: 2, sp: 16, icon: PATRICK_SPRITES.abilityClubs, power: 3, turns: 3 },
  aceDiamonds: { id: "ad", name: "Ace of Diamonds", charges: 2, sp: 16, icon: PATRICK_SPRITES.abilityDiamonds, power: 3, turns: 3 },
  dualWielding: { id: "dw", name: "Dual Wielding", charges: 2, sp: 20, icon: PATRICK_SPRITES.abilityDual, damage: 9, shots: 2 },
  magnumShot: { id: "ms", name: "Magnum Shot", charges: 2, sp: 20, icon: PATRICK_SPRITES.abilityMagnum, damage: 9 },
  sixShooter: { id: "ss", name: "Six Shooter", charges: 3, sp: 24, icon: PATRICK_SPRITES.abilitySix, damage: 9, shots: 2, maxShots: 6 },
  aceHearts: {
    id: "ah",
    name: "Ace of Hearts",
    charges: 3,
    sp: 0,
    icon: PATRICK_SPRITES.abilityHearts,
    damage: 18,
    slownessPower: 5,
    slownessTurns: 4,
    spRegenPower: 5,
    spRegenTurns: 4
  }
};

const patrickState = {
  luckUpgrades: 0,
  gamblerUpgrades: 0,
  magnumUpgrades: 0,
  evolutions: {
    hallow: false,
    piercing: false,
    aceSpades: false,
    aceDiamonds: false,
    dualWielding: false,
    magnumShot: false,
    sixShooter: false,
    aceHearts: false
  },
  mastery: {
    damageBonus: 0,
    luckyBonus: 0,
    healBonus: 0,
    regenBonus: 0
  },
  idleFramesCache: null,
  idleFramesPromise: null,
  thinkingFramesCache: null,
  thinkingFramesPromise: null,
  coinFramesCache: null,
  coinFramesPromise: null,
  revolverFramesCache: null,
  revolverFramesPromise: null,
  dualFramesCache: null,
  dualFramesPromise: null,
  dodgeFramesCache: null,
  dodgeFramesPromise: null,
  abilityController: null
};

const PATRICK_FRAME_SIZE = 32;
const DEFAULT_SHEET_FRAMES = 4;
const COIN_HEADS_CHANCE = 0.5;
const DEFAULT_STATUS_CAP = 10;
const PATRICK_ICON_SIZE = 16;
const PATRICK_INDICATOR_SIZE = 8;
const PATRICK_SHOT_Y_OFFSET = 20;

const PATRICK_SHEET_ROWS = {
  idle: { row: 0, startCol: 0, frameCount: 4 },
  thinking: { row: 0, startCol: 4, frameCount: 4 },
  armed: { row: 1, startCol: 0, frameCount: 4 },
  coin: { row: 1, startCol: 4, frameCount: 4 },
  revolver: { row: 2, startCol: 0, frameCount: 4 },
  dual: { row: 2, startCol: 4, frameCount: 4 },
  dodge: { row: 3, col: 0 },
  damaged: { row: 3, col: 1 },
  collapsed: { row: 3, col: 2 },
  aceCast: { row: 3, col: 3 },
  aceSpadesBg: { row: 3, col: 4 },
  aceDiamondsBg: { row: 3, col: 5 },
  aceHeartsBg: { row: 3, col: 6 }
};

const PATRICK_ICON_CELLS = {
  abilityCoin: { row: 0, col: 0 },
  abilityRevolver: { row: 0, col: 1 },
  abilityPiercing: { row: 0, col: 2 },
  abilityHallow: { row: 0, col: 3 },
  abilityFine: { row: 0, col: 4 },
  abilityHealth: { row: 0, col: 5 },
  abilityClubs: { row: 0, col: 6 },
  abilityDiamonds: { row: 0, col: 7 },
  abilityDual: { row: 1, col: 0 },
  abilityMagnum: { row: 1, col: 1 },
  abilitySix: { row: 1, col: 2 },
  abilityHearts: { row: 1, col: 3 },
  upgradeBullet: { row: 1, col: 4 },
  upgradeHealth: { row: 1, col: 5 },
  upgradeLuck: { row: 1, col: 6 }
};

const PATRICK_INDICATOR_CELLS = {
  bullet: { row: 0, col: 0 },
  hallowBullet: { row: 0, col: 1 },
  magnumBullet: { row: 0, col: 2 },
  luckyChargeIcon: { row: 0, col: 3 },
  muzzleFlash: { row: 0, col: 4 }
};

function resolveSpriteId(ctx) {
  if (!ctx) return "playerSprite";
  if (typeof ctx.activePlayerSpriteId === "function") {
    return ctx.activePlayerSpriteId() || "playerSprite";
  }
  return ctx.activePlayerSpriteId || "playerSprite";
}

async function slicePatrickSheet(ctx, src, frameCount = DEFAULT_SHEET_FRAMES) {
  if (!ctx?.sliceHorizontalSpriteSheet) return [];
  try {
    const frames = await ctx.sliceHorizontalSpriteSheet(src, PATRICK_FRAME_SIZE, PATRICK_FRAME_SIZE, frameCount);
    return Array.isArray(frames) ? frames : [];
  } catch (err) {
    return [];
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

async function getPatrickSheetFrames(ctx, entry) {
  if (!entry) return [PATRICK_SPRITES.base];
  if (typeof entry.col === "number") {
    return [await cropSpriteSheetCell(PATRICK_SPRITES.spriteSheet, PATRICK_FRAME_SIZE, entry.row, entry.col)];
  }
  const frames = [];
  for (let idx = 0; idx < entry.frameCount; idx += 1) {
    frames.push(await cropSpriteSheetCell(
      PATRICK_SPRITES.spriteSheet,
      PATRICK_FRAME_SIZE,
      entry.row,
      entry.startCol + idx
    ));
  }
  return frames;
}

async function preloadPatrickIcons() {
  const iconEntries = Object.entries(PATRICK_ICON_CELLS);
  const resolved = await Promise.all(iconEntries.map(async ([key, cell]) => ([
    key,
    await cropSpriteSheetCell(PATRICK_SPRITES.iconSheet, PATRICK_ICON_SIZE, cell.row, cell.col)
  ])));
  resolved.forEach(([key, value]) => {
    PATRICK_SPRITES[key] = value;
  });
  PATRICK_ABILITIES.coinFlip.icon = PATRICK_SPRITES.abilityCoin;
  PATRICK_ABILITIES.revolver.icon = PATRICK_SPRITES.abilityRevolver;
  PATRICK_ABILITIES.feelingFine.icon = PATRICK_SPRITES.abilityFine;
  PATRICK_ABILITIES.healthInsurance.icon = PATRICK_SPRITES.abilityHealth;
  PATRICK_ABILITIES.hallowShot.icon = PATRICK_SPRITES.abilityHallow;
  PATRICK_ABILITIES.piercingShot.icon = PATRICK_SPRITES.abilityPiercing;
  PATRICK_ABILITIES.aceSpades.icon = PATRICK_SPRITES.abilityClubs;
  PATRICK_ABILITIES.aceDiamonds.icon = PATRICK_SPRITES.abilityDiamonds;
  PATRICK_ABILITIES.dualWielding.icon = PATRICK_SPRITES.abilityDual;
  PATRICK_ABILITIES.magnumShot.icon = PATRICK_SPRITES.abilityMagnum;
  PATRICK_ABILITIES.sixShooter.icon = PATRICK_SPRITES.abilitySix;
  PATRICK_ABILITIES.aceHearts.icon = PATRICK_SPRITES.abilityHearts;
}

async function preloadPatrickIndicators() {
  const indicatorEntries = Object.entries(PATRICK_INDICATOR_CELLS);
  const resolved = await Promise.all(indicatorEntries.map(async ([key, cell]) => ([
    key,
    await cropSpriteSheetCell(PATRICK_SPRITES.indicatorSheet, PATRICK_INDICATOR_SIZE, cell.row, cell.col)
  ])));
  resolved.forEach(([key, value]) => {
    PATRICK_SPRITES[key] = value;
  });
}

async function getPatrickIdleFrames(ctx) {
  if (patrickState.idleFramesCache) return patrickState.idleFramesCache;
  if (!patrickState.idleFramesPromise) {
    patrickState.idleFramesPromise = getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.idle).then((frames) => {
      const resolved = frames.length ? frames : [PATRICK_SPRITES.base];
      patrickState.idleFramesCache = resolved;
      return resolved;
    });
  }
  return patrickState.idleFramesPromise;
}

async function getPatrickThinkingFrames(ctx) {
  if (patrickState.thinkingFramesCache) return patrickState.thinkingFramesCache;
  if (!patrickState.thinkingFramesPromise) {
    patrickState.thinkingFramesPromise = getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.thinking).then((frames) => {
      const resolved = frames.length ? frames : [PATRICK_SPRITES.base];
      patrickState.thinkingFramesCache = resolved;
      return resolved;
    });
  }
  return patrickState.thinkingFramesPromise;
}

async function getPatrickCoinFrames(ctx) {
  if (patrickState.coinFramesCache) return patrickState.coinFramesCache;
  if (!patrickState.coinFramesPromise) {
    patrickState.coinFramesPromise = getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.coin).then((frames) => {
      const resolved = frames.length
        ? pingPongPatrickFrames(frames)
        : [PATRICK_SPRITES.base];
      patrickState.coinFramesCache = resolved;
      return resolved;
    });
  }
  return patrickState.coinFramesPromise;
}

function pingPongPatrickFrames(frames) {
  if (!Array.isArray(frames) || frames.length <= 1) return Array.isArray(frames) ? [...frames] : [];
  const backward = frames.slice(1, frames.length - 1).reverse();
  return [...frames, ...backward];
}

async function getPatrickRevolverFrames(ctx) {
  if (patrickState.revolverFramesCache) return patrickState.revolverFramesCache;
  if (!patrickState.revolverFramesPromise) {
    patrickState.revolverFramesPromise = getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.revolver).then((frames) => {
      const resolved = frames.length ? frames : [PATRICK_SPRITES.base];
      patrickState.revolverFramesCache = resolved;
      return resolved;
    });
  }
  return patrickState.revolverFramesPromise;
}

async function getPatrickDualFrames(ctx) {
  if (patrickState.dualFramesCache) return patrickState.dualFramesCache;
  if (!patrickState.dualFramesPromise) {
    patrickState.dualFramesPromise = getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.dual).then((frames) => {
      const resolved = frames.length ? frames : [PATRICK_SPRITES.base];
      patrickState.dualFramesCache = resolved;
      return resolved;
    });
  }
  return patrickState.dualFramesPromise;
}

export async function getPatrickDodgeFrames(ctx) {
  if (patrickState.dodgeFramesCache) return patrickState.dodgeFramesCache;
  if (!patrickState.dodgeFramesPromise) {
    patrickState.dodgeFramesPromise = getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.dodge).then((frames) => {
      const resolved = frames.length ? frames : [PATRICK_SPRITES.damaged];
      patrickState.dodgeFramesCache = resolved;
      return resolved;
    });
  }
  return patrickState.dodgeFramesPromise;
}

export function getPatrickLuckExpertiseUpgrades() {
  return patrickState.luckUpgrades;
}

export function getPatrickDebugProgress() {
  return {
    luckUpgrades: patrickState.luckUpgrades,
    gamblerUpgrades: patrickState.gamblerUpgrades,
    magnumUpgrades: patrickState.magnumUpgrades,
    evolutions: {
      hallow: patrickState.evolutions.hallow,
      piercing: patrickState.evolutions.piercing,
      aceSpades: patrickState.evolutions.aceSpades,
      aceDiamonds: patrickState.evolutions.aceDiamonds,
      dualWielding: patrickState.evolutions.dualWielding,
      magnumShot: patrickState.evolutions.magnumShot,
      sixShooter: patrickState.evolutions.sixShooter,
      aceHearts: patrickState.evolutions.aceHearts
    }
  };
}

export function setPatrickDebugProgress(config = {}, player, { maxHpCap = 100 } = {}) {
  patrickState.luckUpgrades = Math.max(0, Math.floor(Number(config.luckUpgrades) || 0));
  patrickState.gamblerUpgrades = Math.max(0, Math.floor(Number(config.gamblerUpgrades) || 0));
  patrickState.magnumUpgrades = Math.max(0, Math.floor(Number(config.magnumUpgrades) || 0));
  const evolutions = config.evolutions || {};
  patrickState.evolutions.hallow = !!evolutions.hallow;
  patrickState.evolutions.piercing = !!evolutions.piercing;
  patrickState.evolutions.aceSpades = !!evolutions.aceSpades;
  patrickState.evolutions.aceDiamonds = !!evolutions.aceDiamonds;
  patrickState.evolutions.dualWielding = !!evolutions.dualWielding;
  patrickState.evolutions.magnumShot = !!evolutions.magnumShot;
  patrickState.evolutions.sixShooter = !!evolutions.sixShooter;
  patrickState.evolutions.aceHearts = !!evolutions.aceHearts;
  patrickState.mastery.damageBonus = 0;
  patrickState.mastery.luckyBonus = 0;
  patrickState.mastery.healBonus = 0;
  patrickState.mastery.regenBonus = 0;
  if (player) {
    player.maxHp = Math.min(maxHpCap, 30 + patrickState.gamblerUpgrades * 7);
    player.hp = player.maxHp;
    player.sp = player.maxSp;
  }
}

function gunBaseDamage() {
  return PATRICK_ABILITIES.revolver.damage + patrickState.magnumUpgrades * 3 + patrickState.mastery.damageBonus;
}

function luckyBonusGain() {
  return Math.max(0, patrickState.mastery.luckyBonus);
}

function headsChance() {
  return Math.min(1, COIN_HEADS_CHANCE + patrickState.luckUpgrades * 0.02);
}

function healthInsuranceHealAmount(ctx) {
  const base = ctx.healthInsuranceHealAmountForLevel?.() ?? PATRICK_ABILITIES.healthInsurance.healAmount;
  return base + patrickState.mastery.healBonus;
}

function healthInsuranceRegenPower(ctx) {
  return ctx.healthInsuranceRegenPowerForLevel?.() ?? PATRICK_ABILITIES.healthInsurance.regenPower;
}

function healthInsuranceRegenTurns(ctx) {
  const base = ctx.healthInsuranceRegenTurnsForLevel?.() ?? PATRICK_ABILITIES.healthInsurance.regenTurns;
  return base + patrickState.mastery.regenBonus;
}

function patrickStatusCap(ctx) {
  return ctx.statusPowerCap ?? DEFAULT_STATUS_CAP;
}

function ensurePatrickCombatState(player) {
  if (!player) return { storedWeaknessPower: 0, healthInsuranceActive: false };
  if (!player.patrickCombatState) {
    player.patrickCombatState = {
      storedWeaknessPower: 0,
      healthInsuranceActive: false
    };
  }
  return player.patrickCombatState;
}

function revolverBonusPercent(charge = 0) {
  const tiers = Math.max(0, Math.min(4, Math.floor(charge * 4 + 1e-6)));
  return tiers * (5 + patrickState.magnumUpgrades);
}

function revolverBonusDamage(charge = 0, damage = gunBaseDamage()) {
  const percent = revolverBonusPercent(charge);
  if (percent <= 0 || damage <= 0) return 0;
  return Math.ceil(damage * (percent / 100));
}

function piercingTargetCount(charge = 0) {
  if (charge >= 0.99) return 4;
  if (charge >= 0.66) return 3;
  if (charge >= 0.33) return 2;
  return 1;
}

function magnumStunTurns(charge = 0) {
  if (charge >= 1) return 2;
  if (charge >= 0.5) return 1;
  return 0;
}

function sixShooterBulletCount(charge = 0) {
  return Math.max(2, Math.min(6, 2 + Math.floor(charge * 4 + 1e-6)));
}

function canAffordAbility(player, ability) {
  if (!player || !ability) return false;
  return player.luckyCharges >= (ability.charges || 0) && player.sp >= (ability.sp || 0);
}

function spendAbilityCost(ctx, player, ability) {
  if (!player || !ability) return;
  if (ability.charges > 0) ctx.spendLuckyCharges?.(ability.charges);
  if (ability.sp > 0) player.sp = Math.max(0, player.sp - ability.sp);
}

function livingEnemies(ctx) {
  return (ctx.getEnemies?.() || []).filter((enemy) => enemy && enemy.hp > 0);
}

function livingAllies(ctx) {
  const allies = [];
  const player = ctx.getPlayer?.();
  if (player?.hp > 0) allies.push(player);
  const duoPlayers = Array.isArray(ctx.duoPlayers) ? ctx.duoPlayers : [];
  duoPlayers.forEach((unit) => {
    if (unit && unit !== player && unit.hp > 0) allies.push(unit);
  });
  const helper = ctx.getHelper?.();
  if (helper?.hp > 0) allies.push(helper);
  const shadow = ctx.getShadow?.();
  if (shadow?.hp > 0) allies.push(shadow);
  return allies;
}

async function playPatrickFrames(ctx, frames, fallback = [PATRICK_SPRITES.base], speed = 75) {
  await ctx.playPlayerFrames?.((frames && frames.length) ? frames : fallback, speed);
}

async function getPatrickArmedFrames(ctx) {
  return getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.armed);
}

function ensurePatrickFxLayer() {
  let layer = document.getElementById("patrickFxLayer");
  if (layer) return layer;
  layer = document.createElement("div");
  layer.id = "patrickFxLayer";
  layer.style.position = "fixed";
  layer.style.left = "0";
  layer.style.top = "0";
  layer.style.width = "100vw";
  layer.style.height = "100vh";
  layer.style.pointerEvents = "none";
  layer.style.zIndex = "94";
  document.body.appendChild(layer);
  return layer;
}

function createPatrickFxSprite(layer, src, left, top, size) {
  const sprite = document.createElement("img");
  sprite.src = src;
  sprite.alt = "";
  sprite.decoding = "async";
  sprite.style.position = "fixed";
  sprite.style.left = `${left}px`;
  sprite.style.top = `${top}px`;
  sprite.style.width = `${size}px`;
  sprite.style.height = `${size}px`;
  sprite.style.pointerEvents = "none";
  sprite.style.imageRendering = "pixelated";
  sprite.style.zIndex = "1";
  layer.appendChild(sprite);
  return sprite;
}

function createPatrickActorBgSprite(sprite, src, size) {
  const host = sprite?.parentElement;
  if (!host) return null;
  const bg = document.createElement("img");
  bg.src = src;
  bg.alt = "";
  bg.decoding = "async";
  bg.style.position = "absolute";
  bg.style.left = `${sprite.offsetLeft + sprite.offsetWidth / 2 - size / 2}px`;
  bg.style.top = `${sprite.offsetTop + sprite.offsetHeight / 2 - size / 2}px`;
  bg.style.width = `${size}px`;
  bg.style.height = `${size}px`;
  bg.style.pointerEvents = "none";
  bg.style.imageRendering = "pixelated";
  bg.style.zIndex = "0";
  host.appendChild(bg);
  return bg;
}

async function holdPatrickAimDuringMash(ctx, mashPromise) {
  const armedFrames = await getPatrickArmedFrames(ctx);
  const spriteId = resolveSpriteId(ctx);
  const sprite = ctx.getEl?.(spriteId);
  ctx.playSfx?.("lockNLoad", 0.6);
  await playPatrickFrames(ctx, armedFrames, [PATRICK_SPRITES.base], 95);
  if (sprite && armedFrames.length) {
    ctx.setPlayerAnimating?.(true, spriteId);
    sprite.src = armedFrames[armedFrames.length - 1];
  }
  const charge = await mashPromise;
  ctx.setPlayerAnimating?.(false, "");
  return charge;
}

async function firePatrickShot(ctx, target, spriteSrc, {
  frames,
  fallback = [PATRICK_SPRITES.base],
  frameSpeed = 75,
  shotVolume = 0.6,
  durationMs = 180
} = {}) {
  if (!target) return;
  ctx.playSfx?.("revolverShot", shotVolume);
  await Promise.all([
    playPatrickFrames(ctx, frames, fallback, frameSpeed),
    animatePatrickProjectile(ctx, target, spriteSrc, durationMs)
  ]);
}

async function playPatrickMuzzleFlash(ctx) {
  const sprite = ctx.getEl?.(resolveSpriteId(ctx));
  if (!sprite) return;
  const rect = sprite.getBoundingClientRect();
  const layer = ensurePatrickFxLayer();
  const size = 24;
  const glow = document.createElement("div");
  glow.style.position = "fixed";
  glow.style.left = `${rect.right - size * 0.9}px`;
  glow.style.top = `${rect.top + rect.height * 0.34 - PATRICK_SHOT_Y_OFFSET}px`;
  glow.style.width = `${size * 1.4}px`;
  glow.style.height = `${size * 1.4}px`;
  glow.style.borderRadius = "999px";
  glow.style.background = "radial-gradient(circle, rgba(255,238,160,0.95) 0%, rgba(255,176,44,0.72) 40%, rgba(255,136,16,0.12) 100%)";
  glow.style.filter = "blur(6px)";
  glow.style.pointerEvents = "none";
  layer.appendChild(glow);
  const flash = createPatrickFxSprite(
    layer,
    PATRICK_SPRITES.muzzleFlash,
    rect.right - size * 0.6,
    rect.top + rect.height * 0.42 - PATRICK_SHOT_Y_OFFSET,
    size
  );
  await new Promise((resolve) => window.setTimeout(resolve, scaleDuration(40)));
  if (glow.isConnected) glow.remove();
  if (flash.isConnected) flash.remove();
}

async function animatePatrickProjectile(ctx, target, spriteSrc, durationMs = 180) {
  if (!target?.id) return;
  const attacker = ctx.getEl?.(resolveSpriteId(ctx));
  const targetEl = ctx.getEl?.(`enemy-entity-${target.id}`);
  if (!attacker || !targetEl) return;
  const a = attacker.getBoundingClientRect();
  const t = targetEl.getBoundingClientRect();
  const startX = a.right - 6;
  const startY = a.top + a.height * 0.48 - PATRICK_SHOT_Y_OFFSET;
  const endX = t.left + t.width * 0.4;
  const endY = t.top + t.height * 0.45;
  const layer = ensurePatrickFxLayer();
  const bullet = createPatrickFxSprite(layer, spriteSrc, startX, startY, 20);
  await playPatrickMuzzleFlash(ctx);

  await new Promise((resolve) => {
    const actualDurationMs = scaleDuration(durationMs);
    let startedAt = 0;
    function step(ts) {
      if (!startedAt) startedAt = ts;
      const progress = Math.max(0, Math.min(1, (ts - startedAt) / actualDurationMs));
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      bullet.style.left = `${x}px`;
      bullet.style.top = `${y}px`;
      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }
      resolve();
    }
    requestAnimationFrame(step);
  });

  if (bullet.isConnected) bullet.remove();
}

async function playPatrickAceCast(ctx, bgEntry) {
  const sprite = ctx.getEl?.(resolveSpriteId(ctx));
  if (!sprite) return;
  const actorRect = sprite.getBoundingClientRect();
  const bgFrames = await getPatrickSheetFrames(ctx, bgEntry);
  const aceFrames = await getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.aceCast);
  const size = Math.max(28, Math.round(actorRect.width * 0.82));
  const bg = createPatrickActorBgSprite(
    sprite,
    bgFrames[0] || PATRICK_SPRITES.base,
    size
  );
  if (!bg) return;
  bg.style.opacity = "0";
  bg.style.mixBlendMode = "screen";
  ctx.playSfx?.("aceCast", 0.62);

  const bgPulse = new Promise((resolve) => {
    const pulseDurationMs = scaleDuration(270);
    let startedAt = 0;
    function step(ts) {
      if (!startedAt) startedAt = ts;
      const progress = Math.max(0, Math.min(1, (ts - startedAt) / pulseDurationMs));
      const opacity = progress <= 0.5 ? progress * 1.5 : (1 - progress) * 1.5;
      bg.style.opacity = String(Math.max(0, Math.min(0.75, opacity)));
      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }
      resolve();
    }
    requestAnimationFrame(step);
  });

  const actorCast = playPatrickFrames(
    ctx,
    [aceFrames[0] || PATRICK_SPRITES.base, aceFrames[0] || PATRICK_SPRITES.base, aceFrames[0] || PATRICK_SPRITES.base],
    [PATRICK_SPRITES.base],
    90
  );

  await Promise.all([bgPulse, actorCast]);
  if (bg.isConnected) bg.remove();
}

async function runPatrickMash(ctx, { hintText = "Mash SPACE for bonus!", durationMs = 4000, markerFractions = [] } = {}) {
  ctx.positionSkillCheckBelow?.(resolveSpriteId(ctx));
  const result = await ctx.runMashSkillCheck?.({
    durationMs,
    pressGain: 0.11,
    decayPerSecond: 0.2,
    completeOnFull: true,
    hintText,
    markerFractions
  });
  return result?.charge ?? 0;
}

async function choosePatrickEnemyTarget(ctx, abilityName) {
  return ctx.chooseEnemyTarget?.(abilityName);
}

async function choosePatrickEnemyTargets(ctx, abilityName, pickCount, allowSameTarget) {
  return ctx.chooseEnemyTargets?.(abilityName, pickCount, allowSameTarget);
}

function applyCoinFlipWeakness(ctx, player) {
  const combatState = ensurePatrickCombatState(player);
  const stored = Math.max(0, combatState.storedWeaknessPower || 0);
  const activePower = ctx.hasStatus?.(player, "weakness") ? (ctx.statusPower?.(player, "weakness") || 0) : 0;
  let nextPower = stored > 0 ? stored : 1;
  if (activePower > 0) nextPower = Math.max(stored, activePower) + 1;
  nextPower = Math.min(patrickStatusCap(ctx), nextPower);
  combatState.storedWeaknessPower = nextPower;
  ctx.applyStatus?.(player, "weakness", nextPower, 3);
  return nextPower;
}

function clearBadStatuses(ctx, player) {
  (ctx.badStatusKeys || []).forEach((key) => {
    ctx.clearStatus?.(player, key);
  });
}

function patrickCoinFlipSpGain(unit, baseAmount) {
  const weaknessPower = unit && typeof unit === "object" && unit.statuses?.weakness?.power > 0
    ? Math.max(0, unit.statuses.weakness.power)
    : 0;
  return Math.max(0, (baseAmount || 0) + weaknessPower);
}

function setInsuranceState(player, active) {
  const combatState = ensurePatrickCombatState(player);
  combatState.healthInsuranceActive = !!active;
  player.patrickHealthInsuranceActive = !!active;
}

export function resetPatrickProgress() {
  patrickState.luckUpgrades = 0;
  patrickState.gamblerUpgrades = 0;
  patrickState.magnumUpgrades = 0;
  patrickState.evolutions = {
    hallow: false,
    piercing: false,
    aceSpades: false,
    aceDiamonds: false,
    dualWielding: false,
    magnumShot: false,
    sixShooter: false,
    aceHearts: false
  };
  patrickState.mastery = {
    damageBonus: 0,
    luckyBonus: 0,
    healBonus: 0,
    regenBonus: 0
  };
  patrickState.idleFramesCache = null;
  patrickState.idleFramesPromise = null;
  patrickState.thinkingFramesCache = null;
  patrickState.thinkingFramesPromise = null;
  patrickState.coinFramesCache = null;
  patrickState.coinFramesPromise = null;
  patrickState.revolverFramesCache = null;
  patrickState.revolverFramesPromise = null;
  patrickState.dualFramesCache = null;
  patrickState.dualFramesPromise = null;
  patrickState.dodgeFramesCache = null;
  patrickState.dodgeFramesPromise = null;
  patrickState.abilityController = null;
}

export async function preloadPatrickVisuals(ctx) {
  if (!ctx?.playerSprites) return;
  const [idleFrames, thinkingFrames, coinFrames, revolverFrames, dualFrames, dodgeFrames, damagedFrame, collapsedFrame, armedFrames] = await Promise.all([
    getPatrickIdleFrames(ctx),
    getPatrickThinkingFrames(ctx),
    getPatrickCoinFrames(ctx),
    getPatrickRevolverFrames(ctx),
    getPatrickDualFrames(ctx),
    getPatrickDodgeFrames(ctx),
    getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.damaged),
    getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.collapsed),
    getPatrickSheetFrames(ctx, PATRICK_SHEET_ROWS.armed),
    preloadPatrickIcons(),
    preloadPatrickIndicators()
  ]);

  const patrickSprites = ctx.playerSprites.patrick || {};
  patrickSprites.idle = idleFrames.length ? idleFrames : [PATRICK_SPRITES.base];
  patrickSprites.thinking = thinkingFrames.length ? thinkingFrames : [PATRICK_SPRITES.base];
  patrickSprites.attack = revolverFrames.length ? revolverFrames : [PATRICK_SPRITES.base];
  patrickSprites.heal = idleFrames.length ? idleFrames : [PATRICK_SPRITES.base];
  patrickSprites.damaged = damagedFrame.length ? damagedFrame : [PATRICK_SPRITES.base];
  patrickSprites.collapsed = collapsedFrame.length ? collapsedFrame : [PATRICK_SPRITES.base];
  patrickSprites.defend = armedFrames.length ? armedFrames : [PATRICK_SPRITES.base];
  patrickSprites.parry = [PATRICK_SPRITES.base];
  patrickSprites.coinFlip = coinFrames.length ? coinFrames : [PATRICK_SPRITES.base];
  patrickSprites.dualWielding = dualFrames.length ? dualFrames : [PATRICK_SPRITES.base];
  patrickSprites.dodge = dodgeFrames.length ? dodgeFrames : [PATRICK_SPRITES.base];
  ctx.playerSprites.patrick = patrickSprites;
  PATRICK_SPRITES.base = idleFrames[0] || PATRICK_SPRITES.base;
  PATRICK_SPRITES.armed = armedFrames[0] || PATRICK_SPRITES.armed;
  PATRICK_SPRITES.damaged = damagedFrame[0] || PATRICK_SPRITES.damaged;
  PATRICK_SPRITES.collapsed = collapsedFrame[0] || PATRICK_SPRITES.collapsed;
}

export function selectPatrickIdleFrames({ sprites, isActiveTurn, actionsLocked }) {
  if (!sprites) return [PATRICK_SPRITES.base];
  if (isActiveTurn && !actionsLocked) {
    if (Array.isArray(sprites.thinking) && sprites.thinking.length) return sprites.thinking;
  }
  if (Array.isArray(sprites.idle) && sprites.idle.length) return sprites.idle;
  return [PATRICK_SPRITES.base];
}

export function syncPatrickIdlePose(ctx) {
  if (!ctx?.isPatrick?.()) return;
  if (ctx.isPlayerAnimating?.()) return;
  const spriteId = resolveSpriteId(ctx);
  const img = ctx.getEl?.(spriteId);
  if (!img) return;
  const spriteSource = typeof ctx.playerSprites === "function"
    ? ctx.playerSprites()
    : ctx.playerSprites?.patrick || ctx.playerSprites;
  const frames = selectPatrickIdleFrames({
    sprites: spriteSource || {},
    isActiveTurn: true,
    actionsLocked: ctx.isActionsLocked?.() ?? false
  });
  img.src = frames[0] || PATRICK_SPRITES.base;
}

function formatCostSegment(icon, label) {
  return `<span class="choice-cost-item"><img class="ability-cost-icon" src="${icon}" alt="cost"> ${label}</span>`;
}

export function formatPatrickChoiceCostHtml(cost) {
  if (!cost) return "<span class=\"choice-cost-free\">Upgrade</span>";
  const parts = [];
  if (cost.label) parts.push(`<span class="choice-cost-item">${cost.label}</span>`);
  if (cost.luckyCharges) parts.push(formatCostSegment(PATRICK_SPRITES.luckyChargeIcon, cost.luckyCharges));
  if (cost.hp) parts.push(`<span class="choice-cost-item">${cost.hp} HP</span>`);
  if (cost.sp) parts.push(`<span class="choice-cost-item">${cost.sp} SP</span>`);
  if (cost.sc) parts.push(formatCostSegment(KOSTYA_SPRITES.shadowCharges || KOSTYA_SPRITES.shadow, `${cost.sc}%`));
  if (cost.scGain) parts.push(formatCostSegment(KOSTYA_SPRITES.shadowCharges || KOSTYA_SPRITES.shadow, `+${cost.scGain}%`));
  if (cost.info) parts.push(`<span class="choice-cost-item">${cost.info}</span>`);
  if (!parts.length) return "<span class=\"choice-cost-free\">Upgrade</span>";
  return parts.join(" | ");
}

export function getPatrickUpgradeOptionsForPlayer(player, maxHpCap = 100) {
  const isMaxHp = player?.maxHp >= maxHpCap;
  const isLuckMaxed = patrickState.luckUpgrades >= 10;
  return [
    {
      id: "luck",
      name: "Luck Expertise",
      icon: PATRICK_SPRITES.upgradeLuck,
      description: "+2% heads\n+1 weakness tolerance",
      disabled: isLuckMaxed,
      cost: null
    },
    {
      id: "gambler",
      name: "Slot Machine",
      icon: PATRICK_SPRITES.upgradeHealth,
      description: "+7 max health",
      disabled: !!isMaxHp,
      cost: null
    },
    {
      id: "magnum",
      name: "Bullet Enhancement",
      icon: PATRICK_SPRITES.upgradeBullet,
      description: "+3 damage with Revolver\n+3% bonus damage",
      cost: null
    }
  ];
}

export function applyPatrickUpgradeChoiceToState(choice, { player } = {}) {
  if (!choice) return;
  if (choice === "luck") {
    if (patrickState.luckUpgrades >= 10) return;
    patrickState.luckUpgrades += 1;
  }
  if (choice === "gambler") {
    patrickState.gamblerUpgrades += 1;
    if (player) {
      const gain = 7;
      const actualGain = Math.max(0, Math.min(100, player.maxHp + gain) - player.maxHp);
      player.maxHp += actualGain;
      player.hp = Math.min(player.maxHp, player.hp + actualGain);
    }
  }
  if (choice === "magnum") {
    patrickState.magnumUpgrades += 1;
    if (player) {
      player.sp = Math.min(player.maxSp, player.sp + 10);
    }
  }
}

function hasPatrickInParty(ctx) {
  if (ctx.isPatrick?.()) return true;
  if (ctx.isDuoMode?.() && Array.isArray(ctx.duoCharacters)) {
    return ctx.duoCharacters.includes("patrick");
  }
  return false;
}

async function withPatrickFocus(ctx, run) {
  if (!ctx?.isDuoMode?.() || !Array.isArray(ctx.duoCharacters)) {
    await run();
    return;
  }
  const idx = ctx.duoCharacters.indexOf("patrick");
  if (idx < 0) {
    await run();
    return;
  }
  const prev = ctx.isPatrick?.() ? idx : null;
  if (ctx.switchToDuoPlayer && idx >= 0) ctx.switchToDuoPlayer(idx, true);
  await run();
  if (prev === null && ctx.switchToDuoPlayer) ctx.switchToDuoPlayer(0, true);
}

export async function unlockPatrickRevolverEvolutionAfterBoss(clearedLevel, ctx) {
  if (!hasPatrickInParty(ctx)) return;
  if (clearedLevel !== 10) return;
  if (patrickState.evolutions.hallow || patrickState.evolutions.piercing) return;

  await withPatrickFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Gun Upgrade",
      subtitle: "Choose one follow-up shot.",
      options: [
        {
          id: "upHallow",
          name: "Hallow Shot",
          icon: PATRICK_SPRITES.abilityHallow,
          description: "Deals double the damage.",
          cost: { luckyCharges: PATRICK_ABILITIES.hallowShot.charges, sp: PATRICK_ABILITIES.hallowShot.sp }
        },
        {
          id: "upPiercing",
          name: "Piercing Shot",
          icon: PATRICK_SPRITES.abilityPiercing,
          description: "Pierces through enemies.",
          cost: { luckyCharges: PATRICK_ABILITIES.piercingShot.charges, sp: PATRICK_ABILITIES.piercingShot.sp }
        }
      ],
      requireConfirm: true
    });
    if (choice === "upHallow") patrickState.evolutions.hallow = true;
    if (choice === "upPiercing") patrickState.evolutions.piercing = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function unlockPatrickAceEvolutionAfterBoss(clearedLevel, ctx) {
  if (!hasPatrickInParty(ctx)) return;
  if (clearedLevel !== 20) return;
  if (patrickState.evolutions.aceSpades || patrickState.evolutions.aceDiamonds) return;

  await withPatrickFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Aces Upgrade",
      subtitle: "Choose one suit.",
      options: [
        {
          id: "upAceSpades",
          name: "Ace of Spades",
          icon: PATRICK_SPRITES.abilityClubs,
          description: "Inflict weakness on enemies.",
          cost: { luckyCharges: PATRICK_ABILITIES.aceSpades.charges, sp: PATRICK_ABILITIES.aceSpades.sp }
        },
        {
          id: "upAceDiamonds",
          name: "Ace of Diamonds",
          icon: PATRICK_SPRITES.abilityDiamonds,
          description: "Inflict strenght on allies.",
          cost: { luckyCharges: PATRICK_ABILITIES.aceDiamonds.charges, sp: PATRICK_ABILITIES.aceDiamonds.sp }
        }
      ],
      requireConfirm: true
    });
    if (choice === "upAceSpades") patrickState.evolutions.aceSpades = true;
    if (choice === "upAceDiamonds") patrickState.evolutions.aceDiamonds = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function unlockPatrickGunEvolutionAfterBoss(clearedLevel, ctx) {
  if (!hasPatrickInParty(ctx)) return;
  if (clearedLevel !== 30) return;
  if (patrickState.evolutions.dualWielding || patrickState.evolutions.magnumShot) return;

  await withPatrickFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Gun Upgrade",
      subtitle: "Choose one firing style.",
      options: [
        {
          id: "upDualWielding",
          name: "Dual Wielding",
          icon: PATRICK_SPRITES.abilityDual,
          description: "Hitting two birds with one stone.",
          cost: { luckyCharges: PATRICK_ABILITIES.dualWielding.charges, sp: PATRICK_ABILITIES.dualWielding.sp }
        },
        {
          id: "upMagnumShot",
          name: "Magnum Shot",
          icon: PATRICK_SPRITES.abilityMagnum,
          description: "Stuns enemies.",
          cost: { luckyCharges: PATRICK_ABILITIES.magnumShot.charges, sp: PATRICK_ABILITIES.magnumShot.sp }
        }
      ],
      requireConfirm: true
    });
    if (choice === "upDualWielding") patrickState.evolutions.dualWielding = true;
    if (choice === "upMagnumShot") patrickState.evolutions.magnumShot = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function unlockPatrickFinalEvolutionAfterBoss(clearedLevel, ctx) {
  if (!hasPatrickInParty(ctx)) return;
  if (clearedLevel !== 40) return;
  if (patrickState.evolutions.sixShooter || patrickState.evolutions.aceHearts) return;

  await withPatrickFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Final Upgrade",
      subtitle: "Choose one finisher.",
      options: [
        {
          id: "upSixShooter",
          name: "Six Shooter",
          icon: PATRICK_SPRITES.abilitySix,
          description: "That's a lot of damage!",
          cost: { luckyCharges: PATRICK_ABILITIES.sixShooter.charges, sp: PATRICK_ABILITIES.sixShooter.sp }
        },
        {
          id: "upAceHearts",
          name: "Ace of Hearts",
          icon: PATRICK_SPRITES.abilityHearts,
          description: "Cripple down enemies and regain SP.",
          cost: { luckyCharges: PATRICK_ABILITIES.aceHearts.charges, sp: PATRICK_ABILITIES.aceHearts.sp }
        }
      ],
      requireConfirm: true
    });
    if (choice === "upSixShooter") patrickState.evolutions.sixShooter = true;
    if (choice === "upAceHearts") patrickState.evolutions.aceHearts = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function unlockPatrickMasteryAfterBoss(clearedLevel, ctx) {
  if (!hasPatrickInParty(ctx)) return;
  if (clearedLevel !== 50) return;
  const totalMastery =
    patrickState.mastery.damageBonus +
    patrickState.mastery.luckyBonus +
    patrickState.mastery.healBonus;
  if (totalMastery >= 3) return;

  await withPatrickFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Mastery",
      subtitle: "Choose a mastery bonus.",
      options: [
        {
          id: "upMasterA",
          name: "Mastery: Sharpshooter",
          icon: PATRICK_SPRITES.abilityRevolver,
          description: "+2 damage on all gun skills."
        },
        {
          id: "upMasterB",
          name: "Mastery: Loaded Dice",
          icon: PATRICK_SPRITES.abilityCoin,
          description: "+1 Lucky Charge gain on heads."
        },
        {
          id: "upMasterC",
          name: "Mastery: Insurance",
          icon: PATRICK_SPRITES.abilityHealth,
          description: "+3 instant heal and +1 regen turn on Health Insurance."
        }
      ],
      requireConfirm: true
    });
    if (choice === "upMasterA") patrickState.mastery.damageBonus += 2;
    if (choice === "upMasterB") patrickState.mastery.luckyBonus += 1;
    if (choice === "upMasterC") {
      patrickState.mastery.healBonus += 3;
      patrickState.mastery.regenBonus += 1;
    }
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

export async function choosePatrickLeftoverEvolutionBeforeFinalBoss(ctx) {
  if (!hasPatrickInParty(ctx)) return;
  const options = [];

  if (!patrickState.evolutions.hallow) {
    options.push({
      id: "leftoverHallow",
      name: "Hallow Shot",
      icon: PATRICK_SPRITES.abilityHallow,
      description: "Deals double the damage.",
      cost: { luckyCharges: PATRICK_ABILITIES.hallowShot.charges, sp: PATRICK_ABILITIES.hallowShot.sp }
    });
  }
  if (!patrickState.evolutions.piercing) {
    options.push({
      id: "leftoverPiercing",
      name: "Piercing Shot",
      icon: PATRICK_SPRITES.abilityPiercing,
      description: "Pierces through enemies.",
      cost: { luckyCharges: PATRICK_ABILITIES.piercingShot.charges, sp: PATRICK_ABILITIES.piercingShot.sp }
    });
  }
  if (!patrickState.evolutions.aceSpades) {
    options.push({
      id: "leftoverAceSpades",
      name: "Ace of Spades",
      icon: PATRICK_SPRITES.abilityClubs,
      description: "Inflict weakness on enemies.",
      cost: { luckyCharges: PATRICK_ABILITIES.aceSpades.charges, sp: PATRICK_ABILITIES.aceSpades.sp }
    });
  }
  if (!patrickState.evolutions.aceDiamonds) {
    options.push({
      id: "leftoverAceDiamonds",
      name: "Ace of Diamonds",
      icon: PATRICK_SPRITES.abilityDiamonds,
      description: "Inflict strenght on allies.",
      cost: { luckyCharges: PATRICK_ABILITIES.aceDiamonds.charges, sp: PATRICK_ABILITIES.aceDiamonds.sp }
    });
  }
  if (!patrickState.evolutions.dualWielding) {
    options.push({
      id: "leftoverDualWielding",
      name: "Dual Wielding",
      icon: PATRICK_SPRITES.abilityDual,
      description: "Hitting two birds with one stone.",
      cost: { luckyCharges: PATRICK_ABILITIES.dualWielding.charges, sp: PATRICK_ABILITIES.dualWielding.sp }
    });
  }
  if (!patrickState.evolutions.magnumShot) {
    options.push({
      id: "leftoverMagnumShot",
      name: "Magnum Shot",
      icon: PATRICK_SPRITES.abilityMagnum,
      description: "Stuns enemies.",
      cost: { luckyCharges: PATRICK_ABILITIES.magnumShot.charges, sp: PATRICK_ABILITIES.magnumShot.sp }
    });
  }
  if (!patrickState.evolutions.sixShooter) {
    options.push({
      id: "leftoverSixShooter",
      name: "Six Shooter",
      icon: PATRICK_SPRITES.abilitySix,
      description: "That's a lot of damage!",
      cost: { luckyCharges: PATRICK_ABILITIES.sixShooter.charges, sp: PATRICK_ABILITIES.sixShooter.sp }
    });
  }
  if (!patrickState.evolutions.aceHearts) {
    options.push({
      id: "leftoverAceHearts",
      name: "Ace of Hearts",
      icon: PATRICK_SPRITES.abilityHearts,
      description: "Cripple down enemies and regain SP.",
      cost: { luckyCharges: PATRICK_ABILITIES.aceHearts.charges, sp: PATRICK_ABILITIES.aceHearts.sp }
    });
  }

  if (!options.length) return;

  await withPatrickFocus(ctx, async () => {
    const choice = await ctx.chooseFromOverlay({
      title: "Last Chance Upgrade",
      subtitle: "Choose one leftover boss skill before the final battle.",
      options,
      requireConfirm: true
    });
    if (choice === "leftoverHallow") patrickState.evolutions.hallow = true;
    if (choice === "leftoverPiercing") patrickState.evolutions.piercing = true;
    if (choice === "leftoverAceSpades") patrickState.evolutions.aceSpades = true;
    if (choice === "leftoverAceDiamonds") patrickState.evolutions.aceDiamonds = true;
    if (choice === "leftoverDualWielding") patrickState.evolutions.dualWielding = true;
    if (choice === "leftoverMagnumShot") patrickState.evolutions.magnumShot = true;
    if (choice === "leftoverSixShooter") patrickState.evolutions.sixShooter = true;
    if (choice === "leftoverAceHearts") patrickState.evolutions.aceHearts = true;
    ctx.refreshUI?.();
    ctx.startIdleAnimations?.();
  });
}

function ensurePatrickAbilityController(ctx) {
  if (patrickState.abilityController) return patrickState.abilityController;
  patrickState.abilityController = createPatrickAbilityController(ctx);
  return patrickState.abilityController;
}

function safeAction(ctx, action) {
  return async () => {
    if (ctx.isActionsLocked?.()) return;
    try {
      await action();
    } catch (err) {
      console.error("Patrick ability failed:", err);
      ctx.addLog?.("Patrick ability failed.", "fatal-red");
      ctx.setActionsLocked?.(false);
    }
  };
}

function refreshPatrickUi(ctx) {
  ctx.refreshUI?.();
  ctx.renderCombatActions?.();
}

function patrickAbilityDescriptionLines(ctx) {
  const headsPct = Math.round(headsChance() * 100);
  const revolverDamage = gunBaseDamage();
  return {
    coin: `Better start flippin'\nYou land ${headsPct}% heads.`,
    rev: `Always by your side\nDeals ${revolverDamage} damage.`,
    fine: "Resets weakness power\nClears bad status ailments.",
    ins: "Call for health insurance.",
    ps: "Pierces through enemies.",
    hb: "Deals double the damage.",
    ms: "Stuns enemies.",
    dw: "Hitting two birds with one stone.",
    as: "Inflict weakness on enemies.",
    ad: "Inflict strenght on allies.",
    ah: "Cripple down enemies and regain SP.",
    ss: "That's a lot of damage!"
  };
}

function createPatrickAbilityController(ctx) {
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

  const coin = safeAction(ctx, async () => {
    await queueOrRun(async () => {
      const player = ctx.getPlayer?.();
      if (!player) return;
      ctx.setActionsLocked(true);
      ctx.playSfx?.("coinFlip", 0.6);
      const frames = await getPatrickCoinFrames(ctx);
      await playPatrickFrames(ctx, frames, [PATRICK_SPRITES.base], 80);

      const heads = Math.random() < headsChance();
      ctx.addLog?.("Patrick flips a coin.", "attack-white");
      if (heads) {
        ctx.addLuckyCharges?.(1 + luckyBonusGain());
        player.sp = Math.min(player.maxSp || 0, (player.sp || 0) + patrickCoinFlipSpGain(player, 4));
      } else {
        player.sp = Math.min(player.maxSp || 0, (player.sp || 0) + patrickCoinFlipSpGain(player, 2));
        const weaknessPower = applyCoinFlipWeakness(ctx, player);
        void weaknessPower;
      }

      refreshPatrickUi(ctx);
      await ctx.resolvePostPlayerAction?.();
    });
  });

  const revolver = safeAction(ctx, async () => {
    const player = ctx.getPlayer?.();
    if (!canAffordAbility(player, PATRICK_ABILITIES.revolver) || !livingEnemies(ctx).length) return;
    ctx.setPlayerSkillFeedback?.();
    await queuePreparedOrRun(
      PATRICK_ABILITIES.revolver,
      () => choosePatrickEnemyTarget(ctx, "Revolver"),
      async (target) => {
        ctx.setActionsLocked(true);
        spendAbilityCost(ctx, player, PATRICK_ABILITIES.revolver);
        const charge = await holdPatrickAimDuringMash(ctx, runPatrickMash(ctx, {
          markerFractions: [0.25, 0.5, 0.75]
        }));
        const frames = await getPatrickRevolverFrames(ctx);

        const bonusDamage = revolverBonusDamage(charge);
        ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.revolver.name, ctx.enemyLabel?.(target) || "the target");
        await firePatrickShot(ctx, target, PATRICK_SPRITES.bullet, {
          frames,
          frameSpeed: 75,
          shotVolume: 0.6
        });
        await ctx.applyDamageToEnemy?.(target, gunBaseDamage() + bonusDamage);
        if (bonusDamage > 0) ctx.setPlayerSkillFeedback?.(`+${bonusDamage} DMG`, "great");

        refreshPatrickUi(ctx);
        await ctx.resolvePostPlayerAction?.();
      }
    );
  });

  const feelingFine = safeAction(ctx, async () => {
    await queueOrRun(async () => {
      const player = ctx.getPlayer?.();
      if (!canAffordAbility(player, PATRICK_ABILITIES.feelingFine)) return;
      ctx.setActionsLocked(true);
      spendAbilityCost(ctx, player, PATRICK_ABILITIES.feelingFine);
      ensurePatrickCombatState(player).storedWeaknessPower = 0;
      clearBadStatuses(ctx, player);
      setInsuranceState(player, false);
      ctx.addLog?.("Patrick is Feelin' Fine!", "cast-green");
      refreshPatrickUi(ctx);
      await ctx.resolvePostPlayerAction?.();
    });
  });

  const insurance = safeAction(ctx, async () => {
    await queueOrRun(async () => {
      const player = ctx.getPlayer?.();
      if (!canAffordAbility(player, PATRICK_ABILITIES.healthInsurance)) return;
      ctx.setActionsLocked(true);
      spendAbilityCost(ctx, player, PATRICK_ABILITIES.healthInsurance);

      const healAmount = healthInsuranceHealAmount(ctx);
      const regenPower = healthInsuranceRegenPower(ctx);
      const regenTurns = healthInsuranceRegenTurns(ctx);
      player.hp = Math.min(player.maxHp || 1, (player.hp || 0) + healAmount);
      ctx.applyStatus?.(player, "regen", regenPower, regenTurns);
      setInsuranceState(player, true);
      await ctx.animatePlayerHeal?.();
      ctx.addLog?.("Patrick calls for Health Insurance.", "cast-green");

      refreshPatrickUi(ctx);
      await ctx.resolvePostPlayerAction?.();
    });
  });

  const hallow = safeAction(ctx, async () => {
    const player = ctx.getPlayer?.();
    if (!canAffordAbility(player, PATRICK_ABILITIES.hallowShot) || !livingEnemies(ctx).length) return;
    ctx.setPlayerSkillFeedback?.();
    await queuePreparedOrRun(
      PATRICK_ABILITIES.hallowShot,
      () => choosePatrickEnemyTarget(ctx, "Hallow Shot"),
      async (target) => {
        ctx.setActionsLocked(true);
        spendAbilityCost(ctx, player, PATRICK_ABILITIES.hallowShot);
        const charge = await holdPatrickAimDuringMash(ctx, runPatrickMash(ctx, {
          markerFractions: [0.25, 0.5, 0.75]
        }));
        const frames = await getPatrickRevolverFrames(ctx);

        const baseDamage = gunBaseDamage();
        const totalDamage = (baseDamage * 2) + revolverBonusDamage(charge, baseDamage);
        ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.hallowShot.name, ctx.enemyLabel?.(target) || "the target");
        await firePatrickShot(ctx, target, PATRICK_SPRITES.hallowBullet, {
          frames,
          frameSpeed: 75,
          shotVolume: 0.65
        });
        await ctx.applyDamageToEnemy?.(target, totalDamage);
        ctx.setPlayerSkillFeedback?.("Heavy hit!", "great");

        refreshPatrickUi(ctx);
        await ctx.resolvePostPlayerAction?.();
      }
    );
  });

  const piercing = safeAction(ctx, async () => {
    await queueOrRun(async () => {
      const player = ctx.getPlayer?.();
      if (!canAffordAbility(player, PATRICK_ABILITIES.piercingShot) || !livingEnemies(ctx).length) return;
      ctx.setActionsLocked(true);
      spendAbilityCost(ctx, player, PATRICK_ABILITIES.piercingShot);
      const charge = await holdPatrickAimDuringMash(ctx, runPatrickMash(ctx, {
        markerFractions: [1 / 3, 2 / 3]
      }));
      const frames = await getPatrickRevolverFrames(ctx);

      const damage = gunBaseDamage();
      const targets = livingEnemies(ctx).slice(0, piercingTargetCount(charge));
      if (targets.length) {
        if (targets.length === 1) ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.piercingShot.name, ctx.enemyLabel?.(targets[0]) || "the target");
        else ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.piercingShot.name);
      }
      if (targets.length) {
        await firePatrickShot(ctx, targets[0], PATRICK_SPRITES.bullet, {
          frames,
          frameSpeed: 75,
          shotVolume: 0.6
        });
      }
      for (const target of targets) {
        await ctx.applyDamageToEnemy?.(target, damage);
      }

      refreshPatrickUi(ctx);
      await ctx.resolvePostPlayerAction?.();
    });
  });

  const aceSpades = safeAction(ctx, async () => {
    await queueOrRun(async () => {
      const player = ctx.getPlayer?.();
      if (!canAffordAbility(player, PATRICK_ABILITIES.aceSpades) || !livingEnemies(ctx).length) return;
      ctx.setActionsLocked(true);
      spendAbilityCost(ctx, player, PATRICK_ABILITIES.aceSpades);
      ctx.addLog?.("Patrick has an ace up their sleeve.", "attack-white");
      await playPatrickAceCast(ctx, PATRICK_SHEET_ROWS.aceSpadesBg);
      livingEnemies(ctx).forEach((enemy) => {
        ctx.applyStatus?.(enemy, "weakness", PATRICK_ABILITIES.aceSpades.power, PATRICK_ABILITIES.aceSpades.turns);
      });
      refreshPatrickUi(ctx);
      await ctx.resolvePostPlayerAction?.();
    });
  });

  const aceDiamonds = safeAction(ctx, async () => {
    await queueOrRun(async () => {
      const player = ctx.getPlayer?.();
      if (!canAffordAbility(player, PATRICK_ABILITIES.aceDiamonds)) return;
      ctx.setActionsLocked(true);
      spendAbilityCost(ctx, player, PATRICK_ABILITIES.aceDiamonds);
      ctx.addLog?.("Patrick has an ace up their sleeve.", "attack-white");
      await playPatrickAceCast(ctx, PATRICK_SHEET_ROWS.aceDiamondsBg);
      livingAllies(ctx).forEach((ally) => {
        ctx.applyStatus?.(ally, "strenght", PATRICK_ABILITIES.aceDiamonds.power, PATRICK_ABILITIES.aceDiamonds.turns);
      });
      refreshPatrickUi(ctx);
      await ctx.resolvePostPlayerAction?.();
    });
  });

  const dualWielding = safeAction(ctx, async () => {
    const player = ctx.getPlayer?.();
    if (!canAffordAbility(player, PATRICK_ABILITIES.dualWielding) || !livingEnemies(ctx).length) return;
    ctx.setPlayerSkillFeedback?.();
    await queuePreparedOrRun(
      PATRICK_ABILITIES.dualWielding,
      () => choosePatrickEnemyTargets(ctx, "Dual Wielding", 2, true),
      async (targets) => {
        ctx.setActionsLocked(true);
        spendAbilityCost(ctx, player, PATRICK_ABILITIES.dualWielding);
        const charge = await holdPatrickAimDuringMash(ctx, runPatrickMash(ctx, {
          markerFractions: [0.25, 0.5, 0.75]
        }));
        const revolverFrames = await getPatrickRevolverFrames(ctx);
        const dualFrames = await getPatrickDualFrames(ctx);

        const shotDamage = gunBaseDamage() + revolverBonusDamage(charge);
        if (targets[1] && targets[0]?.id === targets[1]?.id) {
          ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.dualWielding.name, ctx.enemyLabel?.(targets[0]) || "the target");
        } else if (targets[1]) {
          ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.dualWielding.name);
        } else if (targets[0]) {
          ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.dualWielding.name, ctx.enemyLabel?.(targets[0]) || "the target");
        }
        await firePatrickShot(ctx, targets[0], PATRICK_SPRITES.bullet, {
          frames: revolverFrames,
          frameSpeed: 75,
          shotVolume: 0.6
        });
        await ctx.applyDamageToEnemy?.(targets[0], shotDamage);
        if (targets[1]) {
          await firePatrickShot(ctx, targets[1], PATRICK_SPRITES.bullet, {
            frames: dualFrames,
            frameSpeed: 70,
            shotVolume: 0.58
          });
          await ctx.applyDamageToEnemy?.(targets[1], shotDamage);
        }

        refreshPatrickUi(ctx);
        await ctx.resolvePostPlayerAction?.();
      }
    );
  });

  const magnumShot = safeAction(ctx, async () => {
    const player = ctx.getPlayer?.();
    if (!canAffordAbility(player, PATRICK_ABILITIES.magnumShot) || !livingEnemies(ctx).length) return;
    ctx.setPlayerSkillFeedback?.();
    await queuePreparedOrRun(
      PATRICK_ABILITIES.magnumShot,
      () => choosePatrickEnemyTarget(ctx, "Magnum Shot"),
      async (target) => {
        ctx.setActionsLocked(true);
        spendAbilityCost(ctx, player, PATRICK_ABILITIES.magnumShot);
        const charge = await holdPatrickAimDuringMash(ctx, runPatrickMash(ctx, {
          markerFractions: [0.5]
        }));
        const frames = await getPatrickRevolverFrames(ctx);

        const bonusDamage = revolverBonusDamage(charge);
        const stunTurns = magnumStunTurns(charge);
        ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.magnumShot.name, ctx.enemyLabel?.(target) || "the target");
        await firePatrickShot(ctx, target, PATRICK_SPRITES.magnumBullet, {
          frames,
          frameSpeed: 75,
          shotVolume: 0.65
        });
        await ctx.applyDamageToEnemy?.(target, gunBaseDamage() + bonusDamage);
        if (stunTurns > 0) {
          ctx.applyStatus?.(target, "stunned", 10, stunTurns);
          ctx.setPlayerSkillFeedback?.(`Stun P10 ${stunTurns}t`, "great");
        }

        refreshPatrickUi(ctx);
        await ctx.resolvePostPlayerAction?.();
      }
    );
  });

  const sixShooter = safeAction(ctx, async () => {
    const player = ctx.getPlayer?.();
    if (!canAffordAbility(player, PATRICK_ABILITIES.sixShooter) || !livingEnemies(ctx).length) return;
    ctx.setPlayerSkillFeedback?.();
    await queuePreparedOrRun(
      PATRICK_ABILITIES.sixShooter,
      () => choosePatrickEnemyTarget(ctx, "Six Shooter"),
      async (target) => {
        ctx.setActionsLocked(true);
        spendAbilityCost(ctx, player, PATRICK_ABILITIES.sixShooter);
        const charge = await holdPatrickAimDuringMash(ctx, runPatrickMash(ctx, {
          markerFractions: [0.25, 0.5, 0.75]
        }));
        const frames = await getPatrickRevolverFrames(ctx);

        const bullets = sixShooterBulletCount(charge);
        ctx.logCombatUse?.("Patrick", PATRICK_ABILITIES.sixShooter.name, ctx.enemyLabel?.(target) || "the target");
        for (let i = 0; i < bullets; i += 1) {
          if (!target || target.hp <= 0) break;
          await firePatrickShot(ctx, target, PATRICK_SPRITES.bullet, {
            frames,
            frameSpeed: 60,
            shotVolume: 0.65,
            durationMs: 160
          });
          await ctx.applyDamageToEnemy?.(target, gunBaseDamage());
        }
        ctx.setPlayerSkillFeedback?.(`${bullets} shots`, "great");

        refreshPatrickUi(ctx);
        await ctx.resolvePostPlayerAction?.();
      }
    );
  });

  const aceHearts = safeAction(ctx, async () => {
    await queueOrRun(async () => {
      const player = ctx.getPlayer?.();
      const enemies = livingEnemies(ctx);
      if (!canAffordAbility(player, PATRICK_ABILITIES.aceHearts) || !enemies.length) return;
      ctx.setActionsLocked(true);
      spendAbilityCost(ctx, player, PATRICK_ABILITIES.aceHearts);
      ctx.addLog?.("Patrick has an ace up their sleeve.", "attack-white");
      await playPatrickAceCast(ctx, PATRICK_SHEET_ROWS.aceHeartsBg);

      for (const enemy of enemies) {
        await ctx.applyDamageToEnemy?.(enemy, PATRICK_ABILITIES.aceHearts.damage);
        ctx.applyStatus?.(enemy, "slowness", PATRICK_ABILITIES.aceHearts.slownessPower, PATRICK_ABILITIES.aceHearts.slownessTurns);
      }
      ctx.applyStatus?.(player, "spRegen", PATRICK_ABILITIES.aceHearts.spRegenPower, PATRICK_ABILITIES.aceHearts.spRegenTurns);

      refreshPatrickUi(ctx);
      await ctx.resolvePostPlayerAction?.();
    });
  });

  return {
    coin,
    revolver,
    feelingFine,
    insurance,
    hallow,
    piercing,
    aceSpades,
    aceDiamonds,
    dualWielding,
    magnumShot,
    sixShooter,
    aceHearts
  };
}

function getPatrickAbilitiesToRender() {
  const revolverAbilities = [PATRICK_ABILITIES.revolver];
  if (patrickState.evolutions.hallow) revolverAbilities.push(PATRICK_ABILITIES.hallowShot);
  if (patrickState.evolutions.piercing) revolverAbilities.push(PATRICK_ABILITIES.piercingShot);
  if (patrickState.evolutions.dualWielding) revolverAbilities.push(PATRICK_ABILITIES.dualWielding);
  if (patrickState.evolutions.magnumShot) revolverAbilities.push(PATRICK_ABILITIES.magnumShot);
  if (patrickState.evolutions.sixShooter) revolverAbilities.push(PATRICK_ABILITIES.sixShooter);
  revolverAbilities.sort((a, b) => {
    const chargeDiff = (a.charges || 0) - (b.charges || 0);
    if (chargeDiff !== 0) return chargeDiff;
    return (a.sp || 0) - (b.sp || 0);
  });

  const castAbilities = [
    PATRICK_ABILITIES.feelingFine,
    PATRICK_ABILITIES.healthInsurance
  ].sort((a, b) => {
    const chargeDiff = (a.charges || 0) - (b.charges || 0);
    if (chargeDiff !== 0) return chargeDiff;
    return (a.sp || 0) - (b.sp || 0);
  });

  const aceAbilities = [];
  if (patrickState.evolutions.aceSpades) aceAbilities.push(PATRICK_ABILITIES.aceSpades);
  if (patrickState.evolutions.aceDiamonds) aceAbilities.push(PATRICK_ABILITIES.aceDiamonds);
  if (patrickState.evolutions.aceHearts) aceAbilities.push(PATRICK_ABILITIES.aceHearts);
  aceAbilities.sort((a, b) => {
    const chargeDiff = (a.charges || 0) - (b.charges || 0);
    if (chargeDiff !== 0) return chargeDiff;
    return (a.sp || 0) - (b.sp || 0);
  });

  return [
    PATRICK_ABILITIES.coinFlip,
    ...revolverAbilities,
    ...castAbilities,
    ...aceAbilities
  ];
}

function getPatrickHoverHints(ctx) {
  return patrickAbilityDescriptionLines(ctx);
}

function bindPatrickButton(ctx, ability, handler, disabled) {
  const btn = ctx.getEl?.(ability.id);
  if (!btn) return;
  btn.onclick = () => {
    ctx.setQueuedActionPreview?.(ability);
    return handler();
  };
  btn.disabled = !!disabled;
  ctx.setAbilityLocked?.(btn, !!disabled);
}

export function renderPatrickCombatActions(ctx) {
  const actionsEl = ctx.getEl?.("actions");
  if (!actionsEl) return;

  const abilities = getPatrickAbilitiesToRender();
  actionsEl.innerHTML = abilities.map((ability) => ctx.abilityButtonHtml(ability)).join("");

  const controller = ensurePatrickAbilityController(ctx);
  const player = ctx.getPlayer?.();
  const hasEnemies = livingEnemies(ctx).length > 0;

  bindPatrickButton(ctx, PATRICK_ABILITIES.coinFlip, controller.coin, false);
  bindPatrickButton(ctx, PATRICK_ABILITIES.revolver, controller.revolver, !canAffordAbility(player, PATRICK_ABILITIES.revolver) || !hasEnemies);
  bindPatrickButton(ctx, PATRICK_ABILITIES.feelingFine, controller.feelingFine, !canAffordAbility(player, PATRICK_ABILITIES.feelingFine));
  bindPatrickButton(ctx, PATRICK_ABILITIES.healthInsurance, controller.insurance, !canAffordAbility(player, PATRICK_ABILITIES.healthInsurance));
  bindPatrickButton(ctx, PATRICK_ABILITIES.hallowShot, controller.hallow, !canAffordAbility(player, PATRICK_ABILITIES.hallowShot) || !hasEnemies);
  bindPatrickButton(ctx, PATRICK_ABILITIES.piercingShot, controller.piercing, !canAffordAbility(player, PATRICK_ABILITIES.piercingShot) || !hasEnemies);
  bindPatrickButton(ctx, PATRICK_ABILITIES.aceSpades, controller.aceSpades, !canAffordAbility(player, PATRICK_ABILITIES.aceSpades) || !hasEnemies);
  bindPatrickButton(ctx, PATRICK_ABILITIES.aceDiamonds, controller.aceDiamonds, !canAffordAbility(player, PATRICK_ABILITIES.aceDiamonds));
  bindPatrickButton(ctx, PATRICK_ABILITIES.dualWielding, controller.dualWielding, !canAffordAbility(player, PATRICK_ABILITIES.dualWielding) || !hasEnemies);
  bindPatrickButton(ctx, PATRICK_ABILITIES.magnumShot, controller.magnumShot, !canAffordAbility(player, PATRICK_ABILITIES.magnumShot) || !hasEnemies);
  bindPatrickButton(ctx, PATRICK_ABILITIES.sixShooter, controller.sixShooter, !canAffordAbility(player, PATRICK_ABILITIES.sixShooter) || !hasEnemies);
  bindPatrickButton(ctx, PATRICK_ABILITIES.aceHearts, controller.aceHearts, !canAffordAbility(player, PATRICK_ABILITIES.aceHearts) || !hasEnemies);

  const hoverHints = getPatrickHoverHints(ctx);
  Object.entries(hoverHints).forEach(([id, text]) => {
    const btn = ctx.getEl?.(id);
    if (!btn) return;
    ctx.bindActionButtonHint?.(btn, text);
  });

  ctx.updateAbilityGridScale?.();
  ctx.resetActionSelection?.();
}
