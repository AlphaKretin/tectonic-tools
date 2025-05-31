import { SVGProps } from "react";
export default function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            fill="#e3e3e3"
            viewBox="0 -960 960 960"
            className="inline"
            {...props}
        >
            <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
        </svg>
    );
}
