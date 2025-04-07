import { Move } from "./types/Move";
import { Pokemon } from "./types/Pokemon";
import { Trainer } from "./types/Trainer";

export function isNull(o: Pokemon | Move | Trainer | undefined): boolean {
    return !o || o.name === "";
}
