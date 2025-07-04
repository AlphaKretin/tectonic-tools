export default function StatRow({ name, value, scale = 1 }: { name: string; value: number; scale?: number }) {
    return (
        <tr key={name}>
            <td className="text-right">{name}</td>
            <td className="px-3">{value}</td>
            <td>
                <div>
                    {[...Array(Math.ceil(value / (scale ?? 1) / 25)).keys()].map((i) => (
                        <span
                            key={i}
                            className="inline-block w-[17px] h-[17px] mx-0.5"
                            style={{
                                backgroundColor: `rgb(${200 - Math.max(0, -50 + i * 50)}, ${125 + i * 50}, ${
                                    -125 + i * 50
                                })`,
                            }}
                        ></span>
                    ))}
                </div>
            </td>
        </tr>
    );
}
