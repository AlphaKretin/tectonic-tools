import { Tab } from "./PokemonModal";

export default function PokemonTab({
    children,
    tab,
    activeTab,
}: {
    children: React.ReactNode;
    tab: Tab;
    activeTab: Tab;
}) {
    if (activeTab === tab) {
        return <div>{children}</div>;
    }
    return <></>;
}
