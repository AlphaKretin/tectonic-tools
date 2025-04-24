import { PokemonType } from "@/app/data/types/PokemonType";
import { getTypeColorClass } from "./colours";

interface TypeBadgeHeaderProps {
    type: PokemonType;
    useShort: boolean;
}

export default function TypeBadgeHeader({ type, useShort }: TypeBadgeHeaderProps) {
    return (
        <th className={`py-2 text-white text-xs font-semibold invertIgnore ${getTypeColorClass(type, true)}`}>
            {useShort ? type.getShortName() : type.name}
        </th>
    );
}
