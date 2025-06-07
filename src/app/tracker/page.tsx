"use client";

import FilterOptionButton from "@/components/FilterOptionButton";
import ImageFallback, { IMG_NOT_FOUND } from "@/components/ImageFallback";
import { LoadedEncounterMap, LoadedEncounterTable } from "@/preload/loadedDataClasses";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { TectonicData } from "../data/tectonic/TectonicData";

const tableDisplayNameMap: Record<string, string> = {
    Special: "Other",
    Land: "Grass",
    LandTinted: "Secret Grass",
    FloweryGrass: "Yellow Flowers",
    LandTall: "Tall Grass",
    DarkCave: "Dark Ground",
    LandSparse: "Sparse Grass",
    Puddle: "Puddle",
    Mud: "Mud",
    FloweryGrass2: "Blue Flowers",
    SewerFloor: "Dirty Floor",
    SewerWater: "Sewage",
    Cloud: "Dark Clouds",
    ActiveWater: "Deep Water",
    FishingContest: "Surfing",
};

class EncounterPick {
    encounterMonId: string;
    monId: string;
    isCaught: boolean;

    constructor(encounterMonId: string, monId: string, isCaught: boolean) {
        this.encounterMonId = encounterMonId;
        this.monId = monId;
        this.isCaught = isCaught;
    }
}

class Playthrough {
    private static localStorageKey = "EncounterTrackerLocalStorageKey_V1";
    private static localData: Playthrough[] = [];

    private key: number;
    private name: string = "Playthrough 1";
    private picks: Record<string, EncounterPick> = {};

    private constructor(name: string) {
        this.key = performance.now();
        this.name = name;
    }

    static addNewPlaythrough(name?: string): number {
        const playthrough = new Playthrough(name ?? "New Playthrough");
        this.localData.push(playthrough);

        this.saveLocalData();
        return playthrough.key;
    }

    static getPlayThroughs(): number[] {
        return this.localData.map((x) => x.key);
    }

    static getPlayThrough(key?: number): Playthrough | undefined {
        return this.localData.find((x) => x.key == key);
    }

    static loadLocalData(): Playthrough[] {
        const value = localStorage.getItem(this.localStorageKey);
        const loaded = (this.localData = value ? JSON.parse(value) : []) as Playthrough[];

        this.localData = loaded.map((x) => {
            const playthrough = new Playthrough(x.name);
            playthrough.key = x.key;
            playthrough.picks = x.picks;

            return playthrough;
        });
        return this.localData;
    }

    static saveLocalData() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.localData));
    }

    setName(name: string) {
        this.name = name;
        Playthrough.saveLocalData();
    }

    getName(): string {
        return this.name;
    }

    setPick(key: string, pick: EncounterPick) {
        this.picks[key] = pick;
        Playthrough.saveLocalData();
    }

    removePick(key: string) {
        delete this.picks[key];
        Playthrough.saveLocalData();
    }

    getPick(key: string): EncounterPick | undefined {
        return this.picks[key];
    }

    delete() {
        Playthrough.localData = Playthrough.localData.filter((x) => x.key != this.key);
        Playthrough.saveLocalData();
    }
}

class EncounterDisplayData {
    key: string;
    map: LoadedEncounterMap;
    tableDisplayName: string;
    maxLevel: number;
    minLevel: number;
    displayMonData: [encounterMonId: string, monId: string, display: string][];

    constructor(map: LoadedEncounterMap, table: LoadedEncounterTable) {
        this.key = `${map.key} - ${table.type} - ${table.encounters.join(",")}`;
        this.map = map;
        this.tableDisplayName = tableDisplayNameMap[table.type];
        this.minLevel = 10000;
        this.maxLevel = -1;
        this.displayMonData = [];

        for (const e of table.encounters) {
            this.minLevel = Math.min(this.minLevel, e.minLevel);
            this.maxLevel = Math.max(this.maxLevel, e.maxLevel ?? e.minLevel);

            const mon = TectonicData.pokemon[e.pokemon];
            const monName = mon?.name ?? `Not Found - ${e.pokemon}`;
            const formName = mon == undefined ? undefined : mon.getFormName(e.form ?? 0);
            this.displayMonData.push([e.pokemon, mon.id, `${monName}${formName ? ` - ${formName}` : ""}`]);
        }

        this.displayMonData = this.displayMonData.sort(([, displayA], [, displayB]) =>
            displayA.localeCompare(displayB)
        );
    }

