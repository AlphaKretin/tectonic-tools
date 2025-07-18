import { LoadedTrainer } from "@/preload/loadedDataClasses";
import { TectonicData } from "../tectonic/TectonicData";
import { isNull } from "../util";
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
    itemType: PokemonType;
}

export class Trainer {
    id: string = "";
    class: string = "";
    name: string = "";
    hashName?: string; // for masked villains
    typeLabel?: string; // overrides class name
    version: number = 0;
    extends?: number;
    flags: string[] = [];
    pokemon: TrainerPokemon[] = [];

    static NULL: Trainer = null!;

    constructor(loaded?: LoadedTrainer) {
        if (!loaded) return;

        this.id = loaded.key;
        this.class = loaded.class;
        this.name = loaded.name;
        this.hashName = loaded.nameForHashing;
        this.typeLabel = loaded.typeLabel;
        this.version = loaded.version || 0;
        this.extends = loaded.extendsVersion;
        this.flags = loaded.flags;
        this.pokemon = loaded.pokemon.map((mon) => {
            // for some reason a mapping approach consistently returned blanks instead of nulls
            let monMoves = [
                TectonicData.moves[mon.moves[0]] || Move.NULL,
                TectonicData.moves[mon.moves[1]] || Move.NULL,
                TectonicData.moves[mon.moves[2]] || Move.NULL,
                TectonicData.moves[mon.moves[3]] || Move.NULL,
            ];
            // if no moves defined, autofill learnset
            if (monMoves.filter((m) => !isNull(m)).length === 0) {
                const newMoves = [];
                const signatureMove = TectonicData.pokemon[mon.id].levelMoves.find(([, move]) => move.isSignature);
                if (signatureMove) {
                    newMoves.push(TectonicData.moves[signatureMove[1].id]);
                }
                // don't auto-learn moves past level 50
                const maxLevel = Math.min(mon.level, 50);
                const movesUpToLevel = TectonicData.pokemon[mon.id].levelMoves
                    .filter(
                        ([level, move]) =>
                            level <= maxLevel && // get moves learnable up to current level
                            (!signatureMove || move.id !== signatureMove[1].id) && // skip signatures to avoid duplication
                            level !== 0 // skip evolution moves to avoid duplication
                    )
                    .sort((a, b) => b[0] - a[0]);
                while (newMoves.length < 4 && movesUpToLevel.length > 0) {
                    const nextMove = movesUpToLevel.shift();
                    if (nextMove) newMoves.push(nextMove[1]);
                }
                while (newMoves.length < 4) {
                    newMoves.push(Move.NULL);
                }
                monMoves = newMoves.reverse();
            }
            const abilityIndex = mon.abilityIndex || 0;
            const finalMon: TrainerPokemon = {
                ...mon,
                pokemon: TectonicData.pokemon[mon.id],
                nickname: mon.name,
                sp:
                    mon.sp.length === 0
                        ? defaultStylePoints
                        : { hp: mon.sp[0], attacks: mon.sp[1], defense: mon.sp[2], speed: mon.sp[3], spdef: mon.sp[5] },
                ability: TectonicData.pokemon[mon.id].abilities[abilityIndex],
                moves: monMoves,
                items: [TectonicData.items[mon.items[0]] || Item.NULL, TectonicData.items[mon.items[1]] || Item.NULL],
                itemType: PokemonType.NULL, // override the string from the unpack above
            };
            if (mon.itemType) {
                finalMon.itemType = TectonicData.types[mon.itemType] || PokemonType.NULL;
            }
            return finalMon;
        });
    }

    public key(): string {
        return this.class + "," + this.name + "," + this.version;
    }

    public extendsKey(): string | undefined {
        return this.extends !== undefined
            ? this.class + "," + this.name + (this.extends > 0 ? "," + this.extends : "")
            : undefined;
    }

    public displayName(): string {
        let name =
            // the last fallback shouldn't be necessary once trainers.txt and trainertypes.txt are in sync
            // but it doesn't hurt, and makes staggered development easier
            ((this.typeLabel && TectonicData.trainerTypes[this.typeLabel]?.name) ||
                TectonicData.trainerTypes[this.class]?.name ||
                this.class) +
            " " +
            this.name +
            (this.class.includes("MASKEDVILLAIN") && this.hashName ? " (" + this.hashName + ")" : "");
        if (this.flags.includes("HideIdentity")) {
            name = "Mysterious Trainer (" + name + ")";
        }
        if (this.version > 0) {
            const allVersions = Object.values(TectonicData.trainers).filter(
                (t) => t.class === this.class && t.name === this.name && t.extends === undefined
            );
            const baseVersion = this.extends !== undefined ? this.extends : this.version;
            if (baseVersion > 0) {
                const publicVersionNumber = allVersions.findIndex((t) => t.version === baseVersion) + 1;
                name += " (" + publicVersionNumber + ")";
            }
        }
        if (this.extends !== undefined) {
            name += " (Cursed)";
        }
        return name;
    }

    public getImageSrc(): string {
        return "/Trainers/" + this.class + ".png";
    }
}
