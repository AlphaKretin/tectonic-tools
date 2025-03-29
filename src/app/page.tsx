"use client";

import type { NextPage } from "next";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { CalcPokemon, calculateDamage, DamageResult } from "./damageCalc";
import { moves, nullMove } from "./data/moves";
import { nullPokemon, pokemon } from "./data/pokemon";
import { nullTrainer, trainers } from "./data/trainers";
import { defaultStylePoints, StylePoints } from "./data/types/BasicData";
import { Move } from "./data/types/Move";
import { blankStats, Pokemon, Stats } from "./data/types/Pokemon";
import { Trainer } from "./data/types/Trainer";

function isNull(o: Pokemon | Pokemon | Move | Trainer | undefined): boolean {
    return !o || o.name === "";
}

function isKey<T extends object>(k: string | number | symbol, o: T): k is keyof T {
    return k in o;
}

function safeKeys<T extends object>(o: T): Array<keyof T> {
    const allKeys = Object.keys(o);
    return allKeys.filter((k) => isKey(k, o));
}

const PokemonDamageCalculator: NextPage = () => {
    const [playerPokemon, setPlayerPokemon] = useState<Pokemon>(nullPokemon);
    const [playerMove, setPlayerMove] = useState<Move>(nullMove);
    const [customMoveVar, setCustomMoveVar] = useState<number>(0);
    const [playerLevel, setPlayerLevel] = useState<number>(70);
    const [playerStylePoints, setPlayerStylePoints] = useState<StylePoints>(defaultStylePoints);
    const [playerCalculatedStats, setPlayerCalculatedStats] = useState<Stats>(blankStats);

    const [opponentPokemon, setOpponentPokemon] = useState<Pokemon>(nullPokemon);
    const [opponentLevel, setOpponentLevel] = useState<number>(70);
    const [opponentStylePoints, setOpponentStylePoints] = useState<StylePoints>(defaultStylePoints);
    const [opponentCalculatedStats, setOpponentCalculatedStats] = useState<Stats>(blankStats);

    const [opposingTrainer, setOpposingTrainer] = useState<Trainer>(nullTrainer);

    const [multiBattle, setMultiBattle] = useState<boolean>(false);

    type Side = "player" | "opponent";

    const getPokemon = {
        player: playerPokemon,
        opponent: opponentPokemon,
    };

    const setPokemon = {
        player: setPlayerPokemon,
        opponent: setOpponentPokemon,
    };

    const getLevel = {
        player: playerLevel,
        opponent: opponentLevel,
    };

    const setLevel = {
        player: setPlayerLevel,
        opponent: setOpponentLevel,
    };

    const getStylePoints = {
        player: playerStylePoints,
        opponent: opponentStylePoints,
    };

    const setStylePoints = {
        player: setPlayerStylePoints,
        opponent: setOpponentStylePoints,
    };

    const getCalculatedStats = {
        player: playerCalculatedStats,
        opponent: opponentCalculatedStats,
    };

    const setCalculatedStats = {
        player: setPlayerCalculatedStats,
        opponent: setOpponentCalculatedStats,
    };

    const MIN_LEVEL = 1;
    const MAX_LEVEL = 70;
    const STYLE_POINT_CAP = 50;
    const MIN_SP = 0;
    const MAX_SP = 20;

    function recalculateStats(baseStats: Stats, level: number, stylePoints: StylePoints, side: Side) {
        const newStats: Stats = {
            hp: calculateHP(baseStats.hp, level, stylePoints.hp),
            attack: calculateStat(baseStats.attack, level, stylePoints.attacks),
            defense: calculateStat(baseStats.defense, level, stylePoints.defense),
            spatk: calculateStat(baseStats.spatk, level, stylePoints.attacks),
            spdef: calculateStat(baseStats.spdef, level, stylePoints.spdef),
            speed: calculateStat(baseStats.speed, level, stylePoints.speed),
        };
        setCalculatedStats[side](newStats);
    }

    function handleLoadingPokemon(pokemon: Pokemon, side: Side) {
        if (!isNull(pokemon)) {
            setPokemon[side](pokemon);
            const baseStats = pokemon.stats;
            const level = getLevel[side];
            const stylePoints = getStylePoints[side];
            recalculateStats(baseStats, level, stylePoints, side);
            if (side === "player") {
                setPlayerMove(nullMove);
            }
        }
    }

    function handleLoadingTrainer(trainer_key: string) {
        const trainer = trainers[trainer_key] || nullTrainer;
        if (!isNull(trainer)) {
            setOpposingTrainer(trainer);
        }
    }

    function handleLoadingTrainerPokemon(index: number) {
        if (index < 0) {
            return;
        }
        const pokemon = opposingTrainer.pokemon[index];
        setPokemon["opponent"](pokemon.pokemon);
        setLevel["opponent"](pokemon.level);
        setStylePoints["opponent"](pokemon.sp);
        recalculateStats(pokemon.pokemon.stats, pokemon.level, pokemon.sp, "opponent");
    }

    function styleValueMult(level: number): number {
        return 2.0 + level / 50.0;
    }

    function calculateHP(base: number, level: number, sv: number, stylish: boolean = false): number {
        if (base === 1) return 1; // For Shedinja
        const pseudoLevel = 15.0 + level / 2.0;
        const stylishMult = stylish ? 2.0 : 1.0;
        return Math.floor(
            ((base * 2.0 + sv * styleValueMult(level) * stylishMult) * pseudoLevel) / 100.0 + pseudoLevel + 10.0
        );
    }

    function calculateStat(base: number, level: number, sv: number, stylish: boolean = false): number {
        const pseudoLevel = 15.0 + level / 2.0;
        const stylishMult = stylish ? 2.0 : 1.0;
        return Math.floor(((base * 2.0 + sv * styleValueMult(level) * stylishMult) * pseudoLevel) / 100.0 + 5.0);
    }

    function isReadyToCalculate() {
        return !isNull(playerPokemon) && !isNull(opponentPokemon) && !isNull(playerMove);
    }

    function handleLevel(level: number, side: Side) {
        level = Math.max(level, MIN_LEVEL);
        level = Math.min(level, MAX_LEVEL);
        setLevel[side](level);
        const baseStats = getPokemon[side].stats;
        const stylePoints = getStylePoints[side];
        recalculateStats(baseStats, level, stylePoints, side);
    }

    function handleStylePoints(styleName: keyof StylePoints, stylePoint: number, side: Side) {
        stylePoint = Math.max(stylePoint, MIN_SP);
        stylePoint = Math.min(stylePoint, MAX_SP);
        const stylePoints = { ...getStylePoints[side], [styleName]: stylePoint };
        const spSum = Object.values(stylePoints).reduce((total, sp) => total + sp, 0);
        if (spSum > STYLE_POINT_CAP) {
            alert("You can only have a maximum of 50 total style points!");
            return;
        }
        setStylePoints[side](stylePoints);
        const baseStats = getPokemon[side].stats;
        const level = getLevel[side];
        recalculateStats(baseStats, level, stylePoints, side);
    }

    function styleFromStat(stat: keyof Stats): keyof StylePoints {
        if (stat === "attack" || stat === "spatk") {
            return "attacks";
        }
        return stat;
    }

    const playerPokemonWithStats: CalcPokemon = { ...playerPokemon, stats: playerCalculatedStats, level: playerLevel };
    const opponentPokemonWithStats: CalcPokemon = {
        ...opponentPokemon,
        stats: opponentCalculatedStats,
        level: opponentLevel,
    };

    const damageResult = calculateDamage(playerMove, playerPokemonWithStats, opponentPokemonWithStats, multiBattle);

    function pokemonSelect(side: Side) {
        return (
            <>
                {!isNull(getPokemon[side]) && (
                    <div className="flex justify-center mb-4">
                        {
                            // this is a stupid solution but it iddn't work if i had the ternary in the className
                            side === "player" ? (
                                <Image
                                    src={"/Pokemon/" + getPokemon[side].id + ".png"}
                                    alt={getPokemon[side].name}
                                    height="160"
                                    width="160"
                                    className="w-24 h-24 scale-x-[-1]"
                                />
                            ) : (
                                <Image
                                    src={"/Pokemon/" + getPokemon[side].id + ".png"}
                                    alt={getPokemon[side].name}
                                    height="160"
                                    width="160"
                                    className="w-24 h-24"
                                />
                            )
                        }
                    </div>
                )}
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Pokémon</label>
                </div>
                <select
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                    value={getPokemon[side].id}
                    onChange={(e) => handleLoadingPokemon(pokemon[e.target.value] || nullPokemon, side)}
                >
                    <option value="" className="bg-gray-800">
                        Select Pokémon
                    </option>
                    {Object.values(pokemon).map((p) => (
                        <option key={p.id} value={p.id} className="bg-gray-800">
                            {p.name}
                        </option>
                    ))}
                </select>
            </>
        );
    }

    function pokemonStats(side: Side) {
        return !isNull(getPokemon[side]) ? (
            <div className="space-y-6">
                {/* Pokemon type */}
                <p className="text-center">
                    {getPokemon[side].type2
                        ? getPokemon[side].type1 + " / " + getPokemon[side].type2
                        : getPokemon[side].type1}
                </p>

                {/* Level input */}
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                    <input
                        type="number"
                        min={MIN_LEVEL}
                        max={MAX_LEVEL}
                        className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                        value={getLevel[side]}
                        onChange={(e) => handleLevel(parseInt(e.target.value) || MIN_LEVEL, side)}
                    />
                </div>

                {/* Stats with perfect alignment */}
                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Stats</h3>
                    <div className="space-y-3">
                        {safeKeys(getPokemon[side].stats).map((statName) => {
                            const styleName = styleFromStat(statName);
                            return (
                                <div key={statName} className="flex items-center justify-between px-2">
                                    <span className="text-gray-300 w-16 text-right">{statName.toUpperCase()}</span>
                                    <span className="text-gray-400 w-12 text-center">
                                        {getCalculatedStats[side][statName]}
                                    </span>
                                    <input
                                        type="number"
                                        min={MIN_SP}
                                        max={MAX_SP}
                                        className="w-16 px-2 py-1 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                                        value={getStylePoints[side][styleName]}
                                        onChange={(e) =>
                                            handleStylePoints(styleName, parseInt(e.target.value) || MIN_SP, side)
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        ) : (
            ""
        );
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
        // TODO: support variable range
        const percentage = damageResult.minPercentage || damageResult.percentage;
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
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Centered title */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-blue-400 mb-2">Pokémon Tectonic Damage Calculator</h1>
                </div>

                {/* Calculator container */}
                <div className="flex justify-center">
                    <div className="w-full max-w-6xl bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                        <div className="flex flex-col md:flex-row">
                            {/* Player's Pokemon Section - Perfectly centered */}
                            <div className="flex-1 p-6 bg-gray-800 border-b md:border-b-0 md:border-r border-gray-700">
                                <div className="flex flex-col items-center">
                                    {" "}
                                    {/* Added centering container */}
                                    <h2 className="text-xl font-semibold mb-6 text-blue-400">Your Pokémon</h2>
                                    <div className="w-full max-w-xs space-y-6">
                                        {pokemonSelect("player")}
                                        {pokemonStats("player")}
                                        {/* Move selection */}
                                        {!isNull(playerPokemon) && (
                                            <div className="text-center">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Move
                                                </label>
                                                <select
                                                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                                                    value={playerMove.id}
                                                    onChange={(e) =>
                                                        setPlayerMove(moves[e.target.value] || nullPokemon)
                                                    }
                                                >
                                                    <option value="" className="bg-gray-800">
                                                        Select Move
                                                    </option>
                                                    {playerPokemon.moves
                                                        .filter((m) => m.bp > 0)
                                                        .map((m) => (
                                                            <option
                                                                key={m.id}
                                                                value={m.id}
                                                                className={`bg-gray-800 ${
                                                                    m.isSTAB(playerPokemon)
                                                                        ? "font-bold text-blue-400"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {m.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}
                                        {/* Move details */}
                                        {!isNull(playerMove) && (
                                            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                                {playerMove.getInput(customMoveVar, setCustomMoveVar)}
                                                <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">
                                                    Move Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                    <div className="text-right text-gray-400">Name:</div>
                                                    <div className="text-left text-gray-200">{playerMove.name}</div>
                                                    <div className="text-right text-gray-400">Type:</div>
                                                    <div className="text-left text-gray-200">{playerMove.type}</div>
                                                    <div className="text-right text-gray-400">BP:</div>
                                                    <div className="text-left text-gray-200">{playerMove.bp}</div>
                                                    <div className="text-right text-gray-400">Category:</div>
                                                    <div className="text-left text-gray-200">{playerMove.category}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Results Section */}
                            <div className="flex-1 p-6 bg-gray-800 border-b md:border-b-0 md:border-x border-gray-700">
                                <div className="h-full flex flex-col items-center justify-center">
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
                                    <h2 className="text-xl font-semibold mb-6 text-purple-400">Field Status</h2>
                                    <div className="mt-6">
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={multiBattle}
                                                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                onChange={() => setMultiBattle(!multiBattle)}
                                            />
                                            <span className="text-gray-300">Multi Battle</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Opponent's Pokemon Section - Perfectly centered */}
                            <div className="flex-1 p-6 bg-gray-800 border-t md:border-t-0 md:border-l border-gray-700">
                                <div className="flex flex-col items-center">
                                    {" "}
                                    {/* Added centering container */}
                                    <h2 className="text-xl font-semibold mb-6 text-red-400">Opponent&apos;s Pokémon</h2>
                                    <div className="w-full max-w-xs space-y-6">
                                        {pokemonSelect("opponent")}

                                        {pokemonStats("opponent")}
                                    </div>
                                </div>
                            </div>

                            {/* Trainer Pokemon Section - Perfectly centered */}
                            <div className="flex-1 p-6 bg-gray-800 border-t md:border-t-0 md:border-l border-gray-700">
                                <div className="flex flex-col items-center">
                                    {" "}
                                    {/* Added centering container */}
                                    <h2 className="text-xl font-semibold mb-6 text-red-400">Trainer Pokémon</h2>
                                    <div className="w-full max-w-xs space-y-6">
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
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Trainer
                                            </label>
                                        </div>
                                        <select
                                            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                                            value={opposingTrainer.key()}
                                            onChange={(e) => handleLoadingTrainer(e.target.value)}
                                        >
                                            <option value="" className="bg-gray-800">
                                                Select Trainer
                                            </option>
                                            {Object.values(trainers).map((t) => (
                                                <option key={t.key()} value={t.key()} className="bg-gray-800">
                                                    {t.displayName()}
                                                </option>
                                            ))}
                                        </select>
                                        {!isNull(opposingTrainer) && (
                                            <>
                                                <div className="text-center">
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                                        Trainer Pokémon
                                                    </label>
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
                                                                onClick={() => handleLoadingTrainerPokemon(i)}
                                                            >
                                                                Set Active
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokemonDamageCalculator;
