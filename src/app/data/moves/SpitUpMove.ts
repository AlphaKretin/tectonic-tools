import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";

export const spitUpMoveCodes = ["PowerDependsOnUserStockpile"];

export class SpitUpMove extends Move {
    customVarName: string = "Stockpiles";
    customVarType: string = "number";
    needsInput: boolean = true;
    public getPower(user: PartyPokemon, target: PartyPokemon, stockpiles: number): number {
        stockpiles = Math.max(stockpiles, 0);
        stockpiles = Math.min(stockpiles, 3);
        return stockpiles * 150;
    }
}
