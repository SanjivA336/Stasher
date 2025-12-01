import type { Storage } from "@/apis/schemas";
import { Spinner } from "@/components/Fields";
import Navbar from "@/components/Navbar";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { StorageCreator } from "@/features/creators/StorageCreator";
import { getError } from "@/utils/utilities";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StoragesPage() {

    const data = useStashData();
    const toast = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);

    const [showStorageCreator, setShowStorageCreator] = useState<boolean>(false);

    const openStorage = async (storageId: string) => {
        setLoading(true);
        try {
            navigate(`/storages/${storageId}`);
        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text">
            <Navbar />
            <h1 className="text-4xl font-bold"><span className="text-accent">{data.stash.name}</span> - Storages</h1>

            <h2 className="text-xl font-semibold text-center">You can manage your storages here.</h2>

            <div className="flex flex-row justify-center gap-3">
                <button
                    onClick={() => setShowStorageCreator(true)}
                    className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                >
                    Create a New Storage
                </button>
            </div>

            {loading ? (
                <Spinner />
            ) : data.storages.size === 0 ? (
                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                    <p className="text-text text-lg">We couldn't find any storages for you.</p>
                    <p className="text-text">Why not create one?</p>
                </div>
            ) : (
                <div className="w-full max-w-2xl gap-2 flex flex-col">
                    {Array.from(data.storages.values()).map((storage: Storage) => (
                        <div
                            key={storage.id}
                            onClick={() => openStorage(storage.id)}
                            className="p-4 rounded-2xl flex flex-row justify-between text-text-alt border-2 border-border bg-foreground hover:bg-accent hover:scale-105 hover:border-accent hover:text-text transition-all duration-200"
                        >
                            <div className="flex flex-col gap-1 justify-center">
                                <h3 className="text-xl text-text font-semibold">{storage.name}</h3>
                                <p className="text-sm font-normal">{storage.type}</p>
                            </div>
                            <div className="flex flex-col gap-1 justify-center">
                                <h3 className="text-sm font-thin">{storage.item_ids.length} Items</h3>
                            </div>
                        </div>
                    ))}
                </div>

            )}

            <StorageCreator
                showCreator={showStorageCreator}
                setShowCreator={setShowStorageCreator}
            />

        </div>
    );
}
