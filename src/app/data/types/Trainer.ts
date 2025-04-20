import { items, nullItem } from "../items";
import { LoadedTrainer } from "../loading/trainers";
import { moves, nullMove } from "../moves";
import { pokemon } from "../pokemon";
import { trainerTypes } from "../trainerTypes";
import { nullType, types } from "../types";
import { Ability } from "./Ability";
import { Item } from "./Item";
import { Move } from "./Move";
import { defaultStylePoints, Pokemon, StylePoints } from "./Pokemon";
import { PokemonType } from "./PokemonType";

export interface TrainerPokemon {
    pokemon: Pokemon;
    sp: StylePoints;
    level: number;
    nickname?: string;
    moves: Move[];
    ability: Ability;
    items: Item[];
    itemTypes: PokemonType[];
}

export class Trainer {
    id: string;
    class: string;
    name: string;
    hashName?: string; // for masked villains
    version: number;
    extends?: number;
    pokemon: TrainerPokemon[];
    constructor(loadedTrainer: LoadedTrainer) {
        const trainerMons: TrainerPokemon[] = loadedTrainer.pokemon.map((mon) => {
            const abilityIndex = mon.abilityIndex || 0;
            return {
                ...mon,
                pokemon: pokemon[mon.id],
                nickname: mon.name,
                sp:
                    mon.sp.length === 0
                        ? defaultStylePoints
                        : { hp: mon.sp[0], attacks: mon.sp[1], defense: mon.sp[2], speed: mon.sp[3], spdef: mon.sp[5] },
                ability: pokemon[mon.id].abilities[abilityIndex],
                // TODO: autopopulate default moveset for level if moves undefined
                // for some reason a mapping approach consistently returned blanks instead of nulls
                moves: [
                    moves[mon.moves[0]] || nullMove,
                    moves[mon.moves[1]] || nullMove,
                    moves[mon.moves[2]] || nullMove,
                    moves[mon.moves[3]] || nullMove,
                ],
                items: [items[mon.items[0]] || nullItem, items[mon.items[1]] || nullItem],
                itemTypes: [types[mon.itemTypes[0]] || nullType, types[mon.itemTypes[1]] || nullType],
            };
        });
        this.id = loadedTrainer.key;
        this.class = loadedTrainer.class;
        this.name = loadedTrainer.name;
        this.hashName = loadedTrainer.nameForHashing;
        this.version = loadedTrainer.version || 0;
        this.extends = loadedTrainer.extendsVersion;
        this.pokemon = trainerMons;
    }

    public key(): string {
        return this.class + this.name + this.version;
    }

    public displayName(): string {
        return (
            // this fallback shouldn't be necessary once trainers.txt and trainertypes.txt are in sync
            // but it doesn't hurt, and makes staggered development easier
            (trainerTypes[this.class]?.name || this.class) +
            " " +
            this.name +
            (this.class.includes("MASKEDVILLAIN") && this.hashName ? " (" + this.hashName + ")" : "") +
            (this.extends !== undefined ? " (Cursed)" : "")
        );
    }
}
