import { encounters } from "@/app/data/encounters";
import { items } from "@/app/data/items";
import { moves } from "@/app/data/moves";
import { pokemon } from "@/app/data/pokemon";
import { getSignatureAbilities } from "@/app/data/signatures";
import { calcTypeMatchup } from "@/app/data/typeChart";
import { types } from "@/app/data/types";
import { EncounterMap } from "@/app/data/types/Encounter";
import { Pokemon } from "@/app/data/types/Pokemon";
import { negativeMod } from "@/app/data/util";
import TypeBadgeHeader from "@/components/TypeBadgeSingle";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TypeBadge from "../../../components/TypeBadge";
import EncounterDisplay from "./EncounterDisplay";
import EStatRow from "./EStatRow";
import MoveDisplay from "./MoveDisplay";
import PokemonEvolution from "./PokemonEvolution";
import StatRow from "./StatRow";
import TabContent from "./TabContent";
import TypeChartCell from "./TypeChartCell";
import { Ability } from "@/app/data/types/Ability";
import { nullAbility } from "@/app/data/abilities";

interface PokemonModalProps {
    allMons: Record<string, Pokemon>;
    pokemon: Pokemon | null;
    handlePokemonClick: (pokemon: Pokemon | null) => void;
}

const tabs = [
    "Info",
    "Abilities",
    "Stats",
    "Def. Matchups",
    "Atk. Matchups",
    "Level Moves",
    "Tutor Moves",
    "Evolutions",
    "Encounters",
] as const;
export type PokemonTabName = (typeof tabs)[number];

