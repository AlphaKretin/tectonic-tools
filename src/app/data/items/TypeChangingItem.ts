import { LoadedItem } from "../loading/items";
import { Item } from "../types/Item";
import { PartyPokemon } from "../types/PartyPokemon";

export const typeChangingItems: Record<string, [string, string] | undefined> = {
    CRYSTALVEIL: undefined,
    PRISMATICPLATE: ["ARCEUS", "MULTITYPE"],
    MEMORYSET: ["SILVALLY", "RKSSYSTEM"],
};

// type is stored in state of relevant pages
export class TypeChangingItem extends Item {
    requiredPokemon: [string, string] | undefined;
    constructor(item: LoadedItem, requiredPokemon: [string, string] | undefined) {
        super(item);
        this.requiredPokemon = requiredPokemon;
    }

    public canChangeType(pokemon: PartyPokemon): boolean {
        return (
            this.requiredPokemon === undefined ||
            (pokemon.species.id === this.requiredPokemon[0] && pokemon.ability.id === this.requiredPokemon[1])
        );
    }
}
