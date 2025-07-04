import { PokemonType } from "@/app/data/tectonic/PokemonType";
import { isNull } from "@/app/data/util";
import { getTypeColorClass } from "./colours";
import BugTypeIcon from "./type_icons/components/BugTypeIcon";
import DarkTypeIcon from "./type_icons/components/DarkTypeIcon";
import DragonTypeIcon from "./type_icons/components/DragonTypeIcon";
import ElectricTypeIcon from "./type_icons/components/ElectricTypeIcon";
import FairyTypeIcon from "./type_icons/components/FairyTypeIcon";
import FightingTypeIcon from "./type_icons/components/FightingTypeIcon";
import FireTypeIcon from "./type_icons/components/FireTypeIcon";
import FlyingTypeIcon from "./type_icons/components/FlyingTypeIcon";
import GhostTypeIcon from "./type_icons/components/GhostTypeIcon";
import GrassTypeIcon from "./type_icons/components/GrassTypeIcon";
import GroundTypeIcon from "./type_icons/components/GroundTypeIcon";
import IceTypeIcon from "./type_icons/components/IceTypeIcon";
import MutantTypeIcon from "./type_icons/components/MutantTypeIcon";
import NormalTypeIcon from "./type_icons/components/NormalTypeIcon";
import PoisonTypeIcon from "./type_icons/components/PoisonTypeIcon";
import PsychicTypeIcon from "./type_icons/components/PsychicTypeIcon";
import QMarksTypeIcon from "./type_icons/components/QMarksTypeIcon";
import RockTypeIcon from "./type_icons/components/RockTypeIcon";
import SteelTypeIcon from "./type_icons/components/SteelTypeIcon";
import WaterTypeIcon from "./type_icons/components/WaterTypeIcon";

export enum TypeBadgeElementEnum {
    TABLE_HEADER,
    TABLE_ROW,
    CAPSULE_SINGLE,
    CAPSULE_STACK,
    CAPSULE_ROW,
    ICONS,
}

interface TypeBadgeProps {
    types: (PokemonType | undefined)[];
    element: TypeBadgeElementEnum;
}

export default function TypeBadge({ types, element }: TypeBadgeProps) {
    function getClasses(type: PokemonType) {
        return `h-fit text-white text-shadow-xs/100 text-s font-semibold cursor-default
            ${getTypeColorClass(type, "bg")}`;
    }

    function getCapsuleClasses(type: PokemonType) {
        return `${getClasses(type)} flex pr-2 w-fit rounded-full border border-white`;
    }

    function getText(type: PokemonType) {
        return <span className="my-auto">{type.name}</span>;
    }

    function getIcon(type: PokemonType) {
        const widthHeight = 30;

        switch (type.id) {
            case "BUG":
                return <BugTypeIcon width={widthHeight} height={widthHeight} />;
            case "DARK":
                return <DarkTypeIcon width={widthHeight} height={widthHeight} />;
            case "DRAGON":
                return <DragonTypeIcon width={widthHeight} height={widthHeight} />;
            case "ELECTRIC":
                return <ElectricTypeIcon width={widthHeight} height={widthHeight} />;
            case "FAIRY":
                return <FairyTypeIcon width={widthHeight} height={widthHeight} />;
            case "FIGHTING":
                return <FightingTypeIcon width={widthHeight} height={widthHeight} />;
            case "FIRE":
                return <FireTypeIcon width={widthHeight} height={widthHeight} />;
            case "FLYING":
                return <FlyingTypeIcon width={widthHeight} height={widthHeight} />;
            case "GHOST":
                return <GhostTypeIcon width={widthHeight} height={widthHeight} />;
            case "GRASS":
                return <GrassTypeIcon width={widthHeight} height={widthHeight} />;
            case "GROUND":
                return <GroundTypeIcon width={widthHeight} height={widthHeight} />;
            case "ICE":
                return <IceTypeIcon width={widthHeight} height={widthHeight} />;
            case "NORMAL":
                return <NormalTypeIcon width={widthHeight} height={widthHeight} />;
            case "POISON":
                return <PoisonTypeIcon width={widthHeight} height={widthHeight} />;
            case "PSYCHIC":
                return <PsychicTypeIcon width={widthHeight} height={widthHeight} />;
            case "ROCK":
                return <RockTypeIcon width={widthHeight} height={widthHeight} />;
            case "STEEL":
                return <SteelTypeIcon width={widthHeight} height={widthHeight} />;
            case "WATER":
                return <WaterTypeIcon width={widthHeight} height={widthHeight} />;
            case "MUTANT":
                return <MutantTypeIcon width={widthHeight} height={widthHeight} />;
            case "QMARKS":
            default:
                return <QMarksTypeIcon width={widthHeight} height={widthHeight} />;
        }
    }

    const defTypes = types.filter((t) => !isNull(t)) as PokemonType[];
    switch (element) {
        case TypeBadgeElementEnum.TABLE_HEADER:
            return (
                <th className={`${getClasses(defTypes[0])} w-12`} title={defTypes[0].name}>
                    {getIcon(defTypes[0])}
                </th>
            );
        case TypeBadgeElementEnum.TABLE_ROW:
            return (
                <td className={`${getClasses(defTypes[0])} w-12 text-center`} title={defTypes[0].name}>
                    {getIcon(defTypes[0])}
                </td>
            );
        case TypeBadgeElementEnum.CAPSULE_SINGLE:
            return (
                <span className={`${getCapsuleClasses(defTypes[0])}`} title={defTypes[0].name}>
                    {getIcon(defTypes[0])}
                    {getText(defTypes[0])}
                </span>
            );
        case TypeBadgeElementEnum.CAPSULE_STACK:
            return (
                <>
                    {defTypes.map((type, index) => (
                        <span key={index} className={`${getCapsuleClasses(type)} my-1 mx-auto`} title={type.name}>
                            {getIcon(type)}
                            {getText(type)}
                        </span>
                    ))}
                </>
            );
        case TypeBadgeElementEnum.CAPSULE_ROW:
            return (
                <div className="flex space-x-2">
                    {defTypes.map((type) => (
                        <span key={type.id} className={`${getCapsuleClasses(type)}`} title={type.name}>
                            {getIcon(type)}
                            {getText(type)}
                        </span>
                    ))}
                </div>
            );
        case TypeBadgeElementEnum.ICONS:
            const girdRows = defTypes.length > 1 ? 2 : 1;
            return (
                <div className={`grid grid-rows-${girdRows} grid-cols-auto grid-flow-col space-x-1 space-y-1 my-auto`}>
                    {defTypes.map((type, index) => (
                        <div key={index} title={type.name}>
                            {getIcon(type)}
                        </div>
                    ))}
                </div>
            );
    }
}
