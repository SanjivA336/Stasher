import { useEffect, useState } from "react";

import ButtonField from "@/components/fields/ButtonField";

type NumberFieldProps = {
    value: number;
    setValue: (value: number) => void;

    prepend?: string;
    label?: string;
    placeholder?: number | string;

    required?: boolean;
    disabled?: boolean;
    incrementer?: boolean;

    min?: number;
    max?: number;

    caps?: "start" | "end" | "both" | "none";

    className?: string;
};

const NumberField = ({ value, setValue, prepend, label, placeholder = "", required = true, disabled = false, incrementer=false, min, max, caps = "both", className }: NumberFieldProps) => {
    const [hideInput, setHideInput] = useState(false);

    const showRoundedStart = (caps === "start" || caps === "both") && !prepend;
    const showRoundedEnd = (caps === "end" || caps === "both") && !incrementer;

    const increaseValue = () => {
        if (max && value >= max) return;
        setValue(value + 1);
    }

    const decreaseValue = () => {
        if (min && value <= min) return;
        setValue(value - 1);
    }

    useEffect(() => {
        if (min !== undefined && value < min) {
            setValue(min);
        }
        if (max !== undefined && value > max) {
            setValue(max);
        }
    }, [value, min, max, setValue]);

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
                            "text-light bg-dark border-end-0 border-2 border-darkish px-3 py-2 mx-0 text-nowrap"
                        ].join(" ")}
                    >
                        {prepend}
                    </span>
                )}

                <input
                    className={[
                        showRoundedStart ? "rounded-start-pill ps-3" : "ps-2",
                        showRoundedEnd ? "rounded-end-pill pe-3" : "pe-2",
                        "w-100 text-light bg-darker border-2 border-darkish py-2 mx-0",
                        incrementer ? "border-end-0" : ""
                    ].join(" ")}
                    type="number"
                    placeholder={placeholder.toString()}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required={required}
                    disabled={disabled}
                />

                {incrementer && (
                    <span className="d-flex flex-row align-items-center p-0">
                        <ButtonField
                            onClick={increaseValue}
                            color="dark"
                            disabled={disabled}
                            loading={false}
                            type="button"
                            rounding="pill"
                            caps="none"
                            className="btn btn-dark text-light border-2 border-end-0 border-darkish px-3 py-2 mx-0"
                        >
                            +
                        </ButtonField>
                        <ButtonField
                            onClick={decreaseValue}
                            color="dark"
                            disabled={disabled}
                            loading={false}
                            type="button"
                            rounding="pill"
                            caps="end"
                            className="btn btn-dark text-light border-2 border-start-0 border-darkish px-3 py-2 mx-0"
                        >
                            -
                        </ButtonField>
                    </span>
                )}
            </div>
        </div>
    );
};

export default NumberField;
