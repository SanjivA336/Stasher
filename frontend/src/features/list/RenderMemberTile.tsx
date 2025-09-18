import type { Member } from "@/apis/_schemas";
import ButtonField from "@/components/fields/ButtonField";

const RenderMemberTile = (member: Member, onClick: (member: Member) => void, openEditor?: (member: Member) => void, isSelected?: boolean, view: "grid" | "list" = "grid") => {

    return (
        <div className={view === "grid" ? "ratio ratio-4x3" : "w-100"}>
            <ButtonField
                onClick={() => onClick(member)}
                rounding="3"
                color={isSelected ? "primary" : "dark"}
                className={`w-100 h-100 m-2 p-3 rounded-3 text-light border-darkish border-2`}
            >
                <div className={`w-100 d-flex text-light flex-${view === "grid" ? "column" : "row"} justify-content-between`}>
                    <div className={`d-flex flex-row gap-1 justify-content-center`}>
                        <h4 className={`m-0 ${member.is_active ? "text-light" : "text-muted"}`}>{member.nickname}</h4>
                        <p className="my-auto badge text-bg-primary"><small>Admin</small></p>
                    </div>
                    <div className={`d-flex flex-${view === "grid" ? "row" : "column"} align-items-${view === "grid" ? "center" : "end"} gap-1 justify-content-center`}>
                        <p className="m-0 text-muted"><small>Debt: ${Object.values(member.debts).reduce((acc, debt) => acc + debt, 0)}</small></p>
                    </div>
                </div>
            </ButtonField>
        </div>
    );
};

export default RenderMemberTile;
