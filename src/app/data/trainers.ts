import loadedTrainers from "public/data/trainers.json";
import { Trainer } from "./types/Trainer";

export const trainers: Record<string, Trainer> = Object.fromEntries(
    Object.entries(loadedTrainers).map(([key, trainer]) => {
        return [key, new Trainer(trainer)];
    })
);

export const nullTrainer = new Trainer({
    key: "",
    class: "",
    name: "",
    policies: [],
    flags: [],
    version: 0,
    pokemon: [],
});
