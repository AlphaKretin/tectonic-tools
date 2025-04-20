import loadedMoves from "public/data/moves.json";
import { LoadedMove } from "./loading/moves";
import { DesperationMove, desperationMoves } from "./moves/DesperationMove";
import { FacadeMove, facadeMoves } from "./moves/FacadeMove";
import { MultiHitMove, multiHitMoves } from "./moves/MultiHitMove";
import { StackingMove, stackingMoves } from "./moves/StackingMove";
import { Move } from "./types/Move";

function loadMove(move: LoadedMove): Move {
    if (move.key in multiHitMoves) {
        const hits = multiHitMoves[move.key as keyof typeof multiHitMoves];
        return new MultiHitMove({ ...move, ...hits });
    }
    if (stackingMoves.includes(move.key)) {
        return new StackingMove(move);
    }
    if (facadeMoves.includes(move.key)) {
        return new FacadeMove(move);
    }
    if (desperationMoves.includes(move.key)) {
        return new DesperationMove(move);
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
    effectChance: 0,
    priority: 0,
    flags: [],
});
