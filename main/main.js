import {
  clearCurrentLevelForDebug,
  createBattleState,
  getTargetableEnemiesForAction,
  getVisibleActionsForState,
  handleBattleAction,
  handleBattleKeyDown,
  handleBattleKeyUp,
  isEnemyTargetableForAction,
  handleUpgradeSelection,
  preloadBattleAudioAssets,
  primeBattleAudioPlayback,
  refillPlayerForDebug,
  setupKostyaCounterEasterEggDebug,
  skipPlayerTurnForDebug,
  setActionMenu,
  triggerCounterFeedbackDebug,
  teleportToLevelForDebug
} from "./combat.js";
import {
  DEFAULT_DEV_MODE_ENABLED,
  DEV_MODE_VISIBILITY_ENABLED,
  DEV_MULTIPLAYER_MODE,
  MULTIPLAYER_BACKEND_URL
} from "./dev-config.js";
import { createEnemyUnits, loadEnemyAssets } from "./enemy.js";
import { getLanguage, onLanguageChange, setLanguage, t } from "./lang.js";
import { createPlayerCompanionUnits, createPlayerUnit, loadPlayerAssets, setSelectedPlayerCharacter } from "./party.js";
import { CHARACTER_ROSTER, getCharacterInfo, getLocalizedCharacterName } from "./player/characters.js";
import { canJacobUseDefend, canJacobUseGuard } from "./player/jacob.js";
import { getActionScrollMaxOffset, getActionStripBounds, getUiCanvas, getUiClickTarget, loadUiAssets, renderUiLayer } from "./ui.js";
import { buildDungeonTiles, createSceneRenderer, loadTileAssets, setSceneSeed } from "./tile.js";

const MENU_FALL_ASSETS = [
  {
    kind: "burger",
    weight: 5,
    image: "sprites/indicator/item.png",
    backgroundSize: "400% 400%",
    backgroundPosition: "33.333% 33.333%",
    minSize: 42,
    maxSize: 154
  },
  {
    kind: "fries",
    weight: 1,
    image: "sprites/indicator/item.png",
    backgroundSize: "400% 400%",
    backgroundPosition: "66.666% 33.333%",
    minSize: 34,
    maxSize: 70
  },
  {
    kind: "nuggets",
    weight: 1,
    image: "sprites/indicator/item.png",
    backgroundSize: "400% 400%",
    backgroundPosition: "100% 66.666%",
    minSize: 34,
    maxSize: 70
  },
  {
    kind: "darek",
    weight: 1,
    image: "sprites/indicator/darek.png",
    backgroundSize: "contain",
    backgroundPosition: "center",
    minSize: 82,
    maxSize: 164
  }
];
const MENU_FALL_DAREK_CHANCE = 1 / 64;
const MENU_MUSIC_PATH = "sound/music/menu.mp3";
const LEVEL_MUSIC_TRACKS = {
  generic: "sound/music/generic.mp3",
  "final-stand": "sound/music/final_stand.mp4",
  "final-stand-alt": "sound/music/final_stand_alt.mp4",
  "last-surprise": "sound/music/last_surprise.mp3"
};
const DEFAULT_MUSIC_VOLUME = 0.5;
const DEFAULT_SFX_VOLUME = 0.5;
const MUSIC_VOLUME_STORAGE_KEY = "burger-dungeon-music-volume";
const SFX_VOLUME_STORAGE_KEY = "burger-dungeon-sfx-volume";
const HP_SATURATION_STORAGE_KEY = "burger-dungeon-hp-saturation";
const DEV_MODE_STORAGE_KEY = "burger-dungeon-dev-mode";
const PLAYER_ID_STORAGE_KEY = "burger-dungeon-player-id";
const PLAYER_LABEL_STORAGE_KEY = "burger-dungeon-player-label";
const CURSOR_URL = "url(\"sprites/indicator/cursor.png\") 0 0";
const ITEM_ICON_SHEET_PATH = "sprites/indicator/item.png";
const PARTY_SIZE_LIMITS = {
  solo: 1,
  duo: 2,
  trio: 3
};
const LOCAL_MULTIPLAYER_CHANNEL = "burger-dungeon-local-multiplayer";
const LOCAL_MULTIPLAYER_STORAGE_PREFIX = "burger-dungeon-local-lobby-";
const MIN_LOADING_SCREEN_MS = 2000;
const AUDIO_PRELOAD_TIMEOUT_MS = 15000;
const UI_FONT_LOAD_TIMEOUT_MS = 750;

let hasStartedGame = false;
let menuMusic = null;
let battleMusic = null;
let activeBattleMusicKey = null;
let battleMusicUnlocked = false;
const battleMusicCache = new Map();
const battleMusicPreloadPromises = new Map();
let activeBattleState = null;
let activeRefreshScene = null;
let battlefieldAnimationFrameId = null;
let loadingBurgerSpriteSheet = null;
let loadingBurgerSourcePixels = null;
let loadingBurgerRenderCanvas = null;
let uiFontReadyPromise = null;
const menuSetupState = {
  difficulty: "casual",
  character: "patrick",
  partySize: "solo"
};
const localPlayerIdentity = getLocalPlayerIdentity();
const multiplayerState = {
  mode: getConfiguredMultiplayerMode(),
  currentLobbyCode: null,
  currentPlayerId: localPlayerIdentity.id,
  hostedLobby: null,
  joinLookup: null,
  joinCode: "",
  joinStatus: "",
  hostStatus: "",
  unsubscribe: null,
  transport: null
};

multiplayerState.transport = createMultiplayerTransport();

async function bootstrapBattlefield(options = {}) {
  await ensureUiFontReady();

  const renderer = createSceneRenderer();
  const selectedCharacterId = getSelectedCharacterForCurrentPlayer();
  setSelectedPlayerCharacter(selectedCharacterId);
  const battleState = createBattleState(selectedCharacterId, {
    isSolo: menuSetupState.partySize === "solo"
  });
  battleState.devModeEnabled = getStoredDevModeEnabled();
  activeBattleState = battleState;
  let levelSceneItems = [];

  await preloadBattleAssets(selectedCharacterId, options.onProgress);

  function rebuildLevelScene() {
    setSceneSeed(battleState.levelSeed);
    levelSceneItems = buildDungeonTiles();
  }

  function buildScene() {
    renderer.setSceneItems([
      ...levelSceneItems,
      ...createEnemyUnits(battleState.enemies),
      createPlayerUnit(selectedCharacterId, {
        ...battleState.player,
        turnOwner: battleState.turnOwner,
        phase: battleState.phase
      }),
      ...createPlayerCompanionUnits(selectedCharacterId, battleState.player)
    ]);
  }

  function refreshScene() {
    syncBattleMusicForState(battleState);
    buildScene();
    renderer.render();
    renderUiLayer({
      sceneCanvas: renderer.canvas,
      battleState,
      actions: getVisibleActionsForState(battleState)
    });
    updateHpSaturationEffect(battleState);
  }
  activeRefreshScene = refreshScene;

  rebuildLevelScene();
  refreshScene();
  startBattlefieldAnimationLoop(refreshScene);
  renderer.resize();
  renderer.onResize(() => {
    rebuildLevelScene();
    refreshScene();
  });
  renderer.attachResizeHandler();

  attachInputHandlers(renderer, battleState, refreshScene, rebuildLevelScene);
}

function startBattlefieldAnimationLoop(render) {
  if (battlefieldAnimationFrameId !== null) {
    window.cancelAnimationFrame(battlefieldAnimationFrameId);
  }

  function renderFrame() {
    if (typeof activeRefreshScene === "function" && activeBattleState) {
      render();
    }

    battlefieldAnimationFrameId = window.requestAnimationFrame(renderFrame);
  }

  battlefieldAnimationFrameId = window.requestAnimationFrame(renderFrame);
}

async function preloadBattleAssets(selectedCharacterId, onProgress) {
  const assetLoaders = [
    () => loadTileAssets(),
    () => loadPlayerAssets(selectedCharacterId),
    () => loadEnemyAssets(),
    () => loadUiAssets(),
    () => preloadBattleAudioAssets(),
    () => preloadBattleMusicAssets()
  ];
  let completed = 0;
  const reportProgress = typeof onProgress === "function"
    ? onProgress
    : () => {};

  reportProgress(0);

  await Promise.all(assetLoaders.map(async (loadAssets) => {
    await loadAssets();
    completed += 1;
    reportProgress(completed / assetLoaders.length);
  }));
}

