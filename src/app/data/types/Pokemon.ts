import { abilities } from "../abilities";
import { PokemonTribe, PokemonType } from "../basicData";
import { moves } from "../moves";
import { Evolution, LoadedPokemon } from "../pokemon";
import { Ability } from "./Ability";
import { Move } from "./Move";

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

function uniq<T>(a: T[]) {
    return a.filter((item, pos, self) => self.indexOf(item) == pos);
}

export class Pokemon {
    id: string;
    dex: number;
    name: string;
    type1: PokemonType;
    type2?: PokemonType;
    stats: Stats;
    abilities: Ability[];
    level_moves: [number, Move][];
    line_moves: Move[];
    tutor_moves: Move[];
    tribes: PokemonTribe[];
    height: number;
    weight: number;
    kind: string;
    pokedex: string;
    evos: Evolution[];
    constructor(mon: LoadedPokemon, dexNo: number) {
        this.id = mon.id;
        this.dex = dexNo;
        this.name = mon.name;
        this.type1 = mon.type1 as PokemonType;
        if (mon.type2 !== null) {
            this.type2 = mon.type2 as PokemonType;
        }
        this.stats = mon.stats;
        this.abilities = mon.abilities.map((a) => abilities[a]);
        this.level_moves = mon.level_moves.map((m) => [m[0] as number, moves[m[1]]]);
        this.line_moves = [];
        if (mon.line_moves !== null) {
            this.line_moves = mon.line_moves.map((m) => moves[m]);
        }
        this.tutor_moves = [];
        if (mon.tutor_moves !== null) {
            this.tutor_moves = mon.tutor_moves.map((m) => moves[m]);
        }
        this.tribes = [];
        if (mon.tribes !== null) {
            this.tribes = mon.tribes as PokemonTribe[];
        }
        this.height = mon.height;
        this.weight = mon.weight;
        this.kind = mon.kind;
        this.pokedex = mon.pokedex;
        this.evos = [];
        if (mon.evos !== null) {
            this.evos = mon.evos;
        }
    }

    public allMoves(): Move[] {
        const flatLevelMoves = this.level_moves.map((m) => m[1]);
        return uniq(flatLevelMoves.concat(this.line_moves, this.tutor_moves));
    }

    public hasType(type: PokemonType): boolean {
        return this.type1 === type || this.type2 === type;
    }

    public BST(): number {
        return (
            this.stats.hp +
            this.stats.attack +
            this.stats.defense +
            this.stats.spatk +
            this.stats.spdef +
            this.stats.speed
        );
    }
}
