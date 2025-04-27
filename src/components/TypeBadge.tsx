import { PokemonType } from "@/app/data/types/PokemonType";
import { isNull } from "@/app/data/util";
import { getTypeColorClass } from "./colours";

export enum TypeBadgeElementEnum {
    TABLE_HEADER,
    TABLE_ROW,
    CAPSULE_SINGLE,
    CAPSULE_STACK,
    CAPSULE_ROW,
}

interface TypeBadgeProps {
    types: (PokemonType | undefined)[];
    useShort: boolean;
    element: TypeBadgeElementEnum;
}

export default function TypeBadge({ types, useShort, element }: TypeBadgeProps) {
    function getClasses(type: PokemonType) {
        return `p-1 h-fit text-white text-shadow-xs/100 text-s font-semibold cursor-default 
            ${getTypeColorClass(type, "bg")}`;
    }

    function getCapsuleClasses(type: PokemonType) {
        return `${getClasses(type)} px-2 w-20 text-center rounded-full`;
    }

    function getText(type: PokemonType) {
        return useShort ? type.getShortName() : type.name;
    }

    // have to manually assert type here because Array.filter doesn't typeguard properly :(
    const defTypes = types.filter((type) => !isNull(type)) as PokemonType[];
    switch (element) {
        case TypeBadgeElementEnum.TABLE_HEADER:
            return <th className={`${getClasses(defTypes[0]!)} w-12`}>{getText(defTypes[0]!)}</th>;
        case TypeBadgeElementEnum.TABLE_ROW:
            return <td className={`${getClasses(defTypes[0]!)} py-2 text-right`}>{getText(defTypes[0]!)}</td>;
        case TypeBadgeElementEnum.CAPSULE_SINGLE:
            return <span className={`${getCapsuleClasses(defTypes[0]!)}`}>{getText(defTypes[0]!)}</span>;
        case TypeBadgeElementEnum.CAPSULE_STACK:
            return (
                <div className="my-auto">
                    {defTypes.map((type, index) => (
                        <div key={index} className={`${getCapsuleClasses(type)} my-1 mx-auto`}>
                            {getText(type)}
                        </div>
                    ))}
                </div>
            );
        case TypeBadgeElementEnum.CAPSULE_ROW:
            return (
                <div className="flex justify-center space-x-2">
                    {defTypes.map((type) => (
                        <span key={type.id} className={`${getCapsuleClasses(type)}`}>
                            {getText(type)}
                        </span>
                    ))}
                </div>
            );
    }
}
