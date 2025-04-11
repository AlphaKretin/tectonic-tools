import { Pokemon } from "@/app/data/types/Pokemon";
import { isNull } from "@/app/data/util";
import Image from "next/image";

export default function TableHeader({ pokemon }: { pokemon: Pokemon }) {
    return (
        !isNull(pokemon) && (
            <div>
                <Image src={pokemon.getImage()} alt={pokemon.name} height="80" width="80" className="my-2" />
                <span>{pokemon.name}</span>
            </div>
        )
    );
}
