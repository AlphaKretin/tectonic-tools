import loadedTrainers from "public/data/trainers.json";
import { pokemon } from "./pokemon";
import { StylePoints } from "./types/BasicData";
import { Trainer } from "./types/Trainer";

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

function loadTrainer(trainer: LoadedTrainer): Trainer {
    const trainerMons = trainer.pokemon.map((mon) => {
        return { ...mon, pokemon: pokemon[mon.id] };
    });
    return { ...trainer, pokemon: trainerMons, hashName: trainer.hashName || undefined };
}

export const trainers: Record<string, Trainer> = Object.fromEntries(
    Object.entries(loadedTrainers).map(([id, trainer]) => [id, loadTrainer(trainer)])
);

export const nullTrainer: Trainer = {
    class: "",
    name: "",
    version: 0,
    pokemon: [],
};
