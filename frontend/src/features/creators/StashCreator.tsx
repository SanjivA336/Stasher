import { StashAPI } from "@/apis/containerApi";
import { DEFAULT_STASH } from "@/apis/default";
import { type Stash } from "@/apis/schemas";
import Modal from "@/components/Modal";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";

type StashCreatorProps = {
    showCreator: boolean;
    setShowCreator: (show: boolean) => void;
};

export function StashCreator({ showCreator, setShowCreator }: StashCreatorProps) {

    const [localStash, setLocalStash] = useState<Stash>(DEFAULT_STASH);

    const [loading, setLoading] = useState(false);

    const toast = useToast();

    async function fetchTemplate() {
        setLoading(true);
        try {
            const response: Stash = await StashAPI.get_template();
            setLocalStash(response);
        } catch (error) {
            toast("danger", "Failed to load stash template: " + getError(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (showCreator) {
            fetchTemplate();
        }
    }, [showCreator]);

    const saveStash = async () => {
        if (!localStash || loading) return;

        setLoading(true);
        try {
            const response: Stash = await StashAPI.create(localStash);
            toast("success", `Stash "${response.name}" created successfully.`);
        } catch (error) {
            toast("danger", "Failed to create stash: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Stash"
            show={showCreator}
            setShow={setShowCreator}
            onConfirm={saveStash}
            onCancel={() => { setLocalStash(DEFAULT_STASH); }}
        >
            <form>
                <div className="flex flex-col gap-1">
                    <h3>Stash Name</h3>
                    <input
                        type="text"
                        placeholder="Name"
                        value={localStash?.name || ''}
                        onChange={(e) => setLocalStash(prev =>({...(prev), name: e.target.value}))}
                        disabled={loading}
                        className="p-2 border border-gray-300 rounded"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <h3>Stash Address (Optional)</h3>
                    <input
                        type="text"
                        placeholder="Address (Optional)"
                        value={localStash?.address || ''}
                        onChange={(e) =>
                            setLocalStash(prev =>
                                ({
                                    ...(prev ?? { member_ids: [], storage_ids: [], label_ids: [] }),
                                    address: e.target.value,
                                } as Stash)
                            )
                        }
                        disabled={loading}
                        className="p-2 border border-gray-300 rounded"
                    />
                </div>
            </form>
        </Modal>
    );
};