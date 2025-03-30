import { LoadedMove, Move } from "../types/Move";

export const multiHitMoves = {
    DOUBLEHIT: {
        minHits: 2,
        maxHits: 2,
    },
};

interface LoadedMultiHitMove extends LoadedMove {
    minHits: number;
    maxHits: number;
}

export class MultiHitMove extends Move {
    minHits: number;
    maxHits: number;
    constructor(move: LoadedMultiHitMove) {
        super(move);
        this.minHits = move.minHits;
        this.maxHits = move.maxHits;
    }
}
