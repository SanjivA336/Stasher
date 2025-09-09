import type { Item } from "@/apis/_schemas";
import ColorDecoder from "@/components/design/ColorDecoder";
import ButtonField from "@/components/fields/ButtonField";
import { toast } from "react-toastify/unstyled";

const RenderItemTile = (item: Item, onClick: (item: Item) => void, openEditor?: (item: Item) => void, isSelected?: boolean) => {


    return (
        <div className="ratio ratio-4x3">
            <ButtonField
                onClick={() => onClick(item)}
                rounding="3"
                color={isSelected ? "primary" : "dark"}
                className={[
                    `w-100 h-100 m-2 p-3 rounded-3 text-light d-flex flex-column align-items-start justify-content-center text-start`,
                ].join(" ")}
            >
                <div className="d-flex flex-column align-items-center text-center">
                    <h4 className="m-0 text-light">{item.name}</h4>
                    <p className="m-0">{item.current_quantity} / {item.total_quantity}</p>
                    <p className="m-0 text-muted"><small>{item.allowed_member_usage.length} Allowed Members</small></p>
                </div>
            </ButtonField>
        </div>
    );
};

export default RenderItemTile;
