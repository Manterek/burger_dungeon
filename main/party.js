import { createCustomDrawItem, getSceneMetrics, TILE_SIZE, waitForImage } from "./tile.js";
import {
  getJacobAnimationSourceRect,
  getJacobFrameSourceRect,
  getJacobImage,
  getJacobSheetImage,
  getJacobProfileImage,
  JACOB_CHARACTER_ID,
  loadJacobAssets
} from "./player/jacob.js";
import {
  getKostyaActionIconImage,
  getKostyaAnimationSourceRect,
  getKostyaFrameSourceRect,
  getKostyaImage,
  getKostyaProfileImage,
  getKostyaSheetImage,
  KOSTYA_CHARACTER_ID,
  loadKostyaAssets,
  setKostyaMilestoneRank
} from "./player/kostya.js";
import {
  getPatrickActionIconImage,
  getPatrickFrameSourceRect,
  getPatrickAnimationSourceRect,
  getPatrickIndicatorImage,
  getPatrickImage,
  getPatrickProfileImage,
  getPatrickSheetImage,
  loadPatrickAssets,
  setPatrickMilestoneRank,
  PATRICK_CHARACTER_ID
} from "./player/patrick.js";

const PLAYER_PRIORITY = 15;
const SHADOW_PRIORITY = 13;
const PLAYER_TILE_SIZE = 3;
const PLAYER_GROUND_SINK_TILES = 1 / 3;
const PLAYER_LEFT_MARGIN_TILES = 2;
const PLAYER_GAP_TILES = 0.5;
const PLAYER_SLOT_INDEX = 2;
const PLAYER_SUMMON_SLOT_INDEX = 3;
const KOSTYA_SHEET_FRAME_SIZE = 32;
const KOSTYA_IDLE_FRAME_COLUMNS = [0, 1, 2];
const KOSTYA_THINKING_FRAME_COLUMNS = [3, 4, 5];
const KOSTYA_DEEP_FOCUS_FRAME_COLUMNS = [6, 7];
const KOSTYA_DEEP_FOCUS_ANIMATION_ROW = 2;
const KOSTYA_ANIMATION_FRAME_COLUMNS = [0, 1, 2, 3, 4, 5];
const KOSTYA_ANIMATION_ROW = 0;
const KOSTYA_DODGE_FRAME = { row: 1, column: 4 };
const KOSTYA_RANGED_DODGE_FRAME = { row: 1, column: 5 };
const KOSTYA_DAMAGED_FRAME = { row: 1, column: 6 };
const KOSTYA_COLLAPSED_FRAME = { row: 1, column: 7 };
const KOSTYA_WALK_FRAME_COLUMNS = [6, 7];
const KOSTYA_WALK_ANIMATION_ROW = 0;
const KOSTYA_KATANA_READY_FRAME = { row: 1, column: 0 };
const KOSTYA_KATANA_OUTRO_FRAME_COLUMNS = [1, 2, 3];
const KOSTYA_KATANA_ANIMATION_ROW = 1;
const KOSTYA_SHADOW_SUMMON_FRAME_COLUMNS = [0, 1, 2];
const KOSTYA_SHADOW_SUMMON_ANIMATION_ROW = 2;
const KOSTYA_MASS_INFECTION_READY_FRAME = { row: 2, column: 3 };
const KOSTYA_MASS_INFECTION_OUTRO_FRAME_COLUMNS = [4, 5];
const KOSTYA_MASS_INFECTION_ANIMATION_ROW = 2;
const KOSTYA_KATANA_SLASH_ANIMATION_ROW = 7;
const KOSTYA_KATANA_SLASH_FRAME_COLUMNS = [0, 1, 2];
const KOSTYA_CAPE_ANIMATION_ROW = 7;
const KOSTYA_CAPE_FRAME_COLUMNS = [3, 4, 5];
const PATRICK_SHEET_FRAME_SIZE = 32;
const PATRICK_IDLE_FRAME_COLUMNS = [0, 1, 2];
const PATRICK_THINKING_FRAME_COLUMNS = [3, 4, 5];
const PATRICK_ANIMATION_FRAME_COLUMNS = [0, 1, 2, 3, 4, 5];
const PATRICK_ANIMATION_ROW = 0;
const PATRICK_DODGE_FRAME = { row: 1, column: 5 };
const PATRICK_DAMAGED_FRAME = { row: 1, column: 6 };
const PATRICK_COLLAPSED_FRAME = { row: 1, column: 7 };
const PATRICK_REVOLVER_ANIMATION_ROW = 1;
const PATRICK_REVOLVER_INTRO_FRAME_COLUMNS = [0, 1, 2];
const PATRICK_REVOLVER_OUTRO_FRAME_COLUMNS = [2, 3, 4];
const PATRICK_REVOLVER_READY_FRAME = { row: 1, column: 2 };
const PATRICK_COIN_FLIP_ANIMATION_ROW = 2;
const PATRICK_FEELIN_FINE_ANIMATION_ROW = 2;
const PATRICK_FEELIN_FINE_FRAME_COLUMNS = [4, 5, 6, 7];
const PATRICK_ACE_CAST_ANIMATION_ROW = 0;
const PATRICK_ACE_CAST_FRAME_COLUMNS = [6, 7];
const PATRICK_DUAL_WIELD_ANIMATION_ROW = 3;
const PATRICK_DUAL_WIELD_INTRO_FRAME_COLUMNS = [0, 1, 2];
const PATRICK_DUAL_WIELD_OUTRO_FRAME_COLUMNS = [2, 3, 4];
const PATRICK_DUAL_WIELD_SECOND_SHOT_FRAME_COLUMNS = [5, 6, 7];
const PATRICK_DUAL_WIELD_READY_FRAME = { row: 3, column: 2 };
const PATRICK_DUAL_WIELD_OUTRO_HOLD_FRAME = { row: 3, column: 4 };
const PATRICK_COIN_TOSS_AIM_FRAME = { row: 4, column: 0 };
const PATRICK_COIN_TOSS_FLIP_FRAME = { row: 4, column: 1 };
const PATRICK_COIN_TOSS_READY_FRAME = { row: 4, column: 2 };
const PATRICK_COIN_TOSS_SHOT_FRAME = { row: 4, column: 3 };
const JACOB_SHEET_FRAME_SIZE = 32;
const JACOB_IDLE_FRAME_COLUMNS = [0, 1, 2];
const JACOB_THINKING_FRAME_COLUMNS = [3, 4, 5];
const JACOB_DEFEND_IDLE_FRAME_COLUMNS = [6, 7];
const JACOB_ANIMATION_FRAME_COLUMNS = [0, 1, 2, 3, 4, 5];
const JACOB_ANIMATION_ROW = 0;
const JACOB_PARRY_FRAME = { row: 1, column: 0 };
const JACOB_PARRY_FRAME_COLUMNS = [0, 1, 2];
const JACOB_BALL_KICK_ANIMATION_ROW = 1;
const JACOB_BALL_KICK_FRAME_COLUMNS = [3, 4, 5, 6];
const JACOB_DAMAGED_FRAME = { row: 1, column: 7 };
const JACOB_COLLAPSED_FRAME = { row: 2, column: 0 };
const JACOB_DODGE_FRAME = { row: 2, column: 1 };
const PATRICK_REGULAR_FRAME_DURATION_MS = 125;
const PATRICK_SLOWED_FRAME_DURATION_MS = 250;
const PATRICK_FASTER_FRAME_DURATION_MS = 75;
const KOSTYA_WALK_FRAME_DURATION_MS = 250;
const KOSTYA_KATANA_FRAME_DURATION_MS = 175;
const KOSTYA_DEEP_FOCUS_FRAME_DURATION_MS = 650;
const PATRICK_COIN_FLIP_FRAME_DURATION_MS = PATRICK_FASTER_FRAME_DURATION_MS;
const PATRICK_REVOLVER_OVERRIDE_FRAME_DURATION_MS = PATRICK_FASTER_FRAME_DURATION_MS;
const PATRICK_ACE_ICON_TILE_SIZE = 8;
const PATRICK_ACE_BACK_ICON_TILE_SIZE = 16;
const JACOB_COMBAT_REFERENCE_BOUNDS = getJacobAnimationSourceRect(JACOB_ANIMATION_ROW, JACOB_ANIMATION_FRAME_COLUMNS);
const JACOB_COMBAT_REFERENCE_BOTTOM = JACOB_COMBAT_REFERENCE_BOUNDS.localY + JACOB_COMBAT_REFERENCE_BOUNDS.sh;
const KOSTYA_COMBAT_REFERENCE_BOUNDS = getKostyaAnimationSourceRect(KOSTYA_ANIMATION_ROW, KOSTYA_ANIMATION_FRAME_COLUMNS);
const KOSTYA_COMBAT_REFERENCE_BOTTOM = KOSTYA_COMBAT_REFERENCE_BOUNDS.localY + KOSTYA_COMBAT_REFERENCE_BOUNDS.sh;
const KOSTYA_KATANA_SLASH_REFERENCE_BOUNDS = getKostyaAnimationSourceRect(
  KOSTYA_KATANA_SLASH_ANIMATION_ROW,
  KOSTYA_KATANA_SLASH_FRAME_COLUMNS
);
const PATRICK_COMBAT_REFERENCE_BOUNDS = getPatrickAnimationSourceRect(PATRICK_ANIMATION_ROW, PATRICK_ANIMATION_FRAME_COLUMNS);
const PATRICK_COMBAT_REFERENCE_BOTTOM = PATRICK_COMBAT_REFERENCE_BOUNDS.localY + PATRICK_COMBAT_REFERENCE_BOUNDS.sh;

