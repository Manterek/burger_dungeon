import { scaleDuration } from "./timing.js";

const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const BOSS_FINAL_SPRITES = {
  base: TRANSPARENT_PIXEL,
  spriteSheet: "sprites/enemy/burger_overlord/overlord.png",
  fry: "sprites/enemy/burger_overlord/fry.png",
  stompWave: "sprites/enemy/burger_overlord/stomp_wave.png"
};

const BOSS_FINAL_FRAME_SIZE = 32;
const BOSS_FINAL_SHEET_CELLS = {
  idlePart1: { row: 0, startCol: 0, frameCount: 4 },
  idlePart2: { row: 0, startCol: 4, frameCount: 4 },
  quickSnackPart1: { row: 1, startCol: 0, frameCount: 4 },
  quickSnackPart2: { row: 1, startCol: 4, frameCount: 4 },
  summonPart1: { row: 2, startCol: 0, frameCount: 4 },
  summonPart2: { row: 2, startCol: 4, frameCount: 4 },
  damagedPart1: { row: 3, col: 0 },
  damagedPart2: { row: 3, col: 1 },
  collapsed: { row: 3, col: 2 },
  trueEnding: { row: 6, col: 1 },
  friesPart1: { row: 3, startCol: 3, frameCount: 2 },
  friesPart2: { row: 3, startCol: 5, frameCount: 2 },
  headBashPart1: { row: 4, startCol: 0, frameCount: 4 },
  headBashPart2: { row: 4, startCol: 4, frameCount: 4 },
  pushbackPart2: { row: 5, startCol: 1, frameCount: 4 },
  walkPart1: [{ row: 0, col: 0 }, { row: 3, col: 7 }],
  walkPart2: [{ row: 0, col: 4 }, { row: 5, col: 0 }],
  stompPart1: { row: 5, startCol: 5, frameCount: 2 },
  stompPart2: [{ row: 5, col: 7 }, { row: 6, col: 0 }],
  slashHeadBash: { row: 7, col: 5 },
  slashPushback: { row: 7, col: 6 },
  slashStomp: { row: 7, col: 7 },
  cape: { row: 7, startCol: 0, frameCount: 4 },
  stompWave: { row: 7, col: 4 }
};

const BOSS_FINAL_ABILITIES = {
  headBash: { damage: 16, stunPower: 5, stunTurns: 2, part2StunPower: 10, part2StunTurns: 1 },
  quickSnack: { heal: 8, regenPower: 1, part2RegenPower: 2, regenTurns: 3 },
  fries: { count: 3, part2Count: 4, damage: 6, firePower: 1, part2FirePower: 2, fireTurns: 3 },
  stomp: { damage: 25, count: 1, part2Count: 3 },
  pushback: { damage: 36, slownessPower: 4, slownessTurns: 2 }
};

const BOSS_FINAL_IDLE_ANIMATION_MS = Math.round(350 / 0.75);

const BOSS_MUSIC = {
  bossFight: "sounds/soundtracks/generic_boss_fight.mp3",
  bossFightVolume: 0.28,
  finalBoss: "sounds/soundtracks/burger_overlord_pt1.mp3",
  finalBossVolume: 0.32,
  finalBossPart2: "sounds/soundtracks/burger_overlord_pt2.mp3",
  finalBossPart2Volume: 0.36
};

const bossState = {
  idleFramesCache: null,
  idleFramesPromise: null,
  idleFramesPart2Cache: null,
  idleFramesPart2Promise: null,
  quickSnackFramesCache: null,
  quickSnackFramesPromise: null,
  quickSnackFramesPart2Cache: null,
  quickSnackFramesPart2Promise: null,
  summonFramesCache: null,
  summonFramesPromise: null,
  summonFramesPart2Cache: null,
  summonFramesPart2Promise: null,
  damagedFrameCache: null,
  damagedFramePromise: null,
  damagedFramePart2Cache: null,
  damagedFramePart2Promise: null,
  collapsedFrameCache: null,
  collapsedFramePromise: null,
  trueEndingFrameCache: null,
  trueEndingFramePromise: null,
  headBashFramesCache: null,
  headBashFramesPromise: null,
  headBashFramesPart2Cache: null,
  headBashFramesPart2Promise: null,
  pushbackFramesPart2Cache: null,
  pushbackFramesPart2Promise: null,
  slashHeadBashCache: null,
  slashHeadBashPromise: null,
  slashPushbackCache: null,
  slashPushbackPromise: null,
  slashStompCache: null,
  slashStompPromise: null,
  friesFramesCache: null,
  friesFramesPromise: null,
  friesFramesPart2Cache: null,
  friesFramesPart2Promise: null,
  stompFramesCache: null,
  stompFramesPromise: null,
  stompFramesPart2Cache: null,
  stompFramesPart2Promise: null,
  walkFramesCache: null,
  walkFramesPromise: null,
  walkFramesPart2Cache: null,
  walkFramesPart2Promise: null,
  capeFramesCache: null,
  capeFramesPromise: null,
  idleTimer: null,
  capeTimer: null,
  bossFightMusic: null
};

let musicVolumeMultiplier = 1;

function pingPongFrames(frames) {
  if (!Array.isArray(frames) || frames.length <= 1) return Array.isArray(frames) ? [...frames] : [];
  const backward = frames.slice(1, frames.length - 1).reverse();
  return [...frames, ...backward];
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

async function getBossFinalSheetFrames(entry) {
  if (!entry) return [BOSS_FINAL_SPRITES.base];
  if (Array.isArray(entry)) {
    const frames = await Promise.all(entry.map((cell) => cropSpriteSheetCell(
      BOSS_FINAL_SPRITES.spriteSheet,
      BOSS_FINAL_FRAME_SIZE,
      cell.row,
      cell.col
    )));
    return frames.filter(Boolean);
  }
  if (typeof entry.col === "number") {
    return [await cropSpriteSheetCell(BOSS_FINAL_SPRITES.spriteSheet, BOSS_FINAL_FRAME_SIZE, entry.row, entry.col)];
  }
  const frames = [];
  for (let idx = 0; idx < entry.frameCount; idx += 1) {
    frames.push(await cropSpriteSheetCell(
      BOSS_FINAL_SPRITES.spriteSheet,
      BOSS_FINAL_FRAME_SIZE,
      entry.row,
      entry.startCol + idx
    ));
  }
  return frames;
}

export function getBossFinalSprites() {
  return BOSS_FINAL_SPRITES;
}

export function getBossFinalEnemySprites() {
  return {
    idle: [BOSS_FINAL_SPRITES.base],
    attack: [BOSS_FINAL_SPRITES.base],
    damaged: [BOSS_FINAL_SPRITES.base],
    block: [BOSS_FINAL_SPRITES.base],
    summon: [BOSS_FINAL_SPRITES.base],
    quickSnack: [BOSS_FINAL_SPRITES.base],
    collapsed: [BOSS_FINAL_SPRITES.base]
  };
}

export function isFinalBoss(enemy) {
  return !!enemy && enemy.boss && enemy.name === "Burger Overlord";
}

export function isFinalBossPart2(enemy) {
  return isFinalBoss(enemy) && enemy.overlordPart === 2;
}

export async function getBossFinalIdleFrames(ctx) {
  if (bossState.idleFramesCache) return bossState.idleFramesCache;
  if (!bossState.idleFramesPromise) {
    bossState.idleFramesPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.idlePart1).then((frames) => {
      const idleFrames = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.idleFramesCache = idleFrames;
      BOSS_FINAL_SPRITES.base = idleFrames[0] || BOSS_FINAL_SPRITES.base;
      return idleFrames;
    });
  }
  return bossState.idleFramesPromise;
}

