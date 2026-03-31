const SOLO_KEYS = {
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  up: ["ArrowUp", "KeyW"],
  down: ["ArrowDown", "KeyS"],
  confirm: ["Space", "Enter"],
  cancel: ["ShiftLeft", "ShiftRight"]
};

const DUO_KEYS = {
  0: {
    left: ["KeyA"],
    right: ["KeyD"],
    up: ["KeyW"],
    down: ["KeyS"],
    confirm: ["Space"],
    cancel: ["ShiftLeft"]
  },
  1: {
    left: ["ArrowLeft"],
    right: ["ArrowRight"],
    up: ["ArrowUp"],
    down: ["ArrowDown"],
    confirm: ["Enter"],
    cancel: ["ShiftRight"]
  }
};

const TRIO_KEYS = {
  left: ["Numpad4"],
  right: ["Numpad6"],
  up: ["Numpad8"],
  down: ["Numpad2"],
  confirm: ["NumpadEnter"],
  cancel: ["Numpad0"]
};

const JACOB_BATTLE_CARD = "sprites/player/jacob/jacob_profile.png";

function keyMatches(code, values = []) {
  return values.includes(code);
}

function currentControlScheme(gameMode, activeDuoPlayer) {
  if (!isDuoGameMode(gameMode)) return SOLO_KEYS;
  if (activeDuoPlayer === 0 || activeDuoPlayer === 1) return DUO_KEYS[activeDuoPlayer];
  return TRIO_KEYS;
}

function firstSkillKey(gameMode, activeDuoPlayer) {
  return currentControlScheme(gameMode, activeDuoPlayer).confirm;
}

function resourceRow(label, fillPct, value) {
  return `<div class="resource-row"><span class="resource-label">${label}</span><div class="resource-track"><div class="resource-fill lucky-fill" style="width:${fillPct}%"></div></div><span class="resource-value">${value}</span></div>`;
}

function battleCardArtForCharacter(charKey, patrickBattleCard, kostyaBattleCard) {
  if (charKey === "patrick") return patrickBattleCard;
  if (charKey === "kostya") return kostyaBattleCard;
  return JACOB_BATTLE_CARD;
}

export function isTrioGameMode(gameMode) {
  return gameMode === "trio";
}

export function isTrioMoveLeftKey(code) {
  return keyMatches(code, TRIO_KEYS.left);
}

export function isTrioMoveRightKey(code) {
  return keyMatches(code, TRIO_KEYS.right);
}

export function isTrioMoveUpKey(code) {
  return keyMatches(code, TRIO_KEYS.up);
}

export function isTrioMoveDownKey(code) {
  return keyMatches(code, TRIO_KEYS.down);
}

export function isTrioConfirmKey(code) {
  return keyMatches(code, TRIO_KEYS.confirm);
}

export function isTrioCancelKey(code) {
  return keyMatches(code, TRIO_KEYS.cancel);
}

export function trioSkillCheckKeys() {
  return [...TRIO_KEYS.confirm];
}

export function isDuoGameMode(gameMode) {
  return gameMode === "duo" || isTrioGameMode(gameMode);
}

export function multiplayerCountFromMode(gameMode, duoCharacters = []) {
  return isDuoGameMode(gameMode) ? duoCharacters.length : 1;
}

export function playerEntityIdForIndex(index) {
  return index === 0 ? "playerChar" : `allyPartnerChar-${index}`;
}

export function playerSpriteIdForIndex(index) {
  return index === 0 ? "playerSprite" : `allyPartnerSprite-${index}`;
}

export function skillFeedbackIdForPlayerIndex(playerIndex = 0, gameMode = "solo") {
  if (!Number.isInteger(playerIndex) || playerIndex <= 0 || !isDuoGameMode(gameMode)) return "playerSkill";
  return `allyPartnerSkill-${playerIndex}`;
}

export function isCurrentTurnMoveLeftKey(code, gameMode, activeDuoPlayer) {
  return keyMatches(code, currentControlScheme(gameMode, activeDuoPlayer).left);
}

export function isCurrentTurnMoveRightKey(code, gameMode, activeDuoPlayer) {
  return keyMatches(code, currentControlScheme(gameMode, activeDuoPlayer).right);
}

export function isCurrentTurnMoveUpKey(code, gameMode, activeDuoPlayer) {
  return keyMatches(code, currentControlScheme(gameMode, activeDuoPlayer).up);
}

export function isCurrentTurnMoveDownKey(code, gameMode, activeDuoPlayer) {
  return keyMatches(code, currentControlScheme(gameMode, activeDuoPlayer).down);
}

export function isCurrentTurnConfirmKey(code, gameMode, activeDuoPlayer) {
  return keyMatches(code, currentControlScheme(gameMode, activeDuoPlayer).confirm);
}

export function isCurrentTurnCancelKey(code, gameMode, activeDuoPlayer) {
  return code === "Escape" || keyMatches(code, currentControlScheme(gameMode, activeDuoPlayer).cancel);
}

export function currentSkillCheckKeys(gameMode, activeDuoPlayer) {
  return [...firstSkillKey(gameMode, activeDuoPlayer)];
}

