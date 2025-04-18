"use client";

import InlineLink from "@/components/InlineLink";
import InternalLink from "@/components/InternalLink";
import TypeBadge from "@/components/TypeBadge";
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
import { moves, nullMove } from "../data/moves";
import { nullPokemon, pokemon } from "../data/pokemon";
import { calculateHP, calculateStat } from "../data/stats";
import { StatusEffect, statusEffects } from "../data/statusEffects";
import { decodeTeam } from "../data/teamExport";
import { nullTrainer, trainers } from "../data/trainers";
import { Move } from "../data/types/Move";
import { blankStats, defaultStylePoints, Pokemon, Stats, StylePoints } from "../data/types/Pokemon";
import { Trainer } from "../data/types/Trainer";
import { isNull, negativeMod } from "../data/util";
import { calculateDamage, DamageResult, PokemonStats } from "./damageCalc";

function isKey<T extends object>(k: string | number | symbol, o: T): k is keyof T {
    return k in o;
}

function safeKeys<T extends object>(o: T): Array<keyof T> {
    const allKeys = Object.keys(o);
    return allKeys.filter((k) => isKey(k, o));
}

const PokemonDamageCalculator: NextPage = () => {
    const [playerPokemon, setPlayerPokemon] = useState<Pokemon>(nullPokemon);
    const [playerLevel, setPlayerLevel] = useState<number>(70);
    const [playerStylePoints, setPlayerStylePoints] = useState<StylePoints>(defaultStylePoints);
    const [playerStatSteps, setPlayerStatSteps] = useState<Stats>(blankStats);
    const [playerCalculatedStats, setPlayerCalculatedStats] = useState<Stats>(blankStats);
    const [playerStatusEffect, setPlayerStatusEffect] = useState<StatusEffect>("None");
    const [playerForm, setPlayerForm] = useState<number>(0);

    const [playerMove, setPlayerMove] = useState<Move>(nullMove);
    const [customMoveVar, setCustomMoveVar] = useState<number>(0);
    const [criticalHit, setCriticalHit] = useState<boolean>(false);

    const [opponentPokemon, setOpponentPokemon] = useState<Pokemon>(nullPokemon);
    const [opponentLevel, setOpponentLevel] = useState<number>(70);
    const [opponentStylePoints, setOpponentStylePoints] = useState<StylePoints>(defaultStylePoints);
    const [opponentStatSteps, setOpponentStatSteps] = useState<Stats>(blankStats);
    const [opponentCalculatedStats, setOpponentCalculatedStats] = useState<Stats>(blankStats);
    const [opponentStatusEffect, setOpponentStatusEffect] = useState<StatusEffect>("None");
    const [opponentForm, setOpponentForm] = useState<number>(0);

    const [playerTeam, setPlayerTeam] = useState<Trainer>(nullTrainer);
    const [opposingTrainer, setOpposingTrainer] = useState<Trainer>(nullTrainer);

    const [multiBattle, setMultiBattle] = useState<boolean>(false);

    const [teamCode, setTeamCode] = useState<string>("");

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

    const getStatSteps = {
        player: playerStatSteps,
        opponent: opponentStatSteps,
    };

    const setStatSteps = {
        player: setPlayerStatSteps,
        opponent: setOpponentStatSteps,
    };

    const getCalculatedStats = {
        player: playerCalculatedStats,
        opponent: opponentCalculatedStats,
    };

    const setCalculatedStats = {
        player: setPlayerCalculatedStats,
        opponent: setOpponentCalculatedStats,
    };

    const getStatusEffect = {
        player: playerStatusEffect,
        opponent: opponentStatusEffect,
    };

    const setStatusEffect = {
        player: setPlayerStatusEffect,
        opponent: setOpponentStatusEffect,
    };

    const getForm = {
        player: playerForm,
        opponent: opponentForm,
    };

    const setForm = {
        player: setPlayerForm,
        opponent: setOpponentForm,
    };

    const getTrainer = {
        player: playerTeam,
        opponent: opposingTrainer,
    };

    const MIN_LEVEL = 1;
    const MAX_LEVEL = 70;
    const STYLE_POINT_CAP = 50;
    const MIN_SP = 0;
    const MAX_SP = 20;
    const MIN_STEP = -12;
    const MAX_STEP = +12;

    function recalculateStats(
        baseStats: Stats,
        level: number,
        stylePoints: StylePoints,
        statSteps: Stats,
        effect: StatusEffect,
        side: Side
    ) {
        let speed = calculateStat(baseStats.speed, level, stylePoints.speed, statSteps.speed);
        if (effect === "Numb") {
            speed = Math.round(speed / 2);
        }

        // ignore negative attack steps if critical
        let attackStep = statSteps.attack;
        let spAtkStep = statSteps.spatk;
        if (side === "player" && criticalHit) {
            attackStep = Math.max(attackStep, 0);
            spAtkStep = Math.max(spAtkStep, 0);
        }

        // ignore positive defense steps if critical
        let defStep = statSteps.defense;
        let spDefStep = statSteps.spdef;
        if (side === "opponent" && criticalHit) {
            defStep = Math.min(defStep, 0);
            spDefStep = Math.min(spDefStep, 0);
        }

        const newStats: Stats = {
            hp: calculateHP(baseStats.hp, level, stylePoints.hp),
            attack: calculateStat(baseStats.attack, level, stylePoints.attacks, attackStep),
            defense: calculateStat(baseStats.defense, level, stylePoints.defense, defStep),
            spatk: calculateStat(baseStats.spatk, level, stylePoints.attacks, spAtkStep),
            spdef: calculateStat(baseStats.spdef, level, stylePoints.spdef, spDefStep),
            speed,
        };
        setCalculatedStats[side](newStats);
    }

    function handleLoadingPokemon(pokemon: Pokemon, side: Side) {
        if (!isNull(pokemon)) {
            setPokemon[side](pokemon);
            setForm[side](0);
            const baseStats = pokemon.getStats(0);
            const level = getLevel[side];
            const stylePoints = getStylePoints[side];
            const statSteps = getStatSteps[side];
            const effect = getStatusEffect[side];
            recalculateStats(baseStats, level, stylePoints, statSteps, effect, side);
            if (side === "player") {
                setPlayerMove(nullMove);
            }
        }
    }

    function handleLoadingForm(form: number, side: Side) {
        setForm[side](form);
        const baseStats = getPokemon[side].getStats(form);
        const level = getLevel[side];
        const stylePoints = getStylePoints[side];
        const statSteps = getStatSteps[side];
        const effect = getStatusEffect[side];
        recalculateStats(baseStats, level, stylePoints, statSteps, effect, side);
        if (side === "player") {
            setPlayerMove(nullMove);
        }
    }

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
                    id: c.pokemon.id,
                    level: 70,
                    items: [c.item.id],
                    moves: c.moves.map((m) => m.id),
                    sp: [10, 10, 10, 10, 10, 10],
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
        setPokemon[side](pokemon.pokemon);
        setLevel[side](pokemon.level);
        setStylePoints[side](pokemon.sp);
        setStatSteps[side](blankStats);
        setStatusEffect[side]("None");
        recalculateStats(pokemon.pokemon.stats, pokemon.level, pokemon.sp, blankStats, "None", side);
    }

    function isReadyToCalculate() {
        return !isNull(playerPokemon) && !isNull(opponentPokemon) && !isNull(playerMove);
    }

    function handleLevel(level: number, side: Side) {
        level = Math.max(level, MIN_LEVEL);
        level = Math.min(level, MAX_LEVEL);
        setLevel[side](level);
        const baseStats = getPokemon[side].getStats(getForm[side]);
        const stylePoints = getStylePoints[side];
        const statSteps = getStatSteps[side];
        const effect = getStatusEffect[side];
        recalculateStats(baseStats, level, stylePoints, statSteps, effect, side);
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
        const baseStats = getPokemon[side].getStats(getForm[side]);
        const level = getLevel[side];
        const statSteps = getStatSteps[side];
        const effect = getStatusEffect[side];
        recalculateStats(baseStats, level, stylePoints, statSteps, effect, side);
    }

    function styleFromStat(stat: keyof Stats): keyof StylePoints {
        if (stat === "attack" || stat === "spatk") {
            return "attacks";
        }
        return stat;
    }

    function handleStatSteps(statName: keyof Stats, stat: number, side: Side) {
        stat = Math.max(stat, MIN_STEP);
        stat = Math.min(stat, MAX_STEP);
        const newSteps = { ...getStatSteps[side], [statName]: stat };
        setStatSteps[side](newSteps);
        const baseStats = getPokemon[side].getStats(getForm[side]);
        const level = getLevel[side];
        const stylePoints = getStylePoints[side];
        const effect = getStatusEffect[side];
        recalculateStats(baseStats, level, stylePoints, newSteps, effect, side);
    }

    function handleStatusEffect(effect: StatusEffect, side: Side) {
        setStatusEffect[side](effect);
        const stylePoints = getStylePoints[side];
        const baseStats = getPokemon[side].getStats(getForm[side]);
        const statSteps = getStatSteps[side];
        const level = getLevel[side];
        recalculateStats(baseStats, level, stylePoints, statSteps, effect, side);
        if (effect === "Jinx" && side === "player") {
            setCriticalHit(true);
        }
    }

    function handleCriticalHit(crit: boolean) {
        if (getStatusEffect["opponent"] === "Jinx") {
            crit = true;
        }
        setCriticalHit(crit);
        const sides: Side[] = ["player", "opponent"];
        for (const side of sides) {
            const baseStats = getPokemon[side].getStats(getForm[side]);
            const level = getLevel[side];
            const stylePoints = getStylePoints[side];
            const statSteps = getStatSteps[side];
            const effect = getStatusEffect[side];
            recalculateStats(baseStats, level, stylePoints, statSteps, effect, side);
        }
    }

    function getMoveCategory(move: Move) {
        if (move.category !== "Adaptive") {
            return move.category;
        }
        const trueCategory = playerCalculatedStats.attack >= playerCalculatedStats.spatk ? "Physical" : "Special";
        return "Adaptive (" + trueCategory + ")";
    }

    const playerPokemonStats: PokemonStats = {
        stats: playerCalculatedStats,
        level: playerLevel,
        status: playerStatusEffect,
        form: playerForm,
    };
    const opponentPokemonStats: PokemonStats = {
        stats: opponentCalculatedStats,
        level: opponentLevel,
        status: opponentStatusEffect,
        form: opponentForm,
    };

    const battleState = {
        multiBattle,
        criticalHit,
    };

    const damageResult = calculateDamage(
        playerMove,
        playerPokemon,
        playerPokemonStats,
        opponentPokemon,
        opponentPokemonStats,
        battleState
    );

    function swapPokemon() {
        const mon1 = playerPokemon;
        const level1 = playerLevel;
        const sp1 = playerStylePoints;
        const steps1 = playerStatSteps;
        const stats1 = playerCalculatedStats;
        const status1 = playerStatusEffect;
        const form1 = playerForm;

        const mon2 = opponentPokemon;
        const level2 = opponentLevel;
        const sp2 = opponentStylePoints;
        const steps2 = opponentStatSteps;
        const stats2 = opponentCalculatedStats;
        const status2 = opponentStatusEffect;
        const form2 = opponentForm;

        setPlayerPokemon(mon2);
        setPlayerLevel(level2);
        setPlayerStylePoints(sp2);
        setPlayerStatSteps(steps2);
        setPlayerCalculatedStats(stats2);
        setPlayerStatusEffect(status2);
        setPlayerForm(form2);
        setPlayerMove(nullMove);

        setOpponentPokemon(mon1);
        setOpponentLevel(level1);
        setOpponentStylePoints(sp1);
        setOpponentStatSteps(steps1);
        setOpponentCalculatedStats(stats1);
        setOpponentStatusEffect(status1);
        setOpponentForm(form1);
    }

    function pokemonSelect(side: Side) {
        return (
            <>
                {!isNull(getPokemon[side]) && (
                    <div className="flex justify-center mb-4">
                        {
                            // this is a stupid solution but it didn't work if i had the ternary in the className
                            side === "player" ? (
                                <Image
                                    src={getPokemon[side].getImage(getForm[side])}
                                    alt={getPokemon[side].name}
                                    height="160"
                                    width="160"
                                    className="w-24 h-24 scale-x-[-1]"
                                />
                            ) : (
                                <Image
                                    src={getPokemon[side].getImage(getForm[side])}
                                    alt={getPokemon[side].name}
                                    height="160"
                                    width="160"
                                    className="w-24 h-24"
                                />
                            )
                        }
                    </div>
                )}
                <div className="flex justify-between items-center">
                    {getPokemon[side].forms.length > 1 && (
                        <button
                            onClick={() =>
                                handleLoadingForm(negativeMod(getForm[side] - 1, getPokemon[side].forms.length), side)
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
                    )}
                    <div className="text-center flex-grow">
                        <InputLabel>Pokémon</InputLabel>
                    </div>
                    {getPokemon[side].forms.length > 1 && (
                        <button
                            onClick={() => handleLoadingForm((getForm[side] + 1) % getPokemon[side].forms.length, side)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>

                <Dropdown
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
                </Dropdown>
            </>
        );
    }

    function pokemonStats(side: Side) {
        return !isNull(getPokemon[side]) ? (
            <div className={`space-y-6`}>
                {/* Pokemon type */}
                <div className="text-center">
                    <TypeBadge
                        type1={getPokemon[side].getType1(getForm[side])}
                        type2={getPokemon[side].getType2(getForm[side])}
                    />
                </div>

                {/* Level input */}
                <div className="text-center">
                    <InputLabel>Level</InputLabel>
                    <input
                        type="number"
                        min={MIN_LEVEL}
                        max={MAX_LEVEL}
                        className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                        value={getLevel[side]}
                        onChange={(e) => handleLevel(parseInt(e.target.value) || MIN_LEVEL, side)}
                    />
                </div>

                {/* Status input */}
                <div className="text-center">
                    <InputLabel>Status Effect</InputLabel>
                    <Dropdown
                        value={getStatusEffect[side]}
                        onChange={(e) => handleStatusEffect(e.target.value as StatusEffect, side)}
                    >
                        <option value="None" className="bg-gray-800">
                            None
                        </option>
                        {Object.values(statusEffects).map((s) => (
                            <option key={s} value={s} className="bg-gray-800">
                                {s}
                            </option>
                        ))}
                    </Dropdown>
                </div>

                {/* Stats */}
                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Stats</h3>

                    <table>
                        <thead>
                            <tr>
                                <th>Stat</th>
                                <th>Value</th>
                                <th>SP</th>
                                <th>Steps</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeKeys(getPokemon[side].getStats(getForm[side])).map((statName) => {
                                const styleName = styleFromStat(statName);
                                return (
                                    <tr key={statName}>
                                        <td className="text-gray-300 w-16 text-right">{statName.toUpperCase()}</td>
                                        <td className="text-gray-400 w-12 text-center">
                                            {getCalculatedStats[side][statName]}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min={MIN_SP}
                                                max={MAX_SP}
                                                className="w-16 px-2 py-1 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                                                value={getStylePoints[side][styleName]}
                                                onChange={(e) =>
                                                    handleStylePoints(
                                                        styleName,
                                                        parseInt(e.target.value) || MIN_SP,
                                                        side
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            {statName !== "hp" && (
                                                <input
                                                    type="number"
                                                    min={MIN_STEP}
                                                    max={MAX_STEP}
                                                    className="w-16 px-2 py-1 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
                                                    value={getStatSteps[side][statName]}
                                                    onChange={(e) =>
                                                        handleStatSteps(statName, parseInt(e.target.value) || 0, side)
                                                    }
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
                                        {pokemonSelect("player")}
                                        {pokemonStats("player")}
                                        {/* Move selection */}
                                        {!isNull(playerPokemon) && (
                                            <div className="text-center">
                                                <InputLabel>Move</InputLabel>
                                                <Dropdown
                                                    value={playerMove.id}
                                                    onChange={(e) =>
                                                        setPlayerMove(moves[e.target.value] || nullPokemon)
                                                    }
                                                >
                                                    <option value="" className="bg-gray-800">
                                                        Select Move
                                                    </option>
                                                    {playerPokemon
                                                        .allMoves(getForm["player"])
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
                                                </Dropdown>
                                            </div>
                                        )}
                                        {/* Move details */}
                                        {!isNull(playerMove) && (
                                            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                                {playerMove.getInput(customMoveVar, setCustomMoveVar)}
                                                <Checkbox
                                                    checked={criticalHit}
                                                    disabled={getStatusEffect["opponent"] === "Jinx"}
                                                    onChange={() => handleCriticalHit(!criticalHit)}
                                                >
                                                    Critical Hit
                                                </Checkbox>
                                                <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">
                                                    Move Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                    <div className="text-right text-gray-400">Type:</div>
                                                    <TypeBadge type1={playerMove.type} />
                                                    <div className="text-right text-gray-400">Power:</div>
                                                    <div className="text-left text-gray-200">
                                                        {playerMove.getPower(playerPokemonStats)}
                                                    </div>
                                                    <div className="text-right text-gray-400">Category:</div>
                                                    <div className="text-left text-gray-200">
                                                        {getMoveCategory(playerMove)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                    <div className="mt-6">
                                        <Checkbox checked={multiBattle} onChange={() => setMultiBattle(!multiBattle)}>
                                            Multi Battle
                                        </Checkbox>
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
                                        {pokemonSelect("opponent")}

                                        {pokemonStats("opponent")}
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