function attachInputHandlers(activeRenderer, state, render, rebuildLevelScene) {
  function getUiInteractionCanvas() {
    return getUiCanvas() ?? activeRenderer.canvas;
  }

  function isActionBlocked(selectedAction, availableActions) {
    const hasTargetableEnemies = getTargetableEnemies(state, selectedAction.id).length > 0;
    return (
      (selectedAction.id === "defend" && !canJacobUseDefend(state.player))
      || (selectedAction.id === "health-insurance" && (state.player.actionsRemaining ?? 0) !== (state.player.turnStartActionsRemaining ?? 0))
      || (selectedAction.id === "deep-focus" && (state.player.actionsRemaining ?? 0) !== (state.player.turnStartActionsRemaining ?? 0))
      || (selectedAction.id === "guard" && !canJacobUseGuard(state.player))
      || (selectedAction.id === "action-recall" && (state.player.actionRecallReady || state.player.pendingActionRecall))
      || (selectedAction.id === "goal" && (state.player.shadow?.hp ?? 0) > 0)
      || (["shadow", "ghost", "wraith"].includes(selectedAction.id) && state.player.characterId === "kostya" && (state.player.shadow?.hp ?? 0) > 0)
      || (selectedAction.requiresShadow === true && (state.player.shadow?.hp ?? 0) <= 0)
      || (selectedAction.requiresTarget && !hasTargetableEnemies)
      || (state.pendingTargetActionId !== null && state.pendingTargetActionId !== selectedAction.id)
      || ((selectedAction.costSp ?? 0) > (state.player.sp ?? 0))
      || ((selectedAction.minShadowCharge ?? selectedAction.costShadowCharge ?? 0) > (state.player.shadowCharge ?? 0))
      || ((selectedAction.minLuckyCharges ?? selectedAction.costLucky ?? 0) > (state.player.luckyCharges ?? 0))
      || !availableActions.some((action) => action.id === selectedAction.id)
    );
  }

  function beginTargetSelection(actionId, { lockedEnemyId = null, promptKey = "battle_choose_target_prompt" } = {}) {
    state.pendingTargetActionId = actionId;
    state.lockedTargetEnemyId = lockedEnemyId;
    state.targetSelectionMouseMoved = false;
    state.hoveredActionId = null;
    state.hoveredEnemyId = lockedEnemyId ?? getTargetableEnemies(state, actionId)[0]?.id ?? null;
    state.message = t(promptKey);
    activeRenderer.canvas.style.cursor = getCursorCss("target");
    render();
  }

  async function activateActionById(actionId) {
    const visibleActions = getVisibleActionsForState(state);
    const selectedAction = visibleActions.find((action) => action.id === actionId);
    if (!selectedAction) {
      return;
    }

    if (selectedAction.actionType === "menu") {
      setActionMenu(state, selectedAction.menuId ?? "root");
      state.hoveredActionId = getKeyboardNavigableActions(state)[0]?.id ?? null;
      render();
      return;
    }

    if (selectedAction.actionType === "menu-back") {
      setActionMenu(state, "root");
      state.hoveredActionId = getKeyboardNavigableActions(state)[0]?.id ?? null;
      render();
      return;
    }

    if (state.uiMode === "inspect") {
      state.inspectedActionId = actionId;
      render();
      return;
    }

    const availableActions = getKeyboardNavigableActions(state);
    if (isActionBlocked(selectedAction, availableActions)) {
      state.message = selectedAction.id === "guard" && !canJacobUseGuard(state.player)
        ? t("battle_jacob_guard_solo_warning")
        : t("battle_choose_action_remaining", { count: state.player.actionsRemaining });
      render();
      return;
    }

    if (selectedAction.requiresTarget) {
      beginTargetSelection(actionId);
      return;
    }

    if (state.player.characterId === "kostya" && actionId === "katana") {
      const lockedEnemyId = getTargetableEnemies(state, actionId)[0]?.id ?? null;
      if (!lockedEnemyId) {
        return;
      }
      beginTargetSelection(actionId, {
        lockedEnemyId,
        promptKey: "battle_locked_target_prompt"
      });
      return;
    }

    await handleBattleAction(actionId, state, render, rebuildLevelScene, null, selectedAction);
  }

  activeRenderer.canvas.addEventListener("click", async (event) => {
    const uiCanvas = getUiInteractionCanvas();
    const point = getCanvasPoint(uiCanvas, event);
    const target = getUiClickTarget({
      x: point.x,
      y: point.y,
      canvas: uiCanvas,
      battleState: state,
      actions: getVisibleActionsForState(state)
    });

    if (!target) {
      render();
      return;
    }

    if (target.type === "mode") {
      state.uiMode = target.id === "inspect" ? "inspect" : "play";
      state.inspectedActionId = null;
      render();
      return;
    }

    if (target.type === "upgrade") {
      if (state.rewardSelectionType === "ability") {
        state.pendingAbilityConfirmId = target.id;
        render();
        return;
      }

      handleUpgradeSelection(state, target.id, render, rebuildLevelScene);
      return;
    }

    if (target.type === "upgrade-confirm") {
      if (state.rewardSelectionType === "ability" && state.pendingAbilityConfirmId === target.id) {
        handleUpgradeSelection(state, target.id, render, rebuildLevelScene);
      }
      return;
    }

    if (target.type === "debug") {
      if (target.id === "kill-all") {
        clearCurrentLevelForDebug(state, render, rebuildLevelScene);
        return;
      }

      if (target.id === "refill-all") {
        refillPlayerForDebug(state);
        render();
        return;
      }

      if (target.id === "teleport") {
        const nextLevel = window.prompt("Teleport to level (1-50):", String(state.level));
        if (nextLevel !== null) {
          teleportToLevelForDebug(state, render, rebuildLevelScene, nextLevel);
        }
        return;
      }

      if (target.id === "slow-mo") {
        state.debugSlowMo = !state.debugSlowMo;
        render();
        return;
      }

      if (target.id === "kostya-counter-egg") {
        if (setupKostyaCounterEasterEggDebug(state)) {
          render();
        }
        return;
      }

      if (target.id === "skip-turn") {
        if (skipPlayerTurnForDebug(state, render, rebuildLevelScene)) {
          render();
        }
        return;
      }

      if (target.id === "counter-feedback") {
        if (triggerCounterFeedbackDebug(state)) {
          render();
        }
        return;
      }

    }

    if (target.type === "enemy") {
      if (state.pendingTargetActionId) {
        if (!isEnemyTargetableForAction(state, state.enemies.find((enemy) => enemy.id === target.id) ?? null, state.pendingTargetActionId)) {
          render();
          return;
        }
        const pendingAction = getVisibleActionsForState(state).find((action) => action.id === state.pendingTargetActionId) ?? null;
        await handleBattleAction(state.pendingTargetActionId, state, render, rebuildLevelScene, target.id, pendingAction);
        return;
      }

      render();
      return;
    }

    if (target.type === "action") {
      const selectedAction = getVisibleActionsForState(state).find((action) => action.id === target.id);
      if (state.uiMode === "inspect" && selectedAction?.actionType === "menu-back") {
        await activateActionById(target.id);
        return;
      }
    }

    if (state.uiMode === "inspect") {
      state.inspectedActionId = target.id;
      render();
      return;
    }

    await activateActionById(target.id);
  });

  activeRenderer.canvas.addEventListener("dblclick", async (event) => {
    if (state.uiMode !== "inspect" || state.pendingTargetActionId || state.pendingUpgradeSelection) {
      return;
    }

    const uiCanvas = getUiInteractionCanvas();
    const point = getCanvasPoint(uiCanvas, event);
    const target = getUiClickTarget({
      x: point.x,
      y: point.y,
      canvas: uiCanvas,
      battleState: state,
      actions: getVisibleActionsForState(state)
    });

    if (target?.type !== "action") {
      return;
    }

    const selectedAction = getVisibleActionsForState(state).find((action) => action.id === target.id);
    if (selectedAction?.actionType === "menu" || selectedAction?.actionType === "menu-back") {
      event.preventDefault();
      await activateActionById(target.id);
    }
  });

  activeRenderer.canvas.addEventListener("mousemove", (event) => {
    const uiCanvas = getUiInteractionCanvas();
    const point = getCanvasPoint(uiCanvas, event);
    const nextTarget = getUiClickTarget({
      x: point.x,
      y: point.y,
      canvas: uiCanvas,
      battleState: state,
      actions: getVisibleActionsForState(state)
    });
    const nextHoveredActionId = nextTarget && (nextTarget.type === "action" || nextTarget.type === "upgrade")
      ? nextTarget.id
      : null;
    let nextHoveredEnemyId = nextTarget?.type === "enemy" ? nextTarget.id : null;
    if (state.pendingTargetActionId) {
      if (state.lockedTargetEnemyId) {
        nextHoveredEnemyId = state.lockedTargetEnemyId;
      } else {
        state.targetSelectionMouseMoved = true;
      }
    }
    const nextCursor = state.pendingTargetActionId
      ? "target"
      : nextTarget
        ? "pointer"
        : "default";

    if (state.hoveredActionId !== nextHoveredActionId || state.hoveredEnemyId !== nextHoveredEnemyId) {
      state.hoveredActionId = nextHoveredActionId;
      state.hoveredEnemyId = nextHoveredEnemyId;
      activeRenderer.canvas.style.cursor = getCursorCss(nextCursor);
      render();
      return;
    }

    const currentCursor = activeRenderer.canvas.style.cursor;
    const desiredCursor = getCursorCss(nextCursor);
    if (currentCursor !== desiredCursor) {
      activeRenderer.canvas.style.cursor = desiredCursor;
    }
  });

  activeRenderer.canvas.addEventListener("mouseleave", () => {
    if (state.hoveredActionId !== null || state.hoveredEnemyId !== null) {
      state.hoveredActionId = null;
      state.hoveredEnemyId = state.pendingTargetActionId && state.lockedTargetEnemyId
        ? state.lockedTargetEnemyId
        : null;
      activeRenderer.canvas.style.cursor = getCursorCss("default");
      render();
    }
  });

  activeRenderer.canvas.addEventListener("wheel", (event) => {
    const visibleActions = getVisibleActionsForState(state);
    const uiCanvas = getUiInteractionCanvas();
    const strip = getActionStripBounds(uiCanvas, visibleActions, state);
    const point = getCanvasPoint(uiCanvas, event);
    if (
      point.x < strip.x ||
      point.x > strip.x + strip.width ||
      point.y < strip.y ||
      point.y > strip.y + strip.height
    ) {
      return;
    }

    const maxOffset = getActionScrollMaxOffset(uiCanvas, visibleActions, state);
    if (maxOffset <= 0) {
      return;
    }

    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const nextOffset = Math.max(0, Math.min(maxOffset, (state.actionScrollOffset ?? 0) + delta));
    if (nextOffset !== (state.actionScrollOffset ?? 0)) {
      state.actionScrollOffset = nextOffset;
      state.hoveredActionId = null;
      activeRenderer.canvas.style.cursor = getCursorCss("default");
      render();
    }
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if ((event.key === "Shift" || event.code === "ShiftLeft" || event.code === "ShiftRight") && state.pendingTargetActionId) {
      event.preventDefault();
      state.pendingTargetActionId = null;
      state.lockedTargetEnemyId = null;
      state.targetSelectionMouseMoved = false;
      state.hoveredEnemyId = null;
      state.message = t("battle_choose_action_remaining", { count: state.player.actionsRemaining });
      activeRenderer.canvas.style.cursor = getCursorCss("default");
      render();
      return;
    }

    if ((event.key === "a" || event.key === "A" || event.code === "ArrowLeft" || event.code === "KeyA") && canNavigateTargetSelection(state)) {
      event.preventDefault();
      moveTargetFocus(state, -1);
      render();
      return;
    }

    if ((event.key === "d" || event.key === "D" || event.code === "ArrowRight" || event.code === "KeyD") && canNavigateTargetSelection(state)) {
      event.preventDefault();
      moveTargetFocus(state, 1);
      render();
      return;
    }

    if (event.code === "Space" && canNavigateTargetSelection(state)) {
      event.preventDefault();
      const focusedEnemyId = getFocusedEnemyId(state);
      if (focusedEnemyId) {
        const pendingAction = getVisibleActionsForState(state).find((action) => action.id === state.pendingTargetActionId) ?? null;
        handleBattleAction(state.pendingTargetActionId, state, render, rebuildLevelScene, focusedEnemyId, pendingAction);
      }
      return;
    }

    if ((event.key === "Shift" || event.code === "ShiftLeft" || event.code === "ShiftRight") && state.actionMenu !== "root") {
      event.preventDefault();
      setActionMenu(state, "root");
      state.hoveredActionId = getKeyboardNavigableActions(state)[0]?.id ?? null;
      render();
      return;
    }

    if ((event.key === "Control" || event.code === "ControlLeft" || event.code === "ControlRight") && canToggleActionMode(state)) {
      event.preventDefault();
      state.uiMode = state.uiMode === "inspect" ? "play" : "inspect";
      state.inspectedActionId = null;
      render();
      return;
    }

    if ((event.key === "a" || event.key === "A" || event.code === "ArrowLeft" || event.code === "KeyA") && canNavigateActionMenu(state)) {
      event.preventDefault();
      moveActionFocus(state, -1);
      render();
      return;
    }

    if ((event.key === "d" || event.key === "D" || event.code === "ArrowRight" || event.code === "KeyD") && canNavigateActionMenu(state)) {
      event.preventDefault();
      moveActionFocus(state, 1);
      render();
      return;
    }

    if (event.code === "Space" && canNavigateActionMenu(state)) {
      event.preventDefault();
      const focusedActionId = getFocusedActionId(state);
      if (focusedActionId) {
        activateActionById(focusedActionId);
      }
      return;
    }

    handleBattleKeyDown(event, state, render);
  });

  window.addEventListener("keyup", (event) => {
    handleBattleKeyUp(event, state, render);
  });
}

