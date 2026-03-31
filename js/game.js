import { startSkillCheck, startMashSkillCheck } from "./combat.js";
import { JACOB_ABILITIES, JACOB_SPRITES, Player, renderJacobCombatActions } from "./jacob.js";
import { Enemy } from "./enemy.js";
import {
  PATRICK_ABILITIES,
  PATRICK_SPRITES,
  applyPatrickUpgradeChoiceToState,
  getPatrickDebugProgress,
  setPatrickDebugProgress,
  formatPatrickChoiceCostHtml,
  getPatrickDodgeFrames,
  getPatrickLuckExpertiseUpgrades,
  preloadPatrickVisuals,
  getPatrickUpgradeOptionsForPlayer,
  renderPatrickCombatActions,
  resetPatrickProgress,
  selectPatrickIdleFrames,
  syncPatrickIdlePose,
  choosePatrickLeftoverEvolutionBeforeFinalBoss,
  unlockPatrickAceEvolutionAfterBoss,
  unlockPatrickFinalEvolutionAfterBoss,
  unlockPatrickGunEvolutionAfterBoss,
  unlockPatrickMasteryAfterBoss,
  unlockPatrickRevolverEvolutionAfterBoss
} from "./patrick.js";
import {
  convertKostyaShadowShpLossToHeal,
  getKostyaAbilities,
  KOSTYA_SPRITES,
  applyKostyaShadowLevelDecay,
  awardKostyaShadowChargeFromDamage,
  getCachedKostyaShadowDamagedFrames,
  getKostyaCounterFxFrame,
  getKostyaCurrentUnlocks,
  getKostyaDecayPowerForLevel,
  getCachedKostyaShadowIdleFrames,
  getKostyaParryFrames,
  getKostyaShadow,
  getKostyaShadowChargePct,
  getKostyaUpgrades,
  preloadKostyaVisuals,
  renderKostyaCombatActions,
  resetKostyaProgress,
  runKostyaShadowAutoAttack,
  selectKostyaIdleFrames,
  spawnKostyaSlashFx,
  storeCollapsedKostyaShadowSnapshot,
  setKostyaShadow,
  setKostyaShadowChargePct,
  setKostyaShadowStrengthPower,
  setKostyaAbilityUnlock,
  setKostyaUpgrade,
  chooseKostyaLeftoverEvolutionBeforeFinalBoss,
  unlockKostyaFirstEvolutionAfterBoss,
  unlockKostyaFourthEvolutionAfterBoss,
  unlockKostyaSecondEvolutionAfterBoss,
  unlockKostyaThirdEvolutionAfterBoss
} from "./kostya.js";
import {
  bossFinalCollapsedFrames,
  bossFinalCapeFrames,
  bossFinalDamagedFrames,
  bossFinalIdleFrames,
  bossFinalSummonFrames,
  getBossFinalTrueEndingFrames,
  getFinalBossMinionShieldPower,
  getBossFinalWalkFrames,
  bossOverlordAction,
  bossTrySummon,
  getBossFinalEnemySprites,
  isFinalBoss,
  isFinalBossPart2,
  preloadBossFinalVisuals,
  setBossMusicVolumeMultiplier,
  startBossFinalAnimations,
  stopBossMusic,
  stopBossFinalAnimations,
  syncBossMusic
} from "./bosses.js";
import {
  chatBubbleHtmlForAlly,
  chatBubbleHtmlForEnemy,
  runDialogueScene
} from "./chats.js";
import {
  initStartMenuScene,
  playStartMenuAscendTransition,
  updateUI,
  setLog,
  setPlayerSkillFeedback as setPlayerSkillFeedbackUi
} from "./ui.js";
import {
  isDuoGameMode,
  isTrioGameMode,
  multiplayerCountFromMode,
  playerEntityIdForIndex as duoPlayerEntityIdForIndex,
  playerSpriteIdForIndex as duoPlayerSpriteIdForIndex,
  skillFeedbackIdForPlayerIndex as duoSkillFeedbackIdForPlayerIndex,
  isCurrentTurnMoveLeftKey as isCurrentTurnMoveLeftKeyByMode,
  isCurrentTurnMoveRightKey as isCurrentTurnMoveRightKeyByMode,
  isCurrentTurnMoveUpKey as isCurrentTurnMoveUpKeyByMode,
  isCurrentTurnMoveDownKey as isCurrentTurnMoveDownKeyByMode,
  isCurrentTurnConfirmKey as isCurrentTurnConfirmKeyByMode,
  isCurrentTurnCancelKey as isCurrentTurnCancelKeyByMode,
  currentSkillCheckKeys as currentSkillCheckKeysByMode,
  skillCheckKeysForPlayerIndex as skillCheckKeysForPlayerIndexByMode,
  pickRandomLivingDuoTarget,
  renderDuoPartnerUI,
  renderDuoBattleCardsUI,
  runDuoPartnerIdleAnimationUI
} from "./multiplayer.js";
import {
  getGameSpeedPercent,
  onGameSpeedChange,
  scaleDuration,
  setGameSpeedMultiplier
} from "./timing.js";
import { isDeveloperModeSettingsUnlocked } from "./devmode.js";

const PLAYER_SPRITES = {
  player: {
    idle: [JACOB_SPRITES.base],
    attack: [JACOB_SPRITES.base],
    heal: [JACOB_SPRITES.base],
    damaged: [JACOB_SPRITES.base],
    defend: [JACOB_SPRITES.base],
    parry: [JACOB_SPRITES.base],
    coinFlip: []
  },
  kostya: {
    idle: [KOSTYA_SPRITES.base],
    thinking: [KOSTYA_SPRITES.base],
    walk: [KOSTYA_SPRITES.base],
    attack: [KOSTYA_SPRITES.base],
    heal: [KOSTYA_SPRITES.base],
    damaged: [KOSTYA_SPRITES.damaged],
    collapsed: [KOSTYA_SPRITES.collapsed],
    defend: [KOSTYA_SPRITES.base],
    parry: [KOSTYA_SPRITES.base],
    coinFlip: []
  },
  patrick: {
    idle: [PATRICK_SPRITES.base],
    thinking: [PATRICK_SPRITES.base],
    attack: [PATRICK_SPRITES.base],
    heal: [PATRICK_SPRITES.base],
    damaged: [PATRICK_SPRITES.damaged, PATRICK_SPRITES.damaged],
    collapsed: [PATRICK_SPRITES.collapsed],
    defend: [PATRICK_SPRITES.base],
    parry: [PATRICK_SPRITES.base],
    coinFlip: [PATRICK_SPRITES.base],
    dualWielding: [PATRICK_SPRITES.base]
  }
};

const ENEMY_SPRITES = {
  normal: {
    idle: ["sprites/enemy/enemy_idle_1.png", "sprites/enemy/enemy_idle_2.png"],
    attack: [
      "sprites/enemy/enemy_attack_1.png",
      "sprites/enemy/enemy_attack_2.png",
      "sprites/enemy/enemy_attack_3.png"
    ],
    damaged: ["sprites/enemy/enemy_damaged.png"],
    block: ["sprites/enemy/enemy_defend.png"],
    summon: []
  },
  boss: {
    idle: ["sprites/enemy/boss_enemy.png"],
    attack: [
      "sprites/enemy/boss_enemy_attack_1.png",
      "sprites/enemy/boss_enemy_attack_2.png",
      "sprites/enemy/boss_enemy_attack_3.png"
    ],
    damaged: ["sprites/enemy/boss_enemy_damaged.png"],
    block: ["sprites/enemy/boss_enemy.png"],
    summon: ["sprites/enemy/boss_enemy_summon.png"]
  },
  bossFinal: {
    ...getBossFinalEnemySprites()
  }
};

const SFX = {
  parry: "sounds/parry.mp3",
  counter: "sounds/counter.mp3",
  skillCheck: "sounds/skill_check.mp3",
  block: "sounds/block.mp3",
  swordDrawn: "sounds/sword_drawn.mp3",
  attack: "sounds/attack.mp3",
  clash: "sounds/clash.mp3",
  dodge: "sounds/dodge.mp3",
  swordFailed: "sounds/sword_failed.mp3",
  summon: "sounds/summon.mp3",
  coinFlip: "sounds/coin_flip.mp3",
  nomnomnom: "sounds/nomnomnom.mp3",
  eating: "sounds/eating.mp3",
  drinking: "sounds/drinking.mp3",
  boom: "sounds/boom.mp3",
  hardStomp: "sounds/hard_stomp.mp3",
  aceCast: "sounds/ace_cast.mp3",
  lockNLoad: "sounds/lock_n_load.mp3",
  revolverShot: "sounds/revolver_shot.mp3",
  stunAttack: "sounds/stun_attack.mp3",
  uiButton: "sounds/ui/click_hover.mp3"
};
const MENU_MUSIC_SRC = "sounds/soundtracks/main_menu.mp3";
const MENU_MUSIC_VOLUME = 0.22;
const ENDING_MUSIC_SRC = "sounds/soundtracks/ending.mp3";
const ENDING_BACKGROUND_SRC = "sprites/indicators/ending.png";
const LANGUAGE_STORAGE_KEY = "burgerDungeonLanguage";
const MUSIC_VOLUME_STORAGE_KEY = "burgerDungeonMusicVolume";
const DEVELOPER_MODE_STORAGE_KEY = "burgerDungeonDeveloperMode";
const ENEMY_RENDER_SLOT_COUNT = 4;
const HELPER_RENDER_SLOT_COUNT = 2;

const MENU_I18N = {
  en: {
    menu: {
      settings: "Settings",
      language: "Language: EN",
      singleplayer: "Singleplayer",
      multiplayer: "Multiplayer",
      duo: "Duo",
      trio: "Trio",
      back: "Back",
      cancel: "Cancel",
      info: "Info",
      close: "Close",
      music: "Music: {value}%",
      developerMode: "DEV MODE: {value}",
      on: "On",
      off: "Off",
      ascend: "Ascend",
      select: "Select",
      ascending: "Ascending...",
      player: "Player {num}",
      startingStats: "Starting Stats",
      passive: "Passive",
      playstyle: "Playstyle",
      startingAbilities: "Starting Abilities",
      unlockableAbilities: "Unlockable Abilities",
      noUnlockables: "No extra unlockable abilities yet.",
      or: "OR",
      loading: "Loading..."
    },
    victory: {
      title: "VICTORY",
      text: "You conquered the final boss.",
      restart: "Restart"
    },
    roles: {
      patrick: "The Gambler",
      kostya: "The Assassin",
      player: "Coming Soon..."
    },
    info: {
      patrick: {
        passive: "Starts with a Lucky Charges bar. Fill it up to unlock his real nonsense.",
        playstyle: "Flip coins, stack Lucky Charges, then cash out with stylish gun nonsense.",
        abilities: {
          coin: ["Coin Flip", "Heads pays out. Tails bites back."],
          rev: ["Revolver", "One clean shot. Better timing, meaner hit."],
          fine: ["Feelin' Fine", "Deletes the bad vibes."],
          ins: ["Health Insurance", "Patch up now, regen later."]
        },
        unlockables: {
          hb: ["Hallow Shot", "Revolver, but extra rude."],
          ps: ["Piercing Shot", "One bullet. Group problem."],
          as: ["Ace of Spades", "Everyone gets weakness. You're welcome."],
          ad: ["Ace of Diamonds", "Team buff in shiny card form."],
          dw: ["Dual Wielding", "Two guns, two targets, zero manners."],
          ms: ["Magnum Shot", "Big bullet. Big attitude."],
          ss: ["Six Shooter", "Keeps shooting until the point lands."],
          ah: ["Ace of Hearts", "Cripple down enemies and regain SP."]
        }
      },
      kostya: {
        passive: "Deals damage to build Shadow Charge. Full bar means the spooky coworker clocks in.",
        playstyle: "Fast blade pressure, clean picks, and a Shadow buddy waiting to be unleashed.",
        abilities: {
          stab: ["Sword", "Cheap, clean, dependable violence."],
          slash: ["Slash", "Front target first. Back target catches strays."],
          dark: ["Shadow", "Summon the evil intern."],
          shadowStrengthen: ["Upgrade Shadow", "Make the evil intern scarier."]
        },
        unlockables: {
          lunge: ["Lunge", "Stab whoever looks expensive."],
          decayingStab: ["Decaying Stab", "Less burst, more rot: Decay {low}/{high}."],
          sharpTip: ["Sharp Tip", "Block? Never heard of it."],
          transformation: ["Transformation", "Burn Shadow SHP for one nasty swing."],
          cleave: ["Cleave", "Tiny green window, gigantic payoff."],
          heartyRecovery: ["Hearty Recovery", "Donate blood. Fix goblin."],
          shadowRecast: ["Shadow Recast", "Respawn the gremlin for 15 HP."],
          darkerLayer: ["Darker Layer", "Wrap Shadow in extra purple problems."]
        }
      },
      player: {
        passive: "No weird gimmick yet. He wins the old-fashioned way: being Jacob.",
        playstyle: "Simple, sturdy, and honest. Swing first, think later.",
        abilities: {
          swing: ["Swing", "The classic bonk."],
          piercer: ["Piercer", "Block gets ignored. Drama gets added."],
          lunge: ["Lunge", "Everyone nearby shares the damage."],
          defendPotion: ["Defend", "Brace up and sip 10 SP back."]
        }
      }
    }
  },
  pl: {
    menu: {
      settings: "Ustawienia",
      language: "Jezyk: PL",
      singleplayer: "Jeden gracz",
      multiplayer: "Wieloosobowy",
      duo: "Duo",
      trio: "Trio",
      back: "Powrot",
      cancel: "Anuluj",
      info: "Info",
      close: "Zamknij",
      music: "Muzyka: {value}%",
      developerMode: "DEV MODE: {value}",
      on: "On",
      off: "Off",
      ascend: "Rozpocznij",
      select: "Wybierz",
      ascending: "Rozpoczynanie...",
      player: "Gracz {num}",
      startingStats: "Statystyki startowe",
      passive: "Pasywka",
      playstyle: "Styl gry",
      startingAbilities: "Umiejetnosci startowe",
      unlockableAbilities: "Odblokowywane umiejetnosci",
      noUnlockables: "Brak dodatkowych umiejetnosci do odblokowania.",
      or: "LUB",
      loading: "Ladowanie..."
    },
    victory: {
      title: "ZWYCIESTWO",
      text: "Pokonales finalnego bossa.",
      restart: "Restart"
    },
    roles: {
      patrick: "Hazardzista",
      kostya: "Zabojca",
      player: "Coming Soon..."
    },
    info: {
      patrick: {
        passive: "Startuje z paskiem Lucky Charges. Napelnij go, zeby odpalic jego prawdziwe numery.",
        playstyle: "Rzuca moneta, nabija Lucky Charges i zamienia je w stylowe strzeleckie glupoty.",
        abilities: {
          coin: ["Coin Flip", "Orzel placi. Reszka gryzie."],
          rev: ["Revolver", "Jeden czysty strzal. Lepszy timing, wiekszy bol."],
          fine: ["Feelin' Fine", "Kasuje zle wibracje."],
          ins: ["Health Insurance", "Podlecza teraz, regen potem."]
        },
        unlockables: {
          hb: ["Hallow Shot", "Rewolwer, tylko bardziej bezczelny."],
          ps: ["Piercing Shot", "Jeden pocisk. Problem grupowy."],
          as: ["Ace of Spades", "Kazdy dostaje weakness. Prosze bardzo."],
          ad: ["Ace of Diamonds", "Buff dla druzyny w blyszczacej karcie."],
          dw: ["Dual Wielding", "Dwa pistolety, dwa cele, zero kultury."],
          ms: ["Magnum Shot", "Duzy pocisk. Duze ego."],
          ss: ["Six Shooter", "Strzela, az timing powie dosc."],
          ah: ["Ace of Hearts", "Osłab wrogów i odzyskaj SP."]
        }
      },
      kostya: {
        passive: "Zadaje obrazenia, by ladowac Shadow Charge. Pelny pasek przywoluje mrocznego wspolpracownika.",
        playstyle: "Szybka presja mieczem, czyste picki i Cien gotowy do wypuszczenia.",
        abilities: {
          stab: ["Sword", "Tani, czysty, pewny wpierdziel."],
          slash: ["Slash", "Przod dostaje pierwszy, tyl lapie rykoszet."],
          dark: ["Shadow", "Przywolaj zlego stazyste."],
          shadowStrengthen: ["Upgrade Shadow", "Zrob zlego stazyste jeszcze gorszym."]
        },
        unlockables: {
          lunge: ["Lunge", "Dzijgnij tego, kto najbardziej podpadl."],
          decayingStab: ["Decaying Stab", "Mniej burstu, wiecej gnicia: Decay {low}/{high}."],
          sharpTip: ["Sharp Tip", "Blok? Nie znam."],
          transformation: ["Transformation", "Spal SHP Cienia na jeden paskudny cios."],
          cleave: ["Cleave", "Mikro zielone okno, gigantyczna nagroda."],
          heartyRecovery: ["Hearty Recovery", "Oddaj krew. Napraw gremlina."],
          shadowRecast: ["Shadow Recast", "Wskrzesz gremlina za 15 HP."],
          darkerLayer: ["Darker Layer", "Ubierz Cien w dodatkowe fioletowe problemy."]
        }
      },
      player: {
        passive: "Na razie bez dziwnej pasywki. Wygrywa po staremu: bedac Jacobem.",
        playstyle: "Prosty, twardy i uczciwy. Najpierw macha, potem mysli.",
        abilities: {
          swing: ["Swing", "Klasyczny bonk."],
          piercer: ["Piercer", "Blok znika, dramat zostaje."],
          lunge: ["Lunge", "Kazdy obok tez cos dostaje."],
          defendPotion: ["Defend", "Zlap garde i odzyskaj 10 SP."]
        }
      }
    }
  }
};

function getStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "pl" ? "pl" : "en";
  } catch (_err) {
    return "en";
  }
}

function getStoredMusicVolume() {
  try {
    const stored = Number(window.localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY));
    if (!Number.isFinite(stored)) return 1;
    return Math.max(0, Math.min(1, stored));
  } catch (_err) {
    return 1;
  }
}

function getStoredDeveloperMode() {
  try {
    return window.localStorage.getItem(DEVELOPER_MODE_STORAGE_KEY) === "true";
  } catch (_err) {
    return false;
  }
}

let uiLanguage = getStoredLanguage();
let musicVolumeSetting = getStoredMusicVolume();
let developerModeEnabled = isDeveloperModeSettingsUnlocked() && getStoredDeveloperMode();
let refreshStartMenuLanguage = null;

function t(path, vars = {}) {
  const source = MENU_I18N[uiLanguage] || MENU_I18N.en;
  const fallback = MENU_I18N.en;
  const resolvePath = (obj) => String(path).split(".").reduce((acc, key) => (acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined), obj);
  let value = resolvePath(source, path);
  if (value == null) value = resolvePath(fallback, path);
  if (typeof value !== "string") return String(path);
  return value.replace(/\{(\w+)\}/g, (_match, key) => String(vars[key] ?? `{${key}}`));
}

function tPair(path, vars = {}) {
  const source = MENU_I18N[uiLanguage] || MENU_I18N.en;
  const fallback = MENU_I18N.en;
  const resolvePath = (obj) => String(path).split(".").reduce((acc, key) => (acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined), obj);
  let value = resolvePath(source, path);
  if (!Array.isArray(value)) value = resolvePath(fallback, path);
  if (!Array.isArray(value) || value.length < 2) return [String(path), String(path)];
  return value.map((entry) => String(entry).replace(/\{(\w+)\}/g, (_match, key) => String(vars[key] ?? `{${key}}`)));
}

function applyLanguageToStaticUi() {
  document.documentElement.lang = uiLanguage === "pl" ? "pl" : "en";
  const settingsButton = document.getElementById("startSettingsToggle");
  const settingsTitle = document.getElementById("startSettingsTitle");
  const musicLabel = document.getElementById("startMusicVolumeLabel");
  const langButton = document.getElementById("startLanguageToggle");
  const developerModeButton = document.getElementById("startDeveloperModeToggle");
  if (settingsButton) settingsButton.innerText = t("menu.settings");
  if (settingsTitle) settingsTitle.innerText = t("menu.settings");
  if (musicLabel) musicLabel.innerText = t("menu.music", { value: Math.round(musicVolumeSetting * 100) });
  if (langButton) langButton.innerText = t("menu.language");
  if (developerModeButton) {
    const unlocked = isDeveloperModeSettingsUnlocked();
    developerModeButton.innerText = t("menu.developerMode", { value: t(developerModeEnabled ? "menu.on" : "menu.off") });
    developerModeButton.disabled = !unlocked;
    developerModeButton.classList.toggle("start-settings-option-locked", !unlocked);
  }
  const ascendText = document.querySelector("#startAscendOverlay .start-ascend-text");
  if (ascendText) ascendText.textContent = t("menu.ascending");
  const victoryTitle = document.querySelector("#victoryScreen h1");
  const victoryText = document.querySelector("#victoryScreen p");
  const victoryRestart = document.getElementById("victoryRestart");
  if (victoryTitle) victoryTitle.textContent = t("victory.title");
  if (victoryText) victoryText.textContent = t("victory.text");
  if (victoryRestart) victoryRestart.textContent = t("victory.restart");
}

function setUiLanguage(nextLanguage) {
  uiLanguage = nextLanguage === "pl" ? "pl" : "en";
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, uiLanguage);
  } catch (_err) {
  }
  applyLanguageToStaticUi();
  refreshStartMenuLanguage?.();
}

let level = 1;
let player = new Player();
let enemies = [];
let nextEnemyId = 1;
let logMessages = [];
let displayedLogMessages = [];
const COMBAT_LOG_CHAR_MS = 7;
const COMBAT_LOG_CLOSE_DELAY_MS = 400;
const COMBAT_LOG_HIDE_TRANSITION_MS = 150;
let combatLogClearTimer = null;
let combatLogPinnedVisible = false;
let actionsLocked = false;
let actionPanelView = "actions";
let defendBuffActive = false;
let duoDefendBuffActive = [false, false, false];
let playerIdleTimer = null;
let enemyIdleTimer = null;
let helperIdleTimer = null;
let duoIdleTimer = null;
let debugHitboxesEnabled = false;
let debugKeepCombatLog = false;
let debugShowStatusTurns = false;

let helperUnlocked = false;
let helperCanSummonThisLevel = false;
let helper = null;
let enemyDisplayNames = new Map();
let bladeUpgrades = 0;
let endureUpgrades = 0;
let strengthenUpgrades = 0;
let helperTrainingUpgrades = 0;
let parryBonusDamage = 0;
let selectedCharacter = null;
let gameMode = "solo";
let activeDuoPlayer = 0;
let duoCharacters = ["player", "patrick"];
let duoPlayers = [null, null];
let gameStarted = false;
let playerAnimating = false;
let playerAnimatingSpriteId = "";
let selectedActionIndex = 0;
let keyboardNavMode = false;
let targetSelectionActive = false;
let inlineHintButtonId = "";
const INVENTORY_ACTION_ID = "inventoryAction";
const INVENTORY_CLOSE_ACTION_ID = "inventoryCloseAction";
const INVENTORY_CAPACITY = 9;
const ACTION_ICON_SHEET_SRC = "sprites/indicators/action_icon.png";
const ACTION_ICON_SIZE = 16;
const ACTION_ICON_POSITIONS = {
  inventory: { row: 0, col: 0 },
  inventoryClose: { row: 0, col: 1 },
  lock: { row: 0, col: 2 },
  salad: { row: 0, col: 3 },
  bomb: { row: 1, col: 0 },
  cherry: { row: 1, col: 1 },
  healingPotion: { row: 1, col: 2 },
  slateskinPotion: { row: 1, col: 3 }
};
const ACTION_ICONS = {
  lock: "",
  inventory: "",
  inventoryClose: "",
  salad: "",
  bomb: "",
  cherry: "",
  healingPotion: "",
  slateskinPotion: ""
};
const ITEM_TEMPLATES = {
  salad: {
    key: "salad",
    name: "Salad",
    description: "Healthy & Tasty!",
    iconKey: "salad",
    dropChance: 0.045
  },
  bomb: {
    key: "bomb",
    name: "Bomb",
    description: "Ka boom!",
    iconKey: "bomb",
    dropChance: 0.02
  },
  cherry: {
    key: "cherry",
    name: "Cherry",
    description: "CHERRY!",
    iconKey: "cherry",
    dropChance: 0.03
  },
  healingPotion: {
    key: "healingPotion",
    name: "Healing Potion",
    description: "Patches your wounds.",
    iconKey: "healingPotion",
    dropChance: 0.025
  },
  slateskinPotion: {
    key: "slateskinPotion",
    name: "Slateskin Potion",
    description: "I'm so tough.",
    iconKey: "slateskinPotion",
    dropChance: 0.03
  }
};
let nextInventoryItemId = 1;
let selectedInventoryItemId = "";
let finalBossIntroSeen = false;
let finalBossPart2SceneSeen = false;
let menuMusic = null;
let endingMusic = null;
const HERO_IDLE_SPEED_MULTIPLIER = 0.75;
const BURGER_OVERLORD_IDLE_SPEED_MULTIPLIER = 0.75;

const TURN_TRANSITION_MS = 650;
const PRE_TURN_DELAY_MS = 200;
const STATUS_POWER_CAP = 10;
const STATUS_DURATION_DEFAULT = 3;
const PATRICK_MAX_HP_CAP = 100;
const KOSTYA_MAX_HP_CAP = 90;
const PATRICK_MAX_SP = 100;
const BATTLEFIELD_TILE_SIZE = 80;
const BATTLEFIELD_BACKGROUND_RATIO = 0.53;
const BATTLEFIELD_TILE_SPRITES = {
  base: "sprites/indicators/background.png",
  cracked: "sprites/indicators/cracked_background.png",
  royal: "sprites/indicators/royal_background.png",
  driedSewer: "sprites/indicators/dried_sewer_background.png",
  sewer: "sprites/indicators/sewer_background.png",
  water: "sprites/indicators/water_background.png"
};
const STATUS_EFFECT_SHEET_SRC = "sprites/status_effects/status_effects.png";
const STATUS_EFFECT_SHEET_SIZE = 128;
const STATUS_EFFECT_ICON_SIZE = 16;
const STATUS_POWER_ICON_POSITIONS = {
  1: { row: 0, col: 0 },
  2: { row: 0, col: 1 },
  3: { row: 0, col: 2 },
  4: { row: 0, col: 3 },
  5: { row: 0, col: 4 },
  6: { row: 0, col: 5 },
  7: { row: 0, col: 6 },
  8: { row: 0, col: 7 },
  9: { row: 1, col: 0 },
  10: { row: 1, col: 1 }
};
const STATUS_ICON_POSITIONS = {
  regen: { row: 1, col: 2 },
  spRegen: { row: 1, col: 3 },
  resistance: { row: 1, col: 4 },
  speed: { row: 1, col: 5 },
  strenght: { row: 1, col: 6 },
  absorption: { row: 1, col: 7 },
  poison: { row: 2, col: 0 },
  decay: { row: 2, col: 1 },
  weakness: { row: 2, col: 2 },
  slowness: { row: 2, col: 3 },
  stunned: { row: 2, col: 4 },
  fire: { row: 2, col: 5 }
};
const STATUS_DISPLAY_NAMES = {
  resistance: "Resistance",
  regen: "Regeneration",
  spRegen: "SP Regeneration",
  speed: "Speed",
  strenght: "Strength",
  absorption: "Absorption",
  poison: "Poison",
  decay: "Decaying",
  weakness: "Weakness",
  slowness: "Slowness",
  stunned: "Stunned",
  fire: "Fire"
};
const GOOD_STATUS_KEYS = ["resistance", "regen", "spRegen", "speed", "strenght", "absorption"];
const BAD_STATUS_KEYS = ["weakness", "decay", "poison", "fire", "slowness", "stunned"];
const STATUS_KEYS = [...GOOD_STATUS_KEYS, ...BAD_STATUS_KEYS];

