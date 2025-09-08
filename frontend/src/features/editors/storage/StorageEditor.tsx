import { useEffect, useState } from "react";

import type { Storage, Item } from "@/apis/_schemas";
import { StorageType } from "@/apis/_schemas";
import { StorageAPI } from "@/apis/repo_api";

import ButtonField from "@/components/fields/ButtonField";
import ShortTextField from "@/components/fields/ShortTextField";
import Modal from "@/components/design/Modal";

import Loading from "@/components/design/Loading";
import { toast } from "react-toastify";
import { useStash } from "@/context/stash/StashContext";
import LongTextField from "@/components/fields/LongTextField";
import ColorDecoder from "@/components/design/ColorDecoder";
import TabGroup from "@/components/design/TabGroup";

type StorageEditorProps = {
    showEditor: boolean;
    setShowEditor: (show: boolean) => void;
    refresh?: () => void;

    storageId: string;
}

export function StorageEditor({ showEditor, setShowEditor, refresh, storageId }: StorageEditorProps) {
    const { currentStash, stashLoading } = useStash();

    const [storage, setStorage] = useState<Storage | null>(null);
    const [oldStorage, setOldStorage] = useState<Storage | null>(null);
    const [items, setItems] = useState<Item[]>([]);

    const [loading, setLoading] = useState<boolean>(true);


    const fetchStorage = async () => {
        setLoading(true);
        try{
            if (!storageId || storageId.trim() === "") {
                throw new Error("No storage ID provided.");
            }
            const response: Storage = await StorageAPI.get(storageId);
            setStorage(response);
            setOldStorage(response);
        } catch (error) {
            toast.error("Failed to fetch storage: " + error);
            setStorage(null);
            setOldStorage(null);
        } finally {
            setLoading(false);
        }
    };

    const saveStorage = async () => {
        if (!storage) return;
        if (!currentStash) {
            if (stashLoading) {
                toast.info("Please wait for the current stash to load.");
            }
            else {
                toast.error("No stash selected. Please select a stash first.");
            }
            return;
        }

        setLoading(true);

        if (!storage.name || storage.name.trim() === "") {
            toast.error("Storage name cannot be empty.");
            setLoading(false);
            return;
        }

        try {
            const response: Storage = await StorageAPI.update({
                id: storage.id,
                name: storage.name,
                type: storage.type,
                description: storage.description,
            });
            setShowEditor(false);
            toast.success("Storage created successfully!");
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
            fetchStorage();
        } else {
            setStorage(null);
        }
    }, [showEditor]);

    return (
        <Modal
            title={`Edit ${oldStorage?.name || "an Existing Storage"}`}
            showModal={showEditor}
            setShowModal={(show) => setShowEditor(show)}
            width={6}
        >
            {loading ? (
                <Loading />
            ) : storage ? (
                <div>
                    <form className="d-flex flex-column gap-3">
                        <ShortTextField
                            value={storage?.name || ""}
                            setValue={(name) => setStorage({ ...storage, name })}
                            label="Stash Name"
                            placeholder={oldStorage?.name || "Enter a name..."}
                            required
                        />

                        <TabGroup
                            tabNames={Object.values(StorageType)}
                            tabNumber={Object.values(StorageType).indexOf(storage?.type || StorageType.OTHER)}
                            setTabNumber={(index) => setStorage({ ...storage, type: Object.values(StorageType)[index] })}
                            color={ColorDecoder(storage?.type || "")}
                        />

                        <LongTextField
                            value={storage?.description || ""}
                            setValue={(description) => setStorage({ ...storage, description })}
                            label="Description (Optional)"
                            placeholder={oldStorage?.description || "Enter a description..."}
                        />

                        <div className="d-flex flex-row gap-3 my-2">
                            <ButtonField
                                onClick={() => setShowEditor(false)}
                                className="w-100"
                                color="danger"
                            >
                                <p className="m-0">Cancel</p>
                            </ButtonField>

                            <ButtonField
                                onClick={() => saveStorage()}
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
                        onClick={fetchStorage}
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

export default StorageEditor;