function canNavigateActionMenu(state) {
  return (
    !state.pendingUpgradeSelection &&
    !state.pendingTargetActionId &&
    !state.battleOver &&
    !state.gameWon &&
    state.turnOwner === "player" &&
    state.phase === "player-turn" &&
    !state.dodgeCheck?.active &&
    !state.actionCheck?.active &&
    getKeyboardNavigableActions(state).length > 0
  );
}

function canToggleActionMode(state) {
  return (
    !state.pendingUpgradeSelection &&
    !state.pendingTargetActionId &&
    !state.battleOver &&
    !state.gameWon &&
    state.turnOwner === "player" &&
    state.phase === "player-turn" &&
    !state.dodgeCheck?.active &&
    !state.actionCheck?.active &&
    getVisibleActionsForState(state).some((action) => action.actionType !== "menu-back")
  );
}

function getKeyboardNavigableActions(state) {
  return getVisibleActionsForState(state).filter((action) => {
    if (action.actionType === "menu-back") {
      return false;
    }

    if (state.uiMode === "inspect") {
      return true;
    }

    return !(
      (action.id === "health-insurance" && (state.player.actionsRemaining ?? 0) !== (state.player.turnStartActionsRemaining ?? 0))
      || (action.id === "deep-focus" && (state.player.actionsRemaining ?? 0) !== (state.player.turnStartActionsRemaining ?? 0))
      || (action.id === "action-recall" && (state.player.actionRecallReady || state.player.pendingActionRecall))
      || (["shadow", "ghost", "wraith"].includes(action.id) && state.player.characterId === "kostya" && (state.player.shadow?.hp ?? 0) > 0)
      || (action.requiresShadow === true && (state.player.shadow?.hp ?? 0) <= 0)
      || (action.requiresTarget && getTargetableEnemies(state, action.id).length === 0)
      || (state.pendingTargetActionId !== null && state.pendingTargetActionId !== action.id)
      || ((action.costSp ?? 0) > (state.player.sp ?? 0))
      || ((action.minShadowCharge ?? action.costShadowCharge ?? 0) > (state.player.shadowCharge ?? 0))
      || ((action.minLuckyCharges ?? action.costLucky ?? 0) > (state.player.luckyCharges ?? 0))
    );
  });
}

function getFocusedActionId(state) {
  const actions = getKeyboardNavigableActions(state);
  if (actions.length === 0) {
    return null;
  }

  const hoveredId = state.hoveredActionId;
  if (actions.some((action) => action.id === hoveredId)) {
    return hoveredId;
  }

  if (actions.some((action) => action.id === state.inspectedActionId)) {
    return state.inspectedActionId;
  }

  return actions[0].id;
}

function moveActionFocus(state, direction) {
  const actions = getKeyboardNavigableActions(state);
  if (actions.length === 0) {
    state.hoveredActionId = null;
    return;
  }

  const focusedId = getFocusedActionId(state);
  const currentIndex = Math.max(0, actions.findIndex((action) => action.id === focusedId));
  const nextIndex = (currentIndex + direction + actions.length) % actions.length;
  const nextActionId = actions[nextIndex].id;

  state.hoveredActionId = nextActionId;
}

function getCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function getCursorCss(fallback = "default") {
  if (fallback === "target") {
    return `${getTargetCursorUrl()}, pointer`;
  }

  return `${CURSOR_URL}, ${fallback}`;
}

function getTargetCursorUrl() {
  const activeCharacterId = activeBattleState?.player?.characterId ?? getSelectedCharacterForCurrentPlayer();
  if (activeCharacterId === "kostya") {
    return "url(\"sprites/player/kostya/cursor.png\") 0 0";
  }

  return "url(\"sprites/player/patrick/cursor.png\") 0 0";
}

function canNavigateTargetSelection(state) {
  return (
    !state.pendingUpgradeSelection &&
    Boolean(state.pendingTargetActionId) &&
    !state.battleOver &&
    !state.gameWon &&
    state.turnOwner === "player" &&
    state.phase === "player-turn" &&
    !state.dodgeCheck?.active &&
    !state.actionCheck?.active &&
    getTargetableEnemies(state, state.pendingTargetActionId).length > 0
  );
}

function getTargetableEnemies(state, actionId = null) {
  const targetableEnemies = getTargetableEnemiesForAction(state, actionId ?? state?.pendingTargetActionId ?? null);

  if (!state?.lockedTargetEnemyId) {
    return targetableEnemies;
  }

  return targetableEnemies.filter((enemy) => enemy.id === state.lockedTargetEnemyId);
}

function getFocusedEnemyId(state) {
  const enemies = getTargetableEnemies(state);
  if (enemies.length === 0) {
    return null;
  }

  if (enemies.some((enemy) => enemy.id === state.hoveredEnemyId)) {
    return state.hoveredEnemyId;
  }

  return enemies[0].id;
}

function moveTargetFocus(state, direction) {
  const enemies = getTargetableEnemies(state);
  if (enemies.length === 0) {
    state.hoveredEnemyId = null;
    return;
  }

  const focusedEnemyId = getFocusedEnemyId(state);
  const currentIndex = Math.max(0, enemies.findIndex((enemy) => enemy.id === focusedEnemyId));
  const nextIndex = (currentIndex + direction + enemies.length) % enemies.length;
  state.hoveredEnemyId = enemies[nextIndex].id;
}

function setLoadingScreenProgress(loadingScreen, progress) {
  if (!loadingScreen) {
    return;
  }

  const normalized = Math.max(0, Math.min(1, Number(progress) || 0));
  loadingScreen.style.setProperty("--loading-progress", String(normalized));
  drawLoadingBurger(normalized);
}

function ensureLoadingBurgerSpriteSheet() {
  if (loadingBurgerSpriteSheet) {
    return loadingBurgerSpriteSheet;
  }

  const image = new Image();
  image.src = ITEM_ICON_SHEET_PATH;
  loadingBurgerSpriteSheet = image;
  return image;
}

function ensureLoadingBurgerSpritePixels() {
  if (loadingBurgerSourcePixels) {
    return loadingBurgerSourcePixels;
  }

  const spriteSheet = ensureLoadingBurgerSpriteSheet();
  if (!spriteSheet.complete || spriteSheet.naturalWidth === 0) {
    return null;
  }

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = 16;
  sourceCanvas.height = 16;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) {
    return null;
  }

  sourceContext.imageSmoothingEnabled = false;
  sourceContext.clearRect(0, 0, 16, 16);
  sourceContext.drawImage(spriteSheet, 16, 16, 16, 16, 0, 0, 16, 16);
  loadingBurgerSourcePixels = sourceContext.getImageData(0, 0, 16, 16);
  loadingBurgerRenderCanvas = sourceCanvas;
  return loadingBurgerSourcePixels;
}

function drawLoadingBurger(progress) {
  const canvas = document.getElementById("menu-loading-burger-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const context = canvas.getContext("2d");
  const sourcePixels = ensureLoadingBurgerSpritePixels();
  if (!context || !sourcePixels || !loadingBurgerRenderCanvas) {
    return;
  }

  const normalized = Math.max(0, Math.min(1, Number(progress) || 0));
  const width = canvas.width;
  const height = canvas.height;
  const burgerSize = Math.min(width, height);
  const destinationX = Math.floor((width - burgerSize) / 2);
  const destinationY = Math.floor((height - burgerSize) / 2);
  const sourceWidth = sourcePixels.width;
  const sourceHeight = sourcePixels.height;
  const renderContext = loadingBurgerRenderCanvas.getContext("2d", { willReadFrequently: true });
  if (!renderContext) {
    return;
  }

  const outputPixels = renderContext.createImageData(sourceWidth, sourceHeight);
  const sourceData = sourcePixels.data;
  const outputData = outputPixels.data;
  const fillThresholdColumn = Math.round(normalized * sourceWidth);

  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = false;

  for (let y = 0; y < sourceHeight; y += 1) {
    for (let x = 0; x < sourceWidth; x += 1) {
      const index = (y * sourceWidth + x) * 4;
      const alpha = sourceData[index + 3];
      if (alpha === 0) {
        outputData[index + 3] = 0;
        continue;
      }

      const isFilled = x <= fillThresholdColumn;
      const red = sourceData[index];
      const green = sourceData[index + 1];
      const blue = sourceData[index + 2];

      if (isFilled) {
        outputData[index] = red;
        outputData[index + 1] = green;
        outputData[index + 2] = blue;
      } else {
        outputData[index] = Math.round(red * 0.28);
        outputData[index + 1] = Math.round(green * 0.28);
        outputData[index + 2] = Math.round(blue * 0.28);
      }

      outputData[index + 3] = alpha;
    }
  }

  renderContext.putImageData(outputPixels, 0, 0);
  context.drawImage(loadingBurgerRenderCanvas, 0, 0, sourceWidth, sourceHeight, destinationX, destinationY, burgerSize, burgerSize);
}

function createLoadingScreenAnimator(loadingScreen, minimumDurationMs) {
  let animationFrameId = 0;
  let startedAt = 0;
  let assetProgress = 0;
  let assetsReady = false;

  function renderFrame(now) {
    if (!loadingScreen) {
      return;
    }

    if (!startedAt) {
      startedAt = now;
    }

    const elapsed = now - startedAt;
    const timeProgress = minimumDurationMs > 0
      ? Math.min(1, elapsed / minimumDurationMs)
      : 1;
    const targetProgress = assetsReady
      ? Math.max(assetProgress, timeProgress)
      : assetProgress;

    setLoadingScreenProgress(loadingScreen, targetProgress);

    if (!assetsReady || targetProgress < 1) {
      animationFrameId = window.requestAnimationFrame(renderFrame);
    }
  }

  animationFrameId = window.requestAnimationFrame(renderFrame);

  return {
    setAssetProgress(progress) {
      assetProgress = Math.max(assetProgress, Math.max(0, Math.min(1, Number(progress) || 0)));
      setLoadingScreenProgress(loadingScreen, assetProgress);
    },
    complete() {
      assetProgress = 1;
      assetsReady = true;
    },
    stop() {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      setLoadingScreenProgress(loadingScreen, 1);
    }
  };
}

function updateFaviconToBurgerSprite() {
  const favicon = document.getElementById("app-favicon");
  if (!(favicon instanceof HTMLLinkElement)) {
    return;
  }

  const sheet = ensureLoadingBurgerSpriteSheet();
  sheet.addEventListener("load", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sheet, 16, 16, 16, 16, 0, 0, 16, 16);
    favicon.href = canvas.toDataURL("image/png");
  }, { once: true });
  if (sheet.complete && sheet.naturalWidth > 0) {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sheet, 16, 16, 16, 16, 0, 0, 16, 16);
    favicon.href = canvas.toDataURL("image/png");
  }
}

