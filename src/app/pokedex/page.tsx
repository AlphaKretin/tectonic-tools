"use client";

import { getTypeColorClass } from "@/components/colours";
import FilterOptionButton from "@/components/FilterOptionButton";
import {
    abilityNameFilter,
    allMovesFilter,
    AVAILABLE_FILTERS,
    heldItemFilter,
    PokemonFilterType,
    tribesFilter,
} from "@/components/filters";
import ImageFallback from "@/components/ImageFallback";
import PageHeader, { PageType } from "@/components/PageHeader";
import ArrowUpIcon from "@/components/svg_icons/ArrowUp";
import FilterIcon from "@/components/svg_icons/FilterIcon";
import TypeBadge, { TypeBadgeElementEnum } from "@/components/TypeBadge";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { FilterInput } from "../../components/FilterInput";
import { ExtraTypeAbility } from "../data/abilities/ExtraTypeAbility";
import { TypeImmunityAbility } from "../data/abilities/TypeImmunityAbility";
import { TypeResistAbility } from "../data/abilities/TypeResistAbility";
import { Ability } from "../data/tectonic/Ability";
import { Item } from "../data/tectonic/Item";
import { Move } from "../data/tectonic/Move";
import { Pokemon } from "../data/tectonic/Pokemon";
import { PokemonType } from "../data/tectonic/PokemonType";
import { TectonicData } from "../data/tectonic/TectonicData";
import { Tribe } from "../data/tectonic/Tribe";
import { uniq } from "../data/util";
import PokemonModal from "./components/PokemonModal";
import PokemonTable from "./components/PokemonTable";
import TabContent from "./components/TabContent";
import TableCell from "./components/TableCell";
import TableHeader from "./components/TableHeader";
import TypeChartCell from "./components/TypeChartCell";

export interface PokemonTableProps {
    mons: Pokemon[];
    onRowClick: (pokemon: Pokemon) => void;
}

const tabNames = ["Pokémon", "Moves", "Abilities", "Items", "Tribes", "Type Chart"];

interface FilterableAbility {
    label: string;
    filter: (a: Ability) => boolean;
}
const filterableAbilities: FilterableAbility[][] = [
    [
        { label: "All Weather", filter: (a: Ability) => a.hasAllWeatherSynergy() },
        { label: "Sun", filter: (a: Ability) => a.hasSunSynergy() },
        { label: "Rain", filter: (a: Ability) => a.hasRainSynergy() },
        { label: "Hail", filter: (a: Ability) => a.hasHailSynergy() },
        { label: "Sand", filter: (a: Ability) => a.hasSandSynergy() },
        { label: "Eclipse", filter: (a: Ability) => a.hasEclipseSynergy() },
        { label: "Moonglow", filter: (a: Ability) => a.hasMoonglowSynergy() },
    ],
    [
        { label: "Extra Type", filter: (a: Ability) => a instanceof ExtraTypeAbility },
        { label: "Immunity", filter: (a: Ability) => a instanceof TypeImmunityAbility },
        { label: "Resists", filter: (a: Ability) => a instanceof TypeResistAbility },
    ],
];

const itemMons: Record<string, Array<Pokemon>> = {};
Object.values(TectonicData.pokemon).forEach((x) =>
    x.items.forEach(([i]) => {
        if (!(i.id in itemMons)) {
            itemMons[i.id] = [];
        }

        itemMons[i.id].push(x);
    })
);
const itemDisplayData = Object.values(TectonicData.items)
    .map((i) => {
        return {
            item: i,
            wildMons:
                i.id in itemMons
                    ? uniq(itemMons[i.id]).map((p) => {
                          return {
                              mon: p,
                              chance: p.items.find(([x]) => x == i)?.[1] ?? 0,
                          };
                      })
                    : [],
            moveData: i.isTM && i.move ? TectonicData.moves[i.move] : undefined,
        };
    })
    .filter((i) => i.item.isTM || i.item.isHeldItem || i.wildMons.length > 0);

