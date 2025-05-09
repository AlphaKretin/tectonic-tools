import { MouseEventHandler, ReactNode } from "react";

export default function FilterOptionButton({
    children,
    isSelected,
    padding = "p-1",
    onClick,
}: {
    children: ReactNode;
    isSelected: boolean;
    padding?: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
}): ReactNode {
    return (
        <span
            className={`${padding} w-fit h-fit text-xl text-center inline-block rounded hover:bg-[#FFD166] hover:text-black hover:cursor-pointer ${
                isSelected ? "bg-[#FFD166] text-black" : "bg-gray-500"
            }`}
            onClick={onClick}
        >
            {children}
        </span>
    );
}
