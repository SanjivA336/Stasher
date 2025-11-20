import Navbar from "@components/Navbar";
import { useStash } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Stash, type Storage } from "@apis/schemas";
import { StashAPI } from "@/apis/containerApi";
import { getError } from "@/utils/utilities";
import Spinner from "@/components/spinner";
import { StorageTileRenderer, TileViewer } from "@/features/TileViewer";

export default function StoragesPage() {

    const { stashId } = useStash();
    const toast = useToast();
    const navigate = useNavigate();

    const [stash, setStash] = useState<Stash | null>(null);
    const [storages, setStorages] = useState<Storage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const stashResponse: Stash = await StashAPI.get(stashId)
            setStash(stashResponse);

            const storagesResponse: Storage[] = await StashAPI.get_storages(stashId);
            storagesResponse.sort((a, b) => a.type.localeCompare(b.type));
            storagesResponse.sort((a, b) => a.updated_at < b.updated_at ? 1 : -1);
            setStorages(storagesResponse);

        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [stashId]);

    const openStorage = (storageId: string) => {
        navigate(`/storages/${storageId}`);
    }

    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text">
            <Navbar />

            <h1 className="text-4xl font-bold">Current Stash: <span className="text-accent">{stash?.name}</span></h1>

            <h2 className="text-xl font-semibold text-center">Choose or create a new storage.</h2>

            <div className="flex flex-row justify-center gap-3">
                <button
                    onClick={() => alert('Feature coming soon!')}
                    className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                >
                    Create a New Storage
                </button>
            </div>

            {loading ? (
                <Spinner size={50} />
            ) : stash && storages.length === 0 ? (
                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                    <p className="text-text text-lg">We couldn't find any storages for you.</p>
                    <p className="text-text">Why not create one?</p>
                </div>
            ) : (
                <div className="w-full max-w-4xl">
                    <TileViewer<Storage>
                        items={storages}
                        renderTile={StorageTileRenderer}
                        style="list"
                        onClick={openStorage}
                        className="gap-2"       
                    />
                </div>
            )}
        </div>
    );
}
