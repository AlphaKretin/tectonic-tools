import loadedMoves from "public/data/moves.json";
import { isMultiHit, MultiHitMove } from "./moves/MultiHitMove";
import { StackingMove } from "./moves/StackingMove";
import { LoadedMove, Move } from "./types/Move";

function loadMove(move: LoadedMove): Move {
    if (isMultiHit(move)) {
        return new MultiHitMove(move);
    }
    if (move.flag === "Stacking") {
        return new StackingMove(move);
    }
    return new Move(move);
}

export const moves: Record<string, Move> = Object.fromEntries(
    Object.entries(loadedMoves).map(([id, move]) => [id, loadMove(move)])
);

export const nullMove: Move = new Move({
    id: "",
    name: "",
    type: "Normal",
    bp: 0,
    category: "Status",
    target: "User",
});
