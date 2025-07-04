"use client";

import { TwoItemAbility } from "@/app/data/abilities/TwoItemAbility";
import { nullState } from "@/app/data/battleState";
import { TypeChangingItem } from "@/app/data/items/TypeChangingItem";
import { MAX_LEVEL, MAX_SP, MIN_LEVEL, MIN_SP, STYLE_POINT_CAP, styleFromStat } from "@/app/data/teamExport";
import { Item } from "@/app/data/tectonic/Item";
import { Move } from "@/app/data/tectonic/Move";
import { Pokemon, StylePoints, zeroStylePoints } from "@/app/data/tectonic/Pokemon";
import { TectonicData } from "@/app/data/tectonic/TectonicData";
import { PartyPokemon } from "@/app/data/types/PartyPokemon";
import { isNull, negativeMod, safeKeys } from "@/app/data/util";
import Image from "next/image";
import { useState } from "react";
import { getTypeColorClass } from "./colours";
import Dropdown from "./DropDown";
import ImageFallback from "./ImageFallback";
import LeftRightCycleButtons from "./LeftRightCycleButtons";
import PokemonModal from "./PokemonModal";
import TribeCapsule from "./TribeCapsule";
import TypeBadge, { TypeBadgeElementEnum } from "./TypeBadge";

export default function PokemonCardHorizontal({
    partyMon,
    onRemove,
    onUpdate,
}: {
    partyMon: PartyPokemon;
    onRemove: () => void;
    onUpdate: () => void;
}) {
    const [modalMon, setModalMon] = useState<Pokemon | null>(null);
    const [moveIndex, setMoveIndex] = useState<number | null>(null);

    function showInfoModal() {
        setMoveIndex(null);
        setModalMon(partyMon.species);
    }

    function showMoveModal(i: number) {
        setMoveIndex(i);
        setModalMon(partyMon.species);
    }

    function onMoveSelected(m: Move) {
        partyMon.moves[moveIndex!] = m;
        onUpdate();
        setMoveIndex(null);
        setModalMon(null);
    }

    function spSum(sp: StylePoints): number {
        return Object.values(sp).reduce((total, x) => total + x, 0);
    }

    function updateSP(stat: keyof StylePoints, value: number) {
        const newSP = { ...partyMon.stylePoints, [stat]: value };
        if (spSum(newSP) <= STYLE_POINT_CAP && value >= MIN_SP && value <= MAX_SP) {
            partyMon.stylePoints = newSP;
            onUpdate();
        }
    }

    return (
        <div className="w-fit h-76 m-1 rounded-lg p-1.5 text-white bg-gray-800 border-white/50 border-1">
            <div className="flex justify-between ml-1">
                <LeftRightCycleButtons
                    buttonsVisible={partyMon.species.forms.length > 0}
                    onPrevClick={() => {
                        partyMon.form = negativeMod(partyMon.form - 1, partyMon.species.forms.length);
                        onUpdate();
                    }}
                    onNextClick={() => {
                        partyMon.form = (partyMon.form + 1) % partyMon.species.forms.length;
                        onUpdate();
                    }}
                >
                    <span onClick={showInfoModal} className="text-xl cursor-pointer">{`${partyMon.species.name} ${
                        partyMon.species.getFormName(partyMon.form)
                            ? `(${partyMon.species.getFormName(partyMon.form)})`
                            : ""
                    }`}</span>
                </LeftRightCycleButtons>
                <div className="flex justify-center space-x-2 text-sm">
                    {partyMon.species.tribes.map((t) => (
                        <TribeCapsule key={t.id} tribe={t} />
                    ))}
                </div>
                <span
                    className="inline text-3xl cursor-pointer text-end -mt-3 mr-0.5 text-white hover:text-yellow-highlight"
                    onClick={onRemove}
                >
                    &#9932;
                </span>
            </div>

            <table className="table-fixed mt-1">
                <tbody>
                    <tr>
                        <td className="cursor-pointer" onClick={showInfoModal}>
                            <div className="flex flex-col space-y-1 w-25 h-46">
                                <Image
                                    alt={partyMon.species.name}
                                    src={partyMon.species.getImage(partyMon.form)}
                                    width={160}
                                    height={160}
                                    className="w-25 h-25"
                                />
                                <TypeBadge
                                    types={[partyMon.types.type1, partyMon.types.type2]}
                                    element={TypeBadgeElementEnum.CAPSULE_STACK}
                                />
                            </div>
                        </td>
                        <td>
                            <div className="flex flex-col justify-center gap-1 ml-2 w-45 h-42 text-sm">
                                <Dropdown
                                    value={partyMon.ability.id}
                                    onChange={(e) => {
                                        partyMon.ability = TectonicData.abilities[e.target.value];
                                        onUpdate();
                                    }}
                                    title={partyMon.ability.description}
                                >
                                    {partyMon.species.getAbilities(partyMon.form).map((a) => (
                                        <option key={a.id} value={a.id} title={a.description}>
                                            {a.name}
                                        </option>
                                    ))}
                                </Dropdown>

                                {Array.from({ length: partyMon.ability instanceof TwoItemAbility ? 2 : 1 }).map(
                                    (_, i) => (
                                        <div key={i}>
                                            <div className="flex items-center space-x-2">
                                                <Dropdown
                                                    value={partyMon.items[i].id}
                                                    onChange={(e) => {
                                                        partyMon.items[i] =
                                                            TectonicData.items[e.target.value] ?? Item.NULL;
                                                        onUpdate();
                                                    }}
                                                    title={partyMon.items[i].description}
                                                >
                                                    <option value="">Select Item</option>
                                                    {partyMon.legalItems(i).map((i) => (
                                                        <option key={i.id} value={i.id} title={i.description}>
                                                            {i.name}
                                                        </option>
                                                    ))}
                                                </Dropdown>
                                                {!isNull(partyMon.items[i]) && (
                                                    <ImageFallback
                                                        alt={partyMon.items[i].name}
                                                        src={partyMon.items[i].image}
                                                        title={partyMon.items[i].description}
                                                        width={48}
                                                        height={48}
                                                        className="w-8 h-8"
                                                    />
                                                )}
                                            </div>
                                            {partyMon.items[i] instanceof TypeChangingItem &&
                                                partyMon.items[i].canChangeType(partyMon) && (
                                                    <div className="flex items-center space-x-2">
                                                        <Dropdown
                                                            value={partyMon.itemType.id}
                                                            onChange={(e) => {
                                                                partyMon.itemType = TectonicData.types[e.target.value];
                                                                onUpdate();
                                                            }}
                                                        >
                                                            {Object.values(TectonicData.types).map((t) => (
                                                                <option key={t.id} value={t.id}>
                                                                    {t.name}
                                                                </option>
                                                            ))}
                                                        </Dropdown>
                                                        <TypeBadge
                                                            types={[partyMon.itemType]}
                                                            element={TypeBadgeElementEnum.ICONS}
                                                        />
                                                    </div>
                                                )}
                                        </div>
                                    )
                                )}
                            </div>
                        </td>
                        <td>
                            <div className="grid grid-rows-4 ml-2 space-y-1 w-40 text-sm">
                                {partyMon.moves.map((m, i) => {
                                    if (m == Move.NULL) {
                                        return (
                                            <div
                                                key={i}
                                                className="flex flex-col justify-center items-center h-10 bg-gray-700 cursor-pointer hover:bg-gray-500"
                                                onClick={() => showMoveModal(i)}
                                            >
                                                <span>+ Add Move </span>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div
                                                key={i}
                                                className={`flex flex-col justify-center items-center h-10 cursor-pointer hover:bg-gray-500 ${getTypeColorClass(
                                                    m.getType(partyMon, nullState),
                                                    "bg",
                                                    "bg"
                                                )}`}
                                                onClick={() => {
                                                    partyMon.moves[i] = Move.NULL;
                                                    onUpdate();
                                                }}
                                                title={m.description}
                                            >
                                                <div className="flex w-full items-center space-x-1.5 ml-2">
                                                    <div className="flex justify-center space-x-1">
                                                        <TypeBadge
                                                            types={[m.getType(partyMon, nullState)]}
                                                            element={TypeBadgeElementEnum.ICONS}
                                                        />
                                                        <ImageFallback
                                                            src={`/move_categories/${m.category}.png`}
                                                            alt={m.category}
                                                            title={m.category}
                                                            height={60}
                                                            width={51}
                                                            className="w-8 h-8"
                                                        />
                                                    </div>
                                                    <span className="overflow-hidden text-ellipsis">{m.name}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="w-full text-center text-white">
                <thead>
                    <tr className="bg-blue-900">
                        <th>Lvl</th>
                        <th>HP</th>
                        <th>Atk</th>
                        <th>Sp. Atk</th>
                        <th>Speed</th>
                        <th>Def</th>
                        <th>Sp. Def</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-gray-900">
                        <td className="w-10">
                            <input
                                type="number"
                                min={MIN_LEVEL}
                                max={MAX_LEVEL}
                                value={partyMon.level}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    partyMon.level = value >= MIN_LEVEL && value <= MAX_LEVEL ? value : partyMon.level;
                                    onUpdate();
                                }}
                            />
                        </td>
                        {safeKeys(partyMon.getBaseStats()).map((k) => (
                            <td key={k} className="w-15">
                                {partyMon.getStats()[k]}
                            </td>
                        ))}
                    </tr>
                    <tr className="bg-emerald-700">
                        <td
                            className="bg-emerald-800 cursor-pointer"
                            onClick={() => {
                                partyMon.stylePoints = zeroStylePoints;
                                onUpdate();
                            }}
                        >
                            SP {STYLE_POINT_CAP - spSum(partyMon.stylePoints)}
                        </td>
                        {safeKeys(partyMon.getBaseStats()).map((k) => (
                            <td key={k}>
                                <input
                                    type="number"
                                    min={MIN_SP}
                                    max={MAX_SP}
                                    value={partyMon.stylePoints[styleFromStat(k)]}
                                    onChange={(e) => updateSP(styleFromStat(k), parseInt(e.target.value))}
                                />
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>

            {modalMon && (
                <PokemonModal
                    pokemon={modalMon}
                    moveSelector={moveIndex != null ? onMoveSelected : null}
                    handlePokemonClick={setModalMon}
                />
            )}
        </div>
    );
}
