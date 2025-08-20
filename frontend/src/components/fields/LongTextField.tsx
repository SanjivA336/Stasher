type LongTextFieldProps = {
    value: string;
    setValue: (value: string) => void;

    label?: string;
    placeholder?: string;

    required?: boolean;
    disabled?: boolean;

    rows?: number;
};

const LongTextField = ({ value, setValue, placeholder = "", label, required = false, disabled = false, rows = 3 }: LongTextFieldProps) => {
    return (
        <div className="w-100 text-light d-flex flex-column">
            {label && (
                <label className="w-100 ps-2 pb-2 my-auto text-start">
                    {label}
                </label>
            )}

            <div className="w-100 d-flex flex-row align-items-center gap-0 my-auto">
                <textarea
                    className="w-100 text-light bg-darker border-2 border-darkish p-3 mx-0 rounded-4 resize-vertical"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required={required}
                    disabled={disabled}
                    rows={rows}
                />
            </div>

        </div>
    );
};

export default LongTextField;
