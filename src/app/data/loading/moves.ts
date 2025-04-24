import { KVPair, LoadedData } from "./loadData";

export interface LoadedMove extends LoadedData {
    name: string;
    type: string;
    category: string;
    power: number;
    accuracy: number;
    pp: number;
    target: string;
    functionCode: string;
    effectChance?: number;
    priority?: number;
    description: string;
    flags: string[];
}

export function parseMoves(pairs: KVPair[]): LoadedMove {
    const obj: LoadedMove = {
        key: "",
        name: "",
        type: "",
        category: "",
        functionCode: "",
        power: 0,
        accuracy: 0,
        pp: 0,
        target: "",
        description: "",
        flags: [],
    };
    pairs.forEach((pair) => {
        switch (pair.key) {
            case "Bracketvalue":
                obj.key = pair.value;
                break;
            case "Name":
                obj.name = pair.value;
                break;
            case "Type":
                obj.type = pair.value;
                break;
            case "Category":
                obj.category = pair.value;
                break;
            case "Power":
                obj.power = parseInt(pair.value);
                break;
            case "Accuracy":
                obj.accuracy = parseInt(pair.value);
                break;
            case "TotalPP":
                obj.pp = parseInt(pair.value);
                break;
            case "Target":
                obj.target = pair.value;
                break;
            case "FunctionCode":
                obj.functionCode = pair.value;
                break;
            case "EffectChance":
                obj.effectChance = parseInt(pair.value);
                break;
            case "Priority":
                obj.priority = parseInt(pair.value);
                break;
            case "Description":
                obj.description = pair.value;
                break;
            case "Flags":
                obj.flags = pair.value.split(",");
                break;
        }
    });

    return obj;
}
