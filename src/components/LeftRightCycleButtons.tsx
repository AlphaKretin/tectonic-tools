import { ReactNode } from "react";

export default function LeftRightCycleButtons({
    buttonsVisible,
    onPrevClick,
    onNextClick,
    children,
}: {
    buttonsVisible: boolean;
    onPrevClick: () => void;
    onNextClick: () => void;
    children?: React.ReactNode;
}): ReactNode {
    return (
        <span className="flex items-center space-x-2">
            {buttonsVisible && (
                <button onClick={onPrevClick} className="text-white hover:text-yellow-highlight cursor-pointer">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
            {children}
            {buttonsVisible && (
                <button onClick={onNextClick} className="text-white hover:text-yellow-highlight cursor-pointer">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </span>
    );
}
