import { LoadedMove, Move } from "../types/Move";

interface LoadedMultiHitMove extends LoadedMove {
    minHits: number;
    maxHits: number;
}

export function isMultiHit(move: LoadedMove): move is LoadedMultiHitMove {
    return !!move.minHits && !!move.maxHits;
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
