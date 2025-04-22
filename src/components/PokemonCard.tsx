"use client";

import { abilities, nullAbility } from "@/app/data/abilities";
import { TwoItemAbility } from "@/app/data/abilities/TwoItemAbility";
import { items, nullItem } from "@/app/data/items";
import { TypeChangingItem } from "@/app/data/items/TypeChangingItem";
import { moves, nullMove } from "@/app/data/moves";
import { nullPokemon, pokemon } from "@/app/data/pokemon";
import { getSignatureAbilities, getSignatureMoves } from "@/app/data/signatures";
import { StatusEffect, statusEffects, VolatileStatusEffect, volatileStatusEffects } from "@/app/data/statusEffects";
import {
    MAX_LEVEL,
    MAX_SP,
    MAX_STEP,
    MIN_LEVEL,
    MIN_SP,
    MIN_STEP,
    STYLE_POINT_CAP,
    styleFromStat,
} from "@/app/data/teamExport";
import { nullType, types } from "@/app/data/types";
import { Ability } from "@/app/data/types/Ability";
import { Item } from "@/app/data/types/Item";
import { PartyPokemon } from "@/app/data/types/PartyPokemon";
import { Pokemon, Stat, StylePoints } from "@/app/data/types/Pokemon";
import { isNull, negativeMod, safeKeys } from "@/app/data/util";
import Dropdown from "@/components/DropDown";
import TypeBadge from "@/components/TypeBadge";
import Image from "next/image";
import Collapsible from "./Collapsible";

function legalItems(currentItems: Item[], ability: Ability, index: number): Item[] {
    // TODO: Add a non-magic map of pockets somewhere
    const heldItems = Object.values(items).filter((i) => i.pocket === 5);
    // only allow selecting items that maintain the legality constraint
    if (ability instanceof TwoItemAbility) {
        return heldItems.filter((i) => {
            const newItems = [...currentItems];
            newItems[index] = i;
            return ability.validateItems(newItems);
        });
    }
    return heldItems;
}

