export const BURGER_ITEM_ID = "burger-item";
export const BOMB_ITEM_ID = "bomb-item";
export const CHERRY_ITEM_ID = "cherry-item";
export const SALAD_ITEM_ID = "salad-item";
export const INVENTORY_MAX_SLOTS = 5;
export const INVENTORY_DEFAULT_STACK_SIZE = 5;

const INVENTORY_ITEM_DEFINITIONS = {
  [BURGER_ITEM_ID]: {
    id: BURGER_ITEM_ID,
    labelKey: "action_burger_item",
    iconId: BURGER_ITEM_ID,
    inspectId: BURGER_ITEM_ID,
    stackSize: INVENTORY_DEFAULT_STACK_SIZE
  },
  [BOMB_ITEM_ID]: {
    id: BOMB_ITEM_ID,
    labelKey: "action_bomb_item",
    iconId: BOMB_ITEM_ID,
    inspectId: BOMB_ITEM_ID,
    stackSize: INVENTORY_DEFAULT_STACK_SIZE
  },
  [CHERRY_ITEM_ID]: {
    id: CHERRY_ITEM_ID,
    labelKey: "action_cherry_item",
    iconId: CHERRY_ITEM_ID,
    inspectId: CHERRY_ITEM_ID,
    stackSize: INVENTORY_DEFAULT_STACK_SIZE
  },
  [SALAD_ITEM_ID]: {
    id: SALAD_ITEM_ID,
    labelKey: "action_salad_item",
    iconId: SALAD_ITEM_ID,
    inspectId: SALAD_ITEM_ID,
    stackSize: INVENTORY_DEFAULT_STACK_SIZE
  }
};

export function createPlayerInventoryState() {
  return [];
}

export function getInventoryItemDefinition(itemId) {
  return INVENTORY_ITEM_DEFINITIONS[itemId] ?? null;
}

export function getInventoryMenuActions(player, backAction) {
  const actions = backAction ? [{ ...backAction }] : [];
  const inventory = Array.isArray(player?.inventory) ? player.inventory : [];

  inventory.forEach((slot, index) => {
    const definition = getInventoryItemDefinition(slot?.itemId);
    const quantity = Math.max(0, Math.floor(Number(slot?.quantity) || 0));
    if (!definition || quantity <= 0) {
      return;
    }

    actions.push({
      id: `inventory-slot-${index}-${definition.id}`,
      labelKey: definition.labelKey,
      iconId: definition.iconId,
      inspectId: definition.inspectId,
      itemId: definition.id,
      inventorySlotIndex: index,
      quantity
    });
  });

  return actions;
}

export function addInventoryItem(player, itemId, quantity = 1) {
  const definition = getInventoryItemDefinition(itemId);
  let remaining = Math.max(0, Math.floor(Number(quantity) || 0));
  if (!player || !definition || remaining <= 0) {
    return 0;
  }

  if (!Array.isArray(player.inventory)) {
    player.inventory = [];
  }

  player.inventory.forEach((slot) => {
    if (remaining <= 0 || slot?.itemId !== itemId) {
      return;
    }

    const currentQuantity = Math.max(0, Math.floor(Number(slot.quantity) || 0));
    const spaceLeft = Math.max(0, definition.stackSize - currentQuantity);
    if (spaceLeft <= 0) {
      return;
    }

    const added = Math.min(spaceLeft, remaining);
    slot.quantity = currentQuantity + added;
    remaining -= added;
  });

  while (remaining > 0 && player.inventory.length < INVENTORY_MAX_SLOTS) {
    const added = Math.min(definition.stackSize, remaining);
    player.inventory.push({
      itemId,
      quantity: added
    });
    remaining -= added;
  }

  return Math.max(0, Math.floor(Number(quantity) || 0)) - remaining;
}

export function consumeInventoryItem(player, slotIndex, quantity = 1) {
  const inventory = Array.isArray(player?.inventory) ? player.inventory : null;
  const normalizedSlotIndex = Math.max(0, Math.floor(Number(slotIndex) || 0));
  const normalizedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
  if (!inventory || normalizedQuantity <= 0 || normalizedSlotIndex >= inventory.length) {
    return 0;
  }

  const slot = inventory[normalizedSlotIndex];
  const currentQuantity = Math.max(0, Math.floor(Number(slot?.quantity) || 0));
  if (currentQuantity <= 0) {
    return 0;
  }

  const consumed = Math.min(currentQuantity, normalizedQuantity);
  slot.quantity = currentQuantity - consumed;
  if (slot.quantity <= 0) {
    inventory.splice(normalizedSlotIndex, 1);
  }

  return consumed;
}

export function getInventoryItemCount(player, itemId) {
  if (!Array.isArray(player?.inventory)) {
    return 0;
  }

  return player.inventory.reduce((total, slot) => (
    slot?.itemId === itemId
      ? total + Math.max(0, Math.floor(Number(slot.quantity) || 0))
      : total
  ), 0);
}