const playerImage = new Image();
playerImage.src = "sprites/player/player.png";
let selectedPlayerCharacterId = PATRICK_CHARACTER_ID;
const patrickRenderCanvas = document.createElement("canvas");
const patrickRenderContext = patrickRenderCanvas.getContext("2d");
const kostyaRenderCanvas = document.createElement("canvas");
const kostyaRenderContext = kostyaRenderCanvas.getContext("2d");
const kostyaShadowCanvas = document.createElement("canvas");
const kostyaShadowContext = kostyaShadowCanvas.getContext("2d");
const groundShadowImage = new Image();
groundShadowImage.src = "sprites/indicator/shadow.png";

const characterImages = {
  [JACOB_CHARACTER_ID]: getJacobImage(),
  [KOSTYA_CHARACTER_ID]: getKostyaImage(),
  [PATRICK_CHARACTER_ID]: getPatrickImage()
};

export function getPlayerImage() {
  return characterImages[selectedPlayerCharacterId] ?? playerImage;
}

export function getPlayerPortraitImage() {
  if (selectedPlayerCharacterId === JACOB_CHARACTER_ID) {
    return getJacobProfileImage();
  }

  if (selectedPlayerCharacterId === PATRICK_CHARACTER_ID) {
    return getPatrickProfileImage();
  }

  if (selectedPlayerCharacterId === KOSTYA_CHARACTER_ID) {
    return getKostyaProfileImage();
  }

  return getPlayerImage();
}

export function setSelectedPlayerCharacter(characterId) {
  if (characterImages[characterId]) {
    selectedPlayerCharacterId = characterId;
    return;
  }

  selectedPlayerCharacterId = PATRICK_CHARACTER_ID;
}

export function loadPlayerAssets(characterId = selectedPlayerCharacterId) {
  setSelectedPlayerCharacter(characterId);
  if (characterId === JACOB_CHARACTER_ID) {
    return Promise.all([
      loadJacobAssets(waitForImage),
      waitForImage(groundShadowImage)
    ]);
  }
  if (characterId === PATRICK_CHARACTER_ID) {
    return Promise.all([
      loadPatrickAssets(waitForImage),
      waitForImage(groundShadowImage)
    ]);
  }
  if (characterId === KOSTYA_CHARACTER_ID) {
    return Promise.all([
      loadKostyaAssets(waitForImage),
      waitForImage(groundShadowImage)
    ]);
  }
  return Promise.all([
    waitForImage(getPlayerImage()),
    waitForImage(groundShadowImage)
  ]);
}

export function getPlayerPosition() {
  const { groundRow } = getSceneMetrics();
  const step = PLAYER_TILE_SIZE + PLAYER_GAP_TILES;

  return {
    x: PLAYER_LEFT_MARGIN_TILES + step * PLAYER_SLOT_INDEX,
    y: groundRow - PLAYER_TILE_SIZE + PLAYER_GROUND_SINK_TILES
  };
}

export function getPlayerCompanionPosition(index = 0) {
  const step = PLAYER_TILE_SIZE + PLAYER_GAP_TILES;
  const { groundRow } = getSceneMetrics();
  const slotIndex = PLAYER_SUMMON_SLOT_INDEX + Math.max(0, index);

  return {
    x: PLAYER_LEFT_MARGIN_TILES + step * slotIndex,
    y: groundRow - PLAYER_TILE_SIZE + PLAYER_GROUND_SINK_TILES
  };
}

