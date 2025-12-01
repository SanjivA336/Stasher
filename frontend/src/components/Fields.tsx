import { useToast } from "@/contexts/toasts/ToastContextValue";
import { fuzzyScore } from "@/utils/utilities";
import { useCallback, useEffect, useMemo, useState } from "react";

type SpinnerProps = {
    size?: number;
    thickness?: number;
    color?: string;
};
export function Spinner({ size = 40, thickness = 4, color = "border-accent" }: SpinnerProps) {
    return (
        <div
            className={`animate-spin rounded-full border-t-transparent border-b-transparent ${color}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderWidth: `${thickness}px`,
            }}
        />
    );
}


type ButtonFieldProps = {
    onClick: () => void;
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';

    style?: 'box' | 'rounded' | 'rounded-lg' | 'pill';

    loading?: boolean;
    disabled?: boolean;
    className?: string;
};
export function ButtonField({ onClick, children, type = 'button', style = 'rounded', loading, disabled, className }: ButtonFieldProps) {

    className = className ? className : 'px-3 py-2 border-2 border-accent bg-transparent text-accent hover:bg-accent hover:text-text';

    return (
        <button
            onClick={onClick}
            className={`
                transition-all duration-200
                ${className}
                ${style === 'box' ? 'rounded-none' : ''}
                ${style === 'rounded' ? 'rounded-md' : ''}
                ${style === 'rounded-lg' ? 'rounded-lg' : ''}
                ${style === 'pill' ? 'rounded-full' : ''}
                `}
            disabled={loading || disabled}
            type={type}
        >
            <div className="flex flex-row items-center justify-center gap-2">
                {children}
                {loading && <Spinner size={16} thickness={2} color="border-text" />}
            </div>
        </button>
    );
};


type TextFieldProps = {
    value: string;
    setValue: (value: string) => void;
    type?: string;

    label?: string;
    placeholder?: string;
    prepend?: string;
    postpend?: string;

    securable?: boolean;
    clearable?: boolean;

    loading?: boolean;
    disabled?: boolean;
};
export function TextField({ value, setValue, type="text", label, placeholder, prepend, postpend, securable, clearable, loading, disabled }: TextFieldProps) {

    const [secured, setSecured] = useState<boolean>(false);

    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="font-medium">{label}</label>}
            <div className="flex flex-row items-center">
                {prepend && <span className="p-2 px-3 text-nowrap border-border bg-foreground border-2 border-e-0 text-text-alt flex rounded-s-md">{loading ? <Spinner size={24} thickness={2} color="border-text" /> : prepend}</span>}
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}

                    className={`
                        p-2 px-3 flex-grow
                        border-2 border-border bg-background text-text focus:border-accent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${prepend ? "" : "rounded-s-md"}
                        ${postpend || securable || clearable ? "" : "rounded-e-md"}
                    `}
                    placeholder={placeholder}
                    disabled={loading || disabled}
                    type ={secured ? 'password' : type}
                />
                {postpend && <span className={`p-2 px-3 text-nowrap border-border bg-foreground border-2 border-s-0 text-text-alt flex ${!(securable || clearable) ? "rounded-e-md" : ""}`}>{postpend}</span>}
                {securable && <span onClick={() => setSecured(!secured)} className={`p-2 px-3 text-nowrap border-border bg-foreground border-2 border-s-0 text-text-alt flex hover:bg-border/70 cursor-pointer transition-all duration-200 ${!clearable ? "rounded-e-md" : ""}`}>{secured ? "🔒": "🔓"}</span>}
                {clearable && <span onClick={() => setValue("")} className={`p-2 px-3 text-nowrap border-border bg-foreground border-2 border-s-0 text-text-alt flex hover:bg-border/70 cursor-pointer transition-all duration-200 rounded-e-md`}>✕</span>}
            </div>
        </div>
    );
}


type LongTextFieldProps = {
    value: string;
    setValue: (value: string) => void;

    label?: string;
    placeholder?: string;
    rows?: number;

    loading?: boolean;
    disabled?: boolean;
};
export function LongTextField({ value, setValue, label, placeholder, rows, loading, disabled }: LongTextFieldProps) {

    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="font-medium">{label}</label>}
            <div className="flex flex-row items-center">
                <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    rows={rows}
                    className={`
                        p-3 flex-grow rounded-md
                        border-2 border-border bg-background text-text focus:border-accent
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    placeholder={placeholder}
                    disabled={loading || disabled}
                />
            </div>
        </div>
    );
}


type NumberFieldProps = {
    value: number;
    setValue: (value: number) => void;

    label?: string;
    placeholder?: string;
    prepend?: string;
    postpend?: string;

    incrementable?: boolean;
    min?: number;
    max?: number;

    loading?: boolean;
    disabled?: boolean;
};
export function NumberField({ value, setValue, label, placeholder, prepend, postpend, incrementable, min, max, loading, disabled }: NumberFieldProps) {

    const limitedSetValue = (newValue: number) => {
        if (min !== undefined && newValue < min) {
            newValue = min;
        }
        if (max !== undefined && newValue > max) {
            newValue = max;
        }
        setValue(newValue);
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="font-medium">{label}</label>}
            <div className="flex flex-row items-center">
                {incrementable && <span onClick={() => limitedSetValue(value - 1)} className={`p-2 px-3 text-nowrap border-border bg-foreground border-2 border-e-0 text-text-alt flex hover:bg-border/70 cursor-pointer transition-all duration-200 rounded-s-md`}>-</span>}
                {prepend && <span className={`p-2 px-3 text-nowrap border-border bg-foreground border-2 border-e-0 text-text-alt flex ${!(incrementable) ? "rounded-s-md" : ""}`}>{prepend}</span>}
                <input
                    value={value}
                    onChange={(e) => limitedSetValue(Number(e.target.value))}

                    className={`
                        p-2 px-3 flex-grow
                        border-2 border-border bg-background text-text focus:border-accent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${prepend || incrementable ? "" : "rounded-s-md"}
                        ${postpend || incrementable ? "" : "rounded-e-md"}
                    `}
                    placeholder={placeholder}
                    disabled={loading || disabled}
                    type="number"
                />
                {postpend && <span className={`p-2 px-3 text-nowrap border-border bg-foreground border-2 border-s-0 text-text-alt flex ${!(incrementable) ? "rounded-e-md" : ""}`}>{postpend}</span>}
                {incrementable && <span onClick={() => limitedSetValue(value + 1)} className={`p-2 px-3 text-nowrap border-border bg-foreground border-2 border-s-0 text-text-alt flex hover:bg-border/70 cursor-pointer transition-all duration-200 rounded-e-md`}>+</span>}
            </div>
        </div>
    );
}


