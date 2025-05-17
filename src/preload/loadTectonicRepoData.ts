import { NTreeNode } from "@/app/data/types/NTreeNode";
import { uniq } from "@/app/data/util";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import {
    LoadedAbility,
    LoadedDataJson,
    LoadedEncounterMap,
    LoadedItem,
    LoadedMove,
    LoadedPokemon,
    LoadedTrainer,
    LoadedTrainerType,
    LoadedTribe,
    LoadedType,
    PokemonEvolutionTerms,
} from "./loadedDataClasses";
import { parseEncounterFile, parseNewLineCommaFile, parseStandardFile, parseVersionFile } from "./tectonicFileParsers";

async function dataRead(filePath: string) {
    const basePath = path.join(__dirname, "../../public/data/");
    const fullPath = basePath + filePath;

    const fileData = await readFile(fullPath, "utf-8");
    return JSON.parse(fileData);
}

async function dataWrite<T>(filePath: string, contents: Record<string, T> | number[][] | string) {
    const basePath = path.join(__dirname, "../../public/data/");
    const fullPath = basePath + filePath;

    const output = typeof contents === "string" ? contents : JSON.stringify(contents);
    await writeFile(fullPath, output);
}

async function handleFiles<T>(paths: string[], processor: (files: string[]) => T, dev: boolean): Promise<T> {
    const baseUrl = `https://raw.githubusercontent.com/xeuorux/Pokemon-Tectonic/refs/heads/${
        dev ? "development" : "main"
    }/`;

    const responses = await Promise.all(paths.map((path) => fetch(baseUrl + path)));
    const files: string[] = [];
    for (const response of responses) {
        if (!response.ok) {
            throw new Error(`Fetching ${response.url} status: ${response.status}`);
        }

        files.push(await response.text());
    }

    return processor(files);
}

function propgatePokemonData(version: string, loadData: Record<string, LoadedPokemon>): void {
    // Propagate data not requiring the evo tree to be built
    Object.values(loadData).forEach((loadMon, index) => {
        function buildEvoTree(curNode: NTreeNode<PokemonEvolutionTerms>, cur: LoadedPokemon) {
            cur.evolutionTree = loadMon.evolutionTree;
            for (const evo of cur.evolutions) {
                buildEvoTree(curNode.addChild(evo), loadData[evo.pokemon]);
            }
        }

        loadMon.dexNum = index + 1;
        if (loadMon.evolutionTree) return;

        loadMon.evolutionTree = new NTreeNode(new PokemonEvolutionTerms(loadMon.key, "", ""));
        buildEvoTree(loadMon.evolutionTree, loadMon);
    });

    // Propagate data requiring the evolution tree
    Object.values(loadData).forEach((loadMon) => {
        const evoNode = loadMon.evolutionTree?.findDepthFirst((x) => x.getData().pokemon == loadMon.key);
        if (!evoNode) return;

        const nodeWithTribes = evoNode.findBySelfAndParents((x) => loadData[x.getData().pokemon].tribes.length > 0);
        if (nodeWithTribes) {
            loadMon.tribes = loadData[nodeWithTribes.getData().pokemon].tribes;
        }

        if (version.startsWith("3.2")) {
            const nodeWithMoves = evoNode.findBySelfAndParents(
                (x) => loadData[x.getData().pokemon].lineMoves.length > 0
            );
            if (nodeWithMoves) {
                loadMon.lineMoves = loadData[nodeWithMoves.getData().pokemon].lineMoves;
            }
        } else if (!evoNode.isRoot()) {
            // Propogate moves when not the first evolution
            const prevo = loadData[evoNode.getParent()!.getData().pokemon];
            loadMon.lineMoves = prevo.lineMoves.concat(loadMon.lineMoves);
            loadMon.levelMoves = uniq(loadMon.levelMoves.concat(prevo.levelMoves)).sort((a, b) => a.level - b.level);
        }
    });
}