function waitForMinimumDelay(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

async function initializeMenu() {
  await ensureUiFontReady();
  updateFaviconToBurgerSprite();
  ensureLoadingBurgerSpriteSheet().addEventListener("load", () => {
    drawLoadingBurger(0);
  }, { once: true });
  populateMenuFallLayer(document.getElementById("menu-fall-layer"));

  const menu = document.getElementById("main-menu");
  const gameShell = document.getElementById("game-shell");
  const loadingScreen = document.getElementById("menu-loading-screen");
  const startButton = document.getElementById("start-game-button");
  const joinRunButton = document.getElementById("join-run-button");
  const openSettingsButton = document.getElementById("open-settings-button");
  const closeSettingsButton = document.getElementById("close-settings-button");
  const settingsPanel = document.getElementById("menu-settings");
  const characterSelectPanel = document.getElementById("character-select-panel");
  const joinRunPanel = document.getElementById("join-run-panel");
  const closeCharacterSelectButton = document.getElementById("character-select-back-button");
  const confirmCharacterSelectButton = document.getElementById("character-select-confirm-button");
  const hostedRunPanel = document.getElementById("hosted-run-panel");
  const resolvePartyButton = document.getElementById("resolve-party-button");
  const characterPreviewCard = document.getElementById("character-preview-card");
  const characterPrevButton = document.getElementById("character-prev-button");
  const characterNextButton = document.getElementById("character-next-button");
  const joinRunCodeInput = document.getElementById("join-run-code-input");
  const joinRunBackButton = document.getElementById("join-run-back-button");
  const joinRunSearchButton = document.getElementById("join-run-search-button");
  const joinRunConfirmButton = document.getElementById("join-run-confirm-button");
  const musicVolumeSlider = document.getElementById("music-volume-slider");
  const musicVolumeValue = document.getElementById("music-volume-value");
  const sfxVolumeSlider = document.getElementById("sfx-volume-slider");
  const sfxVolumeValue = document.getElementById("sfx-volume-value");
  const languageSelect = document.getElementById("language-select");
  const hpSaturationField = document.getElementById("hp-saturation-field");
  const hpSaturationButton = document.getElementById("hp-saturation-button");
  const devModeField = document.getElementById("dev-mode-field");
  const devModeButton = document.getElementById("dev-mode-button");
  const setupOptionButtons = Array.from(document.querySelectorAll("[data-setting-group]"));

  if (!menu || !gameShell || !startButton) {
    bootstrapBattlefield();
    return;
  }

  const initialMusicVolume = getStoredMusicVolume();
  const initialSfxVolume = getStoredSfxVolume();
  menuMusic = createMenuMusic(initialMusicVolume);
  syncMusicVolumeUi(musicVolumeSlider, musicVolumeValue, initialMusicVolume);
  syncSfxVolumeUi(sfxVolumeSlider, sfxVolumeValue, initialSfxVolume);
  syncLanguageUi(languageSelect);
  applyMenuTranslations();
  syncHpSaturationUi(hpSaturationField, hpSaturationButton);
  updateHpSaturationEffect(activeBattleState);
  sanitizeDevModeRestrictedSetup();
  syncCharacterSetupUi(setupOptionButtons);
  syncDevModeUi(devModeField, devModeButton);
  syncCharacterPreview(characterPreviewCard, characterPrevButton, characterNextButton);
  syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
  syncHostedRunPanel(hostedRunPanel);
  syncPrimaryMenuButtons();
  syncConfirmButton(confirmCharacterSelectButton);
  void tryPlayMenuMusic();

  if (musicVolumeSlider instanceof HTMLInputElement) {
    musicVolumeSlider.addEventListener("input", () => {
      const nextVolume = Number(musicVolumeSlider.value) / 100;
      setGlobalMusicVolume(nextVolume);
      syncMusicVolumeUi(musicVolumeSlider, musicVolumeValue, nextVolume);
    });
  }

  if (sfxVolumeSlider instanceof HTMLInputElement) {
    sfxVolumeSlider.addEventListener("input", () => {
      const nextVolume = Number(sfxVolumeSlider.value) / 100;
      setStoredSfxVolume(nextVolume);
      syncSfxVolumeUi(sfxVolumeSlider, sfxVolumeValue, nextVolume);
    });
  }

  if (languageSelect instanceof HTMLSelectElement) {
    languageSelect.addEventListener("change", () => {
      setLanguage(languageSelect.value);
    });
  }

  hpSaturationButton?.addEventListener("click", () => {
    const nextEnabled = !getStoredHpSaturationEnabled();
    setStoredHpSaturationEnabled(nextEnabled);
    syncHpSaturationUi(hpSaturationField, hpSaturationButton);
    updateHpSaturationEffect(activeBattleState);
  });

  devModeButton?.addEventListener("click", () => {
    if (!DEV_MODE_VISIBILITY_ENABLED) {
      return;
    }

    const nextEnabled = !getStoredDevModeEnabled();
    setStoredDevModeEnabled(nextEnabled);
    sanitizeDevModeRestrictedSetup();
    if (!nextEnabled) {
      joinRunPanel?.classList.add("menu-settings-hidden");
      multiplayerState.joinLookup = null;
      multiplayerState.joinStatus = "";
      syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
    }
    syncDevModeUi(devModeField, devModeButton);
    syncCharacterSetupUi(setupOptionButtons);
    syncHostedRunPanel(hostedRunPanel);
    syncPrimaryMenuButtons();
    syncConfirmButton(confirmCharacterSelectButton);
  });

  onLanguageChange(() => {
    applyMenuTranslations();
    syncHpSaturationUi(hpSaturationField, hpSaturationButton);
    sanitizeDevModeRestrictedSetup();
    syncLanguageUi(languageSelect);
    syncCharacterSetupUi(setupOptionButtons);
    syncDevModeUi(devModeField, devModeButton);
    syncCharacterPreview(characterPreviewCard, characterPrevButton, characterNextButton);
    syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
    syncHostedRunPanel(hostedRunPanel);
    syncPrimaryMenuButtons();
    syncConfirmButton(confirmCharacterSelectButton);
    if (activeBattleState) {
      activeBattleState.player.name = getLocalizedCharacterName(activeBattleState.player.characterId, t);
    }
    activeRefreshScene?.();
  });

  openSettingsButton?.addEventListener("click", () => {
    settingsPanel?.classList.remove("menu-settings-hidden");
  });

  startButton?.addEventListener("click", () => {
    characterSelectPanel?.classList.remove("menu-settings-hidden");
    syncCharacterSetupUi(setupOptionButtons);
    syncCharacterPreview(characterPreviewCard, characterPrevButton, characterNextButton);
    syncHostedRunPanel(hostedRunPanel);
    syncConfirmButton(confirmCharacterSelectButton);
  });

  joinRunButton?.addEventListener("click", () => {
    if (isDevModeLockedControl("main", "join-run")) {
      return;
    }
    joinRunPanel?.classList.remove("menu-settings-hidden");
    multiplayerState.joinLookup = null;
    multiplayerState.joinStatus = t("menu_join_hint");
    syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
  });

  closeSettingsButton?.addEventListener("click", () => {
    settingsPanel?.classList.add("menu-settings-hidden");
  });

  closeCharacterSelectButton?.addEventListener("click", () => {
    characterSelectPanel?.classList.add("menu-settings-hidden");
    if (isInMultiplayerLobby()) {
      leaveCurrentLobby();
    }
    syncCharacterPreview(characterPreviewCard, characterPrevButton, characterNextButton);
    syncHostedRunPanel(hostedRunPanel);
    syncConfirmButton(confirmCharacterSelectButton);
    syncCharacterSetupUi(setupOptionButtons);
  });

  resolvePartyButton?.addEventListener("click", () => {
    if (!isCurrentPlayerHost()) {
      return;
    }

    leaveCurrentLobby();
    syncCharacterPreview(characterPreviewCard, characterPrevButton, characterNextButton);
    syncHostedRunPanel(hostedRunPanel);
    syncConfirmButton(confirmCharacterSelectButton);
    syncCharacterSetupUi(setupOptionButtons);
  });

  joinRunBackButton?.addEventListener("click", () => {
    joinRunPanel?.classList.add("menu-settings-hidden");
    multiplayerState.joinLookup = null;
    multiplayerState.joinStatus = "";
    syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
  });

  characterPrevButton?.addEventListener("click", () => {
    void shiftCharacterPreview(-1, characterPreviewCard, characterPrevButton, characterNextButton, setupOptionButtons, hostedRunPanel, confirmCharacterSelectButton);
  });

  characterNextButton?.addEventListener("click", () => {
    void shiftCharacterPreview(1, characterPreviewCard, characterPrevButton, characterNextButton, setupOptionButtons, hostedRunPanel, confirmCharacterSelectButton);
  });

  characterPreviewCard?.addEventListener("click", () => {
    void tryLockPreviewedCharacter(characterPreviewCard, characterPrevButton, characterNextButton, setupOptionButtons, hostedRunPanel, confirmCharacterSelectButton);
  });

  if (joinRunCodeInput instanceof HTMLInputElement) {
    joinRunCodeInput.addEventListener("input", () => {
      const sanitized = sanitizeRoomCode(joinRunCodeInput.value);
      multiplayerState.joinCode = sanitized;
      joinRunCodeInput.value = sanitized;
      multiplayerState.joinLookup = null;
      multiplayerState.joinStatus = sanitized.length === 6 ? "" : t("menu_join_hint");
      syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
    });
  }

  joinRunSearchButton?.addEventListener("click", async () => {
    multiplayerState.joinLookup = null;
    const roomCode = sanitizeRoomCode(multiplayerState.joinCode);
    multiplayerState.joinCode = roomCode;

    if (joinRunCodeInput instanceof HTMLInputElement) {
      joinRunCodeInput.value = roomCode;
    }

    if (roomCode.length !== 6) {
      multiplayerState.joinStatus = t("menu_join_invalid_code");
      syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
      return;
    }

    const lookupResult = await multiplayerState.transport.findLobby(roomCode);
    if (!lookupResult.ok || !lookupResult.lobby) {
      multiplayerState.joinStatus = lookupResult.errorKey ? t(lookupResult.errorKey) : t("menu_join_not_found");
      syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
      return;
    }

    multiplayerState.joinLookup = lookupResult.lobby;
    multiplayerState.joinStatus = t("menu_join_found", {
      count: lookupResult.lobby.players.length,
      max: lookupResult.lobby.maxPlayers
    });
    syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
  });

  joinRunConfirmButton?.addEventListener("click", async () => {
    if (!multiplayerState.joinLookup) {
      return;
    }

    const joinResult = await multiplayerState.transport.joinLobby({
      code: multiplayerState.joinLookup.code,
      playerId: multiplayerState.currentPlayerId,
      playerName: localPlayerIdentity.label
    });

    if (!joinResult.ok || !joinResult.lobby) {
      multiplayerState.joinStatus = joinResult.errorKey ? t(joinResult.errorKey) : t("menu_join_not_found");
      syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
      return;
    }

    setCurrentLobby(joinResult.lobby);
    subscribeToCurrentLobby(handleLobbySnapshot);
    multiplayerState.joinStatus = t("menu_join_success");
    joinRunPanel?.classList.add("menu-settings-hidden");
    characterSelectPanel?.classList.remove("menu-settings-hidden");
    syncLobbyBoundMenuSetup();
    syncJoinRunPanel(joinRunCodeInput, joinRunConfirmButton);
    syncHostedRunPanel(hostedRunPanel);
    syncConfirmButton(confirmCharacterSelectButton);
    syncCharacterSetupUi(setupOptionButtons);
    syncCharacterPreview(characterPreviewCard, characterPrevButton, characterNextButton);
  });

  setupOptionButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    button.addEventListener("click", async () => {
      const group = button.dataset.settingGroup;
      const value = button.dataset.settingValue;
      if (!group || !value) {
        return;
      }

      if (group !== "character" && isLobbyConfigLocked()) {
        return;
      }

      menuSetupState[group] = value;

      if (group === "partySize") {
        resetMultiplayerDraftState();
      }

      syncCharacterSetupUi(setupOptionButtons);
      syncCharacterPreview(characterPreviewCard, characterPrevButton, characterNextButton);
      syncHostedRunPanel(hostedRunPanel);
      syncConfirmButton(confirmCharacterSelectButton);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (characterSelectPanel?.classList.contains("menu-settings-hidden")) {
      return;
    }

    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      return;
    }

    if (event.code === "KeyA" || event.code === "ArrowLeft") {
      event.preventDefault();
      void shiftCharacterPreview(-1, characterPreviewCard, characterPrevButton, characterNextButton, setupOptionButtons, hostedRunPanel, confirmCharacterSelectButton);
      return;
    }

    if (event.code === "KeyD" || event.code === "ArrowRight") {
      event.preventDefault();
      void shiftCharacterPreview(1, characterPreviewCard, characterPrevButton, characterNextButton, setupOptionButtons, hostedRunPanel, confirmCharacterSelectButton);
      return;
    }

    if (event.code === "Enter" || event.code === "Space") {
      if (target instanceof HTMLButtonElement) {
        return;
      }
      event.preventDefault();
      void tryLockPreviewedCharacter(characterPreviewCard, characterPrevButton, characterNextButton, setupOptionButtons, hostedRunPanel, confirmCharacterSelectButton);
    }
  });

  document.addEventListener("pointerdown", handleMenuAudioWake, { passive: true });
  document.addEventListener("keydown", handleMenuAudioWake);

  async function launchGame() {
    if (hasStartedGame) {
      return;
    }

    primeBattleAudioPlayback();
    hasStartedGame = true;
    battleMusicUnlocked = false;
    startButton.disabled = true;
    if (confirmCharacterSelectButton instanceof HTMLButtonElement) {
      confirmCharacterSelectButton.disabled = true;
    }
    setLoadingScreenProgress(loadingScreen, 0);
    loadingScreen?.classList.remove("menu-loading-screen-hidden");
    menu.classList.add("menu-shell-loading");
    stopMenuMusic();
    stopBattleMusic();
    const loadingAnimator = createLoadingScreenAnimator(loadingScreen, MIN_LOADING_SCREEN_MS);

    try {
      await Promise.all([
        bootstrapBattlefield({
          onProgress(progress) {
            loadingAnimator.setAssetProgress(progress);
          }
        }),
        waitForMinimumDelay(MIN_LOADING_SCREEN_MS)
      ]);
      loadingAnimator.complete();
      loadingAnimator.stop();
      characterSelectPanel?.classList.add("menu-settings-hidden");
      joinRunPanel?.classList.add("menu-settings-hidden");
      settingsPanel?.classList.add("menu-settings-hidden");
      menu.classList.add("menu-shell-hidden");
      gameShell.classList.remove("game-shell-hidden");
      battleMusicUnlocked = true;
      syncBattleMusicForState(activeBattleState);
      void tryPlayBattleMusic();
    } catch (error) {
      hasStartedGame = false;
      battleMusicUnlocked = false;
      startButton.disabled = false;
      if (confirmCharacterSelectButton instanceof HTMLButtonElement) {
        confirmCharacterSelectButton.disabled = false;
      }
      loadingAnimator.stop();
      loadingScreen?.classList.add("menu-loading-screen-hidden");
      menu.classList.remove("menu-shell-loading");
      stopBattleMusic();
      void tryPlayMenuMusic();
      console.error("Failed to start Burger Dungeon.", error);
    }
  }

  async function handleConfirmAction() {
    if (hasStartedGame) {
      return;
    }

    if (!isMultiplayerSetup()) {
      await launchGame();
      return;
    }

    if (!isInMultiplayerLobby()) {
      const createResult = await multiplayerState.transport.createLobby({
        hostPlayerId: multiplayerState.currentPlayerId,
        hostPlayerName: localPlayerIdentity.label,
        maxPlayers: getPartySizeLimit(menuSetupState.partySize),
        difficulty: menuSetupState.difficulty
      });

      if (!createResult.ok || !createResult.lobby) {
        multiplayerState.hostStatus = t(createResult.errorKey ?? "menu_multiplayer_unavailable");
        syncHostedRunPanel(hostedRunPanel);
        syncConfirmButton(confirmCharacterSelectButton);
        return;
      }

      setCurrentLobby(createResult.lobby);
      subscribeToCurrentLobby(handleLobbySnapshot);
      multiplayerState.hostStatus = t("menu_host_created", { code: createResult.lobby.code });
      syncLobbyBoundMenuSetup();
      syncHostedRunPanel(hostedRunPanel);
      syncConfirmButton(confirmCharacterSelectButton);
      syncCharacterSetupUi(setupOptionButtons);
      return;
    }

    if (!isCurrentPlayerHost()) {
      multiplayerState.hostStatus = t("menu_only_host_start");
      syncHostedRunPanel(hostedRunPanel);
      return;
    }

    const startResult = await multiplayerState.transport.startLobby({
      code: multiplayerState.currentLobbyCode,
      playerId: multiplayerState.currentPlayerId
    });

    if (!startResult.ok || !startResult.lobby) {
      multiplayerState.hostStatus = t(startResult.errorKey ?? "menu_host_waiting_picks");
      syncHostedRunPanel(hostedRunPanel);
      syncConfirmButton(confirmCharacterSelectButton);
      return;
    }

    handleLobbySnapshot(startResult.lobby);
    await launchGame();
  }

  confirmCharacterSelectButton?.addEventListener("click", handleConfirmAction);

  function handleLobbySnapshot(lobby) {
    if (!lobby) {
      multiplayerState.currentLobbyCode = null;
      multiplayerState.hostedLobby = null;
      multiplayerState.hostStatus = t("menu_join_not_found");
      syncHostedRunPanel(hostedRunPanel);
      syncConfirmButton(confirmCharacterSelectButton);
      syncCharacterSetupUi(setupOptionButtons);
      return;
    }

    if (lobby.code !== multiplayerState.currentLobbyCode) {
      return;
    }

    setCurrentLobby(lobby);
    syncLobbyBoundMenuSetup();
    syncHostedRunPanel(hostedRunPanel);
    syncConfirmButton(confirmCharacterSelectButton);
    syncCharacterSetupUi(setupOptionButtons);
    syncCharacterPreview(characterPreviewCard, characterPrevButton, characterNextButton);

    if (lobby.status === "started") {
      void launchGame();
    }
  }
}

