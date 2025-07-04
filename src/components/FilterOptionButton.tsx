import { MouseEventHandler, ReactNode } from "react";

export default function FilterOptionButton({
    children,
    isSelected,
    title,
    padding = "p-1",
    onClick,
}: {
    children: ReactNode;
    isSelected: boolean;
    title?: string;
    padding?: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
}): ReactNode {
    return (
        <span
            className={`${padding} w-fit h-fit text-xl text-center inline-block rounded hover:bg-yellow-highlight hover:text-black hover:cursor-pointer ${
                isSelected ? "bg-yellow-highlight text-black" : "bg-gray-500"
            }`}
            title={title}
            onClick={onClick}
        >
            {children}
        </span>
    );
}
