import { PokemonStats } from "../../damagecalc/damageCalc";
import { StatusEffect } from "../statusEffects";
import { Move } from "../types/Move";

export const facadeMoves = ["FACADE"];

export class FacadeMove extends Move {
    public getPower(user: PokemonStats): number {
        if (user.status !== "None") {
            return this.bp * 2;
        }
        return this.bp;
    }

    public ignoreStatus(effect: StatusEffect): boolean {
        return effect === "Burn" || effect === "Frostbite";
    }
}
