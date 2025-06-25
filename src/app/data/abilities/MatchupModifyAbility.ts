import { Ability } from "../tectonic/Ability";
import { PokemonType } from "../tectonic/PokemonType";

export abstract class MatchupModifyAbility extends Ability {
    protected affectedTypes: PokemonType[] = [];
    protected matchup: number = 1;

    protected affectsType(type: PokemonType) {
        return this.affectedTypes.map((t) => t.id).includes(type.id);
    }

    public modifiedMatchup(type: PokemonType) {
        return this.affectsType(type) ? this.matchup : 1;
    }
}
