import { PokemonType } from "@/app/data/basicData";
import { CardData } from "../page";

export default function AtkTableCell({ type, card }: { type: PokemonType; card: CardData }) {
    const realMoves = card.moves.filter((m) => m.isAttackingMove());
    let content = "";
    let bg = "";

    if (realMoves.length > 0) {
        const moveMatchups = realMoves.map((m) => m.matchups()[type]);
        const matchup = Math.max(...moveMatchups);

        if (matchup > 1 || matchup === 0) {
            content = "×" + matchup;
            if (matchup === 0) {
                bg = "bg-rose-400 dark:bg-rose-500";
            }
            if (matchup === 2) {
                bg = "bg-emerald-200 dark:bg-emerald-800";
            }
        }

        if (matchup === 0.5) {
            content = "½";
            bg = "bg-rose-300 dark:bg-rose-600";
        }
    }

    return <td className={"border border-gray-400 px-4 py-2 text-center " + bg}>{content}</td>;
}