function cropSheetIcon(src, cellSize, row, col) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cellSize;
      canvas.height = cellSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cellSize, cellSize);
      ctx.drawImage(
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

async function preloadActionIcons() {
  const entries = Object.entries(ACTION_ICON_POSITIONS);
  const resolved = await Promise.all(entries.map(async ([key, pos]) => ([
    key,
    await cropSheetIcon(ACTION_ICON_SHEET_SRC, ACTION_ICON_SIZE, pos.row, pos.col)
  ])));
  resolved.forEach(([key, value]) => {
    ACTION_ICONS[key] = value;
  });
  document.documentElement.style.setProperty("--action-icon-lock", `url("${ACTION_ICONS.lock}")`);
  if (gameStarted) {
    refreshUI();
    if (!actionsLocked) renderCombatActions();
  } else {
    applyLanguageToStaticUi();
  }
}

let battlefieldTileSignature = "";
let mercyEndingPending = null;
let finalBossFirstDecision = "";
let finalBossSecondDecision = "";
let preserveMercyBattlefield = false;
let preservedFinalBossCapeTimer = null;
let preservedFinalBossId = null;
const SKIPPED_PLAYER_TURN_PLAN = Symbol("skipped-player-turn-plan");
let queuedPlayerTurnPlans = [];
let queuedPlayerTurnOrder = [];
let queuedPlayerTurnPlanningIndex = -1;
let queuedPlayerTurnExecutionIndex = -1;
let queuedPlayerTurnExecuting = false;
let queuedActionPreview = null;
let soloRoundActionsRemaining = 0;
let skipNextPlayerTurnIntroDelay = false;
let debugForceMercyMode = "default";

function syncDeveloperModeUi() {
  const debugToggle = document.getElementById("debugToggle");
  const debugMenu = document.getElementById("debugMenu");
  const developerModeButton = document.getElementById("startDeveloperModeToggle");
  if (developerModeButton) {
    const unlocked = isDeveloperModeSettingsUnlocked();
    developerModeButton.disabled = !unlocked;
    developerModeButton.classList.toggle("start-settings-option-locked", !unlocked);
  }
  if (debugToggle) debugToggle.classList.toggle("hidden", !developerModeEnabled);
  if (debugMenu && !developerModeEnabled) debugMenu.classList.add("hidden");
}

function playerSprites() {
  if (!selectedCharacter) return PLAYER_SPRITES.player;
  return PLAYER_SPRITES[selectedCharacter];
}

function characterSprites(characterKey) {
  return PLAYER_SPRITES[characterKey] || PLAYER_SPRITES.player;
}

function characterBaseSprite(characterKey) {
  if (characterKey === "patrick") return PATRICK_SPRITES.base;
  if (characterKey === "kostya") return KOSTYA_SPRITES.base;
  return PLAYER_SPRITES.player.idle[0];
}

function characterCollapsedSprite(characterKey) {
  if (characterKey === "patrick") return PATRICK_SPRITES.collapsed;
  const sprites = characterSprites(characterKey);
  if (Array.isArray(sprites.collapsed) && sprites.collapsed.length) return sprites.collapsed[0];
  if (Array.isArray(sprites.damaged) && sprites.damaged.length) return sprites.damaged[0];
  return characterBaseSprite(characterKey);
}

function displayCharacterName(characterKey) {
  if (characterKey === "patrick") return "Patrick";
  if (characterKey === "kostya") return "Kostya";
  return "Jacob";
}

function createCharacterPlayer(characterKey) {
  const unit = new Player();
  unit.characterKey = characterKey;
  if (characterKey === "patrick") {
    unit.maxHp = 30;
    unit.hp = 30;
    unit.maxSp = PATRICK_MAX_SP;
    unit.sp = 0;
  } else if (characterKey === "kostya") {
    unit.maxHp = 25;
    unit.hp = 25;
    unit.maxSp = 100;
    unit.sp = 0;
  }
  return unit;
}

function characterMenuIcon(characterKey) {
  if (characterKey === "patrick") return PATRICK_SPRITES.battleCard;
  if (characterKey === "kostya") return KOSTYA_SPRITES.battleCard;
  return JACOB_SPRITES.battleCard;
}

function characterMenuRole(characterKey) {
  if (characterKey === "patrick") return t("roles.patrick");
  if (characterKey === "kostya") return t("roles.kostya");
  return t("roles.player");
}

function abilityMenuEntry(name, description, icon = "", cost = null) {
  return { name, description, icon, cost };
}

function characterMenuInfo(characterKey) {
  const unit = createCharacterPlayer(characterKey);
  if (characterKey === "patrick") {
    return {
      stats: { hp: unit.maxHp, sp: unit.maxSp },
      passive: t("info.patrick.passive"),
      playstyle: t("info.patrick.playstyle"),
      unlockableChoicePairs: true,
      abilities: [
        abilityMenuEntry(tPair("info.patrick.abilities.coin")[0], tPair("info.patrick.abilities.coin")[1], PATRICK_ABILITIES.coinFlip.icon),
        abilityMenuEntry(tPair("info.patrick.abilities.rev")[0], tPair("info.patrick.abilities.rev")[1], PATRICK_ABILITIES.revolver.icon, { charges: PATRICK_ABILITIES.revolver.charges, sp: PATRICK_ABILITIES.revolver.sp }),
        abilityMenuEntry(tPair("info.patrick.abilities.fine")[0], tPair("info.patrick.abilities.fine")[1], PATRICK_ABILITIES.feelingFine.icon, { charges: PATRICK_ABILITIES.feelingFine.charges, sp: PATRICK_ABILITIES.feelingFine.sp }),
        abilityMenuEntry(tPair("info.patrick.abilities.ins")[0], tPair("info.patrick.abilities.ins")[1], PATRICK_ABILITIES.healthInsurance.icon, { charges: PATRICK_ABILITIES.healthInsurance.charges, sp: PATRICK_ABILITIES.healthInsurance.sp })
      ],
      unlockables: [
        abilityMenuEntry(tPair("info.patrick.unlockables.hb")[0], tPair("info.patrick.unlockables.hb")[1], PATRICK_ABILITIES.hallowShot.icon, { charges: PATRICK_ABILITIES.hallowShot.charges, sp: PATRICK_ABILITIES.hallowShot.sp }),
        abilityMenuEntry(tPair("info.patrick.unlockables.ps")[0], tPair("info.patrick.unlockables.ps")[1], PATRICK_ABILITIES.piercingShot.icon, { charges: PATRICK_ABILITIES.piercingShot.charges, sp: PATRICK_ABILITIES.piercingShot.sp }),
        abilityMenuEntry(tPair("info.patrick.unlockables.as")[0], tPair("info.patrick.unlockables.as")[1], PATRICK_ABILITIES.aceSpades.icon, { charges: PATRICK_ABILITIES.aceSpades.charges, sp: PATRICK_ABILITIES.aceSpades.sp }),
        abilityMenuEntry(tPair("info.patrick.unlockables.ad")[0], tPair("info.patrick.unlockables.ad")[1], PATRICK_ABILITIES.aceDiamonds.icon, { charges: PATRICK_ABILITIES.aceDiamonds.charges, sp: PATRICK_ABILITIES.aceDiamonds.sp }),
        abilityMenuEntry(tPair("info.patrick.unlockables.dw")[0], tPair("info.patrick.unlockables.dw")[1], PATRICK_ABILITIES.dualWielding.icon, { charges: PATRICK_ABILITIES.dualWielding.charges, sp: PATRICK_ABILITIES.dualWielding.sp }),
        abilityMenuEntry(tPair("info.patrick.unlockables.ms")[0], tPair("info.patrick.unlockables.ms")[1], PATRICK_ABILITIES.magnumShot.icon, { charges: PATRICK_ABILITIES.magnumShot.charges, sp: PATRICK_ABILITIES.magnumShot.sp }),
        abilityMenuEntry(tPair("info.patrick.unlockables.ss")[0], tPair("info.patrick.unlockables.ss")[1], PATRICK_ABILITIES.sixShooter.icon, { charges: PATRICK_ABILITIES.sixShooter.charges, sp: PATRICK_ABILITIES.sixShooter.sp }),
        abilityMenuEntry(tPair("info.patrick.unlockables.ah")[0], tPair("info.patrick.unlockables.ah")[1], PATRICK_ABILITIES.aceHearts.icon, { charges: PATRICK_ABILITIES.aceHearts.charges, sp: PATRICK_ABILITIES.aceHearts.sp })
      ]
    };
  }
  if (characterKey === "kostya") {
    const kostyaAbilities = getKostyaAbilities({
      lungeUnlocked: true,
      decayingStabUnlocked: true,
      sharpTipUnlocked: true,
      transformationUnlocked: true,
      cleaveUnlocked: true,
      heartyRecoveryUnlocked: true,
      shadowRecastUnlocked: true,
      darkerLayerUnlocked: true
    });
    const kostyaAbilityById = (id) => kostyaAbilities.find((ability) => ability.id === id);
    return {
      stats: { hp: unit.maxHp, sp: unit.maxSp },
      passive: t("info.kostya.passive"),
      playstyle: t("info.kostya.playstyle"),
      unlockableChoicePairs: true,
      abilities: [
        abilityMenuEntry(tPair("info.kostya.abilities.stab")[0], tPair("info.kostya.abilities.stab")[1], kostyaAbilityById("stab")?.icon || "", { sp: kostyaAbilityById("stab")?.sp || 0 }),
        abilityMenuEntry(tPair("info.kostya.abilities.slash")[0], tPair("info.kostya.abilities.slash")[1], kostyaAbilityById("slash")?.icon || "", { sp: kostyaAbilityById("slash")?.sp || 0 }),
        abilityMenuEntry(tPair("info.kostya.abilities.dark")[0], tPair("info.kostya.abilities.dark")[1], kostyaAbilityById("dark")?.icon || "", { sp: kostyaAbilityById("dark")?.sp || 0, sc: kostyaAbilityById("dark")?.sc || 0 }),
        abilityMenuEntry(tPair("info.kostya.abilities.shadowStrengthen")[0], tPair("info.kostya.abilities.shadowStrengthen")[1], kostyaAbilityById("shadowStrengthen")?.icon || "", { sp: kostyaAbilityById("shadowStrengthen")?.sp || 0, sc: kostyaAbilityById("shadowStrengthen")?.sc || 0 })
      ],
      unlockables: [
        abilityMenuEntry(tPair("info.kostya.unlockables.lunge")[0], tPair("info.kostya.unlockables.lunge")[1], kostyaAbilityById("lunge")?.icon || "", { sp: kostyaAbilityById("lunge")?.sp || 0 }),
        abilityMenuEntry(tPair("info.kostya.unlockables.decayingStab", { low: getKostyaDecayPowerForLevel(11, false), high: getKostyaDecayPowerForLevel(11, true) })[0], tPair("info.kostya.unlockables.decayingStab", { low: getKostyaDecayPowerForLevel(11, false), high: getKostyaDecayPowerForLevel(11, true) })[1], kostyaAbilityById("decayingStab")?.icon || "", { sp: kostyaAbilityById("decayingStab")?.sp || 0, sc: kostyaAbilityById("decayingStab")?.sc || 0 }),
        abilityMenuEntry(tPair("info.kostya.unlockables.sharpTip")[0], tPair("info.kostya.unlockables.sharpTip")[1], kostyaAbilityById("sharpTip")?.icon || "", { sp: kostyaAbilityById("sharpTip")?.sp || 0 }),
        abilityMenuEntry(tPair("info.kostya.unlockables.transformation")[0], tPair("info.kostya.unlockables.transformation")[1], kostyaAbilityById("transformation")?.icon || "", { sp: kostyaAbilityById("transformation")?.sp || 0, sc: kostyaAbilityById("transformation")?.sc || 0 }),
        abilityMenuEntry(tPair("info.kostya.unlockables.cleave")[0], tPair("info.kostya.unlockables.cleave")[1], kostyaAbilityById("cleave")?.icon || "", { sp: kostyaAbilityById("cleave")?.sp || 0 }),
        abilityMenuEntry(tPair("info.kostya.unlockables.heartyRecovery")[0], tPair("info.kostya.unlockables.heartyRecovery")[1], kostyaAbilityById("heartyRecovery")?.icon || "", { sp: kostyaAbilityById("heartyRecovery")?.sp || 0, sc: kostyaAbilityById("heartyRecovery")?.sc || 0 }),
        abilityMenuEntry(tPair("info.kostya.unlockables.shadowRecast")[0], tPair("info.kostya.unlockables.shadowRecast")[1], kostyaAbilityById("shadowRecast")?.icon || "", { sp: kostyaAbilityById("shadowRecast")?.sp || 0, sc: kostyaAbilityById("shadowRecast")?.sc || 0 }),
        abilityMenuEntry(tPair("info.kostya.unlockables.darkerLayer")[0], tPair("info.kostya.unlockables.darkerLayer")[1], kostyaAbilityById("darkerLayer")?.icon || "", { sp: kostyaAbilityById("darkerLayer")?.sp || 0, sc: kostyaAbilityById("darkerLayer")?.sc || 0 })
      ]
    };
  }
  return {
      stats: { hp: unit.maxHp, sp: unit.maxSp },
    passive: t("info.player.passive"),
    playstyle: t("info.player.playstyle"),
    abilities: [
      abilityMenuEntry(tPair("info.player.abilities.swing")[0], tPair("info.player.abilities.swing")[1], JACOB_ABILITIES.swing.icon),
      abilityMenuEntry(tPair("info.player.abilities.piercer")[0], tPair("info.player.abilities.piercer")[1], JACOB_ABILITIES.piercer.icon, { sp: JACOB_ABILITIES.piercer.sp }),
      abilityMenuEntry(tPair("info.player.abilities.lunge")[0], tPair("info.player.abilities.lunge")[1], JACOB_ABILITIES.lunge.icon, { sp: JACOB_ABILITIES.lunge.sp }),
      abilityMenuEntry(tPair("info.player.abilities.defendPotion")[0], tPair("info.player.abilities.defendPotion")[1], JACOB_ABILITIES.defend.icon)
    ],
    unlockables: []
  };
}

function isDuoMode() {
  return isDuoGameMode(gameMode);
}

function isTrioMode() {
  return isTrioGameMode(gameMode);
}

function multiplayerCount() {
  return multiplayerCountFromMode(gameMode, duoCharacters);
}

function playerEntityIdForIndex(idx) {
  return duoPlayerEntityIdForIndex(idx);
}

function playerSpriteIdForIndex(idx) {
  return duoPlayerSpriteIdForIndex(idx);
}

function activePlayerNumber() {
  return isDuoMode() ? activeDuoPlayer + 1 : 1;
}

function activePlayerHeader() {
  return displayCharacterName(selectedCharacter || "player");
}

function activePlayerCharId() {
  return playerEntityIdForIndex(activeDuoPlayer);
}

function activePlayerSpriteId() {
  return playerSpriteIdForIndex(activeDuoPlayer);
}

function queuedActionIdForPlayerIndex(idx = 0) {
  return idx <= 0 ? "playerQueuedAction" : `allyPartnerQueuedAction-${idx}`;
}

function skillFeedbackIdForPlayerIndex(playerIndex = 0) {
  return duoSkillFeedbackIdForPlayerIndex(playerIndex, gameMode);
}

function setQueuedActionPreview(display = null) {
  queuedActionPreview = display && display.name
    ? {
      name: display.name,
      icon: display.icon || "",
      playerIndex: Number.isInteger(display.playerIndex) ? display.playerIndex : (isDuoMode() ? activeDuoPlayer : null)
    }
    : null;
}

function setPlayerSkillFeedback(message = "", tone = "", ttlMs = 1800, playerIndex = null) {
  const idx = Number.isInteger(playerIndex)
    ? playerIndex
    : (isDuoMode() ? activeDuoPlayer : 0);
  setPlayerSkillFeedbackUi(message, tone, ttlMs, skillFeedbackIdForPlayerIndex(idx));
  if (tone === "great" || tone === "parry" || tone === "counter") {
    playSfx("skillCheck", 0.55);
  }
  if (tone === "parry" || tone === "counter") {
    playSfx("counter", 0.7);
  }
}

function setSkillOwnerVisual(playerIndex = null) {
  const skill = getEl("skillCheck");
  if (!skill) return;
  skill.classList.remove("skill-owner-p1", "skill-owner-p2", "skill-owner-p3");
  if (!isDuoMode()) return;
  if (playerIndex === 0) skill.classList.add("skill-owner-p1");
  if (playerIndex === 1) skill.classList.add("skill-owner-p2");
  if (playerIndex === 2) skill.classList.add("skill-owner-p3");
}

function applyTurnTheme() {
  const body = document.body;
  if (!body) return;
  body.classList.remove("turn-solo", "turn-p1", "turn-p2", "turn-p3");
  if (!isDuoMode()) {
    body.classList.add("turn-solo");
    return;
  }
  if (activeDuoPlayer === 0) body.classList.add("turn-p1");
  else if (activeDuoPlayer === 1) body.classList.add("turn-p2");
  else body.classList.add("turn-p3");
}

function syncTopUiState() {
  const body = document.body;
  if (!body) return;
  const resolvingCombat = actionsLocked || queuedPlayerTurnExecuting;
  const hasVisibleCombatLog = combatLogPinnedVisible;
  body.classList.toggle("combat-log-hidden", !hasVisibleCombatLog);
  body.classList.toggle("actions-row-inactive", resolvingCombat);
}

function requestImmediatePlayerTurnUiResume() {
  skipNextPlayerTurnIntroDelay = true;
}

globalThis.requestImmediatePlayerTurnUiResume = requestImmediatePlayerTurnUiResume;

function isPatrick() {
  return selectedCharacter === "patrick";
}

function isKostya() {
  return selectedCharacter === "kostya";
}

function activeIdleSpeedMultiplier() {
  if (isPatrick() || isKostya()) return HERO_IDLE_SPEED_MULTIPLIER;
  return 1;
}

function hasKostyaInParty() {
  return isKostya() || (isDuoMode() && duoCharacters.includes("kostya"));
}

function getKostyaUnit() {
  if (!hasKostyaInParty()) return null;
  if (isDuoMode()) {
    const idx = duoCharacters.findIndex((key) => key === "kostya");
    return idx >= 0 ? duoPlayers[idx] : null;
  }
  return isKostya() ? player : null;
}

function shadowChargeMultiplierForTarget(target) {
  return 1;
}

function toRoman(num) {
  const map = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let out = "";
  let n = Math.max(1, Math.floor(num));
  map.forEach(([value, symbol]) => {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  });
  return out;
}

function clampStatusPower(power) {
  return Math.max(0, Math.min(STATUS_POWER_CAP, Math.floor(power)));
}

function normalizeStatusKey(key) {
  if (key === "strength") return "strenght";
  if (key === "regeneration") return "regen";
  if (key === "spregen" || key === "sp_regen" || key === "sp-regen") return "spRegen";
  return key;
}

function createStatusEffects() {
  return {
    resistance: { power: 0, turns: 0 },
    weakness: { power: 0, turns: 0 },
    decay: { power: 0, turns: 0 },
    poison: { power: 0, turns: 0 },
    regen: { power: 0, turns: 0 },
    spRegen: { power: 0, turns: 0 },
    speed: { power: 0, turns: 0 },
    slowness: { power: 0, turns: 0 },
    stunned: { power: 0, turns: 0 },
    strenght: { power: 0, turns: 0 },
    absorption: { power: 0, turns: 0 },
    fire: { power: 0, turns: 0 }
  };
}

function ensureStatuses(entity) {
  if (!entity.statuses) entity.statuses = createStatusEffects();
  STATUS_KEYS.forEach((key) => {
    if (!entity.statuses[key]) entity.statuses[key] = { power: 0, turns: 0 };
  });
  return entity.statuses;
}

function statusEntry(entity, key) {
  return ensureStatuses(entity)[normalizeStatusKey(key)];
}

function statusPower(entity, key) {
  return clampStatusPower(statusEntry(entity, key).power);
}

function hasStatus(entity, key) {
  return statusPower(entity, key) > 0 && statusEntry(entity, key).turns > 0;
}

function isDecaying(entity) {
  return hasStatus(entity, "decay");
}

function statusPercentAmount(maxValue, power, perPowerPct) {
  const safeMax = Math.max(0, Number(maxValue) || 0);
  const safePower = Math.max(0, clampStatusPower(power));
  if (safeMax <= 0 || safePower <= 0) return 0;
  return Math.max(1, Math.ceil(safeMax * perPowerPct * safePower));
}

function statusPercentAmountFloor(maxValue, power, perPowerPct) {
  const safeMax = Math.max(0, Number(maxValue) || 0);
  const safePower = Math.max(0, clampStatusPower(power));
  if (safeMax <= 0 || safePower <= 0) return 0;
  return Math.max(0, Math.floor(safeMax * perPowerPct * safePower));
}

function absorptionAmountForEntity(entity, power) {
  return statusPercentAmount(entity?.maxHp || 0, power, 0.05);
}

function syncAbsorptionStatus(entity, refill = false) {
  if (!entity) return;
  const absorptionPower = hasStatus(entity, "absorption") ? statusPower(entity, "absorption") : 0;
  if (absorptionPower <= 0) {
    entity.maxAhp = 0;
    entity.ahp = 0;
    return;
  }

  const nextMaxAhp = absorptionAmountForEntity(entity, absorptionPower);
  entity.maxAhp = nextMaxAhp;
  if (refill) {
    entity.ahp = nextMaxAhp;
    return;
  }
  entity.ahp = Math.max(0, Math.min(nextMaxAhp, Number(entity.ahp) || 0));
}

function statusSheetSpriteStyle(row, col) {
  return [
    `display:inline-block`,
    `background-image:url('${STATUS_EFFECT_SHEET_SRC}')`,
    `background-repeat:no-repeat`,
    `background-size:calc(var(--status-icon-size) * 8) calc(var(--status-icon-size) * 8)`,
    `background-position:calc(var(--status-icon-size) * -${col}) calc(var(--status-icon-size) * -${row})`,
    `image-rendering:pixelated`
  ].join(";");
}

function statusSpriteMarkup(key) {
  const position = STATUS_ICON_POSITIONS[key];
  if (!position) return "";
  return `<span class="status-icon" aria-hidden="true" style="${statusSheetSpriteStyle(position.row, position.col)}"></span>`;
}

function statusPowerMarkup(power) {
  const position = STATUS_POWER_ICON_POSITIONS[power];
  if (!position) return "";
  return `<span class="status-power-icon" aria-hidden="true" style="${statusSheetSpriteStyle(position.row, position.col)}"></span>`;
}

function statusActionGainPerTurn(entity) {
  const speedPower = hasStatus(entity, "speed") ? statusPower(entity, "speed") : 0;
  const slownessPower = hasStatus(entity, "slowness") ? statusPower(entity, "slowness") : 0;
  return Math.max(0, 1 + (speedPower - slownessPower) * 0.2);
}

function claimEntityActionsForTurn(entity) {
  if (!entity || entity.hp <= 0) return 0;
  const storedProgress = Math.max(0, Number(entity.actionTurnProgress || 0));
  const gain = statusActionGainPerTurn(entity);
  const totalProgress = storedProgress + gain;
  const actions = Math.max(0, Math.floor(totalProgress + 1e-9));
  entity.actionTurnProgress = totalProgress - actions;
  entity.missedTurnFromSlowness = actions <= 0 && gain < 1 && hasStatus(entity, "slowness");
  return actions;
}

function shouldSkipStunnedTurn(entity) {
  if (!hasStatus(entity, "stunned")) return false;
  const stunnedPower = statusPower(entity, "stunned");
  if (stunnedPower >= STATUS_POWER_CAP) return true;
  return Math.random() < stunnedPower * 0.1;
}

function maybeSkipTurnFromStun(entity, label) {
  if (!shouldSkipStunnedTurn(entity)) return false;
  addLog(`${label} misses this turn.`, "attack-white");
  return true;
}

function maybeSkipTurnFromSlowness(entity, label) {
  if (!entity?.missedTurnFromSlowness) return false;
  entity.missedTurnFromSlowness = false;
  addLog(`${label} misses this turn.`, "attack-white");
  return true;
}

function applyStatus(entity, key, power, turns = STATUS_DURATION_DEFAULT) {
  const normalizedKey = normalizeStatusKey(key);
  if (hasSlateskin(entity) && BAD_STATUS_KEYS.includes(normalizedKey)) {
    return statusEntry(entity, normalizedKey);
  }
  const entry = statusEntry(entity, normalizedKey);
  const wasActive = entry.power > 0 && entry.turns > 0;
  const prevPower = entry.power;
  const prevTurns = entry.turns;
  const nextPower = clampStatusPower(Math.max(entry.power, power));
  const nextTurns = Math.max(entry.turns, Math.floor(turns));
  entry.power = nextPower;
  entry.turns = nextPower > 0 ? nextTurns : 0;
  if (normalizedKey === "absorption") {
    syncAbsorptionStatus(entity, !wasActive || nextPower > prevPower || nextTurns > prevTurns);
  }
  if (normalizedKey === "stunned" && entity instanceof Enemy) {
    entity.stunTurns = Math.max(entity.stunTurns || 0, entry.turns);
  }
  return entry;
}

function clearStatus(entity, key) {
  const entry = statusEntry(entity, key);
  entry.power = 0;
  entry.turns = 0;
  if (normalizeStatusKey(key) === "stunned" && entity instanceof Enemy) {
    entity.stunTurns = 0;
  }
  if (normalizeStatusKey(key) === "regen" && entity) {
    entity.patrickHealthInsuranceActive = false;
  }
  if (normalizeStatusKey(key) === "absorption") {
    syncAbsorptionStatus(entity);
  }
}

function tickStatusDurations(entity, label) {
  STATUS_KEYS.forEach((key) => {
    const entry = statusEntry(entity, key);
    if (entry.power <= 0 || entry.turns <= 0) return;
    entry.turns -= 1;
    if (key === "stunned" && entity instanceof Enemy) {
      entity.stunTurns = Math.max(0, entry.turns);
    }
    if (entry.turns <= 0) {
      entry.turns = 0;
      entry.power = 0;
      if (key === "regen") {
        entity.patrickHealthInsuranceActive = false;
      }
      if (key === "absorption") {
        syncAbsorptionStatus(entity);
      }
    }
  });
  void label;
}

function applyStatusOverTime(entity, label) {
  if (entity?.isShadow && (entity.vhp || 0) > 0) {
    entity.vhp = Math.max(0, (entity.vhp || 0) - 1);
  }

  const poisonPower = hasStatus(entity, "poison") ? statusPower(entity, "poison") : 0;
  if (poisonPower > 0) {
    applyLayeredDamage(entity, statusPercentAmountFloor(entity?.maxHp || 0, poisonPower, 0.0075));
  }

  const firePower = hasStatus(entity, "fire") ? statusPower(entity, "fire") : 0;
  if (firePower > 0) {
    applyLayeredDamage(entity, statusPercentAmountFloor(entity?.maxHp || 0, firePower, 0.015));
  }

  const decayActive = hasStatus(entity, "decay");
  if (decayActive) {
    const decayDamage = 1;
    applyLayeredDamage(entity, decayDamage);
    if (entity instanceof Enemy) {
      awardKostyaShadowChargeFromDamage(decayDamage, 1, hasKostyaInParty());
    }
  }

  const regenPower = hasStatus(entity, "regen") ? statusPower(entity, "regen") : 0;
  if (regenPower > 0 && entity.hp > 0 && !entity?.isShadow) {
    entity.hp = Math.min(entity.maxHp, entity.hp + statusPercentAmount(entity.maxHp, regenPower, 0.02));
  }

  const spRegenPower = hasStatus(entity, "spRegen") ? statusPower(entity, "spRegen") : 0;
  if (spRegenPower > 0 && entity.hp > 0 && (entity.maxSp || 0) > 0) {
    entity.sp = Math.min(entity.maxSp, (entity.sp || 0) + statusPercentAmount(entity.maxSp, spRegenPower, 0.02));
  }
  void label;
}

function statusIconsMarkup(entity) {
  const statuses = ensureStatuses(entity);
  return STATUS_KEYS
    .filter((key) => statuses[key].power > 0 && statuses[key].turns > 0)
    .map((key) => {
      const power = clampStatusPower(statuses[key].power);
      if (power <= 0) return "";
      const label = STATUS_DISPLAY_NAMES[key] || statusDisplayName(key);
      const turns = Math.max(0, Math.floor(Number(statuses[key].turns) || 0));
      const turnsMarkup = debugShowStatusTurns
        ? `<span class="status-turns">${turns}T</span>`
        : "";
      return (
        `<span class="status-chip" aria-label="${label} ${toRoman(power)}" title="${label} ${toRoman(power)}">` +
        statusSpriteMarkup(key) +
        statusPowerMarkup(power) +
        turnsMarkup +
        `</span>`
      );
    })
    .join("");
}

function statusIconsHtml(entity, extraClass = "") {
  const icons = statusIconsMarkup(entity);
  const className = extraClass ? `status-icons ${extraClass}` : "status-icons";
  return `<div class="${className}">${icons}</div>`;
}

function applyDamageModifiers(target, amount, options = {}) {
  let modified = Math.max(0, amount);
  const weaknessPower = hasStatus(target, "weakness") ? statusPower(target, "weakness") : 0;
  if (weaknessPower > 0) {
    const effectiveWeaknessPower = target?.characterKey === "patrick"
      ? Math.max(0, weaknessPower - getPatrickLuckExpertiseUpgrades())
      : weaknessPower;
    if (effectiveWeaknessPower > 0) {
      modified = Math.ceil(modified * (1 + effectiveWeaknessPower * 0.1));
    }
  }
  const decayPower = hasStatus(target, "decay") ? statusPower(target, "decay") : 0;
  if (decayPower > 0 && options?.attacker?.isShadow) {
    modified = Math.ceil(modified * (1 + decayPower * 0.1));
  }
  if (options?.ignoreResistance) return Math.max(0, modified);
  const resistancePower = hasStatus(target, "resistance") ? statusPower(target, "resistance") : 0;
  if (resistancePower > 0) {
    modified = Math.ceil(modified * Math.max(0, 1 - resistancePower * 0.1));
  }
  const bonusDefense = slateskinDefense(target);
  if (bonusDefense > 0) {
    modified = Math.max(0, modified - bonusDefense);
  }
  return Math.max(0, modified);
}

function applyAbsorptionLayeredDamage(entity, amount) {
  let remaining = Math.max(0, Math.ceil(amount));
  if ((entity?.ahp || 0) > 0) {
    const mitigated = Math.max(0, Math.ceil(remaining * 0.8));
    const ahpDamage = Math.min(entity.ahp, mitigated);
    entity.ahp = Math.max(0, entity.ahp - ahpDamage);
    remaining = Math.max(0, mitigated - ahpDamage);
  }
  if (remaining > 0 && entity) {
    entity.hp = Math.max(0, entity.hp - remaining);
  }
  return remaining;
}

function applyShadowLayeredDamage(shadow, amount) {
  if (!shadow?.isShadow) return Math.max(0, amount);
  let remaining = Math.max(0, Math.ceil(amount));
  if (remaining <= 0) return 0;

  if ((shadow.vhp || 0) > 0) {
    const mitigated = Math.max(0, Math.ceil(remaining * 0.6));
    const vhpDamage = Math.min(shadow.vhp, mitigated);
    shadow.vhp = Math.max(0, shadow.vhp - vhpDamage);
    remaining = Math.max(0, mitigated - vhpDamage);
  }

  if ((shadow.shp || 0) > 0) {
    const prevShp = shadow.shp || 0;
    const mitigated = Math.max(0, Math.ceil(remaining * 0.8));
    const shpDamage = Math.min(shadow.shp, mitigated);
    shadow.shp = Math.max(0, shadow.shp - shpDamage);
    const lostShp = Math.max(0, prevShp - (shadow.shp || 0));
    if (lostShp > 0) convertKostyaShadowShpLossToHeal(lostShp, getKostyaUnit());
    remaining = Math.max(0, mitigated - shpDamage);
  }

  if (remaining > 0) {
    shadow.hp = Math.max(0, shadow.hp - remaining);
  }
  return amount;
}

function applyLayeredDamage(entity, amount) {
  if (!entity) return 0;
  if (entity.isShadow) return applyShadowLayeredDamage(entity, amount);
  return applyAbsorptionLayeredDamage(entity, amount);
}

function applyAttackerDamageModifiers(attacker, amount) {
  let modified = Math.max(0, amount);
  if (!attacker) return modified;
  const strenghtPower = hasStatus(attacker, "strenght") ? statusPower(attacker, "strenght") : 0;
  if (strenghtPower > 0) {
    modified = Math.ceil(modified * (1 + strenghtPower * 0.05));
  }
  return Math.max(0, modified);
}

function luckyChargeCapForLevel(currentLevel) {
  const tier = Math.floor((Math.max(1, currentLevel) - 1) / 10);
  return 10 + tier * 5;
}

function clampUnitToCharacterCaps(unit, characterKey) {
  if (!unit) return;
  if (characterKey === "patrick") {
    unit.maxHp = Math.min(PATRICK_MAX_HP_CAP, Math.max(1, unit.maxHp || 1));
    unit.maxSp = PATRICK_MAX_SP;
  } else if (characterKey === "kostya") {
    unit.maxHp = Math.min(KOSTYA_MAX_HP_CAP, Math.max(1, unit.maxHp || 1));
    unit.maxSp = 100;
  }
  unit.hp = Math.max(0, Math.min(unit.hp || 0, unit.maxHp || 1));
  unit.sp = Math.max(0, Math.min(unit.sp || 0, unit.maxSp || 0));
}

function clampLuckyChargesToCap() {
  const cap = luckyChargeCapForLevel(level);
  player.luckyCharges = Math.max(0, Math.min(cap, player.luckyCharges));
}

function addLuckyCharges(amount) {
  clampLuckyChargesToCap();
  const cap = luckyChargeCapForLevel(level);
  const before = player.luckyCharges;
  player.luckyCharges = Math.min(cap, player.luckyCharges + Math.max(0, amount));
  return player.luckyCharges - before;
}

function addLuckyChargesToUnit(unit, amount) {
  if (!unit) return 0;
  const cap = luckyChargeCapForLevel(level);
  const before = Math.max(0, unit.luckyCharges || 0);
  unit.luckyCharges = Math.min(cap, before + Math.max(0, amount));
  return Math.max(0, (unit.luckyCharges || 0) - before);
}

function addPatrickHiddenLuckyChargeProgress(unit, amount) {
  if (!unit || amount <= 0) return 0;
  const cap = luckyChargeCapForLevel(level);
  const currentCharges = Math.max(0, unit.luckyCharges || 0);
  if (currentCharges >= cap) {
    unit.patrickHiddenLuckyChargeProgress = 0;
    return 0;
  }
  const storedProgress = Math.max(0, Number(unit.patrickHiddenLuckyChargeProgress || 0));
  const totalProgress = storedProgress + amount;
  const fullCharges = Math.floor(totalProgress);
  unit.patrickHiddenLuckyChargeProgress = totalProgress - fullCharges;
  if (fullCharges <= 0) return 0;
  const gained = addLuckyChargesToUnit(unit, fullCharges);
  if ((unit.luckyCharges || 0) >= cap) {
    unit.patrickHiddenLuckyChargeProgress = 0;
  }
  return gained;
}

function spendLuckyCharges(amount) {
  player.luckyCharges = Math.max(0, player.luckyCharges - Math.max(0, amount));
}

function rollInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEl(id) {
  return document.getElementById(id);
}

function battlefieldTileMarkup(rows, cols, startY, spriteForTile) {
  let markup = "";
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const sprite = spriteForTile(row, col);
      markup += (
        `<span class="battlefield-tile" style="left:${col * BATTLEFIELD_TILE_SIZE}px;` +
        `top:${startY + row * BATTLEFIELD_TILE_SIZE}px;background-image:url('${sprite}');"></span>`
      );
    }
  }
  return markup;
}

function regularBattlefieldTileSprite() {
  return Math.random() < 0.02
    ? BATTLEFIELD_TILE_SPRITES.cracked
    : BATTLEFIELD_TILE_SPRITES.base;
}

function renderBattlefieldTiles(force = false) {
  const field = getEl("battlefield");
  const backgroundLayer = getEl("battlefieldBackgroundLayer");
  const foregroundLayer = getEl("battlefieldForegroundLayer");
  if (!field || !backgroundLayer || !foregroundLayer) return;

  const width = Math.max(0, Math.ceil(field.clientWidth));
  const height = Math.max(0, Math.ceil(field.clientHeight));
  if (!width || !height) return;
  const fieldStyles = window.getComputedStyle(field);
  const paddingBottom = parseFloat(fieldStyles.paddingBottom || "0") || 0;

  const cols = Math.max(1, Math.ceil(width / BATTLEFIELD_TILE_SIZE));
  const backgroundHeight = Math.ceil(height * BATTLEFIELD_BACKGROUND_RATIO);
  const foregroundStartY = backgroundHeight;
  const foregroundHeight = Math.max(0, height - foregroundStartY);
  const groundOffset = Math.max(0, Math.round(foregroundHeight - paddingBottom));
  field.style.setProperty("--battlefield-ground-offset", `${groundOffset}px`);
  const backgroundRows = Math.max(1, Math.ceil(backgroundHeight / BATTLEFIELD_TILE_SIZE));
  const foregroundRows = Math.max(1, Math.ceil(foregroundHeight / BATTLEFIELD_TILE_SIZE));
  const signature = `${level}:${width}:${height}:${cols}:${backgroundRows}:${foregroundRows}`;
  if (!force && signature === battlefieldTileSignature) return;
  battlefieldTileSignature = signature;

  const sewerTilesByColumn = new Array(cols).fill(null);
  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < backgroundRows; row += 1) {
      if (sewerTilesByColumn[col]) break;
      if (Math.random() < 0.015) {
        const dried = Math.random() < 0.5;
        sewerTilesByColumn[col] = {
          row,
          dried
        };
      }
    }
  }

  backgroundLayer.innerHTML = battlefieldTileMarkup(backgroundRows, cols, 0, (row, col) => {
    const sewerTile = sewerTilesByColumn[col];
    if (sewerTile?.row === row) {
      return sewerTile.dried ? BATTLEFIELD_TILE_SPRITES.driedSewer : BATTLEFIELD_TILE_SPRITES.sewer;
    }
    if (sewerTile && !sewerTile.dried && row > sewerTile.row) return BATTLEFIELD_TILE_SPRITES.water;
    return regularBattlefieldTileSprite();
  });

  foregroundLayer.innerHTML = battlefieldTileMarkup(foregroundRows, cols, foregroundStartY, (row) => {
    if (level === 50 && row === 0) return BATTLEFIELD_TILE_SPRITES.royal;
    return regularBattlefieldTileSprite();
  });
}

function addLog(msg, tone = "default") {
  if (!msg) return;
  if (combatLogClearTimer) {
    clearTimeout(combatLogClearTimer);
    combatLogClearTimer = null;
  }
  combatLogPinnedVisible = true;
  logMessages.push({ msg, tone });
  if (logMessages.length > 6) logMessages.shift();
  displayedLogMessages = [...logMessages];
  setLog(displayedLogMessages);
  syncTopUiState();
}

function combatLogName(entityOrLabel) {
  if (typeof entityOrLabel === "string") return entityOrLabel;
  if (entityOrLabel?.id && enemyDisplayNames.has(entityOrLabel.id)) return enemyLabel(entityOrLabel);
  if (entityOrLabel?.name) return entityOrLabel.name;
  if (entityOrLabel?.label) return entityOrLabel.label;
  if (entityOrLabel?.characterKey) return displayCharacterName(entityOrLabel.characterKey);
  return "Unknown";
}

function logCombatUse(user, action, target = null) {
  const actor = combatLogName(user);
  const targetName = target ? combatLogName(target) : "";
  addLog(targetName ? `${actor} used ${action} on ${targetName}.` : `${actor} used ${action}.`, "attack-white");
}

function logCombatCast(user, action, target = null) {
  const actor = combatLogName(user);
  const targetName = target ? combatLogName(target) : "";
  addLog(targetName ? `${actor} casted ${action} on ${targetName}.` : `${actor} casted ${action}.`, "attack-white");
}

function logCombatSummon(user, summonName) {
  addLog(`${combatLogName(user)} summoned a ${summonName}.`, "attack-white");
}

function logCombatDodged(user) {
  addLog(`${combatLogName(user)} dodged!`, "attack-green");
}

function logCombatPartialDodge(user) {
  addLog(`${combatLogName(user)} partially dodged.`, "attack-yellow");
}

function logCombatCounter(user) {
  addLog(`${combatLogName(user)} countered!`, "attack-bright-red");
}

function logCombatParry(user) {
  addLog(`${combatLogName(user)} parried!`, "attack-blue");
}

function combatLogLatestTypingDurationMs() {
  const latest = logMessages.length ? logMessages[logMessages.length - 1] : null;
  const text = latest?.msg || "";
  return text.length * COMBAT_LOG_CHAR_MS;
}

async function settleCombatLogBeforeClose() {
  if (debugKeepCombatLog || !logMessages.length) return;
  await sleep(combatLogLatestTypingDurationMs() + COMBAT_LOG_CLOSE_DELAY_MS);
}

function clearCombatLog() {
  if (debugKeepCombatLog) return;
  if (combatLogClearTimer) {
    clearTimeout(combatLogClearTimer);
    combatLogClearTimer = null;
  }
  logMessages = [];
  combatLogPinnedVisible = false;
  syncTopUiState();
  combatLogClearTimer = setTimeout(() => {
    combatLogClearTimer = null;
    if (logMessages.length > 0) return;
    displayedLogMessages = [];
    setLog([]);
    syncTopUiState();
  }, COMBAT_LOG_HIDE_TRANSITION_MS);
}

function maybeLogFatalDamage(label, unit, damage) {
  if (!unit || !Number.isFinite(damage) || damage <= 0) return;
  const maxHp = Math.max(1, unit.maxHp || 0);
  if (damage > maxHp * 0.5 && unit.hp < maxHp * 0.25) {
    addLog(`${label} recieved fatal damage.`, "fatal-red");
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, scaleDuration(ms)));
}

function sliceHorizontalSpriteSheet(src, frameWidth, frameHeight, frameCount) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = frameWidth;
      canvas.height = frameHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve([]);
        return;
      }

      const frames = [];
      for (let i = 0; i < frameCount; i += 1) {
        ctx.clearRect(0, 0, frameWidth, frameHeight);
        ctx.drawImage(
          image,
          i * frameWidth,
          0,
          frameWidth,
          frameHeight,
          0,
          0,
          frameWidth,
          frameHeight
        );
        frames.push(canvas.toDataURL("image/png"));
      }
      resolve(frames);
    };
    image.onerror = () => resolve([]);
    image.src = src;
  });
}

function pingPongFrames(frames) {
  if (frames.length <= 1) return [...frames];
  const backward = frames.slice(1, frames.length - 1).reverse();
  return [...frames, ...backward, frames[0]];
}

function setPlayerAnimatingState(animating, spriteId = "") {
  playerAnimating = !!animating;
  playerAnimatingSpriteId = animating ? spriteId : "";
}

function isDefendingPlayerIndex(playerIndex) {
  if (isDuoMode()) {
    if (!Number.isInteger(playerIndex)) return false;
    return !!duoDefendBuffActive[playerIndex];
  }
  return defendBuffActive;
}

function anyDefendStanceActive() {
  if (isDuoMode()) return duoDefendBuffActive.some(Boolean);
  return defendBuffActive;
}

function clearDefendStances() {
  defendBuffActive = false;
  duoDefendBuffActive = new Array(Math.max(2, multiplayerCount())).fill(false);
}

function playSfx(name, volume = 0.55, startTime = 0) {
  const src = SFX[name];
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = volume;
  if (startTime > 0) {
    audio.addEventListener("loadedmetadata", () => {
      audio.currentTime = Math.min(Math.max(0, startTime), Math.max(0, (audio.duration || startTime) - 0.01));
    }, { once: true });
  }
  void audio.play().catch(() => {});
}

function applyMusicVolumeSetting() {
  const effectiveMenuVolume = MENU_MUSIC_VOLUME * musicVolumeSetting;
  if (menuMusic) menuMusic.volume = effectiveMenuVolume;
  if (endingMusic) endingMusic.volume = 1;
  setBossMusicVolumeMultiplier(musicVolumeSetting);
}

function ensureMenuMusic() {
  if (menuMusic) return menuMusic;
  menuMusic = new Audio(MENU_MUSIC_SRC);
  menuMusic.loop = true;
  menuMusic.volume = MENU_MUSIC_VOLUME * musicVolumeSetting;
  return menuMusic;
}

function playMenuMusic() {
  const audio = ensureMenuMusic();
  audio.volume = MENU_MUSIC_VOLUME * musicVolumeSetting;
  void audio.play().catch(() => {});
}

function stopMenuMusic() {
  if (!menuMusic) return;
  menuMusic.pause();
  menuMusic.currentTime = 0;
}

function ensureEndingMusic() {
  if (endingMusic) return endingMusic;
  endingMusic = new Audio(ENDING_MUSIC_SRC);
  endingMusic.loop = true;
  endingMusic.volume = 1;
  return endingMusic;
}

function playEndingMusic() {
  const audio = ensureEndingMusic();
  audio.volume = 1;
  void audio.play().catch(() => {});
}

function stopEndingMusic() {
  if (!endingMusic) return;
  endingMusic.pause();
  endingMusic.currentTime = 0;
}

function isUiSoundEligibleButton(button) {
  if (!(button instanceof HTMLButtonElement)) return false;
  if (button.disabled) return false;
  if (button.classList.contains("ability-locked")) return false;
  if (button.classList.contains("choice-card-disabled")) return false;
  return true;
}

function playUiButtonSound(kind = "hover", button = null) {
  if (kind !== "hover") return;
  if (button && !isUiSoundEligibleButton(button)) return;
  playSfx("uiButton", 0.17);
}

