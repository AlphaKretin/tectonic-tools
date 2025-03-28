import { ReactNode } from "react";
import { Move } from "../types/Move";

export class StackingMove extends Move {
    turns = 0;

    public getPower(): number {
        return this.bp * Math.pow(2, this.turns);
    }

    public getInput(): ReactNode {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Consecutive Turns</label>
                <input
                    type="number"
                    min={0}
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                    value={this.turns}
                    onChange={(e) => {
                        this.turns = parseInt(e.target.value) || 0;
                    }}
                />
            </div>
        );
    }
}
