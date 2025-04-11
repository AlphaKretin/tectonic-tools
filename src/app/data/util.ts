import { Ability } from "./types/Ability";
import { Item } from "./types/Item";
import { Move } from "./types/Move";
import { Pokemon } from "./types/Pokemon";
import { Trainer } from "./types/Trainer";

export function isNull(o: Pokemon | Move | Trainer | Ability | Item | undefined): boolean {
    return !o || o.name === "";
}