export function createPlayerUnit(characterId = selectedPlayerCharacterId, playerState = null) {
  setSelectedPlayerCharacter(characterId);
  const { x, y } = getPlayerPosition();
  const width = PLAYER_TILE_SIZE * TILE_SIZE;
  const height = PLAYER_TILE_SIZE * TILE_SIZE;

  if (characterId === JACOB_CHARACTER_ID) {
    return createCustomDrawItem({
      x,
      y,
      priority: PLAYER_PRIORITY,
      draw: ({ context }) => {
        const offsetX = playerState?.renderOffsetX ?? 0;
        const offsetY = playerState?.renderOffsetY ?? 0;
        const dx = Math.floor(x * TILE_SIZE + offsetX);
        const dy = Math.floor(y * TILE_SIZE + offsetY);
        const sourceRect = getJacobSourceRect(playerState);
        const scale = Math.min(width / JACOB_COMBAT_REFERENCE_BOUNDS.sw, height / JACOB_COMBAT_REFERENCE_BOUNDS.sh);
        const drawWidth = Math.floor(sourceRect.sw * scale);
        const drawHeight = Math.floor(sourceRect.sh * scale);
        const referenceDrawWidth = Math.floor(JACOB_COMBAT_REFERENCE_BOUNDS.sw * scale);
        const referenceOriginX = dx + Math.floor((width - referenceDrawWidth) / 2);
        const referenceOriginY = dy + Math.floor(height - JACOB_COMBAT_REFERENCE_BOTTOM * scale);
        const drawX = referenceOriginX + Math.floor((sourceRect.localX - JACOB_COMBAT_REFERENCE_BOUNDS.localX) * scale);
        const drawY = referenceOriginY + Math.floor(sourceRect.localY * scale);
        const tint = getJacobTint(playerState);

        context.imageSmoothingEnabled = false;
        drawGroundShadow(context, dx, dy, width, height);
        if (patrickRenderContext) {
          patrickRenderCanvas.width = drawWidth;
          patrickRenderCanvas.height = drawHeight;
          patrickRenderContext.imageSmoothingEnabled = false;
          patrickRenderContext.clearRect(0, 0, drawWidth, drawHeight);
          patrickRenderContext.drawImage(
            getJacobSheetImage(),
            sourceRect.sx,
            sourceRect.sy,
            sourceRect.sw,
            sourceRect.sh,
            0,
            0,
            drawWidth,
            drawHeight
          );
          if (tint) {
            patrickRenderContext.save();
            patrickRenderContext.globalCompositeOperation = "source-atop";
            patrickRenderContext.fillStyle = tint;
            patrickRenderContext.fillRect(0, 0, drawWidth, drawHeight);
            patrickRenderContext.restore();
          }
          context.drawImage(patrickRenderCanvas, drawX, drawY);
        } else {
          context.drawImage(
            getJacobSheetImage(),
            sourceRect.sx,
            sourceRect.sy,
            sourceRect.sw,
            sourceRect.sh,
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
        }
      }
    });
  }

  if (characterId === PATRICK_CHARACTER_ID) {
    return createCustomDrawItem({
      x,
      y,
      priority: PLAYER_PRIORITY,
      draw: ({ context }) => {
        setPatrickMilestoneRank(playerState?.milestoneRank ?? 0);
        const offsetX = playerState?.renderOffsetX ?? 0;
        const offsetY = playerState?.renderOffsetY ?? 0;
        const dx = Math.floor(x * TILE_SIZE + offsetX);
        const dy = Math.floor(y * TILE_SIZE + offsetY);
        const sourceRect = getPatrickSourceRect(playerState);
        const scale = Math.min(width / PATRICK_COMBAT_REFERENCE_BOUNDS.sw, height / PATRICK_COMBAT_REFERENCE_BOUNDS.sh);
        const drawWidth = Math.floor(sourceRect.sw * scale);
        const drawHeight = Math.floor(sourceRect.sh * scale);
        const referenceDrawWidth = Math.floor(PATRICK_COMBAT_REFERENCE_BOUNDS.sw * scale);
        const referenceOriginX = dx + Math.floor((width - referenceDrawWidth) / 2);
        const referenceOriginY = dy + Math.floor(height - PATRICK_COMBAT_REFERENCE_BOTTOM * scale);
        const drawX = referenceOriginX + Math.floor((sourceRect.localX - PATRICK_COMBAT_REFERENCE_BOUNDS.localX) * scale);
        const drawY = referenceOriginY + Math.floor(sourceRect.localY * scale);
        const tint = getPatrickTint(playerState);

        context.imageSmoothingEnabled = false;
        drawGroundShadow(context, dx, dy, width, height);
        drawPatrickPlayerEffect(context, playerState, dx, dy, width, height, "background");
        if (patrickRenderContext) {
          patrickRenderCanvas.width = drawWidth;
          patrickRenderCanvas.height = drawHeight;
          patrickRenderContext.imageSmoothingEnabled = false;
          patrickRenderContext.clearRect(0, 0, drawWidth, drawHeight);
          patrickRenderContext.drawImage(
            getPatrickSheetImage(),
            sourceRect.sx,
            sourceRect.sy,
            sourceRect.sw,
            sourceRect.sh,
            0,
            0,
            drawWidth,
            drawHeight
          );
          if (tint) {
            patrickRenderContext.save();
            patrickRenderContext.globalCompositeOperation = "source-atop";
            patrickRenderContext.fillStyle = tint;
            patrickRenderContext.fillRect(0, 0, drawWidth, drawHeight);
            patrickRenderContext.restore();
          }
          context.drawImage(patrickRenderCanvas, drawX, drawY);
        } else {
          context.drawImage(
            getPatrickSheetImage(),
            sourceRect.sx,
            sourceRect.sy,
            sourceRect.sw,
            sourceRect.sh,
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
        }
        drawPatrickPlayerEffect(context, playerState, dx, dy, width, height, "foreground");
      }
    });
  }

  if (characterId === KOSTYA_CHARACTER_ID) {
    return createCustomDrawItem({
      x,
      y,
      priority: PLAYER_PRIORITY,
      draw: ({ context }) => {
        setKostyaMilestoneRank(playerState?.milestoneRank ?? 0);
        const offsetX = playerState?.renderOffsetX ?? 0;
        const offsetY = playerState?.renderOffsetY ?? 0;
        const dx = Math.floor(x * TILE_SIZE + offsetX);
        const dy = Math.floor(y * TILE_SIZE + offsetY);
        const sourceRect = getKostyaSourceRect(playerState);
        const scale = Math.min(width / KOSTYA_COMBAT_REFERENCE_BOUNDS.sw, height / KOSTYA_COMBAT_REFERENCE_BOUNDS.sh);
        const drawWidth = Math.floor(sourceRect.sw * scale);
        const drawHeight = Math.floor(sourceRect.sh * scale);
        const referenceDrawWidth = Math.floor(KOSTYA_COMBAT_REFERENCE_BOUNDS.sw * scale);
        const referenceOriginX = dx + Math.floor((width - referenceDrawWidth) / 2);
        const referenceOriginY = dy + Math.floor(height - KOSTYA_COMBAT_REFERENCE_BOTTOM * scale);
        const drawX = referenceOriginX + Math.floor((sourceRect.localX - KOSTYA_COMBAT_REFERENCE_BOUNDS.localX) * scale);
        const drawY = referenceOriginY + Math.floor(sourceRect.localY * scale);
        const tint = getKostyaTint(playerState);

        context.imageSmoothingEnabled = false;
        drawGroundShadow(context, dx, dy, width, height);
        drawKostyaCapeEffect(context, playerState, dx, dy, width, height);
        if (kostyaRenderContext) {
          kostyaRenderCanvas.width = drawWidth;
          kostyaRenderCanvas.height = drawHeight;
          kostyaRenderContext.imageSmoothingEnabled = false;
          kostyaRenderContext.clearRect(0, 0, drawWidth, drawHeight);
          kostyaRenderContext.drawImage(
            getKostyaSheetImage(),
            sourceRect.sx,
            sourceRect.sy,
            sourceRect.sw,
            sourceRect.sh,
            0,
            0,
            drawWidth,
            drawHeight
          );
          if (tint) {
            kostyaRenderContext.save();
            kostyaRenderContext.globalCompositeOperation = "source-atop";
            kostyaRenderContext.fillStyle = tint;
            kostyaRenderContext.fillRect(0, 0, drawWidth, drawHeight);
            kostyaRenderContext.restore();
          }
          context.drawImage(kostyaRenderCanvas, drawX, drawY);
        } else {
          context.drawImage(
            getKostyaSheetImage(),
            sourceRect.sx,
            sourceRect.sy,
            sourceRect.sw,
            sourceRect.sh,
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
        }
        drawKostyaPlayerEffect(context, playerState, dx, dy, width, height);
      }
    });
  }

  return createCustomDrawItem({
    x,
    y,
    priority: PLAYER_PRIORITY,
    draw: ({ context }) => {
      const offsetX = playerState?.renderOffsetX ?? 0;
      const offsetY = playerState?.renderOffsetY ?? 0;
      const dx = Math.floor(x * TILE_SIZE + offsetX);
      const dy = Math.floor(y * TILE_SIZE + offsetY);

      context.imageSmoothingEnabled = false;
      drawGroundShadow(context, dx, dy, width, height);
      context.drawImage(getPlayerImage(), dx, dy, width, height);
    }
  });
}

export function createPlayerCompanionUnits(characterId = selectedPlayerCharacterId, playerState = null) {
  if (!playerState?.shadow || (playerState.shadow.hp ?? 0) <= 0) {
    return [];
  }

  if (characterId === KOSTYA_CHARACTER_ID) {
    return [createKostyaShadowUnit(playerState.shadow)];
  }

  if (characterId === JACOB_CHARACTER_ID && playerState.shadow.id === "goal") {
    return [createJacobGoalUnit(playerState.shadow)];
  }

  return [];
}

function createJacobGoalUnit(goalState) {
  const { x, y } = getPlayerCompanionPosition(0);
  const width = PLAYER_TILE_SIZE * TILE_SIZE;
  const height = PLAYER_TILE_SIZE * TILE_SIZE;

  return createCustomDrawItem({
    x,
    y,
    priority: SHADOW_PRIORITY,
    draw: ({ context }) => {
      const offsetX = goalState?.renderOffsetX ?? 0;
      const offsetY = goalState?.renderOffsetY ?? 0;
      const dx = Math.floor(x * TILE_SIZE + offsetX);
      const dy = Math.floor(y * TILE_SIZE + offsetY);

      context.save();
      context.imageSmoothingEnabled = false;
      drawGroundShadow(context, dx, dy, width, height);
      context.globalAlpha = 0.85;
      const frame = getJacobFrameSourceRect(0, 0);
      context.drawImage(
        getJacobSheetImage(),
        frame.sx,
        frame.sy,
        frame.sw,
        frame.sh,
        dx,
        dy,
        width,
        height
      );
      context.restore();
    }
  });
}

function createKostyaShadowUnit(shadowState) {
  const { x, y } = getPlayerCompanionPosition(0);
  const width = PLAYER_TILE_SIZE * TILE_SIZE;
  const height = PLAYER_TILE_SIZE * TILE_SIZE;

  return createCustomDrawItem({
    x,
    y,
    priority: SHADOW_PRIORITY,
    draw: ({ context }) => {
      setKostyaMilestoneRank(shadowState?.milestoneRank ?? 0);
      const offsetX = shadowState?.renderOffsetX ?? 0;
      const offsetY = shadowState?.renderOffsetY ?? 0;
      const dx = Math.floor(x * TILE_SIZE + offsetX);
      const dy = Math.floor(y * TILE_SIZE + offsetY);
      const sourceRect = getKostyaSourceRect(shadowState, { allowThinking: false });
      const scale = Math.min(width / KOSTYA_COMBAT_REFERENCE_BOUNDS.sw, height / KOSTYA_COMBAT_REFERENCE_BOUNDS.sh);
      const drawWidth = Math.floor(sourceRect.sw * scale);
      const drawHeight = Math.floor(sourceRect.sh * scale);
      const referenceDrawWidth = Math.floor(KOSTYA_COMBAT_REFERENCE_BOUNDS.sw * scale);
      const referenceOriginX = dx + Math.floor((width - referenceDrawWidth) / 2);
      const referenceOriginY = dy + Math.floor(height - KOSTYA_COMBAT_REFERENCE_BOTTOM * scale);
      const drawX = referenceOriginX + Math.floor((sourceRect.localX - KOSTYA_COMBAT_REFERENCE_BOUNDS.localX) * scale);
      const drawY = referenceOriginY + Math.floor(sourceRect.localY * scale);
      const tint = getKostyaShadowTint(shadowState);
      const alpha = getKostyaShadowAlpha(shadowState);

      context.save();
      context.globalAlpha = alpha;
      context.imageSmoothingEnabled = false;
      drawKostyaShadowEffect(context, shadowState, dx, dy, width, height);
      if (kostyaShadowContext) {
        kostyaShadowCanvas.width = drawWidth;
        kostyaShadowCanvas.height = drawHeight;
        kostyaShadowContext.imageSmoothingEnabled = false;
        kostyaShadowContext.clearRect(0, 0, drawWidth, drawHeight);
        kostyaShadowContext.drawImage(
          getKostyaSheetImage(),
          sourceRect.sx,
          sourceRect.sy,
          sourceRect.sw,
          sourceRect.sh,
          0,
          0,
          drawWidth,
          drawHeight
        );
        if (tint) {
          kostyaShadowContext.save();
          kostyaShadowContext.globalCompositeOperation = "source-atop";
          kostyaShadowContext.fillStyle = tint;
          kostyaShadowContext.fillRect(0, 0, drawWidth, drawHeight);
          kostyaShadowContext.restore();
        }
        context.drawImage(kostyaShadowCanvas, drawX, drawY);
      } else {
        context.drawImage(
          getKostyaSheetImage(),
          sourceRect.sx,
          sourceRect.sy,
          sourceRect.sw,
          sourceRect.sh,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        );
      }
      drawKostyaPlayerEffect(context, shadowState, dx, dy, width, height);
      drawKostyaShadowEffect(context, shadowState, dx, dy, width, height, "foreground");
      context.restore();
    }
  });
}

function drawKostyaShadowEffect(context, shadowState, dx, dy, width, height, layer = "background") {
  const effect = shadowState?.unitEffect;
  if (!effect || effect.type !== "field-promotion") {
    return;
  }

  const now = performance.now();
  const startedAt = Number(effect.startedAt ?? 0);
  const endsAt = Number(effect.endsAt ?? 0);
  if (endsAt <= now || endsAt <= startedAt) {
    return;
  }

  const progress = Math.max(0, Math.min(1, (now - startedAt) / (endsAt - startedAt)));
  const alpha = Math.sin(progress * Math.PI) * Number(effect.maxAlpha ?? 0.9);
  if (alpha <= 0.01) {
    return;
  }

  const icon = effect.icon ?? { row: 1, column: 6 };
  const iconSize = 16;
  const scale = Math.max(2, Math.floor(Math.min(width, height) / iconSize));
  const drawSize = iconSize * scale;
  const drawX = dx + Math.floor((width - drawSize) / 2);
  const drawY = dy + Math.floor((height - drawSize) / 2) - Math.floor(height * (layer === "background" ? 0.08 : 0.16));

  context.save();
  context.globalAlpha = layer === "background" ? alpha * 0.45 : alpha;
  context.imageSmoothingEnabled = false;
  context.drawImage(
    getKostyaActionIconImage(),
    (icon.column - 1) * iconSize,
    (icon.row - 1) * iconSize,
    iconSize,
    iconSize,
    drawX,
    drawY,
    drawSize,
    drawSize
  );
  context.restore();
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

function getPatrickSourceRect(playerState) {
  const overrideRect = getPatrickOverrideSourceRect(playerState);
  if (overrideRect) {
    return overrideRect;
  }

  const frameColumn = getPatrickAnimatedFrameColumn(playerState);
  const animationBounds = getPatrickAnimationSourceRect(PATRICK_ANIMATION_ROW, PATRICK_ANIMATION_FRAME_COLUMNS);
  return {
    sx: frameColumn * PATRICK_SHEET_FRAME_SIZE + animationBounds.localX,
    sy: PATRICK_ANIMATION_ROW * PATRICK_SHEET_FRAME_SIZE + animationBounds.localY,
    sw: animationBounds.sw,
    sh: animationBounds.sh,
    localX: animationBounds.localX,
    localY: animationBounds.localY
  };
}

function getJacobSourceRect(playerState) {
  const overrideRect = getJacobOverrideSourceRect(playerState);
  if (overrideRect) {
    return overrideRect;
  }

  const useDefendIdle = Number(playerState?.defendActiveUntilTurn ?? 0) >= Number(playerState?.currentGlobalTurn ?? 0);
  const isThinking = Boolean(
    playerState &&
    playerState.turnOwner === "player" &&
    playerState.phase === "player-turn"
  );
  const frameColumns = useDefendIdle
    ? JACOB_DEFEND_IDLE_FRAME_COLUMNS
    : (isThinking ? JACOB_THINKING_FRAME_COLUMNS : JACOB_IDLE_FRAME_COLUMNS);
  return getJacobAnimationFrameRect(
    JACOB_ANIMATION_ROW,
    frameColumns,
    getJacobAnimatedFrameColumn(frameColumns)
  );
}

function getKostyaSourceRect(playerState, { allowThinking = true } = {}) {
  const overrideRect = getKostyaOverrideSourceRect(playerState);
  if (overrideRect) {
    return overrideRect;
  }

  const frameColumn = getKostyaAnimatedFrameColumn(playerState, { allowThinking });
  const animationBounds = getKostyaAnimationSourceRect(KOSTYA_ANIMATION_ROW, KOSTYA_ANIMATION_FRAME_COLUMNS);
  return {
    sx: frameColumn * KOSTYA_SHEET_FRAME_SIZE + animationBounds.localX,
    sy: KOSTYA_ANIMATION_ROW * KOSTYA_SHEET_FRAME_SIZE + animationBounds.localY,
    sw: animationBounds.sw,
    sh: animationBounds.sh,
    localX: animationBounds.localX,
    localY: animationBounds.localY
  };
}

function getKostyaOverrideSourceRect(playerState) {
  if ((playerState?.hp ?? 1) <= 0) {
    return getKostyaFrameRectWithLocalBounds(KOSTYA_COLLAPSED_FRAME.row, KOSTYA_COLLAPSED_FRAME.column);
  }

  const override = playerState?.animationOverride;
  if (!override && playerState?.deepFocusActive) {
    return getKostyaAnimationFrameRect(
      KOSTYA_DEEP_FOCUS_ANIMATION_ROW,
      KOSTYA_DEEP_FOCUS_FRAME_COLUMNS,
      getSequenceFrameColumn(
        { startedAt: 0 },
        KOSTYA_DEEP_FOCUS_FRAME_COLUMNS,
        KOSTYA_DEEP_FOCUS_FRAME_DURATION_MS,
        { loop: true }
      )
    );
  }

  if (!override) {
    return null;
  }

  if (override.type === "damaged" && Number(override.endsAt ?? 0) > performance.now()) {
    return getKostyaFrameRectWithLocalBounds(KOSTYA_DAMAGED_FRAME.row, KOSTYA_DAMAGED_FRAME.column);
  }

  if (override.type === "dodge" && Number(override.endsAt ?? 0) > performance.now()) {
    return getKostyaFrameRectWithLocalBounds(KOSTYA_DODGE_FRAME.row, KOSTYA_DODGE_FRAME.column);
  }

  if (override.type === "dodge-ranged" && Number(override.endsAt ?? 0) > performance.now()) {
    return getKostyaFrameRectWithLocalBounds(KOSTYA_RANGED_DODGE_FRAME.row, KOSTYA_RANGED_DODGE_FRAME.column);
  }

  if (override.type === "walk") {
    return getKostyaSequenceFrameRect(
      override,
      KOSTYA_WALK_ANIMATION_ROW,
      KOSTYA_WALK_FRAME_COLUMNS,
      KOSTYA_WALK_FRAME_DURATION_MS
    );
  }

  if (override.type === "katana-intro" || override.type === "katana-ready") {
    return getKostyaFrameRectWithLocalBounds(KOSTYA_KATANA_READY_FRAME.row, KOSTYA_KATANA_READY_FRAME.column);
  }

  if (override.type === "shadow-summon" && Number(override.endsAt ?? 0) > performance.now()) {
    return getKostyaNonLoopingSequenceFrameRect(
      override,
      KOSTYA_SHADOW_SUMMON_ANIMATION_ROW,
      KOSTYA_SHADOW_SUMMON_FRAME_COLUMNS,
      KOSTYA_KATANA_FRAME_DURATION_MS
    );
  }

  if (override.type === "mass-infection-ready") {
    return getKostyaFrameRectWithLocalBounds(KOSTYA_MASS_INFECTION_READY_FRAME.row, KOSTYA_MASS_INFECTION_READY_FRAME.column);
  }

  if (override.type === "mass-infection-outro" && Number(override.endsAt ?? 0) > performance.now()) {
    return getKostyaNonLoopingSequenceFrameRect(
      override,
      KOSTYA_MASS_INFECTION_ANIMATION_ROW,
      KOSTYA_MASS_INFECTION_OUTRO_FRAME_COLUMNS,
      KOSTYA_KATANA_FRAME_DURATION_MS
    );
  }

  if (override.type === "katana-outro" && Number(override.endsAt ?? 0) > performance.now()) {
    return getKostyaNonLoopingSequenceFrameRect(
      override,
      KOSTYA_KATANA_ANIMATION_ROW,
      KOSTYA_KATANA_OUTRO_FRAME_COLUMNS,
      KOSTYA_KATANA_FRAME_DURATION_MS
    );
  }

  return null;
}

function getJacobOverrideSourceRect(playerState) {
  if ((playerState?.hp ?? 1) <= 0) {
    return getJacobFrameRectWithLocalBounds(JACOB_COLLAPSED_FRAME.row, JACOB_COLLAPSED_FRAME.column);
  }

  const override = playerState?.animationOverride;
  if (!override) {
    return null;
  }

  if (override.type === "damaged" && Number(override.endsAt ?? 0) > performance.now()) {
    return getJacobFrameRectWithLocalBounds(JACOB_DAMAGED_FRAME.row, JACOB_DAMAGED_FRAME.column);
  }

  if ((override.type === "dodge" || override.type === "dodge-ranged") && Number(override.endsAt ?? 0) > performance.now()) {
    return getJacobFrameRectWithLocalBounds(JACOB_DODGE_FRAME.row, JACOB_DODGE_FRAME.column);
  }

  if (override.type === "parry" && Number(override.endsAt ?? 0) > performance.now()) {
    return getJacobAnimationFrameRect(
      JACOB_PARRY_FRAME.row,
      JACOB_PARRY_FRAME_COLUMNS,
      getSequenceFrameColumn(override, JACOB_PARRY_FRAME_COLUMNS, PATRICK_FASTER_FRAME_DURATION_MS)
    );
  }

  if (override.type === "jacob-ball" && Number(override.endsAt ?? 0) > performance.now()) {
    const frameIndex = Math.max(0, Math.min(JACOB_BALL_KICK_FRAME_COLUMNS.length - 1, Number(override.windowIndex) || 0));
    return getJacobFrameRectWithLocalBounds(JACOB_BALL_KICK_ANIMATION_ROW, JACOB_BALL_KICK_FRAME_COLUMNS[frameIndex]);
  }

  return null;
}

function getPatrickOverrideSourceRect(playerState) {
  if ((playerState?.hp ?? 1) <= 0) {
    return getPatrickFrameRectWithLocalBounds(PATRICK_COLLAPSED_FRAME.row, PATRICK_COLLAPSED_FRAME.column);
  }

  const override = playerState?.animationOverride;
  if (!override) {
    return null;
  }

  if (override.type === "damaged" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickFrameRectWithLocalBounds(PATRICK_DAMAGED_FRAME.row, PATRICK_DAMAGED_FRAME.column);
  }

  if (override.type === "dodge" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickFrameRectWithLocalBounds(PATRICK_DODGE_FRAME.row, PATRICK_DODGE_FRAME.column);
  }

  if (override.type === "revolver-intro") {
    return getPatrickSequenceFrameRect(
      override,
      PATRICK_REVOLVER_ANIMATION_ROW,
      PATRICK_REVOLVER_INTRO_FRAME_COLUMNS,
      PATRICK_REVOLVER_OVERRIDE_FRAME_DURATION_MS
    );
  }

  if (override.type === "revolver-ready") {
    return getPatrickFrameRectWithLocalBounds(PATRICK_REVOLVER_READY_FRAME.row, PATRICK_REVOLVER_READY_FRAME.column);
  }

  if (override.type === "revolver-outro" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickSequenceFrameRect(
      override,
      PATRICK_REVOLVER_ANIMATION_ROW,
      PATRICK_REVOLVER_OUTRO_FRAME_COLUMNS,
      PATRICK_REVOLVER_OVERRIDE_FRAME_DURATION_MS
    );
  }

  if (override.type === "coin-flip" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickFrameRectWithLocalBounds(
      PATRICK_COIN_FLIP_ANIMATION_ROW,
      getSequenceFrameColumn(
        override,
        [0, 1, 2, 3, 2, 1],
        PATRICK_COIN_FLIP_FRAME_DURATION_MS
      )
    );
  }

  if (override.type === "coin-toss-aim") {
    return getPatrickFrameRectWithLocalBounds(PATRICK_COIN_TOSS_AIM_FRAME.row, PATRICK_COIN_TOSS_AIM_FRAME.column);
  }

  if (override.type === "coin-toss-flip" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickFrameRectWithLocalBounds(PATRICK_COIN_TOSS_FLIP_FRAME.row, PATRICK_COIN_TOSS_FLIP_FRAME.column);
  }

  if (override.type === "coin-toss-revolver-intro" && Number(override.endsAt ?? 0) > performance.now()) {
    const elapsed = Math.max(0, performance.now() - Number(override.startedAt ?? 0));
    if (elapsed < PATRICK_REVOLVER_OVERRIDE_FRAME_DURATION_MS * Math.max(0, PATRICK_REVOLVER_INTRO_FRAME_COLUMNS.length - 1)) {
      return getPatrickSequenceFrameRect(
        override,
        PATRICK_REVOLVER_ANIMATION_ROW,
        PATRICK_REVOLVER_INTRO_FRAME_COLUMNS,
        PATRICK_REVOLVER_OVERRIDE_FRAME_DURATION_MS
      );
    }

    return getPatrickFrameRectWithLocalBounds(PATRICK_COIN_TOSS_READY_FRAME.row, PATRICK_COIN_TOSS_READY_FRAME.column);
  }

  if (override.type === "coin-toss-revolver-ready") {
    return getPatrickFrameRectWithLocalBounds(PATRICK_COIN_TOSS_READY_FRAME.row, PATRICK_COIN_TOSS_READY_FRAME.column);
  }

  if (override.type === "coin-toss-shot" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickFrameRectWithLocalBounds(PATRICK_COIN_TOSS_SHOT_FRAME.row, PATRICK_COIN_TOSS_SHOT_FRAME.column);
  }

  if (override.type === "feelin-fine" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickSequenceFrameRect(
      override,
      PATRICK_FEELIN_FINE_ANIMATION_ROW,
      PATRICK_FEELIN_FINE_FRAME_COLUMNS,
      PATRICK_REGULAR_FRAME_DURATION_MS
    );
  }

  if (override.type === "ace-cast" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickSequenceFrameRect(
      override,
      PATRICK_ACE_CAST_ANIMATION_ROW,
      PATRICK_ACE_CAST_FRAME_COLUMNS,
      PATRICK_REGULAR_FRAME_DURATION_MS,
      { frameHold: 2 }
    );
  }

  if (override.type === "dual-wield-intro" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickSequenceFrameRect(
      override,
      PATRICK_DUAL_WIELD_ANIMATION_ROW,
      PATRICK_DUAL_WIELD_INTRO_FRAME_COLUMNS,
      PATRICK_REVOLVER_OVERRIDE_FRAME_DURATION_MS
    );
  }

  if (override.type === "dual-wield-ready") {
    return getPatrickFrameRectWithLocalBounds(PATRICK_DUAL_WIELD_READY_FRAME.row, PATRICK_DUAL_WIELD_READY_FRAME.column);
  }

  if (override.type === "dual-wield-outro-hold") {
    return getPatrickFrameRectWithLocalBounds(PATRICK_DUAL_WIELD_OUTRO_HOLD_FRAME.row, PATRICK_DUAL_WIELD_OUTRO_HOLD_FRAME.column);
  }

  if (override.type === "dual-wield-second-shot" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickSequenceFrameRect(
      override,
      PATRICK_DUAL_WIELD_ANIMATION_ROW,
      PATRICK_DUAL_WIELD_SECOND_SHOT_FRAME_COLUMNS,
      PATRICK_REVOLVER_OVERRIDE_FRAME_DURATION_MS
    );
  }

  if (override.type === "dual-wield-outro" && Number(override.endsAt ?? 0) > performance.now()) {
    return getPatrickSequenceFrameRect(
      override,
      PATRICK_DUAL_WIELD_ANIMATION_ROW,
      PATRICK_DUAL_WIELD_OUTRO_FRAME_COLUMNS,
      PATRICK_REVOLVER_OVERRIDE_FRAME_DURATION_MS
    );
  }

  return null;
}

function drawPatrickPlayerEffect(context, playerState, dx, dy, width, height, layer = "background") {
  const effect = playerState?.playerEffect;
  if (!effect || effect.type !== "ace-cast-effect") {
    return;
  }

  const now = performance.now();
  const endsAt = Number(effect.endsAt ?? 0);
  const startedAt = Number(effect.startedAt ?? 0);
  if (endsAt <= now || endsAt <= startedAt) {
    return;
  }

  const progress = Math.max(0, Math.min(1, (now - startedAt) / (endsAt - startedAt)));

  if (layer === "background") {
    drawPatrickAceBackIcon(context, effect, dx, dy, width, height, progress);
    return;
  }

  drawPatrickAceFallingCard(context, effect, dx, dy, width, height, progress);
}

function drawKostyaPlayerEffect(context, playerState, dx, dy, width, height) {
  const override = playerState?.animationOverride;
  if (!override || override.type !== "katana-outro") {
    return;
  }

  const now = performance.now();
  const endsAt = Number(override.endsAt ?? 0);
  const startedAt = Number(override.startedAt ?? 0);
  if (endsAt <= now || endsAt <= startedAt) {
    return;
  }

  const effectRect = getKostyaNonLoopingSequenceFrameRect(
    override,
    KOSTYA_KATANA_SLASH_ANIMATION_ROW,
    KOSTYA_KATANA_SLASH_FRAME_COLUMNS,
    KOSTYA_KATANA_FRAME_DURATION_MS
  );
  const scale = Math.min(width / KOSTYA_COMBAT_REFERENCE_BOUNDS.sw, height / KOSTYA_COMBAT_REFERENCE_BOUNDS.sh);
  const drawWidth = Math.floor(effectRect.sw * scale);
  const drawHeight = Math.floor(effectRect.sh * scale);
  const referenceDrawWidth = Math.floor(KOSTYA_COMBAT_REFERENCE_BOUNDS.sw * scale);
  const referenceOriginX = dx + Math.floor((width - referenceDrawWidth) / 2);
  const referenceOriginY = dy + Math.floor(height - KOSTYA_COMBAT_REFERENCE_BOTTOM * scale);
  const drawX = referenceOriginX
    + Math.floor((effectRect.localX - KOSTYA_COMBAT_REFERENCE_BOUNDS.localX) * scale)
    + Math.floor(width * 0.17);
  const drawY = referenceOriginY
    + Math.floor((effectRect.localY - KOSTYA_KATANA_SLASH_REFERENCE_BOUNDS.localY) * scale)
    - Math.floor(height * 0.1);
  const progress = Math.max(0, Math.min(1, (now - startedAt) / (endsAt - startedAt)));
  const alpha = Math.max(0, 1 - Math.max(0, progress - 0.7) / 0.3);

  if (alpha <= 0.01) {
    return;
  }

  context.save();
  context.globalAlpha = alpha;
  context.imageSmoothingEnabled = false;
  context.drawImage(
    getKostyaSheetImage(),
    effectRect.sx,
    effectRect.sy,
    effectRect.sw,
    effectRect.sh,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
  context.restore();
}

function drawKostyaCapeEffect(context, playerState, dx, dy, width, height) {
  const overrideType = playerState?.animationOverride?.type ?? null;
  if (
    (playerState?.milestoneRank ?? 0) < 3
    || (playerState?.hp ?? 1) <= 0
    || overrideType === "dodge-ranged"
  ) {
    return;
  }

  const capeColumn = getSequenceFrameColumn(
    { startedAt: 0 },
    KOSTYA_CAPE_FRAME_COLUMNS,
    PATRICK_SLOWED_FRAME_DURATION_MS,
    { loop: true }
  );
  const capeRect = getKostyaFrameRectWithLocalBounds(KOSTYA_CAPE_ANIMATION_ROW, capeColumn);
  const scale = Math.min(width / KOSTYA_COMBAT_REFERENCE_BOUNDS.sw, height / KOSTYA_COMBAT_REFERENCE_BOUNDS.sh);
  const drawWidth = Math.floor(capeRect.sw * scale);
  const drawHeight = Math.floor(capeRect.sh * scale);
  const referenceDrawWidth = Math.floor(KOSTYA_COMBAT_REFERENCE_BOUNDS.sw * scale);
  const referenceOriginX = dx + Math.floor((width - referenceDrawWidth) / 2);
  const referenceOriginY = dy + Math.floor(height - KOSTYA_COMBAT_REFERENCE_BOTTOM * scale);
  const drawX = referenceOriginX + Math.floor((capeRect.localX - KOSTYA_COMBAT_REFERENCE_BOUNDS.localX) * scale);
  const drawY = referenceOriginY + Math.floor(capeRect.localY * scale);

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    getKostyaSheetImage(),
    capeRect.sx,
    capeRect.sy,
    capeRect.sw,
    capeRect.sh,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
  context.restore();
}

function drawPatrickAceBackIcon(context, effect, dx, dy, width, height, progress) {
  const alpha = Math.sin(progress * Math.PI) * Number(effect.maxAlpha ?? 0.92);
  if (alpha <= 0.01) {
    return;
  }

  const icon = effect.icon ?? { row: 2, column: 2 };
  const iconScale = Math.max(1, Math.floor(Math.min(width, height) / PATRICK_ACE_BACK_ICON_TILE_SIZE));
  const drawSize = PATRICK_ACE_BACK_ICON_TILE_SIZE * iconScale;
  const drawX = dx + Math.floor((width - drawSize) / 2) - Math.floor(width * 0.05);
  const drawY = dy + Math.floor((height - drawSize) / 2) - Math.floor(height * 0.06);

  context.save();
  context.globalAlpha = alpha;
  context.imageSmoothingEnabled = false;
  context.drawImage(
    getPatrickActionIconImage(),
    (icon.column - 1) * PATRICK_ACE_BACK_ICON_TILE_SIZE,
    (icon.row - 1) * PATRICK_ACE_BACK_ICON_TILE_SIZE,
    PATRICK_ACE_BACK_ICON_TILE_SIZE,
    PATRICK_ACE_BACK_ICON_TILE_SIZE,
    drawX,
    drawY,
    drawSize,
    drawSize
  );
  context.restore();
}

function drawPatrickAceFallingCard(context, effect, dx, dy, width, height, progress) {
  const icon = { row: 1, column: 8 };
  const drawSize = Math.round(PATRICK_ACE_ICON_TILE_SIZE * 2.5);
  const origin = getPatrickAceCardOrigin(dx, dy, width, height);
  const endX = origin.x;
  const endY = origin.y + Math.floor(height * 0.42);
  const drawX = Math.floor(origin.x + (endX - origin.x) * progress);
  const drawY = Math.floor(origin.y + (endY - origin.y) * progress);
  const alpha = Math.max(0, 1 - progress);

  context.save();
  context.imageSmoothingEnabled = false;

  if (alpha > 0.01) {
    context.globalAlpha = alpha;
    context.drawImage(
      getPatrickIndicatorImage(),
      (icon.column - 1) * PATRICK_ACE_ICON_TILE_SIZE,
      (icon.row - 1) * PATRICK_ACE_ICON_TILE_SIZE,
      PATRICK_ACE_ICON_TILE_SIZE,
      PATRICK_ACE_ICON_TILE_SIZE,
      drawX,
      drawY,
      drawSize,
      drawSize
    );
  }

  context.restore();
}

function getPatrickAceCardOrigin(dx, dy, width, height) {
  return {
    x: dx + Math.floor(width * 0.69),
    y: dy + Math.floor(height * 0.27)
  };
}

function getPatrickFrameRectWithLocalBounds(row, column) {
  const frameRect = getPatrickFrameSourceRect(row, column);
  return {
    ...frameRect,
    localX: frameRect.sx - column * PATRICK_SHEET_FRAME_SIZE,
    localY: frameRect.sy - row * PATRICK_SHEET_FRAME_SIZE
  };
}

function getJacobFrameRectWithLocalBounds(row, column) {
  const frameRect = getJacobFrameSourceRect(row, column);
  return {
    ...frameRect,
    localX: frameRect.sx - column * JACOB_SHEET_FRAME_SIZE,
    localY: frameRect.sy - row * JACOB_SHEET_FRAME_SIZE
  };
}

function getKostyaFrameRectWithLocalBounds(row, column) {
  const frameRect = getKostyaFrameSourceRect(row, column);
  return {
    ...frameRect,
    localX: frameRect.sx - column * KOSTYA_SHEET_FRAME_SIZE,
    localY: frameRect.sy - row * KOSTYA_SHEET_FRAME_SIZE
  };
}

function getPatrickSequenceFrameRect(override, row, frameColumns, frameDurationMs, options = {}) {
  return getPatrickSequenceFrameRectWithOptions(override, row, frameColumns, frameDurationMs, options);
}

function getKostyaSequenceFrameRect(override, row, frameColumns, frameDurationMs) {
  return getKostyaAnimationFrameRect(
    row,
    frameColumns,
    getSequenceFrameColumn(override, frameColumns, frameDurationMs, { loop: true })
  );
}

function getKostyaNonLoopingSequenceFrameRect(override, row, frameColumns, frameDurationMs) {
  return getKostyaAnimationFrameRect(
    row,
    frameColumns,
    getSequenceFrameColumn(override, frameColumns, frameDurationMs)
  );
}

function getPatrickAnimatedFrameColumn(playerState) {
  const isThinking = Boolean(
    playerState &&
    playerState.turnOwner === "player" &&
    playerState.phase === "player-turn"
  );
  const frameColumns = isThinking ? PATRICK_THINKING_FRAME_COLUMNS : PATRICK_IDLE_FRAME_COLUMNS;
  const cycleLength = frameColumns.length * 2 - 2;
  const elapsedFrames = Math.floor(
    performance.now() / PATRICK_SLOWED_FRAME_DURATION_MS
  );
  const cycleIndex = cycleLength > 0 ? elapsedFrames % cycleLength : 0;
  const frameIndex = cycleIndex < frameColumns.length
    ? cycleIndex
    : cycleLength - cycleIndex;

  return frameColumns[frameIndex] ?? frameColumns[0];
}

function getJacobAnimatedFrameColumn(frameColumns) {
  const cycleLength = frameColumns.length * 2 - 2;
  const elapsedFrames = Math.floor(performance.now() / PATRICK_SLOWED_FRAME_DURATION_MS);
  const cycleIndex = cycleLength > 0 ? elapsedFrames % cycleLength : 0;
  const frameIndex = cycleIndex < frameColumns.length
    ? cycleIndex
    : cycleLength - cycleIndex;

  return frameColumns[frameIndex] ?? frameColumns[0];
}

function getKostyaAnimatedFrameColumn(playerState, { allowThinking = true } = {}) {
  const isThinking = Boolean(
    allowThinking &&
    playerState &&
    playerState.turnOwner === "player" &&
    playerState.phase === "player-turn"
  );
  const frameColumns = isThinking ? KOSTYA_THINKING_FRAME_COLUMNS : KOSTYA_IDLE_FRAME_COLUMNS;
  const cycleLength = frameColumns.length * 2 - 2;
  const elapsedFrames = Math.floor(
    performance.now() / PATRICK_SLOWED_FRAME_DURATION_MS
  );
  const cycleIndex = cycleLength > 0 ? elapsedFrames % cycleLength : 0;
  const frameIndex = cycleIndex < frameColumns.length
    ? cycleIndex
    : cycleLength - cycleIndex;

  return frameColumns[frameIndex] ?? frameColumns[0];
}

function isAnimationOverrideActive(playerState, animationType) {
  const override = playerState?.animationOverride;
  if (!override || override.type !== animationType) {
    return false;
  }

  return Number(override.endsAt ?? 0) > performance.now();
}

function getPatrickTint(playerState) {
  if ((playerState?.hp ?? 1) <= 0) {
    return "rgba(255, 72, 72, 0.22)";
  }

  if (isAnimationOverrideActive(playerState, "damaged")) {
    return "rgba(255, 72, 72, 0.28)";
  }

  return null;
}

function getJacobTint(playerState) {
  if ((playerState?.hp ?? 1) <= 0) {
    return "rgba(255, 72, 72, 0.22)";
  }

  if (isAnimationOverrideActive(playerState, "damaged")) {
    return "rgba(255, 72, 72, 0.28)";
  }

  return null;
}

function getKostyaTint(playerState) {
  if ((playerState?.hp ?? 1) <= 0) {
    return "rgba(255, 72, 72, 0.22)";
  }

  if (isAnimationOverrideActive(playerState, "damaged")) {
    return "rgba(255, 72, 72, 0.28)";
  }

  return null;
}

function getKostyaShadowAlpha(shadowState) {
  const targetAlpha = 0.4;
  const now = performance.now();
  const startedAt = Number(shadowState?.summonFadeStartedAt ?? 0);
  const endsAt = Number(shadowState?.summonFadeEndsAt ?? 0);
  if (endsAt <= startedAt || now >= endsAt) {
    return targetAlpha;
  }

  return Math.max(0, Math.min(targetAlpha, ((now - startedAt) / Math.max(1, endsAt - startedAt)) * targetAlpha));
}

function getKostyaShadowTint(shadowState) {
  if ((shadowState?.hp ?? 1) <= 0) {
    return getKostyaTint(shadowState);
  }

  if (shadowState?.summonActionId === "wraith") {
    return isAnimationOverrideActive(shadowState, "damaged")
      ? "rgba(255, 72, 72, 0.28)"
      : "rgba(224, 42, 42, 0.66)";
  }

  if (shadowState?.summonActionId === "ghost") {
    return isAnimationOverrideActive(shadowState, "damaged")
      ? "rgba(255, 72, 72, 0.28)"
      : "rgba(72, 148, 255, 0.58)";
  }

  const baseTint = getKostyaTint(shadowState);
  if (baseTint) {
    return baseTint;
  }

  return "rgba(60, 44, 108, 0.52)";
}

function getPatrickSequenceFrameRectWithOptions(
  override,
  row,
  frameColumns,
  frameDurationMs,
  { frameHold = 1, freezeAtFrameIndex = null, loop = false } = {}
) {
  return getPatrickFrameRectWithLocalBounds(
    row,
    getSequenceFrameColumn(override, frameColumns, frameDurationMs, { frameHold, freezeAtFrameIndex, loop })
  );
}

function getSequenceFrameColumn(
  override,
  frameColumns,
  frameDurationMs,
  { frameHold = 1, freezeAtFrameIndex = null, loop = false } = {}
) {
  if (!Array.isArray(frameColumns) || frameColumns.length === 0) {
    return 0;
  }

  const heldFrameDurationMs = Math.max(1, frameDurationMs) * Math.max(1, frameHold);
  const elapsed = Math.max(0, performance.now() - Number(override?.startedAt ?? 0));
  let frameIndex = Math.floor(elapsed / heldFrameDurationMs);

  if (Number.isInteger(freezeAtFrameIndex) && freezeAtFrameIndex >= 0) {
    frameIndex = Math.min(frameIndex, freezeAtFrameIndex);
  } else if (loop && frameColumns.length > 1) {
    frameIndex %= frameColumns.length;
  } else {
    frameIndex = Math.min(frameColumns.length - 1, frameIndex);
  }

  return frameColumns[frameIndex] ?? frameColumns[0];
}

function getKostyaAnimationFrameRect(row, frameColumns, frameColumn) {
  const animationBounds = getKostyaAnimationSourceRect(row, frameColumns);
  return {
    sx: frameColumn * KOSTYA_SHEET_FRAME_SIZE + animationBounds.localX,
    sy: row * KOSTYA_SHEET_FRAME_SIZE + animationBounds.localY,
    sw: animationBounds.sw,
    sh: animationBounds.sh,
    localX: animationBounds.localX,
    localY: animationBounds.localY
  };
}

function getJacobAnimationFrameRect(row, frameColumns, frameColumn) {
  const animationBounds = getJacobAnimationSourceRect(row, frameColumns);
  return {
    sx: frameColumn * JACOB_SHEET_FRAME_SIZE + animationBounds.localX,
    sy: row * JACOB_SHEET_FRAME_SIZE + animationBounds.localY,
    sw: animationBounds.sw,
    sh: animationBounds.sh,
    localX: animationBounds.localX,
    localY: animationBounds.localY
  };
}

function getRawKostyaFrameRect(row, column) {
  return {
    sx: column * KOSTYA_SHEET_FRAME_SIZE,
    sy: row * KOSTYA_SHEET_FRAME_SIZE,
    sw: KOSTYA_SHEET_FRAME_SIZE,
    sh: KOSTYA_SHEET_FRAME_SIZE,
    localX: 0,
    localY: 0
  };
}

export function getPlayerUiAnchor(playerState = null) {
  const { x, y } = getPlayerPosition();
  const offsetX = (playerState?.renderOffsetX ?? 0) / TILE_SIZE;
  const offsetY = (playerState?.renderOffsetY ?? 0) / TILE_SIZE;

  return {
    x: x + (PLAYER_TILE_SIZE / 2) + offsetX,
    y: y + PLAYER_TILE_SIZE + (2 / 3) + offsetY
  };
}

export function getPlayerStatusAnchor(playerState = null) {
  const { x, y } = getPlayerPosition();
  const offsetX = (playerState?.renderOffsetX ?? 0) / TILE_SIZE;
  const offsetY = (playerState?.renderOffsetY ?? 0) / TILE_SIZE;

  return {
    x: x + (PLAYER_TILE_SIZE / 2) + offsetX,
    y: y - 0.45 + offsetY
  };
}

export function getPlayerCompanionUiAnchor(index = 0, companionState = null) {
  const { x, y } = getPlayerCompanionPosition(index);
  const offsetX = (companionState?.renderOffsetX ?? 0) / TILE_SIZE;
  const offsetY = (companionState?.renderOffsetY ?? 0) / TILE_SIZE;

  return {
    x: x + (PLAYER_TILE_SIZE / 2) + offsetX,
    y: y + PLAYER_TILE_SIZE + (2 / 3) + offsetY
  };
}

export function getPlayerCompanionStatusAnchor(index = 0, companionState = null) {
  const { x, y } = getPlayerCompanionPosition(index);
  const offsetX = (companionState?.renderOffsetX ?? 0) / TILE_SIZE;
  const offsetY = (companionState?.renderOffsetY ?? 0) / TILE_SIZE;

  return {
    x: x + (PLAYER_TILE_SIZE / 2) + offsetX,
    y: y - 0.45 + offsetY
  };
}
