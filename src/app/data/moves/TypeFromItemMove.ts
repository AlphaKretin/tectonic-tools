import { LoadedMove } from "../loading/moves";
import { moves } from "../moves";
import { nullType, types } from "../types";
import { Move } from "../types/Move";
import { PartyPokemon } from "../types/PartyPokemon";
import { PokemonType } from "../types/PokemonType";
import { isNull } from "../util";

type MoveTypeFunction = (user: PartyPokemon) => PokemonType | undefined;

// return the item type iff user is holding the relevant item
function typeFromItemType(user: PartyPokemon, typeItem: string): PokemonType | undefined {
    const itemType = user.items.some((i) => i.id === typeItem) ? user.itemType : nullType;
    if (!isNull(itemType)) {
        return itemType;
    }
}

const naturalGiftTypes = {
    CHILANBERRY: "NORMAL",
    CHERIBERRY: "FIRE",
    BLUKBERRY: "FIRE",
    WATMELBERRY: "FIRE",
    OCCABERRY: "FIRE",
    CHESTOBERRY: "WATER",
    NANABBERRY: "WATER",
    DURINBERRY: "WATER",
    PASSHOBERRY: "WATER",
    PECHABERY: "ELECTRIC",
    WEPEARBERRY: "ELECTRIC",
    BELUEBERRY: "ELECTRIC",
    WACANBERRY: "ELECTRIC",
    RAWSTBERRY: "GRASS",
    PINAPBERRY: "GRASS",
    RINDOBERRY: "GRASS",
    LIECHIBERRY: "GRASS",
    ASPEARBERRY: "ICE",
    POMEGBERRY: "ICE",
    YACHEBERRY: "ICE",
    GANLONBERRY: "ICE",
    LEPPABERRY: "FIGHTING",
    KELPSYBERRY: "FIGHTING",
    CHOPLEBERRY: "FIGHTING",
    SALACBERRY: "FIGHTING",
    CADOBERRY: "POISON",
    QUALOTBERRY: "POISON",
    KEBIABERRY: "POISON",
    PETAYABERRY: "POISON",
    PERSIMBERRY: "GROUND",
    HONDEWBERRY: "GROUND",
    SHUCABERRY: "GROUND",
    APICOTBERRY: "GROUND",
    LUMBERRY: "FLYING",
    GREPABERRY: "FLYING",
    COBABERRY: "FLYING",
    LANSATBERRY: "FLYING",
    SITRUSBERRY: "PSYCHIC",
    TAMATOBERRY: "PSYCHIC",
    PAYAPABERRY: "PSYCHIC",
    STARFBERRY: "PSYCHIC",
    FIGYBERRY: "BUG",
    CORNNBERRY: "BUG",
    TANGABERRY: "BUG",
    ENIGMABERRY: "BUG",
    WIKIBERRY: "ROCK",
    MAGOSTBERRY: "ROCK",
    CHARTIBERRY: "ROCK",
    MICLEBERRY: "ROCK",
    MAGOBERRY: "GHOST",
    RABUTABERRY: "GHOST",
    KASIBBERRY: "GHOST",
    CUSTAPBERRY: "GHOST",
    AGUAVBERRY: "DRAGON",
    NOMELBERRY: "DRAGON",
    HABANBERRY: "DRAGON",
    JABOCABERRY: "DRAGON",
    IAPAPABERRY: "DARK",
    SPELONBERRY: "DARK",
    COLBURBERRY: "DARK",
    ROWAPBERRY: "DARK",
    MARANGABERRY: "DARK",
    RAZZBERRY: "STEEL",
    PAMTREBERRY: "STEEL",
    BABIRIBERRY: "STEEL",
    ROSELIBERRY: "FAIRY",
    KEEBERRY: "FAIRY",
};

const technoBlastTypes = {
    DOUSEDRIVE: "WATER",
    SHOCKDRIVE: "ELECTRIC",
    BURNDRIVE: "FIRE",
    CHILLDRIVE: "ICE",
};

function typeFromItemMap(user: PartyPokemon, map: Record<string, string>): PokemonType | undefined {
    for (const item of user.items) {
        if (item.id in map) {
            return types[map[item.id]];
        }
    }
}

function typeFromUser(user: PartyPokemon): PokemonType {
    return user.species.getType1(user.form);
}

export const variableTypeMoves: Record<keyof typeof moves, MoveTypeFunction> = {
    JUDGMENT: (user: PartyPokemon) => typeFromItemType(user, "PRISMATICPLATE"),
    MULTIATTACK: (user: PartyPokemon) => typeFromItemType(user, "MEMORYSET"),
    NATURALGIFT: (user: PartyPokemon) => typeFromItemMap(user, naturalGiftTypes),
    TECHNOBLAST: (user: PartyPokemon) => typeFromItemMap(user, technoBlastTypes),
    REVELATIONDANCE: typeFromUser,
};

export class VariableTypeMove extends Move {
    typeFunction: MoveTypeFunction;
    constructor(move: LoadedMove, typeFunction: MoveTypeFunction) {
        super(move);
        this.typeFunction = typeFunction;
    }
    public getType(user: PartyPokemon): PokemonType {
        return this.typeFunction(user) || this.type;
    }
}
