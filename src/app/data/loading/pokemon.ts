import { NTreeNode } from "../types/NTreeNode";
import { uniq } from "../util";
import { KVPair, LoadedData } from "./loadData";

export class LoadedEvolution {
    pokemon: string;
    method: string;
    condition: string;

    constructor(pokemon: string, method: string, condition: string) {
        this.pokemon = pokemon;
        this.method = method;
        this.condition = condition;
    }
}

// unfortunately this is currently hardcoded in Tectonic
function formSpecificMoves(species: string) {
    if (species === "ROTOM") {
        return [
            undefined,
            "OVERHEAT", // Heat, Microwave
            "HYDROPUMP", // Wash, Washing Machine
            "BLIZZARD", // Frost, Refrigerator
            "AIRSLASH", // Fan
            "LEAFSTORM", // Mow, Lawnmower
        ];
    }
    if (species === "URSHIFU") {
        return ["WICKEDBLOW", "SURGINGSTRIKES"];
    }
    if (species === "NECROZMA") {
        return [undefined, "SUNSTEELSTRIKE", "MOONGEISTBEAM"];
    }
    return [];
}

export interface LoadedPokemon extends LoadedData {
    name: string;
    dexNum: number;
    formName?: string;
    type1: string;
    type2?: string;
    height: number;
    weight: number;
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spAttack: number;
    spDefense: number;
    bst: number;
    abilities: string[];
    levelMoves: [number, string][];
    lineMoves: string[];
    tutorMoves: string[];
    formSpecificMoves: Array<string | undefined>;
    tribes: string[];
    evolutions: LoadedEvolution[];
    kind: string;
    pokedex: string;
    wildItems: string[];
    firstEvolution: string; // Post processing
    evolutionTree?: NTreeNode<LoadedEvolution>; // Post processing
}

export function parsePokemonLegacy(pairs: KVPair[]): LoadedPokemon {
    const obj: LoadedPokemon = {
        key: "",
        name: "",
        dexNum: 0,
        type1: "",
        height: 0,
        weight: 0,
        hp: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        spAttack: 0,
        spDefense: 0,
        bst: 0,
        abilities: [],
        levelMoves: [], // Key of move name and value of level
        lineMoves: [], // Note that only the first evo has this in PBS
        tutorMoves: [], // Not every mon has these
        formSpecificMoves: [],
        tribes: [],
        evolutions: [],
        wildItems: [],
        kind: "",
        pokedex: "",
        firstEvolution: "",
    };
    pairs.forEach((pair) => {
        switch (pair.key) {
            case "Bracketvalue":
                obj.dexNum = parseInt(pair.value);
                break;
            case "Name":
                obj.name = pair.value;
                break;
            case "FormName":
                obj.formName = pair.value;
                break;
            case "InternalName":
                obj.key = pair.value;
                obj.formSpecificMoves = formSpecificMoves(pair.value);
                break;
            case "Type1":
                obj.type1 = pair.value;
                break;
            case "Type2":
                obj.type2 = pair.value;
                break;
            case "Height":
                obj.height = parseFloat(pair.value);
                break;
            case "Weight":
                obj.weight = parseFloat(pair.value);
                break;
            case "BaseStats":
                const stats = pair.value.split(",");
                obj.hp = parseInt(stats[0]);
                obj.attack = parseInt(stats[1]);
                obj.defense = parseInt(stats[2]);
                obj.speed = parseInt(stats[3]);
                obj.spAttack = parseInt(stats[4]);
                obj.spDefense = parseInt(stats[5]);
                obj.bst = obj.hp + obj.attack + obj.defense + obj.speed + obj.spAttack + obj.spDefense;
                break;
            case "Abilities":
                obj.abilities = pair.value.split(",");
                break;
            case "Moves":
                const moveSplit = pair.value.split(",");
                for (let i = 0; i < moveSplit.length; i += 2) {
                    obj.levelMoves.push([parseInt(moveSplit[i]), moveSplit[i + 1]]);
                }
                break;
            case "LineMoves":
                obj.lineMoves = pair.value.split(",");
                break;
            case "TutorMoves":
                obj.tutorMoves = pair.value.split(",");
                break;
            case "Tribes":
                obj.tribes = pair.value.split(",");
                break;
            case "WildItemCommon":
                obj.wildItems.push(pair.value);
                break;
            case "WildItemUncommon":
                obj.wildItems.push(pair.value);
                break;
            case "WildItemRare":
                obj.wildItems.push(pair.value);
                break;
            case "Kind":
                obj.kind = pair.value;
                break;
            case "Pokedex":
                obj.pokedex = pair.value;
                break;
            case "Evolutions":
                const evoSplit = pair.value.split(",");
                const evolutions: LoadedEvolution[] = [];
                for (let i = 0; i < evoSplit.length; i += 3) {
                    evolutions.push(new LoadedEvolution(evoSplit[i], evoSplit[i + 1], evoSplit[i + 2]));
                }
                obj.evolutions = evolutions;
                break;
        }
    });

    return obj;
}

