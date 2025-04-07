export const pokemonTypes = [
    "Normal",
    "Fire",
    "Water",
    "Grass",
    "Electric",
    "Ice",
    "Fighting",
    "Poison",
    "Ground",
    "Flying",
    "Psychic",
    "Bug",
    "Rock",
    "Ghost",
    "Dragon",
    "Dark",
    "Steel",
    "Fairy",
    "Mutant",
] as const;

export type PokemonType = (typeof pokemonTypes)[number];

export const pokemonTribes = [
    "Animated",
    "Artillery",
    "Assassin",
    "Bushwhacker",
    "Caretaker",
    "Charmer",
    "Deceiver",
    "Fortune",
    "Harmonic",
    "Industrious",
    "Loyal",
    "Mystic",
    "Noble",
    "Radiant",
    "Scavenger",
    "Scourge",
    "Scrapper",
    "Serene",
    "Stampede",
    "Tactician",
    "Tyrannical",
    "Warrior",
] as const;

export type PokemonTribe = (typeof pokemonTribes)[number];

export const moveCategories = ["Physical", "Special", "Status", "Adaptive"] as const;

export type MoveCategory = (typeof moveCategories)[number];

export interface StylePoints {
    hp: number;
    attacks: number;
    defense: number;
    spdef: number;
    speed: number;
}

export const defaultStylePoints: StylePoints = {
    hp: 10,
    attacks: 10,
    defense: 10,
    spdef: 10,
    speed: 10,
};