export default function PokemonCard({
    pokemonList,
    data,
    update,
    battle,
}: {
    pokemonList: Pokemon[];
    data: PartyPokemon;
    update: (c: Partial<PartyPokemon>) => void;
    battle: boolean;
}) {
    // wipe pokemon-dependent data when switching pokemon
    function updatePokemon(pokemonId: string) {
        if (pokemonId in pokemon) {
            update({
                species: pokemon[pokemonId],
                form: 0,
                moves: Array(4).fill(nullMove),
                ability: nullAbility,
            });
        } else {
            update({ species: nullPokemon, form: 0, moves: Array(4).fill(nullMove), ability: nullAbility });
        }
    }

    function updateMoves(moveId: string, moveIndex: number) {
        const newMoves = [...data.moves];
        if (moveId in moves) {
            newMoves[moveIndex] = moves[moveId];
        } else {
            newMoves[moveIndex] = nullMove;
        }

        update({ moves: newMoves });
    }

    function updateAbility(abilityId: string) {
        if (abilityId in abilities) {
            update({
                ability: abilities[abilityId],
            });
        } else {
            update({
                ability: nullAbility,
            });
        }
    }

    function updateStatus(status: StatusEffect) {
        update({ statusEffect: status });
    }

    function updateVolatileStatusEffect(status: VolatileStatusEffect, checked: boolean) {
        const newVse = { ...data.volatileStatusEffects, [status]: checked };
        update({ volatileStatusEffects: newVse });
    }

    function updateItem(itemId: string, index: number) {
        const newItems = [...data.items];
        newItems[index] = items[itemId] || nullItem;
        update({ items: newItems });
    }

    function updateItemType(typeId: string) {
        const newType = types[typeId] || nullType;
        update({ itemType: newType });
    }

    function updateForm(form: number) {
        update({ form });
    }

    function updateLevel(level: number) {
        level = Math.max(level, MIN_LEVEL);
        level = Math.min(level, MAX_LEVEL);
        update({ level });
    }

    function updateSP(stat: keyof StylePoints, value: number) {
        value = Math.max(value, MIN_SP);
        value = Math.min(value, MAX_SP);
        const newSP = { ...data.stylePoints, [stat]: value };
        const spSum = Object.values(newSP).reduce((total, sp) => total + sp, 0);
        if (spSum > STYLE_POINT_CAP) {
            alert("You can only have a maximum of 50 total style points!");
            return;
        }
        update({ stylePoints: newSP });
    }

    function updateStatSteps(stat: Stat, value: number) {
        value = Math.max(value, MIN_STEP);
        value = Math.min(value, MAX_STEP);
        const newSteps = { ...data.statSteps, [stat]: value };
        update({ statSteps: newSteps });
    }

    const realTypes = Object.values(types).filter((t) => t.isRealType);

    return (
        <>
            <div className="text-center flex flex-row items-center">
                {data.species.forms.length > 1 && (
                    <button
                        onClick={() => updateForm(negativeMod(data.form - 1, data.species.forms.length))}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                <Dropdown value={data.species.id} onChange={(e) => updatePokemon(e.target.value)}>
                    <option value="">Select Pokémon</option>
                    {pokemonList.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </Dropdown>
                {data.species.forms.length > 1 && (
                    <button
                        onClick={() => updateForm((data.form + 1) % data.species.forms.length)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
            {!isNull(data.species) && (
                <div>
                    <div className="text-center flex flex-col items-center">
                        {data.species.forms.length > 0 && <div className="flex items-center space-x-2"></div>}
                        <Image
                            src={data.species.getImage(data.form)}
                            alt={data.species.name}
                            height="160"
                            width="160"
                            className="my-2"
                        />
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {data.species.name +
                                (data.species.getFormName(data.form) ? " " + data.species.getFormName(data.form) : "")}
                        </p>
                        <TypeBadge type1={data.types.type1} type2={data.types.type2} />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Level</h3>
                        <input
                            type="number"
                            min={MIN_LEVEL}
                            max={MAX_LEVEL}
                            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                            value={data.level}
                            onChange={(e) => updateLevel(parseInt(e.target.value))}
                        />
                    </div>
                    <Collapsible title="Moves">
                        {Array.from({ length: 4 }).map((_, moveIndex) => (
                            <div key={moveIndex} className="flex items-center space-x-2">
                                <div className="flex-1">
                                    <Dropdown
                                        onChange={(e) => {
                                            updateMoves(e.target.value, moveIndex);
                                        }}
                                        value={data.moves[moveIndex].id}
                                    >
                                        <option value="">Select Move {moveIndex + 1}</option>
                                        {data.species.allMoves(data.form).map((m) => (
                                            <option
                                                key={m.id}
                                                value={m.id}
                                                className={
                                                    m.id in getSignatureMoves()
                                                        ? "font-semibold text-yellow-500"
                                                        : m.isSTAB(data.species)
                                                        ? "font-semibold"
                                                        : ""
                                                }
                                            >
                                                {m.name}
                                            </option>
                                        ))}
                                    </Dropdown>
                                </div>
                                <div className="w-12 flex justify-center">
                                    {data.moves[moveIndex].isAttackingMove() && (
                                        <TypeBadge type1={data.moves[moveIndex].getType(data)} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </Collapsible>
                    <div className="w-full mt-4 text-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Ability</h3>
                        <Dropdown value={data.ability.id} onChange={(e) => updateAbility(e.target.value)}>
                            <option value="">Select Ability</option>
                            {data.species.getAbilities(data.form).map((a) => (
                                <option
                                    key={a.id}
                                    value={a.id}
                                    className={a.id in getSignatureAbilities() ? "font-semibold text-yellow-500" : ""}
                                >
                                    {a.name}
                                </option>
                            ))}
                        </Dropdown>
                    </div>
                    {battle && (
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Status Effect</h3>
                            <Dropdown
                                value={data.statusEffect}
                                onChange={(e) => updateStatus(e.target.value as StatusEffect)}
                            >
                                <option value="None" className="bg-gray-800">
                                    None
                                </option>
                                {Object.values(statusEffects).map((s) => (
                                    <option key={s} value={s} className="bg-gray-800">
                                        {s}
                                    </option>
                                ))}
                            </Dropdown>
                            <div className="mt-2">
                                <Collapsible title="Volatile Status Effects">
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {volatileStatusEffects.map((effect) => (
                                            <label key={effect} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={data.volatileStatusEffects[effect]}
                                                    onChange={(e) =>
                                                        updateVolatileStatusEffect(effect, e.target.checked)
                                                    }
                                                    className="form-checkbox text-blue-600"
                                                />
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    {effect}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </Collapsible>
                            </div>
                        </div>
                    )}
                    <div className="w-full mt-4 text-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Held Item</h3>
                        <div>
                            {Array.from({ length: 2 }).map(
                                (_, i) =>
                                    // only display second item if ability enables it
                                    (i === 0 || data.ability instanceof TwoItemAbility) && (
                                        <div key={i}>
                                            <div className="flex items-center space-x-2">
                                                <Dropdown
                                                    value={data.items[i].id}
                                                    onChange={(e) => updateItem(e.target.value, i)}
                                                >
                                                    <option value="">Select Item</option>
                                                    {legalItems(data.items, data.ability, i).map((i) => (
                                                        <option key={i.id} value={i.id}>
                                                            {i.name}
                                                        </option>
                                                    ))}
                                                </Dropdown>
                                                <div className="w-12 flex justify-center">
                                                    {!isNull(data.items[i]) && (
                                                        <Image
                                                            alt={data.items[i].name}
                                                            src={data.items[i].getImage()}
                                                            width={50}
                                                            height={50}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                            )}
                            {data.items.some((i) => i instanceof TypeChangingItem && i.canChangeType(data)) && (
                                <div className="flex items-center space-x-2">
                                    <Dropdown
                                        value={data.itemType.id}
                                        onChange={(e) => {
                                            updateItemType(e.target.value);
                                        }}
                                    >
                                        <option value="" className="bg-gray-800">
                                            Select Type
                                        </option>
                                        {realTypes.map((t) => (
                                            <option key={t.id} value={t.id} className="bg-gray-800">
                                                {t.name}
                                            </option>
                                        ))}
                                    </Dropdown>
                                    {!isNull(data.itemType) && <TypeBadge type1={data.itemType} />}
                                </div>
                            )}
                        </div>
                    </div>
                    <Collapsible title="Stats">
                        <table>
                            <thead>
                                <tr>
                                    <th>Stat</th>
                                    <th>Value</th>
                                    <th>SP</th>
                                    {battle && <th>Steps</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {safeKeys(data.species.getStats(data.form)).map((statName) => {
                                    const styleName = styleFromStat(statName);
                                    return (
                                        <tr key={statName}>
                                            <td className="text-gray-300 w-16 text-right">{statName.toUpperCase()}</td>
                                            <td className="text-gray-400 w-12 text-center">{data.stats[statName]}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min={MIN_SP}
                                                    max={MAX_SP}
                                                    className="w-16 px-2 py-1 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                                                    value={data.stylePoints[styleName]}
                                                    onChange={(e) => updateSP(styleName, parseInt(e.target.value))}
                                                />
                                            </td>
                                            {battle && (
                                                <td>
                                                    <input
                                                        type="number"
                                                        min={MIN_STEP}
                                                        max={MAX_STEP}
                                                        className="w-16 px-2 py-1 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                                                        value={data.statSteps[statName]}
                                                        onChange={(e) =>
                                                            updateStatSteps(statName, parseInt(e.target.value))
                                                        }
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Collapsible>
                    <div className="w-full mt-4 text-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Tribes</h3>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                            {data.species.tribes.map((tribe, index) => (
                                <li key={index}>{tribe.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}