export async function getBossFinalIdleFramesPart2(ctx) {
  if (bossState.idleFramesPart2Cache) return bossState.idleFramesPart2Cache;
  if (!bossState.idleFramesPart2Promise) {
    bossState.idleFramesPart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.idlePart2).then((frames) => {
      const idleFrames = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.idleFramesPart2Cache = idleFrames;
      return idleFrames;
    });
  }
  return bossState.idleFramesPart2Promise;
}

export function bossFinalQuickSnackFrames(part = 1) {
  if (part >= 2) {
    return bossState.quickSnackFramesPart2Cache && bossState.quickSnackFramesPart2Cache.length
      ? bossState.quickSnackFramesPart2Cache
      : [BOSS_FINAL_SPRITES.base];
  }
  return bossState.quickSnackFramesCache && bossState.quickSnackFramesCache.length
    ? bossState.quickSnackFramesCache
    : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalSummonFrames(part = 1) {
  if (part >= 2) {
    return bossState.summonFramesPart2Cache && bossState.summonFramesPart2Cache.length
      ? bossState.summonFramesPart2Cache
      : [BOSS_FINAL_SPRITES.base];
  }
  return bossState.summonFramesCache && bossState.summonFramesCache.length
    ? bossState.summonFramesCache
    : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalDamagedFrames(part = 1) {
  if (part >= 2) {
    return bossState.damagedFramePart2Cache && bossState.damagedFramePart2Cache.length
      ? bossState.damagedFramePart2Cache
      : [BOSS_FINAL_SPRITES.base];
  }
  return bossState.damagedFrameCache && bossState.damagedFrameCache.length
    ? bossState.damagedFrameCache
    : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalCollapsedFrames() {
  return bossState.collapsedFrameCache && bossState.collapsedFrameCache.length
    ? bossState.collapsedFrameCache
    : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalTrueEndingFrames() {
  return bossState.trueEndingFrameCache && bossState.trueEndingFrameCache.length
    ? bossState.trueEndingFrameCache
    : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalPushbackFrames() {
  return bossState.pushbackFramesPart2Cache && bossState.pushbackFramesPart2Cache.length
    ? bossState.pushbackFramesPart2Cache
    : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalSlashFrame(kind = "headBash") {
  if (kind === "pushback") {
    return bossState.slashPushbackCache?.[0] || BOSS_FINAL_SPRITES.base;
  }
  if (kind === "stomp") {
    return bossState.slashStompCache?.[0] || BOSS_FINAL_SPRITES.base;
  }
  return bossState.slashHeadBashCache?.[0] || BOSS_FINAL_SPRITES.base;
}

export async function getBossFinalQuickSnackFrames(part = 1) {
  if (part >= 2) {
    if (bossState.quickSnackFramesPart2Cache) return bossState.quickSnackFramesPart2Cache;
    if (!bossState.quickSnackFramesPart2Promise) {
      bossState.quickSnackFramesPart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.quickSnackPart2).then((frames) => {
        const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
        bossState.quickSnackFramesPart2Cache = resolved;
        return resolved;
      });
    }
    return bossState.quickSnackFramesPart2Promise;
  }
  if (bossState.quickSnackFramesCache) return bossState.quickSnackFramesCache;
  if (!bossState.quickSnackFramesPromise) {
    bossState.quickSnackFramesPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.quickSnackPart1).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.quickSnackFramesCache = resolved;
      return resolved;
    });
  }
  return bossState.quickSnackFramesPromise;
}

export async function getBossFinalSummonFrames(part = 1) {
  if (part >= 2) {
    if (bossState.summonFramesPart2Cache) return bossState.summonFramesPart2Cache;
    if (!bossState.summonFramesPart2Promise) {
      bossState.summonFramesPart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.summonPart2).then((frames) => {
        const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
        bossState.summonFramesPart2Cache = resolved;
        return resolved;
      });
    }
    return bossState.summonFramesPart2Promise;
  }
  if (bossState.summonFramesCache) return bossState.summonFramesCache;
  if (!bossState.summonFramesPromise) {
    bossState.summonFramesPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.summonPart1).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.summonFramesCache = resolved;
      return resolved;
    });
  }
  return bossState.summonFramesPromise;
}

export async function getBossFinalDamagedFrames(part = 1) {
  if (part >= 2) {
    if (bossState.damagedFramePart2Cache) return bossState.damagedFramePart2Cache;
    if (!bossState.damagedFramePart2Promise) {
      bossState.damagedFramePart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.damagedPart2).then((frames) => {
        const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
        bossState.damagedFramePart2Cache = resolved;
        return resolved;
      });
    }
    return bossState.damagedFramePart2Promise;
  }
  if (bossState.damagedFrameCache) return bossState.damagedFrameCache;
  if (!bossState.damagedFramePromise) {
    bossState.damagedFramePromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.damagedPart1).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.damagedFrameCache = resolved;
      return resolved;
    });
  }
  return bossState.damagedFramePromise;
}

export async function getBossFinalCollapsedFrames() {
  if (bossState.collapsedFrameCache) return bossState.collapsedFrameCache;
  if (!bossState.collapsedFramePromise) {
    bossState.collapsedFramePromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.collapsed).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.collapsedFrameCache = resolved;
      return resolved;
    });
  }
  return bossState.collapsedFramePromise;
}

export async function getBossFinalTrueEndingFrames() {
  if (bossState.trueEndingFrameCache) return bossState.trueEndingFrameCache;
  if (!bossState.trueEndingFramePromise) {
    bossState.trueEndingFramePromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.trueEnding).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.trueEndingFrameCache = resolved;
      return resolved;
    });
  }
  return bossState.trueEndingFramePromise;
}

export async function getBossFinalCapeFrames(ctx) {
  if (bossState.capeFramesCache) return bossState.capeFramesCache;
  if (!bossState.capeFramesPromise) {
    bossState.capeFramesPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.cape).then((frames) => {
      const capeFrames = frames.length ? pingPongFrames(frames) : [BOSS_FINAL_SPRITES.base];
      bossState.capeFramesCache = capeFrames;
      return capeFrames;
    });
  }
  return bossState.capeFramesPromise;
}

