import { PokemonType, pokemonTypes } from "@/app/data/basicData";
import { encounters } from "@/app/data/encounters";
import { items } from "@/app/data/items";
import { moves } from "@/app/data/moves";
import { pokemon } from "@/app/data/pokemon";
import { typeChart } from "@/app/data/typeChart";
import { EncounterArea } from "@/app/data/types/Encounter";
import { Evolution, Pokemon } from "@/app/data/types/Pokemon";
import Image from "next/image";
import { useEffect, useState } from "react";
import TypeBadge from "../../../components/TypeBadge";
import EncounterDisplay from "./EncounterDisplay";
import MoveDisplay from "./MoveDisplay";
import PokemonTab from "./PokemonTab";
import StatRow from "./StatRow";

interface PokemonModalProps {
    pokemon: Pokemon | null;
    onClose: () => void;
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
export type Tab = (typeof tabs)[number];

function negativeMod(n: number, m: number) {
    return ((n % m) + m) % m;
}

const PokemonModal: React.FC<PokemonModalProps> = ({ pokemon: mon, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const [currentPokemon, setCurrentPokemon] = useState(mon);
    const [activeTab, setActiveTab] = useState<Tab>("Info"); // Track active tab
    const [currentForm, setCurrentForm] = useState<number>(0);

    useEffect(() => {
        if (mon) {
            setCurrentPokemon(mon); // Update to the new Pokémon
            setCurrentForm(0); // reset form index when new Pokemon selected
            setIsRendered(true);
            setTimeout(() => setIsVisible(true), 10); // Slight delay to trigger animation
        } else {
            setIsVisible(false);
            setTimeout(() => setIsRendered(false), 300); // Match duration-300 for fade-out
        }
    }, [mon]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsRendered(false);
            onClose(); // Call the onClose callback after fade-out
        }, 300); // Match duration-300 for fade-out
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
    };

    if (!isRendered || !currentPokemon) return null;

    const defMatchups = Object.fromEntries(
        pokemonTypes.map((t) => {
            const type2 = currentPokemon.getType2(currentForm);
            return [t, typeChart[t][currentPokemon.getType1(currentForm)] * (type2 ? typeChart[t][type2] : 1)];
        })
    );

    const atkMatchups = Object.fromEntries(
        pokemonTypes.map((t) => {
            const type2 = currentPokemon.getType2(currentForm);
            return [t, Math.max(typeChart[currentPokemon.getType1(currentForm)][t], type2 ? typeChart[type2][t] : 0)];
        })
    );

    function prioritiseSort<T>(prio: T) {
        return function (a: T, b: T): number {
            if (a === prio && b !== prio) {
                return -1;
            }
            if (a !== prio && b === prio) {
                return 1;
            }
            return 0;
        };
    }

    function describeEvoMethod(evo: Evolution) {
        switch (evo.method) {
            case "Level":
            case "Ninjask":
                return `at level ${evo.param}`;
            case "LevelMale":
                return `at level ${evo.param} if it's male`;
            case "LevelFemale":
                return `at level ${evo.param} if it's female`;
            case "LevelDay":
                return `at level ${evo.param} during the day`;
            case "LevelNight":
                return `at level ${evo.param} during nighttime`;
            case "LevelRain":
                return `at level ${evo.param} while raining`;
            case "LevelDarkInParty":
                return `at level ${evo.param} while a dark type is in the party`;
            case "AttackGreater":
                return `at level ${evo.param} if it has more attack than defense`;
            case "AtkDefEqual":
                return `at level ${evo.param} if it has attack equal to defense`;
            case "DefenseGreater":
                return `at level ${evo.param} if it has more defense than attack`;
            case "Silcoon":
                return `at level ${evo.param} half of the time`;
            case "Cascoon":
                return `at level ${evo.param} the other half of the time`;
            case "Ability0":
                return `at level ${evo.param} if it has the first of its possible abilities`;
            case "Ability1":
                return `at level ${evo.param} if it has the second of its possible abilities`;
            case "Happiness":
                return "case leveled up while it has high happiness";
            case "MaxHappiness":
                return "case leveled up while it has maximum happiness";
            case "Beauty":
                return "case leveled up while it has maximum beauty";
            case "HasMove":
                return `case leveled up while it knows the move ${moves[evo.param].name}`;
            case "HasMoveType":
                return `case leveled up while it knows a move of the ${evo.param} type`;
            case "Location":
                return "case leveled up near a special location";
            case "Item":
                return `by using a ${items[evo.param].name}`;
            case "ItemMale":
                return `by using a ${items[evo.param].name} if it's male`;
            case "ItemFemale":
                return `by using a ${items[evo.param].name} if it's female`;
            case "Trade":
                return "case traded";
            case "TradeItem":
                return `case traded holding an ${items[evo.param].name}`;
            case "HasInParty":
                return `case leveled up while a ${pokemon[evo.param]} is also in the party`;
            case "Shedinja":
                return "also if you have an empty Poké Ball and party slot";
            case "Originize":
                return `at level ${evo.param} if you spend an Origin Ore`;
            default:
                return "via a method the programmer was too lazy to describe";
        }
    }

