import { StylePoints } from "./BasicData";
import { Pokemon } from "./Pokemon";

interface TrainerPokemon {
    pokemon: Pokemon;
    sp: StylePoints;
}

export interface Trainer {
    class: string;
    name: string;
    hashName?: string; // for masked villains
    version: number;
    pokemon: TrainerPokemon[];
}