function propagateTrainerData(trainers: Record<string, LoadedTrainer>): void {
    for (const trainerId in trainers) {
        if (trainers[trainerId].extendsVersion !== undefined) {
            const key =
                trainers[trainerId].class +
                "," +
                trainers[trainerId].name +
                (trainers[trainerId].extendsVersion ? "," + trainers[trainerId].extendsVersion : "");
            const extendedTrainer = trainers[key];
            if (!extendedTrainer) {
                throw new Error("Undefined extended trainer " + key + "!");
            }
            trainers[trainerId].flags = extendedTrainer.flags.concat(trainers[trainerId].flags);
            const updatedPokemon = [...extendedTrainer.pokemon];
            for (const pokemon of trainers[trainerId].pokemon) {
                const extendedPokemonIndex = extendedTrainer.pokemon.findIndex((p) => p.id === pokemon.id);
                if (extendedPokemonIndex === -1) {
                    updatedPokemon.push(pokemon);
                } else {
                    const newPokemon = { ...extendedTrainer.pokemon[extendedPokemonIndex] };
                    newPokemon.abilityIndex = pokemon.abilityIndex;
                    if (pokemon.itemType) {
                        newPokemon.itemType = pokemon.itemType;
                    }
                    if (pokemon.items.length > 0) {
                        newPokemon.items = pokemon.items;
                    }
                    if (pokemon.moves.length > 0) {
                        newPokemon.moves = pokemon.moves;
                    }
                    if (pokemon.sp.length > 0) {
                        newPokemon.sp = pokemon.sp;
                    }
                    updatedPokemon[extendedPokemonIndex] = newPokemon;
                }
            }
            trainers[trainerId].pokemon = updatedPokemon;
        }
    }
}

function propagateSignatures(data: LoadedDataJson) {
    const abilityCounts = Object.fromEntries(Object.keys(data.abilities).map((k) => [k, 0]));
    const moveCounts = Object.fromEntries(Object.keys(data.moves).map((k) => [k, 0]));

    // Count only values of final evolutions
    Object.values(data.pokemon)
        .filter((x) => x.evolutionTree!.findDepthFirst((e) => e.getData().pokemon == x.key)?.isLeaf())
        .forEach((x) => {
            x.abilities.forEach((a) => abilityCounts[a]++);
            LoadedPokemon.getAllMoves(x).forEach((m) => moveCounts[m]++);
        });

    Object.entries(abilityCounts).forEach(([k, v]) => (data.abilities[k].isSignature = v <= 1));
    Object.entries(moveCounts).forEach(([k, v]) => (data.moves[k].isSignature = v <= 1));
}

function buildTypeChart(types: Record<string, LoadedType>): number[][] {
    const size = Object.keys(types).length;
    const typeChart: number[][] = [];
    for (let i = 0; i < size; i++) {
        typeChart[i] = Array(size).fill(1.0);
    }

    for (const atkType in types) {
        const attacker = types[atkType];
        for (const defType in types) {
            const defender = types[defType];
            if (defender.weaknesses.includes(attacker.key)) {
                typeChart[attacker.index][defender.index] = 2.0;
            } else if (defender.resistances.includes(attacker.key)) {
                typeChart[attacker.index][defender.index] = 0.5;
            } else if (defender.immunities.includes(attacker.key)) {
                typeChart[attacker.index][defender.index] = 0.0;
            }
        }
    }

    return typeChart;
}

function setupPokemonDataForWrite(loadData: Record<string, LoadedPokemon>) {
    Object.values(loadData).forEach((loadMon) => {
        loadMon.evolutionTreeArray = loadMon.evolutionTree?.toArray();
        loadMon.evolutionTree = undefined;
    });
}

