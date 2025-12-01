import { StorageAPI } from "@/apis/containerApi";
import { DEFAULT_STORAGE } from "@/apis/default";
import { StorageType, type Storage } from "@/apis/schemas";
import { DropdownField, LongTextField, TextField } from "@/components/Fields";
import Modal from "@/components/Modal";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";


type StorageCreatorProps = {
    showCreator: boolean;
    setShowCreator: (show: boolean) => void;
};

export function StorageCreator({ showCreator, setShowCreator }: StorageCreatorProps) {

    const [localStorage, setLocalStorage] = useState<Storage>(DEFAULT_STORAGE);

    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const data = useStashData();

    async function fetchTemplate() {
        setLoading(true);
        try {
            const response: Storage = await StorageAPI.get_template();
            response.stash_id = data.stash.id;
            setLocalStorage(response);
        } catch (error) {
            toast("danger", "Failed to load storage template: " + getError(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (showCreator) {
            fetchTemplate();
        }
    }, [showCreator]);

    const saveStorage = async () => {
        if (!localStorage || loading) return;

        setLoading(true);
        try {
            const response: Storage = await StorageAPI.create(localStorage);
            toast("success", `Storage "${response.name}" created successfully.`);
        } catch (error) {
            toast("danger", "Failed to create storage: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Storage"
            show={showCreator}
            setShow={setShowCreator}
            onConfirm={saveStorage}
            onCancel={() => { setLocalStorage(DEFAULT_STORAGE); }}
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
            </form>
        </Modal>
    );
};