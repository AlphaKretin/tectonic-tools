import loadedAbilities from "public/data/abilities.json";
import { Ability } from "./types/Ability";

interface LoadedAbility {
    id: string;
    name: string;
    description: string;
    flags: string[] | null;
}

function loadAbility(ability: LoadedAbility): Ability {
    const newFlags = ability.flags || [];
    return { ...ability, flags: newFlags };
}

export const abilities: Record<string, Ability> = Object.fromEntries(
    Object.entries(loadedAbilities).map(([id, ability]) => [id, loadAbility(ability)])
);

export const nullAbility: Ability = {
    id: "",
    name: "",
    description: "",
    flags: [],
};
