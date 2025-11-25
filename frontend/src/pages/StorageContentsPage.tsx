import Navbar from "@components/Navbar";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "@/components/spinner";
import NotFound from "./404NotFound";

export default function StorageContentsPage() {

    const data = useStashData();
    const { storageId } = useParams<{ storageId: string }>();
    const navigate = useNavigate();

    if (!storageId || !data.storages.has(storageId)) {
        return <><NotFound/></>
    }


    const openItem = (itemId: string) => {
        navigate(`/items/${itemId}`);
    }

    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text">
            <Navbar />

            <h1 className="text-4xl font-bold">Current Storage: <span className="text-accent">{data.storages.get(storageId)!.name}</span></h1>

            <h2 className="text-xl font-semibold text-center">Choose or create a new item.</h2>

            <div className="flex flex-row justify-center gap-3">
                <button
                    onClick={() => alert('Feature coming soon!')}
                    className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                >
                    Add a New Item
                </button>
            </div>

            {data.loadingItems ? (
                <Spinner size={50} />
            ) : data.stash && data.storages.get(storageId) && data.storages.get(storageId)!.item_ids.length === 0 ? (
                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                    <p className="text-text text-lg">We couldn't find any items for this storage.</p>
                    <p className="text-text">Why not add some?</p>
                </div>
            ) : (
                <div className="w-full max-w-2xl">
                    {Array.from(data.items.values()).filter(item => item.storage_id === storageId).map((item) => (
                        <div key={item.id} onClick={openItem.bind(null, item.id)} className={`p-4 m-3 rounded-2xl flex flex-row justify-between text-text-alt border-2 border-border hover:border-accent bg-foreground hover:scale-105 hover:border-4 hover:text-text transition-all duration-200`}>
                            <div className="flex flex-col gap-1 justify-center">
                                <h3 className="text-xl text-text font-semibold">{item.name}</h3>
                                <p className="text-sm font-normal">{item.current_quantity} / {item.total_quantity} ({item.preferred_unit ?? "units"})</p>
                                
                            </div>
                            <div className="flex flex-col max-w-3xs gap-1 justify-center">
                                { item.cost && <p className="text-sm font-thin">${item.cost ?? 0.00}</p> }
                                { item.expiry_date && <p className="text-sm font-thin text-end">{item.expiry_date.toISOString()}</p> }
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
