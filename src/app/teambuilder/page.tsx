"use client";

import BasicButton from "@/components/BasicButton";
import { getTypeColorClass } from "@/components/colours";
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
import DefTotalCell, { CompareEnum } from "./components/DefTotalCell";
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

                    <hr className="my-3 w-full text-blue-500/50" />
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

                    <hr className="my-3 w-full text-blue-500/50" />
                    <div className="flex flex-wrap justify-center gap-2">
                        <div>
                            <div className="text-center text-3xl text-white">Defensive Matchups</div>
                            <table className="mx-auto divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th></th>
                                        {party.map((c, i) => (
                                            <MatchupMonCell key={i} c={c} useMoves={false} />
                                        ))}
                                        <th className="p-1 border border-gray-600">Weak</th>
                                        <th className="p-1 border border-gray-600">Resist</th>
                                        <th className="p-1 border border-gray-600">Immune</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {TectonicData.realTypes.map((t) => (
                                        <tr key={t.id} className={`${getTypeColorClass(t, " hover:bg")}`}>
                                            <TypeBadge types={[t]} element={TypeBadgeElementEnum.TABLE_ROW} />
                                            {party.map((c, i) => (
                                                <TypeChartCell
                                                    key={i}
                                                    mult={calcTypeMatchup(
                                                        { type: t },
                                                        {
                                                            type1: c.types.type1,
                                                            type2: c.types.type2,
                                                            ability: c.ability,
                                                        }
                                                    )}
                                                />
                                            ))}
                                            <DefTotalCell cards={party} type={t} compare={CompareEnum.Weak} />
                                            <DefTotalCell cards={party} type={t} compare={CompareEnum.Resist} />
                                            <DefTotalCell cards={party} type={t} compare={CompareEnum.Immune} />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <div className="text-center text-3xl text-white">Offensive Coverage</div>
                            <table className="mx-auto divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th></th>
                                        {party.map((c, i) => (
                                            <MatchupMonCell key={i} c={c} useMoves={true} />
                                        ))}
                                        <th className="p-1 border border-gray-600">Super</th>
                                        <th className="p-1 border border-gray-600">Resist</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {TectonicData.realTypes.map((t) => (
                                        <tr key={t.id} className={`${getTypeColorClass(t, " hover:bg")}`}>
                                            <TypeBadge types={[t]} element={TypeBadgeElementEnum.TABLE_ROW} />
                                            {party.map((c, i) => (
                                                <TypeChartCell key={i} mult={calcBestMoveMatchup(c, { type1: t })} />
                                            ))}
                                            <AtkTotalCell cards={party} type={t} total="se" />
                                            <AtkTotalCell cards={party} type={t} total="nve" />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeamBuilder;