export async function getBossFinalHeadBashFrames(part = 1) {
  if (part >= 2) {
    if (bossState.headBashFramesPart2Cache) return bossState.headBashFramesPart2Cache;
    if (!bossState.headBashFramesPart2Promise) {
      bossState.headBashFramesPart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.headBashPart2).then((frames) => {
        const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
        bossState.headBashFramesPart2Cache = resolved;
        return resolved;
      });
    }
    return bossState.headBashFramesPart2Promise;
  }
  if (bossState.headBashFramesCache) return bossState.headBashFramesCache;
  if (!bossState.headBashFramesPromise) {
    bossState.headBashFramesPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.headBashPart1).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.headBashFramesCache = resolved;
      return resolved;
    });
  }
  return bossState.headBashFramesPromise;
}

export async function getBossFinalPushbackFrames() {
  if (bossState.pushbackFramesPart2Cache) return bossState.pushbackFramesPart2Cache;
  if (!bossState.pushbackFramesPart2Promise) {
    bossState.pushbackFramesPart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.pushbackPart2).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.pushbackFramesPart2Cache = resolved;
      return resolved;
    });
  }
  return bossState.pushbackFramesPart2Promise;
}

async function getBossFinalSlashFrame(kind = "headBash") {
  if (kind === "pushback") {
    if (bossState.slashPushbackCache) return bossState.slashPushbackCache;
    if (!bossState.slashPushbackPromise) {
      bossState.slashPushbackPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.slashPushback).then((frames) => {
        const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
        bossState.slashPushbackCache = resolved;
        return resolved;
      });
    }
    return bossState.slashPushbackPromise;
  }
  if (kind === "stomp") {
    if (bossState.slashStompCache) return bossState.slashStompCache;
    if (!bossState.slashStompPromise) {
      bossState.slashStompPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.slashStomp).then((frames) => {
        const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
        bossState.slashStompCache = resolved;
        return resolved;
      });
    }
    return bossState.slashStompPromise;
  }
  if (bossState.slashHeadBashCache) return bossState.slashHeadBashCache;
  if (!bossState.slashHeadBashPromise) {
    bossState.slashHeadBashPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.slashHeadBash).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.slashHeadBashCache = resolved;
      return resolved;
    });
  }
  return bossState.slashHeadBashPromise;
}

export async function getBossFinalFriesFrames(part = 1) {
  if (part >= 2) {
    if (bossState.friesFramesPart2Cache) return bossState.friesFramesPart2Cache;
    if (!bossState.friesFramesPart2Promise) {
      bossState.friesFramesPart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.friesPart2).then((frames) => {
        const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
        bossState.friesFramesPart2Cache = resolved;
        return resolved;
      });
    }
    return bossState.friesFramesPart2Promise;
  }
  if (bossState.friesFramesCache) return bossState.friesFramesCache;
  if (!bossState.friesFramesPromise) {
    bossState.friesFramesPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.friesPart1).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.friesFramesCache = resolved;
      return resolved;
    });
  }
  return bossState.friesFramesPromise;
}

export async function getBossFinalStompFrames(part = 1) {
  if (part >= 2) {
    if (bossState.stompFramesPart2Cache) return bossState.stompFramesPart2Cache;
    if (!bossState.stompFramesPart2Promise) {
      bossState.stompFramesPart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.stompPart2).then((frames) => {
        const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
        bossState.stompFramesPart2Cache = resolved;
        return resolved;
      });
    }
    return bossState.stompFramesPart2Promise;
  }
  if (bossState.stompFramesCache) return bossState.stompFramesCache;
  if (!bossState.stompFramesPromise) {
    bossState.stompFramesPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.stompPart1).then((frames) => {
      const resolved = frames.length ? frames : [BOSS_FINAL_SPRITES.base];
      bossState.stompFramesCache = resolved;
      return resolved;
    });
  }
  return bossState.stompFramesPromise;
}

export async function getBossFinalWalkFrames(part = 1) {
  if (part >= 2) {
    if (bossState.walkFramesPart2Cache) return bossState.walkFramesPart2Cache;
    if (!bossState.walkFramesPart2Promise) {
      bossState.walkFramesPart2Promise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.walkPart2).then((frames) => {
        const resolved = frames.length ? frames : bossFinalIdleFrames(2);
        bossState.walkFramesPart2Cache = resolved;
        return resolved;
      });
    }
    return bossState.walkFramesPart2Promise;
  }
  if (bossState.walkFramesCache) return bossState.walkFramesCache;
  if (!bossState.walkFramesPromise) {
    bossState.walkFramesPromise = getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.walkPart1).then((frames) => {
      const resolved = frames.length ? frames : bossFinalIdleFrames(1);
      bossState.walkFramesCache = resolved;
      return resolved;
    });
  }
  return bossState.walkFramesPromise;
}

