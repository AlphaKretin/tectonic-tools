import loadedChart from "public/data/typechart.json";
import { ExtraTypeMove } from "./moves/ExtraTypeMove";
import { types } from "./types";
import { Ability } from "./types/Ability";
import { Move } from "./types/Move";
import { PokemonType } from "./types/PokemonType";

export const typeChart = loadedChart;

interface AttackerData {
    type: PokemonType;
    move?: Move;
    ability?: Ability;
}

interface DefenderData {
    type1: PokemonType;
    type2?: PokemonType;
    ability?: Ability;
}

const immunityAbilities = [
    { ability: "AERODYNAMIC", type1: "FLYING" },
    { ability: "CHALLENGER", type1: "FIGHTING" },
    { ability: "COLDRECEPTION", type1: "ICE" },
    { ability: "DESERTSPIRIT", type1: "GROUND" },
    { ability: "DRAGONSLAYER", type1: "DRAGON" },
    { ability: "FILTHY", type1: "POISON" },
    { ability: "FIREFIGHTER", type1: "FIRE" },
    { ability: "FLYTRAP", type1: "BUG" },
    { ability: "FOOLHARDY", type1: "PSYCHIC" },
    { ability: "FULLBLUBBER", type1: "WATER", type2: "ICE" },
    { ability: "GLASSFIRING", type1: "FIRE" },
    { ability: "HEARTLESS", type1: "FAIRY" },
    { ability: "HEARTOFJUSTICE", type1: "DARK" },
    { ability: "INDUSTRIALIZE", type1: "STEEL" },
    { ability: "PECKINGORDER", type1: "FLYING" },
    { ability: "POISONABSORB", type1: "POISON" },
    { ability: "ROCKCLIMBER", type1: "ROCK" },
    { ability: "STEELABSORB", type1: "STEEL" },
    { ability: "VENOMDETTA", type1: "POISON" },
    { ability: "LEVITATE", type1: "GROUND" },
    { ability: "MOTORDRIVE", type1: "ELECTRIC" },
    { ability: "SAPSIPPER", type1: "GRASS" },
    { ability: "VOLTABSORB", type1: "ELECTRIC" },
    { ability: "WATERABSORB", type1: "WATER" },
    { ability: "WONDERGUARD", type1: "QMARKS" },
];
const halfDmgAbilities = [
    { ability: "EXORCIST", type1: "PSYCHIC", type2: "GHOST" },
    { ability: "FEATHERCOAT", type1: "ICE", type2: "FLYING" },
    { ability: "REALIST", type1: "DRAGON", type2: "FAIRY" },
    { ability: "TOUGH", type1: "FIGHTING", type2: "ROCK" },
    { ability: "UNAFRAID", type1: "DARK", type2: "BUG" },
    { ability: "THICKFAT", type1: "FIRE", type2: "ICE" },
    { ability: "WATERBUBBLE", type1: "FIRE" },
];
const doubleTakenAbilities = [
    { ability: "FLUFFY", type1: "FIRE" },
    { ability: "PARANOID", type1: "PSYCHIC" },
];
const isAlsoTypeAbilities = [
    { ability: "HAUNTED", type1: "GHOST" },
    { ability: "INFECTED", type1: "GRASS" },
    { ability: "RUSTWRACK", type1: "STEEL" },
    { ability: "SLUGGISH", type1: "BUG" },
];
// TODO: Convert to move subclass checking function code
const doubleDealtMoves = [
    { move: "HONORLESSSTING", type1: "FIGHTING" },
    { move: "SLAY", type1: "DRAGON" },
    { move: "HOLLYCHARM", type1: "GHOST" },
    { move: "BLACKOUT", type1: "ELECTRIC" },
];

