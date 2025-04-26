import loadedMoves from "public/data/moves.json";
import { LoadedMove } from "./loading/moves";
import { BreakScreensMove } from "./moves/BreakScreensMove";
import { ConditionalAutoDoubleMove } from "./moves/ConditionalAutoDoubleMove";
import { ConditionalInputDoubleMove } from "./moves/ConditionalInputDoubleMove";
import { DesperationMove } from "./moves/DesperationMove";
import { DifferentAttackingStatMove } from "./moves/DifferentAttackStatMove";
import { DifferentDefenseStatMove } from "./moves/DifferentDefenseStatMove";
import { ExtraTypeMove } from "./moves/ExtraTypeMove";
import { FacadeMove } from "./moves/FacadeMove";
import { HitsFliersMove } from "./moves/HitsFliersMove";
import { IgnoreStatMove } from "./moves/IgnoreStatMove";
import { MultiHitMove } from "./moves/MultiHitMove";
import { SlownessScalingMove } from "./moves/SlownessScalingMove";
import { SpitUpMove } from "./moves/SpitUpMove";
import { StackingMove } from "./moves/StackingMove";
import { SuperAdaptiveMove } from "./moves/SuperAdaptiveMove";
import { VariableTypeMove, variableTypeMoves } from "./moves/TypeFromItemMove";
import { WeightTargetScalingMove } from "./moves/WeightTargetScalingMove";
import { WeightUserScalingMove } from "./moves/WeightUserScalingMove";
import { Move } from "./types/Move";

const moveSubclasses = [
    BreakScreensMove,
    ConditionalAutoDoubleMove,
    ConditionalInputDoubleMove,
    DesperationMove,
    DifferentAttackingStatMove,
    DifferentDefenseStatMove,
    ExtraTypeMove,
    FacadeMove,
    HitsFliersMove,
    IgnoreStatMove,
    MultiHitMove,
    SlownessScalingMove,
    SpitUpMove,
    StackingMove,
    SuperAdaptiveMove,
    // VariableTypeMove is handled separately
    WeightTargetScalingMove,
    WeightUserScalingMove,
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
