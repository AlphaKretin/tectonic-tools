import { ReactNode } from "react";

export default function CloseXButton({ onClick }: { onClick: () => void }): ReactNode {
    return (
        <button
            onClick={onClick}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
            <svg className="w-7 h-7" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}
