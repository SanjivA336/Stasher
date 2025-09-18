import type { Label } from "@/apis/_schemas";
import ButtonField from "@/components/fields/ButtonField";

const RenderLabelTile = (label: Label, onClick: (label: Label) => void, openEditor?: (label: Label) => void, isSelected?: boolean, view: "grid" | "list" = "grid") => {

    return (
        <div className={view === "grid" ? "ratio ratio-16x9" : "w-100"}>
            <ButtonField
                onClick={() => onClick(label)}
                rounding="3"
                color={isSelected ? "primary" : "dark"}
                className="w-100 h-100 m-2 p-3 rounded-3 text-light border-darkish border-2"
            >
                <div className={`w-100 d-flex flex-${view === "grid" ? "column" : "row"}`}>
                    <div className={`d-flex flex-column align-items-${view === "grid" ? "center" : "start"} gap-1 justify-content-center w-100`}>
                        <h4 className="m-0">{label.name}</h4>
                        <p className="m-0">{label.current_quantity}</p>
                    </div>
                    <div className={`d-flex flex-${view === "grid" ? "row" : "column"} align-items-${view === "grid" ? "center" : "end"} gap-1 justify-content-center w-100`}>
                        <p className="m-0 text-muted"><small>{label.item_ids.length} Items</small></p>
                        <p className="m-0 text-muted"><small>Unit: {label.preferred_unit}</small></p>
                    </div>
                    
                </div>
            </ButtonField>
        </div>
    );
};

export default RenderLabelTile;
