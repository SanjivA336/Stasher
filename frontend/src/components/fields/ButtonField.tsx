import React, { Children, useState } from "react";

type ButtonFieldProps = {
    onClick: () => void;

    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit";

    color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "transparent";
    outlineVariant?: boolean;
    rounding?: "0" | "1" | "2" | "3" | "4" | "5" | "pill";
    caps?: "start" | "end" | "both" | "none";
    className?: string;

    children?: React.ReactNode;
};

const ButtonField = ({ onClick, loading = false, disabled = false, type = "button", color = "primary", outlineVariant = false, rounding = "pill", caps = "both", className = "", children }: ButtonFieldProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={[
                "d-flex flex-row align-items-center gap-0 my-auto",
                "btn",
                `btn-${outlineVariant ? "outline-" : ""}${color}`,
                className,
                (caps === "start" || caps === "both") ? `rounded-start-${rounding}` : "rounded-start-0",
                (caps === "end" || caps === "both") ? `rounded-end-${rounding}` : "rounded-end-0",
            ].join(" ")}
            type={type}
        >
            <div className="w-100 d-flex flex-row justify-content-center align-items-center gap-2">
                {children}
                {loading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
            </div>
        </button>
    );
};

export default ButtonField;
