"use client";

import BasicButton from "@/components/BasicButton";
import Checkbox from "@/components/Checkbox";
import Column from "@/components/Column";
import ColumnHeader from "@/components/ColumnHeader";
import FilterOptionButton from "@/components/FilterOptionButton";
import ImageFallback from "@/components/ImageFallback";
import { MiniDexFilter } from "@/components/MiniDexFilter";
import PageHeader, { PageType } from "@/components/PageHeader";
import PokemonCardHorizontal from "@/components/PokemonCardHorizontal";
import PokemonModal from "@/components/PokemonModal";
import SavedTeamManager from "@/components/SavedTeamManager";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { nullSideState, SideState } from "../data/battleState";
import { WeatherCondition, weatherConditions } from "../data/conditions";
import { Pokemon } from "../data/tectonic/Pokemon";
import { TectonicData } from "../data/tectonic/TectonicData";
import { Trainer } from "../data/tectonic/Trainer";
import { PartyPokemon } from "../data/types/PartyPokemon";
import SideStateUI from "./components/SideStateUI";

const PokemonDamageCalculator: NextPage = () => {
    const [showTeamLoad, setShowTeamLoad] = useState<boolean>(true);
    const [showTrainerLoad, setShowTrainerLoad] = useState<boolean>(true);
    const [showTeamSearch, setShowTeamSearch] = useState<boolean>(false);
    const [showOpponentSearch, setShowOpponentSearch] = useState<boolean>(false);
    const [loadedParty, setLoadedParty] = useState<PartyPokemon[]>([]);
    const [trainerText, setTrainerText] = useState<string>("");
    const [trainer, setTrainer] = useState<Trainer>(Trainer.NULL);
    const [mon, setMon] = useState<PartyPokemon | null>(null);
    const [trainerMon, setTrainerMon] = useState<PartyPokemon | null>(null);
    const [modalMon, setModalMon] = useState<Pokemon | null>(null);
    const [weather, setWeather] = useState<WeatherCondition>("None");
    const [gravity, setGravity] = useState<boolean>(false);
    const [multiBattle, setMultiBattle] = useState<boolean>(false);

    const matchingTrainers = Object.values(TectonicData.trainers)
        .filter((x) => x.displayName().toLowerCase().includes(trainerText.toLowerCase()))
        .sort((a, b) => a.displayName().localeCompare(b.displayName()));

    var playerSideState: SideState = nullSideState;
    var opponentSideState: SideState = nullSideState;
    function calcMovesDmg() {}

    return (
        <div className="min-h-screen bg-gray-900 pb-10">
            <Head>
                <title>Pokémon Tectonic Damage Calculator</title>
                <meta
                    name="description"
                    content="A damage calculator using the modified mechanics of Pokémon Tectonic"
                />
            </Head>
            <PageHeader currentPage={PageType.Calc} />

            <main className="container mx-auto mt-2">
                <Column>
                    <ColumnHeader colour="text-purple-400">Battle State</ColumnHeader>
                    <div className="flex items-center gap-2">
                        <select
                            className="px-4 py-2 rounded-md bg-gray-700 border border-gray-600"
                            value={weather}
                            onChange={(e) => {
                                setWeather(e.target.value as WeatherCondition);
                                calcMovesDmg();
                            }}
                        >
                            <option value="None">Select Weather</option>
                            {weatherConditions.map((w) => (
                                <option key={w} value={w}>
                                    {w}
                                </option>
                            ))}
                        </select>
                        <Checkbox
                            checked={gravity}
                            onChange={() => {
                                setGravity(!gravity);
                                calcMovesDmg();
                            }}
                        >
                            Gravity
                        </Checkbox>
                        <Checkbox
                            checked={multiBattle}
                            onChange={() => {
                                setMultiBattle(!multiBattle);
                                calcMovesDmg();
                            }}
                        >
                            Multi Battle
                        </Checkbox>
                    </div>
                </Column>
                <div className="flex justify-center">
                    <Column>
                        <ColumnHeader colour="text-blue-400">Your Side</ColumnHeader>
                        <SideStateUI
                            onUpdate={(state) => {
                                playerSideState = state;
                                calcMovesDmg();
                            }}
                        />

                        {mon != null && (
                            <PokemonCardHorizontal
                                partyMon={mon}
                                onUpdate={() => {
                                    const newMon = new PartyPokemon(mon);
                                    const oldIndex = loadedParty.findIndex((x) => x == mon);
                                    const newLoadedParty = [...loadedParty];
                                    if (oldIndex == -1 && newLoadedParty.length < 6) {
                                        newLoadedParty.push(newMon);
                                    } else {
                                        newLoadedParty[oldIndex] = newMon;
                                    }

                                    setMon(newMon);
                                    setLoadedParty(newLoadedParty);
                                }}
                                onRemove={() => {
                                    setLoadedParty(loadedParty.filter((r) => r != mon));
                                    setMon(null);
                                }}
                                showBattleConfig={true}
                            />
                        )}
                        {mon != null && loadedParty.find((x) => x == mon) == undefined && loadedParty.length < 6 && (
                            <BasicButton
                                onClick={() => {
                                    if (loadedParty.length < 6) {
                                        setLoadedParty([...loadedParty, mon]);
                                    }
                                }}
                            >
                                Add To Team
                            </BasicButton>
                        )}
                        <div className="w-fit h-fit overflow-auto mx-auto">
                            <div className="flex flex-wrap items-center mx-auto">
                                {loadedParty.map((x) => (
                                    <ImageFallback
                                        key={x.species.id}
                                        className="hover:bg-yellow-highlight cursor-pointer"
                                        src={x.species.getIcon()}
                                        alt={x.species.name}
                                        width={64}
                                        height={64}
                                        title={x.species.name}
                                        onClick={() => setMon(x)}
                                        onContextMenu={() => setModalMon(x.species)}
                                    />
                                ))}
                            </div>
                        </div>

                        <hr className="w-full my-3" />
                        <div className="flex gap-2">
                            <FilterOptionButton
                                isSelected={showTeamSearch}
                                onClick={() => {
                                    setShowTeamSearch(!showTeamSearch);
                                    setShowTeamLoad(false);
                                }}
                            >
                                Dex Search
                            </FilterOptionButton>
                            <FilterOptionButton
                                isSelected={showTeamLoad}
                                onClick={() => {
                                    setShowTeamSearch(false);
                                    setShowTeamLoad(!showTeamLoad);
                                }}
                            >
                                Team
                            </FilterOptionButton>
                        </div>
                        {showTeamSearch && (
                            <MiniDexFilter onMon={(mon) => setMon(new PartyPokemon({ species: mon }))} />
                        )}
                        {showTeamLoad && <SavedTeamManager onLoad={setLoadedParty} exportMons={loadedParty} />}
                    </Column>

                    <Column>
                        <ColumnHeader colour="text-red-400">Opponent Side</ColumnHeader>
                        <SideStateUI
                            onUpdate={(state) => {
                                opponentSideState = state;
                                calcMovesDmg();
                            }}
                        />

                        {trainerMon != null && (
                            <PokemonCardHorizontal
                                partyMon={trainerMon}
                                onUpdate={() => {
                                    setTrainerMon(new PartyPokemon(trainerMon));
                                }}
                                onRemove={() => {
                                    setTrainerMon(null);
                                }}
                                showBattleConfig={true}
                            />
                        )}
                        <div className="w-fit h-fit overflow-auto mx-auto">
                            <div className="flex flex-wrap items-center mx-auto">
                                {trainer != Trainer.NULL && (
                                    <div className="flex flex-col items-center w-48">
                                        <ImageFallback
                                            src={trainer.getImageSrc()}
                                            alt={trainer.displayName()}
                                            title={trainer.displayName()}
                                            height={160}
                                            width={160}
                                            className="w-18 h-18 hover:bg-yellow-highlight cursor-pointer"
                                            onClick={() => setTrainer(Trainer.NULL)}
                                        />
                                        <span className="text-sm text-center">{trainer.displayName()}</span>
                                    </div>
                                )}
                                {trainer.pokemon.map((x) => (
                                    <ImageFallback
                                        key={x.pokemon.id}
                                        className={`hover:bg-yellow-highlight cursor-pointer`}
                                        src={x.pokemon.getIcon()}
                                        alt={x.pokemon.name}
                                        width={64}
                                        height={64}
                                        title={x.nickname ?? x.pokemon.name}
                                        onClick={() =>
                                            setTrainerMon(
                                                new PartyPokemon({
                                                    species: x.pokemon,
                                                    level: x.level,
                                                    stylePoints: x.sp,
                                                    moves: [...x.moves],
                                                    items: [...x.items],
                                                    itemType: x.itemType,
                                                    ability: x.ability,
                                                    nickname: x.nickname,
                                                })
                                            )
                                        }
                                        onContextMenu={() => setModalMon(x.pokemon)}
                                    />
                                ))}
                            </div>
                        </div>

                        <hr className="w-full my-3" />
                        <div className="flex items-center gap-2">
                            <FilterOptionButton
                                isSelected={showOpponentSearch}
                                onClick={() => {
                                    setShowOpponentSearch(!showOpponentSearch);
                                    setShowTrainerLoad(false);
                                }}
                            >
                                Dex Search
                            </FilterOptionButton>
                            <FilterOptionButton
                                isSelected={showTrainerLoad}
                                onClick={() => {
                                    setShowOpponentSearch(false);
                                    setShowTrainerLoad(!showTrainerLoad);
                                }}
                            >
                                Trainers
                            </FilterOptionButton>
                        </div>
                        {showTrainerLoad && (
                            <div className="flex flex-col items-center mt-2 text-white">
                                <input
                                    className="h-fit border rounded px-2 py-1 bg-gray-700 border-gray-600"
                                    list="trainersData"
                                    value={trainerText}
                                    onChange={(e) => setTrainerText(e.target.value)}
                                    placeholder="In game trainer"
                                />
                                <datalist id="trainersData">
                                    {Object.values(TectonicData.trainers).map((t) => (
                                        <option key={t.id}>{t.displayName()}</option>
                                    ))}
                                </datalist>
                                <div className="h-72 overflow-auto mx-auto mt-2">
                                    <div className="flex flex-wrap mx-auto">
                                        {matchingTrainers.map((x) => (
                                            <div
                                                key={x.id}
                                                className="flex flex-col items-center w-24"
                                                onClick={() => setTrainer(x)}
                                            >
                                                <ImageFallback
                                                    src={x.getImageSrc()}
                                                    alt={x.displayName()}
                                                    title={x.displayName()}
                                                    height={160}
                                                    width={160}
                                                    className={`w-18 h-18 hover:bg-yellow-highlight cursor-pointer ${
                                                        trainer == x ? "bg-yellow-highlight" : ""
                                                    }`}
                                                />
                                                <span className="text-sm text-center">{x.displayName()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {showOpponentSearch && (
                            <MiniDexFilter onMon={(mon) => setTrainerMon(new PartyPokemon({ species: mon }))} />
                        )}
                    </Column>
                </div>

                {modalMon && <PokemonModal pokemon={modalMon} handlePokemonClick={setModalMon} />}
            </main>
        </div>
    );
};

export default PokemonDamageCalculator;
