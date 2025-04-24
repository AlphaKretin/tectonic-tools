import { LoadedAbility } from "../loading/abilities";
import { Ability } from "../types/Ability";
import { Item } from "../types/Item";
import { isNull } from "../util";

type validateItemFunction = (items: Item[]) => boolean;

// assumes max two items
function differentItems(items: Item[]): boolean {
    return items[0].id !== items[1].id;
}

function allFlag(items: Item[], flag: string) {
    return items.every((i) => i.flags.includes(flag));
}

export const twoItemAbilities: Record<string, validateItemFunction> = {
    ALLTHATGLITTERS: (items) => allFlag(items, "TypeGem") && differentItems(items),
    BERRYBUNCH: (items) => allFlag(items, "Berry") && differentItems(items),
    CLUMSYKINESIS: () => true,
    FASHIONABLE: (items) =>
        items.filter((i) => i.flags.includes("Clothing")).length === 1 &&
        items.filter((i) => !i.flags.includes("Clothing")).length === 1 &&
        differentItems(items),
    HERBALIST: (items) => allFlag(items, "Herb") && differentItems(items),
};

export class TwoItemAbility extends Ability {
    private validate: validateItemFunction;
    constructor(ability: LoadedAbility, validate: validateItemFunction) {
        super(ability);
        this.validate = validate;
    }

    public validateItems(items: Item[]): boolean {
        // allow anything if an item remains null, since constraints should only apply if both items are (to be) selected
        if (items.some((i) => isNull(i))) {
            return true;
        }
        return this.validate(items);
    }
}