function populateMenuFallLayer(layer) {
  if (!layer) {
    return;
  }

  layer.replaceChildren();

  for (let index = 0; index < 16; index += 1) {
    const asset = pickWeightedMenuFallAsset();
    const item = document.createElement("div");
    item.className = `menu-fall-item menu-fall-item-${asset.kind}`;
    item.setAttribute("aria-hidden", "true");
    configureMenuFallItem(item, asset, true);
    layer.appendChild(item);
  }
}

function pickWeightedMenuFallAsset() {
  const darekAsset = MENU_FALL_ASSETS.find((asset) => asset.kind === "darek");
  if (darekAsset && Math.random() < MENU_FALL_DAREK_CHANCE) {
    return darekAsset;
  }

  const regularAssets = MENU_FALL_ASSETS.filter((asset) => asset.kind !== "darek");
  const totalWeight = regularAssets.reduce((sum, asset) => sum + asset.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const asset of regularAssets) {
    roll -= asset.weight;
    if (roll <= 0) {
      return asset;
    }
  }

  return regularAssets[0] ?? MENU_FALL_ASSETS[0];
}

function configureMenuFallItem(item, asset, includeDelay = false) {
  item.style.left = `${4 + Math.random() * 90}%`;
  item.style.backgroundImage = `url("${asset.image}")`;
  item.style.backgroundSize = asset.backgroundSize;
  item.style.backgroundPosition = asset.backgroundPosition;
  item.style.setProperty("--item-size", `${asset.minSize + Math.random() * (asset.maxSize - asset.minSize)}px`);
  item.style.setProperty("--fall-duration", `${10 + Math.random() * 9}s`);
  item.style.setProperty("--fall-drift", `${(Math.random() - 0.5) * 120}px`);
  if (includeDelay) {
    item.style.setProperty("--fall-delay", `${-Math.random() * 14}s`);
  }
}

async function ensureUiFontReady() {
  if (!("fonts" in document)) {
    return;
  }

  if (uiFontReadyPromise) {
    return uiFontReadyPromise;
  }

  uiFontReadyPromise = Promise.race([
    document.fonts.load("16px \"Press Start 2P\"").catch(() => {
      // Ignore font loading failures and let the browser fall back.
    }),
    new Promise((resolve) => {
      window.setTimeout(resolve, UI_FONT_LOAD_TIMEOUT_MS);
    })
  ]);

  await uiFontReadyPromise;
}

function createMenuMusic(volume) {
  return createBackgroundMusic(MENU_MUSIC_PATH, volume);
}

function createBattleMusic(trackKey, volume) {
  const audio = getBattleMusicAudio(trackKey);
  audio.pause();
  audio.currentTime = 0;
  audio.loop = trackKey !== "last-surprise";
  audio.volume = volume * 0.5;
  audio.onended = null;

  if (trackKey === "last-surprise") {
    audio.onended = () => {
      if (!activeBattleState || activeBattleState.musicTrackKey !== "last-surprise") {
        return;
      }

      activeBattleState.musicTrackKey = activeBattleState.musicTrackResumeKey ?? "generic";
      activeBattleState.musicTrackResumeKey = null;
      syncBattleMusicForState(activeBattleState);
    };
  }

  return audio;
}

function createBackgroundMusic(path, volume, options = {}) {
  const audio = new Audio(path);
  audio.preload = "auto";
  audio.loop = options.loop ?? true;
  audio.volume = volume * 0.5;
  try {
    audio.load();
  } catch {
    // Ignore preload failures and let playback attempt later.
  }
  return audio;
}

function getBattleMusicAudio(trackKey) {
  let audio = battleMusicCache.get(trackKey);
  if (audio) {
    return audio;
  }

  const path = LEVEL_MUSIC_TRACKS[trackKey] ?? LEVEL_MUSIC_TRACKS.generic;
  audio = createBackgroundMusic(path, getStoredMusicVolume(), { loop: trackKey !== "last-surprise" });
  battleMusicCache.set(trackKey, audio);
  return audio;
}

function preloadBattleMusicAssets() {
  return Promise.all(Object.keys(LEVEL_MUSIC_TRACKS).map((trackKey) => preloadBattleMusicTrack(trackKey)));
}