function bindGlobalUiButtonSounds() {
  let activeHoverButton = null;

  const eligibleButton = (target) => {
    if (!(target instanceof Element)) return null;
    const button = target.closest("button");
    if (!(button instanceof HTMLButtonElement)) return null;
    if (!isUiSoundEligibleButton(button)) return null;
    return button;
  };

  document.addEventListener("mouseover", (event) => {
    const button = eligibleButton(event.target);
    if (!button) {
      activeHoverButton = null;
      return;
    }
    if (button === activeHoverButton) return;
    if (event.relatedTarget instanceof Element && button.contains(event.relatedTarget)) return;
    activeHoverButton = button;
    playUiButtonSound("hover", button);
  });

  document.addEventListener("mouseout", (event) => {
    const button = eligibleButton(event.target);
    if (!button || button !== activeHoverButton) return;
    if (event.relatedTarget instanceof Element && button.contains(event.relatedTarget)) return;
    activeHoverButton = null;
  });

  document.addEventListener("click", (event) => {
    const button = eligibleButton(event.target);
    if (!button) return;
    playUiButtonSound("click", button);
  });
}

function syncLevelMusic() {
  const finalBoss = enemies.find((enemy) => isFinalBoss(enemy));
  const finalBossPart = finalBoss?.overlordPart || 1;
  syncBossMusic(level, finalBossPart);
}

function dialoguePortraitForCharacter(characterKey) {
  if (characterKey === "patrick") return PATRICK_SPRITES.battleCard;
  if (characterKey === "kostya") return KOSTYA_SPRITES.battleCard;
  return JACOB_SPRITES.battleCard;
}

function activeDialogueCharacterKey() {
  return selectedCharacter || "player";
}

const BURGER_OVERLORD_PROFILE_SHEET = "sprites/enemy/burger_overlord/overlord_profiles.png";
const BURGER_OVERLORD_PROFILE_CELL_SIZE = 16;
const BURGER_OVERLORD_PROFILE_RENDER_SIZE = 92;
const burgerOverlordProfileCache = new Map();

function cropBurgerOverlordProfile(row, col) {
  const cacheKey = `${row}:${col}`;
  const cached = burgerOverlordProfileCache.get(cacheKey);
  if (cached) return cached;
  const promise = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = BURGER_OVERLORD_PROFILE_RENDER_SIZE;
      canvas.height = BURGER_OVERLORD_PROFILE_RENDER_SIZE;
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) {
        resolve(BURGER_OVERLORD_PROFILE_SHEET);
        return;
      }
      canvasCtx.imageSmoothingEnabled = false;
      canvasCtx.clearRect(0, 0, BURGER_OVERLORD_PROFILE_RENDER_SIZE, BURGER_OVERLORD_PROFILE_RENDER_SIZE);
      canvasCtx.drawImage(
        image,
        col * BURGER_OVERLORD_PROFILE_CELL_SIZE,
        row * BURGER_OVERLORD_PROFILE_CELL_SIZE,
        BURGER_OVERLORD_PROFILE_CELL_SIZE,
        BURGER_OVERLORD_PROFILE_CELL_SIZE,
        0,
        0,
        BURGER_OVERLORD_PROFILE_RENDER_SIZE,
        BURGER_OVERLORD_PROFILE_RENDER_SIZE
      );
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => resolve(BURGER_OVERLORD_PROFILE_SHEET);
    image.src = BURGER_OVERLORD_PROFILE_SHEET;
  });
  burgerOverlordProfileCache.set(cacheKey, promise);
  return promise;
}

function burgerOverlordProfileCell(kind = "neutral") {
  switch (kind) {
    case "enraged": return { row: 0, col: 1 };
    case "collapsed": return { row: 0, col: 2 };
    case "joy": return { row: 0, col: 3 };
    case "angry": return { row: 1, col: 0 };
    default: return { row: 0, col: 0 };
  }
}

function burgerOverlordDialoguePortrait(kind = "neutral") {
  const cell = burgerOverlordProfileCell(kind);
  return cropBurgerOverlordProfile(cell.row, cell.col);
}

function burgerOverlordBossHudPortrait(boss) {
  if (boss?.overlordSceneCollapsed || (boss?.hp || 0) <= 0) return burgerOverlordDialoguePortrait("collapsed");
  return burgerOverlordDialoguePortrait(isFinalBossPart2(boss) ? "enraged" : "neutral");
}

async function playFinalBossOpeningScene() {
  const neutralPortrait = await burgerOverlordDialoguePortrait("neutral");
  await runDialogueScene({
    steps: [
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "So. The crumb-sniffing goblin finally waddles into my court." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "You are the pest who has been gnawing through my kingdom, shelf by shelf and tray by tray." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "My burgers vanished. My fries vanished." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "Even my sauces were not spared your greasy little ambition." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "And yet you still crawl forward as if this royal kitchen belongs to you." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "Look around, snack-raider." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "Every brick here rose for me. Every order was served in my name." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "I am Burger Overlord. Crown of grease. Tyrant of flavor." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "Sovereign of the last hot meal in this forsaken dungeon." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "You are not a hero." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "You are a plate-licking inconvenience who wandered far above their station." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "Still, you made it to my throne." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "For that, I will crush you personally." }
    ]
  });
}

function endingVictoryPlayerKeys() {
  return isDuoMode()
    ? duoCharacters.filter(Boolean)
    : [activeDialogueCharacterKey()];
}

async function playFinalBossAftermathScene() {
  stopBossMusic();
  clearCombatLog();
  const playerKey = activeDialogueCharacterKey();
  const collapsedPortrait = await burgerOverlordDialoguePortrait("collapsed");
  const joyPortrait = await burgerOverlordDialoguePortrait("joy");
  const neutralPortrait = await burgerOverlordDialoguePortrait("neutral");
  const hasSalad = partyHasInventoryItem("salad");
  const canSpare = hasSalad && finalBossFirstDecision === "mercy";

  await runDialogueScene({
    steps: [
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "Twice." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "I have never been beaten twice." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "I ruled this place believing there would always be another roar left in me." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "Another order to bark. Another victory to claim." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "But now the grease has gone cold." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "For the first time, I know what it is to be truly defeated." }
    ]
  });

  const finalChoice = await chooseFromOverlay({
    title: "Final Choice",
    subtitle: "Choose what to do.",
    options: [
      {
        id: "mercy",
        name: "Spare",
        icon: dialoguePortraitForCharacter(playerKey),
        description: canSpare ? "Offer the salad and spare him." : (hasSalad ? "You rejected mercy before." : "Need Salad in inventory."),
        cost: { label: canSpare ? "Decision" : "Locked" },
        disabled: !canSpare
      },
      {
        id: "finish",
        name: "Finish",
        icon: dialoguePortraitForCharacter(playerKey),
        description: "End it here.",
        cost: { label: "Decision" }
      }
    ],
    requireConfirm: false
  });

  finalBossSecondDecision = finalChoice || "finish";
  if (finalBossSecondDecision === "mercy") {
    await runDialogueScene({
      steps: [
        { speaker: displayCharacterName(playerKey), portrait: dialoguePortraitForCharacter(playerKey), text: "It's over. Come with us." },
        { speaker: displayCharacterName(playerKey), portrait: dialoguePortraitForCharacter(playerKey), text: "No throne. No war. Just a different life." },
        { speaker: "Burger Overlord", portrait: joyPortrait, text: "You still offer that, even after all this?" },
        { speaker: "Burger Overlord", portrait: joyPortrait, text: "Then hear me well." },
        { speaker: "Burger Overlord", portrait: joyPortrait, text: "You have my gratitude. And you have my respect, completely and without reserve." },
        { speaker: "Burger Overlord", portrait: joyPortrait, text: "I will eat the salad. I will abandon the fast food. I swear it upon the ruins of my crown." }
      ]
    });
    const trueEndingBossSprite = await getBossFinalTrueEndingFrames();
    return {
      playerKeys: endingVictoryPlayerKeys(),
      endingLabel: "True Ending",
      bodyText: "Mercy was accepted.",
      bossSprite: trueEndingBossSprite[0] || bossFinalIdleFrames(1)[0] || "sprites/enemy/burger_overlord/overlord.png"
    };
  }

  await runDialogueScene({
    steps: [
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "So this is where my noise ends." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "I truly believed I was greatness to this kingdom." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "Tell the world Burger Overlord fell standing." },
      { speaker: "Burger Overlord", portrait: neutralPortrait, text: "And that, for a little while, he burned brightly." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "Goodbye, my kingdom." }
    ]
  });
  return {
    playerKeys: endingVictoryPlayerKeys(),
    endingLabel: "Bad Ending",
    bodyText: t("victory.text"),
    bossSprite: ""
  };
}

async function playFinalBossPart2Scene(boss) {
  const collapsedPortrait = await burgerOverlordDialoguePortrait("collapsed");
  const joyPortrait = await burgerOverlordDialoguePortrait("joy");
  const angryPortrait = await burgerOverlordDialoguePortrait("angry");
  const enragedPortrait = await burgerOverlordDialoguePortrait("enraged");
  const playerKey = activeDialogueCharacterKey();
  const hasSalad = partyHasInventoryItem("salad");
  await runDialogueScene({
    steps: [
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "Heh." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "So you really did it. You dragged me to the floor of my own hall." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "I would be lying if I said I expected a wandering eater to press me this far." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "You fight like a pest, but not a dull one." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "There is weight in your hands. Intention, too." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "Do not misunderstand me." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "I do not kneel to you, and I do not admire you." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "But I can grant this much." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "You have earned more respect than the fools who came before you." }
    ]
  });
  const choice = await chooseFromOverlay({
    title: "Final Choice",
    subtitle: "Choose what to say.",
    options: [
      { id: "mercy", name: "Mercy", icon: dialoguePortraitForCharacter(playerKey), description: hasSalad ? "Offer him a way out." : "Need Salad in inventory.", cost: { label: hasSalad ? "Decision" : "Locked" }, disabled: !hasSalad },
      { id: "finish", name: "Finish", icon: dialoguePortraitForCharacter(playerKey), description: "Finish him.", cost: { label: "Decision" } }
    ],
    requireConfirm: false
  });

  if (choice === "mercy") {
    finalBossFirstDecision = "mercy";
    await runDialogueScene({
      steps: [
        { speaker: displayCharacterName(playerKey), portrait: dialoguePortraitForCharacter(playerKey), text: "..." },
        { speaker: displayCharacterName(playerKey), portrait: dialoguePortraitForCharacter(playerKey), text: "It doesn't have to end like this." },
        { speaker: displayCharacterName(playerKey), portrait: dialoguePortraitForCharacter(playerKey), text: "Come with us. Stop this." },
        { speaker: displayCharacterName(playerKey), portrait: dialoguePortraitForCharacter(playerKey), text: "I even brought you something better than all this junk." },
        { speaker: "Burger Overlord", portrait: joyPortrait, text: "Mercy? From you?" },
        { speaker: "Burger Overlord", portrait: angryPortrait, text: "Hah. You really think one soft offer is enough to tame Burger Overlord?" },
        { speaker: "Burger Overlord", portrait: angryPortrait, text: "No." },
        { speaker: "Burger Overlord", portrait: angryPortrait, text: "I will not be remembered as a king who folded the moment he touched the floor." },
        { speaker: "Burger Overlord", portrait: enragedPortrait, text: "Get up, challenger. You have earned the right to face the rest of my power." },
        { speaker: "Burger Overlord", portrait: enragedPortrait, text: "If your mercy means anything, let it survive what comes next." }
      ]
    });
    return { mercyAccepted: false };
  }

  finalBossFirstDecision = "finish";
  await runDialogueScene({
    steps: [
      { speaker: displayCharacterName(playerKey), portrait: dialoguePortraitForCharacter(playerKey), text: "It's over." },
      { speaker: displayCharacterName(playerKey), portrait: dialoguePortraitForCharacter(playerKey), text: "Give up." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "You would finish me here." },
      { speaker: "Burger Overlord", portrait: collapsedPortrait, text: "Then I will not crawl." },
      { speaker: "Burger Overlord", portrait: angryPortrait, text: "I still stand above every coward who ever begged for life at the edge of defeat." },
      { speaker: "Burger Overlord", portrait: enragedPortrait, text: "You have beaten me once." },
      { speaker: "Burger Overlord", portrait: enragedPortrait, text: "For that, I will grant you this much respect, you are worthy of a king's last stand." },
      { speaker: "Burger Overlord", portrait: enragedPortrait, text: "Come. If you mean to end me, then meet me at my fiercest." }
    ]
  });
  return { mercyAccepted: false };
}

async function maybeRunFinalBossIntro() {
  const boss = enemies.find((enemy) => isFinalBoss(enemy) && !isFinalBossPart2(enemy));
  if (level !== 50 || !boss || finalBossIntroSeen) return false;
  finalBossIntroSeen = true;
  stopBossMusic();
  setActionsLocked(true);
  await playFinalBossOpeningScene();
  return true;
}

async function enterCurrentEncounter() {
  refreshUI();
  startIdleAnimations();
  await maybeRunFinalBossIntro();
  syncLevelMusic();
  refreshUI();
  startIdleAnimations();
  await beginPlayerTurn();
}

function setActionsLocked(locked) {
  actionsLocked = locked;
  if (locked) actionPanelView = "actions";
  ["stab", "slash", "dark", "atk", "prc", "swg", "def", "pot", "sum", "coin", "fine", "ins", "rev", "hb", "ps", "as", "ad", "dw", "ms", "ss", "ah", INVENTORY_ACTION_ID, INVENTORY_CLOSE_ACTION_ID, "upHallow", "upPiercing", "upAceSpades", "upAceDiamonds", "upDualWielding", "upMagnumShot", "upSixShooter", "upAceHearts", "upMasterA", "upMasterB", "upMasterC", "upStrongerBlade", "upNoLight"].forEach((id) => {
    const btn = getEl(id);
    if (btn) btn.disabled = locked;
  });
  syncTopUiState();
  syncPatrickIdlePose({
    isPatrick: () => isPatrick(),
    isPlayerAnimating: () => playerAnimating,
    getPlayer: () => player,
    getEl,
    activePlayerSpriteId,
    playerSprites,
    isActionsLocked: () => actionsLocked
  });
}

function idleFramesForCharacter(characterKey, isActiveTurn = false) {
  const sprites = characterSprites(characterKey);
  if (characterKey === "patrick") {
    return selectPatrickIdleFrames({
      sprites,
      isActiveTurn,
      actionsLocked
    });
  }
  if (characterKey === "kostya") {
    return selectKostyaIdleFrames({
      sprites,
      isActiveTurn,
      actionsLocked
    });
  }
  return sprites.idle;
}

function updateAbilityGridScale() {
  const uiRoot = getEl("ui");
  if (!uiRoot) return;
  const buttons = actionButtons();
  const fixedCols = 5;
  uiRoot.style.setProperty("--actions-cols", String(fixedCols));
  uiRoot.style.setProperty(
    "--actions-grid-width",
    `calc(var(--action-col-width) * ${fixedCols} + var(--action-gap) * ${fixedCols - 1})`
  );
  if (!buttons.length) {
    uiRoot.style.setProperty("--ability-scale", "1");
    return;
  }
  const abilities = [...document.querySelectorAll("#actions .ability-btn")];
  if (!abilities.length) {
    uiRoot.style.setProperty("--ability-scale", "1");
    return;
  }
  const rows = Math.ceil(abilities.length / fixedCols);
  const scale = rows <= 2 ? 1 : Math.max(0.62, 2 / rows);
  uiRoot.style.setProperty("--ability-scale", scale.toFixed(2));
}

function isSkillCheckVisible() {
  const skill = getEl("skillCheck");
  return !!skill && !skill.classList.contains("hidden");
}

function actionButtons() {
  const container = getEl("actions");
  if (!container) return [];
  return [...container.querySelectorAll("button")];
}

function tooltipEl() {
  return getEl("actionTooltip");
}

function hideActionTooltip() {
  const tip = tooltipEl();
  if (!tip) return;
  tip.style.display = "none";
  tip.innerText = "";
}

function showActionTooltip(text, x, y) {
  const tip = tooltipEl();
  if (!tip || !text) {
    hideActionTooltip();
    return;
  }
  tip.innerText = text;
  tip.style.display = "block";
  tip.style.left = `${Math.min(window.innerWidth - 230, Math.max(8, x + 14))}px`;
  tip.style.top = `${Math.min(window.innerHeight - 72, Math.max(8, y + 14))}px`;
}

function clearInlineActionHint() {
  if (!inlineHintButtonId) return;
  const prev = getEl(inlineHintButtonId);
  if (!prev) return;
  const existing = prev.querySelector(".action-inline-hint");
  if (existing) existing.remove();
  inlineHintButtonId = "";
}

function showInlineActionHint(button, text) {
  clearInlineActionHint();
  if (!button || !text) return;
  const hint = document.createElement("div");
  hint.className = "action-inline-hint";
  hint.innerText = text;
  button.appendChild(hint);
  inlineHintButtonId = button.id;
}

function bindActionButtonHint(button, text) {
  if (!button) return;
  button.dataset.hint = text || "";
  button.onmouseenter = (e) => {
    keyboardNavMode = false;
    selectedActionIndex = Math.max(0, actionButtons().indexOf(button));
    syncActionSelection();
    clearInlineActionHint();
    showActionTooltip(text, e.clientX, e.clientY);
  };
  button.onmousemove = (e) => {
    keyboardNavMode = false;
    selectedActionIndex = Math.max(0, actionButtons().indexOf(button));
    syncActionSelection();
    showActionTooltip(text, e.clientX, e.clientY);
  };
  button.onmouseleave = () => {
    hideActionTooltip();
  };
}

function actionGridColumns() {
  const uiRoot = getEl("ui");
  if (!uiRoot) return 2;
  const value = Number.parseInt(getComputedStyle(uiRoot).getPropertyValue("--actions-cols"), 10);
  if (!Number.isFinite(value) || value <= 0) return 2;
  return value;
}

function isCurrentTurnMoveLeftKey(code) {
  return isCurrentTurnMoveLeftKeyByMode(code, gameMode, activeDuoPlayer);
}

function isCurrentTurnMoveRightKey(code) {
  return isCurrentTurnMoveRightKeyByMode(code, gameMode, activeDuoPlayer);
}

function isCurrentTurnMoveUpKey(code) {
  return isCurrentTurnMoveUpKeyByMode(code, gameMode, activeDuoPlayer);
}

function isCurrentTurnMoveDownKey(code) {
  return isCurrentTurnMoveDownKeyByMode(code, gameMode, activeDuoPlayer);
}

function isCurrentTurnConfirmKey(code) {
  return isCurrentTurnConfirmKeyByMode(code, gameMode, activeDuoPlayer);
}

function isCurrentTurnCancelKey(code) {
  return isCurrentTurnCancelKeyByMode(code, gameMode, activeDuoPlayer);
}

function currentSkillCheckKeys() {
  return currentSkillCheckKeysByMode(gameMode, activeDuoPlayer);
}

function skillCheckKeysForPlayerIndex(playerIndex) {
  return skillCheckKeysForPlayerIndexByMode(playerIndex, gameMode);
}

function syncActionSelection() {
  const buttons = actionButtons();
  if (!buttons.length) return;
  if (selectedActionIndex < 0 || selectedActionIndex >= buttons.length) selectedActionIndex = 0;
  buttons.forEach((btn, idx) => {
    if (idx === selectedActionIndex) btn.classList.add("action-selected");
    else btn.classList.remove("action-selected");
  });
  const focused = buttons[selectedActionIndex];
  if (!focused) return;
  if (keyboardNavMode) {
    hideActionTooltip();
    showInlineActionHint(focused, focused.dataset.hint || "");
  } else {
    clearInlineActionHint();
  }
}

function moveActionSelection(deltaRow, deltaCol) {
  const buttons = actionButtons().filter((btn) => !btn.disabled);
  if (!buttons.length) return;
  const allButtons = actionButtons();
  const previousIndex = selectedActionIndex;
  const cols = actionGridColumns();
  const active = allButtons[selectedActionIndex];
  const activeInEnabled = active ? buttons.indexOf(active) : -1;
  let idx = activeInEnabled >= 0 ? activeInEnabled : 0;
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  let nextRow = row + deltaRow;
  let nextCol = col + deltaCol;
  if (deltaRow === 0) {
    if (nextCol < 0) nextCol = cols - 1;
    if (nextCol >= cols) nextCol = 0;
  }
  nextRow = Math.max(0, Math.min(Math.ceil(buttons.length / cols) - 1, nextRow));
  let nextIdx = nextRow * cols + nextCol;
  if (nextIdx >= buttons.length) nextIdx = buttons.length - 1;
  const target = buttons[nextIdx];
  const fullIdx = allButtons.indexOf(target);
  if (fullIdx >= 0) selectedActionIndex = fullIdx;
  syncActionSelection();
  if (keyboardNavMode && selectedActionIndex !== previousIndex) {
    playUiButtonSound("hover", target);
  }
}

function confirmActionSelection() {
  const buttons = actionButtons();
  const target = buttons[selectedActionIndex];
  if (!target || target.disabled) return;
  target.click();
}

function resetActionSelection() {
  selectedActionIndex = 0;
  keyboardNavMode = false;
  clearInlineActionHint();
  hideActionTooltip();
  syncActionSelection();
}

function setTargetSelectionActive(active) {
  targetSelectionActive = active;
  if (active) {
    keyboardNavMode = false;
    clearInlineActionHint();
    hideActionTooltip();
  }
}

function bindActionKeyboardNavigation() {
  document.addEventListener("keydown", (e) => {
    if (!gameStarted) return;
    if (actionsLocked) return;
    if (targetSelectionActive) return;
    if (isSkillCheckVisible()) return;
    const startScreen = getEl("startScreen");
    if (startScreen && !startScreen.classList.contains("hidden")) return;
    if (!actionButtons().length) return;

    if (isCurrentTurnMoveLeftKey(e.code)) {
      e.preventDefault();
      keyboardNavMode = true;
      moveActionSelection(0, -1);
    } else if (isCurrentTurnMoveRightKey(e.code)) {
      e.preventDefault();
      keyboardNavMode = true;
      moveActionSelection(0, 1);
    } else if (isCurrentTurnMoveUpKey(e.code)) {
      e.preventDefault();
      keyboardNavMode = true;
      moveActionSelection(-1, 0);
    } else if (isCurrentTurnMoveDownKey(e.code)) {
      e.preventDefault();
      keyboardNavMode = true;
      moveActionSelection(1, 0);
    } else if (isCurrentTurnConfirmKey(e.code)) {
      e.preventDefault();
      confirmActionSelection();
    }
  });
}

function runSkillCheck(options) {
  const keys = options?.acceptedKeys || currentSkillCheckKeys();
  const ownerPlayerIndex = Number.isInteger(options?.ownerPlayerIndex)
    ? options.ownerPlayerIndex
    : (isDuoMode() ? activeDuoPlayer : null);
  setSkillOwnerVisual(ownerPlayerIndex);
  return new Promise((resolve) => {
    startSkillCheck((success, charge, reason) => {
      resolve({ success, charge, reason });
    }, { ...options, acceptedKeys: keys });
  });
}

function runMashSkillCheck(options) {
  const keys = options?.acceptedKeys || currentSkillCheckKeys();
  const ownerPlayerIndex = Number.isInteger(options?.ownerPlayerIndex)
    ? options.ownerPlayerIndex
    : (isDuoMode() ? activeDuoPlayer : null);
  setSkillOwnerVisual(ownerPlayerIndex);
  return new Promise((resolve) => {
    startMashSkillCheck((success, charge, reason) => {
      resolve({ success, charge, reason });
    }, { ...options, acceptedKeys: keys });
  });
}

function enemySpriteSet(enemy) {
  if (isFinalBoss(enemy)) {
    return {
      ...ENEMY_SPRITES.bossFinal,
      idle: bossFinalIdleFrames(isFinalBossPart2(enemy) ? 2 : 1),
      damaged: bossFinalDamagedFrames(isFinalBossPart2(enemy) ? 2 : 1),
      summon: bossFinalSummonFrames(isFinalBossPart2(enemy) ? 2 : 1),
      collapsed: bossFinalCollapsedFrames()
    };
  }
  return enemy.boss ? ENEMY_SPRITES.boss : ENEMY_SPRITES.normal;
}

function createEnemy(kind = "normal", stunnedTurns = 0) {
  const enemy = new Enemy(level, kind);
  enemy.id = nextEnemyId++;
  enemy.stunTurns = Math.max(0, Math.floor(stunnedTurns));
  enemy.blocking = false;
  enemy.animating = false;
  if (enemy.boss && enemy.name === "Burger Overlord") enemy.overlordPart = 1;
  ensureStatuses(enemy);
  if (enemy.stunTurns > 0) applyStatus(enemy, "stunned", 10, enemy.stunTurns);
  return enemy;
}

function createHelper() {
  const maxHp = 20 + helperTrainingUpgrades * 10;
  const helperSprite = isKostya() ? KOSTYA_SPRITES.shadow : playerSprites().idle[0];
  const helperIdle = isKostya()
    ? getCachedKostyaShadowIdleFrames()
    : playerSprites().idle;
  const created = {
    hp: maxHp,
    maxHp,
    maxSp: 100,
    sp: 0,
    def: 1,
    atk: Math.max(2, Math.floor(player.atk * 0.6)),
    potions: 1,
    defending: false,
    animating: false,
    sprite: helperSprite,
    idleFrames: helperIdle
  };
  ensureStatuses(created);
  return created;
}

function maybeSpecialEnemyKind() {
  const roll = Math.random();
  if (roll < 0.12) return "tank";
  if (roll < 0.23) return "support";
  if (roll < 0.34) return "bruiser";
  return "normal";
}

function rollEnemyCount() {
  let count = 1;
  let chance = 0.4;
  while (count < 4 && Math.random() < chance) {
    count += 1;
    chance -= 0.1;
  }
  return count;
}

function spawnLevelEnemies() {
  if (level % 10 === 0) return [createEnemy("boss")];

  const count = rollEnemyCount();
  const list = [];
  for (let i = 0; i < count; i += 1) {
    list.push(createEnemy(maybeSpecialEnemyKind()));
  }
  return list;
}

function startNewLevelState() {
  battlefieldTileSignature = "";
  helperCanSummonThisLevel = helperUnlocked;
  clearDefendStances();
  if (isDuoMode()) {
    duoPlayers.forEach((unit) => {
      if (!unit) return;
      STATUS_KEYS.forEach((key) => clearStatus(unit, key));
    });
  } else {
    STATUS_KEYS.forEach((key) => clearStatus(player, key));
  }
  if (helper) STATUS_KEYS.forEach((key) => clearStatus(helper, key));
  const shadow = getKostyaShadow();
  if (shadow) STATUS_KEYS.forEach((key) => clearStatus(shadow, key));
  applyKostyaShadowLevelDecay({ applyStatus });
}

function frontEnemy() {
  return enemies[0] || null;
}

function stopPreservedFinalBossSceneAnimation() {
  if (preservedFinalBossCapeTimer) clearInterval(preservedFinalBossCapeTimer);
  preservedFinalBossCapeTimer = null;
  preservedFinalBossId = null;
}

function startPreservedFinalBossSceneAnimation(enemyId) {
  stopPreservedFinalBossSceneAnimation();
  preservedFinalBossId = enemyId;
  const sprite = getEl(`enemy-sprite-${enemyId}`);
  const cape = getEl(`enemy-cape-${enemyId}`);
  const collapsedFrames = bossFinalCollapsedFrames();
  const capeFrames = bossFinalCapeFrames();
  if (sprite && collapsedFrames.length) {
    sprite.src = collapsedFrames[0];
  }
  if (!cape || !capeFrames.length) return;
  let idx = 0;
  cape.style.display = "";
  cape.src = capeFrames[0];
  preservedFinalBossCapeTimer = setInterval(() => {
    const activeCape = getEl(`enemy-cape-${enemyId}`);
    if (!activeCape) {
      stopPreservedFinalBossSceneAnimation();
      return;
    }
    idx = (idx + 1) % capeFrames.length;
    activeCape.style.display = "";
    activeCape.src = capeFrames[idx];
  }, scaleDuration(345));
}

function clearAllStatuses(entity) {
  if (!entity) return;
  STATUS_KEYS.forEach((key) => clearStatus(entity, key));
}

async function promoteBurgerOverlordToPart2(enemy) {
  if (!isFinalBoss(enemy) || enemy.overlordPart === 2) return false;
  const livingAdds = enemies.filter((candidate) => candidate.id !== enemy.id && candidate.hp > 0);
  if (livingAdds.length) {
    enemy.hp = 0;
    enemy.blocking = false;
    enemy.animating = false;
    enemy.stunTurns = 0;
    clearAllStatuses(enemy);
    enemy.overlordSceneCollapsed = true;
    enemy.awaitingPart2 = true;
    refreshUI();
    return false;
  }
  enemy.awaitingPart2 = false;
  enemy.overlordPart = 2;
  enemy.maxHp = 4600;
  enemy.hp = enemy.maxHp;
  enemy.blocking = false;
  enemy.animating = false;
  enemy.stunTurns = 0;
  clearAllStatuses(enemy);
  enemy.overlordSceneCollapsed = true;
  stopBossMusic();
  setActionsLocked(true);
  stopIdleAnimations();
  refreshUI();
  if (!finalBossPart2SceneSeen) {
    finalBossPart2SceneSeen = true;
    const sceneResult = await playFinalBossPart2Scene(enemy);
    if (sceneResult?.mercyAccepted) {
      preserveMercyBattlefield = true;
      enemy.hp = 0;
      enemy.mercyAccepted = true;
      return false;
    }
  }
  enemy.overlordSceneCollapsed = false;
  syncLevelMusic();
  refreshUI();
  startIdleAnimations();
  renderCombatActions();
  setActionsLocked(false);
  return true;
}

async function removeDeadEnemies() {
  const fallen = [];
  for (const enemy of enemies) {
    if (enemy.hp > 0) continue;
    if (await promoteBurgerOverlordToPart2(enemy)) continue;
    if (isFinalBoss(enemy) && enemy.overlordPart === 2) {
      enemy.blocking = false;
      enemy.animating = false;
      enemy.stunTurns = 0;
      clearAllStatuses(enemy);
      enemy.overlordSceneCollapsed = true;
      preserveMercyBattlefield = true;
      startPreservedFinalBossSceneAnimation(enemy.id);
    }
    if (isFinalBoss(enemy) && enemy.awaitingPart2) continue;
    fallen.push(enemy);
  }
  enemies = enemies.filter((enemy) => enemy.hp > 0 || (isFinalBoss(enemy) && enemy.awaitingPart2));
  fallen.forEach((enemy) => {
    if (enemy.mercyAccepted) return;
    awardDroppedItem(enemy, enemy.lastDamagedBy || currentInventoryUnit());
    addLog(`${enemyLabel(enemy)} collapsed.`, "collapse-enemy");
  });
}

function rebuildEnemyDisplayNames() {
  const groups = new Map();
  enemies.forEach((enemy) => {
    if (!groups.has(enemy.name)) groups.set(enemy.name, []);
    groups.get(enemy.name).push(enemy);
  });

  enemyDisplayNames = new Map();
  groups.forEach((group, baseName) => {
    if (group.length <= 1) {
      enemyDisplayNames.set(group[0].id, baseName);
      return;
    }
    group.forEach((enemy, idx) => {
      enemyDisplayNames.set(enemy.id, `${baseName} ${idx + 1}`);
    });
  });
}

function enemyLabel(enemy) {
  return enemyDisplayNames.get(enemy.id) || enemy.name;
}

function renderDuoPartner() {
  renderDuoPartnerUI({
    getEl,
    isDuoMode,
    duoPlayers,
        duoCharacters,
        playerEntityIdForIndex,
        statusIconsHtml,
        playerSpriteIdForIndex,
        skillFeedbackIdForPlayerIndex,
        queuedActionIdForPlayerIndex,
        characterCollapsedSprite,
        characterBaseSprite,
        idleFramesForCharacter
  });
}

function renderDuoBattleCards() {
  renderDuoBattleCardsUI({
    getEl,
    isDuoMode,
    duoPlayers,
    duoCharacters,
    luckyChargeCapForLevel,
    shadowChargePct: getKostyaShadowChargePct(),
    level,
    strengthenUpgrades,
    displayCharacterName,
    patrickBattleCard: PATRICK_SPRITES.battleCard,
    kostyaBattleCard: KOSTYA_SPRITES.battleCard
  });
}

function renderHelper() {
  const zone = getEl("helperZone");
  const slot = getEl("helperCardSlot");
  if (!zone || !slot) return;
  slot.innerHTML = "";
  const companions = [];
  if (helperUnlocked && helper) companions.push({ id: "helper", unit: helper, label: "HELPER" });
  const shadow = getKostyaShadow();
  if (shadow) companions.push({ id: "shadow", unit: shadow, label: "Shadow" });
  const shouldReserveSlots = helperUnlocked || isKostya() || !!shadow;
  if (!shouldReserveSlots && !companions.length) {
    zone.innerHTML = "";
    return;
  }
  const helperSlots = new Array(HELPER_RENDER_SLOT_COUNT).fill("");
  companions.forEach(({ id, unit, label }) => {
    const blockStatus = unit.defending ? '<div class="ally-status">DEFEND</div>' : "";
    const isShadowCompanion = id === "shadow";
    const hpMarkup = isShadowCompanion
      ? (
        `<div class="hpbar shadow-shield-hpbar">` +
        `<div id="${id}HpVoidWorld" class="hpfill shadow-void-hpfill"></div>` +
        `<div id="${id}HpBaseWorld" class="hpfill shadow-base-hpfill"></div>` +
        `<div id="${id}HpWorld" class="hpfill shadow-hpfill"></div>` +
        `</div>`
      )
      : `<div class="hpbar"><div id="${id}HpWorld" class="hpfill"></div></div>`;
    const markup = (
      `<div id="${id}Char" class="ally-entity helper-entity${isShadowCompanion ? " shadow-entity" : ""}">` +
      blockStatus +
      statusIconsHtml(unit) +
      chatBubbleHtmlForAlly(id) +
      `<img id="${id}Sprite" class="ally-sprite" src="" alt="${label}">` +
      `<div class="enemy-name helper-name">${label}</div>` +
      `<div class="enemy-hp-wrap helper-hp-wrap">` +
      hpMarkup +
      `<div id="${id}HpNum" class="enemy-hp-num">${isShadowCompanion ? `${unit.shp || 0}` : unit.hp}</div>` +
      `</div>` +
      `</div>`
    );
    const slotIndex = id === "shadow" ? (companions.some((entry) => entry.id === "helper") ? 1 : 0) : 0;
    helperSlots[slotIndex] = markup;
  });

  const visibleHelperSlots = companions.length >= 2
    ? helperSlots
    : helperSlots.filter(Boolean);
  zone.innerHTML = visibleHelperSlots.map((content, idx) =>
    `<div class="helper-slot${content ? " helper-slot-occupied" : ""}" data-slot="${idx}">${content}</div>`
  ).join("");

  companions.forEach(({ id, unit }) => {
    const hp = getEl(`${id}HpWorld`);
    const hpBase = getEl(`${id}HpBaseWorld`);
    const hpVoid = getEl(`${id}HpVoidWorld`);
    if (hp) {
      if (id === "shadow") {
        const shadowVhp = Math.max(0, unit.vhp || 0);
        const shadowShp = Math.max(0, unit.shp || 0);
        if (hpVoid) hpVoid.style.width = `${((shadowVhp || 0) / Math.max(1, unit.maxVhp || 1)) * 100}%`;
        if (shadowVhp > 0) {
          hp.style.width = `${(shadowShp / Math.max(1, unit.maxShp || 1)) * 100}%`;
          hp.classList.add("shadow-hpfill");
          hp.classList.remove("shadow-active-hpfill");
          if (hpBase) hpBase.style.width = `${(unit.hp / Math.max(1, unit.maxHp || 1)) * 100}%`;
        } else if (shadowShp > 0) {
          hp.style.width = `${(shadowShp / Math.max(1, unit.maxShp || 1)) * 100}%`;
          hp.classList.add("shadow-hpfill");
          hp.classList.remove("shadow-active-hpfill");
          if (hpBase) hpBase.style.width = `${(unit.hp / Math.max(1, unit.maxHp || 1)) * 100}%`;
        } else {
          hp.style.width = `${(unit.hp / Math.max(1, unit.maxHp || 1)) * 100}%`;
          hp.classList.remove("shadow-hpfill");
          hp.classList.add("shadow-active-hpfill");
          if (hpBase) hpBase.style.width = "0%";
        }
      } else {
        hp.style.width = `${(unit.hp / unit.maxHp) * 100}%`;
        hp.classList.remove("shadow-hpfill");
        if (hpBase) hpBase.style.width = "0%";
        if (hpVoid) hpVoid.style.width = "0%";
      }
    }
    const hpNum = getEl(`${id}HpNum`);
    if (hpNum) {
      if (id === "shadow" && (unit.vhp || 0) > 0) hpNum.innerText = `${unit.vhp || 0}`;
      else if (id === "shadow" && (unit.shp || 0) > 0) hpNum.innerText = `${unit.shp || 0}`;
      else hpNum.innerText = `${unit.hp}`;
    }
    const sprite = getEl(`${id}Sprite`);
    if (sprite && !unit.animating) sprite.src = unit.sprite || playerSprites().idle[0];
  });
}

