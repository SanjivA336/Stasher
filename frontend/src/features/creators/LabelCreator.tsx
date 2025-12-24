import { LabelAPI } from "@/apis/containerApi";
import { DEFAULT_LABEL } from "@/apis/default";
import { FoodGroup, type Label } from "@/apis/schemas";
import { DropdownField, TextField } from "@/components/Fields";
import Modal from "@/components/Modal";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";


type LabelCreatorProps = {
    showCreator: boolean;
    setShowCreator: (show: boolean) => void;
};

export function LabelCreator({ showCreator, setShowCreator }: LabelCreatorProps) {

    const [localLabel, setLocalLabel] = useState<Label>(DEFAULT_LABEL);

    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const data = useStashData();

    async function fetchTemplate() {
        setLoading(true);
        try {
            const response: Label = await LabelAPI.get_template();
            response.stash_id = data.stash.id;
            setLocalLabel(response);
        } catch (error) {
            toast("danger", "Failed to load label template: " + getError(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (showCreator) {
            fetchTemplate();
        }
    }, [showCreator]);

    const saveLabel = async () => {
        if (!localLabel || loading) return;

        setLoading(true);
        try {
            const response: Label = await LabelAPI.create(localLabel);
            toast("success", `Label "${response.name}" created successfully.`);
        } catch (error) {
            toast("danger", "Failed to create label: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Label"
            show={showCreator}
            setShow={setShowCreator}
            onConfirm={saveLabel}
            onCancel={() => { setLocalLabel(DEFAULT_LABEL); }}
        >
            <form className="flex flex-col gap-2">
                    <TextField
                        value={localLabel?.name || ''}
                        setValue={(value: string) => setLocalLabel(prev => ({...prev, name: value}))}
                        label="Name"
                        disabled={loading}
                    />

                    <DropdownField
                        value={localLabel?.preferred_unit || ""}
                        setValue={(value: string) => setLocalLabel(prev => ({...prev, preferred_unit: value}))}
                        options={["kg", "g", "lb", "oz", "count"].map((unit) => ({ label: unit, value: unit }))}
                        searchable
                        label="Preferred Unit"
                        loading={loading}
                    />

                    <DropdownField
                        value={localLabel?.food_group || ""}
                        setValue={(value: string) => setLocalLabel(prev => ({...prev, food_group: value}))}
                        options={Object.values(FoodGroup).map((foodGroup) => ({ label: foodGroup, value: foodGroup }))}
                        searchable
                        label="Food Group"
                        loading={loading}
                    />

                    <DropdownField
                        value={localLabel.default_storage_id || ""}
                        setValue={(value: string) => setLocalLabel(prev => ({...prev, default_storage_id: value}))}
                        options={Array.from(data.storages.values()).map((storage) => ({ value: storage.id, label: storage.name }))}
                        searchable
                        label="Default Storage"
                        loading={loading}
                    />

            </form>
        </Modal>
    );
};