import { MoveData } from "@/app/damagecalc/components/MoveCard";
import { BattleState } from "../battleState";
import { Ability } from "../tectonic/Ability";
import { PartyPokemon } from "../types/PartyPokemon";

export class FasterBoostDamageAbility extends Ability {
    public movePowerMultiplier(move: MoveData, user: PartyPokemon, target: PartyPokemon, battleState: BattleState) {
        let damageMult = 1.0;
        const userSpeed = user.getStats(battleState, move, "player").speed;
        const targetSpeed = target.getStats(battleState, move, "opponent").speed;
        if (userSpeed > targetSpeed) {
            let speedMult = userSpeed / targetSpeed;
            if (speedMult > 2) {
                speedMult = 2;
            }
            damageMult += speedMult / 4;
        }
        return damageMult;
    }

    static abilityIds = ["BALLLIGHTNING"];
}
