export default function ColumnHeader({ colour, children }: { colour: string; children: React.ReactNode }) {
    return <h2 className={"text-xl font-semibold mb-2 " + colour}>{children}</h2>;
}
