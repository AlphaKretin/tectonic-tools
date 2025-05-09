import { ReactNode } from "react";

export default function LeftRightCycleButtons({
    isVisible,
    text,
    onPrevClick,
    onNextClick,
}: {
    isVisible: boolean;
    text: string;
    onPrevClick: () => void;
    onNextClick: () => void;
}): ReactNode {
    return (
        isVisible && (
            <span className="flex items-center space-x-2">
                <button
                    onClick={onPrevClick}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span>{text}</span>
                <button
                    onClick={onNextClick}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </span>
        )
    );
}
