import loadedAbilities from "public/data/abilities.json";
import { twoItemAbilities, TwoItemAbility } from "./abilities/TwoItemAbility";
import { LoadedAbility } from "./loading/abilities";
import { Ability } from "./types/Ability";

function loadAbility(ability: LoadedAbility): Ability {
    if (ability.key in twoItemAbilities) {
        return new TwoItemAbility(ability, twoItemAbilities[ability.key]);
    }
    return new Ability(ability);
}

export const abilities: Record<string, Ability> = Object.fromEntries(
    Object.entries(loadedAbilities).map(([id, ability]) => [id, loadAbility(ability)])
);

export const nullAbility: Ability = new Ability({
    key: "",
    name: "",
    description: "",
    flags: [],
});
