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
                bg = "bg-emerald-100 dark:bg-emerald-900";
            }
            if (matchup === 2) {
                bg = "bg-rose-300 dark:bg-rose-600";
            }
            if (matchup === 4) {
                bg = "bg-rose-400 dark:bg-rose-500";
            }
        }

        if (matchup === 0.5) {
            content = "½";
            bg = "bg-emerald-200 dark:bg-emerald-800";
        }
        if (matchup === 0.25) {
            content = "¼";
            bg = "bg-emerald-100 dark:bg-emerald-900";
        }
    }
    return <td className={"border border-gray-400 px-4 py-2 text-center " + bg}>{content}</td>;
}