    const currentEncounters = Object.values(encounters).filter((e) =>
        Object.values(e.encounters).some((en) => en.some((enc) => enc.pokemon === currentPokemon.id))
    );

    const prevoEncounters: Record<string, EncounterArea[]> = {};
    const prevos = currentPokemon.getPrevos();
    let currentPrevo = prevos.length > 0 ? prevos[0].target : undefined;
    while (currentPrevo !== undefined) {
        const currentSpecies = pokemon[currentPrevo];
        const newEncounters = Object.values(encounters).filter((e) =>
            Object.values(e.encounters).some((en) => en.some((enc) => enc.pokemon === currentSpecies.id))
        );
        if (newEncounters.length > 0) {
            prevoEncounters[currentPrevo] = newEncounters;
        }
        // get prevos recursively
        const newPrevos = currentSpecies.getPrevos();
        currentPrevo = newPrevos.length > 0 ? newPrevos[0].target : undefined;
    }

    const stats = currentPokemon.getStats(currentForm);

    return (
        <div
            onClick={handleClose} // Close modal on background click
            className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
            <div
                onClick={(e) => e.stopPropagation()} // Prevent background click from closing modal
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] min-h-[70vh] overflow-y-auto transform transition-transform duration-300 ${
                    isVisible ? "scale-100" : "scale-95"
                }`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Image
                                src={currentPokemon.getImage()}
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
                        <PokemonTab tab="Info" activeTab={activeTab}>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                    {currentPokemon.kind} Pokémon
                                </h3>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mt-4">Tribes</h3>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                    {currentPokemon.tribes.map((tribe, index) => (
                                        <li key={index}>{tribe}</li>
                                    ))}
                                </ul>
                                <br />
                                <p className="text-gray-600 dark:text-gray-300">
                                    {currentPokemon.getPokedex(currentForm)}
                                </p>
                            </div>
                        </PokemonTab>
                        <PokemonTab tab="Abilities" activeTab={activeTab}>
                            {currentPokemon.getAbilities(currentForm).map((a) => (
                                <div key={a.id}>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{a.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{a.description}</p>
                                </div>
                            ))}
                        </PokemonTab>
                        <PokemonTab tab="Stats" activeTab={activeTab}>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Stats</h3>
                                <table className="table-auto w-full mt-4 border-collapse border border-gray-300 dark:border-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-gray-800 dark:text-gray-100">
                                                Stat
                                            </th>
                                            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-gray-800 dark:text-gray-100">
                                                Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <StatRow name="HP" value={stats.hp}></StatRow>
                                        <StatRow name="Attack" value={stats.attack}></StatRow>
                                        <StatRow name="Defense" value={stats.defense}></StatRow>
                                        <StatRow name="Sp. Atk" value={stats.spatk}></StatRow>
                                        <StatRow name="Sp. Def" value={stats.spdef}></StatRow>
                                        <StatRow name="Speed" value={stats.speed}></StatRow>
                                        <StatRow name="Total" value={currentPokemon.BST(currentForm)}></StatRow>
                                    </tbody>
                                </table>
                            </div>
                        </PokemonTab>
                        <PokemonTab tab="Def. Matchups" activeTab={activeTab}>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Defensive Matchups</h3>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {Object.entries(defMatchups).some(([, value]) => value > 1) && (
                                        <div>
                                            <h4 className="text-red-600 dark:text-red-400 font-semibold">Weak</h4>
                                            <ul className="list-inside text-gray-600 dark:text-gray-300">
                                                {Object.entries(defMatchups)
                                                    .filter(([, value]) => value > 1)
                                                    .sort(([, a], [, b]) => prioritiseSort(4)(a, b)) // Sort 4 to the top
                                                    .map(([type, value]) => (
                                                        <li key={type}>
                                                            <TypeBadge
                                                                type1={type as PokemonType}
                                                                hyper={value === 4}
                                                            />
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                    {Object.entries(defMatchups).some(([, value]) => value > 0 && value < 1) && (
                                        <div>
                                            <h4 className="text-green-600 dark:text-green-400 font-semibold">Resist</h4>
                                            <ul className="list-inside text-gray-600 dark:text-gray-300">
                                                {Object.entries(defMatchups)
                                                    .filter(([, value]) => value > 0 && value < 1)
                                                    .sort(([, a], [, b]) => prioritiseSort(0.25)(a, b)) // Sort 4 to the top
                                                    .map(([type, value]) => (
                                                        <li key={type}>
                                                            <TypeBadge
                                                                type1={type as PokemonType}
                                                                hyper={value === 0.25}
                                                            />
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                    {Object.entries(defMatchups).some(([, value]) => value === 0) && (
                                        <div>
                                            <h4 className="text-gray-600 dark:text-gray-400 font-semibold">Immune</h4>
                                            <ul className="list-inside text-gray-600 dark:text-gray-300">
                                                {Object.entries(defMatchups)
                                                    .filter(([, value]) => value === 0)
                                                    .map(([type]) => (
                                                        <li key={type}>
                                                            <TypeBadge type1={type as PokemonType} />
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </PokemonTab>
                        <PokemonTab tab="Atk. Matchups" activeTab={activeTab}>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Offensive Matchups</h3>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {Object.entries(atkMatchups).some(([, value]) => value > 1) && (
                                        <div>
                                            <h4 className="text-green-600 dark:text-green-400 font-semibold">Super</h4>
                                            <ul className="list-inside text-gray-600 dark:text-gray-300">
                                                {Object.entries(atkMatchups)
                                                    .filter(([, value]) => value > 1)
                                                    .map(([type]) => (
                                                        <li key={type}>
                                                            <TypeBadge type1={type as PokemonType} />
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                    {Object.entries(atkMatchups).some(([, value]) => value > 0 && value < 1) && (
                                        <div>
                                            <h4 className="text-red-600 dark:text-red-400 font-semibold">Not Very</h4>
                                            <ul className="list-inside text-gray-600 dark:text-gray-300">
                                                {Object.entries(atkMatchups)
                                                    .filter(([, value]) => value > 0 && value < 1)
                                                    .map(([type]) => (
                                                        <li key={type}>
                                                            <TypeBadge type1={type as PokemonType} />
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                    {Object.entries(atkMatchups).some(([, value]) => value === 0) && (
                                        <div>
                                            <h4 className="text-gray-600 dark:text-gray-400 font-semibold">
                                                No Effect
                                            </h4>
                                            <ul className="list-inside text-gray-600 dark:text-gray-300">
                                                {Object.entries(atkMatchups)
                                                    .filter(([, value]) => value === 0)
                                                    .map(([type]) => (
                                                        <li key={type}>
                                                            <TypeBadge type1={type as PokemonType} />
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </PokemonTab>
                        <PokemonTab tab="Level Moves" activeTab={activeTab}>
                            <MoveDisplay pokemon={currentPokemon} form={currentForm} moveKey="level" />
                        </PokemonTab>
                        <PokemonTab tab="Tutor Moves" activeTab={activeTab}>
                            <MoveDisplay pokemon={currentPokemon} form={currentForm} moveKey="tutor" />
                        </PokemonTab>
                        <PokemonTab tab="Evolutions" activeTab={activeTab}>
                            <div>
                                <div className="mt-4">
                                    {currentPokemon.getDeepEvos().length > 0 ? (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                                Evolves Into:
                                            </h4>
                                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                                {currentPokemon.getDeepEvos().map((evo, index) => (
                                                    <li key={index}>
                                                        <span className="font-semibold">
                                                            {pokemon[evo.target].name}
                                                        </span>{" "}
                                                        {describeEvoMethod(evo)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">No further evolutions.</p>
                                    )}
                                    {currentPokemon.getPrevos().length > 0 ? (
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                                Evolved From:
                                            </h4>
                                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                                {currentPokemon.getPrevos().map((prevo, index) => (
                                                    <li key={index}>
                                                        <span className="font-semibold">
                                                            {pokemon[prevo.target].name}
                                                        </span>{" "}
                                                        {describeEvoMethod(prevo)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">No previous evolutions.</p>
                                    )}
                                </div>
                            </div>
                        </PokemonTab>
                        <PokemonTab tab={"Encounters"} activeTab={activeTab}>
                            <EncounterDisplay encounters={currentEncounters} pokemon={currentPokemon} />
                            {Object.entries(prevoEncounters).map(([prevo, encs]) => (
                                <div key={prevo}>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                        Previous Evolution - {pokemon[prevo].name}
                                    </h4>
                                    <EncounterDisplay encounters={encs} pokemon={pokemon[prevo]} />
                                </div>
                            ))}
                        </PokemonTab>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokemonModal;
