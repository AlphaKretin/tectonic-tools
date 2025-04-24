import { PokemonTableProps } from "@/app/pokedex/page";
import Image from "next/image";
import { getTypeGradient } from "../../../components/colours";
import TypeBadge from "../../../components/TypeBadge";
import TableCell from "./TableCell";
import TableHeader from "./TableHeader";

const PokemonTable: React.FC<PokemonTableProps> = ({ mons, onRowClick }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <TableHeader>
                            <></>
                        </TableHeader>
                        <TableHeader>#</TableHeader>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Type(s)</TableHeader>
                        <TableHeader>Abilities</TableHeader>
                        <TableHeader>Tribes</TableHeader>
                        <TableHeader>HP</TableHeader>
                        <TableHeader>Atk</TableHeader>
                        <TableHeader>Def</TableHeader>
                        <TableHeader>SpA</TableHeader>
                        <TableHeader>SpD</TableHeader>
                        <TableHeader>Spe</TableHeader>
                        <TableHeader>BST</TableHeader>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {mons.map((pokemon) => (
                        <tr
                            key={pokemon.id}
                            onClick={() => onRowClick(pokemon)}
                            className={`cursor-pointer ${getTypeGradient(pokemon)}`}
                        >
                            <TableCell>
                                <Image
                                    src={`/Pokemon/${pokemon.id}.png`}
                                    alt={pokemon.name}
                                    width={50}
                                    height={50}
                                    className="rounded-full invertIgnore"
                                />
                            </TableCell>
                            <TableCell>{pokemon.dex}</TableCell>
                            <TableCell>{pokemon.name}</TableCell>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                                <TypeBadge type1={pokemon.type1} type2={pokemon.type2} />
                            </td>
                            <TableCell>
                                {pokemon.abilities.map((a) => (
                                    <div key={a.id}>{a.name}</div>
                                ))}
                            </TableCell>
                            <TableCell>
                                {pokemon.tribes.map((t) => (
                                    <div key={t.id}>{t.name}</div>
                                ))}
                            </TableCell>
                            <TableCell>{pokemon.stats.hp}</TableCell>
                            <TableCell>{pokemon.stats.attack}</TableCell>
                            <TableCell>{pokemon.stats.defense}</TableCell>
                            <TableCell>{pokemon.stats.spatk}</TableCell>
                            <TableCell>{pokemon.stats.spdef}</TableCell>
                            <TableCell>{pokemon.stats.speed}</TableCell>
                            <TableCell>{pokemon.BST()}</TableCell>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PokemonTable;
