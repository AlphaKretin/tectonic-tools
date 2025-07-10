import { Ability } from "@/app/data/tectonic/Ability";
import { ReactNode } from "react";

export default function AbilityCapsule({ ability }: { ability: Ability }): ReactNode {
    return (
        <span
            className={`rounded-full w-fit h-fit px-2 py-1 text-white text-shadow-xs/100 font-semibold cursor-default bg-emerald-600 border border-white ${
                ability.isSignature ? "text-yellow-300" : ""
            }`}
            title={ability.description}
        >
            {ability.name}
        </span>
    );
}
