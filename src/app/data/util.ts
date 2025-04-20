import { Ability } from "./types/Ability";
import { Item } from "./types/Item";
import { Move } from "./types/Move";
import { Pokemon } from "./types/Pokemon";
import { PokemonType } from "./types/PokemonType";
import { Trainer } from "./types/Trainer";

export function isNull(o: Pokemon | Move | Trainer | Ability | Item | PokemonType | undefined): boolean {
    return !o || o.name === "";
}

export function negativeMod(n: number, m: number) {
    return ((n % m) + m) % m;
}

function isKey<T extends object>(k: string | number | symbol, o: T): k is keyof T {
    return k in o;
}

export function safeKeys<T extends object>(o: T): Array<keyof T> {
    const allKeys = Object.keys(o);
    return allKeys.filter((k) => isKey(k, o));
}

export function uniq<T>(a: T[]) {
    return a.filter((item, pos, self) => self.indexOf(item) == pos);
}
