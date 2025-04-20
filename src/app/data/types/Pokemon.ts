import { abilities } from "../abilities";
import { items } from "../items";
import { LoadedEvolution, LoadedPokemon } from "../loading/pokemon";
import { moves } from "../moves";
import { calculateHP, calculateStat } from "../stats";
import { tribes } from "../tribes";
import { types } from "../types";
import { uniq } from "../util";
import { Ability } from "./Ability";
import { Item } from "./Item";
import { Move } from "./Move";
import { NTreeNode } from "./NTreeNode";
import { PokemonType } from "./PokemonType";
import { Tribe } from "./Tribe";

export interface Stats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spatk: number;
    spdef: number;
}

export const blankStats: Stats = {
    hp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    spatk: 0,
    spdef: 0,
};

export interface StylePoints {
    hp: number;
    attacks: number;
    defense: number;
    spdef: number;
    speed: number;
}

export const defaultStylePoints: StylePoints = {
    hp: 10,
    attacks: 10,
    defense: 10,
    spdef: 10,
    speed: 10,
};

function getterFactory<T extends keyof Pokemon>(mon: Pokemon, key: T) {
    return function (form: number = -1) {
        if (form in mon.forms && mon.forms[form][key] !== undefined) {
            return mon.forms[form][key];
        }
        return mon[key];
    };
}

export type PokemonForm = Partial<Pokemon> & { formId: number };

const EHP_LEVEL = 50;
const DEFAULT_STYLE_VALUE = 10;

export class Pokemon {
    id: string;
    dex: number;
    name: string;
    formName?: string;
    type1: PokemonType;
    type2?: PokemonType;
    stats: Stats;
    abilities: Ability[];
    levelMoves: [number, Move][];
    lineMoves: Move[];
    tutorMoves: Move[];
    tribes: Tribe[];
    height: number;
    weight: number;
    kind: string;
    pokedex: string;
    forms: PokemonForm[] = [];
    items: Item[];
    evolutionTree: NTreeNode<LoadedEvolution>;

    constructor(mon: LoadedPokemon, dexNo: number) {
        this.id = mon.key;
        this.dex = dexNo;
        this.name = mon.name;
        if (mon.formName) {
            this.formName = mon.formName;
        }
        this.type1 = types[mon.type1];
        if (mon.type2) {
            this.type2 = types[mon.type2];
        }
        this.stats = {
            hp: mon.hp,
            attack: mon.attack,
            spatk: mon.spAttack,
            speed: mon.speed,
            defense: mon.defense,
            spdef: mon.spDefense,
        };
        this.abilities = mon.abilities.map((a) => abilities[a]);

        this.levelMoves = mon.levelMoves.map(([level, id]) => [level, moves[id]]);
        this.lineMoves = mon.lineMoves.map((m) => moves[m]);
        this.tutorMoves = mon.tutorMoves.map((m) => moves[m]);

        this.tribes = mon.tribes.map((t) => tribes[t]);
        this.height = mon.height;
        this.weight = mon.weight;
        this.kind = mon.kind;
        this.pokedex = mon.pokedex;
        this.items = mon.wildItems.map((i) => items[i]);
        this.evolutionTree = mon.evolutionTree!;
    }

    public addForms(forms: PokemonForm[]) {
        this.forms = this.forms.concat(forms);
    }

    public allMoves(currentForm: number = 0): Move[] {
        const flatLevelMoves = this.getLevelMoves(currentForm).map((m) => m[1]);
        return uniq(flatLevelMoves.concat(this.lineMoves, this.tutorMoves));
    }

    public hasType(type: PokemonType): boolean {
        return this.type1 === type || this.type2 === type;
    }

    public BST(currentForm: number = 0): number {
        const stats = this.getStats(currentForm);
        return stats.hp + stats.attack + stats.defense + stats.spatk + stats.spdef + stats.speed;
    }

    public getEvoNode(): NTreeNode<LoadedEvolution> {
        return this.evolutionTree.findDepthFirst((node) => node.getData().pokemon == this.id)!;
    }

    public isFinalEvo(): boolean {
        return this.getEvoNode().isLeaf();
    }

    public getFormName = getterFactory(this, "formName");
    public getType1 = getterFactory(this, "type1");
    public getType2 = getterFactory(this, "type2");
    public getAbilities = getterFactory(this, "abilities");
    public getStats = getterFactory(this, "stats");
    public getPokedex = getterFactory(this, "pokedex");
    public getLevelMoves = getterFactory(this, "levelMoves");

    public getPEHP(currentForm: number = 0) {
        const stats = this.getStats(currentForm);
        const defStat = stats.defense;
        const hpValue = calculateHP(stats.hp, EHP_LEVEL, DEFAULT_STYLE_VALUE);
        const defValue = calculateStat(defStat, EHP_LEVEL, DEFAULT_STYLE_VALUE);
        return Math.max(Math.round((hpValue * defValue) / 100), 1);
    }

    public getSEHP(currentForm: number = 0) {
        const stats = this.getStats(currentForm);
        const defStat = stats.spdef;
        const hpValue = calculateHP(stats.hp, EHP_LEVEL, DEFAULT_STYLE_VALUE);
        const defValue = calculateStat(defStat, EHP_LEVEL, DEFAULT_STYLE_VALUE);
        return Math.max(Math.round((hpValue * defValue) / 100), 1);
    }

    public getImage(currentForm: number = 0) {
        return "/Pokemon/" + this.id + (currentForm > 0 ? "_" + this.forms[currentForm].formId : "") + ".png";
    }
}