function preloadBattleMusicTrack(trackKey) {
  const existingPromise = battleMusicPreloadPromises.get(trackKey);
  if (existingPromise) {
    return existingPromise;
  }

  const preloadPromise = waitForAudioReady(getBattleMusicAudio(trackKey));
  battleMusicPreloadPromises.set(trackKey, preloadPromise);
  return preloadPromise;
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

async function tryPlayMenuMusic() {
  if (!menuMusic || hasStartedGame) {
    return;
  }

  try {
    await menuMusic.play();
  } catch {
    // Wait for a user gesture.
  }
}

function stopMenuMusic() {
  if (!menuMusic) {
    return;
  }

  menuMusic.pause();
  menuMusic.currentTime = 0;
}

function syncBattleMusicForState(state) {
  if (!state || !hasStartedGame) {
    return;
  }

  const nextTrackKey = state.musicTrackKey ?? "generic";
  if (battleMusic && activeBattleMusicKey === nextTrackKey) {
    return;
  }

  stopBattleMusic();
  battleMusic = createBattleMusic(nextTrackKey, getStoredMusicVolume());
  activeBattleMusicKey = nextTrackKey;
  if (battleMusicUnlocked) {
    void tryPlayBattleMusic();
  }
}

async function tryPlayBattleMusic() {
  if (!battleMusic || !hasStartedGame || !battleMusicUnlocked) {
    return;
  }

  try {
    await battleMusic.play();
  } catch {
    // Wait for a user gesture.
  }
}

function stopBattleMusic() {
  if (!battleMusic) {
    activeBattleMusicKey = null;
    return;
  }

  battleMusic.pause();
  battleMusic.currentTime = 0;
  battleMusic = null;
  activeBattleMusicKey = null;
}

function handleMenuAudioWake() {
  void tryPlayMenuMusic();
  void tryPlayBattleMusic();
}

function getStoredMusicVolume() {
  try {
    const stored = window.localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY);
    if (stored === null) {
      return DEFAULT_MUSIC_VOLUME;
    }

    const parsed = Number(stored);
    if (Number.isNaN(parsed)) {
      return DEFAULT_MUSIC_VOLUME;
    }

    return Math.min(1, Math.max(0, parsed));
  } catch {
    return DEFAULT_MUSIC_VOLUME;
  }
}

function getStoredSfxVolume() {
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

function getStoredHpSaturationEnabled() {
  try {
    const stored = window.localStorage.getItem(HP_SATURATION_STORAGE_KEY);
    if (stored === null) {
      return true;
    }

    return stored === "true";
  } catch {
    return true;
  }
}

function setStoredHpSaturationEnabled(enabled) {
  try {
    window.localStorage.setItem(HP_SATURATION_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage failures.
  }
}

function setGlobalMusicVolume(volume) {
  const normalized = Math.min(1, Math.max(0, volume));

  if (menuMusic) {
    menuMusic.volume = normalized * 0.5;
  }

  if (battleMusic) {
    battleMusic.volume = normalized * 0.5;
  }

  try {
    window.localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(normalized));
  } catch {
    // Ignore storage failures.
  }
}

function setStoredSfxVolume(volume) {
  const normalized = Math.min(1, Math.max(0.1, volume));

  try {
    window.localStorage.setItem(SFX_VOLUME_STORAGE_KEY, String(normalized));
  } catch {
    // Ignore storage failures.
  }
}

function syncMusicVolumeUi(slider, valueLabel, volume) {
  const percent = Math.round(volume * 100);

  if (slider instanceof HTMLInputElement) {
    slider.value = String(percent);
  }

  if (valueLabel) {
    valueLabel.textContent = `${percent}%`;
  }
}

function syncSfxVolumeUi(slider, valueLabel, volume) {
  const percent = Math.round(Math.min(1, Math.max(0.1, volume)) * 100);

  if (slider instanceof HTMLInputElement) {
    slider.value = String(percent);
  }

  if (valueLabel) {
    valueLabel.textContent = `${percent}%`;
  }
}

function syncHpSaturationUi(field, button) {
  if (field) {
    field.hidden = false;
  }

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const enabled = getStoredHpSaturationEnabled();
  button.dataset.enabled = String(enabled);
  button.setAttribute("aria-pressed", String(enabled));
  button.textContent = enabled ? t("settings_on") : t("settings_off");
}

function updateHpSaturationEffect(battleState) {
  const gameShell = document.getElementById("game-shell");
  if (!(gameShell instanceof HTMLElement)) {
    return;
  }

  if (!getStoredHpSaturationEnabled()) {
    gameShell.style.setProperty("--hp-saturation", "1");
    return;
  }

  const hp = battleState?.player?.hp ?? null;
  const maxHp = battleState?.player?.maxHp ?? null;

  if (typeof hp !== "number" || typeof maxHp !== "number" || maxHp <= 0) {
    gameShell.style.setProperty("--hp-saturation", "1");
    return;
  }

  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  const saturation = 0.5 + ratio * 0.5;
  gameShell.style.setProperty("--hp-saturation", String(saturation));
}

function syncLanguageUi(select) {
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  select.value = getLanguage();
}

function applyMenuTranslations() {
  setText("menu-title-line-1", t("game_title_line_1"));
  setText("menu-title-line-2", t("game_title_line_2"));
  setText("start-game-button", t("menu_start_run"));
  setText("join-run-button", t("menu_join_run"));
  setText("open-settings-button", t("menu_settings"));
  setText("character-select-title", t("menu_run_setup"));
  setText("difficulty-label", t("menu_difficulty"));
  setText("character-label", t("menu_character"));
  setText("party-size-label", t("menu_party_size"));
  setText("character-select-back-button", t("action_back"));
  setText("settings-title", t("settings_title"));
  setText("music-volume-label", t("settings_music_volume"));
  setText("sfx-volume-label", t("settings_sfx_volume"));
  setText("language-label", t("settings_language"));
  setText("hp-saturation-label", t("settings_hp_saturation"));
  setText("dev-mode-label", t("settings_dev_mode"));
  setText("close-settings-button", t("action_back"));
  setText("hosted-run-title", t("menu_hosted_run"));
  setText("hosted-run-code-label", t("menu_room_code"));
  setText("hosted-run-players-label", t("menu_players"));
  setText("hosted-run-turn-label", t("menu_character_turn"));
  setText("resolve-party-button", t("menu_resolve_party"));
  setText("join-run-title", t("menu_join_run"));
  setText("join-run-code-label", t("menu_room_code"));
  setText("join-run-back-button", t("action_back"));
  setText("join-run-search-button", t("menu_find"));
  setText("join-run-confirm-button", t("menu_join"));
  setText("menu-loading-label", t("loading_descending"));
  setCharacterSetupLabels();
  setLanguageOptionLabels();
}

function setLanguageOptionLabels() {
  const select = document.getElementById("language-select");
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  Array.from(select.options).forEach((option) => {
    if (option.value === "en") {
      option.textContent = t("language_en");
    } else if (option.value === "pl") {
      option.textContent = t("language_pl");
    }
  });
}

function setCharacterSetupLabels() {
  setButtonTextByValue("difficulty", {
    casual: t("menu_difficulty_casual"),
    hardmode: t("menu_difficulty_hardmode")
  });

  setButtonTextByValue("partySize", {
    solo: t("menu_party_solo"),
    duo: t("menu_party_duo"),
    trio: t("menu_party_trio")
  });
}

function setButtonTextByValue(group, labels) {
  const buttons = document.querySelectorAll(`[data-setting-group="${group}"]`);
  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const value = button.dataset.settingValue;
    if (value && labels[value]) {
      button.textContent = labels[value];
    }
  });
}

function syncCharacterPreview(card, prevButton, nextButton) {
  const previewedCharacter = getPreviewedCharacterId();
  const details = getCharacterInfo(previewedCharacter);
  const previewPortrait = document.getElementById("character-preview-portrait");
  const previewLock = document.getElementById("character-preview-lock");
  const previewRating = document.getElementById("character-preview-rating");
  const lockedByOther = isCharacterLocked(previewedCharacter) && !isCharacterOwnedByCurrentPlayer(previewedCharacter);
  const canBrowse = canBrowseCharacterRoster();
  const canLock = canLockPreviewedCharacter();

  setText("character-preview-name", t(`menu_character_${previewedCharacter}`));
  setText("character-preview-class", t(details.classKey));
  setText("character-preview-playstyle", t(`info_${previewedCharacter}_playstyle`));
  setText("character-preview-stats", t("info_hp_sp", { hp: details.hp, sp: details.sp }));
  setText("character-preview-lock", t("menu_character_taken_badge"));

  if (previewPortrait instanceof HTMLImageElement) {
    previewPortrait.src = details.portraitSrc;
    previewPortrait.alt = t(`menu_character_${previewedCharacter}`);
  }

  if (card instanceof HTMLButtonElement) {
    card.dataset.locked = String(lockedByOther);
    card.dataset.clickable = String(canLock && !lockedByOther);
    card.disabled = false;
    card.setAttribute("aria-disabled", String(lockedByOther && !canLock));
  }

  if (previewLock) {
    previewLock.hidden = !lockedByOther;
  }

  if (previewRating) {
    syncCharacterRating(previewRating, details.rating ?? 0);
  }

  if (prevButton instanceof HTMLButtonElement) {
    prevButton.disabled = !canBrowse;
  }

  if (nextButton instanceof HTMLButtonElement) {
    nextButton.disabled = !canBrowse;
  }
}

function syncCharacterRating(container, ratingValue) {
  const stars = Array.from(container.querySelectorAll(".menu-character-preview-star"));
  const normalizedRating = Math.max(0, Math.min(5, Number(ratingValue) || 0));

  stars.forEach((star, index) => {
    const starValue = index + 1;
    let fill = "empty";

    if (normalizedRating >= starValue) {
      fill = "full";
    } else if (normalizedRating >= starValue - 0.5) {
      fill = "half";
    }

    star.dataset.fill = fill;
  });

  container.setAttribute("aria-label", `Skill ceiling ${normalizedRating}/5`);
  container.title = `Skill ceiling ${normalizedRating}/5`;
}

function syncCharacterSetupUi(buttons) {
  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const group = button.dataset.settingGroup;
    const value = button.dataset.settingValue;
    if (!group || !value) {
      return;
    }

    const isSelected = menuSetupState[group] === value;
    const lockedByDevMode = isDevModeLockedControl(group, value);
    button.dataset.selected = String(isSelected);
    button.dataset.lockedByDev = String(lockedByDevMode);
    button.setAttribute("aria-pressed", String(isSelected));
    button.disabled = (group !== "character" && isLobbyConfigLocked()) || lockedByDevMode;
    button.setAttribute("aria-disabled", String(button.disabled));
  });
}

function getPreviewedCharacterId() {
  const lockedCharacter = getCommittedCharacterForCurrentPlayer();
  if (isInMultiplayerLobby() && lockedCharacter) {
    return lockedCharacter;
  }

  return menuSetupState.character;
}

function canBrowseCharacterRoster() {
  if (!isInMultiplayerLobby()) {
    return true;
  }

  return canCurrentPlayerPickCharacter() && !getCommittedCharacterForCurrentPlayer();
}

function canLockPreviewedCharacter() {
  if (!isInMultiplayerLobby()) {
    return false;
  }

  const previewedCharacter = getPreviewedCharacterId();
  return canCurrentPlayerPickCharacter()
    && !getCommittedCharacterForCurrentPlayer()
    && !isCharacterLocked(previewedCharacter);
}

