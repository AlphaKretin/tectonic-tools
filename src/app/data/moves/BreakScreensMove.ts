import { Move } from "../types/Move";

export const breakScreensMoveCodes = ["RemoveScreens"];

export class BreakScreensMove extends Move {
    public ignoresScreens(): boolean {
        return true;
    }
}
