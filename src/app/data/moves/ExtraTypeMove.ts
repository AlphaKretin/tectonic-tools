import { LoadedMove } from "../loading/moves";
import { types } from "../types";
import { Move } from "../types/Move";
import { PokemonType } from "../types/PokemonType";

export const extraTypeMoveCodes: Record<string, string> = { EffectivenessIncludesFlyingType: "FLYING" };

export class ExtraTypeMove extends Move {
    extraType: PokemonType;
    constructor(move: LoadedMove, extraType: string) {
        super(move);
        this.extraType = types[extraType];
    }
}