    static buildDisplayData(displaySpecial: boolean): EncounterDisplayData[] {
        return Object.values(TectonicData.encounters)
            .flatMap((m) =>
                m.tables
                    .filter((t) => (displaySpecial ? t.type == "Special" : t.type != "Special"))
                    .map((t) => new EncounterDisplayData(m, t))
            )
            .sort((a, b) => a.maxLevel - b.maxLevel);
    }
}

function EncounterDisplay({
    selectedPlaythrough,
    data,
}: {
    selectedPlaythrough: number;
    data: EncounterDisplayData;
}): ReactNode {
    const [selectedOption, setSelectedOption] = useState<EncounterPick | undefined>(undefined);

    useEffect(() => {
        setSelectedOption(Playthrough.getPlayThrough(selectedPlaythrough)?.getPick(data.key));
    }, [selectedPlaythrough, data]);

    return (
        <div className="w-full md:w-150 border rounded-2xl p-2 mx-auto">
            <div className="flex justify-between">
                <div className="flex flex-col md:flex-row md:space-x-2 text-xl">
                    <div>{data.map.name}</div>
                    <div className="hidden md:inline">-</div>
                    <div>{data.tableDisplayName}</div>
                </div>
                <span className="text-sm rounded-full my-auto px-2 py-1 bg-blue-700">Lvl. {data.maxLevel}</span>
            </div>
            <hr className="mt-1 mb-3" />
            <div className="text-center">
                <div className={selectedOption ? "flex justify-center" : "hidden"}>
                    <ImageFallback
                        alt={"Selection"}
                        src={selectedOption ? TectonicData.pokemon[selectedOption.monId].getImage() : IMG_NOT_FOUND}
                        width={160}
                        height={160}
                    />
                    <div className="text-xl my-auto">
                        <div
                            className={`w-fit h-fit px-2 py-1 m-1 border rounded-full cursor-pointer hover:bg-selection-yellow hover:text-black ${
                                selectedOption?.isCaught ? "bg-selection-yellow text-black" : ""
                            }`}
                            onClick={() => {
                                const newPick = new EncounterPick(
                                    selectedOption!.encounterMonId,
                                    selectedOption!.monId,
                                    true
                                );
                                Playthrough.getPlayThrough(selectedPlaythrough)?.setPick(data.key, newPick);
                                setSelectedOption(newPick);
                            }}
                        >
                            &#10004; Caught
                        </div>
                        <div
                            className={`w-fit h-fit px-2 py-1 m-1 border rounded-full cursor-pointer hover:bg-selection-yellow hover:text-black ${
                                !selectedOption?.isCaught ? "bg-selection-yellow text-black" : ""
                            }`}
                            onClick={() => {
                                const newPick = new EncounterPick(
                                    selectedOption!.encounterMonId,
                                    selectedOption!.monId,
                                    false
                                );
                                Playthrough.getPlayThrough(selectedPlaythrough)?.setPick(data.key, newPick);
                                setSelectedOption(newPick);
                            }}
                        >
                            &#10799; Lost
                        </div>
                    </div>
                </div>
                <span className={selectedOption ? "hidden" : "text-xl text-amber-300"}>Encounter Available</span>
            </div>
            <div className="flex justify-center flex-wrap">
                {data.displayMonData.map(([encounterMonId, monId, display], index) => (
                    <div
                        key={index}
                        className={`w-fit h-fit px-2 py-1 m-1 border rounded-full cursor-pointer hover:bg-selection-yellow hover:text-black ${
                            selectedOption?.encounterMonId == encounterMonId ? "bg-selection-yellow text-black" : ""
                        }`}
                        onClick={() => {
                            const newSelection =
                                selectedOption?.encounterMonId == encounterMonId
                                    ? undefined
                                    : new EncounterPick(encounterMonId, monId, true);
                            if (newSelection) {
                                Playthrough.getPlayThrough(selectedPlaythrough)?.setPick(data.key, newSelection);
                            } else {
                                Playthrough.getPlayThrough(selectedPlaythrough)?.removePick(data.key);
                            }
                            setSelectedOption(newSelection);
                        }}
                    >
                        {display}
                    </div>
                ))}
            </div>
        </div>
    );
}

