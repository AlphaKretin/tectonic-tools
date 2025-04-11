import { PokemonType } from "@/app/data/basicData";
import { Pokemon } from "@/app/data/types/Pokemon";
import { isNull } from "@/app/data/util";

export default function DefTableCell({ type, pokemon }: { type: PokemonType; pokemon: Pokemon }) {
    const matchup = pokemon.defMatchups()[type];
    let content = "";
    let bg = "";
    if (!isNull(pokemon)) {
        if (matchup > 1 || matchup === 0) {
            content = "×" + matchup;
            if (matchup === 0) {
                bg = "bg-green-600";
            }
            if (matchup === 2) {
                bg = "bg-red-900";
            }
            if (matchup === 4) {
                bg = "bg-red-700";
            }
        }

        if (matchup === 0.5) {
            content = "½";
            bg = "bg-green-800";
        }
        if (matchup === 0.25) {
            content = "¼";
            bg = "bg-green-600";
        }
    }
    return <td className={"border border-gray-400 px-4 py-2 text-center " + bg}>{content}</td>;
}
