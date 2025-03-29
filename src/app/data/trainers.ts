import loadedTrainers from "public/data/trainers.json";
import { Trainer } from "./types/Trainer";

export const trainers: Record<string, Trainer> = Object.fromEntries(
    loadedTrainers.map((trainer) => {
        const newTrainer = new Trainer(trainer);
        return [newTrainer.key(), newTrainer];
    })
);

export const nullTrainer = new Trainer({
    class: "",
    name: "",
    hashName: null,
    extends: null,
    version: 0,
    pokemon: [],
});
