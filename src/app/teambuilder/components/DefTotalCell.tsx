import { calcTypeMatchup } from "@/app/data/typeChart";
import { PartyPokemon } from "@/app/data/types/PartyPokemon";
import { PokemonType } from "@/app/data/types/PokemonType";
import { isNull } from "@/app/data/util";

function compare(num: number, total: "weak" | "strong") {
    if (total === "weak") {
        return num > 1;
    }
    return num < 1;
}

export default function DefTotalCell({
    cards,
    type,
    total,
}: {
    cards: PartyPokemon[];
    type: PokemonType;
    total: "weak" | "strong";
}): React.ReactNode {
    const num = cards.filter(
        (c) =>
            !isNull(c.species) &&
            compare(
                calcTypeMatchup({ type }, { type1: c.types.type1, type2: c.types.type2, ability: c.ability }),
                total
            )
    ).length;

    // Updated color scheme with better readability and subtle transitions
    const bgs = [
        "bg-emerald-100 dark:bg-emerald-900", // 0 - Very good
        "bg-emerald-200 dark:bg-emerald-800", // 1
        "bg-teal-100 dark:bg-teal-800", // 2
        "bg-amber-100 dark:bg-amber-800", // 3 - Neutral
        "bg-orange-200 dark:bg-orange-700", // 4
        "bg-rose-300 dark:bg-rose-600", // 5
        "bg-rose-400 dark:bg-rose-500", // 6 - Very bad
    ];

    if (total === "strong") {
        bgs.reverse();
    }

    return (
        <td
            className={`px-4 py-3 text-center text-sm font-medium 
            ${bgs[num]} 
            text-gray-900 dark:text-gray-100
            transition-colors duration-200`}
        >
            {num}
        </td>
    );
}
