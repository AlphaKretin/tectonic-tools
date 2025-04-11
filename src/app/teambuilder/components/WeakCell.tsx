import { PokemonType } from "@/app/data/basicData";
import { isNull } from "@/app/data/util";
import { CardData } from "../page";

function compare(num: number, total: "weak" | "strong") {
    if (total === "weak") {
        return num > 1;
    }
    return num < 1;
}

export default function TotalCell({
    cards,
    type,
    total,
}: {
    cards: CardData[];
    type: PokemonType;
    total: "weak" | "strong";
}): React.ReactNode {
    const num = cards.filter((c) => !isNull(c.pokemon) && compare(c.pokemon.defMatchups()[type], total)).length;
    const bgs = [
        "bg-green-600",
        "bg-green-800",
        "bg-yellow-500",
        "bg-orange-500",
        "bg-orange-700",
        "bg-red-900",
        "bg-red-700",
    ];
    if (total === "strong") {
        bgs.reverse();
    }
    return <td className={"border border-gray-400 px-4 py-2 text-center " + bgs[num]}>{num}</td>;
}
