import { LoadedMove } from "../loading/moves";
import { Move } from "../types/Move";

interface MultiHits {
    minHits: number;
    maxHits: number;
}

export const multiHitMoveCodes: Record<string, MultiHits> = {
    HitTwoToFiveTimes: {
        minHits: 2,
        maxHits: 5,
    },
    HitTwoToFiveTimesAlwaysHits: {
        minHits: 2,
        maxHits: 5,
    },
    HitTwoTimes: {
        minHits: 2,
        maxHits: 2,
    },
};

export class MultiHitMove extends Move {
    minHits: number;
    maxHits: number;
    constructor(move: LoadedMove, hits: MultiHits) {
        super(move);
        this.minHits = hits.minHits;
        this.maxHits = hits.maxHits;
    }
}
