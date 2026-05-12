import { JACOB_CHARACTER_ID } from "./jacob.js";
import { KOSTYA_CHARACTER_ID } from "./kostya.js";
import { PATRICK_CHARACTER_ID } from "./patrick.js";

export const DEFAULT_CHARACTER_ID = PATRICK_CHARACTER_ID;

export const CHARACTER_ROSTER = [
  {
    id: JACOB_CHARACTER_ID,
    hp: 40,
    sp: 100,
    rating: 4,
    classKey: "menu_class_goalkeeper",
    portraitSrc: "sprites/player/jacob/jacob_profile.png"
  },
  {
    id: KOSTYA_CHARACTER_ID,
    hp: 25,
    sp: 100,
    rating: 2.5,
    classKey: "menu_class_assassin",
    portraitSrc: "sprites/player/kostya/kostya_profile.png"
  },
  {
    id: PATRICK_CHARACTER_ID,
    hp: 30,
    sp: 100,
    rating: 3,
    classKey: "menu_class_gambler",
    portraitSrc: "sprites/player/patrick/patrick_profile.png"
  }
];

const CHARACTER_INFO = Object.fromEntries(CHARACTER_ROSTER.map((character) => [character.id, character]));

export function getCharacterInfo(characterId) {
  return CHARACTER_INFO[characterId] ?? CHARACTER_INFO[DEFAULT_CHARACTER_ID];
}

export function getLocalizedCharacterName(characterId, translate) {
  if (characterId === JACOB_CHARACTER_ID) {
    return translate("menu_character_jacob");
  }

  if (characterId === PATRICK_CHARACTER_ID) {
    return translate("menu_character_patrick");
  }

  if (characterId === KOSTYA_CHARACTER_ID) {
    return translate("menu_character_kostya");
  }

  return translate("player_name");
}