async function shiftCharacterPreview(step, card, prevButton, nextButton, setupOptionButtons, hostedRunPanel, confirmCharacterSelectButton) {
  if (!canBrowseCharacterRoster()) {
    return;
  }

  const currentIndex = CHARACTER_ROSTER.findIndex((character) => character.id === getPreviewedCharacterId());
  const startIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (startIndex + step + CHARACTER_ROSTER.length) % CHARACTER_ROSTER.length;
  menuSetupState.character = CHARACTER_ROSTER[nextIndex]?.id ?? menuSetupState.character;
  syncCharacterSetupUi(setupOptionButtons);
  syncCharacterPreview(card, prevButton, nextButton);
  syncHostedRunPanel(hostedRunPanel);
  syncConfirmButton(confirmCharacterSelectButton);
}

async function tryLockPreviewedCharacter(card, prevButton, nextButton, setupOptionButtons, hostedRunPanel, confirmCharacterSelectButton) {
  if (!canLockPreviewedCharacter()) {
    return;
  }

  const previewedCharacter = getPreviewedCharacterId();
  const selectionResult = await multiplayerState.transport.selectCharacter({
    code: multiplayerState.currentLobbyCode,
    playerId: multiplayerState.currentPlayerId,
    characterId: previewedCharacter
  });

  if (!selectionResult.ok || !selectionResult.lobby) {
    multiplayerState.hostStatus = selectionResult.errorKey ? t(selectionResult.errorKey) : t("menu_pick_turn_wait");
    syncHostedRunPanel(hostedRunPanel);
    syncConfirmButton(confirmCharacterSelectButton);
    syncCharacterSetupUi(setupOptionButtons);
    syncCharacterPreview(card, prevButton, nextButton);
    return;
  }

  menuSetupState.character = previewedCharacter;
  setCurrentLobby(selectionResult.lobby);
  syncHostedRunPanel(hostedRunPanel);
  syncConfirmButton(confirmCharacterSelectButton);
  syncCharacterSetupUi(setupOptionButtons);
  syncCharacterPreview(card, prevButton, nextButton);
}

function getStoredDevModeEnabled() {
  if (!DEV_MODE_VISIBILITY_ENABLED) {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(DEV_MODE_STORAGE_KEY);
    if (stored === null) {
      return DEFAULT_DEV_MODE_ENABLED;
    }

    return stored === "true";
  } catch {
    return DEFAULT_DEV_MODE_ENABLED;
  }
}

function sanitizeDevModeRestrictedSetup() {
  if (getStoredDevModeEnabled() || isInMultiplayerLobby()) {
    return;
  }

  if (menuSetupState.difficulty === "hardmode") {
    menuSetupState.difficulty = "casual";
  }

  if (menuSetupState.partySize !== "solo") {
    menuSetupState.partySize = "solo";
  }

}

function isDevModeLockedControl(group, value) {
  if (getStoredDevModeEnabled()) {
    return false;
  }

  if (group === "main" && value === "join-run") {
    return true;
  }

  if (group === "difficulty" && value === "hardmode") {
    return true;
  }

  if (group === "partySize" && value !== "solo") {
    return true;
  }

  return false;
}

