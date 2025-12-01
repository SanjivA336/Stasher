import type { Stash } from "@/apis/schemas";
import { useEffect, useState } from "react";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { ButtonField, TextField } from "@/components/Fields";
import { useToast } from "@/contexts/toasts/ToastContextValue";

export function StashSettings() {

    const toast = useToast();
    const data = useStashData();
    const [localStash, setLocalStash] = useState<Stash>(data.stash);

    useEffect(() => {
        setLocalStash(data.stash);
    }, [data.stash]);

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
                    </div>
                </div>
            )}
        </div>
    );
};