export default function Column({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 p-6 bg-gray-800 border-b md:border-b-0 md:border-r border-gray-700">
            <div className="h-full flex flex-col items-center justify-center">{children}</div>
        </div>
    );
}