function renderBossCard() {
  const slot = getEl("bossCardSlot");
  const hud = getEl("bossHud");
  if (!slot) return;
  const boss = enemies.find((enemy) => enemy.boss);
  if (!boss) {
    slot.innerHTML = "";
    if (hud) {
      hud.innerHTML = "";
      hud.classList.add("hidden");
    }
    return;
  }

  slot.innerHTML = "";
  if (!hud) return;
  hud.classList.remove("hidden");
  const hpPct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
  if (isFinalBoss(boss)) {
    hud.innerHTML =
      `<div class="boss-hud-shell boss-hud-shell-final">` +
      `<div class="boss-hud-panel boss-hud-panel-final">` +
      `<div class="boss-hud-final-main">` +
      `<div class="boss-hud-final-left">` +
      `<div class="boss-hud-name boss-hud-name-final">${enemyLabel(boss)}</div>` +
      `<div class="boss-hud-final-bar-wrap">` +
      `<div class="boss-hud-bar boss-hud-bar-final">` +
      `<div class="boss-hud-fill" style="width:${hpPct}%"></div>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `<div class="boss-hud-final-right">` +
      `<img id="boss-hud-profile" class="boss-hud-profile boss-hud-profile-final" src="" alt="${enemyLabel(boss)} portrait">` +
      `</div>` +
      `</div>` +
      `</div>` +
      `</div>`;
    burgerOverlordBossHudPortrait(boss).then((src) => {
      const img = getEl("boss-hud-profile");
      if (img) img.src = src;
    });
    return;
  }

  hud.innerHTML =
    `<div class="boss-hud-shell boss-hud-shell-compact">` +
    `<div class="boss-hud-panel boss-hud-panel-compact">` +
    `<div class="boss-hud-top boss-hud-top-compact">` +
    `<div class="boss-hud-name boss-hud-name-compact">${enemyLabel(boss)}</div>` +
    `<div class="boss-hud-hp-num boss-hud-hp-num-compact">${boss.hp}</div>` +
    `</div>` +
    `<div class="boss-hud-final-bar-wrap boss-hud-bar-wrap-compact">` +
    `<div class="boss-hud-bar boss-hud-bar-compact">` +
    `<div class="boss-hud-fill" style="width:${hpPct}%"></div>` +
    `</div>` +
    `</div>` +
    `</div>`;
}

function renderEnemies() {
  const group = getEl("enemyGroup");
  if (!group) return;
  if (preserveMercyBattlefield) return;
  if (!enemies.length) {
    group.innerHTML = "";
    return;
  }

  const enemySlots = new Array(ENEMY_RENDER_SLOT_COUNT).fill("");
  enemies.forEach((enemy, idx) => {
    if (isFinalBoss(enemy)) {
      const shieldPower = getFinalBossMinionShieldPower(enemy, enemies);
      const resistance = statusEntry(enemy, "resistance");
      if (shieldPower > 0) {
        resistance.power = clampStatusPower(shieldPower);
        resistance.turns = 999;
      } else if (resistance.turns >= 999) {
        resistance.power = 0;
        resistance.turns = 0;
      }
    }
    const frontCls = idx === 0 ? " enemy-front" : "";
    const statusIcons = statusIconsHtml(enemy, "enemy-status-icons");
    const hpWrap = enemy.boss
      ? ""
      : (
      `<div class="enemy-hp-wrap">` +
      `<div class="hpbar hpbar-overlay">` +
      `<div id="enemy-hp-base-${enemy.id}" class="hpfill"></div>` +
      `<div id="enemy-ahp-${enemy.id}" class="hpfill hpfill-absorption hidden"></div>` +
      `</div>` +
      `<div id="enemy-hp-num-${enemy.id}" class="enemy-hp-num">${enemy.hp}</div>` +
      `</div>`
    );
    const isFinal = isFinalBoss(enemy);
    const spriteHtml = isFinal
      ? (
        `<div class="enemy-sprite-stack">` +
        `<img id="enemy-cape-${enemy.id}" class="enemy-cape" src="" alt="${enemy.name} cape">` +
        `<img id="enemy-sprite-${enemy.id}" class="enemy-sprite enemy-main-sprite" src="" alt="${enemy.name}">` +
        `</div>`
      )
      : `<img id="enemy-sprite-${enemy.id}" class="enemy-sprite" src="" alt="${enemy.name}">`;

    const bossCls = isFinal ? " enemy-overlord" : "";
    const markup = (
      `<div id="enemy-entity-${enemy.id}" class="enemy-entity${frontCls}${bossCls}">` +
      statusIcons +
      chatBubbleHtmlForEnemy(enemy.id) +
      spriteHtml +
      `<div class="enemy-name">${enemyLabel(enemy)}</div>` +
      hpWrap +
      `</div>`
    );
    const slotIndex = Math.max(0, ENEMY_RENDER_SLOT_COUNT - enemies.length + idx);
    enemySlots[slotIndex] = markup;
  });

  group.innerHTML = enemySlots.map((content, idx) =>
    `<div class="enemy-slot${content ? " enemy-slot-occupied" : ""}" data-slot="${idx}">${content}</div>`
  ).join("");

  enemies.forEach((enemy) => {
    const hp = getEl(`enemy-hp-base-${enemy.id}`);
    if (hp) hp.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
    const ahp = getEl(`enemy-ahp-${enemy.id}`);
    if (ahp) {
      const absorptionPct = enemy.maxAhp > 0 ? ((enemy.ahp || 0) / enemy.maxAhp) * 100 : 0;
      const hasAbsorption = (enemy.ahp || 0) > 0;
      ahp.style.width = `${Math.max(0, Math.min(100, absorptionPct))}%`;
      ahp.classList.toggle("hidden", !hasAbsorption);
      if (hp) hp.classList.toggle("hpfill-base", hasAbsorption);
    }
    const hpNum = getEl(`enemy-hp-num-${enemy.id}`);
    if (hpNum) hpNum.innerText = `${enemy.hp}`;
    if (enemy.animating) return;

    const set = enemySpriteSet(enemy);
    const img = getEl(`enemy-sprite-${enemy.id}`);
    if (!img) return;
    img.src = enemy.overlordSceneCollapsed
      ? set.collapsed[0]
      : (enemy.blocking ? set.block[0] : set.idle[0]);
    if (isFinalBoss(enemy)) {
      const cape = getEl(`enemy-cape-${enemy.id}`);
      if (cape) {
        cape.src = bossFinalCapeFrames()[0];
        cape.style.display = "";
      }
    }
  });
}

function showSummonIndicator(entity, label = "SUMMON") {
  if (!entity || !label) return () => {};
  const indicator = document.createElement("div");
  indicator.className = "summon-indicator";
  indicator.innerText = label;
  entity.appendChild(indicator);
  requestAnimationFrame(() => {
    indicator.classList.add("summon-indicator-visible");
  });
  return () => {
    if (indicator.isConnected) indicator.remove();
  };
}

async function animateSummonArrival(entityId, options = {}) {
  const {
    spriteId = "",
    walkFrames = [],
    from = "right",
    durationMs = 460,
    distancePx = 180,
    indicator = "",
    playSound = true
  } = options;
  const entity = getEl(entityId);
  const field = getEl("battlefield");
  if (!entity || !field) return;

  const actualDurationMs = scaleDuration(durationMs);
  const removeIndicator = showSummonIndicator(entity, indicator);
  const stopLoop = spriteId && Array.isArray(walkFrames) && walkFrames.length
    ? startSpriteLoop(spriteId, walkFrames, 85)
    : (() => {});
  const entityRect = entity.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();
  const edgeMargin = Math.max(28, distancePx);
  const offsetX = from === "left"
    ? (fieldRect.left - entityRect.left - entityRect.width - edgeMargin)
    : (fieldRect.right - entityRect.right + entityRect.width + edgeMargin);

  if (playSound) playSfx("summon", 0.62);

  entity.classList.add("summon-arriving");
  entity.style.transition = "none";
  entity.style.opacity = "0";
  entity.style.transform = `translate(${offsetX}px, 0)`;
  void entity.offsetWidth;

  requestAnimationFrame(() => {
    entity.style.transition = `transform ${actualDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${actualDurationMs}ms ease-out`;
    entity.style.opacity = "1";
    entity.style.transform = "translate(0, 0)";
  });

  await sleep(durationMs);
  stopLoop();
  removeIndicator();
  entity.classList.remove("summon-arriving");
  entity.style.transition = "";
  entity.style.opacity = "";
  entity.style.transform = "";
}

function refreshUI() {
  renderBattlefieldTiles();
  applyTurnTheme();
  syncTopUiState();
  if (isDuoMode()) {
    duoPlayers.forEach((unit, idx) => clampUnitToCharacterCaps(unit, duoCharacters[idx]));
  } else {
    clampUnitToCharacterCaps(player, selectedCharacter);
  }
  clampLuckyChargesToCap();
  const luckyHud = getEl("luckyChargesHud");
  const luckyNum = getEl("luckyChargesNum");
  const luckyFill = getEl("luckyChargesFill");
  const luckyIcon = document.querySelector(".lucky-stack-icon");
  const shadowIcon = document.querySelector(".shadow-stack-icon");
  if (luckyHud && luckyNum) {
    if (isPatrick()) {
      luckyHud.classList.remove("hidden");
      const cap = luckyChargeCapForLevel(level);
      luckyNum.innerText = `${player.luckyCharges}`;
      if (luckyIcon) {
        luckyIcon.src = PATRICK_SPRITES.luckyChargeIcon;
        luckyIcon.alt = "Lucky Charges icon";
        luckyIcon.classList.remove("hidden");
      }
      if (shadowIcon) {
        shadowIcon.classList.add("hidden");
      }
      if (luckyFill) {
        const pct = cap > 0 ? (player.luckyCharges / cap) * 100 : 0;
        luckyFill.style.height = `${Math.max(0, Math.min(100, pct))}%`;
      }
    } else if (isKostya()) {
      luckyHud.classList.remove("hidden");
      const shadowPct = getKostyaShadowChargePct();
      luckyNum.innerText = `${Math.round(shadowPct)}%`;
      if (luckyIcon) {
        luckyIcon.classList.add("hidden");
      }
      if (shadowIcon) {
        shadowIcon.src = KOSTYA_SPRITES.shadowCharges || KOSTYA_SPRITES.shadow;
        shadowIcon.alt = "Shadow Charge icon";
        shadowIcon.classList.remove("hidden");
      }
      if (luckyFill) {
        luckyFill.style.height = `${Math.max(0, Math.min(100, shadowPct))}%`;
      }
    } else {
      luckyHud.classList.add("hidden");
    }
  }

  const playerStatus = getEl("playerStatusIcons");
  if (playerStatus) {
    const statusOwner = isDuoMode() ? duoPlayers[0] : player;
    playerStatus.innerHTML = statusOwner ? statusIconsMarkup(statusOwner) : "";
  }
  rebuildEnemyDisplayNames();
  renderDuoPartner();
  renderQueuedPlayerActionIndicators();
  renderHelper();
  renderBossCard();
  renderEnemies();
  updateUI(
    player,
    enemies,
    level,
    bladeUpgrades,
    strengthenUpgrades,
    activePlayerHeader(),
    {
      showLucky: isPatrick(),
      showShadowCharge: isKostya(),
      showAbsorption: (player.ahp || 0) > 0,
      absorptionHp: player.ahp || 0,
      absorptionPct: player.maxAhp > 0 ? ((player.ahp || 0) / player.maxAhp) * 100 : 0,
      luckyCharges: player.luckyCharges,
      luckyCap: luckyChargeCapForLevel(level),
      shadowChargePct: getKostyaShadowChargePct(),
      slateskinDef: player.slateskinDef || 0
    }
  );
  renderDuoBattleCards();
}

function refreshUiAfterVisualPreload() {
  if (!gameStarted) return;
  refreshUI();
  if (!actionsLocked) renderCombatActions();
}

function runPlayerIdleAnimation(speedMs) {
  const img = getEl("playerSprite");
  if (!img) return null;
  const charKey = isDuoMode() ? duoCharacters[0] : selectedCharacter;
  let idx = 0;
  const initialFrames = idleFramesForCharacter(charKey, !isDuoMode() || activeDuoPlayer === 0);
  const firstUnit = isDuoMode() ? duoPlayers[0] : player;
  if (firstUnit && firstUnit.hp <= 0) {
    img.src = characterCollapsedSprite(charKey);
  } else {
    img.src = initialFrames[idx % initialFrames.length];
  }
  return setInterval(() => {
    if (playerAnimating && playerAnimatingSpriteId === "playerSprite") return;
    const currentUnit = isDuoMode() ? duoPlayers[0] : player;
    if (currentUnit && currentUnit.hp <= 0) {
      img.src = characterCollapsedSprite(charKey);
      return;
    }
    const frames = idleFramesForCharacter(charKey, !isDuoMode() || activeDuoPlayer === 0);
    idx = (idx + 1) % frames.length;
    img.src = frames[idx];
  }, speedMs);
}

function runHelperIdleAnimation(speedMs) {
  let helperIdx = 0;
  let shadowIdx = 0;
  return setInterval(() => {
    if (helper && !helper.animating) {
      const img = getEl("helperSprite");
      const frames = helper.idleFrames || playerSprites().idle;
      if (img && frames.length) {
        helperIdx = (helperIdx + 1) % frames.length;
        img.src = frames[helperIdx];
      }
    }
    const shadow = getKostyaShadow();
    if (shadow && !shadow.animating) {
      const shadowImg = getEl("shadowSprite");
      const frames = getCachedKostyaShadowIdleFrames();
      if (shadowImg && frames.length) {
        shadowIdx = (shadowIdx + 1) % frames.length;
        shadowImg.src = frames[shadowIdx];
      }
    }
  }, speedMs);
}

function runEnemyIdleAnimation(speedMs) {
  let idx = 0;
  return setInterval(() => {
    idx += 1;
    enemies.forEach((enemy) => {
      if (isFinalBoss(enemy)) return;
      if (enemy.animating) return;
      const set = enemySpriteSet(enemy);
      const img = getEl(`enemy-sprite-${enemy.id}`);
      if (!img) return;
      img.src = enemy.blocking ? set.block[0] : set.idle[idx % set.idle.length];
    });
  }, speedMs);
}

function startIdleAnimations() {
  if (playerIdleTimer) clearInterval(playerIdleTimer);
  if (helperIdleTimer) clearInterval(helperIdleTimer);
  if (enemyIdleTimer) clearInterval(enemyIdleTimer);
  if (duoIdleTimer) clearInterval(duoIdleTimer);
  stopBossFinalAnimations();
  stopPreservedFinalBossSceneAnimation();

  const baseIdleMs = 350;
  const playerIdleMs = Math.round(baseIdleMs / activeIdleSpeedMultiplier());
  playerIdleTimer = runPlayerIdleAnimation(scaleDuration(playerIdleMs));
  const helperIdleMs = isKostya() ? playerIdleMs : 340;
  helperIdleTimer = runHelperIdleAnimation(scaleDuration(helperIdleMs));
  duoIdleTimer = runDuoPartnerIdleAnimationUI({
    isDuoMode: () => isDuoMode(),
    duoCharacters,
    duoPlayers,
    playerSpriteIdForIndex,
    getEl,
    playerAnimating: () => playerAnimating,
    playerAnimatingSpriteId: () => playerAnimatingSpriteId,
    characterCollapsedSprite,
    idleFramesForCharacter,
    activeDuoPlayer: () => activeDuoPlayer
  }, scaleDuration(340));
  enemyIdleTimer = runEnemyIdleAnimation(scaleDuration(460));
  if (enemies.some((enemy) => isFinalBoss(enemy))) {
    void burgerOverlordDialoguePortrait("neutral");
    void burgerOverlordDialoguePortrait("enraged");
    void burgerOverlordDialoguePortrait("collapsed");
    void burgerOverlordDialoguePortrait("joy");
    void burgerOverlordDialoguePortrait("angry");
    preloadBossFinalVisuals({ sliceHorizontalSpriteSheet });
    const bossFinalIdleMs = Math.round(baseIdleMs / BURGER_OVERLORD_IDLE_SPEED_MULTIPLIER);
    startBossFinalAnimations(
      {
        getEnemies: () => enemies,
        getEl,
        enemySpriteSet
      },
      {
        idleMs: scaleDuration(bossFinalIdleMs),
        capeMs: scaleDuration(460)
      }
    );
  }
}

function stopIdleAnimations() {
  if (playerIdleTimer) clearInterval(playerIdleTimer);
  if (helperIdleTimer) clearInterval(helperIdleTimer);
  if (enemyIdleTimer) clearInterval(enemyIdleTimer);
  if (duoIdleTimer) clearInterval(duoIdleTimer);
  stopBossFinalAnimations();
  stopPreservedFinalBossSceneAnimation();
  playerIdleTimer = null;
  helperIdleTimer = null;
  enemyIdleTimer = null;
  duoIdleTimer = null;
}

function playFramesById(imgId, frames, speedMs = 110) {
  return new Promise((resolve) => {
    const img = getEl(imgId);
    if (!img || !frames.length) {
      resolve();
      return;
    }
    let idx = 0;
    img.src = frames[idx];
    const actualSpeedMs = scaleDuration(speedMs);
    const timer = setInterval(() => {
      idx += 1;
      if (idx >= frames.length) {
        clearInterval(timer);
        resolve();
        return;
      }
      img.src = frames[idx];
    }, actualSpeedMs);
  });
}

function startSpriteLoop(imgId, frames, speedMs = 110) {
  const img = getEl(imgId);
  if (!img || !Array.isArray(frames) || !frames.length) return () => {};
  let idx = 0;
  img.src = frames[idx];
  const actualSpeedMs = scaleDuration(speedMs);
  const timer = setInterval(() => {
    idx = (idx + 1) % frames.length;
    img.src = frames[idx];
  }, actualSpeedMs);
  return () => {
    clearInterval(timer);
  };
}

async function playEnemyFrames(enemy, frames, speedMs = 110) {
  enemy.animating = true;
  await playFramesById(`enemy-sprite-${enemy.id}`, frames, speedMs);
  enemy.animating = false;
}

async function playHelperFrames(frames, speedMs = 110) {
  if (!helper) return;
  helper.animating = true;
  await playFramesById("helperSprite", frames, speedMs);
  if (helper) helper.animating = false;
}

async function playPlayerFrames(frames, speedMs = 110) {
  playerAnimating = true;
  playerAnimatingSpriteId = activePlayerSpriteId();
  await playFramesById(playerAnimatingSpriteId, frames, speedMs);
  playerAnimating = false;
  playerAnimatingSpriteId = "";
}

async function animatePlayerAttack() {
  await playPlayerFrames(playerSprites().attack, 100);
}

async function animatePlayerHeal() {
  await playPlayerFrames(playerSprites().heal, 130);
}

async function animatePlayerDamaged() {
  await playPlayerFrames(playerSprites().damaged, 120);
}

async function animatePlayerDefend() {
  await playPlayerFrames(playerSprites().defend, 120);
}

async function animatePlayerParry() {
  await playPlayerFrames(playerSprites().parry, 90);
}

async function animateHelperAttack() {
  await playHelperFrames(playerSprites().attack, 100);
}

async function animateHelperHeal() {
  await playHelperFrames(playerSprites().heal, 120);
}

async function animateHelperDefend() {
  await playHelperFrames(playerSprites().defend, 110);
}

async function animateHelperDamaged() {
  await playHelperFrames(playerSprites().damaged, 110);
}

function spriteIdFromCharacterEntityId(targetId) {
  if (targetId === "playerChar") return "playerSprite";
  const m = /^allyPartnerChar-(\d+)$/.exec(targetId || "");
  if (m) return `allyPartnerSprite-${m[1]}`;
  return "playerSprite";
}

async function animateTargetPlayerDamaged(targetId, characterKey) {
  const sprites = characterSprites(characterKey);
  await playFramesById(spriteIdFromCharacterEntityId(targetId), sprites.damaged, 120);
}

async function animateTargetPlayerParry(targetId, characterKey) {
  if (characterKey === "kostya") {
    const spriteId = spriteIdFromCharacterEntityId(targetId);
    const frames = await getKostyaParryFrames({ sliceHorizontalSpriteSheet });
    const counterFx = await getKostyaCounterFxFrame();
    const anim = playFramesById(spriteId, frames, 90);
    spawnKostyaSlashFx(spriteId, "counter", counterFx, true);
    await anim;
    return;
  }
  const sprites = characterSprites(characterKey);
  await playFramesById(spriteIdFromCharacterEntityId(targetId), sprites.parry, 90);
}

async function animateTargetPlayerDodge(targetId, characterKey) {
  const spriteId = spriteIdFromCharacterEntityId(targetId);
  if (characterKey === "patrick") {
    const sheetFrames = await getPatrickDodgeFrames({ sliceHorizontalSpriteSheet });
    const frames = sheetFrames.length ? [...sheetFrames, sheetFrames[sheetFrames.length - 1]] : [PATRICK_SPRITES.base, PATRICK_SPRITES.base];
    await playFramesById(spriteId, frames, 70);
    return;
  }
  if (characterKey === "kostya") {
    const frames = await getKostyaParryFrames({ sliceHorizontalSpriteSheet });
    const counterFx = await getKostyaCounterFxFrame();
    const anim = playFramesById(spriteId, frames, 90);
    spawnKostyaSlashFx(spriteId, "counter", counterFx, true);
    await anim;
    return;
  }
  const sprites = characterSprites(characterKey);
  await playFramesById(spriteId, sprites.idle, 90);
}

function setActionHint(text, playerIndex = null) {
  const hint = getEl("targetHint");
  if (!hint) return;
  hint.classList.remove("target-hint-p1", "target-hint-p2", "target-hint-p3");
  if (!text) {
    hint.innerText = "";
    hint.classList.add("hidden");
    return;
  }
  const resolvedPlayerIndex = Number.isInteger(playerIndex)
    ? playerIndex
    : (isDuoMode() ? activeDuoPlayer : null);
  if (resolvedPlayerIndex === 0) hint.classList.add("target-hint-p1");
  else if (resolvedPlayerIndex === 1) hint.classList.add("target-hint-p2");
  else if (resolvedPlayerIndex === 2) hint.classList.add("target-hint-p3");
  hint.innerText = text;
  hint.classList.remove("hidden");
}

function positionSkillCheckBelow(targetId) {
  const skill = getEl("skillCheck");
  const target = getEl(targetId);
  if (!skill || !target) return;

  const rect = target.getBoundingClientRect();
  const width = skill.getBoundingClientRect().width || 320;
  const left = rect.left + rect.width / 2 - width / 2;
  const clampedLeft = Math.max(10, Math.min(window.innerWidth - width - 10, left));
  const top = Math.min(window.innerHeight - 64, rect.bottom + 8);

  skill.style.left = `${Math.round(clampedLeft)}px`;
  skill.style.top = `${Math.round(top)}px`;
}

async function dashToward(attackerId, targetId, durationMs = 340, retreat = true) {
  const attacker = getEl(attackerId);
  const target = getEl(targetId);
  if (!attacker || !target) return;
  const finalBossMatch = /^enemy-entity-(\d+)$/.exec(attackerId || "");
  const finalBossEnemy = finalBossMatch
    ? enemies.find((enemy) => enemy.id === Number(finalBossMatch[1]) && isFinalBoss(enemy))
    : null;

  const a = attacker.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const tx = t.left + t.width / 2;
  const ty = t.top + t.height / 2;
  const dx = tx - ax;
  const dy = ty - ay;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return;

  const gap = 56;
  const contactDistance = a.width / 2 + t.width / 2 + gap;
  const moveDistance = Math.max(0, dist - contactDistance);
  const ratio = moveDistance / dist;
  const moveX = dx * ratio;
  const moveY = dy * ratio;
  const dashSpeedPxPerSecond = 760;
  const fallbackDurationMs = Math.max(220, durationMs);
  const computedDurationMs = Math.max(
    160,
    Math.round((moveDistance / dashSpeedPxPerSecond) * 1000) || fallbackDurationMs
  );

  attacker.dataset.lastDashDurationMs = String(computedDurationMs);
  const actualDurationMs = scaleDuration(computedDurationMs);
  const walkFrames = finalBossEnemy
    ? await getBossFinalWalkFrames(isFinalBossPart2(finalBossEnemy) ? 2 : 1)
    : null;
  const stopWalkLoop = finalBossEnemy
    ? startSpriteLoop(
      `enemy-sprite-${finalBossEnemy.id}`,
      walkFrames,
      120
    )
    : null;
  attacker.style.transition = `transform ${actualDurationMs}ms linear`;
  attacker.style.transform = `translate(${moveX}px, ${moveY}px)`;
  await sleep(computedDurationMs);

  if (!retreat) {
    if (typeof stopWalkLoop === "function") stopWalkLoop();
    return;
  }

  attacker.style.transform = "translate(0, 0)";
  await sleep(computedDurationMs);
  if (typeof stopWalkLoop === "function") stopWalkLoop();
  attacker.style.transition = "";
  delete attacker.dataset.lastDashDurationMs;
}

async function dashBack(attackerId, durationMs = 260) {
  const attacker = getEl(attackerId);
  if (!attacker) return;
  const finalBossMatch = /^enemy-entity-(\d+)$/.exec(attackerId || "");
  const finalBossEnemy = finalBossMatch
    ? enemies.find((enemy) => enemy.id === Number(finalBossMatch[1]) && isFinalBoss(enemy))
    : null;
  const fallbackDurationMs = Math.max(180, durationMs);
  const lastDashDurationMs = Number(attacker.dataset.lastDashDurationMs || 0);
  const computedDurationMs = Math.max(fallbackDurationMs, lastDashDurationMs || 0);
  const actualDurationMs = scaleDuration(computedDurationMs);
  const walkFrames = finalBossEnemy
    ? await getBossFinalWalkFrames(isFinalBossPart2(finalBossEnemy) ? 2 : 1)
    : null;
  const stopWalkLoop = finalBossEnemy
    ? startSpriteLoop(
      `enemy-sprite-${finalBossEnemy.id}`,
      walkFrames,
      120
    )
    : null;
  attacker.style.transition = `transform ${actualDurationMs}ms linear`;
  attacker.style.transform = "translate(0, 0)";
  await sleep(computedDurationMs);
  if (typeof stopWalkLoop === "function") stopWalkLoop();
  attacker.style.transition = "";
  delete attacker.dataset.lastDashDurationMs;
}

function canShowSummonButton() {
  return helperUnlocked && !isPatrick();
}

function healthInsuranceBonusTier() {
  return Math.max(0, Math.floor((Math.max(1, level) - 1) / 10));
}

function healthInsuranceHealAmountForLevel() {
  return PATRICK_ABILITIES.healthInsurance.healAmount + healthInsuranceBonusTier() * 5;
}

function healthInsuranceRegenPowerForLevel() {
  return PATRICK_ABILITIES.healthInsurance.regenPower + healthInsuranceBonusTier();
}

function healthInsuranceRegenTurnsForLevel() {
  return PATRICK_ABILITIES.healthInsurance.regenTurns;
}

function onPlayerUnitDamaged(unit, characterKey, damage) {
  if (!unit || damage <= 0) return;
  if (hasStatus(unit, "regen")) {
    clearStatus(unit, "regen");
    addLog(`${displayCharacterName(characterKey || "player")}'s Regeneration was interrupted.`, "attack-yellow");
  }
  if (characterKey !== "patrick") return;
  if (!unit.patrickHealthInsuranceActive) return;
  unit.patrickHealthInsuranceActive = false;
  addLog("Patrick's Health Insurance was interrupted.", "attack-yellow");
}

function patrickDodgeSpGain(unit, result) {
  if (!unit || (result !== "good" && result !== "great")) return 0;
  const weaknessBonus = hasStatus(unit, "weakness") ? statusPower(unit, "weakness") : 0;
  const spGain = Math.max(0, weaknessBonus * 2);
  unit.sp = Math.min(unit.maxSp || 0, (unit.sp || 0) + spGain);
  addPatrickHiddenLuckyChargeProgress(unit, weaknessBonus * 0.2);
  return spGain;
}

function abilityButtonHtml({ id, icon, name, charges = 0, sp = 0, hp = 0, sc = 0, scGain = 0 }) {
  const parts = [];
  if (charges > 0) {
    parts.push(
      `<img class="ability-cost-icon" src="${PATRICK_SPRITES.luckyChargeIcon}" alt="Lucky Charge"> ${charges}`
    );
  }
  if (sp > 0) parts.push(`${sp} SP`);
  if (hp > 0) parts.push(`${hp} HP`);
  if (sc > 0) {
    parts.push(
      `<img class="ability-cost-icon" src="${KOSTYA_SPRITES.shadowCharges || KOSTYA_SPRITES.shadow}" alt="Shadow Charge"> ${sc}%`
    );
  }
  if (scGain > 0) {
    parts.push(
      `<img class="ability-cost-icon" src="${KOSTYA_SPRITES.shadowCharges || KOSTYA_SPRITES.shadow}" alt="Shadow Charge"> +${scGain}%`
    );
  }
  const costText = parts.join(" | ");
  const iconHtml = icon
    ? `<img class="ability-icon" src="${icon}" alt="${name} ability">`
    : `<div class="ability-icon ability-icon-empty" aria-hidden="true"></div>`;
  return (
    `<button id="${id}" class="ability-btn">` +
    iconHtml +
    `<div class="ability-name">${name}</div>` +
    `<div class="ability-cost">${costText}</div>` +
    `</button>`
  );
}

function setAbilityLocked(button, locked) {
  if (!button) return;
  if (locked) button.classList.add("ability-locked");
  else button.classList.remove("ability-locked");
}

function clearCombatActions() {
  const actions = getEl("actions");
  if (!actions) return;
  actions.innerHTML = "";
}

function currentInventoryUnit() {
  return isDuoMode() ? duoPlayers[activeDuoPlayer] : player;
}

function inventoryForUnit(unit) {
  if (!unit) return [];
  if (!Array.isArray(unit.inventory)) unit.inventory = [];
  return unit.inventory;
}

function partyInventoryUnits() {
  if (isDuoMode()) return duoPlayers.filter(Boolean);
  return player ? [player] : [];
}

function unitHasInventoryItem(unit, itemKey) {
  return inventoryForUnit(unit).some((item) => item?.key === itemKey);
}

function partyHasInventoryItem(itemKey) {
  return partyInventoryUnits().some((unit) => unitHasInventoryItem(unit, itemKey));
}

function currentInventoryItems() {
  return inventoryForUnit(currentInventoryUnit());
}

function createInventoryItem(templateKey) {
  const template = ITEM_TEMPLATES[templateKey];
  if (!template) return null;
  return {
    id: `item${nextInventoryItemId++}`,
    key: template.key,
    name: template.name,
    description: template.description,
    icon: ACTION_ICONS[template.iconKey] || "",
    iconKey: template.iconKey
  };
}

function ownerUnitForAttacker(attacker) {
  if (!attacker) return currentInventoryUnit();
  if (attacker === player) return player;
  if (isDuoMode()) {
    const directIdx = duoPlayers.findIndex((unit) => unit === attacker);
    if (directIdx >= 0) return duoPlayers[directIdx];
    if (attacker === helper) {
      const jacobIdx = duoCharacters.findIndex((key) => key === "player");
      if (jacobIdx >= 0) return duoPlayers[jacobIdx];
    }
    if (attacker?.isShadow) {
      const kostyaIdx = duoCharacters.findIndex((key) => key === "kostya");
      if (kostyaIdx >= 0) return duoPlayers[kostyaIdx];
    }
  } else {
    if (attacker === helper || attacker?.isShadow) return player;
  }
  return attacker?.isPlayer ? attacker : currentInventoryUnit();
}

function rollDroppedItemKey() {
  const templates = Object.values(ITEM_TEMPLATES);
  const totalChance = templates.reduce((sum, item) => sum + item.dropChance, 0);
  let roll = Math.random();
  if (roll >= totalChance) return null;
  for (const template of templates) {
    if (roll < template.dropChance) return template.key;
    roll -= template.dropChance;
  }
  return null;
}

function awardDroppedItem(enemy, ownerUnit) {
  if (!enemy || !ownerUnit) return;
  const itemKey = rollDroppedItemKey();
  if (!itemKey) return;
  const inventory = inventoryForUnit(ownerUnit);
  const template = ITEM_TEMPLATES[itemKey];
  if (inventory.length >= INVENTORY_CAPACITY) {
    addLog(`${displayCharacterName(ownerUnit.characterKey || selectedCharacter || "player")} could not carry ${template.name}.`, "attack-yellow");
    return;
  }
  const item = createInventoryItem(itemKey);
  if (!item) return;
  inventory.push(item);
}

function grantDebugItem(itemKey, unit = currentInventoryUnit()) {
  if (!unit) return false;
  const inventory = inventoryForUnit(unit);
  if (inventory.length >= INVENTORY_CAPACITY) {
    addLog(`${displayCharacterName(unit.characterKey || selectedCharacter || "player")} cannot carry more items.`, "attack-yellow");
    return false;
  }
  const item = createInventoryItem(itemKey);
  if (!item) return false;
  inventory.push(item);
  refreshUI();
  if (!actionsLocked) renderCombatActions();
  return true;
}

function slateskinDefense(unit) {
  return Math.max(0, Math.floor(unit?.slateskinDef || 0));
}

function hasSlateskin(unit) {
  return slateskinDefense(unit) > 0;
}

function slateskinRecoveryRatio(unit) {
  const sdef = slateskinDefense(unit);
  if (sdef <= 0) return 1;
  if (sdef >= 20) return 0;
  return (20 - sdef) / 20;
}

function slateskinGreenWidth(unit, baseGreenWidth) {
  const safeBase = Math.max(0, Number(baseGreenWidth) || 0);
  const sdef = slateskinDefense(unit);
  if (sdef > 20) return 0;
  if (sdef <= 0) return safeBase;
  const recovery = slateskinRecoveryRatio(unit);
  return safeBase * (0.35 + (0.65 * recovery));
}

function lowerSlateskin(unit, amount, reason = "") {
  if (!unit || !hasSlateskin(unit)) return;
  const nextValue = Math.max(0, slateskinDefense(unit) - Math.max(0, amount));
  unit.slateskinDef = nextValue;
  if (nextValue <= 0) {
    unit.slateskinDef = 0;
    unit.slateskinTurns = 0;
    if (reason) addLog(`${displayCharacterName(unit.characterKey || selectedCharacter || "player")}'s Slateskin faded.`, "attack-yellow");
  }
}

function tickSlateskin(unit) {
  if (!unit || !hasSlateskin(unit)) return;
  lowerSlateskin(unit, 4, "turn");
}

function slateskinYellowExtra(baseYellowExtra = 0.12) {
  const safeBase = Math.max(0, Number(baseYellowExtra) || 0);
  return safeBase * 0.75;
}

function slateskinScaledYellowExtra(unit, baseYellowExtra = 0.12) {
  if (!hasSlateskin(unit)) return baseYellowExtra;
  const recovery = slateskinRecoveryRatio(unit);
  return baseYellowExtra * (0.75 + (0.25 * recovery));
}

function slateskinHoldFillDuration(unit, baseDuration = 900) {
  if (!hasSlateskin(unit)) return baseDuration;
  const recovery = slateskinRecoveryRatio(unit);
  const speedMultiplier = 1.25 - (0.25 * recovery);
  return baseDuration / speedMultiplier;
}

function applySlateskinDodgeWear(unit, dodgeReason) {
  if (!hasSlateskin(unit)) return;
  lowerSlateskin(unit, dodgeReason === "yellow" ? 4 : 8, "dodge");
}

function stripBadStatuses(unit) {
  BAD_STATUS_KEYS.forEach((key) => clearStatus(unit, key));
}

function inventoryItemButtonHtml(item, selected = false) {
  const actionHtml = selected
    ? (
      `<div class="inventory-item-actions">` +
      `<div class="inventory-item-action inventory-item-action-use">Use</div>` +
      `<div class="inventory-item-action inventory-item-action-danger">Remove</div>` +
      `</div>`
    )
    : "";
  const iconHtml = item.icon
    ? `<img class="ability-icon" src="${item.icon}" alt="${item.name} item">`
    : `<div class="ability-icon ability-icon-empty" aria-hidden="true"></div>`;
  return (
    `<button id="${item.id}" class="ability-btn inventory-item-btn${selected ? " inventory-item-btn-open" : ""}">` +
    iconHtml +
    `<div class="ability-name">${item.name}</div>` +
    `<div class="ability-cost"></div>` +
    actionHtml +
    `</button>`
  );
}

function inventoryActionHint() {
  return "Open your inventory.";
}

function inventoryCloseHint() {
  return "Close your inventory.";
}

function closeInventoryView() {
  actionPanelView = "actions";
  selectedInventoryItemId = "";
  setQueuedActionPreview(null);
}

function openInventoryView() {
  actionPanelView = "inventory";
  setQueuedActionPreview(null);
  renderCombatActions();
}

function inventoryButtonHtml() {
  return abilityButtonHtml({
    id: INVENTORY_ACTION_ID,
    icon: ACTION_ICONS.inventory || "",
    name: "Inventory"
  });
}

function inventoryCloseButtonHtml() {
  return abilityButtonHtml({
    id: INVENTORY_CLOSE_ACTION_ID,
    icon: ACTION_ICONS.inventoryClose || "",
    name: "Close"
  });
}

function appendInventoryActionButton() {
  const actions = getEl("actions");
  if (!actions || actions.querySelector(`#${INVENTORY_ACTION_ID}`)) return;
  actions.insertAdjacentHTML("beforeend", inventoryButtonHtml());
  const button = getEl(INVENTORY_ACTION_ID);
  if (!button) return;
  button.onclick = () => {
    openInventoryView();
  };
  bindActionButtonHint(button, inventoryActionHint());
  updateAbilityGridScale();
  syncActionSelection();
}

function renderInventoryActions() {
  const actions = getEl("actions");
  if (!actions) return;
  const inventoryItems = currentInventoryItems();
  const itemButtons = inventoryItems
    .slice(0, INVENTORY_CAPACITY)
    .map((item) => inventoryItemButtonHtml(item, selectedInventoryItemId === item.id));
  actions.innerHTML = [inventoryCloseButtonHtml(), ...itemButtons].join("");
  actions.onclick = (event) => {
    if (event.target === actions) {
      selectedInventoryItemId = "";
      renderInventoryActions();
    }
  };

  const closeButton = getEl(INVENTORY_CLOSE_ACTION_ID);
  if (closeButton) {
    closeButton.onclick = () => {
      closeInventoryView();
      renderCombatActions();
    };
    bindActionButtonHint(closeButton, inventoryCloseHint());
  }

  inventoryItems.slice(0, INVENTORY_CAPACITY).forEach((item) => {
    const button = getEl(item.id);
    if (!button) return;
    button.onclick = (event) => {
      hideActionTooltip();
      clearInlineActionHint();
      if (selectedInventoryItemId === item.id) {
        const rect = button.getBoundingClientRect();
        const offsetY = event.clientY - rect.top;
        if (offsetY <= rect.height * 0.5) {
          void useInventoryItem(item.id);
          return;
        }
        const inventory = currentInventoryItems();
        const index = inventory.findIndex((entry) => entry.id === item.id);
        if (index >= 0) inventory.splice(index, 1);
        selectedInventoryItemId = "";
      } else {
        selectedInventoryItemId = item.id;
      }
      renderInventoryActions();
    };
    bindActionButtonHint(button, item.description || "No item effect assigned yet.");
  });

  updateAbilityGridScale();
  resetActionSelection();
}

async function executeInventoryItem(itemId, ownerUnit) {
  const inventory = inventoryForUnit(ownerUnit);
  const index = inventory.findIndex((item) => item.id === itemId);
  if (index < 0) return;
  const [item] = inventory.splice(index, 1);
  if (!item) return;
  selectedInventoryItemId = "";
  closeInventoryView();

  if (item.key === "salad") {
    playSfx("eating", 0.62, 0.45);
    ownerUnit.hp = Math.min(ownerUnit.maxHp, ownerUnit.hp + 10);
    stripBadStatuses(ownerUnit);
    logCombatUse(displayCharacterName(ownerUnit.characterKey || selectedCharacter || "player"), "Salad");
  } else if (item.key === "bomb") {
    playSfx("boom", 0.68);
    const living = enemies.filter((enemy) => enemy.hp > 0);
    const perEnemy = living.length ? Math.ceil(50 / living.length) : 0;
    logCombatUse(displayCharacterName(ownerUnit.characterKey || selectedCharacter || "player"), "Bomb");
    for (const enemy of living) {
      await applyDamageToEnemy(enemy, perEnemy, true, ownerUnit, { ignoreResistance: true });
      applyStatus(enemy, "stunned", 3, 3);
    }
  } else if (item.key === "cherry") {
    playSfx("eating", 0.62, 0.45);
    applyStatus(ownerUnit, "strenght", 10, 1);
    logCombatUse(displayCharacterName(ownerUnit.characterKey || selectedCharacter || "player"), "Cherry");
  } else if (item.key === "healingPotion") {
    playSfx("drinking", 0.62);
    ownerUnit.hp = Math.min(ownerUnit.maxHp, ownerUnit.hp + 10);
    applyStatus(ownerUnit, "regen", 5, 8);
    logCombatUse(displayCharacterName(ownerUnit.characterKey || selectedCharacter || "player"), "Healing Potion");
  } else if (item.key === "slateskinPotion") {
    playSfx("drinking", 0.62);
    ownerUnit.slateskinDef = 60;
    ownerUnit.slateskinTurns = 1;
    logCombatUse(displayCharacterName(ownerUnit.characterKey || selectedCharacter || "player"), "Slateskin Potion");
  }

  refreshUI();
  await resolvePostPlayerAction();
}

async function useInventoryItem(itemId) {
  const ownerUnit = currentInventoryUnit();
  const item = inventoryForUnit(ownerUnit).find((entry) => entry.id === itemId);
  if (!ownerUnit || !item || actionsLocked) return;
  setQueuedActionPreview(item);
  if (queuePlayerTurnAction?.({
    execute: () => executeInventoryItem(itemId, ownerUnit),
    display: {
      name: item.name,
      icon: item.icon || "",
      playerIndex: isDuoMode() ? activeDuoPlayer : null
    }
  })) {
    selectedInventoryItemId = "";
    closeInventoryView();
    return;
  }
  setActionsLocked(true);
  await executeInventoryItem(itemId, ownerUnit);
}

function disableRenderedCombatActions() {
  const actions = getEl("actions");
  if (!actions) return;
  actions.querySelectorAll("button").forEach((button) => {
    if (button instanceof HTMLButtonElement) button.disabled = true;
  });
}

function usesQueuedPlayerRounds() {
  return isDuoMode();
}

function buildRoundActionOrder(actionCounts) {
  const remaining = [...actionCounts];
  const order = [];

  let added = true;
  while (added) {
    added = false;
    for (let idx = 0; idx < remaining.length; idx += 1) {
      if (remaining[idx] <= 0) continue;
      order.push(idx);
      remaining[idx] -= 1;
      added = true;
    }
  }

  return order;
}

function buildQueuedPlayerTurnOrder() {
  const actionCounts = duoPlayers.map((unit, idx) => {
    if (!unit || unit.hp <= 0) return 0;
    const actions = claimEntityActionsForTurn(unit);
    if (actions <= 0) maybeSkipTurnFromSlowness(unit, displayCharacterName(duoCharacters[idx] || "player"));
    return actions;
  });
  return buildRoundActionOrder(actionCounts);
}

function resetQueuedPlayerTurnState(actionOrder = []) {
  queuedPlayerTurnOrder = [...actionOrder];
  queuedPlayerTurnPlans = new Array(queuedPlayerTurnOrder.length).fill(null);
  queuedPlayerTurnPlanningIndex = -1;
  queuedPlayerTurnExecutionIndex = -1;
  queuedPlayerTurnExecuting = false;
  queuedActionPreview = null;
  syncTopUiState();
}

function createQueuedTurnPlan(execute, display = null) {
  return {
    execute,
    display: display && display.name
      ? {
        name: display.name,
        icon: display.icon || "",
        playerIndex: Number.isInteger(display.playerIndex) ? display.playerIndex : null
      }
      : null
  };
}

function queuedPlanAt(roundIndex) {
  const plan = queuedPlayerTurnPlans[roundIndex];
  if (!plan || plan === SKIPPED_PLAYER_TURN_PLAN) return null;
  if (typeof plan === "function") return createQueuedTurnPlan(plan);
  return typeof plan.execute === "function" ? plan : null;
}

function renderQueuedPlayerActionIndicators() {
  for (let playerIndex = 0; playerIndex < Math.max(1, duoPlayers.length); playerIndex += 1) {
    const indicator = getEl(queuedActionIdForPlayerIndex(playerIndex));
    if (!indicator) continue;
    if (!isDuoMode()) {
      indicator.innerHTML = "";
      indicator.classList.add("hidden");
      continue;
    }
    const plan = queuedPlayerTurnOrder.reduce((found, queuedIndex, orderIndex) => {
      if (found || queuedIndex !== playerIndex) return found;
      return queuedPlanAt(orderIndex);
    }, null);
    const display = plan?.display;
    if (!display?.name) {
      indicator.innerHTML = "";
      indicator.classList.add("hidden");
      continue;
    }
    const iconHtml = display.icon
      ? `<img class="queued-action-icon" src="${display.icon}" alt="">`
      : `<div class="queued-action-icon queued-action-icon-empty" aria-hidden="true"></div>`;
    indicator.innerHTML = `${iconHtml}<span class="queued-action-name">${display.name}</span>`;
    indicator.classList.remove("hidden");
  }
}

function ensureQueuedPlayerTurnState() {
  if (!usesQueuedPlayerRounds()) return;
  if (queuedPlayerTurnPlans.length !== queuedPlayerTurnOrder.length) {
    resetQueuedPlayerTurnState(buildQueuedPlayerTurnOrder());
  }
}

function isLivingRoundPlayerIndex(playerIndex) {
  if (!usesQueuedPlayerRounds()) return false;
  const unit = duoPlayers[playerIndex];
  return !!unit && unit.hp > 0;
}

function nextPlannablePlayerIndex(afterIndex = -1) {
  ensureQueuedPlayerTurnState();
  for (let idx = afterIndex + 1; idx < queuedPlayerTurnOrder.length; idx += 1) {
    const playerIndex = queuedPlayerTurnOrder[idx];
    if (!isLivingRoundPlayerIndex(playerIndex)) continue;
    const unit = duoPlayers[playerIndex];
    if (unit && maybeSkipTurnFromStun(unit, displayCharacterName(duoCharacters[playerIndex]))) {
      queuedPlayerTurnPlans[idx] = SKIPPED_PLAYER_TURN_PLAN;
      continue;
    }
    if (queuedPlayerTurnPlans[idx] == null) return idx;
  }
  return -1;
}

function nextQueuedExecutionPlayerIndex(afterIndex = -1) {
  ensureQueuedPlayerTurnState();
  for (let idx = afterIndex + 1; idx < queuedPlayerTurnOrder.length; idx += 1) {
    if (typeof queuedPlanAt(idx)?.execute === "function") return idx;
  }
  return -1;
}

async function finishQueuedPlayerRound() {
  clearEnemyBlocksForNextRound();
  refreshUI();
  clearCombatActions();

  await helperAct();
  if (!enemies.length) {
    await sleep(250);
    await handleLevelClear();
    return;
  }

  startIdleAnimations();
  await sleep(TURN_TRANSITION_MS);

  const enemyResult = await enemyPhase();
  if (!enemyResult.playerDied && !enemyResult.levelCleared) {
    if (isDuoMode()) switchToDuoPlayer(0, true);
    await beginPlayerTurn();
  }
}

async function runNextQueuedPlayerTurn() {
  const nextIndex = nextQueuedExecutionPlayerIndex(queuedPlayerTurnExecutionIndex);
  if (nextIndex < 0) {
    resetQueuedPlayerTurnState();
    await finishQueuedPlayerRound();
    return;
  }

  queuedPlayerTurnExecutionIndex = nextIndex;
  switchToDuoPlayer(queuedPlayerTurnOrder[nextIndex], true);
  refreshUI();
  renderCombatActions();
  disableRenderedCombatActions();
  const plannedAction = queuedPlanAt(nextIndex);
  if (typeof plannedAction?.execute === "function") {
    await plannedAction.execute();
  }
}

function queuePlayerTurnAction(action) {
  if (!usesQueuedPlayerRounds() || queuedPlayerTurnExecuting) return false;
  ensureQueuedPlayerTurnState();
  const currentPlanningIndex = queuedPlayerTurnPlanningIndex >= 0
    ? queuedPlayerTurnPlanningIndex
    : nextPlannablePlayerIndex(-1);
  if (currentPlanningIndex < 0) return false;

  const queuedPlan = typeof action === "function"
    ? createQueuedTurnPlan(action, queuedActionPreview)
    : action;
  queuedActionPreview = null;
  if (!queuedPlan || typeof queuedPlan.execute !== "function") return false;
  queuedPlayerTurnPlans[currentPlanningIndex] = queuedPlan;
  const nextIndex = nextPlannablePlayerIndex(currentPlanningIndex);
  if (nextIndex >= 0) {
    queuedPlayerTurnPlanningIndex = nextIndex;
    switchToDuoPlayer(queuedPlayerTurnOrder[nextIndex], true);
    refreshUI();
    renderCombatActions();
    return true;
  }

  queuedPlayerTurnExecuting = true;
  queuedPlayerTurnPlanningIndex = -1;
  syncTopUiState();
  clearCombatActions();
  void runNextQueuedPlayerTurn();
  return true;
}

function renderCombatActions() {
  if (actionPanelView === "inventory") {
    renderInventoryActions();
    return;
  }
  if (isPatrick()) {
    try {
      renderPatrickCombatActions({
        getEl,
        getPlayer: () => player,
        getEnemies: () => enemies,
        abilityButtonHtml,
        setAbilityLocked,
        bindActionButtonHint,
        updateAbilityGridScale,
        resetActionSelection,
        chooseAllyTarget,
        chooseEnemyTarget,
        chooseEnemyTargets,
        isDuoMode: () => isDuoMode(),
        duoPlayers,
        getHelper: () => helper,
        getShadow: () => getKostyaShadow(),
        enemyLabel,
        frontEnemy: () => frontEnemy(),
      applyDamageToEnemy,
      setPlayerSkillFeedback,
      playSfx,
        pingPongFrames,
        playPlayerFrames,
        animatePlayerHeal,
        activePlayerSpriteId,
        setPlayerAnimating: setPlayerAnimatingState,
        positionSkillCheckBelow,
        runSkillCheck,
        runMashSkillCheck,
        addLuckyCharges,
        spendLuckyCharges,
        luckyChargeCapForLevel,
        healthInsuranceHealAmountForLevel,
        healthInsuranceRegenPowerForLevel,
        healthInsuranceRegenTurnsForLevel,
        applyStatus,
        statusPower,
        hasStatus,
        clearStatus,
        statusPowerCap: STATUS_POWER_CAP,
        badStatusKeys: BAD_STATUS_KEYS,
        toRoman,
        addLog,
        logCombatUse,
        logCombatCast,
        logCombatSummon,
        logCombatDodged,
        logCombatPartialDodge,
        logCombatCounter,
        logCombatParry,
        patrickDodgeSpGain,
        resolvePostPlayerAction,
        renderCombatActions,
        refreshUI,
        startIdleAnimations,
        clampLuckyChargesToCap,
        queuePlayerTurnAction,
        setQueuedActionPreview,
        getActiveDuoPlayer: () => activeDuoPlayer,
        isPatrick: () => isPatrick(),
        isActionsLocked: () => actionsLocked,
        setActionsLocked,
        getLevel: () => level,
        sleep,
        sliceHorizontalSpriteSheet,
        playerSprites,
        isPlayerAnimating: () => playerAnimating
      });
    } catch (err) {
      console.error("Patrick render error:", err);
      addLog("Patrick action UI failed to render.", "fatal-red");
    }
    appendInventoryActionButton();
    return;
  }

  if (isKostya()) {
    renderKostyaCombatActions({
      getEl,
      getPlayer: () => player,
      abilityButtonHtml,
      setAbilityLocked,
      bindActionButtonHint,
      updateAbilityGridScale,
      resetActionSelection,
      frontEnemy: () => frontEnemy(),
      chooseEnemyTarget,
      isActionsLocked: () => actionsLocked,
      setActionsLocked,
      setPlayerSkillFeedback,
      playSfx,
      dashToward,
      positionSkillCheckBelow,
      runSkillCheck,
      animatePlayerAttack,
      dashBack,
      applyDamageToEnemy,
      shadowChargeMultiplierForTarget,
      hasKostyaInParty: () => hasKostyaInParty(),
      resolvePostPlayerAction,
      activePlayerCharId,
      activePlayerSpriteId,
      getEnemies: () => enemies,
      enemyLabel,
      addLog,
      logCombatUse,
      logCombatCast,
      logCombatSummon,
      logCombatDodged,
      logCombatPartialDodge,
      logCombatCounter,
      logCombatParry,
      refreshUI,
      animateSummonArrival,
      startIdleAnimations,
      renderCombatActions,
      isDecaying,
      applyStatus,
      statusPowerCap: STATUS_POWER_CAP,
      getLevel: () => level,
      getKostyaUnit,
      healKostyaFromShadowShpLoss: (shpLost) => convertKostyaShadowShpLossToHeal(shpLost, getKostyaUnit()),
      queuePlayerTurnAction,
      setQueuedActionPreview,
      getActiveDuoPlayer: () => activeDuoPlayer,
      playFramesById,
      startSpriteLoop,
      setPlayerAnimating: setPlayerAnimatingState,
      isKostya: () => isKostya(),
      ensureStatuses
    });
    appendInventoryActionButton();
    return;
  }

  renderJacobCombatActions({
    getEl,
    getPlayer: () => player,
    getHelper: () => helper,
    frontEnemy: () => frontEnemy(),
    abilityButtonHtml,
    setAbilityLocked,
    setQueuedActionPreview,
    updateAbilityGridScale,
    resetActionSelection,
    canShowSummonButton: () => canShowSummonButton() && helperCanSummonThisLevel,
    playerAttack,
    playerPiercer,
    playerSwing,
    playerDefend,
    summonHelper
  });
  appendInventoryActionButton();
}

async function chooseEnemyTarget(abilityName = "Revolver") {
  const choices = enemies
    .map((enemy) => ({ enemy, el: getEl(`enemy-entity-${enemy.id}`) }))
    .filter((entry) => !!entry.el);
  if (!choices.length) return null;

  setTargetSelectionActive(true);
  setActionHint(`Choose your enemy target for ${abilityName}. Press Shift to cancel.`);

  return new Promise((resolve) => {
    const cleanups = [];
    let finished = false;
    let selected = -1;
    let keyboardNav = false;
    let hoverIdx = -1;

    const refreshSelectedTarget = () => {
      choices.forEach(({ el }, idx) => {
        if (!el) return;
        const isHover = (keyboardNav && idx === selected) || (!keyboardNav && idx === hoverIdx);
        if (isHover) el.classList.add("enemy-targeting-hover");
        else el.classList.remove("enemy-targeting-hover");
        el.classList.remove("enemy-targeting-hover-selected");
        el.classList.remove("enemy-targeting-selected");
        el.classList.remove("enemy-targeting-selected-strong");
      });
    };

    const finish = (enemy) => {
      if (finished) return;
      finished = true;
      cleanups.forEach((cleanup) => cleanup());
      setTargetSelectionActive(false);
      setActionHint("");
      resolve(enemy);
    };

    const onTargetKeys = (e) => {
      if (isCurrentTurnCancelKey(e.code)) {
        e.preventDefault();
        finish(null);
        return;
      }
      if (isCurrentTurnMoveLeftKey(e.code) || isCurrentTurnMoveUpKey(e.code)) {
        e.preventDefault();
        keyboardNav = true;
        selected = selected < 0 ? 0 : (selected - 1 + choices.length) % choices.length;
        refreshSelectedTarget();
        return;
      }
      if (isCurrentTurnMoveRightKey(e.code) || isCurrentTurnMoveDownKey(e.code)) {
        e.preventDefault();
        keyboardNav = true;
        selected = selected < 0 ? 0 : (selected + 1) % choices.length;
        refreshSelectedTarget();
        return;
      }
      if (isCurrentTurnConfirmKey(e.code)) {
        e.preventDefault();
        if (selected < 0) return;
        finish(choices[selected].enemy);
      }
    };
    document.addEventListener("keydown", onTargetKeys);
    cleanups.push(() => document.removeEventListener("keydown", onTargetKeys));

    choices.forEach(({ enemy, el }) => {
      if (!el) return;
      el.classList.add("enemy-targeting");
      if (isPatrick()) el.classList.add("patrick-targeting");
      const onClick = (e) => {
        e.preventDefault();
        finish(enemy);
      };
      el.addEventListener("click", onClick);
      cleanups.push(() => {
        el.classList.remove("enemy-targeting");
        el.classList.remove("patrick-targeting");
        el.classList.remove("enemy-targeting-selected");
        el.classList.remove("enemy-targeting-selected-strong");
        el.classList.remove("enemy-targeting-hover");
        el.classList.remove("enemy-targeting-hover-selected");
        el.removeEventListener("click", onClick);
      });
      const onHover = () => {
        keyboardNav = false;
        hoverIdx = choices.findIndex((entry) => entry.enemy.id === enemy.id);
        refreshSelectedTarget();
      };
      el.addEventListener("mouseenter", onHover);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", onHover);
      });
      const onLeave = () => {
        if (!keyboardNav) {
          hoverIdx = -1;
          refreshSelectedTarget();
        }
      };
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => el.removeEventListener("mouseleave", onLeave));
    });

    refreshSelectedTarget();
  });
}

