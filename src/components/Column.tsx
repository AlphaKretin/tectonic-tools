export default function Column({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 p-1 bg-gray-800 border border-gray-700">
            <div className="flex flex-col items-center justify-center">{children}</div>
        </div>
    );
}
