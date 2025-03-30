import { Dispatch, ReactNode, SetStateAction } from "react";
import { MoveCategory, PokemonType } from "../basicData";
import { StatusEffect } from "../statusEffects";
import { Pokemon } from "./Pokemon";

export interface LoadedMove {
    id: string;
    name: string;
    type: string;
    bp: number;
    category: string;
    target: string;
    minHits?: number;
    maxHits?: number;
    flag?: string;
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

    public isSTAB(mon: Pokemon): boolean {
        return mon.type1 === this.type || mon.type2 === this.type;
    }

    public getPower(): number {
        // TODO: Implement BP variance for relevant moves
        return this.bp;
    }

    // to be extended by subclasses
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getInput(_: number, __: Dispatch<SetStateAction<number>>): ReactNode {
        return <></>;
    }

    // to be extended by subclasses
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public ignoreStatus(_: StatusEffect): boolean {
        return false;
    }
}