export function bossFinalIdleFrames(part = 1) {
  if (part >= 2) {
    return bossState.idleFramesPart2Cache && bossState.idleFramesPart2Cache.length
      ? bossState.idleFramesPart2Cache
      : [BOSS_FINAL_SPRITES.base];
  }
  return bossState.idleFramesCache && bossState.idleFramesCache.length
    ? bossState.idleFramesCache
    : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalCapeFrames() {
  return bossState.capeFramesCache && bossState.capeFramesCache.length
    ? bossState.capeFramesCache
    : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalHeadBashFrames(part = 1) {
  if (part >= 2) return bossState.headBashFramesPart2Cache?.length ? bossState.headBashFramesPart2Cache : [BOSS_FINAL_SPRITES.base];
  return bossState.headBashFramesCache?.length ? bossState.headBashFramesCache : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalPushbackFramesPart2() {
  return bossState.pushbackFramesPart2Cache?.length ? bossState.pushbackFramesPart2Cache : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalFriesFrames(part = 1) {
  if (part >= 2) return bossState.friesFramesPart2Cache?.length ? bossState.friesFramesPart2Cache : [BOSS_FINAL_SPRITES.base];
  return bossState.friesFramesCache?.length ? bossState.friesFramesCache : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalStompFrames(part = 1) {
  if (part >= 2) return bossState.stompFramesPart2Cache?.length ? bossState.stompFramesPart2Cache : [BOSS_FINAL_SPRITES.base];
  return bossState.stompFramesCache?.length ? bossState.stompFramesCache : [BOSS_FINAL_SPRITES.base];
}

export function bossFinalWalkFrames(part = 1) {
  if (part >= 2) return bossState.walkFramesPart2Cache?.length ? bossState.walkFramesPart2Cache : bossFinalIdleFrames(2);
  return bossState.walkFramesCache?.length ? bossState.walkFramesCache : bossFinalIdleFrames(1);
}

export function preloadBossFinalVisuals(ctx) {
  void getBossFinalIdleFrames(ctx);
  void getBossFinalIdleFramesPart2(ctx);
  void getBossFinalQuickSnackFrames(1);
  void getBossFinalQuickSnackFrames(2);
  void getBossFinalSummonFrames(1);
  void getBossFinalSummonFrames(2);
  void getBossFinalDamagedFrames(1);
  void getBossFinalDamagedFrames(2);
  void getBossFinalHeadBashFrames(1);
  void getBossFinalHeadBashFrames(2);
  void getBossFinalPushbackFrames();
  void getBossFinalSlashFrame("headBash");
  void getBossFinalSlashFrame("pushback");
  void getBossFinalSlashFrame("stomp");
  void getBossFinalFriesFrames(1);
  void getBossFinalFriesFrames(2);
  void getBossFinalStompFrames(1);
  void getBossFinalStompFrames(2);
  void getBossFinalWalkFrames(1);
  void getBossFinalWalkFrames(2);
  void getBossFinalCollapsedFrames().then((frames) => {
    const resolved = frames[0] || BOSS_FINAL_SPRITES.base;
    bossState.collapsedFrameCache = [resolved];
  });
  void getBossFinalTrueEndingFrames();
  void getBossFinalCapeFrames(ctx);
  void getBossFinalSheetFrames(BOSS_FINAL_SHEET_CELLS.stompWave).then((frames) => {
    BOSS_FINAL_SPRITES.stompWave = frames[0] || BOSS_FINAL_SPRITES.stompWave;
  });
}

export function runBossFinalIdleAnimation(ctx, speedMs) {
  let idx = 0;
  return setInterval(() => {
    idx += 1;
    ctx.getEnemies().forEach((enemy) => {
      if (!isFinalBoss(enemy)) return;
      if (enemy.animating) return;
      if (enemy.overlordSceneCollapsed || enemy.hp <= 0) {
        const img = ctx.getEl(`enemy-sprite-${enemy.id}`);
        if (img) img.src = bossFinalCollapsedFrames()[0] || BOSS_FINAL_SPRITES.base;
        return;
      }
      const frames = bossFinalIdleFrames(isFinalBossPart2(enemy) ? 2 : 1);
      const img = ctx.getEl(`enemy-sprite-${enemy.id}`);
      if (!img || !frames.length) return;
      const set = ctx.enemySpriteSet(enemy);
      img.src = enemy.blocking ? set.block[0] : frames[idx % frames.length];
    });
  }, speedMs);
}

export function runBossFinalCapeAnimation(ctx, speedMs) {
  let idx = 0;
  return setInterval(() => {
    idx += 1;
    ctx.getEnemies().forEach((enemy) => {
      if (!isFinalBoss(enemy)) return;
      const frames = bossFinalCapeFrames();
      const img = ctx.getEl(`enemy-cape-${enemy.id}`);
      if (!img || !frames.length) return;
      img.style.display = "";
      img.src = frames[idx % frames.length];
    });
  }, Math.max(1, Math.round(speedMs * 0.75)));
}

export function startBossFinalAnimations(ctx, { idleMs, capeMs }) {
  if (bossState.idleTimer) clearInterval(bossState.idleTimer);
  if (bossState.capeTimer) clearInterval(bossState.capeTimer);
  bossState.idleTimer = runBossFinalIdleAnimation(ctx, idleMs);
  bossState.capeTimer = runBossFinalCapeAnimation(ctx, capeMs);
}

export function stopBossFinalAnimations() {
  if (bossState.idleTimer) clearInterval(bossState.idleTimer);
  if (bossState.capeTimer) clearInterval(bossState.capeTimer);
  bossState.idleTimer = null;
  bossState.capeTimer = null;
}

export function stopBossMusic() {
  if (!bossState.bossFightMusic) return;
  bossState.bossFightMusic.pause();
  bossState.bossFightMusic.currentTime = 0;
}

export function setBossMusicVolumeMultiplier(multiplier = 1) {
  musicVolumeMultiplier = Math.max(0, Math.min(1, Number(multiplier) || 0));
  if (!bossState.bossFightMusic) return;
  const src = bossState.bossFightMusic.src || "";
  let baseVolume = BOSS_MUSIC.bossFightVolume;
  if (src.endsWith(BOSS_MUSIC.finalBossPart2)) baseVolume = BOSS_MUSIC.finalBossPart2Volume;
  else if (src.endsWith(BOSS_MUSIC.finalBoss)) baseVolume = BOSS_MUSIC.finalBossVolume;
  bossState.bossFightMusic.volume = baseVolume * musicVolumeMultiplier;
}

export function syncBossMusic(level, finalBossPart = 1) {
  const shouldPlayBossMusic = level % 10 === 0;
  if (!shouldPlayBossMusic) {
    stopBossMusic();
    return;
  }
  const isFinal = level === 50;
  const useFinalPart2 = isFinal && finalBossPart >= 2;
  const selectedSrc = useFinalPart2
    ? BOSS_MUSIC.finalBossPart2
    : isFinal
      ? BOSS_MUSIC.finalBoss
      : BOSS_MUSIC.bossFight;
  const selectedVolume = useFinalPart2
    ? BOSS_MUSIC.finalBossPart2Volume
    : isFinal
      ? BOSS_MUSIC.finalBossVolume
      : BOSS_MUSIC.bossFightVolume;
  if (!bossState.bossFightMusic) {
    bossState.bossFightMusic = new Audio(selectedSrc);
    bossState.bossFightMusic.loop = true;
  }
  const nextSrc = selectedSrc;
  if (bossState.bossFightMusic.src && !bossState.bossFightMusic.src.endsWith(nextSrc)) {
    bossState.bossFightMusic.pause();
    bossState.bossFightMusic = new Audio(nextSrc);
    bossState.bossFightMusic.loop = true;
  }
  bossState.bossFightMusic.volume = selectedVolume * musicVolumeMultiplier;
  if (bossState.bossFightMusic.paused) {
    void bossState.bossFightMusic.play().catch(() => {});
  }
}

function ensureBossVfxLayer() {
  let layer = document.getElementById("bossVfxLayer");
  if (layer) return layer;
  layer = document.createElement("div");
  layer.id = "bossVfxLayer";
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

function createBossVfxSprite(layer, src, left, top, size, zIndex = 2) {
  const sprite = document.createElement("img");
  sprite.src = src;
  sprite.alt = "";
  sprite.decoding = "async";
  sprite.style.position = "fixed";
  sprite.style.left = `${left - size / 2}px`;
  sprite.style.top = `${top - size / 2}px`;
  sprite.style.width = `${size}px`;
  sprite.style.height = `${size}px`;
  sprite.style.zIndex = String(zIndex);
  sprite.style.pointerEvents = "none";
  sprite.style.imageRendering = "pixelated";
  layer.appendChild(sprite);
  return sprite;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function getTargetSpriteRect(target, ctx) {
  if (!target) return null;
  const targetSpriteId = ctx.isDuoMode()
    ? ctx.playerSpriteIdForIndex(Number.isInteger(target.playerIndex) ? target.playerIndex : 0)
    : "playerSprite";
  const targetSprite = ctx.getEl(targetSpriteId);
  return targetSprite ? targetSprite.getBoundingClientRect() : null;
}

function getBossSpriteRect(boss, ctx) {
  const bossSprite = ctx.getEl(`enemy-sprite-${boss.id}`);
  return bossSprite ? bossSprite.getBoundingClientRect() : null;
}

function projectileDodgeKeys(target, ctx) {
  if (target && Number.isInteger(target.playerIndex)) {
    return ctx.skillCheckKeysForPlayerIndex(target.playerIndex);
  }
  return ctx.currentSkillCheckKeys();
}

function runBossProjectileDodge({
  src,
  startRect,
  targetRect,
  size = 22,
  durationMs = 650,
  windowStart = 0.65,
  windowEnd = 0.9,
  startYFraction = 0.48,
  startFromFeet = false,
  acceptedKeys = ["Space", "Enter"],
  showHint = null,
  hideHint = null,
  hintText = "Press SPACE in the right time to dodge!"
}) {
  if (!startRect || !targetRect) return Promise.resolve({ dodged: false, pressed: false });
  const layer = ensureBossVfxLayer();
  const startX = startRect.left + startRect.width * 0.5;
  const startY = startFromFeet
    ? (startRect.bottom - size / 2)
    : (startRect.top + startRect.height * startYFraction);
  const endX = targetRect.left + targetRect.width * 0.5;
  const endY = targetRect.top + targetRect.height * 0.45;
  const sprite = createBossVfxSprite(layer, src, startX, startY, size, 3);

  return new Promise((resolve) => {
    const actualDurationMs = scaleDuration(durationMs);
    const keyLabel = acceptedKeys.includes("Enter") && !acceptedKeys.includes("Space") ? "ENTER" : "SPACE";
    let startedAt = 0;
    let pressed = false;
    let dodged = false;
    let resolved = false;

    if (typeof showHint === "function") {
      showHint(String(hintText || "").replaceAll("SPACE", keyLabel.toLowerCase()));
    }

    const onKeyDown = (e) => {
      if (pressed || !acceptedKeys.includes(e.code)) return;
      pressed = true;
      const now = performance.now();
      const progress = startedAt ? clamp01((now - startedAt) / actualDurationMs) : 0;
      if (progress >= windowStart && progress <= windowEnd) {
        dodged = true;
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const finish = () => {
      if (resolved) return;
      resolved = true;
      window.removeEventListener("keydown", onKeyDown);
      if (typeof hideHint === "function") hideHint("");
      if (sprite.isConnected) sprite.remove();
      resolve({ dodged, pressed });
    };

    const step = (ts) => {
      if (!startedAt) startedAt = ts;
      const progress = clamp01((ts - startedAt) / actualDurationMs);
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      sprite.style.left = `${x - size / 2}px`;
      sprite.style.top = `${y - size / 2}px`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        finish();
      }
    };

    if (typeof requestAnimationFrame !== "function") {
      sprite.style.left = `${endX - size / 2}px`;
      sprite.style.top = `${endY - size / 2}px`;
      setTimeout(finish, scaleDuration(40));
      return;
    }

    requestAnimationFrame(step);
  });
}

function triggerBattlefieldShake(ctx) {
  const field = ctx.getEl("battlefield");
  if (!field) return;
  field.classList.remove("screen-shake");
  void field.offsetWidth;
  field.classList.add("screen-shake");
}

function bossPlayerTarget(ctx) {
  const duoTarget = ctx.isDuoMode() ? ctx.duoPlayerTarget() : null;
  if (duoTarget) return duoTarget;
  return {
    id: "playerChar",
    unit: ctx.getPlayer(),
    label: ctx.displayCharacterName(ctx.getSelectedCharacter() || "player"),
    isPlayer: true,
    characterKey: ctx.getSelectedCharacter() || "player",
    playerIndex: ctx.isDuoMode() ? ctx.getActiveDuoPlayer() : 0
  };
}

function bossMinionCount(ctx) {
  return ctx.getEnemies().filter((enemy) => !enemy.boss).length;
}

function bossOverlordPhase(boss) {
  if (!boss) return 1;
  return boss.hp > boss.maxHp * 0.5 ? 1 : 2;
}

export function getFinalBossMinionShieldPower(boss, enemies = []) {
  if (!isFinalBoss(boss) || !Array.isArray(enemies)) return 0;
  const minionCount = enemies.filter((enemy) => enemy && enemy.id !== boss.id && enemy.hp > 0).length;
  if (minionCount <= 0) return 0;
  return minionCount * (isFinalBossPart2(boss) ? 2 : 1);
}

function applyBossDamage(boss, target, baseDamage, ctx, options = {}) {
  const def = target?.unit?.def || 0;
  let dmg = Math.max(1, Math.ceil(baseDamage - def));
  dmg = ctx.applyAttackerDamageModifiers(boss, dmg);
  dmg = ctx.applyDamageModifiers(target.unit, dmg);
  if (isFinalBossPart2(boss) && !options.skipPart2Multiplier) dmg *= 2;
  return Math.max(0, dmg);
}

function bossSpriteId(boss) {
  return `enemy-sprite-${boss.id}`;
}

function setBossSpriteFrame(boss, frame, ctx) {
  const img = ctx.getEl?.(bossSpriteId(boss));
  if (img && frame) img.src = frame;
}

function spawnBossSlashFx(boss, ctx, kind = "headBash") {
  const sprite = ctx.getEl?.(bossSpriteId(boss));
  const host = sprite?.parentElement;
  const slashSrc = bossFinalSlashFrame(kind);
  if (!sprite || !host || !slashSrc || slashSrc === BOSS_FINAL_SPRITES.base) return;

  const slash = document.createElement("img");
  slash.src = slashSrc;
  slash.alt = "";
  slash.decoding = "async";
  slash.style.position = "absolute";
  slash.style.left = "50%";
  slash.style.top = "52%";
  slash.style.width = kind === "stomp" ? "144px" : "132px";
  slash.style.height = kind === "stomp" ? "144px" : "132px";
  slash.style.pointerEvents = "none";
  slash.style.imageRendering = "pixelated";
  slash.style.opacity = "0.98";
  slash.style.transform = "translate(-50%, -50%) scale(0.82)";
  slash.style.transformOrigin = "center";
  slash.style.transition = "opacity 360ms ease-out, transform 360ms ease-out";
  slash.style.zIndex = "4";
  host.appendChild(slash);

  requestAnimationFrame(() => {
    slash.style.opacity = "0";
    slash.style.transform = "translate(-50%, -50%) scale(1.08)";
  });

  window.setTimeout(() => {
    slash.remove();
  }, 430);
}

function bossActionFrames(part, getter) {
  const frames = getter(part);
  return Array.isArray(frames) && frames.length ? frames : [BOSS_FINAL_SPRITES.base];
}

function bossActionSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, scaleDuration(ms)));
}

async function playBossHeldFrames(boss, ctx, frames, speedMs = 95) {
  if (!Array.isArray(frames) || !frames.length) return;
  boss.animating = true;
  for (const frame of frames) {
    setBossSpriteFrame(boss, frame, ctx);
    await bossActionSleep(speedMs);
  }
}

export async function bossTrySummon(boss, ctx) {
  const enemies = ctx.getEnemies();
  if (enemies.some((e) => !e.boss)) return false;
  if (Math.random() >= 0.5) return false;

  await ctx.playEnemyFrames(boss, bossFinalSummonFrames(isFinalBossPart2(boss) ? 2 : 1), 130);
  const roll = Math.random();
  const kind = roll < 0.35 ? "tank" : roll < 0.7 ? "minion" : "support";
  const summon = ctx.createEnemy(kind, 1);
  enemies.unshift(summon);
  ctx.rebuildEnemyDisplayNames();
  ctx.refreshUI();
  await ctx.animateSummonArrival?.(`enemy-entity-${summon.id}`, { from: "right" });
  ctx.logCombatSummon?.(boss, summon.name);
  return true;
}

async function bossOverlordHeadBash(boss, ctx) {
  const target = bossPlayerTarget(ctx);
  if (!target || !target.unit) return { playerDied: false, levelCleared: false };
  const part = isFinalBossPart2(boss) ? 2 : 1;
  const bashFrames = await getBossFinalHeadBashFrames(part);

  await ctx.dashToward(`enemy-entity-${boss.id}`, target.id, 340, false);
  boss.animating = true;
  setBossSpriteFrame(boss, bashFrames[0], ctx);
  ctx.positionSkillCheckBelow(`enemy-entity-${boss.id}`);

  const dodgeTargetCharacter = target.characterKey || ctx.getSelectedCharacter();
  const isKostyaCounterWindow = dodgeTargetCharacter === "kostya";
  const dodge = await ctx.runSkillCheck({
    yellowEnabled: true,
    innerRedEnabled: isKostyaCounterWindow,
    innerRedWidth: 0.03,
    innerRedReason: "counter",
    greenWidth: 0.08,
    yellowExtra: 0.12,
    hintHtml: isKostyaCounterWindow
      ? 'Release SPACE on <span class="skill-hint-red">red</span> to counter!'
      : 'Release SPACE on <span class="skill-hint-green">green</span> to dodge!',
    acceptedKeys: projectileDodgeKeys(target, ctx),
    ownerPlayerIndex: Number.isInteger(target.playerIndex)
      ? target.playerIndex
      : (ctx.isDuoMode() ? ctx.getActiveDuoPlayer() : null)
  });

  boss.animating = false;
  if (bashFrames.length > 1) {
    spawnBossSlashFx(boss, ctx, "headBash");
    await ctx.playEnemyFrames(boss, bashFrames.slice(1), 95);
  }

  let damage = applyBossDamage(boss, target, BOSS_FINAL_ABILITIES.headBash.damage, ctx);
  let deflectDamage = 0;
  ctx.logCombatUse?.(boss, "Head Bash", target.label);
  if (dodge.reason === "counter" && dodgeTargetCharacter === "kostya") {
    damage = 0;
    deflectDamage = Math.max(1, Math.ceil(BOSS_FINAL_ABILITIES.headBash.damage * 0.5));
    ctx.logCombatCounter?.(target.label);
    ctx.setPlayerSkillFeedback("Counter!", "counter", 1800, target.playerIndex);
    await ctx.animateTargetPlayerParry(target.id, dodgeTargetCharacter);
  } else if (dodge.reason === "green") {
    damage = 0;
    ctx.logCombatDodged?.(target.label);
    ctx.setPlayerSkillFeedback("Great!", "great", 1800, target.playerIndex);
    if (dodgeTargetCharacter === "patrick") {
      ctx.patrickDodgeSpGain?.(target.unit, "great");
      ctx.playSfx("dodge", 0.65);
      await ctx.animateTargetPlayerDodge(target.id, dodgeTargetCharacter);
    }
  } else if (dodge.reason === "yellow") {
    damage = Math.max(1, Math.ceil(damage * 0.5));
    ctx.logCombatPartialDodge?.(target.label);
    if (dodgeTargetCharacter === "patrick") ctx.patrickDodgeSpGain?.(target.unit, "good");
    ctx.setPlayerSkillFeedback("Good!", "good", 1800, target.playerIndex);
  }

  if (deflectDamage > 0) {
    const dealt = ctx.applyIncomingDamage(boss, deflectDamage, true, target.unit);
    await ctx.playEnemyFrames(boss, bossFinalDamagedFrames(part), 110);
    void dealt;
  }

  if (damage > 0) {
    ctx.playSfx("stunAttack", 0.65);
    target.unit.hp = Math.max(0, target.unit.hp - damage);
    ctx.maybeLogFatalDamage(target.label, target.unit, damage);
    ctx.onPlayerUnitDamaged?.(target.unit, dodgeTargetCharacter, damage);
    await ctx.animateTargetPlayerDamaged(target.id, dodgeTargetCharacter);
    const stunPower = isFinalBossPart2(boss)
      ? BOSS_FINAL_ABILITIES.headBash.part2StunPower
      : BOSS_FINAL_ABILITIES.headBash.stunPower;
    const stunTurns = isFinalBossPart2(boss)
      ? BOSS_FINAL_ABILITIES.headBash.part2StunTurns
      : BOSS_FINAL_ABILITIES.headBash.stunTurns;
    ctx.applyStatus(target.unit, "stunned", stunPower, stunTurns);
  } else {
    ctx.playSfx("swordFailed", 0.65);
  }

  if (target.unit.hp <= 0) {
    target.unit.hp = 0;
    ctx.addLog(`${target.label} collapsed.`, "collapse-ally");
    ctx.getEl("actions").innerHTML = "";
    ctx.setActionsLocked(true);
    ctx.refreshUI();
    return { playerDied: ctx.isPartyDefeated?.() ?? true, levelCleared: false };
  }

  await ctx.dashBack(`enemy-entity-${boss.id}`);
  ctx.refreshUI();
  return { playerDied: false, levelCleared: false };
}

async function bossOverlordQuickSnack(boss, ctx) {
  ctx.playSfx("nomnomnom", 0.62);
  await ctx.playEnemyFrames(boss, bossFinalQuickSnackFrames(isFinalBossPart2(boss) ? 2 : 1), BOSS_FINAL_IDLE_ANIMATION_MS);
  const healAmount = BOSS_FINAL_ABILITIES.quickSnack.heal;
  const regenPower = isFinalBossPart2(boss)
    ? BOSS_FINAL_ABILITIES.quickSnack.part2RegenPower
    : BOSS_FINAL_ABILITIES.quickSnack.regenPower;
  boss.hp = Math.min(boss.maxHp, boss.hp + healAmount);
  ctx.applyStatus(boss, "regen", regenPower, BOSS_FINAL_ABILITIES.quickSnack.regenTurns);
  ctx.getEnemies().filter((enemy) => !enemy.boss).forEach((enemy) => {
    ctx.applyStatus(enemy, "regen", regenPower, BOSS_FINAL_ABILITIES.quickSnack.regenTurns);
  });
  ctx.logCombatCast?.(boss, "Quick Snack");
  ctx.refreshUI();
  return { playerDied: false, levelCleared: false };
}

async function bossOverlordFries(boss, ctx) {
  const target = bossPlayerTarget(ctx);
  if (!target || !target.unit) return { playerDied: false, levelCleared: false };
  const part = isFinalBossPart2(boss) ? 2 : 1;
  const friesFrames = await getBossFinalFriesFrames(part);
  const projectileCount = isFinalBossPart2(boss) ? BOSS_FINAL_ABILITIES.fries.part2Count : BOSS_FINAL_ABILITIES.fries.count;
  ctx.logCombatUse?.(boss, "Put the fries in the bag", target.label);

  const startRect = getBossSpriteRect(boss, ctx);
  const targetRect = getTargetSpriteRect(target, ctx);
  const acceptedKeys = projectileDodgeKeys(target, ctx);
  const hintText = "Press SPACE in the right time to dodge!";
  const keyLabel = acceptedKeys.includes("Enter") && !acceptedKeys.includes("Space") ? "enter" : "space";

  boss.animating = true;
  try {
    ctx.setActionHint(hintText.replaceAll("SPACE", keyLabel), target.playerIndex);
    for (let i = 0; i < projectileCount; i += 1) {
      await playBossHeldFrames(boss, ctx, [friesFrames[0], friesFrames[0]], 95);
      const projectilePromise = runBossProjectileDodge({
        src: BOSS_FINAL_SPRITES.fry,
        startRect,
        targetRect,
        size: 24,
        durationMs: 680,
        windowStart: 0.62,
        windowEnd: 0.9,
        acceptedKeys
      });
      if (friesFrames[1]) {
        await playBossHeldFrames(boss, ctx, [friesFrames[1], friesFrames[1]], 95);
      }
      const result = await projectilePromise;

      if (result.dodged) {
        ctx.logCombatDodged?.(target.label);
        if ((target.characterKey || ctx.getSelectedCharacter()) === "patrick") {
          ctx.patrickDodgeSpGain?.(target.unit, "great");
          ctx.playSfx("dodge", 0.65);
          await ctx.animateTargetPlayerDodge(target.id, target.characterKey || ctx.getSelectedCharacter());
        }
        ctx.setPlayerSkillFeedback("Dodge!", "great", 1200, target.playerIndex);
        setBossSpriteFrame(boss, friesFrames[0], ctx);
        continue;
      }

      await playBossHeldFrames(boss, ctx, [friesFrames[0], friesFrames[0]], 95);

      const damage = applyBossDamage(boss, target, BOSS_FINAL_ABILITIES.fries.damage, ctx);
      if (damage > 0) {
        target.unit.hp = Math.max(0, target.unit.hp - damage);
        ctx.maybeLogFatalDamage(target.label, target.unit, damage);
        ctx.onPlayerUnitDamaged?.(target.unit, target.characterKey || ctx.getSelectedCharacter(), damage);
        await ctx.animateTargetPlayerDamaged(target.id, target.characterKey || ctx.getSelectedCharacter());
      }
      ctx.applyStatus(
        target.unit,
        "fire",
        isFinalBossPart2(boss) ? BOSS_FINAL_ABILITIES.fries.part2FirePower : BOSS_FINAL_ABILITIES.fries.firePower,
        BOSS_FINAL_ABILITIES.fries.fireTurns
      );

      if (target.unit.hp <= 0) {
        target.unit.hp = 0;
        ctx.addLog(`${target.label} collapsed.`, "collapse-ally");
        ctx.getEl("actions").innerHTML = "";
        ctx.setActionsLocked(true);
        ctx.refreshUI();
        return { playerDied: ctx.isPartyDefeated?.() ?? true, levelCleared: false };
      }

      setBossSpriteFrame(boss, friesFrames[0], ctx);
    }
  } finally {
    boss.animating = false;
    ctx.setActionHint("", target.playerIndex);
  }

  ctx.refreshUI();
  return { playerDied: false, levelCleared: false };
}

async function bossOverlordStomp(boss, ctx) {
  const target = bossPlayerTarget(ctx);
  if (!target || !target.unit) return { playerDied: false, levelCleared: false };
  const part = isFinalBossPart2(boss) ? 2 : 1;
  const stompFrames = await getBossFinalStompFrames(part);
  const stompCount = isFinalBossPart2(boss) ? BOSS_FINAL_ABILITIES.stomp.part2Count : BOSS_FINAL_ABILITIES.stomp.count;
  ctx.logCombatUse?.(boss, "Hard Stomps", target.label);
  triggerBattlefieldShake(ctx);

  const startRect = getBossSpriteRect(boss, ctx);
  const targetRect = getTargetSpriteRect(target, ctx);
  const acceptedKeys = projectileDodgeKeys(target, ctx);
  const stompSize = startRect ? Math.max(startRect.width, startRect.height) : 48;
  const hintText = "Press SPACE in the right time to dodge!";
  const keyLabel = acceptedKeys.includes("Enter") && !acceptedKeys.includes("Space") ? "enter" : "space";

  ctx.playSfx("hardStomp", 0.68);
  boss.animating = true;
  try {
    ctx.setActionHint(hintText.replaceAll("SPACE", keyLabel), target.playerIndex);
    for (let i = 0; i < stompCount; i += 1) {
      await playBossHeldFrames(boss, ctx, [stompFrames[0], stompFrames[0]], 95);
      const projectilePromise = runBossProjectileDodge({
        src: BOSS_FINAL_SPRITES.stompWave,
        startRect,
        targetRect,
        size: stompSize,
        durationMs: 740,
        windowStart: 0.67,
        windowEnd: 0.84,
        startFromFeet: true,
        acceptedKeys
      });
      if (stompFrames[1]) {
        await playBossHeldFrames(boss, ctx, [stompFrames[1], stompFrames[1]], 95);
      }
      spawnBossSlashFx(boss, ctx, "stomp");
      const result = await projectilePromise;
      await playBossHeldFrames(boss, ctx, [stompFrames[0], stompFrames[0]], 95);

      if (result.dodged) {
        ctx.logCombatDodged?.(target.label);
        if ((target.characterKey || ctx.getSelectedCharacter()) === "patrick") ctx.patrickDodgeSpGain?.(target.unit, "great");
        ctx.setPlayerSkillFeedback("Dodge!", "great", 1400, target.playerIndex);
        if (stompCount === 1 || i === stompCount - 1) {
          ctx.refreshUI();
          return { playerDied: false, levelCleared: false };
        }
        continue;
      }

      setBossSpriteFrame(boss, stompFrames[0], ctx);

      const damage = applyBossDamage(boss, target, BOSS_FINAL_ABILITIES.stomp.damage, ctx);
      if (damage > 0) {
        target.unit.hp = Math.max(0, target.unit.hp - damage);
        ctx.maybeLogFatalDamage(target.label, target.unit, damage);
        ctx.onPlayerUnitDamaged?.(target.unit, target.characterKey || ctx.getSelectedCharacter(), damage);
        await ctx.animateTargetPlayerDamaged(target.id, target.characterKey || ctx.getSelectedCharacter());
      }

      if (target.unit.hp <= 0) {
        target.unit.hp = 0;
        ctx.addLog(`${target.label} collapsed.`, "collapse-ally");
        ctx.getEl("actions").innerHTML = "";
        ctx.setActionsLocked(true);
        ctx.refreshUI();
        return { playerDied: ctx.isPartyDefeated?.() ?? true, levelCleared: false };
      }
    }
  } finally {
    ctx.setActionHint("", target.playerIndex);
    boss.animating = false;
  }
  ctx.refreshUI();
  return { playerDied: false, levelCleared: false };
}

async function bossOverlordPushback(boss, ctx) {
  const target = bossPlayerTarget(ctx);
  if (!target || !target.unit) return { playerDied: false, levelCleared: false };
  const pushFrames = await getBossFinalPushbackFrames();

  await ctx.dashToward(`enemy-entity-${boss.id}`, target.id, 340, false);
  boss.animating = true;
  setBossSpriteFrame(boss, pushFrames[0], ctx);
  ctx.positionSkillCheckBelow(`enemy-entity-${boss.id}`);

  const dodgeTargetCharacter = target.characterKey || ctx.getSelectedCharacter();
  const isKostyaCounterWindow = dodgeTargetCharacter === "kostya";
  const dodge = await ctx.runSkillCheck({
    yellowEnabled: false,
    innerRedEnabled: isKostyaCounterWindow,
    innerRedWidth: 0.03,
    innerRedReason: "counter",
    greenWidth: 0.08,
    hintHtml: isKostyaCounterWindow
      ? 'Release SPACE on <span class="skill-hint-red">red</span> to counter!'
      : 'Release SPACE on <span class="skill-hint-green">green</span> to dodge!',
    acceptedKeys: projectileDodgeKeys(target, ctx),
    ownerPlayerIndex: Number.isInteger(target.playerIndex)
      ? target.playerIndex
      : (ctx.isDuoMode() ? ctx.getActiveDuoPlayer() : null)
  });

  boss.animating = false;
  if (pushFrames.length > 1) {
    spawnBossSlashFx(boss, ctx, "pushback");
    await ctx.playEnemyFrames(boss, pushFrames.slice(1), 95);
  }

  let damage = applyBossDamage(boss, target, BOSS_FINAL_ABILITIES.pushback.damage, ctx, {
    skipPart2Multiplier: true
  });
  let deflectDamage = 0;
  ctx.logCombatUse?.(boss, "Pushback", target.label);

  if (dodge.reason === "counter" && dodgeTargetCharacter === "kostya") {
    damage = 0;
    deflectDamage = Math.max(1, Math.ceil(BOSS_FINAL_ABILITIES.pushback.damage * 0.5));
    ctx.logCombatCounter?.(target.label);
    ctx.setPlayerSkillFeedback("Counter!", "counter", 1800, target.playerIndex);
    await ctx.animateTargetPlayerParry(target.id, dodgeTargetCharacter);
  } else if (dodge.reason === "green") {
    if (ctx.isDefendingPlayerIndex?.(target.playerIndex)) {
      damage = 0;
      deflectDamage = Math.max(1, Math.ceil(BOSS_FINAL_ABILITIES.pushback.damage * 0.5));
      ctx.logCombatParry?.(target.label);
      ctx.setPlayerSkillFeedback("Parry!", "parry", 1800, target.playerIndex);
      await ctx.animateTargetPlayerParry(target.id, dodgeTargetCharacter);
    } else {
      damage = 0;
      ctx.logCombatDodged?.(target.label);
      ctx.setPlayerSkillFeedback("Great!", "great", 1800, target.playerIndex);
      if (dodgeTargetCharacter === "patrick") {
        ctx.patrickDodgeSpGain?.(target.unit, "great");
        ctx.playSfx("dodge", 0.65);
        await ctx.animateTargetPlayerDodge(target.id, dodgeTargetCharacter);
      }
    }
  }

  if (deflectDamage > 0) {
    const dealt = ctx.applyIncomingDamage(boss, deflectDamage, true, target.unit);
    await ctx.playEnemyFrames(boss, bossFinalDamagedFrames(2), 110);
    void dealt;
  }

  if (damage > 0) {
    ctx.playSfx("stunAttack", 0.65);
    target.unit.hp = Math.max(0, target.unit.hp - damage);
    ctx.maybeLogFatalDamage(target.label, target.unit, damage);
    ctx.onPlayerUnitDamaged?.(target.unit, dodgeTargetCharacter, damage);
    await ctx.animateTargetPlayerDamaged(target.id, dodgeTargetCharacter);
    ctx.applyStatus(target.unit, "slowness", BOSS_FINAL_ABILITIES.pushback.slownessPower, BOSS_FINAL_ABILITIES.pushback.slownessTurns);
  } else {
    ctx.playSfx("swordFailed", 0.65);
  }

  if (target.unit.hp <= 0) {
    target.unit.hp = 0;
    ctx.addLog(`${target.label} collapsed.`, "collapse-ally");
    ctx.getEl("actions").innerHTML = "";
    ctx.setActionsLocked(true);
    ctx.refreshUI();
    return { playerDied: ctx.isPartyDefeated?.() ?? true, levelCleared: false };
  }

  await ctx.dashBack(`enemy-entity-${boss.id}`);
  ctx.refreshUI();
  return { playerDied: false, levelCleared: false };
}

async function bossOverlordSummon(boss, ctx) {
  if (bossMinionCount(ctx) >= 3) return { playerDied: false, levelCleared: false, summoned: false };
  await ctx.playEnemyFrames(boss, bossFinalSummonFrames(isFinalBossPart2(boss) ? 2 : 1), 130);
  const summon = ctx.createEnemy("minion", 1);
  ctx.getEnemies().unshift(summon);
  ctx.rebuildEnemyDisplayNames();
  ctx.refreshUI();
  await ctx.animateSummonArrival?.(`enemy-entity-${summon.id}`, { from: "right" });
  ctx.logCombatSummon?.(boss, summon.name);
  return { playerDied: false, levelCleared: false, summoned: true };
}

export async function bossOverlordAction(boss, ctx) {
  const minionCount = bossMinionCount(ctx);
  const summonChance = Math.max(0, 0.2 - 0.07 * minionCount);
  const canSummon = minionCount < 3 && summonChance > 0;
  const inPart2 = isFinalBossPart2(boss);
  const stompUnlocked = inPart2 || bossOverlordPhase(boss) >= 2;
  const pushbackUnlocked = inPart2 && boss.hp <= boss.maxHp * 0.5;

  if (!inPart2) {
    if (canSummon && Math.random() < summonChance) {
      return bossOverlordSummon(boss, ctx);
    }
    const roll = Math.random();
    if (roll < 0.42) return bossOverlordHeadBash(boss, ctx);
    if (roll < 0.78) return bossOverlordFries(boss, ctx);
    if (stompUnlocked && roll < 0.92) return bossOverlordStomp(boss, ctx);
    return bossOverlordQuickSnack(boss, ctx);
  }

  if (canSummon && Math.random() < summonChance) {
    return bossOverlordSummon(boss, ctx);
  }
  const roll = Math.random();
  if (pushbackUnlocked) {
    if (roll < 0.26) return bossOverlordHeadBash(boss, ctx);
    if (roll < 0.52) return bossOverlordFries(boss, ctx);
    if (roll < 0.78) return bossOverlordStomp(boss, ctx);
    if (roll < 0.9) return bossOverlordQuickSnack(boss, ctx);
    return bossOverlordPushback(boss, ctx);
  }
  if (roll < 0.3) return bossOverlordHeadBash(boss, ctx);
  if (roll < 0.6) return bossOverlordFries(boss, ctx);
  if (roll < 0.85) return bossOverlordStomp(boss, ctx);
  return bossOverlordQuickSnack(boss, ctx);
}
