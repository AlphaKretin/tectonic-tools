import loadedMoves from "public/data/moves.json";
import { MoveCategory, PokemonType } from "./types/BasicData";
import { Move, MoveTarget } from "./types/Move";

interface LoadedMove {
    id: string;
    name: string;
    type: string;
    bp: number;
    category: string;
    target: string;
}

function loadMoves(move: LoadedMove): Move {
    return {
        ...move,
        type: move.type as PokemonType,
        category: move.category as MoveCategory,
        target: move.target as MoveTarget,
    };
}

export const moves: Record<string, Move> = Object.fromEntries(
    Object.entries(loadedMoves).map(([id, move]) => [id, loadMoves(move)])
);

export const nullMove: Move = {
    id: "",
    name: "",
    type: "Normal",
    bp: 0,
    category: "Status",
    target: "User",
};