async function chooseEnemyTargets(abilityName = "Revolver", pickCount = 2, allowSameTarget = true) {
  const choices = enemies
    .map((enemy) => ({ enemy, el: getEl(`enemy-entity-${enemy.id}`) }))
    .filter((entry) => !!entry.el);
  if (!choices.length) return null;

  const count = Math.max(1, Math.floor(pickCount));
  setTargetSelectionActive(true);
  setActionHint(`Choose ${count} enemy target${count === 1 ? "" : "s"} for ${abilityName}. Press Shift to cancel.`);

  return new Promise((resolve) => {
    const cleanups = [];
    let finished = false;
    let selected = -1;
    let keyboardNav = false;
    let hoverIdx = -1;
    const selectedCounts = new Map();
    const selectedOrder = [];

    const refreshSelectedTarget = () => {
      choices.forEach(({ el, enemy }, idx) => {
        if (!el) return;
        const picked = selectedCounts.get(enemy.id) || 0;
        if (picked > 0) el.classList.add("enemy-targeting-selected");
        else el.classList.remove("enemy-targeting-selected");
        if (picked > 1) el.classList.add("enemy-targeting-selected-strong");
        else el.classList.remove("enemy-targeting-selected-strong");
        const isHover = (keyboardNav && idx === selected) || (!keyboardNav && idx === hoverIdx);
        if (isHover) {
          if (picked > 0) {
            el.classList.add("enemy-targeting-hover-selected");
            el.classList.remove("enemy-targeting-hover");
          } else {
            el.classList.add("enemy-targeting-hover");
            el.classList.remove("enemy-targeting-hover-selected");
          }
        } else {
          el.classList.remove("enemy-targeting-hover");
          el.classList.remove("enemy-targeting-hover-selected");
        }
      });
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      cleanups.forEach((cleanup) => cleanup());
      setTargetSelectionActive(false);
      setActionHint("");
      const picked = selectedOrder
        .map((id) => choices.find((entry) => entry.enemy.id === id)?.enemy)
        .filter(Boolean);
      resolve(picked.length ? picked : null);
    };

    const tryPick = (idx) => {
      const entry = choices[idx];
      if (!entry) return;
      const current = selectedCounts.get(entry.enemy.id) || 0;
      if (!allowSameTarget && current >= 1) return;
      if (selectedOrder.length >= count) return;
      selectedCounts.set(entry.enemy.id, current + 1);
      selectedOrder.push(entry.enemy.id);
      refreshSelectedTarget();
      if (selectedOrder.length >= count) finish();
    };

    const onTargetKeys = (e) => {
      if (isCurrentTurnCancelKey(e.code)) {
        e.preventDefault();
        finish();
        return;
      }
      if (isCurrentTurnMoveLeftKey(e.code) || isCurrentTurnMoveUpKey(e.code)) {
        e.preventDefault();
        keyboardNav = true;
        selected = selected < 0 ? 0 : (selected - 1 + choices.length) % choices.length;
        refreshSelectedTarget();
        return;
      }
      if (isCurrentTurnMoveRightKey(e.code) || isCurrentTurnMoveDownKey(e.code)) {
        e.preventDefault();
        keyboardNav = true;
        selected = selected < 0 ? 0 : (selected + 1) % choices.length;
        refreshSelectedTarget();
        return;
      }
      if (isCurrentTurnConfirmKey(e.code)) {
        e.preventDefault();
        if (selected < 0) return;
        tryPick(selected);
      }
    };
    document.addEventListener("keydown", onTargetKeys);
    cleanups.push(() => document.removeEventListener("keydown", onTargetKeys));

    choices.forEach((entry) => {
      const { enemy, el } = entry;
      if (!el) return;
      el.classList.add("enemy-targeting");
      if (isPatrick()) el.classList.add("patrick-targeting");
      const onClick = (e) => {
        e.preventDefault();
        tryPick(choices.findIndex((item) => item.enemy.id === enemy.id));
      };
      el.addEventListener("click", onClick);
      cleanups.push(() => {
        el.classList.remove("enemy-targeting");
        el.classList.remove("patrick-targeting");
        el.classList.remove("enemy-targeting-selected");
        el.classList.remove("enemy-targeting-selected-strong");
        el.classList.remove("enemy-targeting-hover");
        el.classList.remove("enemy-targeting-hover-selected");
        el.removeEventListener("click", onClick);
      });
      const onHover = () => {
        keyboardNav = false;
        hoverIdx = choices.findIndex((item) => item.enemy.id === enemy.id);
        refreshSelectedTarget();
      };
      el.addEventListener("mouseenter", onHover);
      cleanups.push(() => el.removeEventListener("mouseenter", onHover));
      const onLeave = () => {
        if (!keyboardNav) {
          hoverIdx = -1;
          refreshSelectedTarget();
        }
      };
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => el.removeEventListener("mouseleave", onLeave));
    });

    refreshSelectedTarget();
  });
}

async function chooseAllyTarget(abilityName = "Ability") {
  const choices = [];
  if (isDuoMode()) {
    for (let idx = 0; idx < duoPlayers.length; idx += 1) {
      const allyEl = getEl(playerEntityIdForIndex(idx));
      if (allyEl && duoPlayers[idx]) {
        choices.push({
          id: playerEntityIdForIndex(idx),
          unit: duoPlayers[idx],
          label: displayCharacterName(duoCharacters[idx]),
          el: allyEl
        });
      }
    }
  } else {
    const primary = getEl("playerChar");
    if (primary) {
      choices.push({
        id: "playerChar",
        unit: player,
        label: displayCharacterName(selectedCharacter || "player"),
        el: primary
      });
    }
  }
  const helperEl = getEl("helperChar");
  if (helperEl && helper) {
    choices.push({
      id: "helperChar",
      unit: helper,
      label: "HELPER",
      el: helperEl
    });
  }
  const shadowEl = getEl("shadowChar");
  const shadow = getKostyaShadow();
  if (shadowEl && shadow) {
    choices.push({
      id: "shadowChar",
      unit: shadow,
      label: "Shadow",
      el: shadowEl
    });
  }

  const available = choices.filter((entry) => !!entry.el && !!entry.unit);
  if (!available.length) return null;

  setTargetSelectionActive(true);
  setActionHint(`Choose your ally target for ${abilityName}. Press Shift to cancel.`);

  return new Promise((resolve) => {
    const cleanups = [];
    let finished = false;
    let selected = 0;

    const refreshSelectedTarget = () => {
      available.forEach(({ el }, idx) => {
        if (!el) return;
        if (idx === selected) el.classList.add("enemy-targeting-selected");
        else el.classList.remove("enemy-targeting-selected");
      });
    };

    const finish = (entry) => {
      if (finished) return;
      finished = true;
      cleanups.forEach((cleanup) => cleanup());
      setTargetSelectionActive(false);
      setActionHint("");
      resolve(entry || null);
    };

    const onTargetKeys = (e) => {
      if (isCurrentTurnCancelKey(e.code)) {
        e.preventDefault();
        finish(null);
        return;
      }
      if (isCurrentTurnMoveLeftKey(e.code) || isCurrentTurnMoveUpKey(e.code)) {
        e.preventDefault();
        selected = (selected - 1 + available.length) % available.length;
        refreshSelectedTarget();
        return;
      }
      if (isCurrentTurnMoveRightKey(e.code) || isCurrentTurnMoveDownKey(e.code)) {
        e.preventDefault();
        selected = (selected + 1) % available.length;
        refreshSelectedTarget();
        return;
      }
      if (isCurrentTurnConfirmKey(e.code)) {
        e.preventDefault();
        finish(available[selected]);
      }
    };
    document.addEventListener("keydown", onTargetKeys);
    cleanups.push(() => document.removeEventListener("keydown", onTargetKeys));

    available.forEach((entry) => {
      const { el } = entry;
      if (!el) return;
      el.classList.add("enemy-targeting");
      if (isPatrick()) el.classList.add("patrick-targeting");
      const onClick = (e) => {
        e.preventDefault();
        finish(entry);
      };
      el.addEventListener("click", onClick);
      cleanups.push(() => {
        el.classList.remove("enemy-targeting");
        el.classList.remove("patrick-targeting");
        el.classList.remove("enemy-targeting-selected");
        el.removeEventListener("click", onClick);
      });
      const onHover = () => {
        selected = available.findIndex((item) => item.id === entry.id);
        refreshSelectedTarget();
      };
      el.addEventListener("mouseenter", onHover);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", onHover);
      });
    });

    refreshSelectedTarget();
  });
}

async function chooseDebugStatusTarget(statusName = "Status") {
  const choices = [];

  if (isDuoMode()) {
    for (let idx = 0; idx < duoPlayers.length; idx += 1) {
      const allyEl = getEl(playerEntityIdForIndex(idx));
      if (!allyEl || !duoPlayers[idx]) continue;
      choices.push({
        id: playerEntityIdForIndex(idx),
        unit: duoPlayers[idx],
        label: displayCharacterName(duoCharacters[idx]),
        el: allyEl
      });
    }
  } else {
    const primary = getEl("playerChar");
    if (primary && player) {
      choices.push({
        id: "playerChar",
        unit: player,
        label: displayCharacterName(selectedCharacter || "player"),
        el: primary
      });
    }
  }

  const helperEl = getEl("helperChar");
  if (helperEl && helper) {
    choices.push({
      id: "helperChar",
      unit: helper,
      label: "HELPER",
      el: helperEl
    });
  }

  const shadowEl = getEl("shadowChar");
  const shadow = getKostyaShadow();
  if (shadowEl && shadow) {
    choices.push({
      id: "shadowChar",
      unit: shadow,
      label: "Shadow",
      el: shadowEl
    });
  }

  enemies.forEach((enemy) => {
    const enemyEl = getEl(`enemy-entity-${enemy.id}`);
    if (!enemyEl) return;
    choices.push({
      id: `enemy-entity-${enemy.id}`,
      unit: enemy,
      label: enemyLabel(enemy),
      el: enemyEl
    });
  });

  const available = choices.filter((entry) => !!entry.el && !!entry.unit);
  if (!available.length) return null;

  setTargetSelectionActive(true);
  setActionHint(`Choose a target for ${statusName}. Press Shift to cancel.`);

  return new Promise((resolve) => {
    const cleanups = [];
    let finished = false;
    let selected = 0;

    const refreshSelectedTarget = () => {
      available.forEach(({ el }, idx) => {
        if (!el) return;
        if (idx === selected) el.classList.add("enemy-targeting-selected");
        else el.classList.remove("enemy-targeting-selected");
      });
    };

    const finish = (entry) => {
      if (finished) return;
      finished = true;
      cleanups.forEach((cleanup) => cleanup());
      setTargetSelectionActive(false);
      setActionHint("");
      resolve(entry || null);
    };

    const onTargetKeys = (e) => {
      if (isCurrentTurnCancelKey(e.code)) {
        e.preventDefault();
        finish(null);
        return;
      }
      if (isCurrentTurnMoveLeftKey(e.code) || isCurrentTurnMoveUpKey(e.code)) {
        e.preventDefault();
        selected = (selected - 1 + available.length) % available.length;
        refreshSelectedTarget();
        return;
      }
      if (isCurrentTurnMoveRightKey(e.code) || isCurrentTurnMoveDownKey(e.code)) {
        e.preventDefault();
        selected = (selected + 1) % available.length;
        refreshSelectedTarget();
        return;
      }
      if (isCurrentTurnConfirmKey(e.code)) {
        e.preventDefault();
        finish(available[selected]);
      }
    };

    document.addEventListener("keydown", onTargetKeys);
    cleanups.push(() => document.removeEventListener("keydown", onTargetKeys));

    available.forEach((entry) => {
      const { el } = entry;
      if (!el) return;
      el.classList.add("enemy-targeting");
      const onClick = (e) => {
        e.preventDefault();
        finish(entry);
      };
      const onHover = () => {
        selected = available.findIndex((item) => item.id === entry.id);
        refreshSelectedTarget();
      };
      el.addEventListener("click", onClick);
      el.addEventListener("mouseenter", onHover);
      cleanups.push(() => {
        el.classList.remove("enemy-targeting");
        el.classList.remove("enemy-targeting-selected");
        el.removeEventListener("click", onClick);
        el.removeEventListener("mouseenter", onHover);
      });
    });

    refreshSelectedTarget();
  });
}

function buildLevelUpgradeOptions() {
  if (isKostya()) {
    const kostyaUnit = getKostyaUnit();
    const isMaxHp = !!kostyaUnit && kostyaUnit.maxHp >= KOSTYA_MAX_HP_CAP;
    return [
      {
        id: "strongerBlade",
        name: "Stronger Blade",
        icon: KOSTYA_SPRITES.upgradeBlade || KOSTYA_SPRITES.templateAbilityIcon,
        description: "+2 Base Damage\n+1% Green Bonus Damage"
      },
      {
        id: "endurance",
        name: "Endurance",
        icon: KOSTYA_SPRITES.upgradeHealth || KOSTYA_SPRITES.templateAbilityIcon,
        description: "+5 Max Health for Kostya\n+3 Max SHP for Shadow",
        disabled: isMaxHp
      },
      {
        id: "endarkement",
        name: "Endarkement",
        icon: KOSTYA_SPRITES.upgradeShadow || KOSTYA_SPRITES.templateAbilityIcon,
        description: "+0.35 Shadow Charge gain"
      }
    ];
  }

  if (isPatrick()) {
    return getPatrickUpgradeOptionsForPlayer(player, PATRICK_MAX_HP_CAP);
  }

  const options = [
    { id: "blade", name: "Blade Up", icon: JACOB_SPRITES.battleCard, description: "+2 ATK." },
    { id: "endure", name: "Endure Up", icon: JACOB_SPRITES.battleCard, description: "+5 MAX HP (+5 heal)." },
    { id: "strengthen", name: "Strengthen Up", icon: JACOB_SPRITES.battleCard, description: "+1 DEF, +1 Parry damage." }
  ];
  if (helperUnlocked) {
    options.push({
      id: "helperTrain",
      name: "Train with Helper",
      icon: JACOB_SPRITES.battleCard,
      description: "+10 HELPER max HP."
    });
  }
  return options;
}

