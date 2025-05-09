import { Pokemon } from "@/app/data/tectonic/Pokemon";

export default function EStatRow({ name, pokemon, form }: { name: "PEHP" | "SEHP"; pokemon: Pokemon; form: number }) {
    const ehpValue = name === "PEHP" ? pokemon.getPEHP(form) : pokemon.getSEHP(form);

    return (
        <tr key={name} className="italic">
            <td className="text-right">{name}</td>
            <td className="px-3">{ehpValue}</td>
            <td></td>
        </tr>
    );
}
