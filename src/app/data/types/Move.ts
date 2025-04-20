import { LoadedMove } from "../loading/moves";
import { StatusEffect } from "../statusEffects";
import { types } from "../types";
import { isNull } from "../util";
import { PartyPokemon } from "./PartyPokemon";
import { Pokemon } from "./Pokemon";
import { PokemonType } from "./PokemonType";

export const moveCategories = ["Physical", "Special", "Status", "Adaptive"] as const;

export type MoveCategory = (typeof moveCategories)[number];

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
    customVarName?: string;
    customVarType?: string;
    needsInput: boolean = false;
    constructor(loadedMove: LoadedMove) {
        this.id = loadedMove.key;
        this.name = loadedMove.name;
        this.description = loadedMove.description;
        this.type = types[loadedMove.type];
        this.bp = loadedMove.power;
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
        return mon.type1.name === this.type.name || mon.type2?.name === this.type.name;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getPower(user: PartyPokemon, customVar: unknown): number {
        // TODO: Implement BP variance for relevant moves
        return this.bp;
    }

    // to be extended by subclasses
    public getType(): PokemonType {
        return this.type;
    }

    // to be extended by subclasses
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public ignoreStatus(effect: StatusEffect): boolean {
        return false;
    }
}
