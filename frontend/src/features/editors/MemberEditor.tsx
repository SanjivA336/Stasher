import { MemberAPI } from "@/apis/identityApi";
import { DEFAULT_MEMBER } from "@/apis/default";
import { type Member } from "@/apis/schemas";
import { ButtonField, TextField, ToggleField } from "@/components/Fields";
import Modal from "@/components/Modal";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";


type MemberEditorProps = {
    showEditor: boolean;
    setShowEditor: (show: boolean) => void;

    memberId: string;
};

export function MemberEditor({ showEditor, setShowEditor, memberId }: MemberEditorProps) {

    const toast = useToast();
    const data = useStashData();

    const [localMember, setLocalMember] = useState<Member>(data.members.get(memberId) || DEFAULT_MEMBER);

    const [loading, setLoading] = useState(false);


    async function fetchMember() {
        setLoading(true);
        try {
            const member: Member | undefined = data.members.get(memberId);
            if (!member){
                throw new Error("Member not found in context");
            }
            setLocalMember(member);
        } catch (error) {
            toast("danger", "Failed to load member: " + getError(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (showEditor) {
            fetchMember();
        }
    }, [showEditor]);

    const saveMember = async () => {
        if (!localMember || loading) return;

        setLoading(true);
        try {
            const response: Member = await MemberAPI.update(localMember);
            toast("success", `Member "${response.nickname}" updated successfully.`);
        } catch (error) {
            toast("danger", "Failed to update member: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Edit Member - ${localMember.nickname}`}
            show={showEditor}
            setShow={setShowEditor}
            onConfirm={saveMember}
            onCancel={() => { setLocalMember(data.members.get(memberId) || DEFAULT_MEMBER); }}
        >
            <form className="w-full h-full flex flex-col gap-2">
                    <TextField
                        value={localMember?.nickname || ''}
                        setValue={(value: string) => setLocalMember(prev => ({...prev, nickname: value}))}
                        label="Nickname"
                        disabled={loading}
                    />

                    <ToggleField
                        value={localMember?.is_admin || false}
                        setValue={(value: boolean) => setLocalMember(prev => ({...prev, is_admin: value}))}
                        disabled={loading}
                    >
                        Administrator Privileges: {localMember?.is_admin ? "Enabled" : "Disabled"}
                    </ToggleField>

                    <ButtonField
                        onClick={() => { alert("Feature coming soon!"); }}
                        loading={loading}
                        className="px-4 py-2 rounded-full border-danger border-2 bg-danger hover:bg-danger/80 hover:text-text transition-all duration-200"
                    >
                        Delete Member Data
                    </ButtonField>
                </form>
            </Modal>
    );
};