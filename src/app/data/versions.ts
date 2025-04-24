import currentVersion from "public/data/currentversion.json";
import versions from "public/data/versions.json";

export const version = currentVersion.version;

type IndexMap = Record<string, number>;

export interface VersionMap {
    indices: {
        item: IndexMap;
        move: Record<string, IndexMap>;
        type: IndexMap;
    };
    keys: {
        pokemon: string[];
        item: string[];
        move: Record<string, string[]>;
        type: string[];
    };
}

export const versionMaps = versions as Record<string, VersionMap>;
