import type { Storage } from "@/apis/_schemas";
import ColorDecoder from "@/components/design/ColorDecoder";
import ButtonField from "@/components/fields/ButtonField";

const RenderStorageTile = (storage: Storage, onClick: (storage: Storage) => void, openEditor?: (storage: Storage) => void, isSelected?: boolean, view: "grid" | "list" = "grid") => {

    const color = ColorDecoder(storage.type);

    return (
        <div className={view === "grid" ? "ratio ratio-4x3" : "w-100"}>
            <ButtonField
                onClick={() => onClick(storage)}
                rounding="3"
                color={isSelected ? "primary" : "dark"}
                className={`w-100 h-100 m-2 p-3 rounded-3 text-light border border-${color} border-2`}
            >
                <div className={`w-100 d-flex text-light flex-${view === "grid" ? "column" : "row"} justify-content-between`}>
                    <div className={`d-flex flex-row gap-1 justify-content-center`}>
                        <h4 className="m-0">{storage.name}</h4>
                        <p className={`my-auto badge text-bg-${color}`}><small>{storage.type}</small></p>
                    </div>
                    <div className={`d-flex flex-column align-items-center justify-content-center`}>
                        <p className="m-0">{storage.description ?? "No Description Provided"}</p>
                    </div>
                    <div className={`d-flex flex-${view === "grid" ? "row" : "column"} align-items-${view === "grid" ? "center" : "end"} gap-1 justify-content-center`}>
                        <p className="m-0 text-muted"><small>{storage.item_ids.length} Items</small></p>
                    </div>
                </div>
            </ButtonField>
        </div>
    );
};

export default RenderStorageTile;
