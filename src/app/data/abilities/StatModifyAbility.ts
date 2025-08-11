import { LoadedAbility } from "@/preload/loadedDataClasses";
import { BattleState } from "../battleState";
import { Ability } from "../tectonic/Ability";
import { Stat, Stats } from "../tectonic/Pokemon";

type statBoostConditionFunction = (battleState: BattleState) => boolean;

const statModifyConditions: Record<string, statBoostConditionFunction> = {
    OVERWHELM: (battleState: BattleState) =>
        battleState.weather === "Rainstorm" || battleState.weather === "Heavy Rain", //TODO: make saner checks for "is raining, is sunny" etc
};

// RADIATE works differently on live and dev - currently implementing live version
const statModifyAbilities: Record<string, [Stat, number]> = {
    RADIATE: ["spatk", 1.3],
    PUREFORCE: ["attack", 1.5],
    PUREENERGY: ["spatk", 1.5],
    DEEPSTING: ["attack", 1.5],
    OVERWHELM: ["spatk", 1.3],
};

export class StatModifyAbility extends Ability {
    private modifyCondition: statBoostConditionFunction;
    private modifiedStat: Stat;
    private statMult: number;

    constructor(ability: LoadedAbility) {
        super(ability);
        this.modifiedStat = statModifyAbilities[ability.key][0];
        this.statMult = statModifyAbilities[ability.key][1];
        this.modifyCondition = statModifyConditions[ability.key] || (() => true);
    }

    public modifyStats(stats: Stats, battleState: BattleState): Stats {
        if (this.modifyCondition(battleState)) {
            stats[this.modifiedStat] *= this.statMult;
        }
        return stats;
    }

    static abilityIds = Object.keys(statModifyAbilities);
}
