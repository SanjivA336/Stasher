type DropdownFieldProps = {
    value: any;
    setValue: (value: any) => void;

    prepend?: string;
    label?: string;

    required?: boolean;
    disabled?: boolean;

    caps?: "start" | "end" | "both" | "none";

    readonly options: Array<any>;
    optionValue: (option: any) => any;
    optionLabel: (option: any) => string;

    className?: string;
};

const DropdownField = ({ value, setValue, prepend, label, required=false, disabled=false, caps="both", options, optionValue, optionLabel, className }: DropdownFieldProps) => {

    const showRoundedStart = (caps === "start" || caps === "both") && !prepend;
    const showRoundedEnd = (caps === "end" || caps === "both");

    return (
        <div className={`text-light d-flex flex-column ${className}`}>
            {label && (
                <label className="w-100 ps-2 pb-2 my-auto text-start">
                    {label}
                </label>
            )}

            <div className="w-100 d-flex flex-row align-items-center gap-0 my-auto">
                {prepend && (
                    <span 
                        className={[
                            (caps === "start" || caps === "both") ? "rounded-start-pill" : "",
                            "text-light bg-dark border-end-0 border-2 border-darkish px-3 py-2 m-0 text-nowrap"
                        ].join(" ")}
                    >
                        {prepend}
                    </span>
                )}

                <select
                    className={[
                        showRoundedStart ? "rounded-start-pill ps-3" : "ps-2",
                        showRoundedEnd ? "rounded-end-pill pe-3" : "pe-2",
                        "text-light bg-darker border-2 border-darkish py-2 m-0 text-nowrap",
                        className || "",
                    ].join(" ")}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required={required}
                    disabled={disabled}
                >
                    {options.map((option) => (
                        <option key={optionValue(option)} value={optionValue(option)}>
                            {optionLabel(option)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default DropdownField;