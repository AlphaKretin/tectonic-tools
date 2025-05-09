import { Move, moveCategories, MoveCategory } from "@/app/data/tectonic/Move";
import { PokemonType } from "@/app/data/tectonic/PokemonType";
import { TectonicData } from "@/app/data/tectonic/TectonicData";
import FilterOptionButton from "@/components/FilterOptionButton";
import TypeBadge, { TypeBadgeElementEnum } from "@/components/TypeBadge";
import Image from "next/image";
import { ReactNode, useState } from "react";

function TableHeader({ children }: { children: ReactNode }) {
    return <th className="px-2 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300">{children}</th>;
}

function TableCell({ children }: { children: ReactNode }) {
    return <td className="border-y px-2 py-3 text-center text-sm text-gray-900 dark:text-gray-200">{children}</td>;
}

export default function MoveTable({ moves, showLevel }: { moves: [number, Move][]; showLevel: boolean }) {
    const [selectedCategory, setSelectedCategory] = useState<MoveCategory | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<PokemonType | undefined>(undefined);

    return (
        <div>
            <div className="flex justify-center space-x-3 mb-3">
                {moveCategories.map((c) => (
                    <FilterOptionButton
                        key={c}
                        onClick={() => setSelectedCategory(selectedCategory === c ? undefined : c)}
                        isSelected={selectedCategory === c}
                    >
                        <span>
                            <Image
                                src={`/move_categories/${c}.png`}
                                alt={c}
                                title={c}
                                height="60"
                                width="51"
                                className="inline w-8 h-6 mr-1"
                            />
                            {c}
                        </span>
                    </FilterOptionButton>
                ))}
            </div>
            <div className="grid grid-rows-2 grid-flow-col space-x-2 space-y-2 mb-3">
                {Object.values(TectonicData.types).map((t) => (
                    <FilterOptionButton
                        key={t.id}
                        onClick={() => setSelectedType(selectedType === t ? undefined : t)}
                        isSelected={selectedType === t}
                        padding="p-2"
                    >
                        <TypeBadge types={[t]} useShort={false} element={TypeBadgeElementEnum.ICONS} />
                    </FilterOptionButton>
                ))}
            </div>
            <table className="w-full divide-gray-200 dark:divide-gray-700">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {showLevel && <TableHeader>Level</TableHeader>}
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Type</TableHeader>
                        <TableHeader>Cat</TableHeader>
                        <TableHeader>Power</TableHeader>
                        <TableHeader>Acc</TableHeader>
                        <TableHeader>PP</TableHeader>
                        <TableHeader>Effect</TableHeader>
                    </tr>
                </thead>
                <tbody>
                    {moves
                        .filter(
                            ([, m]) =>
                                (selectedCategory === undefined || m.category === selectedCategory) &&
                                (selectedType === undefined || m.type === selectedType)
                        )
                        .map(([level, m], index) => (
                            <tr key={index}>
                                {showLevel && <TableCell>{level == 0 ? "E" : level}</TableCell>}
                                <TableCell>
                                    <span className={m.isSignature ? "text-yellow-500" : ""}>{m.name}</span>
                                </TableCell>
                                <TableCell>
                                    <TypeBadge
                                        key={m.type.id}
                                        types={[m.type]}
                                        useShort={false}
                                        element={TypeBadgeElementEnum.ICONS}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Image
                                        src={`/move_categories/${m.category}.png`}
                                        alt={m.category}
                                        title={m.category}
                                        height="60"
                                        width="51"
                                        className="w-8 h-6"
                                    />
                                </TableCell>
                                <TableCell>{m.bp}</TableCell>
                                <TableCell>{m.accuracy}</TableCell>
                                <TableCell>{m.pp}</TableCell>
                                <TableCell>{m.description}</TableCell>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
