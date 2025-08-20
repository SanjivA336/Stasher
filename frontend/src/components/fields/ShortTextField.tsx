import { useState } from "react";

import ButtonField from "@/components/fields/ButtonField";

type ShortTextFieldProps = {
    value: string;
    setValue: (value: string) => void;

    prepend?: string;
    label?: string;
    placeholder?: string;

    required?: boolean;
    disabled?: boolean;
    secure?: boolean;
    clearable?: boolean;

    type?: "text" | "email";
    autoComplete?: string;
    caps?: "start" | "end" | "both" | "none";

    className?: string;
};

const ShortTextField = ({ value, setValue, prepend, label, placeholder = "", required = true, disabled = false, secure = false, clearable = false, type = "text", autoComplete = "none", caps = "both", className }: ShortTextFieldProps) => {
    const [hideInput, setHideInput] = useState(secure);

    const showRoundedStart = (caps === "start" || caps === "both") && !prepend;
    const showRoundedEnd = (caps === "end" || caps === "both") && !(secure || clearable);

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
                        (secure || clearable) ? "border-end-0" : ""
                    ].join(" ")}
                    type={secure && hideInput ? "password" : type}
                    placeholder={placeholder}
                    value={value}
                    autoComplete={autoComplete}
                    onChange={(e) => setValue(e.target.value)}
                    required={required}
                    disabled={disabled}
                />
                <span className="m-0 p-0 d-flex flex-row">
                    {clearable && (
                        <ButtonField
                            onClick={() => setValue("")}
                            color="dark"
                            disabled={disabled}
                            loading={false}
                            type="button"
                            rounding="pill"
                            caps={!secure && (caps === "end" || caps === "both") ? "end" : "none"}
                            className="border-2 border-start-0 border-darkish px-3 py-2 m-0"
                        >
                            ✖
                        </ButtonField>
                    )}

                    {secure && (
                        <ButtonField
                            onClick={() => setHideInput(!hideInput)}
                            color="dark"
                            disabled={disabled}
                            loading={false}
                            type="button"
                            rounding="pill"
                            caps="end"
                            className="border-2 border-start-0 border-darkish px-3 py-2 m-0"
                        >
                            {hideInput ? "🔒" : "🔓"}
                        </ButtonField>
                    )}
                </span>
            </div>
        </div>
    );
};

export default ShortTextField;
