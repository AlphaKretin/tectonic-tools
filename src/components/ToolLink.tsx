import Link from "next/link";

export default function ToolLink({ children, url, title }: { children: React.ReactNode; url: string; title: string }) {
    return (
        <div className="space-y-6">
            <Link
                href={url}
                className="block p-6 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600 group"
            >
                <h2 className="text-2xl font-semibold text-blue-400 group-hover:text-blue-300 mb-2">{title}</h2>
                <p className="text-gray-300">{children}</p>
            </Link>
        </div>
    );
}
