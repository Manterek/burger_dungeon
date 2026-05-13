import { createCustomDrawItem, getSceneMetrics, TILE_SIZE, waitForImage } from "./tile.js";

const ENEMY_PRIORITY = 14;
const ENEMY_TILE_SIZE = 3;
const ENEMY_GROUND_SINK_TILES = 1 / 3;
const ENEMY_RIGHT_MARGIN_TILES = 2;
const ENEMY_GAP_TILES = 0.5;
const ENEMY_ATTACK_DAMAGE = 5;
const BOSS_BASE_HP = 100;
const BOSS_HP_GAIN_PER_TIER = 100;
const BOSS_BASE_DAMAGE = 6;
const BOSS_DAMAGE_GAIN_PER_TIER = 6;
const ENEMY_SPAWN_CHANCES = [1, 0.4, 0.3, 0.2];
const TIMED_ENEMY_SPAWN_CHANCE = 0.25;
const ENEMY_ATTRIBUTE_SPAWN_CHANCE = 0.1;
const FLYING_RENDER_OFFSET_Y = -Math.floor(TILE_SIZE / 2);
const ENEMY_VARIANT_FRY_MAGE_CHANCE = 0.3;
const FRY_MAGE_VARIANT_ID = "fry-mage";
const FRY_MAGE_FRAME_SIZE = 32;
const FRY_MAGE_IDLE_FRAME_DURATION_MS = 250;
const FRY_MAGE_THROW_FRAME_DURATION_MS = 95;
const FRY_MAGE_BASE_HP = 10;
const FRY_MAGE_HP_GAIN_PER_LEVEL = 2;
const FRY_MAGE_MAX_HP_CAP = 112;
const FRY_MAGE_BASE_DAMAGE = 4;
const FRY_MAGE_DAMAGE_GAIN_PER_10_LEVELS = 2;
const FRY_MAGE_BASE_FIRE_POWER = 2;
const FRY_MAGE_BASE_FIRE_TURNS = 2;
const FRY_MAGE_FIRE_TURNS_GAIN_PER_10_LEVELS = 1;
const FRY_MAGE_IDLE_FRAMES = [
  { row: 1, column: 1 },
  { row: 1, column: 2 },
  { row: 1, column: 3 }
];
const FRY_MAGE_THROW_FRAMES = [
  { row: 1, column: 4 },
  { row: 1, column: 5 },
  { row: 1, column: 6 }
];
const FRY_MAGE_DAMAGED_FRAME = { row: 1, column: 7 };

export const ENEMY_VARIANT_FRY_MAGE = FRY_MAGE_VARIANT_ID;

export const ENEMY_ATTRIBUTE_DEFENSE = "defense";
export const ENEMY_ATTRIBUTE_FIRE_IMMUNITY = "fire-immunity";
export const ENEMY_ATTRIBUTE_FLYING = "flying";
export const ENEMY_ATTRIBUTE_MOBILE = "mobile";
export const ENEMY_ATTRIBUTE_REPEATABLE = "repeatable";
export const ENEMY_ATTRIBUTE_ICON_MAP = {
  [ENEMY_ATTRIBUTE_DEFENSE]: { row: 1, column: 1 },
  [ENEMY_ATTRIBUTE_FIRE_IMMUNITY]: { row: 1, column: 2 },
  [ENEMY_ATTRIBUTE_FLYING]: { row: 1, column: 3 },
  [ENEMY_ATTRIBUTE_MOBILE]: { row: 1, column: 4 },
  [ENEMY_ATTRIBUTE_REPEATABLE]: { row: 2, column: 1 }
};
const ENEMY_ATTRIBUTE_IDS = [
  ENEMY_ATTRIBUTE_DEFENSE,
  ENEMY_ATTRIBUTE_FIRE_IMMUNITY,
  ENEMY_ATTRIBUTE_FLYING,
  ENEMY_ATTRIBUTE_MOBILE
];

const enemyImage = new Image();
enemyImage.src = "sprites/enemy/enemy.png";
const fryMageImage = new Image();
fryMageImage.src = "sprites/enemy/fry_mage.png";
const fryMageIndicatorImage = new Image();
fryMageIndicatorImage.src = "sprites/enemy/fry_mage_indicator.png";
const groundShadowImage = new Image();
groundShadowImage.src = "sprites/indicator/shadow.png";

export function loadEnemyAssets() {
  return Promise.all([
    waitForImage(enemyImage),
    waitForImage(fryMageImage),
    waitForImage(fryMageIndicatorImage),
    waitForImage(groundShadowImage)
  ]);
}

export function getEnemyImage() {
  return enemyImage;
}

export function getFryMageIndicatorImage() {
  return fryMageIndicatorImage;
}