const PokemonModal: React.FC<PokemonModalProps> = ({ allMons, pokemon: mon, handlePokemonClick }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const [currentPokemon, setCurrentPokemon] = useState(mon);
    const [selectedDefAbility, setSelectedDefAbility] = useState<Ability>(currentPokemon?.abilities[0] ?? nullAbility);
    const [selectedStabAbility, setSelectedStabAbility] = useState<Ability>(
        currentPokemon?.abilities[0] ?? nullAbility
    );
    const [activeTab, setActiveTab] = useState<PokemonTabName>("Info");
    const [currentForm, setCurrentForm] = useState<number>(0);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mon) {
            setCurrentPokemon(mon);
            setCurrentForm(0);
            setSelectedDefAbility(mon.abilities[0]);
            setSelectedStabAbility(mon.abilities[0]);
            setIsRendered(true);
            setTimeout(() => {
                setIsVisible(true);
                if (modalRef.current) {
                    modalRef.current.scrollTop = 0;
                }
            }, 10);
        } else {
            setIsVisible(false);
            setTimeout(() => setIsRendered(false), 300);
        }
    }, [mon]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsRendered(false);
            handlePokemonClick(null);
        }, 300);
    };

    const handleTabChange = (tab: PokemonTabName) => {
        setActiveTab(tab);
    };

    if (!isRendered || !currentPokemon) return null;

    const currentEncounters = Object.values(encounters).filter((e) =>
        Object.values(e.tables).some((t) => t.encounters.some((enc) => enc.pokemon === currentPokemon.id))
    );

    const prevoEncounters: Record<string, EncounterMap[]> = {};
    currentPokemon.getEvoNode().callParents((node) => {
        const currentSpecies = pokemon[node.getData().pokemon];
        const newEncounters = Object.values(encounters).filter((e) =>
            Object.values(e.tables).some((t) => t.encounters.some((enc) => enc.pokemon === currentSpecies.id))
        );
        if (newEncounters.length > 0) {
            prevoEncounters[node.getData().pokemon] = newEncounters;
        }
    });

    const stats = currentPokemon.getStats(currentForm);
    const realTypes = Object.values(types).filter((t) => t.isRealType);
    const realTypesSlices = [realTypes.slice(0, realTypes.length / 2), realTypes.slice(realTypes.length / 2)];

    const defMatchupCalcs: Record<string, Record<string, number>> = {};
    const stabMatchupCalcs: Record<string, Record<string, number>> = {};
    let defMatchupDifferentForAbilities = false;
    let stabMatchupDifferentForAbilities = false;
    currentPokemon.abilities.forEach((a) => {
        const firstDefAbilityChart = Object.values(defMatchupCalcs).find(() => true);
        const firstStabAbilityChart = Object.values(stabMatchupCalcs).find(() => true);
        defMatchupCalcs[a.id] = {};
        stabMatchupCalcs[a.id] = {};

        realTypes.forEach((t) => {
            defMatchupCalcs[a.id][t.id] = calcTypeMatchup(
                { type: t },
                {
                    type1: currentPokemon.getType1(currentForm),
                    type2: currentPokemon.getType2(currentForm),
                    ability: a,
                }
            );

            stabMatchupCalcs[a.id][t.id] = Math.max(
                calcTypeMatchup({ type: currentPokemon.getType1(currentForm), ability: a }, { type1: t }),
                calcTypeMatchup(
                    {
                        type: currentPokemon.getType2(currentForm) || currentPokemon.getType1(currentForm),
                        ability: a,
                    },
                    { type1: t }
                )
            );

            defMatchupDifferentForAbilities ||=
                firstDefAbilityChart != null && defMatchupCalcs[a.id][t.id] != firstDefAbilityChart[t.id];
            stabMatchupDifferentForAbilities ||=
                firstStabAbilityChart != null && stabMatchupCalcs[a.id][t.id] != firstStabAbilityChart[t.id];
        });
    });

    return (
        <div
            onClick={handleClose}
            className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] min-h-[70vh] overflow-y-auto transform transition-transform duration-300 ${
                    isVisible ? "scale-100" : "scale-95"
                }`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Image
                                src={currentPokemon.getImage(currentForm)}
                                alt={currentPokemon.name}
                                height="160"
                                width="160"
                                className="w-24 h-24"
                            />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {currentPokemon.dex}: {currentPokemon.name}{" "}
                                {currentPokemon.getFormName(currentForm) &&
                                    "(" + currentPokemon.getFormName(currentForm) + ")"}
                            </h2>
                            <TypeBadge
                                type1={currentPokemon.getType1(currentForm)}
                                type2={currentPokemon.getType2(currentForm)}
                            />
                        </div>
                        {currentPokemon.forms.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() =>
                                        setCurrentForm(negativeMod(currentForm - 1, currentPokemon.forms.length))
                                    }
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentForm((currentForm + 1) % currentPokemon.forms.length)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
                        <nav
                            className="-mb-px flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                            onWheel={(e) => {
                                const target = e.currentTarget;
                                target.scrollLeft += e.deltaY;
                            }}
                        >
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`px-4 py-2 text-sm font-medium ${
                                        activeTab === tab
                                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        <TabContent tab="Info" activeTab={activeTab}>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                    {currentPokemon.kind} Pokémon
                                </h3>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mt-4">Tribes</h3>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                    {currentPokemon.tribes.map((tribe, index) => (
                                        <li key={index}>{tribe.name}</li>
                                    ))}
                                </ul>
                                <br />
                                <p className="text-gray-600 dark:text-gray-300">
                                    {currentPokemon.getPokedex(currentForm)}
                                </p>
                            </div>
                        </TabContent>
                        <TabContent tab="Abilities" activeTab={activeTab}>
                            {currentPokemon.getAbilities(currentForm).map((a) => (
                                <div key={a.id}>
                                    <h3
                                        className={`font-semibold ${
                                            a.id in getSignatureAbilities()
                                                ? "text-yellow-500"
                                                : "text-gray-800 dark:text-gray-100"
                                        }`}
                                    >
                                        {a.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">{a.description}</p>
                                </div>
                            ))}
                        </TabContent>
                        <TabContent tab="Stats" activeTab={activeTab}>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Stats</h3>
                                <table className="table-auto w-full mt-4 inline-block text-center align-middle border-collapse">
                                    <tbody>
                                        <StatRow name="HP" value={stats.hp} scale={1} />
                                        <StatRow name="Attack" value={stats.attack} scale={1} />
                                        <StatRow name="Defense" value={stats.defense} scale={1} />
                                        <EStatRow name="PEHP" pokemon={currentPokemon} form={currentForm} />
                                        <StatRow name="Sp. Atk" value={stats.spatk} scale={1} />
                                        <StatRow name="Sp. Def" value={stats.spdef} scale={1} />
                                        <EStatRow name="SEHP" pokemon={currentPokemon} form={currentForm} />
                                        <StatRow name="Speed" value={stats.speed} scale={1} />
                                        <StatRow name="Total" value={currentPokemon.BST(currentForm)} scale={6} />
                                    </tbody>
                                </table>
                            </div>
                        </TabContent>
                        <TabContent tab="Def. Matchups" activeTab={activeTab}>
                            <div>
                                <div>
                                    <h3 className="inline font-semibold text-gray-800 dark:text-gray-100">
                                        Defensive Matchups{defMatchupDifferentForAbilities ? " with:" : ""}
                                    </h3>
                                    {!defMatchupDifferentForAbilities ? (
                                        <></>
                                    ) : (
                                        <button
                                            className="bg-blue-500 text-white w-36 ml-2 px-2 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                            onClick={() =>
                                                setSelectedDefAbility(
                                                    currentPokemon.abilities.find((a) => a != selectedDefAbility) ??
                                                        selectedDefAbility
                                                )
                                            }
                                        >
                                            {selectedDefAbility.name}
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-x-auto mt-4">
                                    {realTypesSlices.map((slice, index) => (
                                        <table key={index} className="table-fixed w-[99%] mx-auto mb-5">
                                            <thead>
                                                <tr>
                                                    {slice.map((t) => (
                                                        <TypeBadgeHeader key={t.id} type={t} useShort={false} />
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {slice.map((t) => {
                                                        return (
                                                            <TypeChartCell
                                                                key={t.id}
                                                                mult={defMatchupCalcs[selectedDefAbility.id][t.id]}
                                                            />
                                                        );
                                                    })}
                                                </tr>
                                            </tbody>
                                        </table>
                                    ))}
                                </div>
                            </div>
                        </TabContent>
                        <TabContent tab="Atk. Matchups" activeTab={activeTab}>
                            <div>
                                <h3 className="inline font-semibold text-gray-800 dark:text-gray-100">
                                    STAB Offensive Matchups{stabMatchupDifferentForAbilities ? " with:" : ""}
                                </h3>
                                {!stabMatchupDifferentForAbilities ? (
                                    <></>
                                ) : (
                                    <button
                                        className="bg-blue-500 text-white w-36 ml-2 px-2 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                        onClick={() =>
                                            setSelectedStabAbility(
                                                currentPokemon.abilities.find((a) => a != selectedStabAbility) ??
                                                    selectedStabAbility
                                            )
                                        }
                                    >
                                        {selectedStabAbility.name}
                                    </button>
                                )}
                                <div className="overflow-x-auto mt-4">
                                    {realTypesSlices.map((slice, index) => (
                                        <table key={index} className="table-fixed w-[99%] mx-auto mb-5">
                                            <thead>
                                                <tr>
                                                    {slice.map((t) => (
                                                        <TypeBadgeHeader key={t.id} type={t} useShort={false} />
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {slice.map((t) => {
                                                        return (
                                                            <TypeChartCell
                                                                key={t.id}
                                                                mult={stabMatchupCalcs[selectedStabAbility.id][t.id]}
                                                            />
                                                        );
                                                    })}
                                                </tr>
                                            </tbody>
                                        </table>
                                    ))}
                                </div>
                            </div>
                        </TabContent>
                        <TabContent tab="Level Moves" activeTab={activeTab}>
                            <MoveDisplay pokemon={currentPokemon} form={currentForm} moveKey="level" />
                        </TabContent>
                        <TabContent tab="Tutor Moves" activeTab={activeTab}>
                            <MoveDisplay pokemon={currentPokemon} form={currentForm} moveKey="tutor" />
                        </TabContent>
                        <TabContent tab="Evolutions" activeTab={activeTab}>
                            <div>
                                <div className="mt-4">
                                    {currentPokemon.evolutionTree.isLeaf() ? (
                                        <p className="text-gray-600 dark:text-gray-300">Does not evolve.</p>
                                    ) : (
                                        <div className="w-fit mx-auto">
                                            {currentPokemon.evolutionTree.asBranches().map((branch, index) => (
                                                <div
                                                    key={index}
                                                    className="flex"
                                                    style={{ justifyContent: "space-around", alignItems: "center" }}
                                                >
                                                    {branch.map((node, index) => (
                                                        <PokemonEvolution
                                                            key={index}
                                                            pokemon={allMons}
                                                            moves={moves}
                                                            items={items}
                                                            node={node}
                                                            index={index}
                                                            onClick={handlePokemonClick}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabContent>
                        <TabContent tab={"Encounters"} activeTab={activeTab}>
                            <EncounterDisplay encounters={currentEncounters} pokemon={currentPokemon} />
                            {Object.entries(prevoEncounters).map(([prevo, encs]) => (
                                <div key={prevo}>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                        Previous Evolution - {pokemon[prevo].name}
                                    </h4>
                                    <EncounterDisplay encounters={encs} pokemon={pokemon[prevo]} />
                                </div>
                            ))}
                        </TabContent>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokemonModal;
