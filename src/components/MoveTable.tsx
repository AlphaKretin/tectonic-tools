import { Move, moveCategories, MoveCategory } from "@/app/data/tectonic/Move";
import { PokemonType } from "@/app/data/tectonic/PokemonType";
import { TectonicData } from "@/app/data/tectonic/TectonicData";
import FilterOptionButton from "@/components/FilterOptionButton";
import TypeBadge, { TypeBadgeElementEnum } from "@/components/TypeBadge";
import Image from "next/image";
import { Fragment, ReactNode, useState } from "react";

function TableHeader({ children }: { children: ReactNode }) {
    return <th className="px-1 py-3 text-center text-sm font-bold text-gray-300">{children}</th>;
}

function TableCell({ span, padding = "px-1", children }: { span?: number; padding?: string; children: ReactNode }) {
    return (
        <td className={`${padding} text-center text-sm text-gray-200 whitespace-break-spaces`} colSpan={span}>
            {children}
        </td>
    );
}

function MoveTargetCell({ move, position, children }: { move: Move; position: boolean[][]; children: ReactNode }) {
    let useBg = false;
    move.getTargetPositions().forEach((a, i) => a.forEach((v, j) => (useBg ||= v && position[i][j])));

    return (
        <td className={`border px-2 py-0.5 text-xs text-black ${useBg ? "bg-blue-300" : "bg-white/50"}`}>{children}</td>
    );
}

