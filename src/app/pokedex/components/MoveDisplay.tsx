"use client";

import { nullMove } from "@/app/data/moves";
import { getSignatureMoves } from "@/app/data/signatures";
import { Move, moveCategories, MoveCategory } from "@/app/data/types/Move";
import { Pokemon } from "@/app/data/types/Pokemon";
import { isNull } from "@/app/data/util";
import TypeBadge from "@/components/TypeBadge";
import { useState } from "react";

export default function MoveDisplay({
    pokemon,
    form,
    moveKey,
}: {
    pokemon: Pokemon;
    form: number;
    moveKey: "level" | "tutor";
}) {
    const [selectedMove, setSelectedMove] = useState<Move>(nullMove);
    const [selectedCategory, setSelectedCategory] = useState<MoveCategory>("Physical");
    const moves =
        moveKey === "level"
            ? pokemon.getLevelMoves(form).map((m) => m[1])
            : pokemon.lineMoves.concat(pokemon.tutorMoves);
    const levels = moveKey === "level" ? pokemon.getLevelMoves(form).map((m) => m[0]) : [];
    const filteredMoves = levels.length === 0 ? moves.filter((move) => move.category === selectedCategory) : moves;

    return (
        <>
            <div className="flex">
                {/* Moves List */}
                <div className="w-1/2">
                    {levels.length === 0 && (
                        <div className="mb-2">
                            <label className="text-gray-600 dark:text-gray-300 mr-2">Category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as MoveCategory)}
                                className="border rounded px-2 py-1 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800"
                            >
                                {moveCategories.map((c) => (
                                    <option value={c} key={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="max-h-64 overflow-y-auto">
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                            {filteredMoves.map((move, index) => (
                                <li
                                    key={index}
                                    className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                    onMouseEnter={() => setSelectedMove(move)}
                                    onClick={() => setSelectedMove(move)}
                                >
                                    {levels.length > 0 ? (levels[index] === 0 ? "E: " : `${levels[index]}: `) : ""}
                                    <span
                                        className={
                                            (move.isSTAB(pokemon) ? "font-semibold" : "") +
                                            " " +
                                            (getSignatureMoves()[move.id] !== undefined ? "text-yellow-500" : "")
                                        }
                                    >
                                        {move.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Move Details */}
                <div className="w-1/2 pl-4">
                    {!isNull(selectedMove) ? (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {selectedMove.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">{selectedMove.description}</p>
                            <div className="mt-2 text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Type:</span> <TypeBadge type1={selectedMove.type} />
                            </div>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Category:</span> {selectedMove.category}
                            </p>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Power:</span> {selectedMove.bp || "—"}
                            </p>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Accuracy:</span> {selectedMove.accuracy || "—"}
                            </p>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">PP:</span> {selectedMove.pp}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-300">Hover over or click a move to see details.</p>
                    )}
                </div>
            </div>
        </>
    );
}
