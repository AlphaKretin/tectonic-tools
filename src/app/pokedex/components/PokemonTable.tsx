import { PokemonTableProps } from "@/app/pokedex/page";
import Image from "next/image";
import { getTypeGradient } from "../../../components/colours";
import TypeBadge from "../../../components/TypeBadge";

const PokemonTable: React.FC<PokemonTableProps> = ({ mons, onRowClick }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Type(s)
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {mons.map((pokemon) => (
                        <tr
                            key={pokemon.id}
                            onClick={() => onRowClick(pokemon)}
                            className={`hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer transition-colors ${getTypeGradient(
                                pokemon
                            )}`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                <Image
                                    src={`/Pokemon/${pokemon.id}.png`}
                                    alt={pokemon.name}
                                    width={50}
                                    height={50}
                                    className="rounded-full"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                {pokemon.dex}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                {pokemon.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <TypeBadge type1={pokemon.type1} type2={pokemon.type2} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PokemonTable;
