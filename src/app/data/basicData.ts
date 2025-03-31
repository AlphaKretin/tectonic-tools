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

export type MoveCategory = "Physical" | "Special" | "Status" | "Adaptive";

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
