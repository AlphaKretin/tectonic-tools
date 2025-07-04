"use client";

import BasicButton from "@/components/BasicButton";
import { FilterInput } from "@/components/FilterInput";
import { AVAILABLE_FILTERS, PokemonFilterType } from "@/components/filters";
import PageHeader, { PageType } from "@/components/PageHeader";
import { LoadedTrainer } from "@/preload/loadedDataClasses";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import Checkbox from "../../components/Checkbox";
import Column from "../../components/Column";
import ColumnBody from "../../components/ColumnBody";
import ColumnHeader from "../../components/ColumnHeader";
import Dropdown from "../../components/DropDown";
import InputLabel from "../../components/InputLabel";
import PokemonCard from "../../components/PokemonCard";
import { CancelWeatherAbility } from "../data/abilities/CancelWeatherAbility";
import { BattleBoolean, battleBooleans, BattleBools } from "../data/battleState";
import { WeatherCondition, weatherConditions } from "../data/conditions";
import { decodeTeam } from "../data/teamExport";
import { Move } from "../data/tectonic/Move";
import { Pokemon } from "../data/tectonic/Pokemon";
import { TectonicData } from "../data/tectonic/TectonicData";
import { Trainer } from "../data/tectonic/Trainer";
import { PartyPokemon } from "../data/types/PartyPokemon";
import { isNull } from "../data/util";
import DamageResultComponent from "./components/DamageResult";
import MoveCard, { MoveData } from "./components/MoveCard";
import { calculateDamage, Side } from "./damageCalc";

const nullMoveData = { move: Move.NULL, criticalHit: false, customVar: undefined };