export function getEnemyPosition(index = 0) {
  const { gridWidth, groundRow } = getSceneMetrics();
  const step = ENEMY_TILE_SIZE + ENEMY_GAP_TILES;

  return {
    x: gridWidth - ENEMY_RIGHT_MARGIN_TILES - ENEMY_TILE_SIZE - index * step,
    y: groundRow - ENEMY_TILE_SIZE + ENEMY_GROUND_SINK_TILES
  };
}

export function createEnemyUnit(index = 0, enemy = null) {
  if (!enemy || enemy.hp <= 0) {
    return null;
  }

  const { x, y } = getEnemyPosition(index);
  const width = ENEMY_TILE_SIZE * TILE_SIZE;
  const height = ENEMY_TILE_SIZE * TILE_SIZE;

  return createCustomDrawItem({
    x,
    y,
    priority: ENEMY_PRIORITY,
    draw: ({ context }) => {
      const dx = Math.floor(x * TILE_SIZE + (enemy?.renderOffsetX ?? 0));
      const dy = Math.floor(y * TILE_SIZE + (enemy?.renderOffsetY ?? enemy?.baseRenderOffsetY ?? 0));

      context.imageSmoothingEnabled = false;
      if (enemy?.attributes?.flying !== true) {
        drawGroundShadow(context, dx, dy, width, height);
      }
      drawEnemySprite(context, enemy, dx, dy, width, height);
    }
  });
}

export function createEnemyUnits(enemies) {
  return enemies
    .map((enemy, index) => createEnemyUnit(index, enemy))
    .filter(Boolean);
}

export function createEnemiesForLevel(level, createStatuses) {
  if (level % 10 === 0) {
    return [createBoss(level, createStatuses)];
  }

  const enemies = [];

  ENEMY_SPAWN_CHANCES.forEach((chance, index) => {
    if (Math.random() <= chance) {
      enemies.push(createRegularEnemy(level, index, createStatuses));
    }
  });

  if (enemies.length === 0) {
    enemies.push(createRegularEnemy(level, 0, createStatuses));
  }

  return enemies;
}

export function createEnemySummon(level, index, createStatuses, options = {}) {
  return createRegularEnemy(level, index, createStatuses, options);
}

export function getEnemyUiAnchor(index = 0, enemy = null) {
  const { x, y } = getEnemyPosition(index);
  const offsetX = (enemy?.renderOffsetX ?? 0) / TILE_SIZE;
  const offsetY = (enemy?.renderOffsetY ?? 0) / TILE_SIZE;

  return {
    x: x + (ENEMY_TILE_SIZE / 2) + offsetX,
    y: y + ENEMY_TILE_SIZE + (2 / 3) + offsetY
  };
}

export function getEnemyStatusAnchor(index = 0, enemy = null) {
  const { x, y } = getEnemyPosition(index);
  const offsetX = (enemy?.renderOffsetX ?? 0) / TILE_SIZE;
  const offsetY = (enemy?.renderOffsetY ?? 0) / TILE_SIZE;

  return {
    x: x + (ENEMY_TILE_SIZE / 2) + offsetX,
    y: y - 0.45 + offsetY
  };
}

function createRegularEnemy(level, index, createStatuses, options = {}) {
  const variantId = resolveRegularEnemyVariantId(options);
  const isTimedEnemy = options.forceType === "timed"
    ? true
    : options.forceType === "regular"
      ? false
      : Math.random() < TIMED_ENEMY_SPAWN_CHANCE;
  const attributes = variantId === FRY_MAGE_VARIANT_ID
    ? createFryMageAttributes(level)
    : createEnemyAttributes(options);
  if (level >= 50 && options.isSummon !== true) {
    attributes.mobile = true;
  }
  const baseActionsPerTurn = attributes.mobile === true ? 2 : 1;
  const renderOffsetY = attributes.flying === true ? FLYING_RENDER_OFFSET_Y : 0;

  if (!isTimedEnemy && options.isSummon !== true) {
    if (variantId === FRY_MAGE_VARIANT_ID) {
      return createFryMageEnemy(level, index, createStatuses, {
        ...options,
        attributes,
        baseActionsPerTurn,
        renderOffsetY
      });
    }
  }

  return {
    id: `${options.isSummon ? "summon" : (isTimedEnemy ? "timed-enemy" : "enemy")}-${level}-${index + 1}`,
    variantId: "default",
    type: isTimedEnemy ? "timed" : "regular",
    hp: isTimedEnemy ? 10 : 15,
    maxHp: isTimedEnemy ? 10 : 15,
    sp: 0,
    maxSp: 0,
    baseActionsPerTurn,
    actionProgress: 0,
    actionsRemaining: 0,
    attackCheckType: isTimedEnemy ? "timed" : "standard",
    baseDamage: ENEMY_ATTACK_DAMAGE,
    isBoss: false,
    isSummon: Boolean(options.isSummon),
    renderOffsetX: 0,
    baseRenderOffsetY: renderOffsetY,
    renderOffsetY,
    attributes,
    statuses: createStatuses()
  };
}

