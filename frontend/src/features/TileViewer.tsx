import { StorageType, type BaseDocument, type Storage } from "@/apis/schemas";
import { ButtonField, NumberField } from "@/components/Fields";
import { useState } from "react";

type TileRendererProps<T extends BaseDocument> = {
    item: T;
    card: boolean;
    isSelected?: boolean;
};

type TileViewerProps<T extends BaseDocument> = {
    items: T[];
    renderTile: ({ item, card, isSelected }: TileRendererProps<T>) => React.ReactNode;

    style?: 'grid' | 'list';

    onClick?: (id: string) => void;

    selected?: string[];
    setSelected?: (selected: string[]) => void;
    maxSelection?: number;
    maxSelectionBehavior?: 'disable' | 'deselect';

    pageLimit?: number;

    className?: string;
};

export function TileViewer<T extends BaseDocument>({ items, renderTile, style = 'list', onClick, selected, setSelected, maxSelection = 1, maxSelectionBehavior = 'disable', pageLimit = -1, className }: TileViewerProps<T>) {

    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = pageLimit > 0 ? Math.ceil(items.length / pageLimit) : 1;

    if (onClick && (selected || setSelected)) {
        console.error("TileViewer: Cannot use onClick with selection props.");
        return null;
    }

    if (pageLimit > 0) {
        items = items.slice(pageLimit * (currentPage - 1), pageLimit * currentPage);
    }

    return (
        <div
            className={`
                    w-full justify-center
                    ${style === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : ''}
                    ${style === 'list' ? 'flex flex-col' : ''}
                    ${className}
                `}
                >

            {items.length === 0 ? (
                <p className="text-text text-center w-full">No items to display.</p>
            ) : (
                <div className="w-full h-full flex flex-col gap-2 justify-center items-center">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="w-full"
                            onClick={() => {
                                if (onClick) {
                                    onClick(item.id);
                                    return;
                                }

                                if (selected && setSelected) {
                                    const isSelected = selected.includes(item.id);
                                    if (isSelected) {
                                        setSelected(selected.filter((id) => id !== item.id));
                                    } else {
                                        if (maxSelectionBehavior === 'disable' && selected.length >= maxSelection) {
                                            return;
                                        }

                                        if (maxSelectionBehavior === 'deselect' && selected.length >= maxSelection) {
                                            selected = selected.slice(1);
                                        }

                                        setSelected([...selected, item.id]);
                                    }
                                }
                            }}>
                                {renderTile({
                                    item: item,
                                    card: style !== 'list',
                                    isSelected: selected ? selected.includes(item.id) : false
                                })}
                        </div>
                    ))}

                    {pageLimit > 0 && maxPage > 0 && (
                        <div className="flex flex-row gap-2">
                            <ButtonField
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="text-nowrap border-2 border-border px-2 py-1 bg-foreground hover:bg-border disabled:opacity-50"
                            >
                                ⇤
                            </ButtonField>
                            <NumberField
                                value={currentPage}
                                setValue={(value) => setCurrentPage(Math.max(1, Math.min(value, maxPage)))}
                                incrementable
                            />
                            <ButtonField
                                onClick={() => setCurrentPage(maxPage)}
                                disabled={currentPage === maxPage}
                                className="text-nowrap border-2 border-border px-2 py-1 bg-foreground hover:bg-border disabled:opacity-50"
                            >
                                ⇥
                            </ButtonField>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export function StorageTileRenderer({ item: storage, card, isSelected }: TileRendererProps<Storage>) {

    return (
        <div
            key={storage.id}
            className={`
                w-full h-full p-4 rounded-xl border-2 text-text justify-between items-center hover:scale-105 transition-all duration-200 
                ${card ? "flex flex-col gap-2" : "flex flex-row gap-2"}
                ${storage.type === StorageType.PANTRY ? `border-pantry/70 hover:border-pantry ${isSelected ? "bg-pantry" : "bg-foreground"}` : ""}
                ${storage.type === StorageType.FRIDGE ? `border-fridge/70 hover:border-fridge ${isSelected ? "bg-fridge" : "bg-foreground"}` : ""}
                ${storage.type === StorageType.GARDEN ? `border-garden/70 hover:border-garden ${isSelected ? "bg-garden" : "bg-foreground"}` : ""}
                ${storage.type === StorageType.FREEZER ? `border-freezer/70 hover:border-freezer ${isSelected ? "bg-freezer" : "bg-foreground"}` : ""}
                ${storage.type === StorageType.OTHER ? `border-other/70 hover:border-other ${isSelected ? "bg-other" : "bg-foreground"}` : ""}
            `}>
                <div className="flex flex-col">
                    <h3 className={`text-lg font-semibold ${card ? "text-center" : ""}`}>{storage.name}{!card && <span className="text-sm font-normal text-text-alt">&nbsp; {storage.type}</span>}</h3>
                    {card && <p className="text-sm font-normal text-text-alt text-center">{storage.type}</p>}
                    <p className={`text-sm ${card ? "text-center" : ""}`}>{storage.description}</p>
                </div>

                <div className="flex flex-col">
                    <p className={`text-sm text-alt font-thin ${card ? "text-center" : ""}`}>{storage.item_ids.length} Items</p>
                    <p className={`text-sm text-alt font-thin ${card ? "text-center" : ""}`}>Last Updated on {storage.updated_at.substring(0,10).replace(/-/g, "/")}</p>
                </div>

        </div>
    )
}