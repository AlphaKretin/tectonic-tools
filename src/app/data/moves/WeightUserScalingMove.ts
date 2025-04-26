import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";

export class WeightUserScalingMove extends Move {
    public getPower(user: PartyPokemon, target: PartyPokemon): number {
        let ret = 40;
        // weight differs from here to tectonic, but by a consistent factor
        // so this division should always be the same
        let ratio = user.species.weight / target.species.weight;
        ratio = Math.min(ratio, 10);
        ret += Math.floor((16 * ratio ** 0.75) / 5) * 5;
        return ret;
    }

    static moveCodes = ["ScalesHeavierThanTarget"];
}
