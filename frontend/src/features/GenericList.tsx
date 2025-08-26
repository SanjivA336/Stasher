import { useEffect, useState } from "react";

import ButtonField from "@/components/fields/ButtonField";
import ShortTextField from "@/components/fields/ShortTextField";
import DropdownField from "@/components/fields/DropdownField";
import NumberField from "@/components/fields/NumberField";

import Loading from "@/components/design/Loading";

type GenericListProps<T> = {
    itemName?: string;
    items: T[];
    refresh?: () => void;
    openEditor?: (item: T) => void;
    openCreator?: () => void;
    onClick?: (item: T) => void;
    renderDetails: (item: T) => React.ReactNode;

    loading?: boolean;

    search?: boolean;
    getItemName?: (item: T) => string;
    viewSelector?: boolean;
    defaultView?: "grid" | "list";
    limitSelector?: boolean;
    defaultLimit?: number;
    pagination?: boolean;

    children?: React.ReactNode;
}

export function GenericList<T>({ itemName="item", items, refresh, openEditor, openCreator, onClick, renderDetails, loading, search = false, getItemName, viewSelector = false, defaultView = "grid", limitSelector = false, defaultLimit = 8, pagination = false, children }: GenericListProps<T>) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredItems, setFilteredItems] = useState<T[]>(items);
    const [view, setView] = useState<"grid" | "list">(defaultView);
    const [limit, setLimit] = useState<number>(defaultLimit);

    const [page, setPage] = useState<number>(0);
    const [maxPages, setMaxPages] = useState<number>(Math.ceil(items.length / (limit || items.length)));

    const limitOptions = [4, 8, 12, 16, 20, 24, 32, 50, 100];

    const filterItems = () => {
        if (!searchQuery) {
            setFilteredItems(items);
        }
        else {
            const query = searchQuery.toLowerCase();
            const filtered = items.filter(item =>
                getItemName ? getItemName(item).trim().toLowerCase().includes(query.trim().toLowerCase()) : false
            );
            setFilteredItems(filtered);
        }
    }

    useEffect(() => {
        filterItems();
    }, [searchQuery, items]);

    useEffect(() => {
        setMaxPages(Math.ceil(filteredItems.length / limit));
    }, [filteredItems, limit]);

    const nextPage = () => {
        if (page < maxPages - 1) {
            setPage(page + 1);
        }
    }

    const prevPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    }

    return (
        <div className="w-100 h-100 align-items-center justify-content-start d-flex flex-column gap-2">
            {search && (
                <div className="w-100 d-flex flex-row mb-2 align-items-center justify-content-between gap-2">
                    {refresh && (
                            <ButtonField
                                onClick={refresh}
                                loading={loading}
                                color="dark"
                                rounding="pill"
                                className="px-3 py-2"
                            >
                                Refresh
                            </ButtonField>
                    )}

                        <ShortTextField
                            value={searchQuery}
                            setValue={setSearchQuery}
                            placeholder={`Search ${itemName}s by name...`}
                            prepend="🔍︎"
                            clearable
                            className="w-100"
                        />

                    {viewSelector && (
                            <DropdownField
                                value={view}
                                setValue={setView}
                                prepend="View"
                                options={["grid", "list"]}
                                optionValue={(option) => option}
                                optionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                            />
                    )}

                    {limitSelector && (
                            <DropdownField
                                value={limit}
                                setValue={setLimit}
                                prepend="Limit"
                                options={limitOptions}
                                optionValue={(option) => option}
                                optionLabel={(option) => option.toString()}
                            />
                    )}

                    {openCreator && (
                            <ButtonField
                                onClick={openCreator}
                                loading={loading}
                                color="primary"
                                rounding="pill"
                                className="px-3 py-2"
                            >
                                Create
                            </ButtonField>
                    )}

                    {children}
                </div>
            )}

            {loading ? (
                <Loading message={`Loading ${itemName}s...`} />
            ) : items.length === 0 ? (
                <div className="text-light text-center">
                    <p>No {itemName}s found.</p>
                    {openCreator && (
                        <ButtonField onClick={openCreator}>
                            Create one now!
                        </ButtonField>
                    )}
                </div>
            ) : items.length > 0 && filteredItems.length === 0 ? (
                <div className="text-light text-center">
                    <p>No {itemName}s found matching your search.</p>
                    {openCreator && (
                        <ButtonField onClick={openCreator}>
                            Create one now!
                        </ButtonField>
                    )}
                </div>
            ) : (
                <div className="w-100 h-100 d-flex flex-column align-items-center">
                    <div className={`w-100 d-flex flex-${view === "grid" ? "row flex-wrap" : "column"}`}>
                        {filteredItems.slice(page * limit, (page + 1) * limit).map((item, index) => (
                            <div key={index} className={`${view === "grid" ? "col-lg-3 col-md-4 col-sm-6" : "col-12"} gap-2 p-2`}>
                                <div 
                                    className={["w-100 h-100 justify-content-between gap-2 p-3 rounded-3 d-flex overflow-hidden bg-dark",
                                        `flex-${view === "grid" ? "column" : "row"}`,
                                    ].join(" ")} 
                                    onClick={() => onClick ? onClick(item) : undefined}
                                >
                                    {renderDetails(item)}
                                    <span className="w-100 d-flex flex-row gap-2">
                                        {openEditor && (
                                            <ButtonField onClick={() => openEditor(item)}
                                                loading={loading}
                                                color="primary"
                                                rounding="2"
                                                className={`px-4 w-${view === "grid" ? 100 : 25}`} >
                                                Edit
                                            </ButtonField>
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {pagination && (
                        <div className="col-md-4 col-6 d-flex flex-row justify-content-center align-items-center gap-2 mt-3">
                            <ButtonField
                                onClick={prevPage}
                                disabled={page === 0}
                                color="dark"
                                rounding="pill"
                                className="col-md-4 col-3 px-3 py-2"
                            >
                                Previous
                            </ButtonField>

                            <span className="col-md-4 col-6 text-light text-center d-flex flex-row align-items-center justify-content-center">
                                Page {page + 1} of {maxPages}
                            </span>

                            <ButtonField
                                onClick={nextPage}
                                disabled={page >= maxPages - 1}
                                color="dark"
                                rounding="pill"
                                className="col-md-4 col-3 px-3 py-2"
                            >
                                Next
                            </ButtonField>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GenericList;
