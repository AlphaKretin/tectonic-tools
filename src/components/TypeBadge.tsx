import { PokemonType } from "@/app/data/types/PokemonType";
import { getTypeColorClass } from "./colours";

interface TypeBadgeProps {
    type1: PokemonType;
    type2?: PokemonType;
    hyper?: boolean;
}

export default function TypeBadge({ type1, type2, hyper }: TypeBadgeProps) {
    const isHyper = !!hyper; // cast undefined to false
    return (
        <div className="flex space-x-2 invertIgnore">
            <span
                className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${getTypeColorClass(type1, true)} ${
                    isHyper ? "ring-2 ring-yellow-400 shadow-md" : ""
                }`}
            >
                {type1.name}
            </span>
            {type2 && (
                <span
                    className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${getTypeColorClass(
                        type2,
                        true
                    )}`}
                >
                    {type2.name}
                </span>
            )}
        </div>
    );
}
