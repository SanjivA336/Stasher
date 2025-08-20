import ButtonField from "@/components/fields/ButtonField";

type ToggleFieldProps = {
    value: boolean;
    setValue: (value: boolean) => void;

    label?: string;

    required?: boolean;
    disabled?: boolean;

    type?: "checkbox" | "switch" | "radio" | "button";
};

const ToggleField = ({ value, setValue, label, type = "checkbox", required = false, disabled = false }: ToggleFieldProps) => {
    return (
        <div 
            className={[
                "w-100 text-light d-flex flex-row px-2",
                type === "radio" ? "my-0" : "my-2",
            ].join(" ")}
        >
            { type === "button" ? (
                <ButtonField 
                    onClick={() => setValue(!value)}
                    disabled={disabled}
                    color="primary"
                    outlineVariant={!value}
                    className="p-2"
                >
                    {label}: {value ? "On" : "Off"}
                </ButtonField>
            ) : (
                <div 
                    className={[
                        "form-check",
                        type === "switch" ? "form-switch" : "mx-2",
                        "d-flex align-items-center"
                    ].join(" ")}>
                    <input
                        type={type === "switch" ? "checkbox" : type}
                        className="form-check-input"
                        checked={value}
                        onChange={(e) => setValue(e.target.checked)}
                        required={required}
                        disabled={disabled}
                    />
                </div>
            )}

            {label && type !== "button" && (
                <label className="w-100 ps-2 pb-2 mt-2 text-start">
                    {label}
                </label>
            )}

        </div>
    );
};

export default ToggleField;
