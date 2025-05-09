import { Ability } from "@/app/data/tectonic/Ability";
import { ReactNode } from "react";

export default function AbilityCapsule({ ability }: { ability: Ability }): ReactNode {
    return (
        <span
            className={`rounded-full w-fit h-fit px-2 py-1 text-white text-shadow-xs/100 text-s font-semibold cursor-default bg-emerald-600 ${
                ability.isSignature ? "text-yellow-300" : "text-gray-800 dark:text-gray-100"
            }`}
            title={ability.description}
        >
            {ability.name}
        </span>
    );
}
