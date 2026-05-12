export const TILE_SIZE = 32;
export const MAX_PRIORITY = 16;
export const SURFACE_PRIORITY = 12;

const BASE_GRID_WIDTH = 36;
const BASE_GRID_HEIGHT = 22;
const BASE_GROUND_ROW = 13;
const BACKGROUND_DIM_ALPHA = 0.5;
const BACKGROUND_PRIORITY = 0;
const BACKGROUND_PROP_PRIORITY = 1;
const FLOOR_PROP_PRIORITY = 6;
const VARIANT_CHANCE = 0.005;
const PROP_CHANCE = 0.0025;
const STATUE_PROP_CHANCE = 0.001;
const MAX_SEWER_PROPS = 2;
const SEWER_PROP_TILE_SIZE = 3;
const SEWER_PROP_BUFFER = 2;
const STATUE_PROP_TILE_WIDTH = 4;
const STATUE_PROP_TILE_HEIGHT = 4;
const LAYER_BACKGROUND = "background";
const LAYER_FOREGROUND = "foreground";

const canvas = document.getElementById("dungeon-canvas");
const context = canvas.getContext("2d");

const spriteSheet = new Image();
spriteSheet.src = "sprites/tile/tile.png";
const sewerPropImage = new Image();
sewerPropImage.src = "sprites/tile/sewer.png";
const statuePropImage = new Image();
statuePropImage.src = "sprites/tile/statue.png";

context.imageSmoothingEnabled = false;

let sceneMetrics = calculateSceneMetrics(window.innerWidth, window.innerHeight);
applyCanvasMetrics(sceneMetrics);
let sceneSeed = 1;

const spriteCoordinates = {
  wall: { row: 1, column: 1 },
  floor: [
    { row: 1, column: 7 },
    { row: 1, column: 8 }
  ],
  cracked: [
    { row: 1, column: 4 },
    { row: 1, column: 5 },
    { row: 1, column: 6 }
  ],
  bottomMissingBrick: { row: 1, column: 2 },
  upperMissingBrick: { row: 1, column: 3 }
};

function calculateSceneMetrics(viewportWidth, viewportHeight) {
  const safeViewportHeight = Math.max(1, viewportHeight);
  const aspectRatio = viewportWidth / safeViewportHeight;
  const baseAspectRatio = BASE_GRID_WIDTH / BASE_GRID_HEIGHT;
  let gridWidth = BASE_GRID_WIDTH;
  let gridHeight = BASE_GRID_HEIGHT;

  if (aspectRatio > baseAspectRatio) {
    gridWidth = Math.ceil(BASE_GRID_HEIGHT * aspectRatio);
  } else if (aspectRatio < baseAspectRatio) {
    gridHeight = Math.ceil(BASE_GRID_WIDTH / aspectRatio);
  }

  const groundRow = Math.max(6, Math.min(gridHeight - 4, Math.round((BASE_GROUND_ROW / BASE_GRID_HEIGHT) * gridHeight)));

  return {
    gridWidth,
    gridHeight,
    backgroundHeight: groundRow,
    groundRow,
    foregroundStartRow: groundRow + 1,
    canvasWidth: gridWidth * TILE_SIZE,
    canvasHeight: gridHeight * TILE_SIZE
  };
}

function applyCanvasMetrics(metrics) {
  canvas.width = metrics.canvasWidth;
  canvas.height = metrics.canvasHeight;
}

export function getSceneMetrics() {
  return { ...sceneMetrics };
}

export function setSceneSeed(seed) {
  sceneSeed = normalizeSeed(seed);
}

function normalizeSeed(seed) {
  return (Math.abs(Math.floor(seed)) % 2147483646) + 1;
}