type ToggleFieldProps = {
    value: boolean;
    setValue: (value: boolean) => void;
    children: React.ReactNode;

    style?: 'box' | 'rounded' | 'rounded-lg' | 'pill';

    loading?: boolean;
    disabled?: boolean;
    className?: string;
    inactiveClassName?: string;
    activeClassName?: string;
};
export function ToggleField({ value, setValue, children, style = 'rounded', loading, disabled, className, activeClassName, inactiveClassName }: ToggleFieldProps) {

    className = className ? className : 'px-3 py-2 border-accent border-2';
    activeClassName = activeClassName ? activeClassName : 'bg-accent text-text hover:bg-accent/80';
    inactiveClassName = inactiveClassName ? inactiveClassName : 'bg-transparent text-accent hover:bg-accent/20';

    return (
        <ButtonField
            onClick={() => setValue(!value)}
            type="button"
            style={style}
            loading={loading}
            disabled={disabled}
            className={`
                w-full transition-all duration-200
                ${className}
                ${value ? activeClassName : inactiveClassName}
                ${style === 'box' ? 'rounded-none' : ''}
                ${style === 'rounded' ? 'rounded-md' : ''}
                ${style === 'rounded-lg' ? 'rounded-lg' : ''}
                ${style === 'pill' ? 'rounded-full' : ''}
                `}
        >
            {children}
        </ButtonField>
    );
};

type Option = {
    label: string;
    value: string;
};