export default function MoveTable({
    moves,
    showLevel,
    onMoveClick = undefined,
}: {
    moves: [number, Move][];
    showLevel: boolean;
    onMoveClick?: (m: Move) => void;
}) {
    const displayableMoveFlags = new Set<string>();
    displayableMoveFlags.add("Sound");
    displayableMoveFlags.add("Punch");
    displayableMoveFlags.add("Dance");
    displayableMoveFlags.add("Blade");
    displayableMoveFlags.add("Biting");
    displayableMoveFlags.add("Bite");
    displayableMoveFlags.add("Kicking");
    displayableMoveFlags.add("Pulse");
    displayableMoveFlags.add("Wind");
    displayableMoveFlags.add("Foretold");

    const [selectedCategory, setSelectedCategory] = useState<MoveCategory | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<PokemonType | undefined>(undefined);
    const [searchMove, setSearchMove] = useState<string>("");

    function getRowClass(i: number, hover: boolean = false) {
        return `${onMoveClick ? "cursor-pointer" : ""} ${hover ? "bg-blue-900" : i % 2 == 0 ? "" : "bg-gray-700"}`;
    }

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
                                className="inline w-8 h-8 mr-1"
                            />
                            {c}
                        </span>
                    </FilterOptionButton>
                ))}
            </div>
            <div className="grid grid-rows-2 grid-flow-col justify-center space-x-3 space-y-3 mb-3">
                {Object.values(TectonicData.types)
                    .filter((t) => t.isRealType)
                    .map((t) => (
                        <FilterOptionButton
                            key={t.id}
                            onClick={() => setSelectedType(selectedType === t ? undefined : t)}
                            isSelected={selectedType === t}
                            padding="p-2"
                        >
                            <TypeBadge types={[t]} element={TypeBadgeElementEnum.ICONS} />
                        </FilterOptionButton>
                    ))}
            </div>
            <table className="w-full">
                <thead className="sticky top-0 text-gray-900 dark:text-gray-200 bg-blue-200 dark:bg-blue-700">
                    <tr>
                        {showLevel && <TableHeader>Lvl</TableHeader>}
                        <TableHeader>
                            <input
                                className="border rounded px-2 py-1 bg-gray-700 text-white border-gray-600"
                                type="text"
                                autoFocus={true}
                                value={searchMove}
                                onChange={(e) => setSearchMove(e.target.value)}
                                placeholder="Move"
                            />
                        </TableHeader>
                        <TableHeader>Type</TableHeader>
                        <TableHeader>Cat</TableHeader>
                        <TableHeader>Pow</TableHeader>
                        <TableHeader>Acc</TableHeader>
                        <TableHeader>PP</TableHeader>
                        <TableHeader>Prio</TableHeader>
                        <TableHeader>Flags</TableHeader>
                        <TableHeader>Target</TableHeader>
                    </tr>
                </thead>
                <tbody>
                    {moves
                        .filter(
                            ([, m]) =>
                                (!selectedCategory || m.category === selectedCategory) &&
                                (!selectedType || m.type === selectedType) &&
                                (!searchMove || m.name.toLowerCase().includes(searchMove.toLowerCase()))
                        )
                        .map(([level, m], index) => (
                            <Fragment key={index}>
                                <tr
                                    className={getRowClass(index)}
                                    onClick={() => onMoveClick?.(m)}
                                    onMouseOver={(e) => {
                                        e.currentTarget.className = getRowClass(index, true);
                                        e.currentTarget.nextElementSibling!.className = getRowClass(index, true);
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.className = getRowClass(index);
                                        e.currentTarget.nextElementSibling!.className = getRowClass(index);
                                    }}
                                >
                                    {showLevel && <TableCell>{level == 0 ? "E" : level}</TableCell>}
                                    <TableCell>
                                        <span className={m.isSignature ? "text-yellow-500" : ""}>{m.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <TypeBadge
                                            key={m.type.id}
                                            types={[m.type]}
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
                                            className="w-8 h-8 mx-auto"
                                        />
                                    </TableCell>
                                    <TableCell>{m.bp}</TableCell>
                                    <TableCell>{m.accuracy}</TableCell>
                                    <TableCell>{m.pp}</TableCell>
                                    <TableCell>{m.priority ?? "-"}</TableCell>
                                    <TableCell>
                                        {m.flags.filter((f) => displayableMoveFlags.has(f)).length == 0
                                            ? "-"
                                            : m.flags.filter((f) => displayableMoveFlags.has(f)).join("\n")}
                                    </TableCell>
                                    <TableCell padding="px-1 pt-2 pb-1">
                                        <table className="mx-auto">
                                            <tbody>
                                                <tr>
                                                    <MoveTargetCell
                                                        move={m}
                                                        position={[
                                                            [true, false],
                                                            [false, false],
                                                        ]}
                                                    >
                                                        Foe
                                                    </MoveTargetCell>
                                                    {m.isSpread() && (
                                                        <MoveTargetCell
                                                            move={m}
                                                            position={[
                                                                [false, true],
                                                                [false, false],
                                                            ]}
                                                        >
                                                            Foe
                                                        </MoveTargetCell>
                                                    )}
                                                </tr>
                                                <tr>
                                                    <MoveTargetCell
                                                        move={m}
                                                        position={[
                                                            [false, false],
                                                            [true, false],
                                                        ]}
                                                    >
                                                        User
                                                    </MoveTargetCell>
                                                    {m.isSpread() && (
                                                        <MoveTargetCell
                                                            move={m}
                                                            position={[
                                                                [false, false],
                                                                [false, true],
                                                            ]}
                                                        >
                                                            Ally
                                                        </MoveTargetCell>
                                                    )}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </TableCell>
                                </tr>
                                <tr
                                    className={getRowClass(index)}
                                    onClick={() => onMoveClick?.(m)}
                                    onMouseOver={(e) => {
                                        e.currentTarget.className = getRowClass(index, true);
                                        e.currentTarget.previousElementSibling!.className = getRowClass(index, true);
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.className = getRowClass(index);
                                        e.currentTarget.previousElementSibling!.className = getRowClass(index);
                                    }}
                                >
                                    <TableCell span={showLevel ? 10 : 9} padding="px-1 pb-2">
                                        {m.description}
                                    </TableCell>
                                </tr>
                            </Fragment>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
