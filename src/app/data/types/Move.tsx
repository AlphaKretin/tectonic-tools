import { Dispatch, ReactNode, SetStateAction } from "react";
import { PokemonStats } from "../../damagecalc/damageCalc";
import { MoveCategory, PokemonType, pokemonTypes } from "../basicData";
import { StatusEffect } from "../statusEffects";
import { typeChart } from "../typeChart";
import { isNull } from "../util";
import { Pokemon } from "./Pokemon";

export interface LoadedMove {
    id: string;
    name: string;
    description: string;
    type: string;
    bp: number;
    accuracy: number;
    pp: number;
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
    description: string;
    type: PokemonType;
    bp: number;
    accuracy: number;
    pp: number;
    category: MoveCategory;
    target: MoveTarget;
    constructor(loadedMove: LoadedMove) {
        this.id = loadedMove.id;
        this.name = loadedMove.name;
        this.description = loadedMove.description;
        this.type = loadedMove.type as PokemonType;
        this.bp = loadedMove.bp;
        this.accuracy = loadedMove.accuracy;
        this.pp = loadedMove.pp;
        this.category = loadedMove.category as MoveCategory;
        this.target = loadedMove.target as MoveTarget;
    }

    public isAttackingMove() {
        return !isNull(this) && this.category !== "Status";
    }

    public isSpread(): boolean {
        return spreadTargets.indexOf(this.target) > -1;
    }

    public isSTAB(mon: Pokemon): boolean {
        return mon.type1 === this.type || mon.type2 === this.type;
    }

    public matchups() {
        return Object.fromEntries(
            pokemonTypes.map((t) => {
                return [t, Math.max(typeChart[this.type][t])];
            })
        ) as Record<PokemonType, number>;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getPower(user: PokemonStats): number {
        // TODO: Implement BP variance for relevant moves
        return this.bp;
    }

    // to be extended by subclasses
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getInput(customMoveVar: number, setCustomMoveVar: Dispatch<SetStateAction<number>>): ReactNode {
        return <></>;
    }

    // to be extended by subclasses
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public ignoreStatus(effect: StatusEffect): boolean {
        return false;
    }
}
