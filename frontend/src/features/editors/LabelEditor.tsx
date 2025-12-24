import { LabelAPI } from "@/apis/containerApi";
import { DEFAULT_LABEL } from "@/apis/default";
import { FoodGroup, type Label } from "@/apis/schemas";
import { ButtonField, DropdownField, TextField } from "@/components/Fields";
import Modal from "@/components/Modal";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";


type LabelEditorProps = {
    showEditor: boolean;
    setShowEditor: (show: boolean) => void;

    labelId: string;
};

export function LabelEditor({ showEditor, setShowEditor, labelId }: LabelEditorProps) {

    const [localLabel, setLocalLabel] = useState<Label>(DEFAULT_LABEL);

    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const data = useStashData();

    async function fetchLabel() {
        setLoading(true);
        try {
            const label: Label | undefined = data.labels.get(labelId);
            if (!label){
                throw new Error("Label not found in context");
            }
            setLocalLabel(label);
        } catch (error) {
            toast("danger", "Failed to load label: " + getError(error));
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (showEditor) {
            fetchLabel();
        }
    }, [showEditor]);

    const saveLabel = async () => {
        if (!localLabel || loading) return;

        setLoading(true);
        try {
            const response: Label = await LabelAPI.update(localLabel);
            toast("success", `Label "${response.name}" updated successfully.`);
        } catch (error) {
            toast("danger", "Failed to update label: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Edit Label - ${localLabel.name}`}
            show={showEditor}
            setShow={setShowEditor}
            onConfirm={saveLabel}
            onCancel={() => { setLocalLabel(data.labels.get(labelId) || DEFAULT_LABEL); }}
        >
            <form className="w-full h-full flex flex-col gap-2">
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
                        value={localLabel?.default_storage_id || ""}
                        setValue={(value: string) => setLocalLabel(prev => ({...prev, default_storage_id: value}))}
                        options={Array.from(data.storages.values()).map((storage) => ({ label: storage.name, value: storage.id }))}
                        searchable
                        label="Default Storage"
                        loading={loading}
                    />

                    <DropdownField
                        value={localLabel?.food_group || ""}
                        setValue={(value: string) => setLocalLabel(prev => ({...prev, food_group: value}))}
                        options={Object.entries(FoodGroup).map(([value, label]) => ({ label, value }))}

                        searchable
                        label="Food Group"
                        loading={loading}
                    />

                    <ButtonField
                        onClick={() => { alert("Feature coming soon!"); }}
                        loading={loading}
                        className="px-4 py-2 rounded-full border-danger border-2 bg-danger hover:bg-danger/80 hover:text-text transition-all duration-200"
                    >
                        Delete Label
                    </ButtonField>
            </form>
        </Modal>
    );
};