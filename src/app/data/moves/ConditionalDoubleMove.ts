import { LoadedMove } from "../loading/moves";
import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";

export const conditionalDoubleMoveCodes: Record<string, string> = {
    DoubleDamageAvengingFaint: "Ally Fainted Last Turn",
    Round: "Other Round This Turn",
    DoubleDamageTargetHitUser: "Target Damaged User This Turn",
};

export class ConditionalDoubleMove extends Move {
    customVarName: string;
    customVarType: string = "boolean";
    needsInput: boolean = true;
    constructor(move: LoadedMove, condition: string) {
        super(move);
        this.customVarName = condition;
    }

    public getPower(_: PartyPokemon, __: PartyPokemon, condition: boolean): number {
        return this.bp * (condition ? 2 : 1);
    }
}
