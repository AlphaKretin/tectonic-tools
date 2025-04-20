import { StatusEffect } from "../statusEffects";
import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";

export const facadeMoves = ["FACADE"];

export class FacadeMove extends Move {
    public getPower(user: PartyPokemon): number {
        if (user.statusEffect !== "None") {
            return this.bp * 2;
        }
        return this.bp;
    }

    public ignoreStatus(effect: StatusEffect): boolean {
        return effect === "Burn" || effect === "Frostbite";
    }
}
