import { PokemonType } from "@/app/data/basicData";
import { getTypeBadgeColourClass } from "./colours";

export default function TypeBadge({ type1, type2 }: { type1: PokemonType; type2: PokemonType | undefined }) {
    return (
        <div className="flex space-x-2">
            <span
                className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${getTypeBadgeColourClass(type1)}`}
            >
                {type1}
            </span>
            {type2 && (
                <span
                    className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${getTypeBadgeColourClass(
                        type2
                    )}`}
                >
                    {type2}
                </span>
            )}
        </div>
    );
}
