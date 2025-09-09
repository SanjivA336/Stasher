import type { Stash } from "@/apis/_schemas";
import ColorDecoder from "@/components/design/ColorDecoder";
import ButtonField from "@/components/fields/ButtonField";

const RenderStashTile = (stash: Stash, onClick: (stash: Stash) => void, openEditor?: (stash: Stash) => void, isSelected?: boolean) => {


    return (
        <div className="ratio ratio-16x9">
            <ButtonField
                onClick={() => onClick(stash)}
                rounding="3"
                color={isSelected ? "primary" : "dark"}
                className={[
                    `w-100 h-100 m-2 p-3 rounded-3 text-light`,
                ].join(" ")}
            >
                <div className="d-flex flex-column align-items-center justify-content-center text-center">
                    <h4 className="m-0 text-light">{stash.name}</h4>
                    <p className="m-0">{stash.address ?? "No Address Provided"}</p>
                    <p className="m-0 text-muted"><small>{stash.member_ids.length} Members</small></p>
                </div>
            </ButtonField>
        </div>
    );
};

export default RenderStashTile;
