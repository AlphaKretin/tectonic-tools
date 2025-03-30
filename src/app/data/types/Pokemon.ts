import { PokemonType } from "../basicData";
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

export interface Pokemon {
    id: string;
    name: string;
    type1: PokemonType;
    type2?: PokemonType;
    stats: Stats;
    moves: Move[];
}
