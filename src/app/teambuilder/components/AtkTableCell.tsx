import { PokemonType } from "@/app/data/basicData";
import { CardData, isAttackingMove } from "../page";

export default function AtkTableCell({ type, card }: { type: PokemonType; card: CardData }) {
    const realMoves = card.moves.filter((m) => isAttackingMove(m));
    let content = "";
    let bg = "";

    if (realMoves.length > 0) {
        const moveMatchups = realMoves.map((m) => m.matchups()[type]);
        const matchup = Math.max(...moveMatchups);

        if (matchup > 1 || matchup === 0) {
            content = "×" + matchup;
            if (matchup === 0) {
                bg = "bg-red-700";
            }
            if (matchup === 2) {
                bg = "bg-green-600";
            }
        }

        if (matchup === 0.5) {
            content = "½";
            bg = "bg-red-900";
        }
    }

    return <td className={"border border-gray-400 px-4 py-2 text-center " + bg}>{content}</td>;
}
