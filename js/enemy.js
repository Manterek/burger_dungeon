const BOSS_HP_BY_LEVEL = {
  10: 100,
  20: 200,
  30: 350,
  40: 500,
  50: 2800
};

const BOSS_ATK_BY_LEVEL = {
  10: 12,
  20: 16,
  30: 20,
  40: 24,
  50: 30
};

function createDefaultStatuses() {
  return {
    resistance: { power: 0, turns: 0 },
    weakness: { power: 0, turns: 0 },
    decay: { power: 0, turns: 0 },
    poison: { power: 0, turns: 0 },
    regen: { power: 0, turns: 0 },
    slowness: { power: 0, turns: 0 },
    stunned: { power: 0, turns: 0 }
  };
}

function enemyRoleFlags(kind) {
  return {
    isBoss: kind === "boss",
    isMinion: kind === "minion",
    isTank: kind === "tank",
    isSupport: kind === "support",
    isBruiser: kind === "bruiser"
  };
}

function scaledEnemyStats(level) {
  const levelOffset = Math.max(0, level - 1);
  return {
    hp: 10 + Math.floor(levelOffset * 2 + levelOffset * levelOffset * 0.09),
    atk: 3 + Math.floor(level * 0.75 + level * level * 0.02),
    def: Math.floor((level * 0.65) / 2)
  };
}

function bossStats(level) {
  return {
    hp: BOSS_HP_BY_LEVEL[level] ?? (46 + Math.floor(level * 2.2 + level * level * 0.12)),
    atk: BOSS_ATK_BY_LEVEL[level] ?? (8 + Math.floor(level * 0.9 + level * level * 0.025)),
    def: 3 + Math.floor(level * 0.23 + level * level * 0.004)
  };
}

function enemyName(level, { isBoss, isMinion, isTank, isSupport, isBruiser }) {
  if (isBoss) return level === 50 ? "Burger Overlord" : "Grease Warden";
  if (isTank) return "Bun Bastion";
  if (isSupport) return "Sauce Shaman";
  if (isBruiser) return "Patty Pummeler";
  if (isMinion) return "Grease Minion";
  return "Grease Mutant";
}

function enemyMaxHp(level, baseStats, bossBase, { isBoss, isMinion, isTank, isSupport, isBruiser }) {
  const normalHp = Math.min(150, baseStats.hp);
  const tankHp = Math.min(300, normalHp * 2);
  const supportHp = Math.min(75, Math.max(1, Math.floor(normalHp * 0.5)));
  const bruiserHp = Math.max(normalHp + 2, Math.floor((normalHp + tankHp) * 0.5));

  if (isBoss) return bossBase.hp;
  if (isTank) return tankHp;
  if (isSupport) return supportHp;
  if (isBruiser) return bruiserHp;
  if (isMinion) return 9 + Math.floor(level * 1.35 + level * level * 0.05);
  return normalHp;
}

function enemyAttack(level, baseStats, bossBase, { isBoss, isMinion, isTank, isSupport, isBruiser }) {
  if (isBoss) return bossBase.atk;
  if (isTank) return Math.max(1, Math.floor(baseStats.atk * 0.5));
  if (isSupport) return Math.max(1, Math.floor(baseStats.atk * 0.4));
  if (isBruiser) return Math.max(1, Math.floor(baseStats.atk * 1.2));
  if (isMinion) return 2 + Math.floor(level * 0.4 + level * level * 0.01);
  return baseStats.atk;
}

function enemyDefense(level, baseStats, bossBase, { isBoss, isMinion, isTank, isSupport, isBruiser }) {
  if (isBoss) return bossBase.def;
  if (isTank) return Math.max(1, Math.floor(level * 0.35 + level * level * 0.006));
  if (isSupport) return Math.max(0, Math.floor(level * 0.11));
  if (isBruiser) return Math.max(1, Math.floor(baseStats.def * 1.15));
  if (isMinion) return Math.floor(level * 0.09);
  return baseStats.def;
}

function enemyBlockChance({ isBoss, isMinion, isTank, isSupport, isBruiser }) {
  if (isTank) return 0.7;
  if (isMinion) return 0.35;
  if (isSupport) return 0.12;
  if (isBruiser) return 0;
  if (isBoss) return 0;
  return 0.28;
}

export class Enemy {
  constructor(level, kind = "normal") {
    const roleFlags = enemyRoleFlags(kind);
    const baseStats = scaledEnemyStats(level);
    const bossBase = bossStats(level);

    this.kind = kind;
    this.name = enemyName(level, roleFlags);
    this.maxHp = enemyMaxHp(level, baseStats, bossBase, roleFlags);
    this.hp = this.maxHp;
    this.atk = enemyAttack(level, baseStats, bossBase, roleFlags);
    this.def = enemyDefense(level, baseStats, bossBase, roleFlags);
    this.boss = roleFlags.isBoss;
    this.minion = roleFlags.isMinion;
    this.tank = roleFlags.isTank;
    this.support = roleFlags.isSupport;
    this.bruiser = roleFlags.isBruiser;
    this.blockChance = enemyBlockChance(roleFlags);
    this.blocking = false;
    this.stunTurns = 0;
    this.statuses = createDefaultStatuses();
  }
}
