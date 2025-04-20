import { moves, nullMove } from "@/app/data/moves";
import { Move } from "@/app/data/types/Move";
import { PartyPokemon } from "@/app/data/types/PartyPokemon";
import { isNull } from "@/app/data/util";
import Checkbox from "@/components/Checkbox";
import Dropdown from "@/components/DropDown";
import InputLabel from "@/components/InputLabel";
import TypeBadge from "@/components/TypeBadge";
import { ReactNode } from "react";

export interface MoveData<T> {
    move: Move<T>;
    customVar: T;
    criticalHit: boolean;
}

function getMoveCategory(move: Move<unknown>, userData: PartyPokemon) {
    if (move.category !== "Adaptive") {
        return move.category;
    }
    const trueCategory = userData.stats.attack >= userData.stats.spatk ? "Physical" : "Special";
    return "Adaptive (" + trueCategory + ")";
}

export default function MoveCard<T>({
    data,
    updateMoveData,
    userData,
    targetData,
}: {
    data: MoveData<T>;
    updateMoveData: (move: MoveData<T>) => void;
    userData: PartyPokemon;
    targetData: PartyPokemon;
}): ReactNode {
    function updateMove(move: Move<T>) {
        const newData = { ...data, move };
        updateMoveData(newData);
    }

    function updateCustomVar(customVar: T) {
        const newData = { ...data, customVar };
        updateMoveData(newData);
    }

    function updateCriticalHit(criticalHit: boolean) {
        const newData = { ...data, criticalHit };
        updateMoveData(newData);
    }

    function getCustomVarInput(data: MoveData<T>, updateCustomVar: (customVar: T) => void): ReactNode {
        if (typeof data.customVar === "number") {
            <div className="flex items-center space-x-2">
                <InputLabel>{data.move.customVarName}</InputLabel>
                <input
                    type="number"
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                    value={data.customVar}
                    onChange={(e) => updateCustomVar(parseInt(e.target.value) as T)}
                />
            </div>;
        }
        return <span>Input for type {typeof data.customVar} not yet implemented.</span>;
    }

    return (
        <div>
            {!isNull(userData.species) && (
                <div className="text-center">
                    <InputLabel>Move</InputLabel>
                    <Dropdown value={data.move.id} onChange={(e) => updateMove(moves[e.target.value] || nullMove)}>
                        <option value="" className="bg-gray-800">
                            Select Move
                        </option>
                        {userData.moves
                            .filter((m) => m.bp > 0)
                            .map((m) => (
                                <option
                                    key={m.id}
                                    value={m.id}
                                    className={`bg-gray-800 ${
                                        m.isSTAB(userData.species) ? "font-bold text-blue-400" : ""
                                    }`}
                                >
                                    {m.name}
                                </option>
                            ))}
                    </Dropdown>
                </div>
            )}
            {!isNull(data.move) && (
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    {data.move.needsInput && getCustomVarInput(data, updateCustomVar)}
                    <Checkbox
                        checked={data.criticalHit}
                        disabled={targetData.volatileStatusEffects.Jinx}
                        onChange={() => updateCriticalHit(!data.criticalHit)}
                    >
                        Critical Hit
                    </Checkbox>
                    <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Move Details</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="text-right text-gray-400">Type:</div>
                        <TypeBadge type1={data.move.type} />
                        <div className="text-right text-gray-400">Power:</div>
                        <div className="text-left text-gray-200">{data.move.getPower(userData, data.customVar)}</div>
                        <div className="text-right text-gray-400">Category:</div>
                        <div className="text-left text-gray-200">{getMoveCategory(data.move, userData)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
