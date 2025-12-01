type TabGroupProps = {
    tab: number;
    setTab: (tab: number) => void;
    tabs: string[];

    horizontal?: boolean;

};

const TabGroup = ({ tab, setTab, tabs, horizontal = true }: TabGroupProps) => {

    return (
        <div className={`m-2 w-full flex ${horizontal ? 'flex-row' : 'flex-col'} gap-2`}>
            {tabs.map((tabName, index) => (
                <button
                    key={index}
                    className={
                        `p-3 rounded-xl border-2
                        ${tab === index ? 'bg-accent border-accent text-text font-semibold hover:bg-accent/70' : 'bg-transparent border-2 border-border text-text hover:bg-border/70'}
                        transition-all duration-200`}
                    onClick={() => setTab(index)}
                >
                    {tabName}
                </button>
            ))}
        </div>
    );
};

export default TabGroup;