import { Item } from "@/app/data/tectonic/Item";
import Image from "next/image";
import { ReactNode, useState } from "react";

export default function ImageFallback({
    alt,
    src,
    width,
    height,
    className,
}: {
    alt: string;
    src: string;
    width: number;
    height: number;
    className?: string;
}): ReactNode {
    const [isError, setError] = useState<boolean>(false);

    return (
        <Image
            alt={alt}
            src={isError ? Item.IMG_NOT_FOUND : src}
            onError={() => {
                setError(true);
            }}
            width={width}
            height={height}
            className={className}
        />
    );
}
