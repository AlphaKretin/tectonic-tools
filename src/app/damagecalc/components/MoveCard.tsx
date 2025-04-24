import { moves, nullMove } from "@/app/data/moves";
import { getSignatureMoves } from "@/app/data/signatures";
import { Move } from "@/app/data/types/Move";
import { PartyPokemon } from "@/app/data/types/PartyPokemon";
import { isNull } from "@/app/data/util";
import Checkbox from "@/components/Checkbox";
import Dropdown from "@/components/DropDown";
import InputLabel from "@/components/InputLabel";
import TypeBadge from "@/components/TypeBadge";
import { ReactNode } from "react";

export interface MoveData {
    move: Move;
    customVar: unknown;
    criticalHit: boolean;
}

function getMoveCategory(move: Move, userData: PartyPokemon) {
    if (move.category !== "Adaptive") {
        return move.category;
    }
    const trueCategory = userData.stats.attack >= userData.stats.spatk ? "Physical" : "Special";
    return "Adaptive (" + trueCategory + ")";
}

export default function MoveCard({
    data,
    updateMoveData,
    userData,
    targetData,
}: {
    data: MoveData;
    updateMoveData: (move: MoveData) => void;
    userData: PartyPokemon;
    targetData: PartyPokemon;
}): ReactNode {
    function updateMove(move: Move) {
        const newData = { ...data, move };
        updateMoveData(newData);
    }

    function updateCustomVar(customVar: unknown) {
        const newData = { ...data, customVar };
        updateMoveData(newData);
    }

    function updateCriticalHit(criticalHit: boolean) {
        const newData = { ...data, criticalHit };
        updateMoveData(newData);
    }

    function getCustomVarInput(data: MoveData, updateCustomVar: (customVar: unknown) => void): ReactNode {
        if (data.move.customVarType === "number") {
            if (data.customVar === undefined) {
                data.customVar = 0;
            }
            return (
                <div className="flex items-center space-x-2">
                    <InputLabel>{data.move.customVarName}</InputLabel>
                    <input
                        type="number"
                        className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                        value={data.customVar as number}
                        onChange={(e) => updateCustomVar(parseInt(e.target.value))}
                    />
                </div>
            );
        }
        if (data.move.customVarType === "boolean") {
            if (data.customVar === undefined) {
                data.customVar = false;
            }
            return (
                <Checkbox checked={data.customVar as boolean} onChange={() => updateCustomVar(!data.customVar)}>
                    {data.move.customVarName}
                </Checkbox>
            );
        }
        return <span>Input for type {data.move.customVarType === "number"} not yet implemented.</span>;
    }

    // the bp > 0 filter probably isn't strictly accurate i bet there's some weird fixed damage moves it excludes
    let legalMoves = userData.moves.filter((m) => !isNull(m) && m.bp > 0);
    if (legalMoves.length === 0) {
        legalMoves = userData.species.allMoves(userData.form).filter((m) => m.bp > 0);
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
                        {legalMoves.map((m) => (
                            <option
                                key={m.id}
                                value={m.id}
                                className={`bg-gray-800 ${
                                    m.id in getSignatureMoves()
                                        ? "font-semibold text-yellow-500"
                                        : m.isSTAB(userData.species)
                                        ? "font-semibold text-blue-400"
                                        : ""
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
                        checked={targetData.volatileStatusEffects.Jinx || data.criticalHit}
                        disabled={targetData.volatileStatusEffects.Jinx}
                        onChange={() => updateCriticalHit(!data.criticalHit)}
                    >
                        Critical Hit
                    </Checkbox>
                    <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Move Details</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="text-right text-gray-400">Type:</div>
                        <TypeBadge type1={data.move.getType(userData)} />
                        <div className="text-right text-gray-400">Power:</div>
                        <div className="text-left text-gray-200">
                            {data.move.getPower(userData, targetData, data.customVar)}
                        </div>
                        <div className="text-right text-gray-400">Category:</div>
                        <div className="text-left text-gray-200">{getMoveCategory(data.move, userData)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
