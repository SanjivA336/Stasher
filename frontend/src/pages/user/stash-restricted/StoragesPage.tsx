import { StorageType, type Storage, type UISettings } from "@/apis/schemas";
import { Spinner } from "@/components/Fields";
import Navbar from "@/components/Navbar";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { StorageCreator } from "@/features/creators/StorageCreator";
import { getError } from "@/utils/utilities";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ReactGridLayout, useContainerWidth, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { StorageAPI } from "@/apis/containerApi";

export default function StoragesPage() {

    const data = useStashData();
    const toast = useToast();
    const navigate = useNavigate();
    const { width, containerRef, mounted } = useContainerWidth();

    const [dirtyUI, setDirtyUI] = useState(false);
    const [layout, setLayout] = useState<Layout>(
        Array.from(data.storages.values()).map((storage: Storage) => ({
            i: storage.id,
            x: storage.ui_settings?.x ?? 0,
            y: storage.ui_settings?.y ?? 0,
            w: storage.ui_settings?.w ?? 1,
            h: storage.ui_settings?.h ?? 1,
        }))
    );

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

    const onLayoutChange = (newLayout: Layout) => {
        setLayout(newLayout);
        setDirtyUI(true);
    };

    const saveLayout = async () => {
        if (!layout || loading) return;

        setLoading(true);
        try {
            const updatePromises = layout.map((layoutItem) => {
                const storage: Storage | undefined = data.storages.get(layoutItem.i);

                if (!storage)
                    return Promise.resolve();

                const updatedUiSettings: UISettings = {
                    x: layoutItem.x,
                    y: layoutItem.y,
                    w: layoutItem.w,
                    h: layoutItem.h,
                };
                storage.ui_settings = updatedUiSettings;
                return StorageAPI.update(storage);
            });

            await Promise.all(updatePromises);

            toast("success", `Layout updated successfully.`);
            setDirtyUI(false);
        } catch (error) {
            toast("danger", "Failed to update layout: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    const displayItems = (storage: Storage) => {
        const storageLayout = layout.find((item) => storage.id === item.i);

        if (storageLayout && storage.item_ids.length > 0) {
            const visibleCount = (storageLayout.h - 1) * 8 + 1;
            const visibleItems = storage.item_ids.slice(0, visibleCount);
            const remainingCount = storage.item_ids.length - visibleCount;

            return (
                <div className="flex flex-col gap-1 justify-center items-center overflow-y-hidden">
                        {visibleItems.map((itemId) => {
                            const item = data.items.get(itemId);
                            if (item)
                                return <li key={item.id} className="text-center text-sm text-text-alt">{item.name}</li>;
                            else
                                return <p key={itemId} className="text-center text-sm text-text-alt">Unknown Item</p>;
                        })}
                        {remainingCount > 0 && (
                            <p className="text-center text-sm text-text-alt">{remainingCount} more</p>
                        )}
                </div>
            );
        } else {
            return (
                <div className="flex flex-col gap-1 justify-center items-center text-text-alt">
                    <p className="text-sm text-center">Empty</p>
                </div>
            );
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
                <div className="w-full max-w-6xl" ref={containerRef}>
                    {mounted && (
                        <ReactGridLayout
                            layout={layout}
                            width={width}
                            gridConfig={{ cols: 6, rowHeight: 150 }}
                            resizeConfig={{ enabled: true, handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"] }}
                            onLayoutChange={onLayoutChange}
                            className=""
                        >
                            {Array.from(data.storages.values()).map((storage: Storage) => (
                                <div 
                                    key={storage.id} 
                                    style={{ transition: "border-color 0.2s" }}
                                    className={
                                        `p-4 rounded-2xl flex flex-col justify-start items-center border-2 border-border bg-foreground
                                        ${storage.type === StorageType.PANTRY ? 'hover:border-pantry' : ''} 
                                        ${storage.type === StorageType.FREEZER ? 'hover:border-freezer' : ''} 
                                        ${storage.type === StorageType.FRIDGE ? 'hover:border-fridge' : ''} 
                                        ${storage.type === StorageType.GARDEN ? 'hover:border-garden' : ''} 
                                        ${storage.type === StorageType.OTHER ? 'hover:border-other' : ''}`
                                    }>
                                    <div onClick={() => openStorage(storage.id)} className="flex flex-col gap-1 justify-between items-center w-full h-full cursor-pointer">
                                        <div className="flex flex-col gap-2 justify-start items-center w-full">
                                            <h3 className="text-xl font-semibold">{storage.name}</h3>
                                            <p className={
                                                    `text-sm
                                                    ${storage.type === StorageType.PANTRY ? 'bg-pantry py-0.5 px-1.5 rounded-md' : ''} 
                                                    ${storage.type === StorageType.FREEZER ? 'bg-freezer py-0.5 px-1.5 rounded-md' : ''} 
                                                    ${storage.type === StorageType.FRIDGE ? 'bg-fridge py-0.5 px-1.5 rounded-md' : ''} 
                                                    ${storage.type === StorageType.GARDEN ? 'bg-garden py-0.5 px-1.5 rounded-md' : ''} 
                                                    ${storage.type === StorageType.OTHER ? 'bg-other py-0.5 px-1.5 rounded-md' : ''}`
                                                }
                                            >{storage.type}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 justify-end items-center w-full">
                                            {displayItems(storage)}
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </ReactGridLayout>
                    )}
                </div>
            )}

            {dirtyUI && (
                <button
                    onClick={saveLayout}
                    className="fixed bottom-8 right-8 px-6 py-3 rounded-lg bg-accent text-text shadow-lg hover:scale-105 transition-all duration-200"
                >
                    Save Layout
                </button>
            )}

            <StorageCreator
                showCreator={showStorageCreator}
                setShowCreator={setShowStorageCreator}
            />

        </div>
    );
}

