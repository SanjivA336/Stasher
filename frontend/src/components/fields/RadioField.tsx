import ToggleField from "@/components/fields/ToggleField";

type RadioFieldProps = {
    value: any;
    setValue: (value: any) => void;

    label?: string;

    required?: boolean;
    disabled?: boolean;

    orientation?: "horizontal" | "vertical";

    options: Array<any>;
    optionValue: (option: any) => any;
    optionLabel: (option: any) => string;
};

const RadioField = ({ value, setValue, label, required = false, disabled = false, orientation = "vertical", options, optionValue, optionLabel }: RadioFieldProps) => {
    return (
        <div className="w-100 text-light d-flex flex-column">
            {label && (
                <label className="w-100 ps-2 pb-2 my-auto text-start">
                    {label}
                </label>
            )}
            <div 
                className={[
                    "w-100 d-flex flex-row gap-0 my-2",
                    orientation === "vertical" ? "flex-column" : "flex-row"
                ].join(" ")}>
                    {options.map((option, index) => (
                        <ToggleField
                            key={optionValue(option)}
                            value={value === optionValue(option)}
                            setValue={() => setValue(optionValue(option))}
                            label={optionLabel(option)}
                            type="radio"
                            required={required}
                            disabled={disabled}
                            />
                    ))}
            </div>
        </div>
    );
};

export default RadioField;
