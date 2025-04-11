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
    const bgs = [
        "bg-green-600",
        "bg-green-800",
        "bg-yellow-500",
        "bg-orange-500",
        "bg-orange-700",
        "bg-red-900",
        "bg-red-700",
    ];
    if (total === "se") {
        bgs.reverse();
    }
    return <td className={"border border-gray-400 px-4 py-2 text-center " + bgs[num]}>{num}</td>;
}
