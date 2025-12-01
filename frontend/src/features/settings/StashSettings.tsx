import type { Stash } from "@/apis/schemas";
import { useEffect, useState } from "react";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { ButtonField, TextField } from "@/components/Fields";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { StashAPI } from "@/apis/containerApi";
import { getError } from "@/utils/utilities";

export function StashSettings() {

    const toast = useToast();
    const data = useStashData();
    const [localStash, setLocalStash] = useState<Stash>(data.stash);
    
    const [loading, setLoading] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setLocalStash(data.stash);
    }, [data.stash]);

    useEffect(() => {
        if (data.stash.name !== localStash?.name || data.stash.address !== localStash?.address) {
            setDirty(true);
        } else {
            setDirty(false);
        }
    }, [data.stash, localStash]);

    const saveStash = async () => {
        if (!localStash) return;

        if (localStash.name.trim().length === 0) {
            toast("danger", "Stash name cannot be empty.");
            return;
        }

        try {
            setLoading(true);
            const response: Stash = await StashAPI.update({
                id: data.stash.id,
                name: localStash.name,
                address: localStash.address,
            });
            toast("success", `Stash "${response.name}" updated successfully.`);
        } catch (error) {
            toast("danger", "Failed to update stash: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    const revertStash = () => {
        setLocalStash(data.stash);
    };

    return (
        <div>
            {data.loadingContext ? (
                <p className="text-text text-center w-full">Loading...</p>
            ) : !localStash ? (
                <p className="text-text text-center w-full">No stash found.</p>
            ) : (
                <div className="flex flex-col gap-3 p-2">
                    <TextField
                        label="Stash Name"
                        value={localStash.name}
                        setValue={(value) => {
                            setLocalStash({ ...localStash, name: value });
                        }}
                        placeholder={data.stash.name}
                        loading={data.loadingStash}
                    />

                    <TextField
                        label="Stash Address (Optional)"
                        value={localStash.address ?? ''}
                        setValue={(value) => {
                            setLocalStash({ ...localStash, address: value });
                        }}
                        placeholder={data.stash.address || 'No Address Set'}
                        loading={data.loadingStash}
                    />

                    <div className="flex flex-col gap-1 w-full">
                        <label className="font-medium">{"Join Code"}</label>
                        <div className="flex flex-row gap-2 w-full">
                            <TextField
                                value={localStash.join_code}
                                setValue={() => {}}
                                placeholder={data.stash.join_code}
                                loading={data.loadingStash}
                            />

                            <ButtonField
                                className="px-3 py-2 border-2 border-border bg-foreground text-text hover:bg-border/80"
                                onClick={() => {
                                    navigator.clipboard.writeText(localStash.join_code);
                                    toast("success", "Join code copied to clipboard.");
                                }}
                            >
                                Copy
                            </ButtonField>
                        </div>
                    
                        <hr className="border-border my-2" />

                        <div className="w-full flex flex-row justify-end gap-2">
                            <ButtonField
                                className="px-3 py-2 border-2 border-danger  text-danger hover:bg-danger hover:text-text disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-danger"
                                style="pill"
                                onClick={revertStash}
                                loading={loading}
                                disabled={!dirty}
                            >
                                Revert Changes
                            </ButtonField>

                            <ButtonField
                                className="px-3 py-2 border-2 border-success text-success hover:bg-success hover:text-text disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-success"
                                style="pill"
                                onClick={saveStash}
                                loading={loading}
                                disabled={!dirty}
                            >
                                Save Changes
                            </ButtonField>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};