type DropdownFieldProps = {
    value: string;
    setValue: (value: string) => void;

    options: Option[];
    label?: string;
    placeholder?: string;
    prepend?: string;

    searchable?: boolean;
    loading?: boolean;
    disabled?: boolean;
};
export function DropdownField({value, setValue, options, label, placeholder, prepend, searchable, loading, disabled }: DropdownFieldProps) {
    const [focused, setFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<Option | undefined>(options.find((o) => o.value === value) ?? options[0]);

    useEffect(() => {
        const match = options.find((o) => o.value === value);
        if (match) setSelectedOption(match);
    }, [value, options]);

    const hasOptions = options.length > 0;

    function sortOptions(opts: Option[]) {
        if (!searchable || !searchTerm) return opts;
        const term = searchTerm.toLowerCase();
        return [...opts].sort((a, b) => {
            const scoreA = fuzzyScore(a.label.toLowerCase(), term);
            const scoreB = fuzzyScore(b.label.toLowerCase(), term);
            return scoreB - scoreA;
        });
    }

    const isSelected = (option: Option) => {
        return value === option.value;
    }

    const displayValue = focused ? searchTerm : (selectedOption ? selectedOption.label : "");
    const sortedOptions = useMemo(() => sortOptions(options), [options, searchTerm]);

    return (
        <div className="flex flex-col gap-1 w-full relative">
            {label && <label className="font-medium">{label}</label>}
            <div className="flex flex-row items-center">
                {prepend && (
                    <span className="p-2 px-3 border-2 border-e-0 border-border bg-foreground text-text-alt flex rounded-s-md">
                        {loading ? <Spinner size={24} thickness={2} color="border-text" /> : prepend}
                    </span>
                )}

                <input
                    value={displayValue}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                        setFocused(true);
                        setSearchTerm(selectedOption ? selectedOption.label : "");
                        setShowOptions(true);
                    }}
                    onBlur={() => {
                        setFocused(false);
                        const matched = options.find(
                            (o) => o.label.toLowerCase() === searchTerm.toLowerCase()
                        );
                        if (matched) {
                            setSelectedOption(matched);
                            setValue(matched.value);
                        }
                        setTimeout(() => setShowOptions(false), 100);
                    }}
                    placeholder={placeholder}
                    disabled={loading || disabled || !searchable}
                    className={`p-2 px-3 flex-grow border-2 border-border bg-background text-text disabled:cursor-not-allowed ${prepend ? "" : "rounded-s-md"}`}
                    type="text"
                />

                <span
                    onClick={() => hasOptions && setShowOptions(!showOptions)}
                    className={`p-2 px-3 border-2 border-s-0 border-border bg-foreground text-text-alt flex rounded-e-md transition-all duration-200 ${
                        hasOptions ? "hover:bg-border/70 cursor-pointer" : ""
                    }`}
                >
                    {loading ? <Spinner size={24} thickness={2} color="border-text" /> : hasOptions ? (showOptions ? "▲" : "▼") : "⊙"}
                </span>

                {hasOptions && showOptions && (
                    <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto top-full border-2 border-border bg-foreground rounded-md shadow-lg z-50">
                        {sortedOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    setSelectedOption(option);
                                    setSearchTerm(option.label);
                                    setValue(option.value);
                                    setFocused(false);
                                    setShowOptions(false);
                                }}
                                className={`px-3 py-2 cursor-pointer ${isSelected(option) ? "bg-accent hover:bg-accent/80" : "bg-transparent hover:bg-accent/20"}`}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


type TagsFieldProps = {
    values: string[];
    setValues: (value: string[]) => void;

    options: Option[];

    label?: string;
    placeholder?: string;
    prepend?: string;

    loading?: boolean;
    disabled?: boolean;
};
export function TagsField({values, setValues, options, label, placeholder, prepend, loading, disabled }: TagsFieldProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showOptions, setShowOptions] = useState(false);

    const hasOptions = options.length > 0;

    function sortOptions(opts: Option[]) {
        const term = searchTerm.toLowerCase();
        return [...opts].sort((a, b) => {
            const scoreA = fuzzyScore(a.label.toLowerCase(), term);
            const scoreB = fuzzyScore(b.label.toLowerCase(), term);
            return scoreB - scoreA;
        });
    }

    const addOption = useCallback((newOption: Option) => {
        const newValue = newOption.value;
        if (!values.includes(newValue)) setValues([...values, newValue]);
    }, [values, setValues]);


    const removeOption = useCallback((newOption: Option) => {
        const newValue = newOption.value;
        setValues(values.filter((v) => v !== newValue));
    }, [values, setValues]);

    const isSelected = (option: Option) => {
        return values.includes(option.value);
    }

    const selectedOptions = useMemo(() => options.filter((o) => values.includes(o.value)), [options, values]);
    const sortedOptions = useMemo(() => sortOptions(options), [options, searchTerm]);

    return (
        <div className="flex flex-col gap-1 w-full relative">
            {label && <label className="font-medium">{label}</label>}
            <div className="flex flex-row items-center">
                {prepend && (
                    <span className="p-2 px-3 border-2 border-e-0 border-border bg-foreground text-text-alt flex rounded-s-md">
                        {loading ? <Spinner size={24} thickness={2} color="border-text" /> : prepend}
                    </span>
                )}

                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                        setShowOptions(true);
                        setSearchTerm("");
                    }}
                    onBlur={() => {
                        setTimeout(() => {setSearchTerm(""); setShowOptions(false);}, 100);
                    }}
                    placeholder={placeholder}
                    disabled={loading || disabled}
                    className={`p-2 px-3 flex-grow border-2 border-border bg-background text-text disabled:opacity-50 disabled:cursor-not-allowed ${prepend ? "" : "rounded-s-md"}`}
                    type="text"
                />

                <span
                    onClick={() => hasOptions && setShowOptions(!showOptions)}
                    className={`p-2 px-3 border-2 border-s-0 border-border bg-foreground text-text-alt flex rounded-e-md transition-all duration-200 ${
                        hasOptions ? "hover:bg-border/70 cursor-pointer" : ""
                    }`}
                >
                    {loading ? <Spinner size={24} thickness={2} color="border-text" /> : hasOptions ? (showOptions ? "▲" : "▼") : "⊙"}
                </span>

                {hasOptions && showOptions && (
                    <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto top-full border-2 border-border bg-foreground rounded-md shadow-lg z-50">
                        {sortedOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    if (isSelected(option)) removeOption(option);
                                    else addOption(option);
                                }}
                                className={`px-3 py-2 cursor-pointer ${isSelected(option) ? "bg-accent hover:bg-accent/80" : "bg-transparent hover:bg-accent/20"}`}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}


            </div>
            {!showOptions && selectedOptions.length > 0 && (
                <div className="flex flex-row flex-wrap gap-2 mt-1">
                    {selectedOptions.map((option) => (
                        <div key={option.value} className={`flex items-center transition-all duration-200 cursor-pointer rounded-md bg-accent hover:bg-accent/70`}>
                            <div className={`p-1 ps-2 text-sm text-nowrap`}>
                                {option.label}
                            </div>
                            <span onClick={() => removeOption(option)} className={`p-1 pe-2 text-sm text-nowrap`}>✕</span>
                        </div>
                        
                    ))}
                </div>
            )}
        </div>
    );
}


