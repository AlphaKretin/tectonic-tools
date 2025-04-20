import { LoadedMove } from "../loading/moves";
import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";

export const stackingMoveCodes = ["EchoedVoice"];

export class StackingMove extends Move {
    customVarName: string = "Turns";
    customVarType: string = "number";
    needsInput: boolean = true;
    constructor(move: LoadedMove) {
        super(move);
    }

    public getPower(_: PartyPokemon, __: PartyPokemon, turns: number): number {
        return this.bp * Math.pow(2, turns);
    }
}
