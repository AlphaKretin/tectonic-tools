export default function TabContent({
    children,
    tab,
    activeTab,
}: {
    children: React.ReactNode;
    tab: string;
    activeTab: string;
}) {
    if (activeTab === tab) {
        return <div key={tab}>{children}</div>;
    }
    return <></>;
}