function chooseFromOverlay({
  title = "Choose One",
  subtitle = "",
  options = [],
  requireConfirm = false
} = {}) {
  if (!Array.isArray(options) || !options.length) return Promise.resolve(null);
  return new Promise((resolve) => {
    document.body?.classList.add("choice-overlay-active");
    const overlay = document.createElement("div");
    overlay.className = "choice-overlay";

    const panel = document.createElement("div");
    panel.className = "choice-panel";
    overlay.appendChild(panel);

    const titleEl = document.createElement("div");
    titleEl.className = "choice-title";
    titleEl.innerText = title;
    panel.appendChild(titleEl);

    const subtitleEl = document.createElement("div");
    subtitleEl.className = "choice-subtitle";
    subtitleEl.innerText = subtitle || "";
    panel.appendChild(subtitleEl);

    const grid = document.createElement("div");
    grid.className = "choice-grid";
    panel.appendChild(grid);

    const statusEl = document.createElement("div");
    statusEl.className = "choice-status";
    panel.appendChild(statusEl);

    let selected = 0;
    let pending = -1;
    const cards = [];
    let done = false;

    const finish = (choiceId) => {
      if (done) return;
      done = true;
      document.removeEventListener("keydown", onKey);
      overlay.removeEventListener("click", onOverlayClick);
      if (overlay.isConnected) overlay.remove();
      document.body?.classList.remove("choice-overlay-active");
      requestImmediatePlayerTurnUiResume();
      resolve(choiceId);
    };

  const selectOption = (idx) => {
    if (idx < 0 || idx >= options.length) return;
    if (options[idx]?.disabled) return;
    if (requireConfirm) {
      if (pending === idx) {
        finish(options[idx].id);
        return;
        }
        pending = idx;
      } else {
        finish(options[idx].id);
        return;
      }
      selected = idx;
      refreshState();
    };

    const refreshState = () => {
      cards.forEach((card, idx) => {
        card.classList.toggle("choice-card-selected", idx === selected);
        card.classList.toggle("choice-card-armed", idx === pending);
      });
      if (requireConfirm && pending >= 0) {
        statusEl.innerText = "Are you sure?";
      } else if (requireConfirm) {
        statusEl.innerText = "Pick one";
      } else {
        statusEl.innerText = "";
      }
    };

    const moveSelection = (deltaRow, deltaCol) => {
      const previous = selected;
      const cols = Math.min(3, Math.max(1, options.length));
      const row = Math.floor(selected / cols);
      const col = selected % cols;
      let nextRow = row + deltaRow;
      let nextCol = col + deltaCol;
      if (deltaRow === 0) {
        if (nextCol < 0) nextCol = cols - 1;
        if (nextCol >= cols) nextCol = 0;
      }
      const maxRow = Math.ceil(options.length / cols) - 1;
      nextRow = Math.max(0, Math.min(maxRow, nextRow));
      let next = nextRow * cols + nextCol;
      if (next >= options.length) next = options.length - 1;
      const enabled = options
        .map((opt, idx) => ({ opt, idx }))
        .filter(({ opt }) => !opt.disabled);
      if (!enabled.length) {
        selected = next;
        refreshState();
        return;
      }
      let tries = 0;
      let nextIdx = next;
      while (options[nextIdx]?.disabled && tries < options.length) {
        nextIdx = (nextIdx + 1) % options.length;
        tries += 1;
      }
      selected = nextIdx;
      refreshState();
      if (selected !== previous) {
        playUiButtonSound("hover", cards[selected] || null);
      }
    };

    const onKey = (e) => {
      const isLeft = e.code === "ArrowLeft" || e.code === "KeyA";
      const isRight = e.code === "ArrowRight" || e.code === "KeyD";
      const isUp = e.code === "ArrowUp" || e.code === "KeyW";
      const isDown = e.code === "ArrowDown" || e.code === "KeyS";
      const isConfirm = e.code === "Space" || e.code === "Enter" || e.code === "NumpadEnter";
      const isCancel = e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "Escape";

      if (isLeft) {
        e.preventDefault();
        moveSelection(0, -1);
      } else if (isRight) {
        e.preventDefault();
        moveSelection(0, 1);
      } else if (isUp) {
        e.preventDefault();
        moveSelection(-1, 0);
      } else if (isDown) {
        e.preventDefault();
        moveSelection(1, 0);
      } else if (isConfirm) {
        e.preventDefault();
        selectOption(selected);
      } else if (isCancel && requireConfirm && pending >= 0) {
        e.preventDefault();
        pending = -1;
        refreshState();
      }
    };

    const onOverlayClick = (e) => {
      if (!requireConfirm || pending < 0) return;
      if (e.target.closest(".choice-card")) return;
      if (overlay.contains(e.target)) {
        pending = -1;
        refreshState();
      }
    };

    options.forEach((option, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "choice-card";
      if (option.disabled) {
        card.classList.add("choice-card-disabled");
        card.disabled = true;
      }
      const desc = String(option.description || "").replaceAll("\n", "<br>");
      const costHtml = formatPatrickChoiceCostHtml(option.cost);
      card.innerHTML =
        `<img class="choice-icon" src="${option.icon}" alt="${option.name}">` +
        `<div class="choice-name">${option.name}</div>` +
        `<div class="choice-cost">${costHtml}</div>` +
        `<div class="choice-desc">${desc}</div>`;
      card.addEventListener("mouseenter", () => {
        if (option.disabled) return;
        selected = idx;
        refreshState();
      });
      card.addEventListener("click", (e) => {
        e.preventDefault();
        if (option.disabled) return;
        selectOption(idx);
      });
      cards.push(card);
      grid.appendChild(card);
    });

    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKey);
    overlay.addEventListener("click", onOverlayClick);
    refreshState();
  });
}

async function chooseLevelUpgrade() {
  setActionsLocked(true);
  return chooseFromOverlay({
    title: "Upgrade Pick",
    subtitle: "Choose one upgrade.",
    options: buildLevelUpgradeOptions(),
    requireConfirm: false
  });
}

function applyUpgradeChoice(choice) {
  if (choice === "luck" || choice === "gambler" || choice === "magnum") {
    applyPatrickUpgradeChoiceToState(choice, {
      player,
      rollInt
    });
  } else if (choice === "strongerBlade") {
    const { strongerBladeUpgrades } = getKostyaUpgrades();
    setKostyaUpgrade("strongerBlade", strongerBladeUpgrades + 1);
  } else if (choice === "endurance") {
    const { noLightUpgrades } = getKostyaUpgrades();
    setKostyaUpgrade("noLight", noLightUpgrades + 1);
    const kostyaUnit = getKostyaUnit();
    if (kostyaUnit) {
      const prevMaxHp = kostyaUnit.maxHp;
      kostyaUnit.maxHp = Math.min(KOSTYA_MAX_HP_CAP, kostyaUnit.maxHp + 5);
      kostyaUnit.hp = Math.min(kostyaUnit.maxHp, kostyaUnit.hp + 5);
      const shadowHpGain = Math.max(0, kostyaUnit.maxHp - prevMaxHp);
      const shadow = getKostyaShadow();
      if (shadow && shadowHpGain > 0) {
        shadow.maxHp += shadowHpGain;
        shadow.hp = Math.min(shadow.maxHp, shadow.hp + shadowHpGain);
      }
    }
    const shadow = getKostyaShadow();
    if (shadow) {
      shadow.maxShp += 3;
      shadow.shp = Math.min(shadow.maxShp, (shadow.shp || 0) + 3);
      if (shadow.maxVhp > 0) {
        shadow.maxVhp += 3;
        shadow.vhp = Math.min(shadow.maxVhp, (shadow.vhp || 0) + 3);
      }
    }
  } else if (choice === "endarkement") {
    const { endarkementUpgrades } = getKostyaUpgrades();
    setKostyaUpgrade("endarkement", endarkementUpgrades + 1);
  } else if (choice === "blade") {
    player.atk += 2;
    bladeUpgrades += 1;
  } else if (choice === "endure") {
    player.maxHp += 5;
    player.hp = Math.min(player.maxHp, player.hp + 5);
    endureUpgrades += 1;
  } else if (choice === "strengthen") {
    player.def += 1;
    strengthenUpgrades += 1;
    parryBonusDamage += 1;
  } else if (choice === "helperTrain") {
    helperTrainingUpgrades += 1;
  }
}

async function handleLevelClear() {
  addLog("You win!", "attack-green");
  await settleCombatLogBeforeClose();
  clearCombatLog();
  const clearedLevel = level;
  const shadow = getKostyaShadow();
  if (shadow && shadow.maxShp > 0) {
    const missingShp = Math.max(0, shadow.maxShp - (shadow.shp || 0));
    const restore = Math.ceil(missingShp * 0.1);
    if (restore > 0) {
      shadow.shp = Math.min(shadow.maxShp, (shadow.shp || 0) + restore);
    }
  }
  if (clearedLevel >= 50) {
    const ending = await playFinalBossAftermathScene();
    mercyEndingPending = ending;
    await showVictoryScreen(mercyEndingPending);
    mercyEndingPending = null;
    return;
  }
  level += 1;

  if (!helperUnlocked && level === 11) {
    helperUnlocked = true;
  }

  const patrickUnlockCtx = {
    chooseFromOverlay,
    isDuoMode: () => isDuoMode(),
    duoCharacters,
    switchToDuoPlayer,
    refreshUI,
    startIdleAnimations,
    isPatrick: () => isPatrick()
  };
  const kostyaUnlockCtx = {
    chooseFromOverlay,
    isDuoMode: () => isDuoMode(),
    duoCharacters,
    switchToDuoPlayer,
    refreshUI,
    startIdleAnimations,
    isKostya: () => isKostya()
  };
  if (level === 50) {
    await choosePatrickLeftoverEvolutionBeforeFinalBoss(patrickUnlockCtx);
    await chooseKostyaLeftoverEvolutionBeforeFinalBoss(kostyaUnlockCtx);
  }
  await unlockPatrickRevolverEvolutionAfterBoss(clearedLevel, patrickUnlockCtx);
  await unlockPatrickAceEvolutionAfterBoss(clearedLevel, patrickUnlockCtx);
  await unlockPatrickGunEvolutionAfterBoss(clearedLevel, patrickUnlockCtx);
  await unlockPatrickFinalEvolutionAfterBoss(clearedLevel, patrickUnlockCtx);
  await unlockPatrickMasteryAfterBoss(clearedLevel, patrickUnlockCtx);
  await unlockKostyaFirstEvolutionAfterBoss(clearedLevel, kostyaUnlockCtx);
  await unlockKostyaSecondEvolutionAfterBoss(clearedLevel, kostyaUnlockCtx);
  await unlockKostyaThirdEvolutionAfterBoss(clearedLevel, kostyaUnlockCtx);
  await unlockKostyaFourthEvolutionAfterBoss(clearedLevel, kostyaUnlockCtx);

  if (isDuoMode()) {
    for (let idx = 0; idx < duoPlayers.length; idx += 1) {
      switchToDuoPlayer(idx, true);
      refreshUI();
      startIdleAnimations();
      const choice = await chooseLevelUpgrade();
      applyUpgradeChoice(choice);
    }
    switchToDuoPlayer(0);
  } else {
    const choice = await chooseLevelUpgrade();
    applyUpgradeChoice(choice);
  }

  startNewLevelState();
  if (isDuoMode()) switchToDuoPlayer(0);
  enemies = spawnLevelEnemies();
  await enterCurrentEncounter();
}

async function showVictoryScreen(ending = null) {
  stopIdleAnimations();
  stopPreservedFinalBossSceneAnimation();
  setActionsLocked(true);
  stopBossMusic();
  stopMenuMusic();
  const transition = getEl("victoryTransition");
  if (transition) {
    transition.classList.remove("hidden", "victory-transition-reveal", "victory-transition-active", "victory-transition-hold");
    void transition.offsetWidth;
    transition.classList.add("victory-transition-active");
    await sleep(2000);
    transition.classList.remove("victory-transition-active");
    transition.classList.add("victory-transition-hold");
    await sleep(2000);
  }
  const victory = getEl("victoryScreen");
  if (!victory) return;
  preserveMercyBattlefield = false;
  renderEnemies();
  const titleText = t("victory.title");
  const isFinalBossEnding = !!ending;
  const endingLabel = ending?.endingLabel || (isFinalBossEnding ? "True Ending" : "Bad Ending");
  const bodyText = ending?.bodyText || (isFinalBossEnding ? "Mercy was accepted." : t("victory.text"));
  if (isFinalBossEnding) {
    const playerKeys = ending.playerKeys || [];
    const leadPlayerKey = playerKeys[0] || activeDialogueCharacterKey();
    const rearPlayerKey = playerKeys[1] || null;
    const rearBossKey = playerKeys[2] || null;
    const frontPlayerHtml = `<div class="ending-player-front"><img class="ending-silhouette ending-player-sprite" src="${characterBaseSprite(leadPlayerKey)}" alt="${displayCharacterName(leadPlayerKey)} silhouette"></div>`;
    const rearPlayerHtml = rearPlayerKey
      ? `<div class="ending-player-rear"><img class="ending-silhouette ending-player-sprite" src="${characterBaseSprite(rearPlayerKey)}" alt="${displayCharacterName(rearPlayerKey)} silhouette"></div>`
      : "";
    const rearBossHtml = rearBossKey
      ? `<div class="ending-boss-rear"><img class="ending-silhouette ending-player-sprite" src="${characterBaseSprite(rearBossKey)}" alt="${displayCharacterName(rearBossKey)} silhouette"></div>`
      : "";
    const bossSprite = ending.bossSprite || "";
    const bossFrontHtml = bossSprite
      ? `<div class="ending-boss-front"><img class="ending-silhouette ending-boss-sprite" src="${bossSprite}" alt="Burger Overlord silhouette"></div>`
      : "";
    const bossWrapHtml = (rearBossHtml || bossFrontHtml)
      ? `<div class="ending-boss-wrap">${rearBossHtml}${bossFrontHtml}</div>`
      : "";
    victory.classList.add("victory-screen-ending");
    victory.innerHTML =
      `<div class="ending-scene" style="background-image:url('${ENDING_BACKGROUND_SRC}');">` +
      `<div class="ending-scene-vignette"></div>` +
      `<div class="ending-silhouette-stage">` +
      `<div class="ending-party">${rearPlayerHtml}${frontPlayerHtml}</div>` +
      bossWrapHtml +
      `</div>` +
      `<h1 class="ending-victory-title">${titleText}</h1>` +
      `<div class="ending-victory-label">${endingLabel}</div>` +
      `<div class="victory-panel ending-victory-panel ending-victory-panel-hidden" aria-hidden="true">` +
      `<h1>${titleText}</h1>` +
      `<p>${bodyText}</p>` +
      `</div>` +
      `<div class="ending-falling-text" aria-hidden="true">` +
      `<div class="ending-falling-stack">` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">Producer</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">P. Kowal</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">Design</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">P. Kowal</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">Animation</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">P. Kowal</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">Sprites</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">P. Kowal</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">UI Design</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">P. Kowal</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">Plot Director</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">P. Kowal</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">Sountracks</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">Free Sourced.</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">SFX</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">Free Sourced.</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">QA</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">P. Kowal</div>` +
      `</div>` +
      `<div class="ending-falling-line-group">` +
      `<div class="ending-falling-line ending-falling-line-bold">Special Thanks</div>` +
      `<div class="ending-falling-line ending-falling-line-sub">D. Kurkus</div>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `</div>`;
    playEndingMusic();
  } else {
    victory.classList.remove("victory-screen-ending");
    victory.innerHTML =
      `<div class="victory-panel">` +
      `<h1>${titleText}</h1>` +
      `<div class="victory-ending-label">${endingLabel}</div>` +
      `<p>${bodyText}</p>` +
      `<button id="victoryRestart" type="button">Restart</button>` +
      `</div>`;
    stopEndingMusic();
  }
  victory.classList.remove("hidden");
  if (transition) {
    transition.classList.remove("victory-transition-active", "victory-transition-reveal");
    void transition.offsetWidth;
    transition.classList.add("victory-transition-reveal");
    await sleep(2000);
    transition.classList.remove("victory-transition-reveal", "victory-transition-hold");
    transition.classList.add("hidden");
  }
  const restart = getEl("victoryRestart");
  if (restart) {
    restart.onclick = () => {
      window.location.reload();
    };
  }
}

function clearEnemyBlocksForNextRound() {
  enemies.forEach((enemy) => {
    enemy.blocking = false;
    clearStatus(enemy, "resistance");
  });
}

function setEnemyStunned(enemy, turns = 1) {
  if (!enemy) return;
  const nextTurns = Math.max(enemy.stunTurns || 0, Math.max(1, Math.floor(turns)));
  enemy.stunTurns = nextTurns;
  applyStatus(enemy, "stunned", 10, nextTurns);
}

function tickEnemyStunned(enemy) {
  if (!enemy || enemy.stunTurns <= 0) {
    if (enemy) clearStatus(enemy, "stunned");
    return;
  }
  enemy.stunTurns = Math.max(0, enemy.stunTurns - 1);
  if (enemy.stunTurns > 0) applyStatus(enemy, "stunned", 10, enemy.stunTurns);
  else clearStatus(enemy, "stunned");
}

function applyIncomingDamage(enemy, dmg, ignoreBlock = false, attacker = null, damageMeta = null) {
  let final = Math.max(0, dmg);
  final = applyAttackerDamageModifiers(attacker, final);
  final = applyDamageModifiers(enemy, final, {
    attacker,
    ignoreResistance: !!damageMeta?.ignoreResistance
  });
  applyLayeredDamage(enemy, final);
  if (final > 0) enemy.lastDamagedBy = ownerUnitForAttacker(attacker);
  return final;
}

async function applyDamageToEnemy(enemy, dmg, ignoreBlock = false, attacker = player, damageMeta = null) {
  const dealt = applyIncomingDamage(enemy, dmg, ignoreBlock, attacker, damageMeta);
  await playEnemyFrames(enemy, enemySpriteSet(enemy).damaged, 110);
  return dealt;
}

function computePlayerDamageAgainst(enemy, skillSuccess, charge) {
  let base = Math.max(1, player.atk - enemy.def);
  if (skillSuccess) base = Math.floor(base * (1.5 + charge));
  return applyAttackerDamageModifiers(player, base);
}

function killHelperForLevel() {
  helper = null;
  helperCanSummonThisLevel = false;
}

function killShadowForLevel() {
  const shadow = getKostyaShadow();
  if (shadow) storeCollapsedKostyaShadowSnapshot(shadow);
  setKostyaShadow(null);
  setKostyaShadowStrengthPower(0);
}

async function helperAct() {
  if (!frontEnemy()) return;

  const helperActions = helper ? claimEntityActionsForTurn(helper) : 0;
  if (helper && helperActions <= 0) maybeSkipTurnFromSlowness(helper, "HELPER");
  for (let actionIndex = 0; actionIndex < helperActions; actionIndex += 1) {
    if (!helper || helper.hp <= 0 || !frontEnemy()) break;
    if (maybeSkipTurnFromStun(helper, "HELPER")) continue;

    if (helper.hp <= 8 && helper.potions > 0) {
      helper.potions -= 1;
      helper.hp = Math.min(helper.maxHp, helper.hp + 8);
      await animateHelperHeal();
      refreshUI();
      continue;
    }

    if (Math.random() < 0.25) {
      helper.defending = true;
      await animateHelperDefend();
      refreshUI();
      continue;
    }

    const target = frontEnemy();
    if (target) {
      const dmg = Math.max(1, helper.atk - target.def);
      await dashToward("helperChar", `enemy-entity-${target.id}`, 340, false);
      await animateHelperAttack();
      await applyDamageToEnemy(target, dmg, false, helper);
      await dashBack("helperChar");
    }
  }

  const shadow = getKostyaShadow();
  const shadowActions = shadow ? claimEntityActionsForTurn(shadow) : 0;
  if (shadow && shadowActions <= 0) maybeSkipTurnFromSlowness(shadow, "Shadow");
  for (let actionIndex = 0; actionIndex < shadowActions; actionIndex += 1) {
    const activeShadow = getKostyaShadow();
    if (!activeShadow || activeShadow.hp <= 0 || !frontEnemy()) break;
    if (maybeSkipTurnFromStun(activeShadow, "Shadow")) continue;
    await runKostyaShadowAutoAttack({
      frontEnemy,
      dashToward,
      playFramesById,
      dashBack,
      applyDamageToEnemy,
      isDecaying,
      getLevel: () => level,
      getKostyaUnit,
      applyStatus,
      playSfx,
      startSpriteLoop
    });
    if (!frontEnemy()) break;
  }

  await removeDeadEnemies();
  refreshUI();
}

async function resolvePostPlayerAction() {
  await removeDeadEnemies();
  refreshUI();

  if (!usesQueuedPlayerRounds()) {
    soloRoundActionsRemaining = Math.max(0, soloRoundActionsRemaining - 1);
  }

  if (getKostyaShadow()) {
    const kostyaIdx = isDuoMode() ? duoCharacters.findIndex((key) => key === "kostya") : (isKostya() ? 0 : -1);
    const kostyaUnit = isDuoMode() ? duoPlayers[kostyaIdx] : player;
    if (kostyaIdx >= 0 || !isDuoMode()) {
      if (kostyaUnit) {
        kostyaUnit.sp = Math.min(kostyaUnit.maxSp, kostyaUnit.sp + 4);
      }
    }
  }

  if (!enemies.length) {
    soloRoundActionsRemaining = 0;
    resetQueuedPlayerTurnState();
    await sleep(250);
    await handleLevelClear();
    return;
  }

  if (!usesQueuedPlayerRounds() && soloRoundActionsRemaining > 0) {
    await beginPlayerTurn();
    return;
  }

  if (usesQueuedPlayerRounds() && queuedPlayerTurnExecuting) {
    await runNextQueuedPlayerTurn();
    return;
  }

  await finishQueuedPlayerRound();
}

async function beginPlayerTurn() {
  const skipIntroDelay = skipNextPlayerTurnIntroDelay;
  skipNextPlayerTurnIntroDelay = false;
  if (usesQueuedPlayerRounds() && !queuedPlayerTurnExecuting) {
    resetQueuedPlayerTurnState(buildQueuedPlayerTurnOrder());
  }
  await settleCombatLogBeforeClose();
  clearCombatLog();
  refreshUI();
  startIdleAnimations();
  if (!skipIntroDelay) {
    await sleep(TURN_TRANSITION_MS);
    await sleep(PRE_TURN_DELAY_MS);
  }

  if (usesQueuedPlayerRounds() && !queuedPlayerTurnExecuting) {
    const firstPlanningIndex = nextPlannablePlayerIndex(-1);
    if (firstPlanningIndex < 0) {
      await finishQueuedPlayerRound();
      return;
    }
    queuedPlayerTurnPlanningIndex = firstPlanningIndex;
    switchToDuoPlayer(queuedPlayerTurnOrder[firstPlanningIndex], true);
    refreshUI();
    renderCombatActions();
    setActionsLocked(false);
    return;
  }

  if (!usesQueuedPlayerRounds() && soloRoundActionsRemaining <= 0) {
    soloRoundActionsRemaining = claimEntityActionsForTurn(player);
    if (soloRoundActionsRemaining <= 0) {
      maybeSkipTurnFromSlowness(player, displayCharacterName(selectedCharacter || "player"));
      clearEnemyBlocksForNextRound();
      refreshUI();
      startIdleAnimations();
      await sleep(TURN_TRANSITION_MS);
      const enemyResult = await enemyPhase();
      if (!enemyResult.playerDied && !enemyResult.levelCleared) {
        return beginPlayerTurn();
      }
      return;
    }
  }

  const unit = isDuoMode() ? duoPlayers[activeDuoPlayer] : player;
  const characterKey = isDuoMode() ? duoCharacters[activeDuoPlayer] : (selectedCharacter || "player");

  if (unit && maybeSkipTurnFromSlowness(unit, displayCharacterName(characterKey))) {
    refreshUI();

    if (isDuoMode() && activeDuoPlayer < duoPlayers.length - 1) {
      switchToDuoPlayer(activeDuoPlayer + 1, true);
      return beginPlayerTurn();
    }

    if (!isDuoMode()) {
      soloRoundActionsRemaining = Math.max(0, soloRoundActionsRemaining - 1);
      if (soloRoundActionsRemaining > 0) {
        return beginPlayerTurn();
      }
    }

    clearEnemyBlocksForNextRound();
    refreshUI();
    startIdleAnimations();
    await sleep(TURN_TRANSITION_MS);
    const enemyResult = await enemyPhase();
    if (!enemyResult.playerDied && !enemyResult.levelCleared) {
      if (isDuoMode()) switchToDuoPlayer(0, true);
      return beginPlayerTurn();
    }
    return;
  }

  if (unit && maybeSkipTurnFromStun(unit, displayCharacterName(characterKey))) {
    refreshUI();

    if (isDuoMode() && activeDuoPlayer < duoPlayers.length - 1) {
      switchToDuoPlayer(activeDuoPlayer + 1, true);
      return beginPlayerTurn();
    }

    if (!isDuoMode()) {
      soloRoundActionsRemaining = Math.max(0, soloRoundActionsRemaining - 1);
      if (soloRoundActionsRemaining > 0) {
        return beginPlayerTurn();
      }
    }

    clearEnemyBlocksForNextRound();
    refreshUI();
    startIdleAnimations();
    await sleep(TURN_TRANSITION_MS);
    const enemyResult = await enemyPhase();
    if (!enemyResult.playerDied && !enemyResult.levelCleared) {
      if (isDuoMode()) switchToDuoPlayer(0, true);
      return beginPlayerTurn();
    }
    return;
  }

  renderCombatActions();
  setActionsLocked(false);
}

async function playerAttack() {
  if (actionsLocked || !frontEnemy()) return;
  if (queuePlayerTurnAction(executePlayerAttack)) return;
  await executePlayerAttack();
}

async function executePlayerAttack() {
  setActionsLocked(true);
  setPlayerSkillFeedback();
  playSfx("swordDrawn", 0.5);
  const target = frontEnemy();
  if (!target) return;
  logCombatUse(displayCharacterName(selectedCharacter || "player"), "Attack", enemyLabel(target));

  await dashToward(activePlayerCharId(), `enemy-entity-${target.id}`, 340, false);
  positionSkillCheckBelow(activePlayerCharId());
  const { success, charge, reason } = await runSkillCheck({
    yellowEnabled: false,
    greenWidth: 0.2125,
    hintHtml: 'Release SPACE on <span class="skill-hint-green">green</span> for bonus!'
  });

  await animatePlayerAttack();
  playSfx("attack", 0.6);

  if (success) {
    setPlayerSkillFeedback("Great!", "great");
  } else if (reason === "timeout") {
  } else if (reason === "overhold") {
  } else {
  }

  const dmg = computePlayerDamageAgainst(target, success, charge);
  await applyDamageToEnemy(target, dmg);
  await dashBack(activePlayerCharId());
  await resolvePostPlayerAction();
}

async function playerSwing() {
  if (actionsLocked || !frontEnemy()) return;
  if (player.sp < 20) {
    return;
  }
  if (queuePlayerTurnAction(executePlayerSwing)) return;
  await executePlayerSwing();
}

async function executePlayerSwing() {
  setActionsLocked(true);
  setPlayerSkillFeedback();
  player.sp -= 20;
  playSfx("swordDrawn", 0.5);
  const nearest = frontEnemy();
  if (!nearest) return;
  logCombatUse(displayCharacterName(selectedCharacter || "player"), "Swing", enemies.length > 1 ? null : enemyLabel(nearest));

  await dashToward(activePlayerCharId(), `enemy-entity-${nearest.id}`, 340, false);
  positionSkillCheckBelow(activePlayerCharId());
  const { success, charge, reason } = await runSkillCheck({
    yellowEnabled: false,
    greenWidth: 0.14,
    hintHtml: 'Release SPACE on <span class="skill-hint-green">green</span> for bonus!'
  });

  await animatePlayerAttack();
  playSfx("attack", 0.6);

  if (success) {
    setPlayerSkillFeedback("Great!", "great");
  } else if (reason === "timeout") {
  } else if (reason === "overhold") {
  } else {
  }

  const lead = frontEnemy();
  if (!lead) return;
  const alive = [...enemies];
  let total = computePlayerDamageAgainst(lead, success, charge);
  total = Math.max(total, alive.length);

  const perTarget = Math.floor(total / alive.length);
  let remainder = total % alive.length;
  for (const enemy of alive) {
    const split = perTarget + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    await applyDamageToEnemy(enemy, split);
  }
  await dashBack(activePlayerCharId());
  await resolvePostPlayerAction();
}

async function playerPiercer() {
  if (actionsLocked || !frontEnemy()) return;
  if (player.sp < 40) {
    return;
  }
  if (queuePlayerTurnAction(executePlayerPiercer)) return;
  await executePlayerPiercer();
}

async function executePlayerPiercer() {
  setActionsLocked(true);
  setPlayerSkillFeedback();
  player.sp -= 40;
  playSfx("swordDrawn", 0.5);
  const target = frontEnemy();
  if (!target) return;
  logCombatUse(displayCharacterName(selectedCharacter || "player"), "Piercer", enemies.length > 1 ? null : enemyLabel(target));

  await dashToward(activePlayerCharId(), `enemy-entity-${target.id}`, 340, false);
  positionSkillCheckBelow(activePlayerCharId());
  const { reason } = await runSkillCheck({
    yellowEnabled: true,
    redEnabled: true,
    greenWidth: 0.1,
    yellowExtra: 0.08,
    redExtra: 0.1,
    hintHtml: 'Release SPACE on <span class="skill-hint-green">green</span> for bonus!'
  });

  await animatePlayerAttack();
  playSfx("attack", 0.6);

  let maxTargets = 1;
  if (reason === "green") {
    maxTargets = enemies.length;
    setPlayerSkillFeedback("Great!", "great");
  } else if (reason === "yellow") {
    maxTargets = Math.min(3, enemies.length);
    setPlayerSkillFeedback("Good!", "good");
  } else if (reason === "red") {
    maxTargets = Math.min(2, enemies.length);
  } else if (reason === "timeout") {
  } else if (reason === "overhold") {
  } else {
  }

  const targets = enemies.slice(0, maxTargets);
  for (const enemy of targets) {
    const dmg = Math.max(1, player.atk - enemy.def);
    await applyDamageToEnemy(enemy, dmg, true);
  }

  await dashBack(activePlayerCharId());
  await resolvePostPlayerAction();
}

async function playerDefend() {
  if (actionsLocked) return;
  if (queuePlayerTurnAction(executePlayerDefend)) return;
  await executePlayerDefend();
}

async function executePlayerDefend() {
  setActionsLocked(true);
  setPlayerSkillFeedback();
  if (isDuoMode()) {
    duoDefendBuffActive[activeDuoPlayer] = true;
  } else {
    defendBuffActive = true;
  }
  applyStatus(player, "resistance", 3, 1);
  player.sp = Math.min(player.maxSp, player.sp + 10);
  logCombatUse(displayCharacterName(selectedCharacter || "player"), "Defend");
  await animatePlayerDefend();
  await resolvePostPlayerAction();
}

async function playerPotion() {
  if (actionsLocked) return;
  if (player.hp >= player.maxHp) return;
  if (queuePlayerTurnAction(executePlayerPotion)) return;
  await executePlayerPotion();
}

async function executePlayerPotion() {
  setActionsLocked(true);
  setPlayerSkillFeedback();

  if (!player.heal(15)) {
    setActionsLocked(false);
    startIdleAnimations();
    renderCombatActions();
    return;
  }

  applyStatus(player, "regen", 2, 3);
  logCombatUse(displayCharacterName(selectedCharacter || "player"), "Healing Potion");
  await animatePlayerHeal();
  await resolvePostPlayerAction();
}

async function summonHelper() {
  if (actionsLocked) return;
  if (!helperUnlocked) return;
  if (!helperCanSummonThisLevel) return;
  if (player.sp < 100) return;
  if (queuePlayerTurnAction(executeSummonHelper)) return;
  await executeSummonHelper();
}

async function executeSummonHelper() {
  setActionsLocked(true);
  setPlayerSkillFeedback();
  if (!helperCanSummonThisLevel) {
    setActionsLocked(false);
    return;
  }
  if (player.sp < 100) {
    setActionsLocked(false);
    return;
  }

  player.sp -= 100;
  if (helper) {
    const healAmount = 20 + helperTrainingUpgrades * 10;
    helper.hp = Math.min(helper.maxHp, helper.hp + healAmount);
    helperCanSummonThisLevel = false;
    logCombatCast(displayCharacterName(selectedCharacter || "player"), "Heal Helper", "HELPER");
  } else {
    helper = createHelper();
    helperCanSummonThisLevel = false;
    logCombatSummon(displayCharacterName(selectedCharacter || "player"), "HELPER");
    refreshUI();
    await animateSummonArrival("helperChar", { from: "left" });
    startIdleAnimations();
    renderCombatActions();
    await resolvePostPlayerAction();
    return;
  }
  refreshUI();
  startIdleAnimations();
  renderCombatActions();
  await resolvePostPlayerAction();
}

function statusDisplayName(key) {
  return STATUS_DISPLAY_NAMES[normalizeStatusKey(key)] || "Resistance";
}

function statusDebuffForSupport() {
  return Math.random() < 0.5 ? "poison" : "weakness";
}

function statusBuffForSupport() {
  return Math.random() < 0.5 ? "regen" : "resistance";
}

function supportBuffTarget() {
  const allies = enemies.filter((candidate) => candidate && candidate.hp > 0 && !candidate.boss);
  if (allies.length) return allies[Math.floor(Math.random() * allies.length)];
  return enemies.find((candidate) => candidate && candidate.hp > 0) || null;
}

function enemyAttackProfile(enemy) {
  if (enemy.tank) return { name: "Punch", damageMultiplier: 1, statusOnHit: null };
  if (enemy.bruiser) {
    const roll = Math.random();
    if (roll < 0.34) return { name: "Heavy Blow", damageMultiplier: 1.75, statusOnHit: null };
    if (roll < 0.67) {
      return {
        name: "Slow Blow",
        damageMultiplier: 1,
        statusOnHit: { key: "slowness", power: 5, turns: 2 }
      };
    }
    return {
      name: "Stunning Blow",
      damageMultiplier: 0.85,
      statusOnHit: { key: "stunned", power: 10, turns: 1 }
    };
  }
  return { name: "Attack", damageMultiplier: 1, statusOnHit: null };
}

function duoPlayerTarget() {
  if (!isDuoMode()) return null;
  return pickRandomLivingDuoTarget({
    duoPlayers,
    duoCharacters,
    displayCharacterName
  });
}

function hasLivingDuoPlayer() {
  return duoPlayers.some((unit) => unit && unit.hp > 0);
}

function isPlayerPartyDefeated() {
  if (isDuoMode()) return !hasLivingDuoPlayer();
  return !player || player.hp <= 0;
}

function supportTarget() {
  const companions = [];
  if (helper) companions.push({ id: "helperChar", unit: helper, label: "HELPER", isPlayer: false, isShadow: false });
  const shadow = getKostyaShadow();
  if (shadow) companions.push({ id: "shadowChar", unit: shadow, label: "Shadow", isPlayer: false, isShadow: true });
  if (isDuoMode()) {
    if (companions.length && Math.random() < 0.33) {
      return companions[Math.floor(Math.random() * companions.length)];
    }
    const duoTarget = duoPlayerTarget();
    if (duoTarget) return duoTarget;
  }
  if (companions.length && Math.random() < 0.5) return companions[Math.floor(Math.random() * companions.length)];
  return {
    id: "playerChar",
    unit: player,
    label: displayCharacterName(selectedCharacter || "player"),
    isPlayer: true,
    characterKey: selectedCharacter || "player",
    playerIndex: isDuoMode() ? activeDuoPlayer : 0
  };
}

function bossContext() {
  return {
    isDuoMode: () => isDuoMode(),
    duoPlayerTarget,
    getPlayer: () => player,
    displayCharacterName,
    getSelectedCharacter: () => selectedCharacter,
    getActiveDuoPlayer: () => activeDuoPlayer,
    isPartyDefeated: () => isPlayerPartyDefeated(),
    skillCheckKeysForPlayerIndex,
    currentSkillCheckKeys,
    playerSpriteIdForIndex,
    getEl,
    enemySpriteSet,
    playEnemyFrames,
    dashToward,
    positionSkillCheckBelow,
    setActionHint,
    runSkillCheck,
    dashBack,
    isDefendingPlayerIndex,
    applyAttackerDamageModifiers,
    applyDamageModifiers,
    setPlayerSkillFeedback,
    animateTargetPlayerParry,
    animateTargetPlayerDodge,
    playSfx,
    applyIncomingDamage,
    animateTargetPlayerDamaged,
    onPlayerUnitDamaged,
    patrickDodgeSpGain,
    applyStatus,
    maybeLogFatalDamage,
    addLog,
    logCombatUse,
    logCombatCast,
    logCombatSummon,
    logCombatDodged,
    logCombatPartialDodge,
    logCombatCounter,
    logCombatParry,
    setActionsLocked,
    refreshUI,
    animateSummonArrival,
    createEnemy,
    rebuildEnemyDisplayNames,
    getEnemies: () => enemies,
    enemyLabel
  };
}


async function enemySupportAction(enemy) {
  if (Math.random() < 0.5) {
    const buffTarget = supportBuffTarget();
    if (!buffTarget) return { playerDied: false, levelCleared: false };
    await playEnemyFrames(enemy, enemySpriteSet(enemy).attack, 95);
    applyStatus(buffTarget, statusBuffForSupport(), 2, 2);
    logCombatCast(enemy, "Buff Cast", buffTarget);
    refreshUI();
    return { playerDied: false, levelCleared: false };
  }

  const target = supportTarget();
  const debuff = statusDebuffForSupport();
  const power = debuff === "weakness" ? 2 : 1;

  playSfx("swordDrawn", 0.5);
  await dashToward(`enemy-entity-${enemy.id}`, target.id, 340, false);
  positionSkillCheckBelow(`enemy-entity-${enemy.id}`);

  let dodge = { reason: "none" };
  if (target.isPlayer) {
    const acceptedKeys = isDuoMode() && Number.isInteger(target.playerIndex)
      ? skillCheckKeysForPlayerIndex(target.playerIndex)
      : currentSkillCheckKeys();
    dodge = await runSkillCheck({
      yellowEnabled: false,
      greenWidth: hasSlateskin(target.unit) ? slateskinGreenWidth(target.unit, 0.08) : 0.08,
      holdFillDurationMs: hasSlateskin(target.unit) ? slateskinHoldFillDuration(target.unit, 900) : 900,
      hintHtml: 'Release SPACE on <span class="skill-hint-green">green</span> to dodge!',
      acceptedKeys,
      ownerPlayerIndex: Number.isInteger(target.playerIndex) ? target.playerIndex : (isDuoMode() ? activeDuoPlayer : null)
    });
    if (hasSlateskin(target.unit)) {
      applySlateskinDodgeWear(target.unit, dodge.reason);
    }
  }

  await playEnemyFrames(enemy, enemySpriteSet(enemy).attack, 95);
  logCombatCast(enemy, "Debuff Cast", target);

  if (target.isPlayer && dodge.reason === "green") {
    const targetCharacter = target.characterKey || selectedCharacter;
    logCombatDodged(target.label);
    if (targetCharacter === "patrick") {
      playSfx("dodge", 0.65);
      await animateTargetPlayerDodge(target.id, targetCharacter);
      patrickDodgeSpGain(target.unit, "great");
    } else if (targetCharacter === "kostya") {
      playSfx("clash", 0.6);
      await animateTargetPlayerDodge(target.id, targetCharacter);
    }
    setPlayerSkillFeedback("Great!", "great", 1800, target.playerIndex);
  } else {
    applyStatus(target.unit, debuff, power, 2);
  }

  await dashBack(`enemy-entity-${enemy.id}`);
  refreshUI();
  return { playerDied: false, levelCleared: false };
}

