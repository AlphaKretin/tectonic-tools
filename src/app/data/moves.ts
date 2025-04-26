import loadedMoves from "public/data/moves.json";
import { LoadedMove } from "./loading/moves";
import { AcrobaticsMove } from "./moves/AcrobaticsMove";
import { BreakScreensMove } from "./moves/BreakScreensMove";
import { ConditionalDoubleMove } from "./moves/ConditionalDoubleMove";
import { DesperationMove } from "./moves/DesperationMove";
import { DifferentAttackingStatMove } from "./moves/DifferentAttackStatMove";
import { DifferentDefenseStatMove } from "./moves/DifferentDefenseStatMove";
import { ExtraTypeMove } from "./moves/ExtraTypeMove";
import { FacadeMove } from "./moves/FacadeMove";
import { IgnoreStatMove } from "./moves/IgnoreStatMove";
import { MultiHitMove } from "./moves/MultiHitMove";
import { PunishStatusMove } from "./moves/PunishStatusMove";
import { SpitUpMove } from "./moves/SpitUpMove";
import { StackingMove } from "./moves/StackingMove";
import { SuperAdaptiveMove } from "./moves/SuperAdaptiveMove";
import { VariableTypeMove, variableTypeMoves } from "./moves/TypeFromItemMove";
import { WeightScalingMove } from "./moves/WeightScalingMove";
import { Move } from "./types/Move";

const moveSubclasses = [
    AcrobaticsMove,
    BreakScreensMove,
    ConditionalDoubleMove,
    DesperationMove,
    DifferentAttackingStatMove,
    DifferentDefenseStatMove,
    ExtraTypeMove,
    FacadeMove,
    IgnoreStatMove,
    MultiHitMove,
    PunishStatusMove,
    SpitUpMove,
    StackingMove,
    SuperAdaptiveMove,
    // VariableTypeMove is handled separately
    WeightScalingMove,
];

function loadMove(move: LoadedMove): Move {
    // Judgment, Multi-Attack, and Techno Blast are sufficiently hardcoded that
    // a functionCode-based approach would be more roundabout
    if (move.key in variableTypeMoves) {
        return new VariableTypeMove(move);
    }
    for (const subclass of moveSubclasses) {
        if (subclass.moveCodes.includes(move.functionCode)) {
            return new subclass(move);
        }
    }
    return new Move(move);
}

export const moves: Record<string, Move> = Object.fromEntries(
    Object.entries(loadedMoves).map(([id, move]) => [id, loadMove(move)])
);

export const nullMove: Move = new Move({
    key: "",
    name: "",
    description: "",
    type: "Normal",
    power: 0,
    accuracy: 0,
    pp: 0,
    category: "Status",
    target: "User",
    functionCode: "Basic",
    effectChance: 0,
    priority: 0,
    flags: [],
});
