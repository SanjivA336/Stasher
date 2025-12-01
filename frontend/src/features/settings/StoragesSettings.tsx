import type { Storage } from "@/apis/schemas";
import { TileViewer } from "../TileViewer";
import { useEffect, useState } from "react";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { ButtonField, SearchField } from "@/components/Fields";
import { StorageEditor } from "../editors/StorageEditor";
import { StorageCreator } from "../creators/StorageCreator";

export function StoragesSettings() {

    const data = useStashData();
    const [localStorages, setLocalStorages] = useState<Storage[]>(Array.from(data.storages.values()));

    const [filteredStorages, setFilteredStorages] = useState<Storage[]>(localStorages);

    const [showEditor, setShowEditor] = useState(false);
    const [showCreator, setShowCreator] = useState<boolean>(false);
    const [editingStorageId, setEditingStorageId] = useState<string>("");
    
    useEffect(() => {
        setLocalStorages(Array.from(data.storages.values()));
        setFilteredStorages(Array.from(data.storages.values()));
    }, [data.storages]);

    return (
        <div>
            {data.loadingContext ? (
                <p className="text-text text-center w-full">Loading...</p>
            ) : (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex flex-row justify-center items-center gap-2">
                        <SearchField<Storage>
                            arr={localStorages}
                            setFilteredArr={setFilteredStorages}
                            getName={(storage) => storage.name}
                            placeholder="Search storages by name..."
                            loading={data.loadingStorages}
                        />

                        <ButtonField
                            onClick={() => setShowCreator(true)}
                            className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                        >
                            Create
                        </ButtonField>
                    </div>

                    <TileViewer<Storage>
                        items={filteredStorages}
                        pageLimit={5}
                        renderTile={({ item }) => {
                            return (
                                <div key={item.id} className="p-4 rounded-2xl flex flex-row justify-between items-center text-text-alt border-2 border-border bg-foreground hover:bg-accent/20 hover:border-accent hover:text-text transition-all duration-200">
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h3 className="text-xl text-text font-semibold flex flex-row gap-2 items-center">{item.name} <span className="text-xs border-2 border-accent text-accent px-1.5 py-1 rounded-md">{item.type}</span></h3>
                                        <p className="text-sm font-normal">Joined on {new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h3 className="text-sm font-thin">{item.item_ids.length} Items</h3>
                                    </div>
                                    <div className="flex flex-row gap-2 justify-center items-center">
                                        <ButtonField
                                            onClick={() => {
                                                setEditingStorageId(item.id);
                                                setShowEditor(true);
                                            }}
                                            className="px-3 py-2 border-2 border-border text-text hover:bg-accent/20 hover:border-accent/80 hover:text-text"
                                            loading={data.loadingStorages}
                                        >
                                            Edit
                                        </ButtonField>
                                    </div>
                                </div>
                            );
                        }}
                    />

                    <StorageEditor
                        showEditor={showEditor}
                        setShowEditor={setShowEditor}
                        storageId={editingStorageId}
                    />

                    <StorageCreator
                        showCreator={showCreator}
                        setShowCreator={setShowCreator}
                    />
                </div>

            )}
        </div>
    );
};