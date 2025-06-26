import { PokemonType } from "@/app/data/tectonic/PokemonType";
import { calcTypeMatchup } from "@/app/data/typeChart";

interface TypeChartCellProps {
    atk?: PokemonType;
    def?: PokemonType;
    def2?: PokemonType;
    mult?: number;
}

function getColourClassForMult(mult: number): string {
    if (mult > 2) {
        return "bg-hyper-effective";
    }
    if (mult > 1) {
        return "bg-super-effective";
    }
    if (mult == 0) {
        return "bg-not-effective";
    }
    if (mult < 0.5) {
        return "bg-barely-effective";
    }
    if (mult < 1) {
        return "bg-not-very-effective";
    }
    // if neutrally effective, no special colour
    return "";
}

function getTextColourForMult(mult: number): string {
    if (mult !== 1) {
        return "text-black";
    }
    return "";
}

function getTooltipForMult(
    atk: PokemonType | undefined,
    def: PokemonType | undefined,
    def2: PokemonType | undefined,
    mult: number
): string {
    if (!atk || !def) {
        return "";
    }

    const prefix = `${atk.name} → ${def.name}${def2 ? ` & ${def2.name}` : ""} = `;
    if (mult >= 4) {
        return prefix + "Hyper Effective";
    }
    if (mult >= 2) {
        return prefix + "Super Effective";
    }
    if (mult == 0) {
        return prefix + "No Effect";
    }
    if (mult < 0.5) {
        return prefix + "Barely Effective";
    }
    if (mult < 1) {
        return prefix + "Not Very Effective";
    }

    return prefix + "Normal Effectiveness";
}

function getTextForMult(mult: number): string {
    if (mult === 0.125) {
        return "⅛";
    }
    if (mult === 0.25) {
        return "¼";
    }
    if (mult === 0.5) {
        return "½";
    }
    if (mult == 1.0) {
        return "";
    }

    return mult.toString();
}

export default function TypeChartCell({
    atk = undefined,
    def = undefined,
    def2 = undefined,
    mult = undefined,
}: TypeChartCellProps) {
    mult = mult ?? calcTypeMatchup({ type: atk! }, { type1: def!, type2: def2 });
    const colourClass = getColourClassForMult(mult);
    const textClass = getTextColourForMult(mult);
    const tooltip = getTooltipForMult(atk, def, def2, mult);
    const content = getTextForMult(mult);

    return (
        <td
            className={`border border-gray-600 text-lg text-center font-bold h-[1.6em] ${colourClass} ${textClass}`}
            title={tooltip}
        >
            {content}
        </td>
    );
}
