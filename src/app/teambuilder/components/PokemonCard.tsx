"use client";

import { abilities, nullAbility } from "@/app/data/abilities";
import { items, nullItem } from "@/app/data/items";
import { moves, nullMove } from "@/app/data/moves";
import { nullPokemon, pokemon } from "@/app/data/pokemon";
import { isNull } from "@/app/data/util";
import Dropdown from "@/components/DropDown";
import TypeBadge from "@/components/TypeBadge";
import Image from "next/image";
import { CardData } from "../page";

export default function PokemonCard({ data, update }: { data: CardData; update: (c: CardData) => void }) {
    const currentPokemon = data.pokemon;
    const currentMoves = data.moves;
    const currentAbility = data.ability;
    const currentItem = data.item;

    function updatePokemon(pokemonId: string) {
        if (pokemonId in pokemon) {
            update({ ...data, pokemon: pokemon[pokemonId] });
        } else {
            update({ ...data, pokemon: nullPokemon });
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

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col items-center w-60">
            <Dropdown value={currentPokemon.id} onChange={(e) => updatePokemon(e.target.value)}>
                <option value="">Select Pokémon</option>
                {Object.values(pokemon).map((p) => (
                    <option key={p.id} value={p.id}>
                        {p.name}
                    </option>
                ))}
            </Dropdown>
            {!isNull(currentPokemon) && (
                <div>
                    <div className="text-center flex flex-col items-center">
                        <Image
                            src={currentPokemon.getImage()}
                            alt={currentPokemon.name}
                            height="160"
                            width="160"
                            className="my-2"
                        />
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{currentPokemon.name}</p>
                        <TypeBadge type1={currentPokemon.type1} type2={currentPokemon.type2} />
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
                                        {currentPokemon.allMoves().map((m) => (
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
                            {currentPokemon.abilities.map((a) => (
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
