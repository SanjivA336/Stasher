import { StorageAPI } from "@/apis/containerApi";
import { DEFAULT_STORAGE } from "@/apis/default";
import { StorageType, type Storage } from "@/apis/schemas";
import { ButtonField, DropdownField, LongTextField, TextField } from "@/components/Fields";
import Modal from "@/components/Modal";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";


type StorageEditorProps = {
    showEditor: boolean;
    setShowEditor: (show: boolean) => void;

    storageId: string;
};

export function StorageEditor({ showEditor, setShowEditor, storageId }: StorageEditorProps) {

    const [localStorage, setLocalStorage] = useState<Storage>(DEFAULT_STORAGE);

    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const data = useStashData();

    async function fetchStorage() {
        setLoading(true);
        try {
            const storage: Storage | undefined = data.storages.get(storageId);
            if (!storage){
                throw new Error("Storage not found in context");
            }
            setLocalStorage(storage);
        } catch (error) {
            toast("danger", "Failed to load storage: " + getError(error));
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (showEditor) {
            fetchStorage();
        }
    }, [showEditor]);

    const saveStorage = async () => {
        if (!localStorage || loading) return;

        setLoading(true);
        try {
            const response: Storage = await StorageAPI.update(localStorage);
            toast("success", `Storage "${response.name}" updated successfully.`);
        } catch (error) {
            toast("danger", "Failed to update storage: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Edit Storage - ${localStorage.name}`}
            show={showEditor}
            setShow={setShowEditor}
            onConfirm={saveStorage}
            onCancel={() => { setLocalStorage(data.storages.get(storageId) || DEFAULT_STORAGE); }}
        >
            <form className="w-full h-full flex flex-col gap-2">
                    <TextField
                        value={localStorage?.name || ''}
                        setValue={(value: string) => setLocalStorage(prev => ({...prev, name: value}))}
                        label="Name"
                        disabled={loading}
                    />

                    <DropdownField
                        value={localStorage?.type || ""}
                        setValue={(value: string) => setLocalStorage(prev => ({...prev, type: value as StorageType}))}
                        options={Object.values(StorageType).map((type) => ({ label: type, value: type }))}
                        label="Type"
                        loading={loading}
                    />

                    <LongTextField
                        value={localStorage?.description || ''}
                        setValue={(value: string) => setLocalStorage(prev => ({...prev, description: value}))}
                        label="Description"
                        rows={3}
                        disabled={loading}
                    />

                    <ButtonField
                        onClick={() => { alert("Feature coming soon!"); }}
                        loading={loading}
                        className="px-4 py-2 rounded-full border-danger border-2 bg-danger hover:bg-danger/80 hover:text-text transition-all duration-200"
                    >
                        Delete Storage
                    </ButtonField>
            </form>
        </Modal>
    );
};