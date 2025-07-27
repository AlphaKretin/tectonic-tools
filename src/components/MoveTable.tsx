import { Move, moveCategories, MoveCategory } from "@/app/data/tectonic/Move";
import { PokemonType } from "@/app/data/tectonic/PokemonType";
import { TectonicData } from "@/app/data/tectonic/TectonicData";
import FilterOptionButton from "@/components/FilterOptionButton";
import TypeBadge, { TypeBadgeElementEnum } from "@/components/TypeBadge";
import { Fragment, ReactNode, useState } from "react";
import ImageFallback from "./ImageFallback";

type SortDelegate = (a: [number, Move], b: [number, Move]) => number;

export default function MoveTable({
    moves,
    showLevel,
    onMoveClick = undefined,
}: {
    moves: [number, Move][];
    showLevel: boolean;
    onMoveClick?: (m: Move) => void;
}) {
    const [selectedCategory, setSelectedCategory] = useState<MoveCategory | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<PokemonType | undefined>(undefined);
    const [searchMove, setSearchMove] = useState<string>("");
    const [sort, setSort] = useState<{ func: SortDelegate | undefined; asc: boolean; th: string }>({
        func: undefined,
        asc: true,
        th: "",
    });

    function TableHeader({ sortFunc, children }: { sortFunc?: SortDelegate | undefined; children: ReactNode }) {
        const th = children!.toString();
        const isUsingThisSort = sort.th == th;

        return (
            <th
                className={`px-1 py-3 text-center text-sm text-white font-bold cursor-pointer ${
                    sortFunc ? "hover:text-yellow-highlight" : ""
                } ${isUsingThisSort ? (sort.asc ? "overline" : "underline") : ""}`}
                onClick={() => setSort({ func: sortFunc, asc: isUsingThisSort ? !sort.asc : true, th: th })}
            >
                {children}
            </th>
        );
    }

    function TableCell({ span, padding = "px-1", children }: { span?: number; padding?: string; children: ReactNode }) {
        return (
            <td className={`${padding} text-center text-sm text-white whitespace-break-spaces`} colSpan={span}>
                {children}
            </td>
        );
    }

    function MoveTargetCell({ move, position, children }: { move: Move; position: boolean[][]; children: ReactNode }) {
        let useBg = false;
        move.getTargetPositions().forEach((a, i) => a.forEach((v, j) => (useBg ||= v && position[i][j])));

        return (
            <td className={`border px-2 py-0.5 text-xs text-black ${useBg ? "bg-blue-300" : "bg-white/50"}`}>
                {children}
            </td>
        );
    }

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
                            <ImageFallback
                                src={Move.getMoveCategoryImgSrc(c)}
                                alt={c}
                                title={c}
                                height={60}
                                width={51}
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
                <thead className="sticky top-0 bg-blue-700">
                    <tr>
                        {showLevel && <TableHeader sortFunc={(a, b) => a[0] - b[0]}>Lvl</TableHeader>}
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
                        <TableHeader sortFunc={(a, b) => a[1].type.id.localeCompare(b[1].type.id)}>Type</TableHeader>
                        <TableHeader sortFunc={(a, b) => a[1].category.localeCompare(b[1].category)}>Cat</TableHeader>
                        <TableHeader sortFunc={(a, b) => a[1].bp - b[1].bp}>Pow</TableHeader>
                        <TableHeader sortFunc={(a, b) => a[1].accuracy - b[1].accuracy}>Acc</TableHeader>
                        <TableHeader sortFunc={(a, b) => a[1].pp - b[1].pp}>PP</TableHeader>
                        <TableHeader sortFunc={(a, b) => (a[1].priority ?? 0) - (b[1].priority ?? 0)}>Prio</TableHeader>
                        <TableHeader sortFunc={(a, b) => a[1].getDisplayFlags().localeCompare(b[1].getDisplayFlags())}>
                            Flags
                        </TableHeader>
                        <TableHeader sortFunc={(a, b) => a[1].target.localeCompare(b[1].target)}>Target</TableHeader>
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
                        .sort((a, b) => {
                            return sort.func ? sort.func(sort.asc ? a : b, sort.asc ? b : a) : 0;
                        })
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
                                        <ImageFallback
                                            src={m.getCategoryImgSrc()}
                                            alt={m.category}
                                            title={m.category}
                                            height={60}
                                            width={51}
                                            className="w-8 h-8 mx-auto"
                                        />
                                    </TableCell>
                                    <TableCell>{m.bp}</TableCell>
                                    <TableCell>{m.accuracy}</TableCell>
                                    <TableCell>{m.pp}</TableCell>
                                    <TableCell>{m.priority ?? "-"}</TableCell>
                                    <TableCell>
                                        {m.getDisplayFlags().length == 0 ? "-" : m.getDisplayFlags("\n")}
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
