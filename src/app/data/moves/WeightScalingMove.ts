import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";

export const weightScalingMoveCodes = ["ScalesTargetsWeight"];

export class WeightScalingMove extends Move {
    public getPower(_: PartyPokemon, target: PartyPokemon): number {
        let ret = 15;
        // Formula differs from Tectonic - they store weight in kg/10ths
        // we store kg directly
        const weight = Math.min(target.species.weight, 2000);
        ret += Math.floor((4 * Math.sqrt(weight)) / 5) * 5;
        return ret;
    }
}
