import { MoveCategory, PokemonType } from "./BasicData";

export interface LoadedMove {
    id: string;
    name: string;
    type: string;
    bp: number;
    category: string;
    target: string;
}

export type MoveTarget =
    | "FoeSide"
    | "NearFoe"
    | "ClosestNearFoe"
    | "AllBattlers"
    | "Ally"
    | "UserAndAllies"
    | "UserSide"
    | "AllNearFoes"
    | "AllNearOthers"
    | "NearAlly"
    | "None"
    | "NearOther"
    | "BothSides"
    | "User"
    | "UserOrNearOther";

const spreadTargets: MoveTarget[] = ["AllBattlers", "AllNearFoes", "AllNearOthers", "BothSides", "FoeSide"];

export class Move {
    id: string;
    name: string;
    type: PokemonType;
    bp: number;
    category: MoveCategory;
    target: MoveTarget;
    constructor(loadedMove: LoadedMove) {
        this.id = loadedMove.id;
        this.name = loadedMove.name;
        this.type = loadedMove.type as PokemonType;
        this.bp = loadedMove.bp;
        this.category = loadedMove.category as MoveCategory;
        this.target = loadedMove.target as MoveTarget;
    }

    public isSpread(): boolean {
        return spreadTargets.indexOf(this.target) > -1;
    }
}
