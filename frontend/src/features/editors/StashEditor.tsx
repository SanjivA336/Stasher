import { useEffect, useState } from "react";

import type { Stash, Label, Storage, Member } from "@/apis/_schemas";
import { StashAPI } from "@/apis/repo_api";

import ButtonField from "@/components/fields/ButtonField";
import ShortTextField from "@/components/fields/ShortTextField";
import Modal from "@/components/design/Modal";

import Loading from "@/components/design/Loading";
import { toast } from "react-toastify";
import { useStash } from "@/context/stash/StashContext";
import TabGroup from "@/components/design/TabGroup";
import GenericList from "../list/GenericList";
import RenderMemberTile from "../list/RenderMemberTile";
import { useAuth } from "@/context/auth/AuthContext";

type StashEditorProps = {
    showEditor: boolean;
    setShowEditor: (show: boolean) => void;
}

export function StashEditor({ showEditor, setShowEditor }: StashEditorProps) {
    const { user } = useAuth();
    const { loader, setStashId, stashLoading } = useStash();

    const [stash, setStash] = useState<Stash | null>(null);

    const [storages, setStorages] = useState<Storage[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);

    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [tabNumber, setTabNumber] = useState<number>(0);

    const [editMode, setEditMode] = useState<boolean>(false);

    const [currentMember, setCurrentMember] = useState<Member | null>(null);

    const fetchStash = async () => {
        if (!loader.is_loaded()) return;

        setLoading(true);
        try{
            const response: Stash = await StashAPI.get(loader.stash.id);
            setStash(response);
            fetchStashData();
        } catch (error) {
            toast.error("Failed to fetch stash details: " + error);
            setStash(null);
        } finally {
            
            setLoading(false);
        }
    };

    const fetchStashData = async () => {
        if (!stash) return;

        setLoading(true);
        try{
            const storageResponse: Storage[] = await loader.fetch_storages();
            storageResponse.sort((a, b) => a.name.localeCompare(b.name));
            setStorages(storageResponse);

            const labelResponse: Label[] = await loader.fetch_labels();
            labelResponse.sort((a, b) => a.name.localeCompare(b.name));
            setLabels(labelResponse);

            const memberResponse: Member[] = await loader.fetch_members();
            memberResponse.sort((a, b) => a.nickname.localeCompare(b.nickname));
            memberResponse.sort((a, b) => a.is_admin === b.is_admin ? 0 : a.is_admin ? -1 : 1);
            setMembers(memberResponse);

        } catch (error) {
            toast.error("Failed to fetch stash information: " + error);
            setStorages([]);
            setLabels([]);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const saveStash = async () => {
        if (!stash) return;

        setLoading(true);

        try {
            const response: Stash = await StashAPI.update(stash);
            setStashId(response.id);
            setShowEditor(false);
            toast.success("Stash updated successfully!");
        }
        catch (error) {
            toast.error("Failed to update stash: " + error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (showEditor) {
            fetchStash();
        } else {
            setStash(null);
        }
    }, [showEditor]);

    return (
        <Modal
            title={`Edit ${loader.stash?.name || "Stash"}`}
            showModal={showEditor}
            setShowModal={(show) => setShowEditor(show)}
            width={6}
            editMode={currentMember?.is_admin ? editMode : undefined}
            setEditMode={currentMember?.is_admin ? setEditMode : undefined}
        >
            {loading ? (
                <Loading />
            ) : stash ? (
                <div className="d-flex flex-row gap-3 justify-content-center align-items-center">
                    <TabGroup
                        tabNames={["General", "Members", "Labels", "Storages"]}
                        tabNumber={tabNumber}
                        setTabNumber={setTabNumber}
                        orientation="vertical"
                        className="col-2"
                    />
                    <form className="d-flex flex-column gap-3 col-10 border-darkish border-end-0 border-top-0 border-bottom-0 border-2 ps-3">

                        {tabNumber === 0 && (
                            <>
                                <div className="d-flex flex-column text-center">
                                    <h5 className="m-0">General</h5>
                                </div>
                                
                                <ShortTextField
                                    value={stash?.name || ""}
                                    setValue={(name) => setStash({ ...stash, name })}
                                    label="Stash Name"
                                    placeholder={loader.stash?.name || "Enter a name..."}
                                    disabled={!editMode || loading}
                                />

                                <ShortTextField
                                    value={stash?.address || ""}
                                    setValue={(address) => setStash({ ...stash, address })}
                                    label="Address (Optional)"
                                    placeholder={loader.stash?.address || "Enter an address..."}
                                    disabled={!editMode || loading}
                                />
                            </>
                        )}

                        {tabNumber === 1 && (
                            <>
                                <div className="d-flex flex-column text-center">
                                    <h5 className="m-0">Members</h5>
                                </div>

                                { editMode && currentMember?.is_admin && (
                                    <div className="d-flex flex-row justify-content-center align-items-center gap-2">
                                        <ButtonField
                                            onClick={() => {navigator.clipboard.writeText(stash.join_code); toast.success("Join code copied to clipboard!")}}
                                            className="w-100"
                                            color="primary"
                                            rounding="3"
                                        >
                                            <p className="m-0">Copy Join Code</p>
                                        </ButtonField>

                                        <ButtonField
                                            onClick={() => {toast.info("Feature coming soon!")}}
                                            className="w-100"
                                            color="primary"
                                            rounding="3"
                                            disabled={selectedMemberIds.length === 0 || !currentMember?.is_admin || selectedMemberIds.includes(currentMember?.id || "")}
                                            outlineVariant={selectedMemberIds.length === 0}
                                        >
                                            <p className="m-0">{selectedMemberIds.length > 0 && members.find(member => member.id === selectedMemberIds[0])?.is_admin ? "Demote Member" : "Promote Member"}</p>
                                        </ButtonField>

                                        <ButtonField
                                            onClick={() => {toast.info("Feature coming soon!")}}
                                            className="w-100"
                                            color="danger"
                                            rounding="3"
                                            disabled={selectedMemberIds.length === 0 || !currentMember?.is_admin || selectedMemberIds.includes(currentMember?.id || "")}
                                            outlineVariant={selectedMemberIds.length === 0}
                                        >
                                            <p className="m-0">Kick Member</p>
                                        </ButtonField>
                                    </div>
                                )}

                                <GenericList
                                    items={members || []}
                                    onRefresh={fetchStashData}
                                    getItemName={(member) => member.nickname}
                                    defaultLimit={16}
                                    pagination
                                    searchBar
                                    viewSelector
                                    defaultView="list"
                                    selectedItemIds={selectedMemberIds}
                                    setSelectedItemIds={setSelectedMemberIds}
                                    renderTile={RenderMemberTile}
                                />
                            </>
                        )}
                        
                        {tabNumber === 2 && (
                            <div className="d-flex flex-column text-center">
                                <h5 className="m-0">Labels</h5>
                            </div>
                        )}

                        {tabNumber === 3 && (
                            <div className="d-flex flex-column text-center">
                                <h5 className="m-0">Storages</h5>
                            </div>
                        )}

                        {editMode && (
                            <div className="d-flex flex-row gap-3 my-2">
                                <ButtonField
                                    onClick={() => setShowEditor(false)}
                                    className="w-100"
                                    color="danger"
                                >
                                    <p className="m-0">Cancel Changes</p>
                                </ButtonField>

                                <ButtonField
                                    onClick={() => saveStash()}
                                    className="w-100"
                                >
                                    <p className="m-0">Save Changes</p>
                                </ButtonField>
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                <div className="d-flex flex-column align-items-center">
                    <h3 className="m-0">Oh No!</h3>
                    <h6 className="my-2">Something went wrong. Please try again.</h6>
                    <ButtonField
                        onClick={fetchStash}
                        className="w-100 mt-3 p-2"
                    >
                        <h5 className="m-0 text-light">Retry</h5>
                    </ButtonField>
                    <p className="text-muted m-1"><small>If the issue persists, please try again at a later time.</small></p>
                </div>
            )}
        </Modal>
    );
};

export default StashEditor;
