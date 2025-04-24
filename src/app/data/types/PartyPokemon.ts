import { nullAbility } from "../abilities";
import { nullForm } from "../forms";
import { nullItem } from "../items";
import { TypeChangingItem } from "../items/TypeChangingItem";
import { nullMove } from "../moves";
import { nullPokemon } from "../pokemon";
import { calculateHP, calculateStat } from "../stats";
import { StatusEffect, VolatileStatusEffect, volatileStatusEffects } from "../statusEffects";
import { MAX_LEVEL } from "../teamExport";
import { nullType } from "../types";
import { isNull } from "../util";
import { Ability } from "./Ability";
import { Item } from "./Item";
import { Move } from "./Move";
import { blankStats, defaultStylePoints, Pokemon, Stats, StylePoints } from "./Pokemon";
import { PokemonType } from "./PokemonType";

export class PartyPokemon {
    species: Pokemon;
    moves: Move[];
    ability: Ability;
    items: Item[];
    itemType: PokemonType;
    form: number;
    level: number;
    stylePoints: StylePoints;
    statSteps: Stats;
    statusEffect?: StatusEffect;
    volatileStatusEffects: Record<VolatileStatusEffect, boolean>;
    constructor(data?: Partial<PartyPokemon>) {
        this.species = data?.species || nullPokemon;
        this.moves = data?.moves || Array(4).fill(nullMove);
        this.ability = data?.ability || nullAbility;
        this.items = data?.items || Array(2).fill(nullItem);
        this.itemType = data?.itemType || nullType;
        this.form = data?.form || nullForm.formId;
        this.level = data?.level || MAX_LEVEL;
        this.stylePoints = data?.stylePoints || defaultStylePoints;
        this.statSteps = data?.statSteps || blankStats;
        this.statusEffect = data?.statusEffect;
        this.volatileStatusEffects =
            data?.volatileStatusEffects ||
            (Object.fromEntries(volatileStatusEffects.map((e) => [e, false])) as Record<VolatileStatusEffect, boolean>);
    }

    get stats(): Stats {
        const stylish = this.ability.id === "STYLISH";
        const calculatedStats: Stats = {
            hp: calculateHP(this.species.stats.hp, this.level, this.stylePoints.hp, stylish),
            attack: calculateStat(
                this.species.stats.attack,
                this.level,
                this.stylePoints.attacks,
                this.statSteps.attack,
                stylish
            ),
            defense: calculateStat(
                this.species.stats.defense,
                this.level,
                this.stylePoints.defense,
                this.statSteps.defense,
                stylish
            ),
            spatk: calculateStat(
                this.species.stats.spatk,
                this.level,
                this.stylePoints.attacks,
                this.statSteps.spatk,
                stylish
            ),
            spdef: calculateStat(
                this.species.stats.spdef,
                this.level,
                this.stylePoints.spdef,
                this.statSteps.spdef,
                stylish
            ),
            speed: calculateStat(
                this.species.stats.speed,
                this.level,
                this.stylePoints.speed,
                this.statSteps.speed,
                stylish
            ),
        };
        return calculatedStats;
    }

    get types(): { type1: PokemonType; type2?: PokemonType } {
        if (this.items.some((i) => i instanceof TypeChangingItem && i.canChangeType(this)) && !isNull(this.itemType)) {
            return { type1: this.itemType };
        }
        return { type1: this.species.getType1(this.form), type2: this.species.getType2(this.form) };
    }
}
