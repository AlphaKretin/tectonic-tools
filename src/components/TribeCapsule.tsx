import { Tribe } from "@/app/data/tectonic/Tribe";
import { ReactNode } from "react";

export default function TribeCapsule({ tribe, count }: { tribe: Tribe; count?: number }): ReactNode {
    return (
        <span
            className={`rounded-full w-fit h-fit ${
                count == null ? "px-2" : "pl-2"
            } py-1 text-white text-shadow-xs/100 font-semibold cursor-default bg-amber-700 border border-white`}
            title={tribe.description}
        >
            {tribe.name}
            {count != null && (
                <span className="rounded-full px-2.5 py-1 ml-1 text-white bg-black/65 border">{count}</span>
            )}
        </span>
    );
}