async function loadData(dev: boolean = false): Promise<void> {
    // Fetch the data and load it into a usable format
    const version: string = await handleFiles(
        ["Plugins/_Settings/GameSettings.rb"],
        (f: string[]) => parseVersionFile(f[0]),
        dev
    );
    const loadedData: LoadedDataJson = {
        version: version,
        types: {},
        tribes: {},
        abilities: {},
        moves: {},
        items: {},
        pokemon: {},
        forms: {},
        trainerTypes: {},
        trainers: {},
        encounters: {},
        typeChart: [],
    };

    await Promise.all([
        await handleFiles(
            ["PBS/types.txt"],
            (f: string[]) => (loadedData.types = parseStandardFile(version, LoadedType, LoadedType.populateMap, f)),
            dev
        ),
        await handleFiles(
            ["PBS/tribes.txt"],
            (f: string[]) =>
                (loadedData.tribes = parseNewLineCommaFile(version, LoadedTribe, LoadedTribe.populateMap, f[0])),
            dev
        ),
        await handleFiles(
            ["PBS/abilities.txt", "PBS/abilities_new.txt"],
            (f: string[]) =>
                (loadedData.abilities = parseStandardFile(version, LoadedAbility, LoadedAbility.populateMap, f)),
            dev
        ),
        await handleFiles(
            ["PBS/moves.txt", "PBS/moves_new.txt"],
            (f: string[]) => (loadedData.moves = parseStandardFile(version, LoadedMove, LoadedMove.populateMap, f)),
            dev
        ),
        await handleFiles(
            ["PBS/items.txt", "PBS/items_machine.txt"],
            (f: string[]) => (loadedData.items = parseStandardFile(version, LoadedItem, LoadedItem.populateMap, f)),
            dev
        ),
        await handleFiles(
            ["PBS/pokemon.txt"],
            (f: string[]) =>
                (loadedData.pokemon = parseStandardFile(version, LoadedPokemon, LoadedPokemon.populateMap, f)),
            dev
        ),
        await handleFiles(
            ["PBS/pokemonforms.txt"],
            (f: string[]) => {
                const loadedForms: Record<string, LoadedPokemon[]> = {};
                Object.values(parseStandardFile(version, LoadedPokemon, LoadedPokemon.populateMap, f)).forEach((v) => {
                    LoadedPokemon.postProcessKeyForFormEntry(v);

                    if (!(v.key in loadedForms)) loadedForms[v.key] = [];
                    loadedForms[v.key].push(v);
                });

                return (loadedData.forms = loadedForms);
            },
            dev
        ),
        await handleFiles(
            ["PBS/trainertypes.txt"],
            (f: string[]) =>
                (loadedData.trainerTypes = parseStandardFile(
                    version,
                    LoadedTrainerType,
                    LoadedTrainerType.populateMap,
                    f
                )),
            dev
        ),
        await handleFiles(
            ["PBS/trainers.txt"],
            (f: string[]) =>
                (loadedData.trainers = parseStandardFile(version, LoadedTrainer, LoadedTrainer.populateMap, f)),
            dev
        ),
        await handleFiles(
            ["PBS/encounters.txt"],
            (f: string[]) => {
                const record: Record<string, LoadedEncounterMap> = {};
                parseEncounterFile(f[0]).forEach((x) => {
                    const map = new LoadedEncounterMap(x);
                    record[map.key] = map;
                });

                return (loadedData.encounters = record);
            },
            dev
        ),
    ]);

    // Data propogation
    loadedData.typeChart = buildTypeChart(loadedData.types);
    propgatePokemonData(version, loadedData.pokemon);
    propagateTrainerData(loadedData.trainers);
    propagateSignatures(loadedData);

    // Pre-write setup
    setupPokemonDataForWrite(loadedData.pokemon);

    const keys = {
        pokemon: ["", ...Object.keys(loadedData.pokemon)],
        item: Object.keys(loadedData.items).filter((k) => loadedData.items[k].pocket === 5),
        type: Object.keys(loadedData.types),
        move: Object.fromEntries(Object.values(loadedData.pokemon).map((p) => [p.key, LoadedPokemon.getAllMoves(p)])),
    };
    const indices = {
        item: Object.fromEntries(keys.item.map((id, i) => [id, i])),
        type: Object.fromEntries(Object.keys(loadedData.types).map((id, i) => [id, i])),
        move: Object.fromEntries(
            Object.keys(keys.move).map((k) => [k, Object.fromEntries(keys.move[k].map((m, index) => [m, index]))])
        ),
    };

    // Write versions seperately as the file is maintained in the repo
    const versions = await dataRead("versions.json");
    versions[version] = { indices, keys };
    await Promise.all([dataWrite("loadedData.json", loadedData), dataWrite("versions.json", versions)]);
}

loadData(process.argv[2] === "dev").catch((e) => console.error(e));