export function skillCheckKeysForPlayerIndex(playerIndex, gameMode) {
  return [...firstSkillKey(gameMode, playerIndex)];
}

export function pickRandomLivingDuoTarget({
  duoPlayers,
  duoCharacters,
  displayCharacterName,
  random = Math.random
}) {
  const living = duoPlayers
    .map((unit, idx) => ({ unit, idx }))
    .filter(({ unit, idx }) => !!unit && !!duoCharacters[idx] && unit.hp > 0);

  if (!living.length) return null;

  const targetIdx = living[Math.floor(random() * living.length)].idx;
  const unit = duoPlayers[targetIdx];
  const characterKey = duoCharacters[targetIdx];
  if (!unit || !characterKey) return null;

  return {
    id: playerEntityIdForIndex(targetIdx),
    unit,
    label: displayCharacterName(characterKey),
    isPlayer: true,
    characterKey,
    playerIndex: targetIdx
  };
}

export function renderDuoPartnerUI(ctx) {
  const {
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
  } = ctx;

  const zone = getEl("duoZone");
  if (!zone) return;

  if (!isDuoMode()) {
    zone.innerHTML = "";
    return;
  }

  const parts = [];
  for (let idx = 1; idx < duoPlayers.length; idx += 1) {
    const partnerUnit = duoPlayers[idx];
    const partnerChar = duoCharacters[idx];
    if (!partnerUnit || !partnerChar) continue;

    parts.push(
      `<div id="${playerEntityIdForIndex(idx)}" class="ally-entity duo-partner-entity">` +
      statusIconsHtml(partnerUnit) +
      `<img id="${playerSpriteIdForIndex(idx)}" class="ally-sprite" src="" alt="Player ${idx + 1}">` +
      `<div id="${queuedActionIdForPlayerIndex(idx)}" class="queued-action hidden"></div>` +
      `<div id="${skillFeedbackIdForPlayerIndex(idx)}" class="skill-feedback"></div>` +
      `</div>`
    );
  }

  zone.innerHTML = parts.join("");

  for (let idx = 1; idx < duoPlayers.length; idx += 1) {
    const partnerUnit = duoPlayers[idx];
    const partnerChar = duoCharacters[idx];
    const sprite = getEl(playerSpriteIdForIndex(idx));
    if (!sprite || !partnerChar || !partnerUnit) continue;

    const idleFrames = typeof idleFramesForCharacter === "function"
      ? idleFramesForCharacter(partnerChar, false)
      : null;
    sprite.src = partnerUnit.hp <= 0
      ? characterCollapsedSprite(partnerChar)
      : (Array.isArray(idleFrames) && idleFrames.length ? idleFrames[0] : characterBaseSprite(partnerChar));
  }
}

