import ButtonField from "@/components/fields/ButtonField";

type TabGroupProps = {
    tabNumber: number;
    setTabNumber: (tabNumber: number) => void;

    disabled?: boolean;

    color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | string;
    orientation?: "horizontal" | "vertical";
    rounding?: "0" | "1" | "2" | "3" | "4" | "5" | "pill";

    tabNames: Array<string>;

    className?: string;
};

const TabGroup = ({ tabNumber, setTabNumber, disabled = false, color = "primary", orientation="horizontal", rounding="3", tabNames, className }: TabGroupProps) => {

    const changeTab = (index: number) => {
        if (!disabled) {
            setTabNumber(index);
        }
    }

    return (
        <div className={`text-light d-flex flex-column ${className}`}>
            <div
                className={[
                    "d-flex gap-2",
                    orientation === "vertical" ? "flex-column" : "flex-row",
                    rounding === "pill" ? "rounded-pill" : "rounded-" + rounding,
                ].join(" ")}
            >
                {tabNames.map((tabName, index) => (
                    <ButtonField
                        key={index}
                        onClick={() => changeTab(index)}
                        disabled={disabled}
                        color={tabNumber === index ? (disabled ? "light" : color) : "dark"}
                        rounding={rounding}
                        caps="both"
                        className={`w-100 justify-content-center p-3 ${disabled ? "text-dark" : "text-light"}`}
                    >
                        <h6 className="m-0">{tabName}</h6>
                    </ButtonField>
                ))}
            </div>
        </div>
    );
};

export default TabGroup;
