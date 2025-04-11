import { PokemonType } from "@/app/data/basicData";
import { CardData } from "../page";

function compare(num: number, total: "nve" | "se") {
    if (total === "se") {
        return num > 1;
    }
    return num < 1;
}

export default function AtkTotalCell({
    cards,
    type,
    total,
}: {
    cards: CardData[];
    type: PokemonType;
    total: "nve" | "se";
}): React.ReactNode {
    const num = cards.filter((c) => {
        const realMoves = c.moves.filter((m) => m.isAttackingMove());
        return realMoves.length > 0 && compare(Math.max(...realMoves.map((m) => m.matchups()[type])), total);
    }).length;
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
    if (total === "se") {
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
