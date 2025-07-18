import { WeatherCondition } from "./conditions";

export interface SideState {
    reflect: boolean;
    lightScreen: boolean;
    auroraVeil: boolean;
}

export const nullSideState: SideState = {
    reflect: false,
    lightScreen: false,
    auroraVeil: false,
};

export interface BattleState {
    multiBattle: boolean;
    gravity: boolean;
    weather: WeatherCondition;
    sideState: SideState;
}

export const nullBattleState: BattleState = {
    multiBattle: false,
    gravity: false,
    weather: "None",
    sideState: nullSideState,
};
