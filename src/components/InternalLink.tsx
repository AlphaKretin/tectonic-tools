import Link from "next/link";

export default function InternalLink({ children, url }: { children: React.ReactNode; url: string }) {
    return (
        <Link className="text-blue-600 dark:text-blue-400 hover:underline font-medium" href={url}>
            {children}
        </Link>
    );
}