async function enemyAttackAction(enemy) {
  if (enemy.support) {
    return enemySupportAction(enemy);
  }
  const attackProfile = enemyAttackProfile(enemy);

  const duoTarget = isDuoMode() ? duoPlayerTarget() : null;
  const companions = [];
  if (helper) companions.push({ id: "helperChar", unit: helper, isShadow: false });
  const shadow = getKostyaShadow();
  if (shadow) companions.push({ id: "shadowChar", unit: shadow, isShadow: true });
  const pickedCompanion = !duoTarget && companions.length ? companions[Math.floor(Math.random() * companions.length)] : null;
  const attackTargetId = duoTarget ? duoTarget.id : pickedCompanion ? pickedCompanion.id : "playerChar";
  playSfx("swordDrawn", 0.5);
  await dashToward(`enemy-entity-${enemy.id}`, attackTargetId, 340, false);
  positionSkillCheckBelow(`enemy-entity-${enemy.id}`);

  if (!duoTarget && pickedCompanion) {
    await playEnemyFrames(enemy, enemySpriteSet(enemy).attack, 95);
    const unit = pickedCompanion.unit;
    const base = Math.max(1, enemy.atk - unit.def);
    let dmg = unit.defending ? Math.max(1, Math.ceil(base * 0.5)) : base;
    dmg = Math.max(1, Math.ceil(dmg * attackProfile.damageMultiplier));
    dmg = applyAttackerDamageModifiers(enemy, dmg);
    dmg = applyDamageModifiers(unit, dmg);
    unit.defending = false;
    applyLayeredDamage(unit, dmg);
    if (dmg > 0 && !enemy.boss) playSfx("attack", 0.55);
    if (pickedCompanion.isShadow && dmg > 0) playSfx("attack", 0.5);
    await playFramesById(
      pickedCompanion.isShadow ? "shadowSprite" : "helperSprite",
      pickedCompanion.isShadow
        ? getCachedKostyaShadowDamagedFrames()
        : [helper?.sprite || playerSprites().idle[0]],
      80
    );
    await dashBack(`enemy-entity-${enemy.id}`);
    logCombatUse(enemy, attackProfile.name, pickedCompanion.isShadow ? "Shadow" : "HELPER");
    if (dmg > 0 && attackProfile.statusOnHit) {
      applyStatus(unit, attackProfile.statusOnHit.key, attackProfile.statusOnHit.power, attackProfile.statusOnHit.turns);
    }
    if (unit.hp <= 0) {
      addLog(`${pickedCompanion.isShadow ? "Shadow" : "HELPER"} collapsed.`, "collapse-ally");
      if (pickedCompanion.isShadow) killShadowForLevel();
      else killHelperForLevel();
    }
    refreshUI();
    return { playerDied: false, levelCleared: false };
  }

  const dodgeTargetCharacter = duoTarget ? duoTarget.characterKey : selectedCharacter;
  const kostyaCounterWindow = dodgeTargetCharacter === "kostya";
  const targetUnit = duoTarget ? duoTarget.unit : player;
  const slateskinActive = hasSlateskin(targetUnit);
  const dodge = await runSkillCheck({
    yellowEnabled: true,
    innerRedEnabled: kostyaCounterWindow,
    innerRedWidth: 0.03,
    innerRedReason: "counter",
    greenWidth: (() => {
      const defending = isDefendingPlayerIndex(duoTarget ? duoTarget.playerIndex : null);
      const baseGreen = defending ? 0.13 : 0.08;
      return slateskinActive ? slateskinGreenWidth(targetUnit, baseGreen) : baseGreen;
    })(),
    yellowExtra: (() => {
      const defending = isDefendingPlayerIndex(duoTarget ? duoTarget.playerIndex : null);
      void defending;
      return slateskinActive ? slateskinScaledYellowExtra(targetUnit, 0.12) : 0.12;
    })(),
    holdFillDurationMs: slateskinActive ? slateskinHoldFillDuration(targetUnit, 900) : 900,
    hintHtml: kostyaCounterWindow
      ? 'Release SPACE on <span class="skill-hint-red">red</span> to counter!'
      : slateskinActive
        ? 'Release SPACE in <span class="skill-hint-yellow">yellow</span> to dodge!'
      : 'Release SPACE on <span class="skill-hint-green">green</span> to dodge!',
    acceptedKeys: duoTarget && Number.isInteger(duoTarget.playerIndex)
      ? skillCheckKeysForPlayerIndex(duoTarget.playerIndex)
      : currentSkillCheckKeys(),
    ownerPlayerIndex: duoTarget && Number.isInteger(duoTarget.playerIndex)
      ? duoTarget.playerIndex
      : (isDuoMode() ? activeDuoPlayer : null)
  });
  if (slateskinActive) {
    applySlateskinDodgeWear(targetUnit, dodge.reason);
  }
  await playEnemyFrames(enemy, enemySpriteSet(enemy).attack, 95);

  const defendingAtImpact = isDefendingPlayerIndex(duoTarget ? duoTarget.playerIndex : null);
  if (defendingAtImpact) {
    playSfx("swordFailed", 0.65);
    playSfx("block", 0.6);
  }

  const targetCharacter = duoTarget ? duoTarget.characterKey : selectedCharacter;
  const targetLabel = duoTarget ? duoTarget.label : displayCharacterName(selectedCharacter || "player");
  const baseDamage = Math.max(1, enemy.atk - targetUnit.def);
  let finalDamage = Math.max(1, Math.ceil(baseDamage * attackProfile.damageMultiplier));
  let deflectDamage = 0;
  let isKostyaCounter = false;

  logCombatUse(enemy, attackProfile.name, targetLabel);

  if (dodge.reason === "counter" && targetCharacter === "kostya") {
    finalDamage = 0;
    deflectDamage = Math.max(1, Math.ceil(baseDamage * 0.5));
    isKostyaCounter = true;
    logCombatCounter(targetLabel);
    playSfx("clash", 0.6);
    targetUnit.sp = Math.min(targetUnit.maxSp, targetUnit.sp + 8);
    setPlayerSkillFeedback("Counter!", "counter", 1800, duoTarget ? duoTarget.playerIndex : 0);
    if (duoTarget) await animateTargetPlayerParry(duoTarget.id, targetCharacter);
    else await animateTargetPlayerParry("playerChar", targetCharacter);
  } else if (dodge.reason === "green") {
    if (targetCharacter === "patrick") {
      playSfx("dodge", 0.65);
      if (duoTarget) await animateTargetPlayerDodge(duoTarget.id, targetCharacter);
      else await animateTargetPlayerDodge("playerChar", targetCharacter);
      patrickDodgeSpGain(targetUnit, "great");
    } else if (targetCharacter === "kostya") {
      playSfx("clash", 0.6);
      if (duoTarget) await animateTargetPlayerDodge(duoTarget.id, targetCharacter);
      else await animateTargetPlayerDodge("playerChar", targetCharacter);
    } else {
      playSfx("clash", 0.6);
    }
    if (targetCharacter === "kostya") {
      targetUnit.sp = Math.min(targetUnit.maxSp, targetUnit.sp + 4);
    }
    if (defendingAtImpact) {
      logCombatParry(targetLabel);
      deflectDamage = Math.max(1, Math.ceil(baseDamage * 0.5)) + parryBonusDamage;
      targetUnit.sp = Math.min(targetUnit.maxSp, targetUnit.sp + 10);
      finalDamage = 0;
      setPlayerSkillFeedback("Parry!", "parry", 1800, duoTarget ? duoTarget.playerIndex : 0);
      if (duoTarget) await animateTargetPlayerParry(duoTarget.id, targetCharacter);
      else await animateTargetPlayerParry("playerChar", targetCharacter);
    } else {
      logCombatDodged(targetLabel);
      finalDamage = 0;
      setPlayerSkillFeedback("Great!", "great", 1800, duoTarget ? duoTarget.playerIndex : 0);
    }
  } else if (dodge.reason === "yellow") {
    logCombatPartialDodge(targetLabel);
    if (defendingAtImpact) {
      finalDamage = 0;
      if (targetCharacter === "patrick") patrickDodgeSpGain(targetUnit, "good");
      setPlayerSkillFeedback("Good!", "good", 1800, duoTarget ? duoTarget.playerIndex : 0);
    } else {
      finalDamage = Math.max(1, Math.ceil(finalDamage * 0.5));
      if (targetCharacter === "patrick") patrickDodgeSpGain(targetUnit, "good");
      setPlayerSkillFeedback("Good!", "good", 1800, duoTarget ? duoTarget.playerIndex : 0);
    }
    if (targetCharacter === "kostya") {
      targetUnit.sp = Math.min(targetUnit.maxSp, targetUnit.sp + 2);
    }
  } else if (dodge.reason === "timeout") {
  } else if (dodge.reason === "overhold") {
  } else {
  }
  if (deflectDamage > 0) {
    const dealt = isKostyaCounter
      ? applyIncomingDamage(enemy, deflectDamage, true, targetUnit, { ignoreResistance: true })
      : applyIncomingDamage(enemy, deflectDamage, true, targetUnit);
    await playEnemyFrames(enemy, enemySpriteSet(enemy).damaged, 110);
    await dashBack(`enemy-entity-${enemy.id}`);
    void dealt;
    void targetCharacter;
    await removeDeadEnemies();
    refreshUI();
    if (!enemies.length) return { playerDied: false, levelCleared: true };
    return { playerDied: false, levelCleared: false };
  }

  finalDamage = applyAttackerDamageModifiers(enemy, finalDamage);
  finalDamage = applyDamageModifiers(targetUnit, finalDamage);

  if (finalDamage > 0) {
    applyLayeredDamage(targetUnit, finalDamage);
    maybeLogFatalDamage(targetLabel, targetUnit, finalDamage);
    onPlayerUnitDamaged(targetUnit, targetCharacter, finalDamage);
    if (attackProfile.statusOnHit) {
      applyStatus(targetUnit, attackProfile.statusOnHit.key, attackProfile.statusOnHit.power, attackProfile.statusOnHit.turns);
    }
    if (!enemy.boss) playSfx("attack", 0.55);
    if (duoTarget) await animateTargetPlayerDamaged(duoTarget.id, targetCharacter);
    else await animatePlayerDamaged();
  } else if (hasSlateskin(targetUnit)) {
    playSfx("swordFailed", 0.65);
    if (duoTarget) await animateTargetPlayerDamaged(duoTarget.id, targetCharacter);
    else await animatePlayerDamaged();
  }

  await dashBack(`enemy-entity-${enemy.id}`);

  if (targetUnit.hp <= 0) {
    targetUnit.hp = 0;
    addLog(`${targetLabel} collapsed.`, "collapse-ally");
    getEl("actions").innerHTML = "";
    setActionsLocked(true);
    refreshUI();
    return { playerDied: isPlayerPartyDefeated(), levelCleared: false };
  }

  return { playerDied: false, levelCleared: false };
}

async function enemyPhase() {
  let anyAttack = false;
  const stanceWasActive = anyDefendStanceActive();

  for (const enemy of [...enemies]) {
    if (!enemies.find((e) => e.id === enemy.id)) continue;
    const enemyActions = claimEntityActionsForTurn(enemy);
    if (enemyActions <= 0) {
      maybeSkipTurnFromSlowness(enemy, enemyLabel(enemy));
    }
    if (enemyActions <= 0) continue;

    for (let actionIndex = 0; actionIndex < enemyActions; actionIndex += 1) {
      if (!enemies.find((e) => e.id === enemy.id) || enemy.hp <= 0) break;
      if (maybeSkipTurnFromStun(enemy, enemyLabel(enemy))) {
        refreshUI();
        continue;
      }

      await sleep(PRE_TURN_DELAY_MS);

      if (enemy.boss) {
        if (isFinalBoss(enemy)) {
          const result = await bossOverlordAction(enemy, bossContext());
          if (result.playerDied) return result;
          if (result.levelCleared) {
            await sleep(250);
            await handleLevelClear();
            return { playerDied: false, levelCleared: true };
          }
          continue;
        }
        const summoned = await bossTrySummon(enemy, bossContext());
        if (summoned) continue;
      } else if (Math.random() < enemy.blockChance) {
        enemy.blocking = true;
        applyStatus(enemy, "resistance", enemy.tank ? 5 : 3, 999);
        await playEnemyFrames(enemy, enemySpriteSet(enemy).block, 120);
        logCombatUse(enemy, "Block");
        refreshUI();
        continue;
      }

      anyAttack = true;
      const result = await enemyAttackAction(enemy);
      if (result.playerDied) return result;
      if (result.levelCleared) {
        await sleep(250);
        await handleLevelClear();
        return { playerDied: false, levelCleared: true };
      }
    }
  }

  if (stanceWasActive) {
    clearDefendStances();
  }

  if (isDuoMode()) {
    duoPlayers.forEach((unit, idx) => {
      if (unit) {
        applyStatusOverTime(unit, `Player ${idx + 1}`);
        tickSlateskin(unit);
      }
    });
  } else {
    applyStatusOverTime(player, "Player");
    tickSlateskin(player);
  }
  if (helper) applyStatusOverTime(helper, "HELPER");
  const shadow = getKostyaShadow();
  if (shadow) applyStatusOverTime(shadow, "Shadow");
  enemies.forEach((enemy) => applyStatusOverTime(enemy, enemyLabel(enemy)));

  await removeDeadEnemies();
  if (!enemies.length) {
    refreshUI();
    await sleep(250);
    await handleLevelClear();
    return { playerDied: false, levelCleared: true };
  }

  if (helper && helper.hp <= 0) {
    addLog("HELPER collapsed.", "collapse-ally");
    killHelperForLevel();
  }
  if (shadow && shadow.hp <= 0) {
    addLog("Shadow collapsed.", "collapse-ally");
    killShadowForLevel();
  }

  const deadDuoPlayer = isDuoMode()
    ? duoPlayers.find((unit) => unit && unit.hp <= 0)
    : null;
  if ((!isDuoMode() && player.hp <= 0) || (isDuoMode() && !hasLivingDuoPlayer())) {
    if (deadDuoPlayer) deadDuoPlayer.hp = 0;
    else player.hp = 0;
    if (deadDuoPlayer && !isDuoMode()) {
      const fallenIdx = duoPlayers.findIndex((unit) => unit === deadDuoPlayer);
      const fallenKey = fallenIdx >= 0 ? duoCharacters[fallenIdx] : selectedCharacter || "player";
      addLog(`${displayCharacterName(fallenKey)} collapsed.`, "collapse-ally");
    } else if (!isDuoMode()) {
      addLog(`${displayCharacterName(selectedCharacter || "player")} collapsed.`, "collapse-ally");
    }
    getEl("actions").innerHTML = "";
    setActionsLocked(true);
    refreshUI();
    return { playerDied: true, levelCleared: false };
  }

  if (isDuoMode()) {
    duoPlayers.forEach((unit, idx) => {
      if (unit) tickStatusDurations(unit, `Player ${idx + 1}`);
    });
  } else {
    tickStatusDurations(player, "Player");
  }
  if (helper) tickStatusDurations(helper, "HELPER");
  if (shadow) tickStatusDurations(shadow, "Shadow");
  enemies.forEach((enemy) => tickStatusDurations(enemy, enemyLabel(enemy)));

  if (isPlayerPartyDefeated()) {
    getEl("actions").innerHTML = "";
    setActionsLocked(true);
    refreshUI();
    return { playerDied: true, levelCleared: false };
  }

  return { playerDied: false, levelCleared: false };
}

async function teleportToLevelDebug(targetLevel) {
  if (actionsLocked) return;
  const safeLevel = Math.max(1, Math.min(50, Math.floor(Number(targetLevel) || 1)));
  setActionsLocked(true);
  setPlayerSkillFeedback();
  level = safeLevel;
  startNewLevelState();
  if (isDuoMode()) switchToDuoPlayer(0);
  enemies = spawnLevelEnemies();
  await enterCurrentEncounter();
}

async function killAllDebug() {
  if (actionsLocked) return;
  setActionsLocked(true);
  setPlayerSkillFeedback();
  enemies.forEach((enemy) => {
    enemy.hp = 0;
  });
  await removeDeadEnemies();
  refreshUI();
  if (!enemies.length) {
    await sleep(120);
    await handleLevelClear();
    return;
  }
  setActionsLocked(false);
}

function refillAllResourcesDebug() {
  const hasKostya = isDuoMode()
    ? duoCharacters.includes("kostya")
    : selectedCharacter === "kostya";
  if (isDuoMode()) {
    duoPlayers.forEach((unit) => {
      if (!unit) return;
      unit.hp = unit.maxHp;
      unit.sp = unit.maxSp;
      unit.luckyCharges = luckyChargeCapForLevel(level);
    });
    player = duoPlayers[activeDuoPlayer] || player;
  } else {
    player.hp = player.maxHp;
    player.sp = player.maxSp;
    player.luckyCharges = luckyChargeCapForLevel(level);
  }
  if (hasKostya) {
    setKostyaShadowChargePct(100);
  }
  if (helper) helper.hp = helper.maxHp;
  refreshUI();
  renderCombatActions();
}

function debugProgressionCharacterKey() {
  return isDuoMode() ? duoCharacters[activeDuoPlayer] : (selectedCharacter || "player");
}

function debugProgressionUnit() {
  return isDuoMode() ? duoPlayers[activeDuoPlayer] : player;
}

function debugBranchState(optionA, enabledA, optionB, enabledB) {
  if (enabledA && enabledB) {
    return { primary: optionA, bonus: optionB };
  }
  if (enabledA) {
    return { primary: optionA, bonus: "none" };
  }
  if (enabledB) {
    return { primary: optionB, bonus: "none" };
  }
  return { primary: "none", bonus: "none" };
}

function currentDebugProgressionConfig() {
  const characterKey = debugProgressionCharacterKey();
  if (characterKey === "patrick") {
    const progress = getPatrickDebugProgress();
    const tier1 = debugBranchState("hallow", progress.evolutions.hallow, "piercing", progress.evolutions.piercing);
    const tier2 = debugBranchState("aceSpades", progress.evolutions.aceSpades, "aceDiamonds", progress.evolutions.aceDiamonds);
    const tier3 = debugBranchState("dualWielding", progress.evolutions.dualWielding, "magnumShot", progress.evolutions.magnumShot);
    const tier4 = debugBranchState("sixShooter", progress.evolutions.sixShooter, "aceHearts", progress.evolutions.aceHearts);
    return {
      points: {
        luck: progress.luckUpgrades,
        gambler: progress.gamblerUpgrades,
        magnum: progress.magnumUpgrades
      },
      branches: {
        tier1: tier1.primary,
        tier2: tier2.primary,
        tier3: tier3.primary,
        tier4: tier4.primary,
        bonus: [tier1.bonus, tier2.bonus, tier3.bonus, tier4.bonus].find((value) => value !== "none") || "none"
      }
    };
  }
  if (characterKey === "kostya") {
    const upgrades = getKostyaUpgrades();
    const unlocks = getKostyaCurrentUnlocks();
    const tier1 = debugBranchState("lunge", unlocks.lungeUnlocked, "decayingStab", unlocks.decayingStabUnlocked);
    const tier2 = debugBranchState("sharpTip", unlocks.sharpTipUnlocked, "transformation", unlocks.transformationUnlocked);
    const tier3 = debugBranchState("cleave", unlocks.cleaveUnlocked, "heartyRecovery", unlocks.heartyRecoveryUnlocked);
    const tier4 = debugBranchState("shadowRecast", unlocks.shadowRecastUnlocked, "darkerLayer", unlocks.darkerLayerUnlocked);
    return {
      points: {
        strongerBlade: upgrades.strongerBladeUpgrades,
        endurance: upgrades.noLightUpgrades,
        endarkement: upgrades.endarkementUpgrades
      },
      branches: {
        tier1: tier1.primary,
        tier2: tier2.primary,
        tier3: tier3.primary,
        tier4: tier4.primary,
        bonus: [tier1.bonus, tier2.bonus, tier3.bonus, tier4.bonus].find((value) => value !== "none") || "none"
      }
    };
  }
  return {
    points: {
      blade: bladeUpgrades,
      endure: endureUpgrades,
      strengthen: strengthenUpgrades,
      helperTrain: helperTrainingUpgrades
    },
    branches: {}
  };
}

function applyDebugProgressionConfig(config) {
  const characterKey = debugProgressionCharacterKey();
  const unit = debugProgressionUnit();
  if (!unit) return;

  helperUnlocked = true;

  const baseUnit = createCharacterPlayer(characterKey);
  unit.maxHp = baseUnit.maxHp;
  unit.hp = baseUnit.hp;
  unit.maxSp = baseUnit.maxSp;
  unit.sp = baseUnit.maxSp;
  unit.atk = baseUnit.atk;
  unit.def = baseUnit.def;
  unit.luckyCharges = baseUnit.luckyCharges || 0;

  if (characterKey === "patrick") {
    const selectedPatrickBranches = new Set([
      config.branches.tier1,
      config.branches.tier2,
      config.branches.tier3,
      config.branches.tier4,
      config.branches.bonus
    ].filter((value) => value && value !== "none"));
    resetPatrickProgress();
    setPatrickDebugProgress({
      luckUpgrades: config.points.luck,
      gamblerUpgrades: config.points.gambler,
      magnumUpgrades: config.points.magnum,
      evolutions: {
        hallow: selectedPatrickBranches.has("hallow"),
        piercing: selectedPatrickBranches.has("piercing"),
        aceSpades: selectedPatrickBranches.has("aceSpades"),
        aceDiamonds: selectedPatrickBranches.has("aceDiamonds"),
        dualWielding: selectedPatrickBranches.has("dualWielding"),
        magnumShot: selectedPatrickBranches.has("magnumShot"),
        sixShooter: selectedPatrickBranches.has("sixShooter"),
        aceHearts: selectedPatrickBranches.has("aceHearts")
      }
    }, unit, { maxHpCap: PATRICK_MAX_HP_CAP });
    unit.luckyCharges = luckyChargeCapForLevel(level);
  } else if (characterKey === "kostya") {
    const selectedKostyaBranches = new Set([
      config.branches.tier1,
      config.branches.tier2,
      config.branches.tier3,
      config.branches.tier4,
      config.branches.bonus
    ].filter((value) => value && value !== "none"));
    resetKostyaProgress();
    setKostyaUpgrade("strongerBlade", config.points.strongerBlade);
    setKostyaUpgrade("noLight", config.points.endurance);
    setKostyaUpgrade("endarkement", config.points.endarkement);
    setKostyaAbilityUnlock("lunge", selectedKostyaBranches.has("lunge"));
    setKostyaAbilityUnlock("decayingStab", selectedKostyaBranches.has("decayingStab"));
    setKostyaAbilityUnlock("sharpTip", selectedKostyaBranches.has("sharpTip"));
    setKostyaAbilityUnlock("transformation", selectedKostyaBranches.has("transformation"));
    setKostyaAbilityUnlock("cleave", selectedKostyaBranches.has("cleave"));
    setKostyaAbilityUnlock("heartyRecovery", selectedKostyaBranches.has("heartyRecovery"));
    setKostyaAbilityUnlock("shadowRecast", selectedKostyaBranches.has("shadowRecast"));
    setKostyaAbilityUnlock("darkerLayer", selectedKostyaBranches.has("darkerLayer"));
    unit.maxHp = Math.min(KOSTYA_MAX_HP_CAP, baseUnit.maxHp + config.points.endurance * 5);
    unit.hp = unit.maxHp;
    unit.sp = unit.maxSp;
    setKostyaShadowChargePct(100);
  } else {
    bladeUpgrades = config.points.blade;
    endureUpgrades = config.points.endure;
    strengthenUpgrades = config.points.strengthen;
    helperTrainingUpgrades = config.points.helperTrain;
    parryBonusDamage = strengthenUpgrades;
    unit.atk = baseUnit.atk + bladeUpgrades * 2;
    unit.def = baseUnit.def + strengthenUpgrades;
    unit.maxHp = baseUnit.maxHp + endureUpgrades * 5;
    unit.hp = unit.maxHp;
    unit.sp = unit.maxSp;
  }

  if (helper) {
    helper.maxHp = 20 + helperTrainingUpgrades * 10;
    helper.hp = helper.maxHp;
  }
  if (isDuoMode()) player = duoPlayers[activeDuoPlayer] || player;
  refreshUI();
  renderCombatActions();
}

function openDebugProgressionBuilder() {
  const characterKey = debugProgressionCharacterKey();
  const current = currentDebugProgressionConfig();
  const points = { ...current.points };
  if (characterKey === "patrick") {
    points.luck = Math.min(10, Math.max(0, points.luck || 0));
    points.gambler = Math.min(10, Math.max(0, points.gambler || 0));
  }
  const branches = { ...current.branches };
  const upgradeRows = characterKey === "patrick"
    ? [
      { id: "luck", label: "Luck Expertise", max: 10, hint: "Max 10" },
      { id: "gambler", label: "Slot Machine", max: 10, hint: "Max 10" },
      { id: "magnum", label: "Bullet Enhancement", hint: "No cap" }
    ]
    : characterKey === "kostya"
      ? [
        { id: "strongerBlade", label: "Stronger Blade" },
        { id: "endurance", label: "Endurance" },
        { id: "endarkement", label: "Endarkement" }
      ]
      : [
        { id: "blade", label: "Blade Up" },
        { id: "endure", label: "Endure Up" },
        { id: "strengthen", label: "Strengthen Up" },
        { id: "helperTrain", label: "Train with Helper" }
      ];
  const branchRows = characterKey === "patrick"
    ? [
      { id: "tier1", label: "Gun Upgrade", options: [{ value: "none", label: "None" }, { value: "hallow", label: "Hallow Shot" }, { value: "piercing", label: "Piercing Shot" }] },
      { id: "tier2", label: "Aces Upgrade", options: [{ value: "none", label: "None" }, { value: "aceSpades", label: "Ace of Spades" }, { value: "aceDiamonds", label: "Ace of Diamonds" }] },
      { id: "tier3", label: "Gun Style", options: [{ value: "none", label: "None" }, { value: "dualWielding", label: "Dual Wielding" }, { value: "magnumShot", label: "Magnum Shot" }] },
      { id: "tier4", label: "Final Upgrade", options: [{ value: "none", label: "None" }, { value: "sixShooter", label: "Six Shooter" }, { value: "aceHearts", label: "Ace of Hearts" }] },
      { id: "bonus", label: "Bonus Leftover Pick", options: [{ value: "none", label: "None" }, { value: "hallow", label: "Hallow Shot" }, { value: "piercing", label: "Piercing Shot" }, { value: "aceSpades", label: "Ace of Spades" }, { value: "aceDiamonds", label: "Ace of Diamonds" }, { value: "dualWielding", label: "Dual Wielding" }, { value: "magnumShot", label: "Magnum Shot" }, { value: "sixShooter", label: "Six Shooter" }, { value: "aceHearts", label: "Ace of Hearts" }] }
    ]
    : characterKey === "kostya"
      ? [
        { id: "tier1", label: "Blade Upgrade", options: [{ value: "none", label: "None" }, { value: "lunge", label: "Lunge" }, { value: "decayingStab", label: "Decaying Stab" }] },
        { id: "tier2", label: "Shadow Upgrade", options: [{ value: "none", label: "None" }, { value: "sharpTip", label: "Sharp Tip" }, { value: "transformation", label: "Transformation" }] },
        { id: "tier3", label: "Final Blade Upgrade", options: [{ value: "none", label: "None" }, { value: "cleave", label: "Cleave" }, { value: "heartyRecovery", label: "Hearty Recovery" }] },
        { id: "tier4", label: "Shadow Mastery", options: [{ value: "none", label: "None" }, { value: "shadowRecast", label: "Shadow Recast" }, { value: "darkerLayer", label: "Darker Layer" }] },
        { id: "bonus", label: "Bonus Leftover Pick", options: [{ value: "none", label: "None" }, { value: "lunge", label: "Lunge" }, { value: "decayingStab", label: "Decaying Stab" }, { value: "sharpTip", label: "Sharp Tip" }, { value: "transformation", label: "Transformation" }, { value: "cleave", label: "Cleave" }, { value: "heartyRecovery", label: "Hearty Recovery" }, { value: "shadowRecast", label: "Shadow Recast" }, { value: "darkerLayer", label: "Darker Layer" }] }
      ]
      : [];

  document.body?.classList.add("choice-overlay-active");
  const overlay = document.createElement("div");
  overlay.className = "choice-overlay debug-progression-overlay";
  const panel = document.createElement("div");
  panel.className = "choice-panel debug-progression-panel";
  overlay.appendChild(panel);

  const titleEl = document.createElement("div");
  titleEl.className = "choice-title";
  titleEl.innerText = `${displayCharacterName(characterKey)} Upgrade Builder`;
  panel.appendChild(titleEl);

  const subtitleEl = document.createElement("div");
  subtitleEl.className = "choice-subtitle";
  subtitleEl.innerText = "Spend 49 points however you want, pick branch unlocks instantly, and add one leftover boss pick.";
  panel.appendChild(subtitleEl);

  const metaEl = document.createElement("div");
  metaEl.className = "debug-progression-meta";
  metaEl.innerText = characterKey === "patrick"
    ? "Patrick rules: Luck Expertise and Slot Machine are capped at 10."
    : "Builder rules: spend points freely, then choose branch unlocks below.";
  panel.appendChild(metaEl);

  const pointsEl = document.createElement("div");
  pointsEl.className = "debug-progression-points";
  panel.appendChild(pointsEl);

  const upgradesWrap = document.createElement("div");
  upgradesWrap.className = "debug-progression-section";
  panel.appendChild(upgradesWrap);

  const upgradesTitle = document.createElement("div");
  upgradesTitle.className = "debug-progression-section-title";
  upgradesTitle.innerText = "Upgrade Points";
  upgradesWrap.appendChild(upgradesTitle);

  const rowsWrap = document.createElement("div");
  rowsWrap.className = "debug-progression-rows";
  upgradesWrap.appendChild(rowsWrap);

  const valueEls = new Map();
  const plusButtons = [];

  const totalSpent = () => Object.values(points).reduce((sum, value) => sum + value, 0);
  const remainingPoints = () => Math.max(0, 49 - totalSpent());

  const refreshPoints = () => {
    pointsEl.innerText = `Points Remaining: ${remainingPoints()} / 49`;
    upgradeRows.forEach((row) => {
      const valueEl = valueEls.get(row.id);
      if (valueEl) valueEl.innerText = String(points[row.id]);
    });
    plusButtons.forEach(({ button, id, max }) => {
      const atCap = Number.isFinite(max) && points[id] >= max;
      button.disabled = remainingPoints() <= 0 || atCap;
    });
  };

  upgradeRows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "debug-progression-row";
    if (Number.isFinite(row.max) && points[row.id] >= row.max) rowEl.classList.add("debug-progression-row-capped");
    const labelEl = document.createElement("div");
    labelEl.className = "debug-progression-row-label";
    labelEl.innerText = row.label;
    const hintEl = document.createElement("div");
    hintEl.className = "debug-progression-row-hint";
    hintEl.innerText = row.hint || "";
    const copyEl = document.createElement("div");
    copyEl.className = "debug-progression-row-copy";
    copyEl.append(labelEl, hintEl);
    const controlsEl = document.createElement("div");
    controlsEl.className = "debug-progression-row-controls";
    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "debug-progression-stepper";
    minusBtn.innerText = "-";
    const valueEl = document.createElement("div");
    valueEl.className = "debug-progression-value";
    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "debug-progression-stepper";
    plusBtn.innerText = "+";
    minusBtn.onclick = () => {
      if (points[row.id] <= 0) return;
      points[row.id] -= 1;
      rowEl.classList.toggle("debug-progression-row-capped", Number.isFinite(row.max) && points[row.id] >= row.max);
      refreshPoints();
    };
    plusBtn.onclick = () => {
      if (remainingPoints() <= 0) return;
      if (Number.isFinite(row.max) && points[row.id] >= row.max) return;
      points[row.id] += 1;
      rowEl.classList.toggle("debug-progression-row-capped", Number.isFinite(row.max) && points[row.id] >= row.max);
      refreshPoints();
    };
    valueEls.set(row.id, valueEl);
    plusButtons.push({ button: plusBtn, id: row.id, max: row.max });
    controlsEl.append(minusBtn, valueEl, plusBtn);
    rowEl.append(copyEl, controlsEl);
    rowsWrap.appendChild(rowEl);
  });

  if (branchRows.length) {
    const branchesWrap = document.createElement("div");
    branchesWrap.className = "debug-progression-section";
    panel.appendChild(branchesWrap);
    const branchesTitle = document.createElement("div");
    branchesTitle.className = "debug-progression-section-title";
    branchesTitle.innerText = "Ability Branches";
    branchesWrap.appendChild(branchesTitle);
    branchRows.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "debug-progression-branch";
      const labelEl = document.createElement("label");
      labelEl.className = "debug-progression-branch-label";
      labelEl.innerText = row.label;
      const selectEl = document.createElement("select");
      selectEl.className = "debug-progression-select";
      row.options.forEach((option) => {
        const optionEl = document.createElement("option");
        optionEl.value = option.value;
        optionEl.innerText = option.label;
        selectEl.appendChild(optionEl);
      });
      selectEl.value = branches[row.id] || "none";
      selectEl.onchange = () => {
        branches[row.id] = selectEl.value;
      };
      rowEl.append(labelEl, selectEl);
      branchesWrap.appendChild(rowEl);
    });
  }

  const actionsEl = document.createElement("div");
  actionsEl.className = "debug-progression-actions";
  panel.appendChild(actionsEl);
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.innerText = "Cancel";
  const applyBtn = document.createElement("button");
  applyBtn.type = "button";
  applyBtn.className = "dbg-danger-btn";
  applyBtn.innerText = "Apply Build";
  actionsEl.append(cancelBtn, applyBtn);

  const cleanup = () => {
    document.removeEventListener("keydown", onKeyDown);
    overlay.removeEventListener("mousedown", onMouseDown, true);
    document.body?.classList.remove("choice-overlay-active");
    if (overlay.isConnected) overlay.remove();
  };

  const onKeyDown = (e) => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    cleanup();
  };

  const onMouseDown = (e) => {
    if (panel.contains(e.target)) return;
    e.preventDefault();
    cleanup();
  };

  cancelBtn.onclick = () => cleanup();
  applyBtn.onclick = () => {
    applyDebugProgressionConfig({ points, branches });
    cleanup();
  };

  refreshPoints();
  document.body.appendChild(overlay);
  document.addEventListener("keydown", onKeyDown);
  overlay.addEventListener("mousedown", onMouseDown, true);
}

async function castStatusDebug(statusKey, power, turns) {
  const normalizedKey = normalizeStatusKey(statusKey);
  const safePower = clampStatusPower(power);
  const safeTurns = Math.max(1, Math.min(100, Math.floor(Number(turns) || 1)));
  if (!normalizedKey || safePower <= 0) return;

  const target = await chooseDebugStatusTarget(statusDisplayName(normalizedKey));
  if (!target?.unit) return;

  applyStatus(target.unit, normalizedKey, safePower, safeTurns);
  refreshUI();
}

