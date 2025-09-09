import type { Member } from "@/apis/_schemas";
import ColorDecoder from "@/components/design/ColorDecoder";
import ButtonField from "@/components/fields/ButtonField";
import { toast } from "react-toastify/unstyled";

const RenderMemberTile = (member: Member, onClick: (member: Member) => void, openEditor?: (member: Member) => void, isSelected?: boolean) => {

    return (
        <ButtonField
            onClick={() => onClick(member)}
            rounding="3"
            color={isSelected ? "primary" : "dark"}
            className={[
                `w-100 h-100 m-2 p-3 rounded-3 text-light d-flex flex-column align-items-start justify-content-center text-start`,
                isSelected ? `` : `border-darkish border-2`,
            ].join(" ")}
        >
            <div className="d-flex flex-column align-items-center text-center">
                {member.is_admin && 
                    <p 
                        className={[
                            `my-auto badge p-1 rounded-1`,
                            isSelected ? `text-bg-light text-dark` : `text-bg-primary`
                        ].join(" ")}>
                            <small>Admin</small>
                    </p>
                }
                <h4 className="m-0 text-light">{member.nickname}</h4>
                <p className="m-0 text-muted"><small>Debt: {Object.values(member.debts).reduce((sum, val) => sum + val, 0)}</small></p>
            </div>
        </ButtonField>
    );
};

export default RenderMemberTile;
