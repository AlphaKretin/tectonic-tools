export default function StatRow({ name, value }: { name: string; value: number }) {
    return (
        <tr key={name}>
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-600 dark:text-gray-300">
                {name}
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-600 dark:text-gray-300">
                {value}
            </td>
        </tr>
    );
}
