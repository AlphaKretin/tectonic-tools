"use client";

import BasicButton from "@/components/BasicButton";
import { MiniDexFilter } from "@/components/MiniDexFilter";
import PageHeader, { PageType } from "@/components/PageHeader";
import PokemonCardHorizontal from "@/components/PokemonCardHorizontal";
import TribeCapsule from "@/components/TribeCapsule";
import TypeBadge, { TypeBadgeElementEnum } from "@/components/TypeBadge";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import TypeChartCell from "../../components/TypeChartCell";
import { decodeTeam, encodeTeam } from "../data/teamExport";
import { Pokemon } from "../data/tectonic/Pokemon";
import { TectonicData } from "../data/tectonic/TectonicData";
import { calcBestMoveMatchup, calcTypeMatchup } from "../data/typeChart";
import { PartyPokemon } from "../data/types/PartyPokemon";
import AtkTotalCell from "./components/AtkTotalCell";
import DefTotalCell from "./components/DefTotalCell";
import MatchupMonCell from "./components/MatchupMonCell";

const TeamBuilder: NextPage = () => {
    const [teamCode, setTeamCode] = useState<string>("");
    const [party, setParty] = useState<PartyPokemon[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const teamParam = params.get("team");
            if (teamParam) {
                setTeamCode(teamParam);
                try {
                    setParty(decodeTeam(teamParam));
                } catch (error) {
                    console.error("Import error:", error);
                    alert("Invalid team code! Please check and try again.");
                }
            }
        }
    }, []);

    const tribeCounts = Object.fromEntries(Object.values(TectonicData.tribes).map((t) => [t.id, 0]));
    for (const partyMon of party) {
        for (const tribe of partyMon.items.some((i) => i.id === "WILDCARD")
            ? Object.keys(TectonicData.tribes)
            : partyMon.species.tribes.map((t) => t.id)) {
            tribeCounts[tribe]++;
        }
    }

    function exportTeam() {
        const code = encodeTeam(party);
        setTeamCode(code);
        navigator.clipboard.writeText(code);
        alert(`Team copied to clipboard!`);
    }

    function importTeam() {
        try {
            setParty(decodeTeam(teamCode).filter((x) => x.species != Pokemon.NULL));
            alert("Team imported successfully!");
        } catch (error) {
            console.error("Import error:", error);
            alert("Invalid team code! Please check and try again.");
        }
    }

    function addPokemon(mon: Pokemon) {
        if (party.length < 6) {
            setParty([...party, new PartyPokemon({ species: mon })]);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Head>
                <title>Pokémon Tectonic Team Builder</title>
                <meta name="description" content="Analyse team composition for the fangame Pokémon Tectonic" />
            </Head>
            <PageHeader currentPage={PageType.Builder} />

            <main className="container mx-auto">
                <div className="flex flex-col justify-center items-center pb-10 relative">
                    <div className="flex gap-2 mt-3">
                        <input
                            type="text"
                            placeholder="Team code"
                            className="px-4 py-2 border border-gray-300 rounded-md"
                            value={teamCode}
                            onChange={(e) => setTeamCode(e.target.value)}
                        />
                        <BasicButton onClick={importTeam}>Import</BasicButton>
                        <BasicButton onClick={exportTeam}>Export</BasicButton>
                    </div>
                    <MiniDexFilter onMon={addPokemon} />
                    <div className="flex flex-wrap gap-2 mt-2 p-2">
                        {Object.keys(tribeCounts)
                            .filter((t) => tribeCounts[t] >= 1)
                            .sort((a, b) => tribeCounts[b] - tribeCounts[a])
                            .map((t) => (
                                <TribeCapsule key={t} tribe={TectonicData.tribes[t]} count={tribeCounts[t]} />
                            ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 mx-auto mt-2">
                        {party.map((x, index) => (
                            <PokemonCardHorizontal
                                key={index}
                                partyMon={x}
                                onRemove={() => setParty(party.filter((r) => r != x))}
                                onUpdate={() => setParty([...party])}
                            />
                        ))}
                    </div>

                    <h2 className="my-4 text-2xl font-bold text-gray-100">Defensive Matchups</h2>
                    <table className="mx-auto divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th></th>
                                {TectonicData.realTypes.map((type) => (
                                    <TypeBadge
                                        key={type.id}
                                        types={[type]}
                                        element={TypeBadgeElementEnum.TABLE_HEADER}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {party.map((c, index) => (
                                <tr key={index}>
                                    <MatchupMonCell c={c} useMoves={false} />
                                    {TectonicData.realTypes.map((type) => (
                                        <TypeChartCell
                                            key={type.id}
                                            mult={calcTypeMatchup(
                                                { type: type },
                                                { type1: c.types.type1, type2: c.types.type2, ability: c.ability }
                                            )}
                                        />
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td></td>
                                {TectonicData.realTypes.map((type) => (
                                    <TypeBadge key={type.id} types={[type]} element={TypeBadgeElementEnum.TABLE_ROW} />
                                ))}
                            </tr>
                            <tr className="text-end text-xl text-gray-300 bg-gray-700">
                                <td className="pr-2 border border-gray-600">Weaknesses</td>
                                {TectonicData.realTypes.map((type) => (
                                    <DefTotalCell key={type.id} cards={party} type={type} total={"weak"} />
                                ))}
                            </tr>
                            <tr className="text-end text-xl text-gray-300 bg-gray-700">
                                <td className="pr-2 border border-gray-600">Resistances</td>
                                {TectonicData.realTypes.map((type) => (
                                    <DefTotalCell key={type.id} cards={party} type={type} total={"strong"} />
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    <h2 className="my-4 text-2xl font-bold text-gray-100">Offensive Coverage</h2>
                    <table className="mx-auto divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th></th>
                                {TectonicData.realTypes.map((type) => (
                                    <TypeBadge
                                        key={type.id}
                                        types={[type]}
                                        element={TypeBadgeElementEnum.TABLE_HEADER}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {party.map((c, index) => (
                                <tr key={index}>
                                    <MatchupMonCell c={c} useMoves={true} />
                                    {TectonicData.realTypes.map((type) => (
                                        <TypeChartCell key={type.id} mult={calcBestMoveMatchup(c, { type1: type })} />
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td></td>
                                {TectonicData.realTypes.map((type) => (
                                    <TypeBadge key={type.id} types={[type]} element={TypeBadgeElementEnum.TABLE_ROW} />
                                ))}
                            </tr>
                            <tr className="text-end text-xl text-gray-300 bg-gray-700">
                                <td className="pr-2 border border-gray-600">Weak</td>
                                {TectonicData.realTypes.map((type) => (
                                    <AtkTotalCell key={type.id} cards={party} type={type} total={"se"} />
                                ))}
                            </tr>
                            <tr className="text-end text-xl text-gray-300 bg-gray-700">
                                <td className="pr-2 border border-gray-600">Resisted</td>
                                {TectonicData.realTypes.map((type) => (
                                    <AtkTotalCell key={type.id} cards={party} type={type} total={"nve"} />
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default TeamBuilder;