const Home: NextPage = () => {
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [filters, setFilters] = useState<PokemonFilterType[]>([]);
    const [activeTab, setActiveTab] = useState<string>("Pokémon");
    const [currentFilter, setCurrentFilter] = useState<PokemonFilterType>(AVAILABLE_FILTERS[0]);
    const [itemFilter, setItemFilter] = useState<string | undefined>();
    const [typeChartAtkDualType, setTypeChartAtkDualType] = useState<PokemonType | undefined>();
    const [abilityTableFilter, setAbilityTableFilter] = useState<FilterableAbility>();
    const [scrollY, setScrollY] = useState(0);

    const handleAddFilter = (filter: PokemonFilterType, value: string) => {
        setFilters((prev) => [...prev, { ...filter, value }]);
    };

    const removeFilter = (index: number) => {
        setFilters((prev) => prev.filter((_, i) => i !== index));
    };

    const mons = Object.values(TectonicData.pokemon);
    const filteredPokemon = useMemo(() => {
        const filtered = mons.filter((mon) => {
            return filters.every((filter) => {
                return filter.apply(mon, filter.value);
            });
        });
        return filtered;
    }, [filters, mons]);

    useEffect(() => {
        if (selectedPokemon) {
            document.body.style.overflow = "hidden"; // Disable scrolling
        } else {
            document.body.style.overflow = ""; // Re-enable scrolling
        }
    }, [selectedPokemon]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        handleScroll();

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handlePokemonClick = (pokemon: Pokemon | null) => {
        setSelectedPokemon(pokemon);
    };

    const handleMoveClick = (move: Move) => {
        handleAddFilter(allMovesFilter, move.name.toLowerCase());
        setActiveTab("Pokémon");
    };

    const handleAbilityClick = (ability: Ability) => {
        handleAddFilter(abilityNameFilter, ability.name.toLowerCase());
        setActiveTab("Pokémon");
    };

    const handleItemClick = (item: Item) => {
        handleAddFilter(heldItemFilter, item.name.toLowerCase());
        setActiveTab("Pokémon");
    };

    const handleTribeClick = (tribe: Tribe) => {
        handleAddFilter(tribesFilter, tribe.name.toLowerCase());
        setActiveTab("Pokémon");
    };

    const realTypes = Object.values(TectonicData.types).filter((t) => t.isRealType);
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head>
                <title>Pokémon Tectonic Online Pokédex</title>
                <meta name="description" content="View Pokémon data for the fangame Pokémon Tectonic" />
            </Head>
            <PageHeader currentPage={PageType.Pokedex}></PageHeader>

            <main>
                <div className="flex sm:justify-center mr-2 sticky top-0 bg-gray-900 pt-1 mt-1">
                    {scrollY != 0 ? (
                        <ArrowUpIcon
                            className="w-15 h-10 bg-blue-700 rounded-lg p-1 mx-2 hover:bg-yellow-highlight hover:fill-black cursor-pointer"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        />
                    ) : (
                        <FilterIcon className="w-15 h-10 bg-blue-700 rounded-lg p-1 mx-2 hover:bg-yellow-highlight hover:fill-black cursor-pointer" />
                    )}
                    <span className="flex w-fit sm:justify-center overflow-x-auto pb-3 mb-1 sm:mb-0 text-xl whitespace-nowrap border-white text-white cursor-pointer">
                        {tabNames.map((n) => (
                            <span
                                key={n}
                                onClick={() => setActiveTab(n)}
                                className={`px-2 py-1 hover:text-yellow-highlight border-b-2 ${
                                    n == activeTab ? "" : "border-white/25"
                                }`}
                            >
                                {n}
                            </span>
                        ))}
                    </span>
                </div>
                <TabContent tab="Pokémon" activeTab={activeTab}>
                    <div className="dark:bg-gray-800">
                        <FilterInput
                            currentFilter={currentFilter}
                            filters={filters}
                            onAddFilter={handleAddFilter}
                            removeFilter={removeFilter}
                            setCurrentFilter={setCurrentFilter}
                        />
                        <PokemonTable mons={filteredPokemon} onRowClick={handlePokemonClick} />
                    </div>
                    {selectedPokemon && (
                        <PokemonModal pokemon={selectedPokemon} handlePokemonClick={handlePokemonClick} />
                    )}
                </TabContent>
                <TabContent tab="Moves" activeTab={activeTab}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Category</TableHeader>
                                    <TableHeader>Power</TableHeader>
                                    <TableHeader>Acc</TableHeader>
                                    <TableHeader>PP</TableHeader>
                                    <TableHeader>Effect</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(TectonicData.moves).map((m) => (
                                    <tr
                                        key={m.id}
                                        onClick={() => handleMoveClick(m)}
                                        className={`cursor-pointer ${getTypeColorClass(m.type, "bg", "bg")}`}
                                    >
                                        <TableCell>{m.name}</TableCell>
                                        <td className="text-center text-gray-500 dark:text-gray-400">
                                            <TypeBadge
                                                key={m.type.id}
                                                types={[m.type]}
                                                element={TypeBadgeElementEnum.CAPSULE_SINGLE}
                                            />
                                        </td>
                                        <TableCell>{m.category}</TableCell>
                                        <TableCell>{m.bp}</TableCell>
                                        <TableCell>{m.accuracy}</TableCell>
                                        <TableCell>{m.pp}</TableCell>
                                        <TableCell>{m.description}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabContent>
                <TabContent tab="Abilities" activeTab={activeTab}>
                    <div className="overflow-x-auto dark:bg-gray-800">
                        <div>
                            {filterableAbilities.map((group, index) => (
                                <div key={index} className="flex justify-center space-x-2 my-2">
                                    {group.map((a) => (
                                        <FilterOptionButton
                                            key={a.label}
                                            onClick={() =>
                                                setAbilityTableFilter(abilityTableFilter === a ? undefined : a)
                                            }
                                            isSelected={abilityTableFilter === a}
                                        >
                                            {a.label}
                                        </FilterOptionButton>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-gray-900">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Effect</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(TectonicData.abilities)
                                    .filter((a) => abilityTableFilter?.filter(a) ?? true)
                                    .map((a) => (
                                        <tr
                                            key={a.id}
                                            onClick={() => handleAbilityClick(a)}
                                            className={`hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer`}
                                        >
                                            <TableCell>{a.name}</TableCell>
                                            <TableCell>{a.description}</TableCell>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </TabContent>
                <TabContent tab="Items" activeTab={activeTab}>
                    <div className="flex justify-center space-x-5 pb-2">
                        <FilterOptionButton
                            isSelected={itemFilter == "Held"}
                            padding="px-2 py-1"
                            onClick={() => setItemFilter(itemFilter === "Held" ? undefined : "Held")}
                        >
                            Held
                        </FilterOptionButton>
                        <FilterOptionButton
                            isSelected={itemFilter == "Wild"}
                            padding="px-2 py-1"
                            onClick={() => setItemFilter(itemFilter === "Wild" ? undefined : "Wild")}
                        >
                            Wild
                        </FilterOptionButton>
                    </div>
                    <div className="flex flex-wrap gap-3 mx-2">
                        {itemDisplayData
                            .filter((i) =>
                                itemFilter === "Held"
                                    ? i.item.isHeldItem
                                    : itemFilter == "Wild"
                                    ? i.wildMons.length > 0
                                    : true
                            )
                            .map((i) => (
                                <div
                                    key={i.item.id}
                                    onClick={() => (i.wildMons.length > 0 ? handleItemClick(i.item) : () => {})}
                                    className={`hover:bg-yellow-highlight text-white hover:text-black p-1 w-fit sm:w-75 mx-auto even:bg-gray-600 odd:bg-gray-800 border border-white rounded-2xl ${
                                        i.wildMons.length > 0 ? "cursor-pointer" : ""
                                    }`}
                                >
                                    <div className="flex justify-center">
                                        <ImageFallback alt={i.item.name} src={i.item.image} width={50} height={50} />
                                        <span className="text-lg ml-1 my-auto">
                                            {i.item.name}
                                            <div className="text-sm">{i.item.isHeldItem ? "(Held Item)" : ""}</div>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 text-center whitespace-break-spaces">
                                        {i.wildMons
                                            .map((x) => <div key={x.mon.name}>{`${x.mon.name} - ${x.chance}%`}</div>)
                                            .concat(
                                                <div key={"desc"} className="col-span-full mt-1">
                                                    {i.item.description}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </TabContent>
                <TabContent tab="Tribes" activeTab={activeTab}>
                    <table className="mx-auto">
                        <thead className="bg-blue-700 sticky top-0">
                            <tr>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Effect</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(TectonicData.tribes).map((t) => (
                                <tr
                                    key={t.id}
                                    onClick={() => handleTribeClick(t)}
                                    className={`hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer`}
                                >
                                    <TableCell>{t.name}</TableCell>
                                    <TableCell>{t.description}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TabContent>
                <TabContent tab="Type Chart" activeTab={activeTab}>
                    <table className="mx-auto border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <thead>
                            <tr onClick={() => setTypeChartAtkDualType(undefined)}>
                                {typeChartAtkDualType ? (
                                    <TypeBadge
                                        types={[typeChartAtkDualType]}
                                        element={TypeBadgeElementEnum.TABLE_HEADER}
                                    />
                                ) : (
                                    <th className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                        Def ⇒
                                        <br />
                                        Atk ↴
                                    </th>
                                )}

                                {realTypes.map((def) => (
                                    <TypeBadge key={def.id} element={TypeBadgeElementEnum.TABLE_HEADER} types={[def]} />
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {realTypes.map((atk) => (
                                <tr
                                    key={atk.id}
                                    className={`${getTypeColorClass(atk, "hover:bg")} cursor-pointer`}
                                    onClick={() =>
                                        setTypeChartAtkDualType(typeChartAtkDualType == atk ? undefined : atk)
                                    }
                                >
                                    <TypeBadge element={TypeBadgeElementEnum.TABLE_ROW} types={[atk]} />
                                    {realTypes.map((def) => (
                                        <TypeChartCell
                                            key={def.index}
                                            atk={typeChartAtkDualType ?? atk}
                                            def={def}
                                            def2={typeChartAtkDualType ? atk : undefined}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TabContent>
            </main>
        </div>
    );
};

export default Home;
