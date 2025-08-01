import { SVGProps } from "react";
export function TrackerIcon(props: SVGProps<SVGSVGElement>) {
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
            <path d="M222-200 80-342l56-56 85 85 170-170 56 57-225 226Zm0-320L80-662l56-56 85 85 170-170 56 57-225 226Zm298 240v-80h360v80H520Zm0-320v-80h360v80H520Z" />
        </svg>
    );
}
