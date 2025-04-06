import { Pokemon } from "@/app/data/types/Pokemon";
import Image from "next/image";
import { useEffect, useState } from "react";
import TypeBadge from "../../../components/TypeBadge";
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
    // "Def. Matchups",
    // "Atk. Matchups",
    // "Level Up Moves",
    // "Tutor Moves",
    // "Evolutions",
    // "Encounters",
] as const;
export type Tab = (typeof tabs)[number];

const PokemonModal: React.FC<PokemonModalProps> = ({ pokemon, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const [currentPokemon, setCurrentPokemon] = useState(pokemon);
    const [activeTab, setActiveTab] = useState<Tab>("Info"); // Track active tab

    useEffect(() => {
        if (pokemon) {
            setCurrentPokemon(pokemon); // Update to the new Pokémon
            setIsRendered(true);
            setTimeout(() => setIsVisible(true), 10); // Slight delay to trigger animation
        } else {
            setIsVisible(false);
            setTimeout(() => setIsRendered(false), 300); // Match duration-300 for fade-out
        }
    }, [pokemon]);

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

    return (
        <div
            onClick={handleClose} // Close modal on background click
            className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
            <div
                onClick={(e) => e.stopPropagation()} // Prevent background click from closing modal
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
                    isVisible ? "scale-100" : "scale-95"
                }`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Image
                                src={"/Pokemon/" + currentPokemon.id + ".png"}
                                alt={currentPokemon.name}
                                height="160"
                                width="160"
                                className="w-24 h-24"
                            />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {currentPokemon.dex}: {currentPokemon.name}
                            </h2>
                            <TypeBadge type1={currentPokemon.type1} type2={currentPokemon.type2} />
                        </div>
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
                        <nav className="-mb-px flex space-x-4">
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
                                <p className="text-gray-600 dark:text-gray-300">{currentPokemon.pokedex}</p>
                            </div>
                        </PokemonTab>
                        <PokemonTab tab="Abilities" activeTab={activeTab}>
                            {currentPokemon.abilities.map((a) => (
                                <>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{a.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{a.description}</p>
                                </>
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
                                        <StatRow name="HP" value={currentPokemon.stats.hp}></StatRow>
                                        <StatRow name="Attack" value={currentPokemon.stats.attack}></StatRow>
                                        <StatRow name="Defense" value={currentPokemon.stats.defense}></StatRow>
                                        <StatRow name="Sp. Atk" value={currentPokemon.stats.spatk}></StatRow>
                                        <StatRow name="Sp. Def" value={currentPokemon.stats.spdef}></StatRow>
                                        <StatRow name="Speed" value={currentPokemon.stats.speed}></StatRow>
                                        <StatRow name="Total" value={currentPokemon.BST()}></StatRow>
                                    </tbody>
                                </table>
                            </div>
                        </PokemonTab>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokemonModal;
