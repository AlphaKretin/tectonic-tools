import { MoveCategory, PokemonType } from "./BasicData";

export interface Move {
    id: string;
    name: string;
    type: PokemonType;
    bp: number;
    category: MoveCategory;
    target: MoveTarget;
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