function setStoredDevModeEnabled(enabled) {
  if (!DEV_MODE_VISIBILITY_ENABLED) {
    return;
  }

  try {
    window.localStorage.setItem(DEV_MODE_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage failures.
  }
}

function syncDevModeUi(field, button) {
  const visible = DEV_MODE_VISIBILITY_ENABLED;
  const enabled = getStoredDevModeEnabled();

  if (field) {
    field.classList.toggle("menu-dev-field-hidden", !visible);
  }

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.hidden = !visible;
  button.dataset.enabled = String(enabled);
  button.setAttribute("aria-pressed", String(enabled));
  button.textContent = enabled ? t("settings_on") : t("settings_off");
}

function syncPrimaryMenuButtons() {
  setText("start-game-button", t("menu_start_run"));
  setText("join-run-button", t("menu_join_run"));
  const joinRunButton = document.getElementById("join-run-button");
  if (joinRunButton instanceof HTMLButtonElement) {
    const lockedByDevMode = isDevModeLockedControl("main", "join-run");
    joinRunButton.dataset.lockedByDev = String(lockedByDevMode);
    joinRunButton.disabled = lockedByDevMode;
    joinRunButton.setAttribute("aria-disabled", String(joinRunButton.disabled));
  }
}

function syncConfirmButton(button) {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  if (!isMultiplayerSetup()) {
    button.textContent = t("menu_ascend");
    button.disabled = hasStartedGame;
    return;
  }

  if (!isInMultiplayerLobby()) {
    button.textContent = t("menu_host_run");
    button.disabled = hasStartedGame;
    return;
  }

  if (!isCurrentPlayerHost()) {
    button.textContent = t("menu_waiting");
    button.disabled = true;
    return;
  }

  button.textContent = t("menu_ascend");
  button.disabled = hasStartedGame || !canHostStartLobby();
}

function syncHostedRunPanel(panel) {
  if (!panel) {
    return;
  }

  const lobby = multiplayerState.hostedLobby;
  const isVisible = isInMultiplayerLobby();
  panel.classList.toggle("menu-lobby-panel-hidden", !isVisible);

  const codeValue = document.getElementById("hosted-run-code-value");
  const playersValue = document.getElementById("hosted-run-players-value");
  const turnValue = document.getElementById("hosted-run-turn-value");
  const playerList = document.getElementById("hosted-run-player-list");
  const statusText = document.getElementById("hosted-run-status-text");
  const resolvePartyButton = document.getElementById("resolve-party-button");

  if (!isVisible) {
    if (statusText) {
      statusText.textContent = "";
    }
    if (resolvePartyButton instanceof HTMLButtonElement) {
      resolvePartyButton.hidden = true;
    }
    return;
  }

  if (codeValue) {
    codeValue.textContent = lobby?.code ?? "------";
  }

  if (playersValue) {
    playersValue.textContent = `${lobby?.players.length ?? 1}/${lobby?.maxPlayers ?? getPartySizeLimit(menuSetupState.partySize)}`;
  }

  if (turnValue) {
    turnValue.textContent = getHostedLobbyTurnText(lobby);
  }

  if (playerList) {
    playerList.replaceChildren(...buildLobbyPlayerSlotElements(lobby));
  }

  if (statusText) {
    statusText.textContent = getHostedLobbyStatusText(lobby);
  }

  if (resolvePartyButton instanceof HTMLButtonElement) {
    resolvePartyButton.hidden = !isCurrentPlayerHost();
  }
}

function syncJoinRunPanel(input, joinButton) {
  if (input instanceof HTMLInputElement) {
    input.placeholder = "123456";
    input.value = multiplayerState.joinCode;
  }

  const statusText = document.getElementById("join-run-status-text");
  if (statusText) {
    statusText.textContent = multiplayerState.joinStatus;
  }

  if (joinButton instanceof HTMLButtonElement) {
    const visible = Boolean(multiplayerState.joinLookup);
    joinButton.dataset.visible = String(visible);
    joinButton.disabled = !visible;
  }
}

function buildLobbyPlayerSlotElements(lobby) {
  const totalSlots = lobby?.maxPlayers ?? getPartySizeLimit(menuSetupState.partySize);
  const players = Array.isArray(lobby?.players) ? lobby.players : [];
  const elements = [];

  for (let index = 0; index < totalSlots; index += 1) {
    const player = players[index];
    const slot = document.createElement("div");
    slot.className = "menu-lobby-player-slot";
    slot.dataset.filled = String(Boolean(player));

    const name = document.createElement("span");
    name.className = "menu-lobby-player-name";
    name.textContent = player ? player.name : t("menu_open_slot", { slot: index + 1 });

    const meta = document.createElement("span");
    meta.className = "menu-lobby-player-meta";
    meta.textContent = player ? getLobbyPlayerMeta(player) : t("menu_waiting_for_player");

    slot.append(name, meta);
    elements.push(slot);
  }

  return elements;
}

function getLobbyPlayerMeta(player) {
  const roleText = player.isHost
    ? t("menu_role_host")
    : t("menu_role_player", { number: player.joinOrder + 1 });
  const characterText = player.selectedCharacter
    ? t(`menu_character_${player.selectedCharacter}`)
    : t("menu_character_unselected");
  return `${roleText} - ${characterText}`;
}

function getConfiguredMultiplayerMode() {
  if (DEV_MULTIPLAYER_MODE === "local") {
    return "local";
  }

  if (MULTIPLAYER_BACKEND_URL) {
    return "backend";
  }

  return "none";
}

function createMultiplayerTransport() {
  const mode = getConfiguredMultiplayerMode();
  if (mode === "local") {
    return createLocalMultiplayerTransport();
  }

  return createUnavailableTransport(mode === "backend"
    ? "menu_multiplayer_backend_missing"
    : "menu_multiplayer_unavailable");
}

function createUnavailableTransport(errorKey) {
  return {
    async createLobby() {
      return { ok: false, errorKey };
    },
    async findLobby() {
      return { ok: false, errorKey };
    },
    async joinLobby() {
      return { ok: false, errorKey };
    },
    async selectCharacter() {
      return { ok: false, errorKey };
    },
    async startLobby() {
      return { ok: false, errorKey };
    },
    subscribe() {
      return () => {};
    },
    async leaveLobby() {
      return { ok: true };
    }
  };
}

function createLocalMultiplayerTransport() {
  const channel = typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel(LOCAL_MULTIPLAYER_CHANNEL)
    : null;

  function getStorageKey(code) {
    return `${LOCAL_MULTIPLAYER_STORAGE_PREFIX}${code}`;
  }

  function readLobby(code) {
    try {
      const stored = window.localStorage.getItem(getStorageKey(code));
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  function writeLobby(lobby) {
    try {
      window.localStorage.setItem(getStorageKey(lobby.code), JSON.stringify(lobby));
    } catch {
      return false;
    }

    channel?.postMessage({ type: "lobby-updated", code: lobby.code, lobby });
    return true;
  }

  function removeLobby(code) {
    try {
      window.localStorage.removeItem(getStorageKey(code));
    } catch {
      return;
    }

    channel?.postMessage({ type: "lobby-removed", code });
  }

  return {
    async createLobby({ hostPlayerId, hostPlayerName, maxPlayers, difficulty }) {
      const lobby = {
        code: generateRoomCode(),
        status: "waiting",
        difficulty,
        maxPlayers,
        players: [
          {
            id: hostPlayerId,
            name: hostPlayerName,
            isHost: true,
            joinOrder: 0,
            selectedCharacter: null
          }
        ]
      };

      if (!writeLobby(lobby)) {
        return { ok: false, errorKey: "menu_multiplayer_unavailable" };
      }

      return { ok: true, lobby: cloneJson(lobby) };
    },

    async findLobby(code) {
      const lobby = readLobby(code);
      if (!lobby) {
        return { ok: false, errorKey: "menu_join_not_found" };
      }

      if (lobby.status === "started") {
        return { ok: false, errorKey: "menu_lobby_already_started" };
      }

      if (lobby.players.length >= lobby.maxPlayers) {
        return { ok: false, errorKey: "menu_lobby_full" };
      }

      return { ok: true, lobby: cloneJson(lobby) };
    },

    async joinLobby({ code, playerId, playerName }) {
      const lobby = readLobby(code);
      if (!lobby) {
        return { ok: false, errorKey: "menu_join_not_found" };
      }

      const existingPlayer = lobby.players.find((player) => player.id === playerId);
      if (!existingPlayer) {
        if (lobby.status === "started") {
          return { ok: false, errorKey: "menu_lobby_already_started" };
        }

        if (lobby.players.length >= lobby.maxPlayers) {
          return { ok: false, errorKey: "menu_lobby_full" };
        }

        lobby.players.push({
          id: playerId,
          name: playerName,
          isHost: false,
          joinOrder: lobby.players.length,
          selectedCharacter: null
        });
      }

      if (!writeLobby(lobby)) {
        return { ok: false, errorKey: "menu_multiplayer_unavailable" };
      }

      return { ok: true, lobby: cloneJson(lobby) };
    },

    async selectCharacter({ code, playerId, characterId }) {
      const lobby = readLobby(code);
      if (!lobby) {
        return { ok: false, errorKey: "menu_join_not_found" };
      }

      const turnPlayer = lobby.players.find((player) => !player.selectedCharacter);
      if (!turnPlayer || turnPlayer.id !== playerId) {
        return { ok: false, errorKey: "menu_pick_turn_wait" };
      }

      if (lobby.players.some((player) => player.selectedCharacter === characterId)) {
        return { ok: false, errorKey: "menu_character_taken" };
      }

      const currentPlayer = lobby.players.find((player) => player.id === playerId);
      if (!currentPlayer) {
        return { ok: false, errorKey: "menu_join_not_found" };
      }

      currentPlayer.selectedCharacter = characterId;
      if (!writeLobby(lobby)) {
        return { ok: false, errorKey: "menu_multiplayer_unavailable" };
      }

      return { ok: true, lobby: cloneJson(lobby) };
    },

    async startLobby({ code, playerId }) {
      const lobby = readLobby(code);
      if (!lobby) {
        return { ok: false, errorKey: "menu_join_not_found" };
      }

      const host = lobby.players.find((player) => player.isHost);
      if (!host || host.id !== playerId) {
        return { ok: false, errorKey: "menu_only_host_start" };
      }

      if (lobby.players.length !== lobby.maxPlayers) {
        return { ok: false, errorKey: "menu_host_waiting_players" };
      }

      if (lobby.players.some((player) => !player.selectedCharacter)) {
        return { ok: false, errorKey: "menu_host_waiting_picks" };
      }

      lobby.status = "started";
      if (!writeLobby(lobby)) {
        return { ok: false, errorKey: "menu_multiplayer_unavailable" };
      }

      return { ok: true, lobby: cloneJson(lobby) };
    },

    subscribe(code, onSnapshot) {
      const handleChannelMessage = (event) => {
        const payload = event.data;
        if (!payload || payload.code !== code) {
          return;
        }

        if (payload.type === "lobby-updated" && payload.lobby) {
          onSnapshot(cloneJson(payload.lobby));
        } else if (payload.type === "lobby-removed") {
          onSnapshot(null);
        }
      };

      const handleStorageChange = (event) => {
        if (event.key !== getStorageKey(code)) {
          return;
        }

        if (!event.newValue) {
          onSnapshot(null);
          return;
        }

        try {
          onSnapshot(JSON.parse(event.newValue));
        } catch {
          // Ignore malformed storage payloads.
        }
      };

      channel?.addEventListener("message", handleChannelMessage);
      window.addEventListener("storage", handleStorageChange);

      return () => {
        channel?.removeEventListener("message", handleChannelMessage);
        window.removeEventListener("storage", handleStorageChange);
      };
    },

    async leaveLobby({ code, playerId }) {
      const lobby = readLobby(code);
      if (!lobby) {
        return { ok: true };
      }

      const player = lobby.players.find((entry) => entry.id === playerId);
      if (!player) {
        return { ok: true };
      }

      if (player.isHost) {
        removeLobby(code);
        return { ok: true };
      }

      lobby.players = lobby.players
        .filter((entry) => entry.id !== playerId)
        .map((entry, index) => ({ ...entry, joinOrder: index }));

      if (lobby.players.length === 0) {
        removeLobby(code);
        return { ok: true };
      }

      writeLobby(lobby);
      return { ok: true, lobby: cloneJson(lobby) };
    }
  };
}

function getLocalPlayerIdentity() {
  try {
    let id = window.sessionStorage.getItem(PLAYER_ID_STORAGE_KEY);
    if (!id) {
      id = `player-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(PLAYER_ID_STORAGE_KEY, id);
    }

    let label = window.sessionStorage.getItem(PLAYER_LABEL_STORAGE_KEY);
    if (!label) {
      label = t("menu_local_player_name", { number: Math.floor(100 + Math.random() * 900) });
      window.sessionStorage.setItem(PLAYER_LABEL_STORAGE_KEY, label);
    }

    return { id, label };
  } catch {
    return {
      id: `player-${Math.random().toString(36).slice(2, 10)}`,
      label: `Player ${Math.floor(100 + Math.random() * 900)}`
    };
  }
}

function getPartySizeLimit(value) {
  return PARTY_SIZE_LIMITS[value] ?? PARTY_SIZE_LIMITS.solo;
}

function sanitizeRoomCode(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 6);
}

function generateRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isMultiplayerSetup() {
  return getPartySizeLimit(menuSetupState.partySize) > 1;
}

function isInMultiplayerLobby() {
  return Boolean(multiplayerState.currentLobbyCode && multiplayerState.hostedLobby);
}

function isCurrentPlayerHost() {
  return Boolean(multiplayerState.hostedLobby?.players.some(
    (player) => player.id === multiplayerState.currentPlayerId && player.isHost
  ));
}

function canHostStartLobby() {
  const lobby = multiplayerState.hostedLobby;
  if (!lobby || !isCurrentPlayerHost()) {
    return false;
  }

  return lobby.players.length === lobby.maxPlayers && lobby.players.every((player) => Boolean(player.selectedCharacter));
}

function getCurrentTurnPlayerId() {
  const lobby = multiplayerState.hostedLobby;
  if (!lobby || lobby.players.length < lobby.maxPlayers || lobby.status !== "waiting") {
    return null;
  }

  return lobby.players.find((player) => !player.selectedCharacter)?.id ?? null;
}

function canCurrentPlayerPickCharacter() {
  const lobby = multiplayerState.hostedLobby;
  if (!lobby) {
    return true;
  }

  return getCurrentTurnPlayerId() === multiplayerState.currentPlayerId;
}

function getSelectedCharacterForCurrentPlayer() {
  const lobby = multiplayerState.hostedLobby;
  if (!lobby) {
    return menuSetupState.character;
  }

  return lobby.players.find((player) => player.id === multiplayerState.currentPlayerId)?.selectedCharacter ?? menuSetupState.character;
}

function getCommittedCharacterForCurrentPlayer() {
  const lobby = multiplayerState.hostedLobby;
  if (!lobby) {
    return null;
  }

  return lobby.players.find((player) => player.id === multiplayerState.currentPlayerId)?.selectedCharacter ?? null;
}

function isCharacterLocked(characterId) {
  const lobby = multiplayerState.hostedLobby;
  if (!lobby) {
    return false;
  }

  return lobby.players.some((player) => player.selectedCharacter === characterId);
}

function isCharacterOwnedByCurrentPlayer(characterId) {
  const lobby = multiplayerState.hostedLobby;
  if (!lobby) {
    return menuSetupState.character === characterId;
  }

  return lobby.players.some(
    (player) => player.id === multiplayerState.currentPlayerId && player.selectedCharacter === characterId
  );
}

function getHostedLobbyTurnText(lobby) {
  if (!lobby) {
    return t("menu_host_turn_waiting");
  }

  if (lobby.status === "started") {
    return t("menu_host_turn_started");
  }

  if (lobby.players.length < lobby.maxPlayers) {
    return t("menu_host_turn_fill_lobby");
  }

  const currentTurnPlayer = lobby.players.find((player) => !player.selectedCharacter);
  if (!currentTurnPlayer) {
    return t("menu_host_turn_ready");
  }

  return t("menu_host_turn_pick", { player: currentTurnPlayer.name });
}

function getHostedLobbyStatusText(lobby) {
  if (multiplayerState.hostStatus) {
    return multiplayerState.hostStatus;
  }

  if (!lobby) {
    return t(multiplayerState.mode === "local" ? "menu_local_multiplayer_hint" : "menu_multiplayer_backend_missing");
  }

  if (lobby.status === "started") {
    return t("menu_lobby_started");
  }

  if (lobby.players.length < lobby.maxPlayers) {
    return t("menu_host_waiting_players");
  }

  if (lobby.players.some((player) => !player.selectedCharacter)) {
    return canCurrentPlayerPickCharacter() ? t("menu_pick_turn_now") : t("menu_pick_turn_wait");
  }

  return isCurrentPlayerHost() ? t("menu_host_ready_to_ascend") : t("menu_waiting_for_host_start");
}

function isLobbyConfigLocked() {
  return isInMultiplayerLobby();
}

function resetMultiplayerDraftState() {
  if (isInMultiplayerLobby()) {
    leaveCurrentLobby();
  }

  multiplayerState.joinLookup = null;
  multiplayerState.joinStatus = "";
  multiplayerState.hostStatus = "";
}

function setCurrentLobby(lobby) {
  multiplayerState.hostedLobby = lobby ? cloneJson(lobby) : null;
  multiplayerState.currentLobbyCode = lobby?.code ?? null;
  multiplayerState.hostStatus = "";
}

function syncLobbyBoundMenuSetup() {
  const lobby = multiplayerState.hostedLobby;
  if (!lobby) {
    return;
  }

  menuSetupState.difficulty = lobby.difficulty;
  menuSetupState.partySize = getPartySizeKey(lobby.maxPlayers);
  const selectedCharacter = lobby.players.find((player) => player.id === multiplayerState.currentPlayerId)?.selectedCharacter;
  if (selectedCharacter) {
    menuSetupState.character = selectedCharacter;
  }
}

function subscribeToCurrentLobby(onSnapshot) {
  multiplayerState.unsubscribe?.();
  multiplayerState.unsubscribe = null;

  if (!multiplayerState.currentLobbyCode) {
    return;
  }

  multiplayerState.unsubscribe = multiplayerState.transport.subscribe(multiplayerState.currentLobbyCode, onSnapshot);
}

function leaveCurrentLobby() {
  const code = multiplayerState.currentLobbyCode;
  if (!code) {
    return;
  }

  multiplayerState.unsubscribe?.();
  multiplayerState.unsubscribe = null;
  void multiplayerState.transport.leaveLobby({
    code,
    playerId: multiplayerState.currentPlayerId
  });
  multiplayerState.currentLobbyCode = null;
  multiplayerState.hostedLobby = null;
  multiplayerState.hostStatus = "";
}

function getPartySizeKey(maxPlayers) {
  if (maxPlayers === 2) {
    return "duo";
  }

  if (maxPlayers === 3) {
    return "trio";
  }

  return "solo";
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

initializeMenu();