function createFryMageEnemy(level, index, createStatuses, options = {}) {
  const hp = getFryMageMaxHp(level);
  const baseDamage = getFryMageBaseDamage(level);

  return {
    id: `fry-mage-${level}-${index + 1}`,
    variantId: FRY_MAGE_VARIANT_ID,
    type: "regular",
    hp,
    maxHp: hp,
    sp: 0,
    maxSp: 0,
    baseActionsPerTurn: Math.max(1, Math.floor(Number(options.baseActionsPerTurn) || 1)),
    actionProgress: 0,
    actionsRemaining: 0,
    attackCheckType: "timed",
    baseDamage,
    attackStatusEffects: [
      {
        statusKey: "fire",
        power: FRY_MAGE_BASE_FIRE_POWER,
        turns: getFryMageFireTurns(level)
      }
    ],
    projectileStyle: FRY_MAGE_VARIANT_ID,
    isBoss: false,
    isSummon: false,
    renderOffsetX: 0,
    baseRenderOffsetY: options.renderOffsetY ?? 0,
    renderOffsetY: options.renderOffsetY ?? 0,
    attributes: options.attributes ?? createFryMageAttributes(level),
    lootTable: [
      { itemId: "fires-item", chance: 0.02 },
      { itemId: "ketchup-item", chance: 0.015 }
    ],
    statuses: createStatuses()
  };
}

function createBoss(level, createStatuses) {
  const tier = Math.max(1, Math.floor(level / 10));
  const hp = BOSS_BASE_HP + (tier - 1) * BOSS_HP_GAIN_PER_TIER;
  const baseDamage = BOSS_BASE_DAMAGE + (tier - 1) * BOSS_DAMAGE_GAIN_PER_TIER;
  const attributes = createEnemyAttributes({ skipRandomAttribute: true });
  if (level >= 50) {
    attributes.mobile = true;
  }
  const baseActionsPerTurn = attributes.mobile === true ? 2 : 1;
  const renderOffsetY = attributes.flying === true ? FLYING_RENDER_OFFSET_Y : 0;

  return {
    id: `boss-${level}`,
    type: "boss",
    hp,
    maxHp: hp,
    sp: 0,
    maxSp: 0,
    baseActionsPerTurn,
    actionProgress: 0,
    actionsRemaining: 0,
    attackCheckType: "standard",
    baseDamage,
    isBoss: true,
    isSummon: false,
    renderOffsetX: 0,
    baseRenderOffsetY: renderOffsetY,
    renderOffsetY,
    attributes,
    statuses: createStatuses()
  };
}

function createEnemyAttributes(options = {}) {
  const attributes = {
    defense: 0,
    fireImmunity: false,
    flying: false,
    mobile: false,
    repeatable: false
  };
  const attributeId = resolveEnemyAttributeId(options);
  if (!attributeId) {
    return attributes;
  }

  if (attributeId === ENEMY_ATTRIBUTE_DEFENSE) {
    attributes.defense = Math.max(1, Math.floor(Number(options.attributeValue) || 1));
  } else if (attributeId === ENEMY_ATTRIBUTE_FIRE_IMMUNITY) {
    attributes.fireImmunity = true;
  } else if (attributeId === ENEMY_ATTRIBUTE_FLYING) {
    attributes.flying = true;
  } else if (attributeId === ENEMY_ATTRIBUTE_MOBILE) {
    attributes.mobile = true;
  }

  return attributes;
}

function resolveEnemyAttributeId(options = {}) {
  if (typeof options.attributeId === "string" && ENEMY_ATTRIBUTE_IDS.includes(options.attributeId)) {
    return options.attributeId;
  }

  if (options.skipRandomAttribute === true) {
    return null;
  }

  if (Math.random() > ENEMY_ATTRIBUTE_SPAWN_CHANCE) {
    return null;
  }

  return ENEMY_ATTRIBUTE_IDS[Math.floor(Math.random() * ENEMY_ATTRIBUTE_IDS.length)] ?? null;
}

function resolveRegularEnemyVariantId(options = {}) {
  if (typeof options.variantId === "string") {
    return options.variantId;
  }

  return Math.random() < ENEMY_VARIANT_FRY_MAGE_CHANCE
    ? FRY_MAGE_VARIANT_ID
    : "default";
}

