import { ReactNode } from "react";

export default function TableCell({ children }: { children: ReactNode }) {
    return <td className="px-6 py-4 text-center text-sm font-medium text-gray-200">{children}</td>;
}
