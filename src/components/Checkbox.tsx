import { ChangeEventHandler } from "react";

export default function Checkbox({
    children,
    checked,
    onChange,
    disabled,
}: {
    children: React.ReactNode;
    checked: boolean | undefined;
    onChange: ChangeEventHandler<HTMLInputElement> | undefined;
    disabled?: boolean;
}) {
    return (
        <label className="flex items-center space-x-3">
            <input
                type="checkbox"
                checked={checked}
                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                disabled={disabled}
                onChange={onChange}
            />
            <span className="text-gray-300">{children}</span>
        </label>
    );
}
