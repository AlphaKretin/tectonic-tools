export default function InlineLink({ children, url }: { children: React.ReactNode; url: string }) {
    return (
        <a
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </a>
    );
}
