import { Ability } from "@/app/data/tectonic/Ability";
import { Pokemon } from "@/app/data/tectonic/Pokemon";
import { TectonicData } from "@/app/data/tectonic/TectonicData";
import { calcTypeMatchup } from "@/app/data/typeChart";
import { negativeMod } from "@/app/data/util";
import AbilityCapsule from "@/components/AbilityCapsule";
import BasicButton from "@/components/BasicButton";
import CloseXButton from "@/components/CloseXButton";
import LeftRightCycleButtons from "@/components/LeftRightCycleButtons";
import TribeCapsule from "@/components/TribeCapsule";
import TypeBadge, { TypeBadgeElementEnum } from "@/components/TypeBadge";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import EncounterDisplay from "./EncounterDisplay";
import EStatRow from "./EStatRow";
import MoveTable from "./MoveTable";
import PokemonEvolution from "./PokemonEvolution";
import StatRow from "./StatRow";
import TabContent from "./TabContent";
import TypeChartCell from "./TypeChartCell";

interface PokemonModalProps {
    pokemon: Pokemon | null;
    handlePokemonClick: (pokemon: Pokemon | null) => void;
}

const tabs = ["Info", "Level Moves", "Tutor Moves"] as const;
export type PokemonTabName = (typeof tabs)[number];

const PokemonModal: React.FC<PokemonModalProps> = ({ pokemon: mon, handlePokemonClick }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const [currentPokemon, setCurrentPokemon] = useState(mon);
    const [selectedDefAbility, setSelectedDefAbility] = useState<Ability>(currentPokemon?.abilities[0] ?? Ability.NULL);
    const [selectedStabAbility, setSelectedStabAbility] = useState<Ability>(
        currentPokemon?.abilities[0] ?? Ability.NULL
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

    const stats = currentPokemon.getStats(currentForm);
    const realTypes = Object.values(TectonicData.types).filter((t) => t.isRealType);
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
                    { type: currentPokemon.getType2(currentForm) || currentPokemon.getType1(currentForm), ability: a },
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
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[75vh] min-h-[75vh] overflow-y-auto transform transition-transform duration-300 ${
                    isVisible ? "scale-100" : "scale-95"
                }`}
            >
                <div className="px-4 py-2.5">
                    <div className="flex justify-between">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {currentPokemon.dex}: {currentPokemon.name}{" "}
                            {currentPokemon.getFormName(currentForm) &&
                                "(" + currentPokemon.getFormName(currentForm) + ") "}
                            - {currentPokemon.kind} Pokémon
                        </h3>
                        <CloseXButton onClick={handleClose} />
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center space-x-4 border-b border-gray-200 dark:border-gray-700">
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
                    </div>

                    {/* Tab Content */}
                    <div className="mt-2">
                        <TabContent tab="Info" activeTab={activeTab}>
                            <div>
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src={currentPokemon.getImage(currentForm)}
                                        alt={currentPokemon.name}
                                        height="160"
                                        width="160"
                                        className="min-w-40 max-w-40 h-40"
                                    />
                                    <div className="flex flex-col space-y-2">
                                        <LeftRightCycleButtons
                                            isVisible={currentPokemon.forms.length > 0}
                                            text="Change Form"
                                            onPrevClick={() =>
                                                setCurrentForm(
                                                    negativeMod(currentForm - 1, currentPokemon.forms.length)
                                                )
                                            }
                                            onNextClick={() =>
                                                setCurrentForm((currentForm + 1) % currentPokemon.forms.length)
                                            }
                                        />
                                        <TypeBadge
                                            key={currentPokemon.getType1(currentForm).id}
                                            types={[
                                                currentPokemon.getType1(currentForm),
                                                currentPokemon.getType2(currentForm),
                                            ]}
                                            useShort={false}
                                            element={TypeBadgeElementEnum.CAPSULE_ROW}
                                        />
                                        <div className="flex space-x-1">
                                            {currentPokemon.tribes.map((t) => (
                                                <TribeCapsule key={t.id} tribe={t} />
                                            ))}
                                        </div>
                                        <div className="flex space-x-1">
                                            {currentPokemon.getAbilities(currentForm).map((a) => (
                                                <AbilityCapsule key={a.id} ability={a} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {currentPokemon.getPokedex(currentForm)}
                                </p>
                                <hr className="my-3" />
                                <div>
                                    <table className="mt-1">
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
                                <hr className="my-3" />
                                <div className="flex justify-center space-x-3">
                                    {defMatchupDifferentForAbilities && (
                                        <BasicButton
                                            onClick={() =>
                                                setSelectedDefAbility(
                                                    currentPokemon.abilities.find((a) => a != selectedDefAbility) ??
                                                        selectedDefAbility
                                                )
                                            }
                                        >
                                            {selectedDefAbility.name}
                                        </BasicButton>
                                    )}
                                    <h1 className="font-semibold text-2xl my-auto text-gray-800 dark:text-gray-100">
                                        Defensive Matchups
                                    </h1>
                                </div>
                                <table className="my-2">
                                    <thead>
                                        <tr>
                                            {realTypes.map((t) => (
                                                <TypeBadge
                                                    key={t.id}
                                                    types={[t]}
                                                    useShort={true}
                                                    element={TypeBadgeElementEnum.TABLE_HEADER}
                                                />
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {realTypes.map((t) => (
                                                <TypeChartCell
                                                    key={t.id}
                                                    mult={defMatchupCalcs[selectedDefAbility.id][t.id]}
                                                />
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                                <hr className="my-3" />
                                <div className="flex justify-center space-x-3">
                                    {stabMatchupDifferentForAbilities && (
                                        <BasicButton
                                            onClick={() =>
                                                setSelectedStabAbility(
                                                    currentPokemon.abilities.find((a) => a != selectedStabAbility) ??
                                                        selectedStabAbility
                                                )
                                            }
                                        >
                                            {selectedStabAbility.name}
                                        </BasicButton>
                                    )}
                                    <h1 className="font-semibold text-2xl my-auto text-gray-800 dark:text-gray-100">
                                        STAB Matchups
                                    </h1>
                                </div>
                                <table className="my-2">
                                    <thead>
                                        <tr>
                                            {realTypes.map((t) => (
                                                <TypeBadge
                                                    key={t.id}
                                                    types={[t]}
                                                    useShort={true}
                                                    element={TypeBadgeElementEnum.TABLE_HEADER}
                                                />
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {realTypes.map((t) => {
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
                                <hr className="my-3" />
                                <div className="mt-2">
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
                                <hr className="my-3" />
                                <h1 className="font-semibold text-2xl text-center mb-2 text-gray-800 dark:text-gray-100">
                                    Encounters
                                </h1>
                                <EncounterDisplay pokemon={currentPokemon} />
                            </div>
                        </TabContent>
                        <TabContent tab="Level Moves" activeTab={activeTab}>
                            <MoveTable moves={currentPokemon.getLevelMoves(currentForm)} showLevel={true} />
                        </TabContent>
                        <TabContent tab="Tutor Moves" activeTab={activeTab}>
                            <MoveTable
                                moves={currentPokemon.lineMoves.concat(currentPokemon.tutorMoves).map((x) => [0, x])}
                                showLevel={false}
                            />
                        </TabContent>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokemonModal;
