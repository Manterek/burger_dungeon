function createDefaultStatuses() {
  return {
    resistance: { power: 0, turns: 0 },
    weakness: { power: 0, turns: 0 },
    decay: { power: 0, turns: 0 },
    poison: { power: 0, turns: 0 },
    regen: { power: 0, turns: 0 }
  };
}

function renderAbilityButtons(ctx, abilities) {
  const actions = ctx.getEl("actions");
  if (!actions) return;
  actions.innerHTML = abilities.map((ability) => ctx.abilityButtonHtml(ability)).join("");
}

function bindAbilityButton(ctx, ability, handler, disabled, locked = disabled) {
  const button = ctx.getEl(ability.id);
  if (!button) return;
  button.onclick = () => {
    ctx.setQueuedActionPreview?.(ability);
    return handler();
  };
  button.disabled = !!disabled;
  ctx.setAbilityLocked(button, !!locked);
}

export const JACOB_SPRITES = {
  base: "sprites/player/jacob/jacob.png",
  battleCard: "sprites/player/jacob/jacob_profile.png",
  templateAbilityIcon: "sprites/player/jacob/jacob_template_ability.png"
};

export const JACOB_ABILITIES = {
  swing: { id: "atk", name: "Swing", sp: 0, icon: JACOB_SPRITES.templateAbilityIcon },
  piercer: { id: "prc", name: "Piercer", sp: 40, icon: JACOB_SPRITES.templateAbilityIcon },
  lunge: { id: "swg", name: "Lunge", sp: 20, icon: JACOB_SPRITES.templateAbilityIcon },
  defend: { id: "def", name: "Defend", sp: 0, icon: JACOB_SPRITES.templateAbilityIcon },
  summonHelper: { id: "sum", name: "Summon Helper", sp: 100, icon: JACOB_SPRITES.templateAbilityIcon },
  healHelper: { id: "sum", name: "Heal Helper", sp: 100, icon: JACOB_SPRITES.templateAbilityIcon }
};

export class Player {
  constructor() {
    this.maxHp = 40;
    this.hp = 40;
    this.maxSp = 100;
    this.sp = 0;
    this.atk = 5;
    this.def = 0;
    this.inventory = [];
    this.potions = 0;
    this.luckyCharges = 0;
    this.slateskinDef = 0;
    this.slateskinTurns = 0;
    this.statuses = createDefaultStatuses();
  }

  attack(target) {
    const dmg = Math.max(1, this.atk - target.def);
    target.hp -= dmg;
    return dmg;
  }

  heal(amount = 10) {
    if (this.potions <= 0) return false;
    this.potions -= 1;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return true;
  }
}

export function renderJacobCombatActions(ctx) {
  const player = ctx.getPlayer();
  const hasFrontEnemy = !!ctx.frontEnemy();
  const helperPresent = !!ctx.getHelper?.();
  const summonAbility = helperPresent ? JACOB_ABILITIES.healHelper : JACOB_ABILITIES.summonHelper;
  const canShowSummonButton = !!ctx.canShowSummonButton?.();
  const abilities = [
    JACOB_ABILITIES.swing,
    JACOB_ABILITIES.piercer,
    JACOB_ABILITIES.lunge,
    JACOB_ABILITIES.defend
  ];

  if (canShowSummonButton) abilities.push(summonAbility);

  renderAbilityButtons(ctx, abilities);

  bindAbilityButton(ctx, JACOB_ABILITIES.swing, ctx.playerAttack, !hasFrontEnemy, false);
  bindAbilityButton(
    ctx,
    JACOB_ABILITIES.piercer,
    ctx.playerPiercer,
    !hasFrontEnemy || player.sp < JACOB_ABILITIES.piercer.sp,
    player.sp < JACOB_ABILITIES.piercer.sp
  );
  bindAbilityButton(
    ctx,
    JACOB_ABILITIES.lunge,
    ctx.playerSwing,
    !hasFrontEnemy || player.sp < JACOB_ABILITIES.lunge.sp,
    player.sp < JACOB_ABILITIES.lunge.sp
  );
  bindAbilityButton(ctx, JACOB_ABILITIES.defend, ctx.playerDefend, false, false);

  if (canShowSummonButton) {
    bindAbilityButton(
      ctx,
      summonAbility,
      ctx.summonHelper,
      player.sp < summonAbility.sp,
      player.sp < summonAbility.sp
    );
  }

  ctx.updateAbilityGridScale();
  ctx.resetActionSelection();
}
