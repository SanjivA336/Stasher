import { useEffect, useState } from "react";

import ButtonField from "@/components/fields/ButtonField";
import ShortTextField from "@/components/fields/ShortTextField";
import DropdownField from "@/components/fields/DropdownField";
import NumberField from "@/components/fields/NumberField";

import Loading from "@/components/design/Loading";

import type { BaseDocument } from "@/apis/_schemas";
import { toast } from "react-toastify";

type GenericListProps<T extends BaseDocument> = {
    items: T[];
    onRefresh?: () => void;

    openCreator?: () => void;
    openEditor?: (item: T) => void;
    onClick?: (item: T) => void;

    loading?: boolean;

    searchBar?: boolean;
    getItemName?: (item: T) => string;
    viewSelector?: boolean;
    defaultView?: "grid" | "list";
    limitSelector?: boolean;
    defaultLimit?: number;
    pagination?: boolean;

    selectedItemIds?: string[];
    setSelectedItemIds?: (itemIds: string[]) => void;
    maxSelect?: number;
    removeFirst?: boolean;

    renderTile: (item: T, onClick: (item: T) => void, onEdit?: (item: T) => void, isSelected?: boolean) => React.ReactNode;
}

export function GenericList<T extends BaseDocument>({ items, onRefresh, openEditor, openCreator, onClick, loading, searchBar = false, getItemName, viewSelector = false, defaultView = "grid", limitSelector = false, defaultLimit = 8, pagination = false, selectedItemIds, setSelectedItemIds, maxSelect = 1, removeFirst = true, renderTile }: GenericListProps<T>) {
    // === States / Variables / Constants ===

    // Search
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredItems, setFilteredItems] = useState<T[]>(items);
    
    // View
    const [view, setView] = useState<"grid" | "list">(defaultView);
    
    // Limit
    const [limit, setLimit] = useState<number>(defaultLimit);
    const limitOptions = [4, 8, 12, 16, 20, 24, 32, 50, 100];

    // Pagination
    const [page, setPage] = useState<number>(0);
    const [maxPages, setMaxPages] = useState<number>(Math.ceil(items.length / (limit || items.length)));

    // === Parameter Validation ===
    if (searchBar && !getItemName) {
        throw new Error("getItemName function must be provided when search is enabled.");
    }

    if ((selectedItemIds != null && setSelectedItemIds == null) || (selectedItemIds == null && setSelectedItemIds != null)) {
        throw new Error("selectedItemIds and setSelectedItemIds must be provided.");
    }

    // === Logic ===
    // Search
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

    // Pagination
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

    const toggleSelect = (itemId: string) => {
        if (!(selectedItemIds && setSelectedItemIds)) return;
        if (selectedItemIds.includes(itemId)) {
            setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
        }
        else {
            if (maxSelect != -1 && selectedItemIds.length >= maxSelect) {
                if (removeFirst) {
                    setSelectedItemIds([...selectedItemIds.slice(1), itemId]);
                }
                else {
                    toast.error(`You can only select up to ${maxSelect} items.`);
                }
            }
            else {
                setSelectedItemIds([...selectedItemIds, itemId]);
            }
        }
    }

    // OnClick
    const handleClick = (item: T) => {
        toggleSelect(item.id);
        onClick ? onClick(item) : undefined;    
    }

    return (
        <div className="w-100 h-100 align-items-center justify-content-start d-flex flex-column gap-2">
            {searchBar && (
                <div className="w-100 d-flex flex-row mb-2 align-items-center justify-content-between gap-2">
                    {onRefresh && (
                            <ButtonField
                                onClick={onRefresh}
                                loading={loading}
                                color="dark"
                                rounding="pill"
                                className="px-3 py-2 border-darkish border-2"
                            >
                                Refresh
                            </ButtonField>
                    )}

                        <ShortTextField
                            value={searchQuery}
                            setValue={setSearchQuery}
                            placeholder={`Search by name...`}
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
                </div>
            )}

            {loading ? (
                <Loading message={`Loading items...`} />
            ) : items.length === 0 ? (
                <div className="text-light text-center">
                    <p>No items found.</p>
                    {openCreator && (
                        <ButtonField onClick={openCreator}>
                            Create one now!
                        </ButtonField>
                    )}
                </div>
            ) : items.length > 0 && filteredItems.length === 0 ? (
                <div className="text-light text-center">
                    <p>No items found matching your search.</p>
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
                            <div 
                                key={index} 
                                className={`${view === "grid" ? "col-lg-3 col-sm-6 col-12" : "col-12"} gap-2 p-2 `}
                            >
                                    {renderTile(
                                        item,
                                        () => handleClick(item),
                                        openEditor,
                                        (selectedItemIds ? selectedItemIds.includes(item.id) : false)
                                    )}
                            </div>
                        ))}
                    </div>

                    {pagination && maxPages > 1 && (
                        <div className="container-sm d-flex flex-row justify-content-center align-items-center gap-2 mt-3">
                            <ButtonField
                                onClick={prevPage}
                                disabled={page === 0}
                                color="dark"
                                rounding="pill"
                                className="col-md-2 col-sm-3 col-4 px-3 py-2"
                            >
                                Previous
                            </ButtonField>

                            <span className="col-md-2 col-sm-3 col-4 text-light text-center d-flex flex-row align-items-center justify-content-center">
                                Page {page + 1} of {maxPages}
                            </span>

                            <ButtonField
                                onClick={nextPage}
                                disabled={page >= maxPages - 1}
                                color="dark"
                                rounding="pill"
                                className="col-md-2 col-sm-3 col-4 px-3 py-2"
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
