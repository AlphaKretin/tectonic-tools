import { MoveData } from "@/app/damagecalc/components/MoveCard";
import { Side } from "@/app/damagecalc/damageCalc";
import { BattleState } from "@/app/data/battleState";
import { LoadedMove } from "@/preload/loadedDataClasses";
import { MoveTypeChangeAbility } from "../abilities/MoveTypeChangeAbility";
import { StatusEffect } from "../conditions";
import { TectonicData } from "../tectonic/TectonicData";
import { PartyPokemon } from "../types/PartyPokemon";
import { isNull } from "../util";
import { Pokemon, Stat } from "./Pokemon";
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
    id: string = "";
    name: string = "";
    description: string = "";
    type: PokemonType = TectonicData.types["NORMAL"];
    bp: number = 0;
    accuracy: number = 0;
    pp: number = 0;
    priority?: number;
    category: MoveCategory = "Status";
    target: MoveTarget = "User";
    customVarName?: string;
    customVarType?: string;
    needsInput: boolean = false;
    isSignature: boolean = false;
    flags: string[] = [];

    static NULL: Move = null!;

    constructor(loaded?: LoadedMove) {
        if (!loaded) return;

        this.id = loaded.key;
        this.name = loaded.name;
        this.description = loaded.description;
        this.type = TectonicData.types[loaded.type];
        this.bp = loaded.power;
        this.accuracy = loaded.accuracy;
        this.pp = loaded.pp;
        this.priority = loaded.priority;
        this.category = loaded.category as MoveCategory;
        this.target = loaded.target as MoveTarget;
        this.isSignature = loaded.isSignature;
        this.flags = loaded.flags;
    }

    public isAttackingMove() {
        return !isNull(this) && this.category !== "Status";
    }

    public isSpread(): boolean {
        return spreadTargets.indexOf(this.target) > -1;
    }

    public getTargetPositions(): number[][] {
        // Format is [[Foe, Foe], [User, Ally]]
        switch (this.target) {
            case "FoeSide":
            case "NearFoe":
            case "AllNearFoes":
            case "ClosestNearFoe":
                return [
                    [1, 1],
                    [0, 0],
                ];
            case "UserSide":
            case "UserAndAllies":
                return [
                    [0, 0],
                    [1, 1],
                ];
            case "UserOrNearOther":
            case "AllNearOthers":
            case "AllBattlers":
            case "BothSides":
                return [
                    [1, 1],
                    [1, 1],
                ];
            case "Ally":
            case "NearAlly":
                return [
                    [0, 0],
                    [0, 1],
                ];
            case "NearOther":
                return [
                    [1, 1],
                    [0, 1],
                ];
            case "User":
                return [
                    [0, 0],
                    [1, 0],
                ];
            case "None":
            default:
                return [
                    [0, 0],
                    [0, 0],
                ];
        }
    }

    public isSTAB(mon: Pokemon): boolean {
        return mon.type1.name === this.type.name || mon.type2?.name === this.type.name;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getPower(user: PartyPokemon, target: PartyPokemon, battleState: BattleState, customVar: unknown): number {
        // TODO: Implement BP variance for relevant moves
        return this.bp;
    }

    // to be extended by subclasses
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getType(user: PartyPokemon, battleState: BattleState): PokemonType {
        if (user.ability instanceof MoveTypeChangeAbility && user.ability.shouldChangeType(this)) {
            return user.ability.moveType;
        }
        return this.type;
    }

    // to be extended by subclasses
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public ignoreStatus(effect: StatusEffect): boolean {
        return false;
    }

    public getAttackingStat(category: "Physical" | "Special"): Stat {
        return category === "Physical" ? "attack" : "spatk";
    }

    public getDefendingStat(category: "Physical" | "Special"): Stat {
        return category === "Physical" ? "defense" : "spdef";
    }

    public ignoresScreens(): boolean {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getDamageCategory(move: MoveData, user: PartyPokemon, target: PartyPokemon): "Physical" | "Special" {
        let trueCategory: "Physical" | "Special";
        if (this.category === "Adaptive") {
            if (user.getStats(move, "player").attack >= user.getStats(move, "player").spatk) {
                trueCategory = "Physical";
            } else {
                trueCategory = "Special";
            }
        } else if (this.category === "Status") {
            // lazy typeguard
            throw new Error("Status moves shouldn't be selectable!");
        } else {
            trueCategory = this.category;
        }
        return trueCategory;
    }

    public getAttackStatSide(): Side {
        return "player";
    }

    public getCriticalMultiplier(): number {
        return 1.5;
    }

    static moveCodes: string[] = [];
}
