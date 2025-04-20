import { abilities, nullAbility } from "./abilities";
import { items, nullItem } from "./items";
import { moves, nullMove } from "./moves";
import { nullPokemon, pokemon } from "./pokemon";
import { nullType, types } from "./types";
import { PartyPokemon } from "./types/PartyPokemon";
import { Stat, StylePoints } from "./types/Pokemon";
import { version, VersionMap, versionMaps } from "./versions";

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 70;
export const STYLE_POINT_CAP = 50;
export const MIN_SP = 0;
export const MAX_SP = 20;
export const MIN_STEP = -12;
export const MAX_STEP = +12;

export function styleFromStat(stat: Stat): keyof StylePoints {
    if (stat === "attack" || stat === "spatk") {
        return "attacks";
    }
    return stat;
}

export interface SavedPartyPokemon {
    pokemon: keyof typeof pokemon;
    moves: Array<keyof typeof moves>;
    ability: keyof typeof abilities;
    items: Array<keyof typeof items>;
    itemTypes: Array<keyof typeof types>;
    form: number;
    level: number;
    sp: number[];
}

const encodeChunk = (data: SavedPartyPokemon): string => {
    const indices = versionMaps[version].indices;
    // data that should (nearly) always be defined
    const indexList = [indices.pokemon[data.pokemon], indices.ability[data.ability], data.form, data.level, ...data.sp];

    // push optional fields up to the point they exist
    for (const i of [0, 1, 2, 3]) {
        // if items are defined, we have to pad undefined moves
        if (i in data.moves || data.items.length > 0) {
            indexList.push(indices.move[data.moves[i]]);
        }
    }

    for (const i of [0, 1]) {
        // if itemtypes are defined, we have to pad undefined items
        if (data.items.length > i || data.itemTypes.length > 0) {
            indexList.push(indices.item[data.items[i]]);
        }
    }

    for (const i of [0, 1]) {
        if (data.itemTypes.length > i) {
            indexList.push(indices.types[data.itemTypes[i]]);
        }
    }

    const finalList = indexList.map((i) => (i === undefined ? -1 : i));

    const buffer = new ArrayBuffer(finalList.length * 2); // Each number is 16 bits (2 bytes)
    const view = new DataView(buffer);

    finalList.forEach((value, i) => {
        view.setUint16(i * 2, value); // Store each number as 16 bits
    });

    return Buffer.from(buffer).toString("base64");
};

export function encodeTeam(savedCards: SavedPartyPokemon[]) {
    const chunks = savedCards.map(encodeChunk);
    chunks.unshift(version);
    const code = chunks.join("!"); // Using ! as separator
    return code;
}

const decodeChunk = (chunk: string, version: VersionMap): SavedPartyPokemon => {
    const keys = version.keys;
    const buffer = Buffer.from(chunk, "base64");
    const view = new DataView(buffer.buffer);

    const indexList = [];
    for (let i = 0; i < buffer.byteLength; i += 2) {
        indexList.push(view.getUint16(i));
    }

    // autoincrement index instead of hardcoding to be resistant to changes
    let i = 0;

    // we used to support level and SP being optional as they were new additions
    // but the format has changed enough since then that it's no longer feasible
    const decodedData: SavedPartyPokemon = {
        pokemon: keys.pokemon[indexList[i++]],
        ability: keys.ability[indexList[i++]],
        form: indexList[i++],
        level: indexList[i++],
        sp: [indexList[i++], indexList[i++], indexList[i++], indexList[i++], indexList[i++]],
        moves: [],
        items: [],
        itemTypes: [],
    };
    // for each index left, check if data continues to exist, and include it if so
    // don't increment i first time because it already was for the last sp
    if (indexList.length > i) {
        decodedData.moves.push(keys.move[indexList[i]]);
    }
    if (indexList.length > i++) {
        decodedData.moves.push(keys.move[indexList[i]]);
    }
    if (indexList.length > i++) {
        decodedData.moves.push(keys.move[indexList[i]]);
    }
    if (indexList.length > i++) {
        decodedData.moves.push(keys.move[indexList[i]]);
    }
    if (indexList.length > i++) {
        decodedData.items.push(keys.item[indexList[i]]);
    }
    if (indexList.length > i++) {
        decodedData.items.push(keys.item[indexList[i]]);
    }
    if (indexList.length > i++) {
        decodedData.itemTypes.push(keys.types[indexList[i]]);
    }

    return decodedData;
};

export function decodeTeam(teamCode: string): PartyPokemon[] {
    const chunks = teamCode.split("!");
    const version = chunks[0];
    const dataChunks = chunks.slice(1);

    const loadedCards = dataChunks
        .map((c) => decodeChunk(c, versionMaps[version]))
        .map(
            (card) =>
                new PartyPokemon({
                    species: pokemon[card.pokemon] || nullPokemon,
                    ability: abilities[card.ability] || nullAbility,
                    items: card.items.map((i) => items[i] || nullItem),
                    itemTypes: card.itemTypes.map((t) => types[t] || nullType),
                    form: card.form,
                    moves: card.moves.map((m) => moves[m] || nullMove),
                    level: card.level,
                    stylePoints: {
                        hp: card.sp[0],
                        attacks: card.sp[1],
                        defense: card.sp[2],
                        spdef: card.sp[3],
                        speed: card.sp[4],
                    },
                })
        );
    return loadedCards;
}
