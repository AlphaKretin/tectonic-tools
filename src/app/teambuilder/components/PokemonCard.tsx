"use client";

import { abilities, nullAbility } from "@/app/data/abilities";
import { items, nullItem } from "@/app/data/items";
import { moves, nullMove } from "@/app/data/moves";
import { nullPokemon, pokemon } from "@/app/data/pokemon";
import { isNull, negativeMod } from "@/app/data/util";
import Dropdown from "@/components/DropDown";
import TypeBadge from "@/components/TypeBadge";
import Image from "next/image";
import { CardData } from "../page";

export default function PokemonCard({ data, update }: { data: CardData; update: (c: CardData) => void }) {
    const currentPokemon = data.pokemon;
    const currentMoves = data.moves;
    const currentAbility = data.ability;
    const currentItem = data.item;
    const currentForm = data.form;

    // wipe pokemon-dependent data when switching pokemon
    function updatePokemon(pokemonId: string) {
        if (pokemonId in pokemon) {
            update({
                ...data,
                pokemon: pokemon[pokemonId],
                form: 0,
                moves: Array(4).fill(nullMove),
                ability: nullAbility,
            });
        } else {
            update({ ...data, pokemon: nullPokemon, form: 0, moves: Array(4).fill(nullMove), ability: nullAbility });
        }
    }

    function updateMoves(moveId: string, moveIndex: number) {
        const newMoves = [...currentMoves];
        if (moveId in moves) {
            newMoves[moveIndex] = moves[moveId];
        } else {
            newMoves[moveIndex] = nullMove;
        }

        update({ ...data, moves: newMoves });
    }

    function updateAbility(abilityId: string) {
        if (abilityId in abilities) {
            update({
                ...data,
                ability: abilities[abilityId],
            });
        } else {
            update({
                ...data,
                ability: nullAbility,
            });
        }
    }

    function updateItem(itemId: string) {
        if (itemId in items) {
            update({ ...data, item: items[itemId] });
        } else {
            update({ ...data, item: nullItem });
        }
    }

    function updateForm(form: number) {
        update({ ...data, form });
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col items-center w-60">
            <div className="text-center flex flex-row items-center">
                {currentPokemon.forms.length > 1 && (
                    <button
                        onClick={() => updateForm(negativeMod(currentForm - 1, currentPokemon.forms.length))}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                <Dropdown value={currentPokemon.id} onChange={(e) => updatePokemon(e.target.value)}>
                    <option value="">Select Pokémon</option>
                    {Object.values(pokemon).map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </Dropdown>
                {currentPokemon.forms.length > 1 && (
                    <button
                        onClick={() => updateForm((currentForm + 1) % currentPokemon.forms.length)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
            {!isNull(currentPokemon) && (
                <div>
                    <div className="text-center flex flex-col items-center">
                        {currentPokemon.forms.length > 0 && <div className="flex items-center space-x-2"></div>}
                        <Image
                            src={currentPokemon.getImage(currentForm)}
                            alt={currentPokemon.name}
                            height="160"
                            width="160"
                            className="my-2"
                        />
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {currentPokemon.name +
                                (currentPokemon.getFormName(currentForm)
                                    ? " " + currentPokemon.getFormName(currentForm)
                                    : "")}
                        </p>
                        <TypeBadge
                            type1={currentPokemon.getType1(currentForm)}
                            type2={currentPokemon.getType2(currentForm)}
                        />
                    </div>
                    <div className="w-full mt-4 text-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Moves</h3>
                        {Array.from({ length: 4 }).map((_, moveIndex) => (
                            <div key={moveIndex} className="flex items-center space-x-2">
                                <div className="flex-1">
                                    <Dropdown
                                        onChange={(e) => {
                                            updateMoves(e.target.value, moveIndex);
                                        }}
                                        value={currentMoves[moveIndex].id}
                                    >
                                        <option value="">Select Move {moveIndex + 1}</option>
                                        {currentPokemon.allMoves(currentForm).map((m) => (
                                            <option
                                                key={m.id}
                                                value={m.id}
                                                className={m.isSTAB(currentPokemon) ? "font-semibold" : ""}
                                            >
                                                {m.name}
                                            </option>
                                        ))}
                                    </Dropdown>
                                </div>
                                <div className="w-12 flex justify-center">
                                    {currentMoves[moveIndex].isAttackingMove() && (
                                        <TypeBadge type1={currentMoves[moveIndex].type} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="w-full mt-4 text-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Ability</h3>
                        <Dropdown value={currentAbility.id} onChange={(e) => updateAbility(e.target.value)}>
                            <option value="">Select Ability</option>
                            {currentPokemon.getAbilities(currentForm).map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </Dropdown>
                    </div>
                    <div className="w-full mt-4 text-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Held Item</h3>
                        <Dropdown value={currentItem.id} onChange={(e) => updateItem(e.target.value)}>
                            <option value="">Select Item</option>
                            {Object.values(items).map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.name}
                                </option>
                            ))}
                        </Dropdown>
                    </div>
                    <div className="w-full mt-4 text-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Tribes</h3>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                            {currentPokemon.tribes.map((tribe, index) => (
                                <li key={index}>{tribe}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
