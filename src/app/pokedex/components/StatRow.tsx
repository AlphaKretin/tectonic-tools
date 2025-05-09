export default function StatRow({ name, value, scale }: { name: string; value: number; scale: number }) {
    const scaledStatValue = value / scale;
    const colorDeg = Math.min(scaledStatValue * (0.45 + scaledStatValue / 200), 280);

    return (
        <tr key={name}>
            <td>{name}</td>
            <td>{value}</td>
            <td className="w-full">
                <div
                    className={`h-4 rounded-md bg-blue-500 transition-all duration-300`}
                    style={{
                        width: `${Math.round(scaledStatValue * 2.0)}px`,
                        backgroundColor: `hsl(${colorDeg}deg, 100%, 50%)`,
                    }}
                ></div>
            </td>
        </tr>
    );
}
