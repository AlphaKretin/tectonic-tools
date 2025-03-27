import loadedMoves from "public/data/moves.json";
import { Move } from "./types/Move";

export const moves: Record<string, Move> = Object.fromEntries(
    Object.entries(loadedMoves).map(([id, move]) => [id, new Move(move)])
);

export const nullMove: Move = new Move({
    id: "",
    name: "",
    type: "Normal",
    bp: 0,
    category: "Status",
    target: "User",
});