function getFryMageMaxHp(level) {
  const normalizedLevel = Math.max(1, Math.floor(Number(level) || 1));
  return Math.min(FRY_MAGE_MAX_HP_CAP, FRY_MAGE_BASE_HP + (normalizedLevel - 1) * FRY_MAGE_HP_GAIN_PER_LEVEL);
}

function getFryMageBaseDamage(level) {
  const normalizedLevel = Math.max(1, Math.floor(Number(level) || 1));
  return FRY_MAGE_BASE_DAMAGE + Math.floor(normalizedLevel / 10) * FRY_MAGE_DAMAGE_GAIN_PER_10_LEVELS;
}

function getFryMageFireTurns(level) {
  const normalizedLevel = Math.max(1, Math.floor(Number(level) || 1));
  return FRY_MAGE_BASE_FIRE_TURNS + Math.floor(normalizedLevel / 10) * FRY_MAGE_FIRE_TURNS_GAIN_PER_10_LEVELS;
}

function drawEnemySprite(context, enemy, dx, dy, width, height) {
  if (enemy?.variantId !== FRY_MAGE_VARIANT_ID) {
    context.drawImage(enemyImage, dx, dy, width, height);
    return;
  }

  const sourceRect = getFryMageSourceRect(enemy);
  context.drawImage(
    fryMageImage,
    sourceRect.sx,
    sourceRect.sy,
    sourceRect.sw,
    sourceRect.sh,
    dx,
    dy,
    width,
    height
  );
}

function getFryMageSourceRect(enemy, atTime = performance.now()) {
  const override = enemy?.animationOverride;
  if (override?.type === "damaged" && Number(override.endsAt ?? 0) > atTime) {
    return getSpriteRectFromFrame(FRY_MAGE_DAMAGED_FRAME);
  }

  if (override?.type === "fry-mage-throw" && Number(override.endsAt ?? 0) > atTime) {
    const elapsed = Math.max(0, atTime - Number(override.startedAt ?? atTime));
    const frameIndex = Math.min(
      FRY_MAGE_THROW_FRAMES.length - 1,
      Math.floor(elapsed / FRY_MAGE_THROW_FRAME_DURATION_MS)
    );
    return getSpriteRectFromFrame(FRY_MAGE_THROW_FRAMES[frameIndex] ?? FRY_MAGE_THROW_FRAMES[0]);
  }

  const idleIndex = getPingPongFrameIndex(FRY_MAGE_IDLE_FRAMES, FRY_MAGE_IDLE_FRAME_DURATION_MS, atTime);
  return getSpriteRectFromFrame(FRY_MAGE_IDLE_FRAMES[idleIndex] ?? FRY_MAGE_IDLE_FRAMES[0]);
}

function getSpriteRectFromFrame(frame) {
  return {
    sx: (Math.max(1, Number(frame?.column) || 1) - 1) * FRY_MAGE_FRAME_SIZE,
    sy: (Math.max(1, Number(frame?.row) || 1) - 1) * FRY_MAGE_FRAME_SIZE,
    sw: FRY_MAGE_FRAME_SIZE,
    sh: FRY_MAGE_FRAME_SIZE
  };
}

function createFryMageAttributes(level) {
  const attributes = createEnemyAttributes({ skipRandomAttribute: true });
  attributes.fireImmunity = true;
  if (Math.max(1, Math.floor(Number(level) || 1)) >= 50) {
    attributes.mobile = true;
  }
  return attributes;
}

function getPingPongFrameIndex(frames, frameDurationMs, atTime = performance.now()) {
  if (!Array.isArray(frames) || frames.length <= 1) {
    return 0;
  }

  const cycleLength = frames.length * 2 - 2;
  const elapsedFrames = Math.floor(atTime / Math.max(1, frameDurationMs));
  const cycleIndex = cycleLength > 0 ? elapsedFrames % cycleLength : 0;
  return cycleIndex < frames.length
    ? cycleIndex
    : cycleLength - cycleIndex;
}

function drawGroundShadow(context, dx, dy, width, height) {
  const sourceWidth = Number(groundShadowImage.naturalWidth) || 0;
  const sourceHeight = Number(groundShadowImage.naturalHeight) || 0;
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return;
  }

  const shadowWidth = Math.max(1, Math.floor(width * 0.72));
  const shadowHeight = Math.max(1, Math.floor(shadowWidth * (sourceHeight / sourceWidth)));
  const shadowX = dx + Math.floor((width - shadowWidth) / 2);
  const shadowY = dy + height - shadowHeight - Math.floor(height * 0.04);

  context.drawImage(groundShadowImage, shadowX, shadowY, shadowWidth, shadowHeight);
}
