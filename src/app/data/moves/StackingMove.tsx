import { Dispatch, ReactNode, SetStateAction } from "react";
import { LoadedMove, Move } from "../types/Move";

export const stackingMoves = ["ECHOEDVOICE"];

export class StackingMove extends Move {
    turns = 0;
    constructor(move: LoadedMove) {
        super(move);
    }

    public getPower(): number {
        return this.bp * Math.pow(2, this.turns);
    }

    private handleTurns(turns: number, setCustomMoveVar: Dispatch<SetStateAction<number>>) {
        this.turns = turns;
        setCustomMoveVar(turns);
    }

    public getInput(customMoveVar: number, setCustomMoveVar: Dispatch<SetStateAction<number>>): ReactNode {
        return (
            <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Consecutive Turns</h3>
                <input
                    type="number"
                    min={0}
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                    value={customMoveVar}
                    onChange={(e) => {
                        this.handleTurns(parseInt(e.target.value) || 0, setCustomMoveVar);
                    }}
                />
            </div>
        );
    }
}
