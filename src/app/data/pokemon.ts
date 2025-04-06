import loadedPokemon from "public/data/pokemon.json";
import { blankStats, Pokemon, Stats } from "./types/Pokemon";

export interface Evolution {
    target: string;
    method: string;
    param: string;
}

export interface LoadedPokemon {
    id: string;
    name: string;
    type1: string;
    type2: string | null;
    stats: Stats;
    abilities: string[];
    level_moves: (number | string)[][];
    line_moves: string[] | null;
    tutor_moves: string[] | null;
    tribes: string[] | null;
    height: number;
    weight: number;
    kind: string;
    pokedex: string;
    evos: Evolution[] | null;
}

export const pokemon: Record<string, Pokemon> = Object.fromEntries(
    Object.entries(loadedPokemon).map(([id, mon], i) => [id, new Pokemon(mon, i + 1)])
);

export const nullPokemon: Pokemon = new Pokemon(
    {
        id: "id",
        name: "",
        type1: "Normal",
        type2: null,
        stats: blankStats,
        abilities: [],
        level_moves: [],
        line_moves: null,
        tutor_moves: null,
        tribes: null,
        height: 0,
        weight: 0,
        kind: "",
        pokedex: "",
        evos: null,
    },
    0
);