const PokemonDamageCalculator: NextPage = () => {
    const [playerPokemon, setPlayerPokemon] = useState<PartyPokemon>(new PartyPokemon());

    const [playerMove, setPlayerMove] = useState<MoveData>(nullMoveData);

    const [opponentPokemon, setOpponentPokemon] = useState<PartyPokemon>(new PartyPokemon());

    const [playerTeam, setPlayerTeam] = useState<Trainer>(Trainer.NULL);
    const [opposingTrainer, setOpposingTrainer] = useState<Trainer>(Trainer.NULL);

    const [battleBools, setBattleBools] = useState<BattleBools>(
        Object.fromEntries(battleBooleans.map((b) => [b, false])) as BattleBools
    );
    const [weather, setWeather] = useState<WeatherCondition>("None");

    const [teamCode, setTeamCode] = useState<string>("");

    const [filters, setFilters] = useState<PokemonFilterType[]>([]);

    const [currentFilter, setCurrentFilter] = useState<PokemonFilterType>(AVAILABLE_FILTERS[0]);
    const [filterPokemon, setFilterPokemon] = useState<Pokemon>(Pokemon.NULL);

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

    function updatePlayerPokemon(card: Partial<PartyPokemon>) {
        setPlayerPokemon(new PartyPokemon({ ...playerPokemon, ...card }));
    }

    function updateOpponentPokemon(card: Partial<PartyPokemon>) {
        setOpponentPokemon(new PartyPokemon({ ...opponentPokemon, ...card }));
    }

    function updateMoveData(data: MoveData) {
        setPlayerMove(data);
    }

    function handleBattleState(state: BattleBoolean, value: boolean) {
        const newState = { ...battleBools, [state]: value };
        setBattleBools(newState);
    }

    const getPokemon = {
        player: playerPokemon,
        opponent: opponentPokemon,
    };

    const setPokemon = {
        player: setPlayerPokemon,
        opponent: setOpponentPokemon,
    };

    function addPokemon(side: Side) {
        if (isNull(filterPokemon)) {
            alert("You select a Pokémon to use this!");
            return;
        }
        if (!isNull(getPokemon[side].species)) {
            alert("The chosen Pokémon slot must be empty to use this!");
            return;
        }
        setPokemon[side](new PartyPokemon({ species: filterPokemon }));
    }

    const getTrainer = {
        player: playerTeam,
        opponent: opposingTrainer,
    };

    function importTeam() {
        const teamCards = decodeTeam(teamCode);
        const data = new LoadedTrainer();
        data.key = "val";
        data.class = "POKEMONTRAINER";
        data.name = "Val";
        data.policies = [];
        data.flags = [];
        data.pokemon = teamCards.map((c) => {
            return {
                id: c.species.id,
                level: c.level,
                items: c.items.map((i) => i.id),
                itemType: c.itemType.id,
                moves: c.moves.map((m) => m.id),
                sp: [
                    c.stylePoints.hp,
                    c.stylePoints.attacks,
                    c.stylePoints.defense,
                    c.stylePoints.speed,
                    c.stylePoints.attacks,
                    c.stylePoints.spdef,
                ],
            };
        });

        const playerTrainer = new Trainer(data);
        setPlayerTeam(playerTrainer);
    }

    function handleLoadingTrainer(trainer_key: string) {
        const trainer = TectonicData.trainers[trainer_key] || Trainer.NULL;
        if (!isNull(trainer)) {
            setOpposingTrainer(trainer);
        }
    }

    function handleLoadingTrainerPokemon(index: number, side: Side) {
        if (index < 0) {
            return;
        }
        const pokemon = getTrainer[side].pokemon[index];
        setPokemon[side](
            new PartyPokemon({
                species: pokemon.pokemon,
                level: pokemon.level,
                stylePoints: pokemon.sp,
                moves: pokemon.moves,
                items: pokemon.items,
                itemType: pokemon.itemType,
                ability: pokemon.ability,
            })
        );
    }

    function isReadyToCalculate() {
        return !isNull(playerPokemon.species) && !isNull(opponentPokemon.species) && !isNull(playerMove.move);
    }

    const cancelWeather =
        playerPokemon.ability instanceof CancelWeatherAbility ||
        opponentPokemon.ability instanceof CancelWeatherAbility;

    const fieldState = {
        weather: cancelWeather ? "None" : weather,
        bools: battleBools,
    };

    const damageResult = calculateDamage(playerMove, playerPokemon, opponentPokemon, fieldState);

    function swapPokemon() {
        const mon1 = playerPokemon;
        const mon2 = opponentPokemon;

        setPlayerPokemon(mon2);
        setPlayerMove(nullMoveData);

        setOpponentPokemon(mon1);
    }

    return (
        <>
            <Head>
                <title>Pokémon Tectonic Damage Calculator</title>
                <meta
                    name="description"
                    content="A damage calculator using the modified mechanics of Pokémon Tectonic"
                />
            </Head>
            <PageHeader currentPage={PageType.Calc} />

            <div className="min-h-screen bg-gray-900 py-2 flex flex-col items-center">
                <div className="mx-auto px-4">
                    <div>
                        <FilterInput
                            currentFilter={currentFilter}
                            filters={filters}
                            onAddFilter={handleAddFilter}
                            removeFilter={removeFilter}
                            setCurrentFilter={setCurrentFilter}
                        />
                        <div className="flex flex-row">
                            <Dropdown
                                value={filterPokemon.id}
                                onChange={(e) => setFilterPokemon(TectonicData.pokemon[e.target.value] || Pokemon.NULL)}
                            >
                                <option value="">Select Pokémon</option>
                                {filteredPokemon.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </Dropdown>
                            <BasicButton onClick={() => addPokemon("player")}>Set Player Pokémon</BasicButton>
                            <BasicButton onClick={() => addPokemon("opponent")}>Set Opponent Pokémon</BasicButton>
                        </div>
                    </div>
                    {/* Calculator container */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-8xl bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                            <div className="flex flex-col md:flex-row">
                                <Column>
                                    <ColumnHeader colour="text-blue-400">Your Pokémon</ColumnHeader>
                                    <ColumnBody>
                                        <div className="text-center">
                                            <InputLabel>Team Code</InputLabel>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Team code"
                                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={teamCode}
                                            onChange={(e) => setTeamCode(e.target.value)}
                                        />
                                        <BasicButton onClick={importTeam}>Import Team</BasicButton>
                                        {!isNull(playerTeam) && (
                                            <>
                                                <div className="text-center">
                                                    <InputLabel>Trainer Pokémon</InputLabel>
                                                </div>
                                                <div className="space-y-4">
                                                    {playerTeam.pokemon.map((p, i) => (
                                                        <div
                                                            key={i}
                                                            className="bg-gray-700 p-4 rounded-lg border border-gray-600 flex justify-between items-center"
                                                        >
                                                            <div>
                                                                <p className="text-gray-200 font-medium">
                                                                    {p.nickname
                                                                        ? p.nickname + " (" + p.pokemon.name + ")"
                                                                        : p.pokemon.name}
                                                                </p>
                                                                <p className="text-gray-400 text-sm">
                                                                    Level: {p.level}
                                                                </p>
                                                            </div>
                                                            <BasicButton
                                                                onClick={() => handleLoadingTrainerPokemon(i, "player")}
                                                            >
                                                                Set Active
                                                            </BasicButton>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </ColumnBody>
                                </Column>
                                {/* Player's Pokemon Section */}
                                <Column>
                                    <ColumnHeader colour="text-blue-400">Attacking Pokémon</ColumnHeader>
                                    <ColumnBody>
                                        <PokemonCard
                                            data={playerPokemon}
                                            update={updatePlayerPokemon}
                                            battle={true}
                                            battleState={fieldState}
                                        />
                                        {/* Move selection */}
                                        <MoveCard
                                            data={playerMove}
                                            userData={playerPokemon}
                                            targetData={opponentPokemon}
                                            battleState={fieldState}
                                            updateMoveData={updateMoveData}
                                        />
                                    </ColumnBody>
                                </Column>

                                {/* Results Section */}
                                <Column>
                                    <ColumnHeader colour="text-purple-400">Damage Calcuation</ColumnHeader>
                                    {isReadyToCalculate() ? (
                                        <DamageResultComponent damageResult={damageResult} />
                                    ) : (
                                        <div className="text-center text-gray-500 p-8">
                                            <p>Select Pokémon and moves to see damage calculation</p>
                                        </div>
                                    )}
                                    <ColumnHeader colour="text-purple-400">Field Status</ColumnHeader>
                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                        {battleBooleans.map((b) => (
                                            <Checkbox
                                                key={b}
                                                checked={battleBools[b]}
                                                onChange={() => handleBattleState(b, !battleBools[b])}
                                            >
                                                {b}
                                            </Checkbox>
                                        ))}
                                    </div>
                                    <Dropdown
                                        value={weather}
                                        onChange={(e) => setWeather(e.target.value as WeatherCondition)}
                                    >
                                        <option value="None">Select Weather</option>
                                        {weatherConditions.map((w) => (
                                            <option key={w} value={w}>
                                                {w}
                                            </option>
                                        ))}
                                    </Dropdown>
                                    <BasicButton onClick={() => swapPokemon()}>Swap Pokémon</BasicButton>
                                </Column>

                                {/* Opponent's Pokemon Section */}
                                <Column>
                                    <ColumnHeader colour="text-red-400">Defending Pokémon</ColumnHeader>
                                    <ColumnBody>
                                        <PokemonCard
                                            data={opponentPokemon}
                                            update={updateOpponentPokemon}
                                            battle={true}
                                        />
                                    </ColumnBody>
                                </Column>

                                {/* Trainer Pokemon Section */}
                                <Column>
                                    <ColumnHeader colour="text-red-400">Trainer Pokémon</ColumnHeader>
                                    <ColumnBody>
                                        {!isNull(opposingTrainer) && (
                                            <div className="flex justify-center mb-4">
                                                <Image
                                                    src={"/Trainers/" + opposingTrainer.class + ".png"}
                                                    alt={opposingTrainer.displayName()}
                                                    height="160"
                                                    width="160"
                                                    className="w-24 h-24"
                                                />
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <InputLabel>Trainer</InputLabel>
                                        </div>
                                        <Dropdown
                                            value={opposingTrainer.id}
                                            onChange={(e) => handleLoadingTrainer(e.target.value)}
                                        >
                                            <option value="" className="bg-gray-800">
                                                Select Trainer
                                            </option>
                                            {Object.values(TectonicData.trainers).map((t) => (
                                                <option key={t.id} value={t.id} className="bg-gray-800">
                                                    {t.displayName()}
                                                </option>
                                            ))}
                                        </Dropdown>
                                        {!isNull(opposingTrainer) && (
                                            <>
                                                <div className="text-center">
                                                    <InputLabel>Trainer Pokémon</InputLabel>
                                                </div>
                                                <div className="space-y-4">
                                                    {opposingTrainer.pokemon.map((p, i) => (
                                                        <div
                                                            key={i}
                                                            className="bg-gray-700 p-4 rounded-lg border border-gray-600 flex justify-between items-center"
                                                        >
                                                            <div>
                                                                <p className="text-gray-200 font-medium">
                                                                    {p.nickname
                                                                        ? p.nickname + " (" + p.pokemon.name + ")"
                                                                        : p.pokemon.name}
                                                                </p>
                                                                <p className="text-gray-400 text-sm">
                                                                    Level: {p.level}
                                                                </p>
                                                            </div>
                                                            <BasicButton
                                                                onClick={() =>
                                                                    handleLoadingTrainerPokemon(i, "opponent")
                                                                }
                                                            >
                                                                Set Active
                                                            </BasicButton>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </ColumnBody>
                                </Column>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PokemonDamageCalculator;
