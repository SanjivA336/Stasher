import { useEffect, useState } from "react";

import type { Stash, Member, Label, Storage } from "@/apis/_schemas";
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
import RenderLabelTile from "../list/RenderLabelTile";
import RenderStorageTile from "../list/RenderStorageTile";

type StashEditorProps = {
    showEditor: boolean;
    setShowEditor: (show: boolean) => void;
    refresh?: () => void;
}

export function StashEditor({ showEditor, setShowEditor, refresh }: StashEditorProps) {
    const { loader, setStashId } = useStash();

    const [stash, setStash] = useState<Stash | null>(null);

    const [currentMember, setCurrentMember] = useState<Member | null>(null);

    const [members, setMembers] = useState<Member[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [storages, setStorages] = useState<Storage[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [tabNumber, setTabNumber] = useState<number>(0);

    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
    const [selectedStorageIds, setSelectedStorageIds] = useState<string[]>([]);


    const fetchStashDetails = async (refresh: boolean = false) => {
        setLoading(true);
        try{
            const stashResponse: Stash = await loader.fetch_stash(refresh);
            const memberResponse: Member[] = await loader.fetch_members(refresh);
            const labelResponse: Label[] = await loader.fetch_labels(refresh);
            const storageResponse: Storage[] = await loader.fetch_storages(refresh);

            setStash(stashResponse);
            setMembers(memberResponse);
            setLabels(labelResponse);
            setStorages(storageResponse);

            const currentMember = await loader.fetch_current_member();
            setCurrentMember(currentMember);

        } catch (error) {
            toast.error("Failed to fetch stash details: " + error);
            setStash(null);
        } finally {
            setLoading(false);
        }
    };

    const saveStash = async () => {
        if (!stash) return;

        setLoading(true);

        if (!stash.name || stash.name.trim() === "") {
            toast.error("Stash name cannot be empty.");
            setLoading(false);
            return;
        }

        try {
            for (const member of members) {
                if (!stash.member_ids.includes(member.id)) {
                    await loader.delete_member(member.id);
                }
            }

            for (const storage of storages) {
                if (!stash.storage_ids.includes(storage.id)) {
                    await loader.delete_storage(storage.id);
                }
            }

            for (const label of labels) {
                if (!stash.label_ids.includes(label.id)) {
                    await loader.delete_label(label.id);
                }
            }

            const response: Stash = await StashAPI.update({
                id: stash.id,
                name: stash.name,
                address: stash.address,
                member_ids: stash.member_ids,
                label_ids: stash.label_ids,
                storage_ids: stash.storage_ids,
            });

            setStashId(response.id);
            setShowEditor(false);
            toast.success("Stash updated successfully!");
            if (refresh) {
                refresh();
            }
        }
        catch (error) {
            toast.error("Failed to create stash: " + error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (showEditor) {
            fetchStashDetails();
        } else {
            setStash(null);
        }
    }, [showEditor]);

    return (
        <Modal
            title="Edit an Existing Stash"
            showModal={showEditor}
            setShowModal={(show) => setShowEditor(show)}
            width={9}   
        >
            {loading ? (
                <Loading />
            ) : stash ? (
                <div className="w-100 gap-3 d-flex flex-row">
                    <TabGroup
                        tabNames={["General", "Members", "Labels", "Storages"]}
                        tabNumber={tabNumber}
                        setTabNumber={setTabNumber}
                        className="col-3 col-md-2"
                        orientation="vertical"

                    />
                    <form className="col-9 col-md-10 d-flex flex-column gap-3">
                        {tabNumber === 0 && (
                            <>
                                <ShortTextField
                                    value={stash?.name || ""}
                                    setValue={(name) => setStash({ ...stash, name })}
                                    label="Stash Name"
                                    placeholder="Enter a name..."
                                />

                                <ShortTextField
                                    value={stash?.address || ""}
                                    setValue={(address) => setStash({ ...stash, address })}
                                    label="Address (optional)"
                                    placeholder="Enter an address..."
                                />
                            </>
                        )}

                        {tabNumber === 1 && (
                            <>
                                {currentMember?.is_admin ? (
                                    <div className="d-flex flex-row w-100 gap-2">
                                        <ButtonField
                                            onClick={() => { }}
                                            className="w-100 p-3"
                                            rounding="3"
                                            loading={loading}
                                            disabled={selectedMemberIds.length === 0 || members.find(m => m.id === selectedMemberIds[0])?.id === currentMember.id || members.find(m => m.id === selectedMemberIds[0])?.is_admin}
                                        >
                                            <p className="m-0 text-nowrap">Kick Member</p>
                                        </ButtonField>

                                        <ButtonField
                                            onClick={() => { }}
                                            className="w-100 p-3"
                                            rounding="3"
                                            loading={loading}
                                            disabled={selectedMemberIds.length === 0 || members.find(m => m.id === selectedMemberIds[0])?.id === currentMember.id || members.find(m => m.id === selectedMemberIds[0])?.is_active}
                                        >
                                            <p className="m-0 text-nowrap">{members.find(m => m.id === selectedMemberIds[0])?.is_admin ? "Demote" : "Promote"} Member</p>
                                        </ButtonField>

                                        <ButtonField
                                            onClick={() => { }}
                                            className="w-100 p-3"
                                            rounding="3"
                                            loading={loading}
                                            disabled={selectedMemberIds.length === 0 || members.find(m => m.id === selectedMemberIds[0])?.id === currentMember.id || !members.find(m => m.id === selectedMemberIds[0])?.is_active}
                                        >
                                            <p className="m-0 text-nowrap">Delete Member</p>
                                        </ButtonField>
                                    </div>
                                ) : null}
                                <GenericList<Member>
                                    items={members}
                                    onRefresh={() => fetchStashDetails(true)}
                                    renderTile={RenderMemberTile}
                                    searchBar
                                    selectedItemIds={selectedMemberIds}
                                    setSelectedItemIds={setSelectedMemberIds}
                                    getItemName={(member) => member.nickname}
                                    defaultLimit={8}
                                    pagination
                                    defaultView="list"
                                />
                            </>
                        )}

                        
                        {tabNumber === 2 && (
                            <>
                                <GenericList<Label>
                                    items={labels}
                                    onRefresh={() => fetchStashDetails(true)}
                                    renderTile={RenderLabelTile}
                                    searchBar
                                    selectedItemIds={selectedLabelIds}
                                    setSelectedItemIds={setSelectedLabelIds}
                                    getItemName={(label) => label.name}
                                    defaultLimit={8}
                                    pagination
                                    defaultView="list"
                                />
                            </>
                        )}

                        {tabNumber === 3 && (
                            <>
                                <GenericList<Storage>
                                    items={storages}
                                    onRefresh={() => fetchStashDetails(true)}
                                    renderTile={RenderStorageTile}
                                    searchBar
                                    selectedItemIds={selectedStorageIds}
                                    setSelectedItemIds={setSelectedStorageIds}
                                    getItemName={(storage) => storage.name}
                                    defaultLimit={8}
                                    pagination
                                    defaultView="list"
                                />
                            </>
                        )}

                        <div className="d-flex flex-row gap-3 my-2">
                            <ButtonField
                                onClick={() => setShowEditor(false)}
                                className="w-100"
                                color="danger"
                            >
                                <p className="m-0">Cancel</p>
                            </ButtonField>

                            <ButtonField
                                onClick={() => saveStash()}
                                className="w-100"
                            >
                                <p className="m-0">Create</p>
                            </ButtonField>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="d-flex flex-column align-items-center">
                    <h3 className="m-0">Oh No!</h3>
                    <h6 className="my-2">Something went wrong. Please try again.</h6>
                    <ButtonField
                        onClick={() => { fetchStashDetails(true); }}
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
