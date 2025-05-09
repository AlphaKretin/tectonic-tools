import { Tribe } from "@/app/data/tectonic/Tribe";
import { ReactNode } from "react";

export default function TribeCapsule({ tribe }: { tribe: Tribe }): ReactNode {
    return (
        <span
            className="rounded-full w-fit h-fit px-2 py-1 text-white text-shadow-xs/100 text-s font-semibold cursor-default bg-amber-700"
            title={tribe.description}
        >
            {tribe.name}
        </span>
    );
}