export function renderDuoBattleCardsUI(ctx) {
  const {
    getEl,
    isDuoMode,
    duoPlayers,
    duoCharacters,
    luckyChargeCapForLevel,
    shadowChargePct,
    level,
    strengthenUpgrades,
    displayCharacterName,
    patrickBattleCard,
    kostyaBattleCard
  } = ctx;

  const duoSlot = getEl("duoPlayerCardSlot");
  const playerCard = getEl("playerCard");
  const playerStats = getEl("playerStats");
  const playerArt = getEl("playerCardArt");
  const bonus = getEl("playerCardBonus");
  if (!duoSlot || !playerCard || !playerStats || !playerArt) return;

  if (!isDuoMode()) {
    duoSlot.innerHTML = "";
    playerCard.classList.remove("player1-battle-card", "player2-battle-card", "player3-battle-card");
    playerCard.classList.add("player-battle-card");
    return;
  }

  const duoStatsHtml = (unit, charKey) => {
    const hpPct = unit.maxHp > 0 ? Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100)) : 0;
    const spPct = unit.maxSp > 0 ? Math.max(0, Math.min(100, (unit.sp / unit.maxSp) * 100)) : 0;
    const absorptionPct = unit.maxAhp > 0 ? Math.max(0, Math.min(100, ((unit.ahp || 0) / unit.maxAhp) * 100)) : 0;
    const luckyPct = Math.max(0, Math.min(100, (unit.luckyCharges / luckyChargeCapForLevel(level)) * 100));
    const hpRow = (unit.ahp || 0) > 0
      ? (
        `<div class="resource-row"><span class="resource-label">HP</span><div class="resource-track resource-track-overlay">` +
        `<div class="resource-fill hp-fill resource-fill-base" style="width:${hpPct}%"></div>` +
        `<div class="resource-fill ahp-fill resource-fill-overlay" style="width:${absorptionPct}%"></div>` +
        `</div><span class="resource-value">${Math.round(unit.ahp || 0)}</span></div>`
      )
      : `<div class="resource-row"><span class="resource-label">HP</span><div class="resource-track"><div class="resource-fill hp-fill" style="width:${hpPct}%"></div></div><span class="resource-value">${unit.hp}</span></div>`;
    const luckyRow = charKey === "patrick"
      ? resourceRow("LC", luckyPct, unit.luckyCharges)
      : "";
    const shadowRow = charKey === "kostya"
      ? resourceRow("SC", Math.max(0, Math.min(100, shadowChargePct ?? 0)), Math.round(shadowChargePct ?? 0))
      : "";

    return (
      `<div class="card-name-line">${displayCharacterName(charKey)}</div>` +
      hpRow +
      `<div class="resource-row"><span class="resource-label">SP</span><div class="resource-track"><div class="resource-fill sp-fill" style="width:${spPct}%"></div></div><span class="resource-value">${unit.sp}</span></div>` +
      luckyRow +
      shadowRow
    );
  };

  const p1 = duoPlayers[0];
  const p1Char = duoCharacters[0];
  if (!p1 || !p1Char) {
    duoSlot.innerHTML = "";
    return;
  }

  if (bonus) {
    bonus.innerText = "";
    bonus.className = "battle-card-bonus hidden-bonus";
  }

  playerArt.src = battleCardArtForCharacter(p1Char, patrickBattleCard, kostyaBattleCard);
  playerArt.alt = `${displayCharacterName(p1Char)} battle card art`;
  playerStats.innerHTML = duoStatsHtml(p1, p1Char);

  if (bonus) {
    const p1SlateskinDef = Math.max(0, Math.floor(p1.slateskinDef || 0));
    if (p1SlateskinDef > 0) {
      bonus.innerText = `+${p1SlateskinDef} DEF`;
      bonus.className = "battle-card-bonus battle-card-bonus-temporary";
    } else if (p1Char === "player" && strengthenUpgrades > 0) {
      bonus.innerText = `+${strengthenUpgrades} DEF`;
      bonus.className = "battle-card-bonus";
    } else {
      bonus.innerText = "";
      bonus.className = "battle-card-bonus hidden-bonus";
    }
  }

  playerCard.classList.remove("player-battle-card", "player2-battle-card", "player3-battle-card");
  playerCard.classList.add("player1-battle-card");

  const partnerCards = [];
  for (let idx = 1; idx < duoPlayers.length; idx += 1) {
    const unit = duoPlayers[idx];
    const charKey = duoCharacters[idx];
    if (!unit || !charKey) continue;

    const playerClass = idx === 1 ? "player2-battle-card" : "player3-battle-card";
    const partnerSlateskinDef = Math.max(0, Math.floor(unit.slateskinDef || 0));
    const partnerBonusHtml = partnerSlateskinDef > 0
      ? `<div class="battle-card-bonus battle-card-bonus-temporary">+${partnerSlateskinDef} DEF</div>`
      : charKey === "player" && strengthenUpgrades > 0
        ? `<div class="battle-card-bonus">+${strengthenUpgrades} DEF</div>`
        : `<div class="battle-card-bonus hidden-bonus"></div>`;

    partnerCards.push(
      `<div class="battle-card-wrap">` +
      `<div class="battle-card-top">` +
      `<img class="battle-card-art" src="${battleCardArtForCharacter(charKey, patrickBattleCard, kostyaBattleCard)}" alt="${displayCharacterName(charKey)} battle card art">` +
      partnerBonusHtml +
      `</div>` +
      `<div class="battle-card ${playerClass}">` +
      `<div class="battle-card-stats">${duoStatsHtml(unit, charKey)}</div>` +
      `</div>` +
      `</div>`
    );
  }

  duoSlot.innerHTML = partnerCards.join("");
}

export function runDuoPartnerIdleAnimationUI(ctx, speedMs) {
  const {
    isDuoMode,
    duoCharacters,
    duoPlayers,
    playerSpriteIdForIndex,
    getEl,
    playerAnimating,
    playerAnimatingSpriteId,
    characterCollapsedSprite,
    idleFramesForCharacter,
    activeDuoPlayer
  } = ctx;

  const frameIndexes = new Map();

  return setInterval(() => {
    if (!isDuoMode()) return;

    for (let idx = 1; idx < duoCharacters.length; idx += 1) {
      const partnerUnit = duoPlayers[idx];
      const partnerChar = duoCharacters[idx];
      const spriteId = playerSpriteIdForIndex(idx);
      const img = getEl(spriteId);
      if (!img || !partnerChar || !partnerUnit) continue;

      const animating = typeof playerAnimating === "function" ? playerAnimating() : playerAnimating;
      const animSpriteId = typeof playerAnimatingSpriteId === "function"
        ? playerAnimatingSpriteId()
        : playerAnimatingSpriteId;
      if (animating && animSpriteId === spriteId) continue;

      if (partnerUnit.hp <= 0) {
        img.src = characterCollapsedSprite(partnerChar);
        continue;
      }

      const activeIdx = typeof activeDuoPlayer === "function" ? activeDuoPlayer() : activeDuoPlayer;
      const frames = idleFramesForCharacter(partnerChar, activeIdx === idx);
      const next = ((frameIndexes.get(idx) ?? 0) + 1) % frames.length;
      frameIndexes.set(idx, next);
      img.src = frames[next];
    }
  }, speedMs);
}
