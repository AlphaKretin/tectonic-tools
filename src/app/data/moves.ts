import loadedMoves from "public/data/moves.json";
import { DesperationMove, desperationMoves } from "./moves/DesperationMove";
import { FacadeMove, facadeMoves } from "./moves/FacadeMove";
import { MultiHitMove, multiHitMoves } from "./moves/MultiHitMove";
import { StackingMove, stackingMoves } from "./moves/StackingMove";
import { LoadedMove, Move } from "./types/Move";

function loadMove(move: LoadedMove): Move {
    if (move.id in multiHitMoves) {
        const hits = multiHitMoves[move.id as keyof typeof multiHitMoves];
        return new MultiHitMove({ ...move, ...hits });
    }
    if (stackingMoves.includes(move.id)) {
        return new StackingMove(move);
    }
    if (facadeMoves.includes(move.id)) {
        return new FacadeMove(move);
    }
    if (desperationMoves.includes(move.id)) {
        return new DesperationMove(move);
    }
    return new Move(move);
}

export const moves: Record<string, Move> = Object.fromEntries(
    Object.entries(loadedMoves).map(([id, move]) => [id, loadMove(move)])
);

export const nullMove: Move = new Move({
    id: "",
    name: "",
    description: "",
    type: "Normal",
    bp: 0,
    accuracy: 0,
    pp: 0,
    category: "Status",
    target: "User",
});
