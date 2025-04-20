import { LoadedItem } from "../loading/items";
import { Item } from "../types/Item";
import { Pokemon } from "../types/Pokemon";

export const typeChangingItems: Record<string, string | undefined> = {
    CRYSTALVEIL: undefined,
    PRISMATICPLATE: "ARCEUS",
    MEMORYSET: "SILVALLY",
};

// type is stored in state of relevant pages
export class TypeChangingItem extends Item {
    requiredPokemon: string | undefined;
    constructor(item: LoadedItem, requiredPokemon: string | undefined) {
        super(item);
        this.requiredPokemon = requiredPokemon;
    }

    public canChangeType(pokemon: Pokemon): boolean {
        return this.requiredPokemon === undefined || pokemon.id === this.requiredPokemon;
    }
}