function createSeededRandom(seed) {
  let state = normalizeSeed(seed);

  return function nextRandom() {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function getSourceRect({ row, column }) {
  return {
    sx: (column - 1) * TILE_SIZE,
    sy: (row - 1) * TILE_SIZE,
    sw: TILE_SIZE,
    sh: TILE_SIZE
  };
}

function createTile(x, y, sprite, priority, dimAlpha = 0) {
  if (priority < 0 || priority > MAX_PRIORITY) {
    throw new Error(`Tile priority must be between 0 and ${MAX_PRIORITY}.`);
  }

  return { kind: "tile", x, y, sprite, priority, dimAlpha };
}

function createProp(x, y, image, width, height, priority, dimAlpha = 0) {
  if (priority < 0 || priority > MAX_PRIORITY) {
    throw new Error(`Prop priority must be between 0 and ${MAX_PRIORITY}.`);
  }

  return { kind: "prop", x, y, image, width, height, priority, dimAlpha };
}

export function createImageEntity({
  x,
  y,
  image,
  width,
  height,
  priority,
  offsetX = 0,
  offsetY = 0
}) {
  if (priority < 0 || priority > MAX_PRIORITY) {
    throw new Error(`Entity priority must be between 0 and ${MAX_PRIORITY}.`);
  }

  return { kind: "entity", x, y, image, width, height, priority, offsetX, offsetY, dimAlpha: 0 };
}

export function createCustomDrawItem({ priority, draw, x = 0, y = 0 }) {
  if (priority < 0 || priority > MAX_PRIORITY) {
    throw new Error(`Custom item priority must be between 0 and ${MAX_PRIORITY}.`);
  }

  return { kind: "custom", priority, draw, x, y };
}

function createLayerGrid(startRow, endRow, layerName, priority, dimAlpha = 0, random) {
  const tiles = [];
  const occupied = new Set();
  const { gridWidth } = sceneMetrics;

  for (let y = startRow; y < endRow; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
      const key = `${x},${y}`;

      if (occupied.has(key)) {
        continue;
      }

      if (random() < VARIANT_CHANCE && tryPlaceVariant({ x, y, layerName, priority, dimAlpha, occupied, tiles, random })) {
        continue;
      }

      placeTile({ x, y, sprite: spriteCoordinates.wall, priority, dimAlpha, occupied, tiles });
    }
  }

  return tiles;
}

function placeTile({ x, y, sprite, priority, dimAlpha, occupied, tiles }) {
  occupied.add(`${x},${y}`);
  tiles.push(createTile(x, y, sprite, priority, dimAlpha));
}

function canPlacePositions(positions, occupied) {
  const { gridWidth, gridHeight } = sceneMetrics;

  return positions.every(({ x, y }) => (
    x >= 0 &&
    x < gridWidth &&
    y >= 0 &&
    y < gridHeight &&
    !occupied.has(`${x},${y}`)
  ));
}

function tryPlaceVariant({ x, y, layerName, priority, dimAlpha, occupied, tiles, random }) {
  const variants = getVariantDefinitions(layerName);
  const shuffled = variants
    .map((variant) => ({ variant, sort: random() }))
    .sort((left, right) => left.sort - right.sort)
    .map(({ variant }) => variant);

  for (const variant of shuffled) {
    if (variant({ x, y, priority, dimAlpha, occupied, tiles, random })) {
      return true;
    }
  }

  return false;
}

function getVariantDefinitions(layerName) {
  const universal = [tryPlaceCrackedTile];

  if (layerName === LAYER_BACKGROUND) {
    return [tryPlaceUpperMissingBrick, ...universal];
  }

  if (layerName === LAYER_FOREGROUND) {
    return [tryPlaceBottomMissingBrick, ...universal];
  }

  return universal;
}

function tryPlaceCrackedTile({ x, y, priority, dimAlpha, occupied, tiles, random }) {
  if (!canPlacePositions([{ x, y }], occupied)) {
    return false;
  }

  const crackedVariants = spriteCoordinates.cracked;
  const sprite = crackedVariants[Math.floor(random() * crackedVariants.length)];
  placeTile({ x, y, sprite, priority, dimAlpha, occupied, tiles });
  return true;
}

function tryPlaceBottomMissingBrick({ x, y, priority, dimAlpha, occupied, tiles }) {
  if (!canPlacePositions([{ x, y }], occupied)) {
    return false;
  }

  placeTile({ x, y, sprite: spriteCoordinates.bottomMissingBrick, priority, dimAlpha, occupied, tiles });
  return true;
}

function tryPlaceUpperMissingBrick({ x, y, priority, dimAlpha, occupied, tiles }) {
  if (!canPlacePositions([{ x, y }], occupied)) {
    return false;
  }

  placeTile({ x, y, sprite: spriteCoordinates.upperMissingBrick, priority, dimAlpha, occupied, tiles });
  return true;
}

function createBackgroundProps(random) {
  const props = [];
  const placements = [];
  const { gridWidth, backgroundHeight } = sceneMetrics;
  const maxAnchorX = gridWidth - SEWER_PROP_TILE_SIZE;
  const maxAnchorY = backgroundHeight - SEWER_PROP_TILE_SIZE;

  for (let y = 0; y <= maxAnchorY; y += 1) {
    for (let x = 0; x <= maxAnchorX; x += 1) {
      if (props.length >= MAX_SEWER_PROPS) {
        return props;
      }

      if (random() >= PROP_CHANCE) {
        continue;
      }

      if (!canPlaceSewerProp(x, y, placements)) {
        continue;
      }

      placements.push({ x, y });
      props.push(
        createProp(
          x,
          y,
          sewerPropImage,
          SEWER_PROP_TILE_SIZE * TILE_SIZE,
          SEWER_PROP_TILE_SIZE * TILE_SIZE,
          BACKGROUND_PROP_PRIORITY
        )
      );
    }
  }

  return props;
}

function canPlaceSewerProp(x, y, placements) {
  return placements.every((placement) => {
    const blockedLeft = placement.x - SEWER_PROP_BUFFER;
    const blockedRight = placement.x + SEWER_PROP_TILE_SIZE - 1 + SEWER_PROP_BUFFER;
    const blockedTop = placement.y - SEWER_PROP_BUFFER;
    const blockedBottom = placement.y + SEWER_PROP_TILE_SIZE - 1 + SEWER_PROP_BUFFER;
    const sewerRight = x + SEWER_PROP_TILE_SIZE - 1;
    const sewerBottom = y + SEWER_PROP_TILE_SIZE - 1;

    return (
      sewerRight < blockedLeft ||
      x > blockedRight ||
      sewerBottom < blockedTop ||
      y > blockedBottom
    );
  });
}

function createFloorProps(random) {
  const props = [];
  const occupied = new Set();
  const { gridWidth, groundRow } = sceneMetrics;
  const statueTopRow = groundRow - STATUE_PROP_TILE_HEIGHT;

  for (let x = 0; x < gridWidth; x += 1) {
    if (random() < STATUE_PROP_CHANCE && canPlaceFloorProp(x, statueTopRow, STATUE_PROP_TILE_WIDTH, STATUE_PROP_TILE_HEIGHT, occupied)) {
      placeFloorProp(
        x,
        statueTopRow,
        STATUE_PROP_TILE_WIDTH,
        STATUE_PROP_TILE_HEIGHT,
        occupied,
        props,
        statuePropImage
      );
    }
  }

  return props;
}

function canPlaceFloorProp(x, y, width, height, occupied) {
  const positions = [];

  for (let offsetY = 0; offsetY < height; offsetY += 1) {
    for (let offsetX = 0; offsetX < width; offsetX += 1) {
      positions.push({ x: x + offsetX, y: y + offsetY });
    }
  }

  return canPlacePositions(positions, occupied);
}

function placeFloorProp(x, y, width, height, occupied, props, image) {
  for (let offsetY = 0; offsetY < height; offsetY += 1) {
    for (let offsetX = 0; offsetX < width; offsetX += 1) {
      occupied.add(`${x + offsetX},${y + offsetY}`);
    }
  }

  props.push(
    createProp(
      x,
      y,
      image,
      width * TILE_SIZE,
      height * TILE_SIZE,
      FLOOR_PROP_PRIORITY
    )
  );
}

export function buildDungeonTiles() {
  const { gridWidth, gridHeight, backgroundHeight, groundRow, foregroundStartRow } = sceneMetrics;
  const sceneItems = [];
  const random = createSeededRandom(sceneSeed);

  sceneItems.push(
    ...createLayerGrid(0, backgroundHeight, LAYER_BACKGROUND, BACKGROUND_PRIORITY, BACKGROUND_DIM_ALPHA, random)
  );
  sceneItems.push(...createBackgroundProps(random));

  for (let x = 0; x < gridWidth; x += 1) {
    const floorVariants = spriteCoordinates.floor;
    const floorSprite = floorVariants[Math.floor(random() * floorVariants.length)];
    sceneItems.push(createTile(x, groundRow, floorSprite, SURFACE_PRIORITY));
  }

  sceneItems.push(...createFloorProps(random));
  sceneItems.push(...createLayerGrid(foregroundStartRow, gridHeight, LAYER_FOREGROUND, SURFACE_PRIORITY, 0, random));

  return sceneItems;
}

function resizeCanvasDisplay() {
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

function syncSceneMetricsToViewport() {
  const nextMetrics = calculateSceneMetrics(window.innerWidth, window.innerHeight);
  const changed = (
    nextMetrics.gridWidth !== sceneMetrics.gridWidth ||
    nextMetrics.gridHeight !== sceneMetrics.gridHeight ||
    nextMetrics.groundRow !== sceneMetrics.groundRow
  );

  if (changed) {
    sceneMetrics = nextMetrics;
    applyCanvasMetrics(sceneMetrics);
  }

  resizeCanvasDisplay();
  return changed;
}

function applyDim(dx, dy, width, height, dimAlpha) {
  if (dimAlpha <= 0) {
    return;
  }

  context.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
  context.fillRect(dx, dy, width, height);
}

function drawSceneItem(item) {
  if (item.kind === "custom") {
    item.draw({ context, canvas, tileSize: TILE_SIZE });
    return;
  }

  const offsetX = item.offsetX ?? 0;
  const offsetY = item.offsetY ?? 0;
  const dx = item.x * TILE_SIZE + offsetX;
  const dy = item.y * TILE_SIZE + offsetY;

  if (item.kind === "prop" || item.kind === "entity") {
    context.drawImage(item.image, dx, dy, item.width, item.height);
    applyDim(dx, dy, item.width, item.height, item.dimAlpha ?? 0);
    return;
  }

  const { sx, sy, sw, sh } = getSourceRect(item.sprite);
  context.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, TILE_SIZE, TILE_SIZE);
  applyDim(dx, dy, TILE_SIZE, TILE_SIZE, item.dimAlpha ?? 0);
}

function sortSceneItems(sceneItems) {
  return [...sceneItems].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return left.y - right.y;
  });
}

export function createSceneRenderer() {
  let sceneItems = [];
  let resizeCallback = null;

  function renderScene() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    sortSceneItems(sceneItems).forEach(drawSceneItem);
  }

  function handleResize() {
    const metricsChanged = syncSceneMetricsToViewport();

    if (metricsChanged && resizeCallback) {
      resizeCallback(getSceneMetrics());
    }

    renderScene();
  }

  return {
    canvas,
    setSceneItems(nextSceneItems) {
      sceneItems = [...nextSceneItems];
    },
    onResize(callback) {
      resizeCallback = callback;
    },
    render() {
      renderScene();
    },
    attachResizeHandler() {
      window.addEventListener("resize", handleResize);
    },
    resize() {
      handleResize();
    }
  };
}

export function waitForImage(image) {
  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => image.addEventListener("load", resolve, { once: true }));
}

export function loadTileAssets() {
  return Promise.all([
    waitForImage(spriteSheet),
    waitForImage(sewerPropImage),
    waitForImage(statuePropImage)
  ]);
}
