import { useEffect, useState } from "react";

import type { Stash } from "@/apis/_schemas";
import { StashAPI } from "@/apis/repo_api";

import ButtonField from "@/components/fields/ButtonField";
import ShortTextField from "@/components/fields/ShortTextField";
import Modal from "@/components/design/Modal";

import Loading from "@/components/design/Loading";
import { toast } from "react-toastify";
import { useStash } from "@/context/stash/StashContext";

type StashCreatorProps = {
    showCreator: boolean;
    setShowCreator: (show: boolean) => void;
    refresh?: () => void;
}

export function StashCreator({ showCreator, setShowCreator, refresh }: StashCreatorProps) {
    const { setStashId } = useStash();

    const [stash, setStash] = useState<Stash | null>(null);

    const [loading, setLoading] = useState<boolean>(true);


    const fetchStashTemplate = async () => {
        setLoading(true);
        try{
            const response: Stash = await StashAPI.get_template();
            setStash(response);
        } catch (error) {
            toast.error("Failed to fetch stash template: " + error);
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
            const response: Stash = await StashAPI.create({
                name: stash.name,
                address: stash.address,
            });
            setStashId(response.id);
            setShowCreator(false);
            toast.success("Stash created successfully!");
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
        if (showCreator) {
            fetchStashTemplate();
        } else {
            setStash(null);
        }
    }, [showCreator]);

    return (
        <Modal
            title="Create a New Stash"
            showModal={showCreator}
            setShowModal={(show) => setShowCreator(show)}
            width={6}   
        >
            {loading ? (
                <Loading />
            ) : stash ? (
                <div>
                    <form className="d-flex flex-column gap-3">
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

                        <div className="d-flex flex-row gap-3 my-2">
                            <ButtonField
                                onClick={() => setShowCreator(false)}
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
                        onClick={fetchStashTemplate}
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

export default StashCreator;