type SearchFieldProps<T> = {
    arr: T[];
    setFilteredArr: (arr: T[]) => void;
    getName: (item: T) => string;

    placeholder?: string;

    loading?: boolean;
};
export function SearchField<T>({ arr, setFilteredArr, getName, placeholder, loading }: SearchFieldProps<T>) {

    const toast = useToast();

    const [searchTerm, setSearchTerm] = useState("");

    return (
        <TextField
            value={searchTerm}
            setValue={(value) => {
                setSearchTerm(value);
                let filtered = arr.filter((item) => {
                    return getName(item).toLowerCase().includes(value.toLowerCase());
                });

                // If no members match the search, try to sort instead
                if (filtered.length === 0) {
                    toast("info", "No members found matching your search. Showing closest matches instead.");

                    filtered = [...arr].sort((a, b) => {
                        return fuzzyScore(getName(b).toLowerCase(), value.toLowerCase()) - fuzzyScore(getName(a).toLowerCase(), value.toLowerCase());
                    });
                }

                setFilteredArr(filtered);
            }}

            prepend="Search"
            placeholder={placeholder || "Search by name..."}
            clearable

            loading={loading}
        />
    );
}


type ScrollspyFieldProps = {
    options: Option[];
    offset?: number;
    className?: string;
};
export function ScrollspyField({ options, offset = 0, className = "" }: ScrollspyFieldProps) {
    const [activeId, setActiveId] = useState(options[0]?.value || "");

    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY + offset + 1;
            for (const option of options) {
                const el = document.getElementById(option.value);  
                if (el) {
                    const top = el.offsetTop;
                    const bottom = top + el.offsetHeight;
                    if (scrollPos >= top && scrollPos < bottom) {
                        setActiveId(option.value);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [options, offset]);

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {options.map((option) => (
                <ToggleField
                    key={option.value}
                    value={activeId === option.value}
                    setValue={() => {
                        const el = document.getElementById(option.value);
                        if (el) {
                            window.scrollTo({
                                top: el.offsetTop - offset,
                                behavior: "smooth",
                            });
                        }
                        setActiveId(option.value);
                    }}
                    className="w-full px-3 py-2 border-2"
                    activeClassName="border-accent bg-accent text-text hover:bg-accent/80"
                    inactiveClassName="border-border bg-transparent text-text hover:bg-border/50"
                >
                    {option.label}
                </ToggleField>
            ))}
        </div>
    );
}