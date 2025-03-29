import { pokemon } from "../pokemon";
import { StylePoints } from "./BasicData";
import { Pokemon } from "./Pokemon";

export interface TrainerPokemon {
    pokemon: Pokemon;
    sp: StylePoints;
    level: number;
}

interface LoadedTrainerPokemon {
    id: string;
    level: number;
    sp: StylePoints;
}

interface LoadedTrainer {
    class: string;
    name: string;
    hashName: string | null; // for masked villains
    version: number;
    pokemon: LoadedTrainerPokemon[];
}

export class Trainer {
    class: string;
    name: string;
    hashName?: string; // for masked villains
    version: number;
    pokemon: TrainerPokemon[];
    constructor(loadedTrainer: LoadedTrainer) {
        const trainerMons = loadedTrainer.pokemon.map((mon) => {
            return { ...mon, pokemon: pokemon[mon.id] };
        });
        this.class = loadedTrainer.class;
        this.name = loadedTrainer.name;
        this.hashName = loadedTrainer.hashName || undefined;
        this.version = loadedTrainer.version;
        this.pokemon = trainerMons;
    }

    public key(): string {
        return this.class + this.name + this.version;
    }

    public displayName(): string {
        return this.class + " " + this.name + (this.version > 0 ? " " + this.version : "");
    }
}
