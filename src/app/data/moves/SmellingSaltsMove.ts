import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";

export const smellingSaltsMoveCodes = ["SmellingSalts"];

export class SmellingSaltsMove extends Move {
    public getPower(_: PartyPokemon, target: PartyPokemon): number {
        if (target.statusEffect === "Numb") {
            return this.bp * 2;
        }
        return this.bp;
    }
}