const EncounterTracker: NextPage = () => {
    const [, setLoaded] = useState<boolean>(false);
    const [selectedPlaythrough, setSelectedPlaythrough] = useState<number | undefined>(undefined);
    const [playthroughName, setPlaythroughName] = useState<string>("New Playthrough");
    const [displaySpecial, setDisplaySpecial] = useState<boolean>(false);

    useEffect(() => {
        Playthrough.loadLocalData();
        setLoaded(true);
    }, []);

    return (
        <Fragment>
            <Head>
                <title>Tectonic Encounter Tracker</title>
                <meta name="description" content="Pokémon encounter tracker for the fangame Pokémon Tectonic" />
            </Head>

            {selectedPlaythrough ? (
                <main className="min-h-screen flex flex-col space-y-3 p-3 bg-gray-900 text-white">
                    <div className="flex justify-between space-x-5 w-full md:w-150 mx-auto pb-2 bg-gray-900 sticky top-0">
                        <button
                            className="text-4xl hover:text-selection-yellow cursor-pointer"
                            onClick={() => {
                                setSelectedPlaythrough(undefined);
                                setDisplaySpecial(false);
                                setPlaythroughName("New Playthrough");
                            }}
                        >
                            {"\u21A2"}
                        </button>
                        <div className="flex space-x-2">
                            <input
                                className="w-40 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                                placeholder="Playthrough Name"
                                value={playthroughName}
                                onChange={(e) => {
                                    setPlaythroughName(e.target.value);
                                    Playthrough.getPlayThrough(selectedPlaythrough)?.setName(e.target.value);
                                }}
                            />
                            <FilterOptionButton
                                onClick={() => setDisplaySpecial(!displaySpecial)}
                                isSelected={displaySpecial}
                            >
                                <span className="text-3xl">&#127872;</span>
                            </FilterOptionButton>
                        </div>
                        <button
                            className="text-4xl hover:text-selection-yellow cursor-pointer"
                            onClick={() => {
                                if (confirm("Delete playthrough?")) {
                                    Playthrough.getPlayThrough(selectedPlaythrough)?.delete();
                                    setSelectedPlaythrough(undefined);
                                }
                            }}
                        >
                            {"\u2715"}
                        </button>
                    </div>
                    {EncounterDisplayData.buildDisplayData(displaySpecial).map((e, index) => (
                        <EncounterDisplay key={index} selectedPlaythrough={selectedPlaythrough} data={e} />
                    ))}
                </main>
            ) : (
                <main className="min-h-screen p-3 bg-gray-900 text-white">
                    <div className="text-3xl text-center">
                        <Link className="hover:text-blue-400" href="../">
                            Tectonic Tracker
                        </Link>
                    </div>
                    <div className="flex w-fit mx-auto mt-2">
                        <input
                            className="px-4 py-2 mt-1.25 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={playthroughName}
                            placeholder="New Playthrough"
                            onChange={(e) => setPlaythroughName(e.target.value)}
                        />
                        <button
                            className="text-5xl ml-2 hover:text-selection-yellow"
                            onClick={() => {
                                setSelectedPlaythrough(Playthrough.addNewPlaythrough(playthroughName));
                            }}
                        >
                            {"\u2295"}
                        </button>
                    </div>
                    <hr className="my-3" />
                    <div className="text-center text-2xl">Playthroughs</div>
                    {Playthrough.getPlayThroughs().map((x, index) => (
                        <div
                            key={index}
                            className="w-full md:w-150 text-center border rounded-2xl p-2 my-2 mx-auto hover:bg-selection-yellow hover:text-black cursor-pointer"
                            onClick={() => {
                                setPlaythroughName(Playthrough.getPlayThrough(x)?.getName() ?? playthroughName);
                                setSelectedPlaythrough(x);
                            }}
                        >
                            {Playthrough.getPlayThrough(x)?.getName()}
                        </div>
                    ))}
                </main>
            )}
        </Fragment>
    );
};
export default EncounterTracker;
