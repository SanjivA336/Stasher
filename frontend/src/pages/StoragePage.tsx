import { useNavigate, useParams } from "react-router-dom";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useStash } from "@/context/stash/StashContext";

import type { Storage, Label, Item } from "@/apis/_schemas";

import HomeLayout from "@/layouts/HomeLayout";
import Loading from "@/components/design/Loading";
import ButtonField from "@/components/fields/ButtonField";
import GenericList from "@/features/list/GenericList";
import RenderItemTile from "@/features/list/RenderItemTile";
//import ItemCreator from "@/features/editors/ItemCreator";

export default function StoragePage() {
    const { loader } = useStash();
    const { storageId } = useParams<{ storageId: string }>();

    const [activeStorage, setActiveStorage] = useState<Storage | null>(null);
    const [items, setItems] = useState<Item[]>([]);

    const [showItemCreator, setShowItemCreator] = useState(false);

    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();

    if (!loader.is_loaded()) {
        throw new Error("Current stash not set. Possible failure in StashContext.");
    }

    const fetchStorage = async (id: string) => {
        setLoading(true);
        try {
            const storage: Storage = await loader.fetch_storage(id);
            setActiveStorage(storage);
        } catch (error) {
            toast.error("Failed to fetch storage: " + error);
            setActiveStorage(null);
            return;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storageId) {
            fetchStorage(storageId);
        } else {
            setActiveStorage(null);
            setLoading(false);
        }
    }, [storageId]);

    const fetchItems = async () => {
        if (!activeStorage) return;

        setLoading(true);
        try {
            const response: Item[] = await loader.fetch_items_by_storage(activeStorage.id);
            response.sort((a, b) => a.updated_at > b.updated_at ? -1 : 1);
            setItems(response);
        } catch (error) {
            toast.error("Failed to fetch items: " + error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeStorage]);

    return (
        <HomeLayout>
            <div className="d-flex flex-column w-100 h-auto">
                <div className="w-100 vh-25 align-items-center justify-content-center align-content-center text-center">
                    <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                        <h1 className="text-primary m-0">{activeStorage?.name || "My Storage"}</h1>
                    </div>
                    <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                        <h5 className="text-light m-0">Here you can manage your items in this storage.</h5>
                    </div>
                </div>
                <div className="w-100 container-md align-items-center text-center">
                    {loading ? (
                        <Loading />
                    ) : items.length === 0 ? (
                        <div className="w-100 d-flex flex-column align-items-center justify-content-center text-center bg-darker border-darkish p-5 gap-2 rounded-4">
                            <h5 className="text-light m-0">No items found.</h5>
                            <p className="text-muted m-0">Please add items to this storage to get started.</p>
                            <div className="col-12 col-sm-9 col-md-6 d-flex flex-row justify-content-center text-center gap-3 m-2">
                                <ButtonField
                                    onClick={() => {
                                        setShowItemCreator(true);
                                    }}
                                    className="w-100"
                                >
                                    <p className="m-2 text-nowrap">Create an item</p>
                                </ButtonField>
                            </div>
                        </div>
                    ) : (
                        <GenericList
                            items={items}
                            onRefresh={fetchItems}
                            onClick={(item) => navigate("/storage/" + item.id)}
                            openCreator={() => setShowItemCreator(true)}
                            searchBar
                            getItemName={(item) => item.name}
                            defaultLimit={8}
                            pagination
                            renderTile={RenderItemTile}
                        />
                    )}
                </div>

                {/* <ItemCreator
                    showCreator={showItemCreator}
                    setShowCreator={setShowItemCreator}
                    refresh={fetchItems}
                    currentStorageId={activeStorage?.id}
                /> */}

            </div>
        </HomeLayout>
    );
}
