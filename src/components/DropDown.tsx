import { ChangeEventHandler } from "react";

export default function Dropdown({
    children,
    value,
    onChange,
    title,
}: {
    children: React.ReactNode;
    value: string | number | readonly string[] | undefined;
    onChange: ChangeEventHandler<HTMLSelectElement> | undefined;
    title?: string;
}) {
    return (
        <select
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-center"
            value={value}
            onChange={onChange}
            title={title}
        >
            {children}
        </select>
    );
}
