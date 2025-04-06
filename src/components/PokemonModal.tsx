import { Pokemon } from "@/app/data/types/Pokemon";
import { useEffect, useState } from "react";
import TypeBadge from "./TypeBadge";

interface PokemonModalProps {
    pokemon: Pokemon | null;
    onClose: () => void;
}

const PokemonModal: React.FC<PokemonModalProps> = ({ pokemon, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const [currentPokemon, setCurrentPokemon] = useState(pokemon);
    const [activeTab, setActiveTab] = useState<Tab>("Stats"); // Track active tab

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

    const tabs = ["Stats", "Abilities", "Moves"] as const;
    type Tab = (typeof tabs)[number];

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
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                #{currentPokemon.dex}: {currentPokemon.name}
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
                        {activeTab === "Stats" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">HP</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{currentPokemon.stats.hp}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Attack</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{currentPokemon.stats.attack}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Defense</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{currentPokemon.stats.defense}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Speed</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{currentPokemon.stats.speed}</p>
                                </div>
                            </div>
                        )}
                        {activeTab === "Abilities" && (
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Abilities</h3>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                    {/* {currentPokemon.abilities.map((ability, index) => (
                                        <li key={index}>{ability}</li>
                                    ))} */}
                                </ul>
                            </div>
                        )}
                        {activeTab === "Moves" && (
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Moves</h3>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                    {currentPokemon.moves.map((move, index) => (
                                        <li key={index}>{move.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokemonModal;
