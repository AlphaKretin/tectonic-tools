import { PokemonType } from "../app/data/basicData";
import { Pokemon } from "../app/data/types/Pokemon";

export function getTypeBadgeColourClass(type: PokemonType) {
    switch (type) {
        case "Fire":
            return "bg-fire";
        case "Water":
            return "bg-water";
        case "Grass":
            return "bg-grass";
        case "Electric":
            return "bg-electric";
        case "Psychic":
            return "bg-psychic";
        case "Ice":
            return "bg-ice";
        case "Dragon":
            return "bg-dragon";
        case "Dark":
            return "bg-dark";
        case "Fairy":
            return "bg-fairy";
        case "Fighting":
            return "bg-fighting";
        case "Flying":
            return "bg-flying";
        case "Poison":
            return "bg-poison";
        case "Ground":
            return "bg-ground";
        case "Rock":
            return "bg-rock";
        case "Bug":
            return "bg-bug";
        case "Ghost":
            return "bg-ghost";
        case "Steel":
            return "bg-steel";
        case "Normal":
            return "bg-normal";
        case "Mutant":
            return "bg-mutant";
        default:
            return "bg-gray-500";
    }
}

export function getTypeGradient(pokemon: Pokemon): string {
    if (pokemon.type2) {
        const type1 = getTypeGradientFromColourClass(pokemon.type1);
        const type2 = getTypeGradientToColourClass(pokemon.type2);
        return `bg-linear-to-r ${type1} ${type2}`;
    }
    return getTypeGradientSolidColourClass(pokemon.type1);
}

// ok so this is *better* than i thought it was last commit
// but it's still annoying having to type them all out explicitly
// i've defined the colours in my theme you should safelist all the appropriate variants smh
function getTypeGradientFromColourClass(type: PokemonType): string {
    switch (type) {
        case "Fire":
            return "from-fire-bg";
        case "Water":
            return "from-water-bg";
        case "Grass":
            return "from-grass-bg";
        case "Electric":
            return "from-electric-bg";
        case "Psychic":
            return "from-psychic-bg";
        case "Ice":
            return "from-ice-bg";
        case "Dragon":
            return "from-dragon-bg";
        case "Dark":
            return "from-dark-bg";
        case "Fairy":
            return "from-fairy-bg";
        case "Fighting":
            return "from-fighting-bg";
        case "Flying":
            return "from-flying-bg";
        case "Poison":
            return "from-poison-bg";
        case "Ground":
            return "from-ground-bg";
        case "Rock":
            return "from-rock-bg";
        case "Bug":
            return "from-bug-bg";
        case "Ghost":
            return "from-ghost-bg";
        case "Steel":
            return "from-steel-bg";
        case "Normal":
            return "from-normal-bg";
        case "Mutant":
            return "from-mutant-bg";
        default:
            return "from-gray-500";
    }
}

function getTypeGradientToColourClass(type: PokemonType): string {
    switch (type) {
        case "Fire":
            return "to-fire-bg";
        case "Water":
            return "to-water-bg";
        case "Grass":
            return "to-grass-bg";
        case "Electric":
            return "to-electric-bg";
        case "Psychic":
            return "to-psychic-bg";
        case "Ice":
            return "to-ice-bg";
        case "Dragon":
            return "to-dragon-bg";
        case "Dark":
            return "to-dark-bg";
        case "Fairy":
            return "to-fairy-bg";
        case "Fighting":
            return "to-fighting-bg";
        case "Flying":
            return "to-flying-bg";
        case "Poison":
            return "to-poison-bg";
        case "Ground":
            return "to-ground-bg";
        case "Rock":
            return "to-rock-bg";
        case "Bug":
            return "to-bug-bg";
        case "Ghost":
            return "to-ghost-bg";
        case "Steel":
            return "to-steel-bg";
        case "Normal":
            return "to-normal-bg";
        case "Mutant":
            return "to-mutant-bg";
        default:
            return "to-gray-500-bg";
    }
}

function getTypeGradientSolidColourClass(type: PokemonType): string {
    switch (type) {
        case "Fire":
            return "bg-fire-bg";
        case "Water":
            return "bg-water-bg";
        case "Grass":
            return "bg-grass-bg";
        case "Electric":
            return "bg-electric-bg";
        case "Psychic":
            return "bg-psychic-bg";
        case "Ice":
            return "bg-ice-bg";
        case "Dragon":
            return "bg-dragon-bg";
        case "Dark":
            return "bg-dark-bg";
        case "Fairy":
            return "bg-fairy-bg";
        case "Fighting":
            return "bg-fighting-bg";
        case "Flying":
            return "bg-flying-bg";
        case "Poison":
            return "bg-poison-bg";
        case "Ground":
            return "bg-ground-bg";
        case "Rock":
            return "bg-rock-bg";
        case "Bug":
            return "bg-bug-bg";
        case "Ghost":
            return "bg-ghost-bg";
        case "Steel":
            return "bg-steel-bg";
        case "Normal":
            return "bg-normal-bg";
        case "Mutant":
            return "bg-mutant-bg";
        default:
            return "bg-gray-500";
    }
}
