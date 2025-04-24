import { KVPair, LoadedData } from "./loadData";

interface LoadedTrainerPokemon {
    id: string;
    level: number;
    name?: string;
    gender?: string;
    moves: string[];
    abilityIndex?: number;
    items: string[];
    itemType?: string;
    sp: number[];
}

export interface LoadedTrainer extends LoadedData {
    class: string;
    name: string;
    version?: number;
    nameForHashing?: string;
    typeLabel?: string;
    extendsVersion?: number;
    policies: string[];
    flags: string[];
    pokemon: LoadedTrainerPokemon[];
}

const defaultTrainerPokemon: LoadedTrainerPokemon = {
    id: "",
    level: 0,
    moves: [],
    items: [],
    sp: [],
};

export function parseTrainers(pairs: KVPair[]): LoadedTrainer {
    let currentPokemon: LoadedTrainerPokemon = { ...defaultTrainerPokemon };
    const obj: LoadedTrainer = {
        key: "",
        class: "",
        name: "",
        policies: [],
        flags: [],
        pokemon: [],
    };
    pairs.forEach((pair) => {
        switch (pair.key) {
            case "Bracketvalue":
                const bracketTerms = pair.value.split(",");
                obj.key = pair.value;
                obj.class = bracketTerms[0];
                obj.name = bracketTerms[1];
                if (bracketTerms.length > 2) {
                    obj.version = parseInt(bracketTerms[2]);
                }
                break;
            case "NameForHashing":
                obj.nameForHashing = pair.value;
                break;
            case "TrainerTypeLabel":
                obj.typeLabel = pair.value;
                break;
            case "ExtendsVersion":
                obj.extendsVersion = parseInt(pair.value);
                break;
            case "Policies":
                obj.policies = pair.value.split(",");
                break;
            case "Flags":
                obj.flags = pair.value.split(",");
                break;
            case "Pokemon":
                if (currentPokemon.id !== "") {
                    obj.pokemon.push({ ...currentPokemon });
                    currentPokemon = { ...defaultTrainerPokemon };
                }
                const monTerms = pair.value.split(",");
                currentPokemon.id = monTerms[0];
                currentPokemon.level = parseInt(monTerms[1]);
                break;
            case "Name":
                currentPokemon.name = pair.value;
                break;
            case "Gender":
                currentPokemon.gender = pair.value;
                break;
            case "Moves":
                currentPokemon.moves = pair.value.split(",");
                break;
            case "AbilityIndex":
                currentPokemon.abilityIndex = parseInt(pair.value);
                break;
            case "Item":
                currentPokemon.items = pair.value.split(",");
                break;
            case "ItemType":
                currentPokemon.itemType = pair.value;
                break;
            case "EV":
                currentPokemon.sp = pair.value.split(",").map((v) => parseInt(v));
                break;
        }
    });

    // add last pokemon to array
    if (currentPokemon.id !== "") {
        obj.pokemon.push({ ...currentPokemon });
    }

    return obj;
}

// propagate trainer data
export function propagateTrainerData(trainers: Record<string, LoadedTrainer>) {
    for (const trainerId in trainers) {
        if (trainers[trainerId].extendsVersion !== undefined) {
            const key =
                trainers[trainerId].class +
                "," +
                trainers[trainerId].name +
                (trainers[trainerId].extendsVersion ? "," + trainers[trainerId].extendsVersion : "");
            const extendedTrainer = trainers[key];
            if (!extendedTrainer) {
                throw new Error("Undefined extended trainer " + key + "!");
            }
            trainers[trainerId].flags = extendedTrainer.flags.concat(trainers[trainerId].flags);
            const updatedPokemon = [...extendedTrainer.pokemon];
            for (const pokemon of trainers[trainerId].pokemon) {
                const extendedPokemonIndex = extendedTrainer.pokemon.findIndex((p) => p.id === pokemon.id);
                if (extendedPokemonIndex === -1) {
                    updatedPokemon.push(pokemon);
                } else {
                    const newPokemon = { ...extendedTrainer.pokemon[extendedPokemonIndex] };
                    newPokemon.abilityIndex = pokemon.abilityIndex;
                    if (pokemon.itemType) {
                        newPokemon.itemType = pokemon.itemType;
                    }
                    if (pokemon.items.length > 0) {
                        newPokemon.items = pokemon.items;
                    }
                    if (pokemon.moves.length > 0) {
                        newPokemon.moves = pokemon.moves;
                    }
                    if (pokemon.sp.length > 0) {
                        newPokemon.sp = pokemon.sp;
                    }
                    updatedPokemon[extendedPokemonIndex] = newPokemon;
                }
            }
            trainers[trainerId].pokemon = updatedPokemon;
        }
    }
    return trainers;
}
