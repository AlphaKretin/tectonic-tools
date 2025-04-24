import loadedItems from "public/data/items.json";
import { TypeChangingItem, typeChangingItems } from "./items/TypeChangingItem";
import { LoadedItem } from "./loading/items";
import { Item } from "./types/Item";

function loadItem(item: LoadedItem): Item {
    if (item.key in typeChangingItems) {
        return new TypeChangingItem(item, typeChangingItems[item.key]);
    }
    return new Item(item);
}

export const items: Record<string, Item> = Object.fromEntries(
    Object.entries(loadedItems).map(([id, item]) => [id, loadItem(item)])
);

export const nullItem: Item = new Item({
    key: "",
    name: "",
    description: "",
    pocket: 0,
    flags: [],
});
