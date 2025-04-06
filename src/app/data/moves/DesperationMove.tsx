import { Dispatch, ReactNode, SetStateAction } from "react";
import { PokemonStats } from "../../damagecalc/damageCalc";
import { Move } from "../types/Move";

export const desperationMoves = ["FLAIL"];

export class DesperationMove extends Move {
    currentHP = 0;
    public getPower(user: PokemonStats): number {
        let hp = Math.max(this.currentHP, 1);
        hp = Math.min(hp, user.stats.hp);
        const hpRatio = hp / user.stats.hp;
        return Math.min(Math.floor(20 / (hpRatio * 5) ** 0.75) * 5, 200);
    }

    private handleHP(currentHP: number, setCustomMoveVar: Dispatch<SetStateAction<number>>) {
        this.currentHP = currentHP;
        setCustomMoveVar(currentHP);
    }

    public getInput(customMoveVar: number, setCustomMoveVar: Dispatch<SetStateAction<number>>): ReactNode {
        return (
            <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Current HP</h3>
                <input
                    type="number"
                    min={0}
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                    value={customMoveVar}
                    onChange={(e) => {
                        this.handleHP(parseInt(e.target.value) || 0, setCustomMoveVar);
                    }}
                />
            </div>
        );
    }
}
