import { Pokemon } from "./tectonic/Pokemon";
import { TectonicData } from "./tectonic/TectonicData";

export class EncounterPick {
    encounterMonId: string;
    monId: string;

    constructor(encounterMonId: string, monId: string) {
        this.encounterMonId = encounterMonId;
        this.monId = monId;
    }
}

export class LocationPickData {
    picks: EncounterPick[] = [];
    flagMissing: boolean = false;
}

export class Playthrough {
    private static localStorageKey = "EncounterTrackerLocalStorageKey_V1";
    private static localData: Playthrough[] = [];

    private key: number;
    private name: string = "Playthrough 1";
    private locationPickData: Record<string, LocationPickData> = {};

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
        return this.localData.map((x) => x.key) ?? [];
    }

    static getPlayThrough(key?: number): Playthrough | undefined {
        return this.localData.find((x) => x.key == key);
    }

    static loadLocalData() {
        const value = localStorage.getItem(this.localStorageKey);
        const loaded = (this.localData = value ? JSON.parse(value) : []) as Playthrough[];

        this.localData = loaded.map((x) => {
            const playthrough = new Playthrough(x.name);
            playthrough.key = x.key;
            playthrough.locationPickData = x.locationPickData;

            return playthrough;
        });
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

    addPick(key: string, pick: EncounterPick) {
        if (!(key in this.locationPickData)) {
            this.locationPickData[key] = new LocationPickData();
        }

        this.locationPickData[key].picks.push(pick);
        Playthrough.saveLocalData();
    }

    removePick(key: string, encounterMonId: string) {
        this.locationPickData[key].picks = this.locationPickData[key].picks.filter(
            (x) => x.encounterMonId != encounterMonId
        );
        Playthrough.saveLocalData();
    }

    hasAnyPick(key: string): boolean {
        return key in this.locationPickData && this.locationPickData[key].picks.length > 0;
    }

    hasPick(key: string, encounterMonId: string): boolean {
        if (key in this.locationPickData) {
            return this.locationPickData[key].picks.some((x) => x.encounterMonId == encounterMonId);
        }

        return false;
    }

    getPickedMonMapWithEvos(): Record<string, Pokemon> {
        const result: Record<string, Pokemon> = {};
        Object.values(this.locationPickData)
            .filter((x) => !x.flagMissing)
            .flatMap((x) =>
                x.picks.flatMap((p) => TectonicData.pokemon[p.monId].evolutionTree.toArray().map((e) => e.data.pokemon))
            )
            .forEach((x) => (result[x] = TectonicData.pokemon[x]));

        return result;
    }

    setPickMissed(key: string, missed: boolean): void {
        if (!(key in this.locationPickData)) {
            this.locationPickData[key] = new LocationPickData();
        }

        this.locationPickData[key].flagMissing = missed;
        Playthrough.saveLocalData();
    }

    wasPickMissed(key: string): boolean {
        if (key in this.locationPickData) {
            return this.locationPickData[key].flagMissing;
        }

        return false;
    }

    delete() {
        Playthrough.localData = Playthrough.localData.filter((x) => x.key != this.key);
        Playthrough.saveLocalData();
    }
}