function bindDebugMenu() {
  const toggle = getEl("debugToggle");
  const menu = getEl("debugMenu");
  const teleportToggle = getEl("dbgTeleportToggle");
  const teleportPanel = getEl("dbgTeleportPanel");
  const levelSlider = getEl("dbgLevelSlider");
  const teleportLabel = getEl("dbgTeleportLabel");
  const teleportConfirm = getEl("dbgTeleportConfirm");
  const killAll = getEl("dbgKillAll");
  const maxLevelUp = getEl("dbgMaxLevelUp");
  const refill = getEl("dbgRefillAll");
  const forceMercyAccept = getEl("dbgForceMercyAccept");
  const keepCombatLog = getEl("dbgKeepCombatLog");
  const showStatusTurns = getEl("dbgShowStatusTurns");
  const toggleHitboxes = getEl("dbgToggleHitboxes");
  const castStatusToggle = getEl("dbgCastStatusToggle");
  const statusPanel = getEl("dbgStatusPanel");
  const statusKey = getEl("dbgStatusKey");
  const statusPower = getEl("dbgStatusPower");
  const statusPowerLabel = getEl("dbgStatusPowerLabel");
  const statusTurns = getEl("dbgStatusTurns");
  const statusTurnsLabel = getEl("dbgStatusTurnsLabel");
  const castStatus = getEl("dbgCastStatus");
  const grantItemToggle = getEl("dbgGrantItemToggle");
  const itemPanel = getEl("dbgItemPanel");
  const itemKey = getEl("dbgItemKey");
  const grantItem = getEl("dbgGrantItem");
  const changeSpeed = getEl("dbgChangeSpeed");
  const speedPanel = getEl("dbgSpeedPanel");
  const speedLabel = getEl("dbgSpeedLabel");
  const speedSlider = getEl("dbgSpeedSlider");
  if (!toggle || !menu || !teleportToggle || !teleportPanel || !levelSlider || !teleportLabel || !teleportConfirm || !killAll || !maxLevelUp || !refill || !forceMercyAccept || !keepCombatLog || !showStatusTurns || !toggleHitboxes || !castStatusToggle || !statusPanel || !statusKey || !statusPower || !statusPowerLabel || !statusTurns || !statusTurnsLabel || !castStatus || !grantItemToggle || !itemPanel || !itemKey || !grantItem || !changeSpeed || !speedPanel || !speedLabel || !speedSlider) return;

  syncDeveloperModeUi();

  const speedCheckpoints = [0.1, 0.3, 0.5, 0.8, 1];
  const syncHitboxUi = () => {
    document.body.classList.toggle("debug-hitboxes", debugHitboxesEnabled);
    toggleHitboxes.innerText = `Hitboxes: ${debugHitboxesEnabled ? "On" : "Off"}`;
  };
  const syncForceMercyUi = () => {
    forceMercyAccept.classList.remove("dbg-toggle-on", "dbg-toggle-off", "dbg-toggle-default");
    if (debugForceMercyMode === "on") {
      forceMercyAccept.innerText = "Force Mercy: On";
      forceMercyAccept.classList.add("dbg-toggle-on");
    } else if (debugForceMercyMode === "off") {
      forceMercyAccept.innerText = "Force Mercy: Off";
      forceMercyAccept.classList.add("dbg-toggle-off");
    } else {
      forceMercyAccept.innerText = "Force Mercy: Default";
      forceMercyAccept.classList.add("dbg-toggle-default");
    }
  };
  const syncKeepCombatLogUi = () => {
    keepCombatLog.innerText = `Keep Combat Log: ${debugKeepCombatLog ? "On" : "Off"}`;
  };
  const syncStatusTurnsUi = () => {
    document.body.classList.toggle("debug-status-turns", debugShowStatusTurns);
    showStatusTurns.innerText = `Status Turns: ${debugShowStatusTurns ? "On" : "Off"}`;
  };
  const syncSpeedUi = () => {
    const percent = getGameSpeedPercent();
    speedLabel.innerText = `Game Speed: ${percent}%`;
    changeSpeed.innerText = `Change Speed (${percent}%)`;
    const activeSpeedIndex = Math.max(0, speedCheckpoints.findIndex((value) => Math.round(value * 100) === percent));
    speedSlider.value = String(activeSpeedIndex);
  };
  const syncStatusUi = () => {
    statusPowerLabel.innerText = `Power: ${Math.max(1, Math.min(10, Math.floor(Number(statusPower.value) || 1)))}`;
    statusTurnsLabel.innerText = `Turns: ${Math.max(1, Math.min(100, Math.floor(Number(statusTurns.value) || 1)))}`;
  };
  const syncTeleportUi = () => {
    const safeLevel = Math.max(1, Math.min(50, Math.floor(Number(levelSlider.value) || level || 1)));
    levelSlider.value = String(safeLevel);
    teleportLabel.innerText = `Teleport: LVL ${safeLevel}`;
    teleportToggle.innerText = `Teleport (LVL ${safeLevel})`;
  };

  const closeMenu = () => {
    menu.classList.add("hidden");
    teleportPanel.classList.add("hidden");
    statusPanel.classList.add("hidden");
    itemPanel.classList.add("hidden");
    speedPanel.classList.add("hidden");
  };

  toggle.onclick = (e) => {
    e.stopPropagation();
    syncTeleportUi();
    syncSpeedUi();
    menu.classList.toggle("hidden");
  };
  const runLevelTeleport = () => {
    const targetLevel = Math.max(1, Math.min(50, Math.floor(Number(levelSlider.value) || level || 1)));
    levelSlider.value = String(targetLevel);
    void teleportToLevelDebug(targetLevel);
  };
  teleportToggle.onclick = () => {
    syncTeleportUi();
    teleportPanel.classList.toggle("hidden");
  };
  levelSlider.oninput = () => syncTeleportUi();
  teleportConfirm.onclick = () => runLevelTeleport();
  killAll.onclick = () => {
    void killAllDebug();
  };
  maxLevelUp.onclick = () => {
    openDebugProgressionBuilder();
    syncTeleportUi();
  };
  refill.onclick = () => {
    refillAllResourcesDebug();
  };
  forceMercyAccept.onclick = () => {
    debugForceMercyMode = debugForceMercyMode === "default"
      ? "on"
      : debugForceMercyMode === "on"
        ? "off"
        : "default";
    syncForceMercyUi();
  };
  keepCombatLog.onclick = () => {
    debugKeepCombatLog = !debugKeepCombatLog;
    syncKeepCombatLogUi();
  };
  showStatusTurns.onclick = () => {
    debugShowStatusTurns = !debugShowStatusTurns;
    syncStatusTurnsUi();
    refreshUI();
  };
  castStatusToggle.onclick = () => {
    statusPanel.classList.toggle("hidden");
  };
  grantItemToggle.onclick = () => {
    itemPanel.classList.toggle("hidden");
  };
  statusPower.oninput = () => syncStatusUi();
  statusTurns.oninput = () => syncStatusUi();
  castStatus.onclick = async () => {
    await castStatusDebug(
      String(statusKey.value || "regen"),
      Number(statusPower.value || 1),
      Number(statusTurns.value || 1)
    );
  };
  grantItem.onclick = () => {
    void grantDebugItem(String(itemKey.value || "salad"));
  };
  toggleHitboxes.onclick = () => {
    debugHitboxesEnabled = !debugHitboxesEnabled;
    syncHitboxUi();
  };
  changeSpeed.onclick = () => {
    speedPanel.classList.toggle("hidden");
  };
  speedSlider.oninput = () => {
    const speedIndex = Math.max(0, Math.min(speedCheckpoints.length - 1, Math.floor(Number(speedSlider.value) || 0)));
    setGameSpeedMultiplier(speedCheckpoints[speedIndex]);
    syncSpeedUi();
  };
  levelSlider.value = String(level);
  syncHitboxUi();
  syncForceMercyUi();
  syncKeepCombatLogUi();
  syncStatusTurnsUi();
  syncSpeedUi();
  syncStatusUi();
  syncTeleportUi();
  onGameSpeedChange(() => {
    syncSpeedUi();
    if (gameStarted) startIdleAnimations();
  });
  menu.onclick = (e) => e.stopPropagation();
  document.addEventListener("click", () => closeMenu());
  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape") closeMenu();
  });
}

function switchToDuoPlayer(playerIndex, withLog = false) {
  if (!isDuoMode()) return;
  actionPanelView = "actions";
  activeDuoPlayer = Math.max(0, Math.min(Math.max(0, duoPlayers.length - 1), playerIndex));
  if (duoPlayers[activeDuoPlayer]) player = duoPlayers[activeDuoPlayer];
  applyCharacterSelection(duoCharacters[activeDuoPlayer]);
}

function applyCharacterSelection(characterKey) {
  selectedCharacter = characterKey;
  if (!isDuoMode() && player) player.characterKey = characterKey;
  if (isDuoMode() && duoPlayers.every((unit, idx) => !!unit && !!duoCharacters[idx])) return;
  const playerCardArt = getEl("playerCardArt");
  if (playerCardArt) {
    if (characterKey === "patrick") {
      playerCardArt.src = PATRICK_SPRITES.battleCard;
      playerCardArt.alt = "Patrick battle card art";
    } else if (characterKey === "kostya") {
      playerCardArt.src = KOSTYA_SPRITES.battleCard;
      playerCardArt.alt = "Kostya battle card art";
    } else {
      playerCardArt.src = JACOB_SPRITES.battleCard;
      playerCardArt.alt = "Jacob battle card art";
    }
  }

  if (isPatrick()) {
    void preloadPatrickVisuals({
      sliceHorizontalSpriteSheet,
      playerSprites: PLAYER_SPRITES
    }).then(() => {
      const playerImgAfterLoad = getEl("playerSprite");
      if (playerImgAfterLoad && !playerAnimating) {
        const activeUnit = isDuoMode() ? duoPlayers[activeDuoPlayer] : player;
        playerImgAfterLoad.src = activeUnit && activeUnit.hp <= 0
          ? characterCollapsedSprite(selectedCharacter)
          : playerSprites().idle[0];
      }
      refreshUiAfterVisualPreload();
    });
  }
  if (isKostya()) {
    void preloadKostyaVisuals({
      sliceHorizontalSpriteSheet,
      playerSprites: PLAYER_SPRITES
    }).then(() => {
      const playerImgAfterLoad = getEl("playerSprite");
      if (playerImgAfterLoad && !playerAnimating) {
        const activeUnit = isDuoMode() ? duoPlayers[activeDuoPlayer] : player;
        playerImgAfterLoad.src = activeUnit && activeUnit.hp <= 0
          ? characterCollapsedSprite(selectedCharacter)
          : playerSprites().idle[0];
      }
      refreshUiAfterVisualPreload();
    });
  }

  const playerImg = getEl("playerSprite");
  if (playerImg) {
    const activeUnit = isDuoMode() ? duoPlayers[activeDuoPlayer] : player;
    playerImg.src = activeUnit && activeUnit.hp <= 0
      ? characterCollapsedSprite(selectedCharacter)
      : playerSprites().idle[0];
  }
}

function bindStartMenu() {
  initStartMenuScene();
  playMenuMusic();
  void preloadPatrickVisuals({
    sliceHorizontalSpriteSheet,
    playerSprites: PLAYER_SPRITES
  });
  void preloadKostyaVisuals({
    sliceHorizontalSpriteSheet,
    playerSprites: PLAYER_SPRITES
  });
  const startScreen = getEl("startScreen");
  const startMenuShell = getEl("startMenuShell");
  const title = getEl("startTitle");
  const startSettingsWrap = getEl("startSettingsWrap");
  const startSettingsToggle = getEl("startSettingsToggle");
  const startSettingsPanel = getEl("startSettingsPanel");
  const startMusicVolume = getEl("startMusicVolume");
  const startLanguageToggle = getEl("startLanguageToggle");
  const startDeveloperModeToggle = getEl("startDeveloperModeToggle");
  const primary = getEl("startPrimary");
  const secondary = getEl("startSecondary");
  const tertiary = getEl("startTertiary");
  const modeActions = getEl("startModeActions");
  const characterStage = getEl("startCharacterStage");
  const characterGrid = getEl("startCharacterGrid");
  const selectionActions = getEl("startSelectionActions");
  const startBack = getEl("startBack");
  const startPartySwitch = getEl("startPartySwitch");
  const startPartyDuo = getEl("startPartyDuo");
  const startPartyTrio = getEl("startPartyTrio");
  const startPartyCancel = getEl("startPartyCancel");
  const startInfo = getEl("startInfo");
  const startAscend = getEl("startAscend");
  const infoPanel = getEl("startInfoPanel");
  const infoName = getEl("startInfoName");
  const infoBody = getEl("startInfoBody");
  if (
    !startScreen || !title || !startSettingsWrap || !startSettingsToggle || !startSettingsPanel ||
    !startMusicVolume || !startLanguageToggle || !startDeveloperModeToggle || !primary || !secondary || !tertiary ||
    !modeActions || !characterStage || !characterGrid || !selectionActions ||
    !startBack || !startPartySwitch || !startPartyDuo || !startPartyTrio || !startPartyCancel ||
    !startInfo || !startAscend || !infoPanel || !infoName || !infoBody
  ) return;

  const allCharacters = ["kostya", "patrick", "player"]
    .sort((a, b) => displayCharacterName(a).localeCompare(displayCharacterName(b)));
  let pendingSoloCharacter = "";
  let pendingDraftState = null;
  let ascendTransitionRunning = false;

  const isDeveloperLockedCharacter = (characterKey) => !developerModeEnabled && characterKey === "player";

  const setSettingsPanelOpen = (open) => {
    startSettingsPanel.classList.toggle("hidden", !open);
    startSettingsToggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const syncMusicSlider = () => {
    startMusicVolume.value = String(Math.round(musicVolumeSetting * 100));
    applyLanguageToStaticUi();
  };

  const sanitizeDeveloperLockedSelections = () => {
    if (!developerModeEnabled && pendingSoloCharacter === "player") {
      pendingSoloCharacter = "";
    }
    if (!developerModeEnabled && pendingDraftState) {
      pendingDraftState.picks = pendingDraftState.picks.map((key) => key === "player" ? "" : key);
      if (pendingDraftState.pendingCharacter === "player") pendingDraftState.pendingCharacter = "";
      syncDraftMeta();
    }
  };

  const resetPatrickProgressLocal = () => {
    resetPatrickProgress();
    resetKostyaProgress();
  };

  const setMenuShellIdle = (idle) => {
    if (!startMenuShell) return;
    startMenuShell.classList.toggle("start-menu-shell-idle", idle);
  };

  const setInfoButtonOpenState = (open) => {
    startInfo.classList.toggle("start-info-open", open);
    startInfo.innerText = open ? t("menu.close") : t("menu.info");
  };

  const characterPickCard = (characterKey) => {
    const icon = characterMenuIcon(characterKey);
    const name = displayCharacterName(characterKey);
    const bottom = characterMenuRole(characterKey);
    return (
      `<div class="pick-card">` +
      `<img class="pick-card-art" src="${icon}" alt="${name} profile">` +
      `<div class="pick-card-name">${name}</div>` +
      `<div class="pick-card-stats">${bottom}</div>` +
      `</div>`
    );
  };

  const playerDraftLabel = (playerIndex) => t("menu.player", { num: playerIndex + 1 });

  const draftModeCount = (mode) => mode === "trio" ? 3 : 2;

  const characterLockedLabel = (characterKey) => {
    if (isDeveloperLockedCharacter(characterKey)) return "DEV ONLY";
    return "";
  };

  const getDraftLockedPlayerIndex = (characterKey) => (
    pendingDraftState?.picks.findIndex((key) => key === characterKey) ?? -1
  );

  const getCurrentDraftSelection = () => {
    if (pendingDraftState?.pendingCharacter) return pendingDraftState.pendingCharacter;
    if (!pendingDraftState) return "";
    return pendingDraftState.picks[pendingDraftState.activePlayer] || "";
  };

  const isDraftComplete = () => !!pendingDraftState && pendingDraftState.picks.every(Boolean);

  const syncDraftMeta = () => {
    if (!pendingDraftState) return;
    pendingDraftState.count = draftModeCount(pendingDraftState.mode);
    pendingDraftState.picks = pendingDraftState.picks.slice(0, pendingDraftState.count);
    while (pendingDraftState.picks.length < pendingDraftState.count) pendingDraftState.picks.push("");
    const nextOpen = pendingDraftState.picks.findIndex((key) => !key);
    pendingDraftState.activePlayer = nextOpen >= 0 ? nextOpen : Math.max(0, pendingDraftState.count - 1);
    if (pendingDraftState.pendingCharacter && pendingDraftState.picks.includes(pendingDraftState.pendingCharacter)) {
      pendingDraftState.pendingCharacter = "";
    }
  };

  const draftCardClassName = (characterKey) => {
    const classes = ["start-character-card"];
    const lockedBy = getDraftLockedPlayerIndex(characterKey);
    if (isDeveloperLockedCharacter(characterKey)) {
      classes.push("start-character-card-locked", "start-character-card-locked-dev");
    } else if (lockedBy >= 0) {
      classes.push("start-character-card-locked", `start-character-card-locked-p${lockedBy + 1}`);
    } else if (pendingDraftState?.pendingCharacter === characterKey) {
      classes.push("start-character-card-selected");
    }
    return classes.join(" ");
  };

  const draftCardHtml = (characterKey) => {
    const lockedBy = getDraftLockedPlayerIndex(characterKey);
    const lockLabel = isDeveloperLockedCharacter(characterKey)
      ? `<div class="start-character-card-lock-label">${characterLockedLabel(characterKey)}</div>`
      : lockedBy >= 0
      ? `<div class="start-character-card-lock-label">${playerDraftLabel(lockedBy)}</div>`
      : "";
    return (
      `<button class="${draftCardClassName(characterKey)}" data-character="${characterKey}" type="button">` +
      lockLabel +
      characterPickCard(characterKey) +
      `</button>`
    );
  };

  const syncDraftPartySwitch = () => {
    const multiplayerVisible = !!pendingDraftState;
    startPartySwitch.classList.toggle("hidden", !multiplayerVisible);
    if (!multiplayerVisible) return;
    startPartyDuo.classList.toggle("start-party-switch-active", pendingDraftState.mode === "duo");
    startPartyTrio.classList.toggle("start-party-switch-active", pendingDraftState.mode === "trio");
    startPartyDuo.disabled = pendingDraftState.mode === "duo";
    startPartyTrio.disabled = pendingDraftState.mode === "trio";
  };

  const launchIntoGame = async (prepareStart) => {
    if (ascendTransitionRunning) return;
    ascendTransitionRunning = true;
    let started = false;
    let stopAscendTransition = null;
    [primary, secondary, tertiary, startBack, startPartyDuo, startPartyTrio, startPartyCancel, startInfo, startAscend]
      .forEach((button) => {
        if (button) button.disabled = true;
      });
    try {
      prepareStart();
      stopMenuMusic();
      const minAscendDuration = new Promise((resolve) => setTimeout(resolve, scaleDuration(3000)));
      const setupPromise = setup();
      stopAscendTransition = await playStartMenuAscendTransition();
      await Promise.all([setupPromise, minAscendDuration]);
      stopAscendTransition?.();
      startScreen.classList.add("hidden");
      started = true;
    } finally {
      stopAscendTransition?.();
      if (!started) {
        startScreen.classList.remove("start-screen-ascending", "start-screen-loading");
        const ascendOverlay = getEl("startAscendOverlay");
        ascendOverlay?.setAttribute("aria-hidden", "true");
        [primary, secondary, tertiary, startBack, startPartyDuo, startPartyTrio, startPartyCancel, startInfo, startAscend]
          .forEach((button) => {
            if (button) button.disabled = false;
          });
      }
      ascendTransitionRunning = false;
    }
  };

  const startSolo = async (characterKey) => {
    await launchIntoGame(() => {
      gameMode = "solo";
      duoCharacters = ["player", "patrick"];
      duoPlayers = [null, null];
      mercyEndingPending = null;
      finalBossFirstDecision = "";
      finalBossSecondDecision = "";
      resetPatrickProgressLocal();
      player = createCharacterPlayer(characterKey);
      applyCharacterSelection(characterKey);
    });
  };

  const startMultiplayer = async (pickedCharacters, mode) => {
    await launchIntoGame(() => {
      gameMode = mode;
      mercyEndingPending = null;
      finalBossFirstDecision = "";
      finalBossSecondDecision = "";
      resetPatrickProgressLocal();
      duoCharacters = [...pickedCharacters];
      duoPlayers = duoCharacters.map((charKey) => createCharacterPlayer(charKey));
      switchToDuoPlayer(0);
    });
  };

  const hideInfoPanel = () => {
    infoPanel.classList.add("hidden");
    setInfoButtonOpenState(false);
  };

  const renderInfoPanel = (characterKey) => {
    if (!characterKey) return;
    const info = characterMenuInfo(characterKey);
    infoPanel.classList.remove("hidden");
    setInfoButtonOpenState(true);
    infoName.innerText = displayCharacterName(characterKey);
    infoBody.innerHTML = `<p class="start-info-text">${t("menu.loading")}</p>`;
    const formatAbilityCostHtml = (cost) => {
      const safeCost = cost || {};
      const luckyChargeIcon = (PATRICK_SPRITES && PATRICK_SPRITES.luckyChargeIcon) ? PATRICK_SPRITES.luckyChargeIcon : "";
      const shadowChargeIcon = (KOSTYA_SPRITES && (KOSTYA_SPRITES.shadowCharges || KOSTYA_SPRITES.shadow))
        ? (KOSTYA_SPRITES.shadowCharges || KOSTYA_SPRITES.shadow)
        : "";
      const parts = [];
      if (safeCost.charges > 0) {
        if (luckyChargeIcon) {
          parts.push(
            `<span class="start-ability-cost-item">` +
            `<img class="start-ability-cost-icon" src="${luckyChargeIcon}" alt="Lucky Charge">` +
            `<span>${safeCost.charges}</span>` +
            `</span>`
          );
        } else {
          parts.push(`<span class="start-ability-cost-item">${safeCost.charges} LC</span>`);
        }
      }
      if (safeCost.sp > 0) parts.push(`<span class="start-ability-cost-item">${safeCost.sp} SP</span>`);
      if (safeCost.hp > 0) parts.push(`<span class="start-ability-cost-item">${safeCost.hp} HP</span>`);
      if (safeCost.sc > 0) {
        if (shadowChargeIcon) {
          parts.push(
            `<span class="start-ability-cost-item">` +
            `<img class="start-ability-cost-icon" src="${shadowChargeIcon}" alt="Shadow Charge">` +
            `<span>${safeCost.sc}%</span>` +
            `</span>`
          );
        } else {
          parts.push(`<span class="start-ability-cost-item">${safeCost.sc}% SC</span>`);
        }
      }
      if (safeCost.scGain > 0) {
        if (shadowChargeIcon) {
          parts.push(
            `<span class="start-ability-cost-item">` +
            `<img class="start-ability-cost-icon" src="${shadowChargeIcon}" alt="Shadow Charge">` +
            `<span>+${safeCost.scGain}%</span>` +
            `</span>`
          );
        } else {
          parts.push(`<span class="start-ability-cost-item">+${safeCost.scGain}% SC</span>`);
        }
      }
      return parts.length
        ? `<span class="start-ability-cost">: ${parts.join('<span class="start-ability-cost-sep">|</span>')}</span>`
        : "";
    };
    const abilityIconHtml = (ability) => {
      if (!ability?.icon) return `<span class="start-ability-icon start-ability-icon-fallback"></span>`;
      return `<img class="start-ability-icon start-ability-icon-image" src="${ability.icon}" alt="">`;
    };
    const abilityChipHtml = (ability) => (
      `<div class="start-ability-chip">` +
      `${abilityIconHtml(ability)}` +
      `<div class="start-ability-copy">` +
      `<div class="start-ability-name">${ability.name}${formatAbilityCostHtml(ability.cost)}</div>` +
      `<div class="start-ability-desc">${ability.description}</div>` +
      `</div>` +
      `</div>`
    );
    const abilityListHtml = (list, emptyText = t("menu.noUnlockables"), pairChoices = false) => {
      if (!Array.isArray(list) || !list.length) {
        return `<p class="start-info-text">${emptyText}</p>`;
      }
      if (pairChoices) {
        const rows = [];
        for (let idx = 0; idx < list.length; idx += 2) {
          const left = list[idx];
          const right = list[idx + 1];
          if (right) {
            rows.push(
              `<div class="start-ability-choice-row">` +
              abilityChipHtml(left) +
              `<div class="start-ability-choice-divider">${t("menu.or")}</div>` +
              abilityChipHtml(right) +
              `</div>`
            );
          } else {
            rows.push(abilityChipHtml(left));
          }
        }
        return `<div class="start-ability-list">${rows.join("")}</div>`;
      }
      return (
        `<div class="start-ability-list">` +
        list.map((ability) => abilityChipHtml(ability)).join("") +
        `</div>`
      );
    };
    const stripAbilityCosts = (list = []) => list.map((ability) => ({
      name: ability.name,
      description: ability.description,
      icon: ability.icon,
      cost: null
    }));
    try {
      infoBody.innerHTML =
        `<div>` +
        `<div class="start-info-section-title">${t("menu.startingStats")}</div>` +
        `<div class="start-info-stats">` +
        `<div class="start-stat-chip"><span class="start-stat-label">HP</span><span class="start-stat-value">${info.stats.hp}</span></div>` +
        `<div class="start-stat-chip"><span class="start-stat-label">SP</span><span class="start-stat-value">${info.stats.sp}</span></div>` +
        `</div>` +
        `</div>` +
        `<div>` +
        `<div class="start-info-section-title">${t("menu.passive")}</div>` +
        `<p class="start-info-text">${info.passive}</p>` +
        `</div>` +
        `<div>` +
        `<div class="start-info-section-title">${t("menu.playstyle")}</div>` +
        `<p class="start-info-text">${info.playstyle}</p>` +
        `</div>` +
        `<div>` +
        `<div class="start-info-section-title">${t("menu.startingAbilities")}</div>` +
        `${abilityListHtml(info.abilities)}` +
        `</div>` +
        `<div>` +
        `<div class="start-info-section-title">${t("menu.unlockableAbilities")}</div>` +
        `${abilityListHtml(info.unlockables, t("menu.noUnlockables"), !!info.unlockableChoicePairs)}` +
        `</div>`;
    } catch (_err) {
      infoBody.innerHTML =
        `<div>` +
        `<div class="start-info-section-title">${t("menu.startingStats")}</div>` +
        `<div class="start-info-stats">` +
        `<div class="start-stat-chip"><span class="start-stat-label">HP</span><span class="start-stat-value">${info.stats.hp}</span></div>` +
        `<div class="start-stat-chip"><span class="start-stat-label">SP</span><span class="start-stat-value">${info.stats.sp}</span></div>` +
        `</div>` +
        `</div>` +
        `<div>` +
        `<div class="start-info-section-title">${t("menu.passive")}</div>` +
        `<p class="start-info-text">${info.passive}</p>` +
        `</div>` +
        `<div>` +
        `<div class="start-info-section-title">${t("menu.playstyle")}</div>` +
        `<p class="start-info-text">${info.playstyle}</p>` +
        `</div>` +
        `<div>` +
        `<div class="start-info-section-title">${t("menu.startingAbilities")}</div>` +
        `${abilityListHtml(stripAbilityCosts(info.abilities || []))}` +
        `</div>` +
        `<div>` +
        `<div class="start-info-section-title">${t("menu.unlockableAbilities")}</div>` +
        `${abilityListHtml(stripAbilityCosts(info.unlockables || []), t("menu.noUnlockables"), !!info.unlockableChoicePairs)}` +
        `</div>`;
    }
    infoBody.scrollTop = 0;
  };

  const syncSoloSelectionActions = () => {
    const hasChoice = !!pendingSoloCharacter;
    startInfo.classList.toggle("hidden", !hasChoice);
    startAscend.classList.toggle("hidden", !hasChoice);
    startInfo.disabled = !hasChoice;
    startAscend.disabled = !hasChoice;
    if (!hasChoice) setInfoButtonOpenState(false);
  };

  const syncDraftSelectionActions = () => {
    const selection = getCurrentDraftSelection();
    const draftComplete = isDraftComplete();
    const hasLockedPick = !!pendingDraftState?.picks.some(Boolean);
    syncDraftPartySwitch();
    startPartyCancel.classList.toggle("hidden", !hasLockedPick);
    startPartyCancel.disabled = !hasLockedPick;
    startInfo.classList.toggle("hidden", !selection);
    startAscend.classList.remove("hidden");
    startInfo.disabled = !selection;
    startAscend.disabled = draftComplete ? false : !pendingDraftState?.pendingCharacter;
    startAscend.innerText = draftComplete ? t("menu.ascend") : t("menu.select");
    if (!selection) setInfoButtonOpenState(false);
  };

  const renderSoloCharacterSelect = () => {
    pendingDraftState = null;
    startBack.innerText = t("menu.back");
    startPartyCancel.innerText = t("menu.cancel");
    startPartyDuo.innerText = t("menu.duo");
    startPartyTrio.innerText = t("menu.trio");
    setMenuShellIdle(false);
    modeActions.classList.add("hidden");
    tertiary.classList.add("hidden");
    characterStage.classList.remove("hidden");
    startPartySwitch.classList.add("hidden");
    startPartyCancel.classList.add("hidden");
    hideInfoPanel();
    characterGrid.innerHTML = allCharacters.map((key) => (
      `<button class="start-character-card${isDeveloperLockedCharacter(key) ? " start-character-card-locked start-character-card-locked-dev" : pendingSoloCharacter === key ? " start-character-card-selected" : ""}" data-character="${key}" type="button">` +
      `${isDeveloperLockedCharacter(key) ? `<div class="start-character-card-lock-label">${characterLockedLabel(key)}</div>` : ""}` +
      characterPickCard(key) +
      `</button>`
    )).join("");
    characterGrid.querySelectorAll(".start-character-card").forEach((button) => {
      button.onclick = () => {
        const characterKey = button.dataset.character || "";
        if (!characterKey || isDeveloperLockedCharacter(characterKey)) return;
        pendingSoloCharacter = characterKey;
        renderSoloCharacterSelect();
      };
    });
    syncSoloSelectionActions();
  };

  const renderDraftCharacterChoices = () => {
    if (!pendingDraftState) return;
    startBack.innerText = t("menu.back");
    startPartyCancel.innerText = t("menu.cancel");
    startPartyDuo.innerText = t("menu.duo");
    startPartyTrio.innerText = t("menu.trio");
    syncDraftMeta();
    setMenuShellIdle(false);
    modeActions.classList.add("hidden");
    tertiary.classList.add("hidden");
    characterStage.classList.remove("hidden");
    hideInfoPanel();
    title.innerText = "BURGER DUNGEON";
    characterGrid.innerHTML = allCharacters.map((key) => draftCardHtml(key)).join("");
    characterGrid.querySelectorAll(".start-character-card").forEach((button) => {
      button.onclick = () => {
        const characterKey = button.dataset.character || "";
        if (!characterKey || isDeveloperLockedCharacter(characterKey) || getDraftLockedPlayerIndex(characterKey) >= 0 || isDraftComplete()) return;
        pendingDraftState.pendingCharacter = characterKey;
        renderDraftCharacterChoices();
      };
    });
    syncDraftSelectionActions();
  };

  const showMultiplayerDraft = (mode = "duo") => {
    pendingDraftState = {
      mode,
      count: draftModeCount(mode),
      picks: new Array(draftModeCount(mode)).fill(""),
      activePlayer:0,
      pendingCharacter:""
    };
    renderDraftCharacterChoices();
  };

  const showModeButtons = (idle = false) => {
    pendingDraftState = null;
    modeActions.classList.remove("hidden");
    characterStage.classList.add("hidden");
    primary.classList.remove("hidden");
    secondary.classList.remove("hidden");
    tertiary.classList.add("hidden");
    startPartySwitch.classList.add("hidden");
    startPartyCancel.classList.add("hidden");
    hideInfoPanel();
    pendingSoloCharacter = "";
    startBack.innerText = t("menu.back");
    startPartyCancel.innerText = t("menu.cancel");
    startPartyDuo.innerText = t("menu.duo");
    startPartyTrio.innerText = t("menu.trio");
    startAscend.innerText = t("menu.ascend");
    setMenuShellIdle(idle);
    syncSoloSelectionActions();
  };

  const showModeSelect = () => {
    title.innerText = "BURGER DUNGEON";
    showModeButtons(true);
    primary.innerText = t("menu.singleplayer");
    secondary.innerText = t("menu.multiplayer");
    tertiary.innerText = "";
    primary.onclick = () => {
      title.innerText = "BURGER DUNGEON";
      renderSoloCharacterSelect();
    };
    secondary.onclick = () => showMultiplayerDraft("duo");
  };

  startBack.onclick = () => showModeSelect();
  startSettingsToggle.onclick = () => {
    const nextOpen = startSettingsPanel.classList.contains("hidden");
    setSettingsPanelOpen(nextOpen);
  };
  startMusicVolume.oninput = () => {
    musicVolumeSetting = Math.max(0, Math.min(1, (Number(startMusicVolume.value) || 0) / 100));
    try {
      window.localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(musicVolumeSetting));
    } catch (_err) {
      void _err;
    }
    applyMusicVolumeSetting();
    applyLanguageToStaticUi();
  };
  startLanguageToggle.onclick = () => {
    setUiLanguage(uiLanguage === "en" ? "pl" : "en");
  };
  startDeveloperModeToggle.onclick = () => {
    if (!isDeveloperModeSettingsUnlocked()) return;
    developerModeEnabled = !developerModeEnabled;
    try {
      window.localStorage.setItem(DEVELOPER_MODE_STORAGE_KEY, String(developerModeEnabled));
    } catch (_err) {
      void _err;
    }
    sanitizeDeveloperLockedSelections();
    syncDeveloperModeUi();
    applyLanguageToStaticUi();
    rerenderCurrentStartMenu();
  };
  const switchDraftMode = (mode) => {
    if (!pendingDraftState || pendingDraftState.mode === mode) return;
    pendingDraftState.mode = mode;
    syncDraftMeta();
    renderDraftCharacterChoices();
  };
  startPartyDuo.onclick = () => switchDraftMode("duo");
  startPartyTrio.onclick = () => switchDraftMode("trio");
  startPartyCancel.onclick = () => {
    if (!pendingDraftState) return;
    pendingDraftState.picks = new Array(draftModeCount(pendingDraftState.mode)).fill("");
    pendingDraftState.pendingCharacter = "";
    pendingDraftState.activePlayer = 0;
    renderDraftCharacterChoices();
  };
  startInfo.onclick = () => {
    const selectedStartCharacter = getCurrentDraftSelection() || pendingSoloCharacter;
    if (!selectedStartCharacter) return;
    if (!infoPanel.classList.contains("hidden")) {
      hideInfoPanel();
      return;
    }
    renderInfoPanel(selectedStartCharacter);
  };
  startAscend.onclick = () => {
    if (pendingDraftState) {
      if (isDraftComplete()) {
        startMultiplayer(pendingDraftState.picks, pendingDraftState.mode);
        return;
      }
      if (!pendingDraftState.pendingCharacter) return;
      pendingDraftState.picks[pendingDraftState.activePlayer] = pendingDraftState.pendingCharacter;
      pendingDraftState.pendingCharacter = "";
      syncDraftMeta();
      renderDraftCharacterChoices();
      return;
    }
    if (!pendingSoloCharacter) return;
    startSolo(pendingSoloCharacter);
  };
  [primary, secondary, tertiary, startBack, startPartyDuo, startPartyTrio, startPartyCancel, startInfo, startAscend].forEach((button) => {
    if (!button) return;
    button.addEventListener("click", () => {
      if (!gameStarted) playMenuMusic();
    });
  });
  document.addEventListener("pointerdown", (event) => {
    if (!startSettingsWrap.contains(event.target)) {
      setSettingsPanelOpen(false);
    }
  });

  const rerenderCurrentStartMenu = () => {
    sanitizeDeveloperLockedSelections();
    const selectedStartCharacter = getCurrentDraftSelection() || pendingSoloCharacter;
    const infoWasOpen = !infoPanel.classList.contains("hidden");
    if (pendingDraftState) renderDraftCharacterChoices();
    else if (!characterStage.classList.contains("hidden")) renderSoloCharacterSelect();
    else showModeSelect();
    if (infoWasOpen && selectedStartCharacter) renderInfoPanel(selectedStartCharacter);
  };

  refreshStartMenuLanguage = rerenderCurrentStartMenu;
  syncMusicSlider();
  applyMusicVolumeSetting();
  syncDeveloperModeUi();
  applyLanguageToStaticUi();
  showModeSelect();
}

async function setup() {
  if (gameStarted) return;
  gameStarted = true;
  document.body.classList.add("game-started");
  if (!selectedCharacter) applyCharacterSelection("player");
  if (isDuoMode()) {
    if (!duoPlayers.length || duoPlayers.length !== duoCharacters.length || duoPlayers.some((unit) => !unit)) {
      duoPlayers = duoCharacters.map((charKey) => createCharacterPlayer(charKey));
    }
    if (duoCharacters.includes("patrick")) {
      void preloadPatrickVisuals({
        sliceHorizontalSpriteSheet,
        playerSprites: PLAYER_SPRITES
      }).then(() => {
        refreshUiAfterVisualPreload();
      });
    }
    if (duoCharacters.includes("kostya")) {
      void preloadKostyaVisuals({
        sliceHorizontalSpriteSheet,
        playerSprites: PLAYER_SPRITES
      }).then(() => {
        refreshUiAfterVisualPreload();
      });
    }
    switchToDuoPlayer(0);
  }
  startNewLevelState();
  enemies = spawnLevelEnemies();
  bindDebugMenu();
  await enterCurrentEncounter();
}

void preloadActionIcons();
bindStartMenu();
bindActionKeyboardNavigation();
bindGlobalUiButtonSounds();
window.addEventListener("resize", () => {
  battlefieldTileSignature = "";
  renderBattlefieldTiles();
});
