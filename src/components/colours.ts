import { PokemonType } from "@/app/data/types/PokemonType";
import { Pokemon } from "../app/data/types/Pokemon";

export function getTypeColorClass(type: PokemonType, isBadge: boolean, prefix: string = "bg"): string {
    return `${prefix}-${type.id.toLowerCase()}${isBadge ? "" : "-bg"}`;
}

export function getTypeGradient(pokemon: Pokemon): string {
    if (pokemon.type2) {
        const color1 = getTypeColorClass(pokemon.type1, false, "from");
        const color2 = getTypeColorClass(pokemon.type2, false, "to");
        return `bg-gradient-to-r ${color1} ${color2} pokemonGradient`;
    }
    return `${getTypeColorClass(pokemon.type1, false)} pokemonGradient`;
}

// tailwind class safelist: (ugh)
/*
to-fire
to-fire-bg
to-water
to-water-bg
to-steel
to-steel-bg
to-rock
to-rock-bg
to-psychic
to-psychic-bg
to-poison
to-poison-bg
to-normal
to-normal-bg
to-ice
to-ice-bg
to-ground
to-ground-bg
to-grass
to-grass-bg
to-ghost
to-ghost-bg
to-flying
to-flying-bg
to-fighting
to-fighting-bg
to-fairy
to-fairy-bg
to-electric
to-electric-bg
to-dragon
to-dragon-bg
to-dark
to-dark-bg
to-bug
to-bug-bg
to-mutant
to-mutant-bg
from-fire
from-fire-bg
from-water
from-water-bg
from-steel
from-steel-bg
from-rock
from-rock-bg
from-psychic
from-psychic-bg
from-poison
from-poison-bg
from-normal
from-normal-bg
from-ice
from-ice-bg
from-ground
from-ground-bg
from-grass
from-grass-bg
from-ghost
from-ghost-bg
from-flying
from-flying-bg
from-fighting
from-fighting-bg
from-fairy
from-fairy-bg
from-electric
from-electric-bg
from-dragon
from-dragon-bg
from-dark
from-dark-bg
from-bug
from-bug-bg
from-mutant
from-mutant-bg
bg-fire
bg-fire-bg
bg-water
bg-water-bg
bg-steel
bg-steel-bg
bg-rock
bg-rock-bg
bg-psychic
bg-psychic-bg
bg-poison
bg-poison-bg
bg-normal
bg-normal-bg
bg-ice
bg-ice-bg
bg-ground
bg-ground-bg
bg-grass
bg-grass-bg
bg-ghost
bg-ghost-bg
bg-flying
bg-flying-bg
bg-fighting
bg-fighting-bg
bg-fairy
bg-fairy-bg
bg-electric
bg-electric-bg
bg-dragon
bg-dragon-bg
bg-dark
bg-dark-bg
bg-bug
bg-bug-bg
bg-mutant
bg-mutant-bg
*/