export function parsePokemon(pairs: KVPair[]): LoadedPokemon {
    const obj: LoadedPokemon = {
        key: "",
        name: "",
        dexNum: 0,
        type1: "",
        height: 0,
        weight: 0,
        hp: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        spAttack: 0,
        spDefense: 0,
        bst: 0,
        abilities: [],
        levelMoves: [], // Array of level, move pairs
        lineMoves: [], // Note that only the first evo has this in PBS
        tutorMoves: [], // Not every mon has these
        formSpecificMoves: [],
        tribes: [],
        evolutions: [],
        wildItems: [],
        kind: "",
        pokedex: "",
        firstEvolution: "",
    };
    pairs.forEach((pair) => {
        switch (pair.key) {
            case "Bracketvalue":
                obj.key = pair.value;
                obj.formSpecificMoves = formSpecificMoves(pair.value);
                break;
            case "Name":
                obj.name = pair.value;
                break;
            case "FormName":
                obj.formName = pair.value;
                break;
            case "Type1":
                obj.type1 = pair.value;
                break;
            case "Type2":
                obj.type2 = pair.value;
                break;
            case "Height":
                obj.height = parseFloat(pair.value);
                break;
            case "Weight":
                obj.weight = parseFloat(pair.value);
                break;
            case "BaseStats":
                const stats = pair.value.split(",");
                obj.hp = parseInt(stats[0]);
                obj.attack = parseInt(stats[1]);
                obj.defense = parseInt(stats[2]);
                obj.speed = parseInt(stats[3]);
                obj.spAttack = parseInt(stats[4]);
                obj.spDefense = parseInt(stats[5]);
                obj.bst = obj.hp + obj.attack + obj.defense + obj.speed + obj.spAttack + obj.spDefense;
                break;
            case "Abilities":
                obj.abilities = pair.value.split(",");
                break;
            case "Moves":
                const moveSplit = pair.value.split(",");
                for (let i = 0; i < moveSplit.length; i += 2) {
                    obj.levelMoves.push([parseInt(moveSplit[i]), moveSplit[i + 1]]);
                }
                break;
            case "LineMoves":
                obj.lineMoves = pair.value.split(",");
                break;
            case "TutorMoves":
                obj.tutorMoves = pair.value.split(",");
                break;
            case "Tribes":
                obj.tribes = pair.value.split(",");
                break;
            case "WildItemCommon":
                obj.wildItems.push(pair.value);
                break;
            case "WildItemUncommon":
                obj.wildItems.push(pair.value);
                break;
            case "WildItemRare":
                obj.wildItems.push(pair.value);
                break;
            case "Kind":
                obj.kind = pair.value;
                break;
            case "Pokedex":
                obj.pokedex = pair.value;
                break;
            case "Evolutions":
                const evoSplit = pair.value.split(",");
                const evolutions: LoadedEvolution[] = [];
                for (let i = 0; i < evoSplit.length; i += 3) {
                    evolutions.push(new LoadedEvolution(evoSplit[i], evoSplit[i + 1], evoSplit[i + 2]));
                }
                obj.evolutions = evolutions;
                break;
        }
    });

    return obj;
}

// Propagates tribe data, first evolutions, and line moves throughout evolution lines
export function propagatePokemonData(
    pokemon: Record<string, LoadedPokemon>,
    oldVersion: boolean = false
): Record<string, LoadedPokemon> {
    function addFirstEvo(mon: LoadedPokemon | null, first: string) {
        if (mon == null) {
            return;
        }

        mon.firstEvolution = first;
        mon.evolutions.forEach((evo) => addFirstEvo(pokemon[evo.pokemon], first));
    }

    function getEvoPath(cur: LoadedPokemon, find: LoadedPokemon): LoadedPokemon[] {
        if (cur.key == find.key) {
            return [cur];
        }

        for (const evo of cur.evolutions) {
            const result = getEvoPath(pokemon[evo.pokemon], find);
            if (result.length > 0) {
                return [cur].concat(result);
            }
        }

        return [];
    }

    // manually add dex numbers since they're not stored in new-format pokemon.txt
    // for the old format, they should line up anyway (or if not, the clobbered version makes more sense)
    let dexNum = 1;
    for (const id in pokemon) {
        pokemon[id].dexNum = dexNum;
        dexNum++;
        if (pokemon[id].firstEvolution.length === 0) {
            addFirstEvo(pokemon[id], pokemon[id].key);
        }
    }

    for (const id in pokemon) {
        if (pokemon[id].tribes.length === 0) {
            const evoPath = getEvoPath(pokemon[pokemon[id].firstEvolution], pokemon[id]);
            pokemon[id].tribes = evoPath.reverse().find((evo) => evo.tribes.length > 0)?.tribes ?? [];
        }
        if (oldVersion && pokemon[id].lineMoves.length === 0) {
            const evoPath = getEvoPath(pokemon[pokemon[id].firstEvolution], pokemon[id]);
            pokemon[id].lineMoves = evoPath.reverse().find((evo) => evo.lineMoves.length > 0)?.lineMoves ?? [];
        }
        // propagate line moves additively on new version - this system replaces the tutormoves list
        if (!oldVersion) {
            const evoPath = getEvoPath(pokemon[pokemon[id].firstEvolution], pokemon[id]);
            const evoIndex = evoPath.findIndex((p) => p.key === id);
            const prevEvo = evoPath[evoIndex - 1];
            if (prevEvo) {
                pokemon[id].lineMoves = prevEvo.lineMoves.concat(pokemon[id].lineMoves);
            }
        }
        // level moves should not be propagated if first evo or using old pokemon.txt format
        if (!oldVersion && pokemon[id].firstEvolution !== id) {
            const evoPath = getEvoPath(pokemon[pokemon[id].firstEvolution], pokemon[id]);
            const prevEvoLevelMoves = evoPath.reverse().find((evo) => evo.key !== id)?.levelMoves;
            if (prevEvoLevelMoves) {
                pokemon[id].levelMoves = uniq(pokemon[id].levelMoves.concat(prevEvoLevelMoves)).sort(
                    ([la], [lb]) => la - lb
                );
            }
        }
    }

    return pokemon;
}
