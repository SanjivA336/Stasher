import Navbar from "@components/Navbar";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useNavigate } from "react-router-dom";
import { type Storage } from "@apis/schemas";
import { TileViewer, StorageTileRenderer } from "@/features/TileViewer";

export default function StoragesPage() {

    const data = useStashData();
    const navigate = useNavigate();

    const openStorage = (storageId: string) => {
        navigate(`/storages/${storageId}`);
    }

    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text">
            <Navbar />


            <h2 className="text-xl font-semibold text-center">Choose or create a new storage.</h2>

            <div className="flex flex-row justify-center gap-3">
                <button
                    onClick={() => alert('Feature coming soon!')}
                    className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                >
                    Create a New Storage
                </button>
            </div>

            {data.stash && data.storages.size === 0 ? (
                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                    <p className="text-text text-lg">We couldn't find any storages for you.</p>
                    <p className="text-text">Why not create one?</p>
                </div>
            ) : (
                <div className="w-full max-w-4xl">
                    <TileViewer<Storage>
                        items={Array.from(data.storages.values())}
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
