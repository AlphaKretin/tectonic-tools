"use client";

import InlineLink from "@/components/InlineLink";
import InternalLink from "@/components/InternalLink";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { ReactNode, useState } from "react";
import Checkbox from "../../components/Checkbox";
import Column from "../../components/Column";
import ColumnBody from "../../components/ColumnBody";
import ColumnHeader from "../../components/ColumnHeader";
import Dropdown from "../../components/DropDown";
import InputLabel from "../../components/InputLabel";
import PokemonCard from "../../components/PokemonCard";
import { nullMove } from "../data/moves";
import { decodeTeam } from "../data/teamExport";
import { nullTrainer, trainers } from "../data/trainers";
import { PartyPokemon } from "../data/types/PartyPokemon";
import { Trainer } from "../data/types/Trainer";
import { isNull } from "../data/util";
import MoveCard, { MoveData } from "./components/MoveCard";
import { calculateDamage, DamageResult } from "./damageCalc";

const nullMoveData = { move: nullMove, criticalHit: false, customVar: undefined };

const battleBooleans = ["Multi Battle", "Aurora Veil", "Reflect", "Light Screen"] as const;
type BattleBoolean = (typeof battleBooleans)[number];
export type BattleState = Record<BattleBoolean, boolean>;

const PokemonDamageCalculator: NextPage = () => {
    const [playerPokemon, setPlayerPokemon] = useState<PartyPokemon>(new PartyPokemon());

    const [playerMove, setPlayerMove] = useState<MoveData>(nullMoveData);

    const [opponentPokemon, setOpponentPokemon] = useState<PartyPokemon>(new PartyPokemon());

    const [playerTeam, setPlayerTeam] = useState<Trainer>(nullTrainer);
    const [opposingTrainer, setOpposingTrainer] = useState<Trainer>(nullTrainer);

    const [battleState, setBattleState] = useState<BattleState>(
        Object.fromEntries(battleBooleans.map((b) => [b, false])) as BattleState
    );

    const [teamCode, setTeamCode] = useState<string>("");

    type Side = "player" | "opponent";

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
        const newState = { ...battleState, [state]: value };
        setBattleState(newState);
    }

    const setPokemon = {
        player: setPlayerPokemon,
        opponent: setOpponentPokemon,
    };

    const getTrainer = {
        player: playerTeam,
        opponent: opposingTrainer,
    };

    function importTeam() {
        const teamCards = decodeTeam(teamCode);
        const playerTrainer = new Trainer({
            key: "val",
            class: "POKEMONTRAINER",
            name: "Val",
            policies: [],
            flags: [],
            pokemon: teamCards.map((c) => {
                return {
                    id: c.species.id,
                    level: c.level,
                    items: c.items.map((i) => i.id),
                    itemTypes: c.itemTypes.map((t) => t.id),
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
            }),
        });
        setPlayerTeam(playerTrainer);
    }

    function handleLoadingTrainer(trainer_key: string) {
        const trainer = trainers[trainer_key] || nullTrainer;
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
                itemTypes: pokemon.itemTypes,
                ability: pokemon.ability,
            })
        );
    }

    function isReadyToCalculate() {
        return !isNull(playerPokemon.species) && !isNull(opponentPokemon.species) && !isNull(playerMove.move);
    }

    const damageResult = calculateDamage(playerMove, playerPokemon, opponentPokemon, battleState);

    function swapPokemon() {
        const mon1 = playerPokemon;
        const mon2 = opponentPokemon;

        setPlayerPokemon(mon2);
        setPlayerMove(nullMoveData);

        setOpponentPokemon(mon1);
    }

    function printDamageNumbers(damageResult: DamageResult): ReactNode {
        // multi-hit moves
        if (damageResult.minTotal && damageResult.minPercentage) {
            if (damageResult.maxTotal === damageResult.minTotal) {
                return (
                    <>
                        <p className="text-3xl font-bold text-green-400">{damageResult.minTotal}</p>
                        <p className="text-gray-300">({damageResult.damage} per hit)</p>
                        <p className="text-gray-300">
                            {(damageResult.minPercentage * 100).toFixed(2)}% of opponent&apos;s HP
                        </p>
                    </>
                );
            }
            if (damageResult.maxTotal && damageResult.maxPercentage) {
                return (
                    <>
                        <p className="text-3xl font-bold text-green-400">
                            {damageResult.minTotal}-{damageResult.maxTotal}
                        </p>
                        <p className="text-gray-300">({damageResult.damage} per hit)</p>
                        <p className="text-gray-300">
                            {(damageResult.minPercentage * 100).toFixed(2)}%-
                            {(damageResult.maxPercentage * 100).toFixed(2)}% of opponent&apos;s HP
                        </p>
                    </>
                );
            }
        }
        return (
            <>
                <p className="text-3xl font-bold text-green-400">{damageResult.damage}</p>
                <p className="text-gray-300">{(damageResult.percentage * 100).toFixed(2)}% of opponent&apos;s HP</p>
            </>
        );
    }

    function printHPBar(damageResult: DamageResult): ReactNode {
        const percentage = damageResult.minPercentage || damageResult.percentage;
        if (damageResult.maxPercentage && damageResult.maxPercentage !== damageResult.minPercentage) {
            return (
                <div className="mt-4 relative">
                    <div className="h-4 bg-gray-600 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
                        <div
                            className="absolute inset-0 bg-gray-800 rounded-left transition-all duration-300"
                            style={{
                                left: `${100 - Math.min(100, percentage * 100)}%`,
                            }}
                        ></div>
                        <div
                            className="absolute inset-0 bg-gray-800 rounded-left transition-all duration-300 opacity-80"
                            style={{
                                left: `${100 - Math.min(100, damageResult.maxPercentage * 100)}%`,
                            }}
                        ></div>
                    </div>
                </div>
            );
        }
        return (
            <div className="mt-4 relative">
                <div className="h-4 bg-gray-600 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
                    <div
                        className="absolute inset-0 bg-gray-800 rounded-left transition-all duration-300"
                        style={{
                            left: `${100 - Math.min(100, percentage * 100)}%`,
                        }}
                    ></div>
                </div>
            </div>
        );
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
            <div className="min-h-screen bg-gray-900 py-8 flex flex-col items-center">
                <div className="mx-auto px-4">
                    {/* Centered title */}
                    <div className="flex flex-col justify-center items-center mb-10 relative">
                        <h1 className="text-3xl font-bold text-blue-400">Pokémon Tectonic Damage Calculator</h1>
                        <p>
                            This tool is a work in progress! The basic functionality is working, but many details are
                            not yet implemented. See the to-do list and contribute on{" "}
                            <InlineLink url="https://github.com/AlphaKretin/tectonic-tools">GitHub</InlineLink>.
                        </p>
                        <p>
                            <InternalLink url="../">Return to homepage</InternalLink>
                        </p>
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
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onClick={importTeam}
                                        >
                                            Import Team
                                        </button>
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
                                                            <button
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:ring-2 focus:ring-blue-400"
                                                                onClick={() => handleLoadingTrainerPokemon(i, "player")}
                                                            >
                                                                Set Active
                                                            </button>
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
                                        <PokemonCard data={playerPokemon} update={updatePlayerPokemon} battle={true} />
                                        {/* Move selection */}
                                        <MoveCard
                                            data={playerMove}
                                            userData={playerPokemon}
                                            targetData={opponentPokemon}
                                            updateMoveData={updateMoveData}
                                        />
                                    </ColumnBody>
                                </Column>

                                {/* Results Section */}
                                <Column>
                                    {isReadyToCalculate() ? (
                                        <div className="w-full max-w-xs">
                                            <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 text-center">
                                                <h3 className="font-medium text-lg text-white mb-4">
                                                    Damage Calculation
                                                </h3>
                                                <div className="space-y-4">
                                                    {printDamageNumbers(damageResult)}
                                                    <p className="text-gray-300">{damageResult.hits} hits to KO</p>
                                                    {/* Effectiveness message */}
                                                    {damageResult.typeEffectMult === 4 && (
                                                        <p className="text-pink-400 font-bold">Hyper Effective!</p>
                                                    )}
                                                    {damageResult.typeEffectMult === 2 && (
                                                        <p className="text-green-400 font-bold">Super Effective!</p>
                                                    )}
                                                    {damageResult.typeEffectMult === 0.5 && (
                                                        <p className="text-red-400 font-bold">Not Very Effective!</p>
                                                    )}
                                                    {damageResult.typeEffectMult === 0.25 && (
                                                        <p className="text-gray-400 font-bold">Barely Effective!</p>
                                                    )}
                                                    {damageResult.typeEffectMult === 0 && (
                                                        <p className="text-gray-500 font-bold shadow-md">
                                                            Not Effective!
                                                        </p>
                                                    )}
                                                    {/* Fixed health bar */}
                                                    {printHPBar(damageResult)}
                                                </div>
                                            </div>
                                        </div>
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
                                                checked={battleState[b]}
                                                onChange={() => handleBattleState(b, !battleState[b])}
                                            >
                                                {b}
                                            </Checkbox>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => swapPokemon()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 mt-4"
                                    >
                                        Swap Pokémon
                                    </button>
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
                                            {Object.values(trainers).map((t) => (
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
                                                            <button
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:ring-2 focus:ring-blue-400"
                                                                onClick={() =>
                                                                    handleLoadingTrainerPokemon(i, "opponent")
                                                                }
                                                            >
                                                                Set Active
                                                            </button>
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
