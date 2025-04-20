import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";

export const desperationMoves = ["FLAIL"];

export class DesperationMove extends Move<number> {
    customVarName: string = "HP";
    needsInput: boolean = true;
    public getPower(user: PartyPokemon, hp: number): number {
        hp = Math.max(hp, 1);
        hp = Math.min(hp, user.stats.hp);
        const hpRatio = hp / user.stats.hp;
        return Math.min(Math.floor(20 / (hpRatio * 5) ** 0.75) * 5, 200);
    }
}
