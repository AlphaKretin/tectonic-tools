import { Ability } from "./types/Ability";
import { Item } from "./types/Item";
import { Move } from "./types/Move";
import { Pokemon } from "./types/Pokemon";
import { PokemonType } from "./types/PokemonType";
import { Trainer } from "./types/Trainer";

type NullableObject = Pokemon | Move | Trainer | Ability | Item | PokemonType;
type NullObject = NullableObject & { name: "" };

export function isNull(o: NullableObject | undefined): o is undefined | NullObject {
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

export function convertToBase64Url(buf: ArrayBuffer): string {
    return Buffer.from(buf).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function convertBase64UrlToBuffer(base64url: string): ArrayBuffer {
    return Buffer.from(base64url.replaceAll("-", "+").replaceAll("_", "/"), "base64").buffer;
}