export function calcTypeMatchup(atk: AttackerData, def: DefenderData) {
    const atkType = atk.type;
    const defType1 = def.type1;
    let thirdType = null;

    let defType1Calc = typeChart[atkType.index][defType1.index];
    let defType2Calc = 1.0;
    let defAbilityCalc = 1.0;
    if (def.type2 !== undefined) {
        const defType2 = def.type2;
        defType2Calc = typeChart[atkType.index][defType2.index];
    }
    const defAbility = def.ability;
    if (defAbility !== undefined) {
        const immunityMatch = immunityAbilities.find((x) => x.ability == defAbility.id);
        const halfMatch = halfDmgAbilities.find((x) => x.ability == defAbility.id);
        const doubleMatch = doubleTakenAbilities.find((x) => x.ability == defAbility.id);
        const isAlsoTypeMatch = isAlsoTypeAbilities.find((x) => x.ability == defAbility.id);

        if (defAbility.id == "WONDERGUARD" && defType1Calc * defType2Calc < 1) {
            defAbilityCalc = 0;
        } else if (defAbility.id == "UNFAZED" && defType1Calc * defType2Calc == 1) {
            defAbilityCalc = 0.8;
        } else if (defAbility.id == "WELLSUITED" && defType1Calc * defType2Calc < 1) {
            defAbilityCalc = 0.5;
        } else if (defAbility.id == "FILTER" && defType1Calc * defType2Calc > 1) {
            defAbilityCalc = 0.75;
        } else if (
            immunityMatch !== undefined &&
            (immunityMatch.type1 == atk.type.id || immunityMatch.type2 == atk.type.id)
        ) {
            defAbilityCalc = 0;
        } else if (halfMatch !== undefined && (halfMatch.type1 == atk.type.id || halfMatch.type2 == atk.type.id)) {
            defAbilityCalc = 0.5;
        } else if (doubleMatch !== undefined && doubleMatch.type1 == atk.type.id) {
            defAbilityCalc = 2.0;
        } else if (isAlsoTypeMatch !== undefined) {
            const defType3 = types[isAlsoTypeMatch.type1];
            defAbilityCalc = typeChart[atkType.index][defType3.index];
            thirdType = isAlsoTypeMatch.type1;
        }
    }

    let atkAbilityCalc = 1.0;
    let atkMoveCalc = 1.0;
    const atkAbility = atk.ability;
    if (atkAbility !== undefined) {
        if (atkAbility.flags.includes("MoldBreaking")) {
            defAbilityCalc = 1.0;
        } else if (atkAbility.id == "BREAKTHROUGH") {
            defType1Calc = defType1Calc == 0 ? 1.0 : defType1Calc;
            defType2Calc = defType2Calc == 0 ? 1.0 : defType2Calc;
            defAbilityCalc = defAbilityCalc == 0 && thirdType != null ? 1.0 : defAbilityCalc;
        } else if (atkAbility.id == "TINTEDLENS") {
            atkAbilityCalc = defType1Calc * defType2Calc * defAbilityCalc < 1 ? 2 : 1;
        } else if (atkAbility.id == "EXPERTISE") {
            atkAbilityCalc = 1.3;
        }
    }
    const atkMove = atk.move;
    if (atkMove !== undefined) {
        const doubleDealtMatch = doubleDealtMoves.find((x) => x.move == atkMove.id);
        if (
            doubleDealtMatch !== undefined &&
            (doubleDealtMatch.type1 == def.type1.id ||
                doubleDealtMatch.type1 == def.type2?.id ||
                doubleDealtMatch.type1 == thirdType)
        ) {
            atkMoveCalc = 0;
        }
        if (atkMove instanceof ExtraTypeMove) {
            // should not recur by a depth of more than 1, since move is no longer defined
            const extraTypeCalc = calcTypeMatchup({ type: atkMove.extraType }, def);
            atkMoveCalc *= extraTypeCalc;
        }
    }

    return defType1Calc * defType2Calc * defAbilityCalc * atkAbilityCalc * atkMoveCalc;
}
