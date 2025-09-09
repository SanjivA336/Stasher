import type { Storage } from "@/apis/_schemas";
import ColorDecoder from "@/components/design/ColorDecoder";
import ButtonField from "@/components/fields/ButtonField";
import { toast } from "react-toastify/unstyled";

const RenderStorageTile = (storage: Storage, onClick: (storage: Storage) => void, openEditor?: (storage: Storage) => void, isSelected?: boolean) => {

    const color = ColorDecoder(storage.type);

    return (
        <div className="ratio ratio-4x3">
            <ButtonField
                onClick={() => onClick(storage)}
                rounding="3"
                color={isSelected ? color : "dark"}
                className={[
                    `w-100 h-100 m-2 p-3 rounded-3 text-light d-flex flex-column align-items-start justify-content-center text-start`,
                    `border border-2 border-${color}`,
                ].join(" ")}
            >
                <div className="d-flex flex-column align-items-center text-center">
                    <span className="d-flex flex-row gap-1 align-content-end">
                        <h4 className="m-0 text-light">{storage.name}</h4>
                        <p 
                            className={[
                                `my-auto badge p-1 rounded-1`,
                                isSelected ? `text-bg-light text-dark` : `text-bg-${color}`

                            ].join(" ")}><small>{storage.type}</small>
                        </p>
                    </span>
                    <p className="m-0">{storage.description ?? "No Description Provided"}</p>
                    <p className="m-0 text-muted"><small>{storage.item_ids.length} Items</small></p>
                </div>
            </ButtonField>
        </div>
    );
};

export default RenderStorageTile;
