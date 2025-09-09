
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useStash } from "@/context/stash/StashContext";

import type { Storage } from "@/apis/_schemas";

import HomeLayout from "@/layouts/HomeLayout";
import Loading from "@/components/design/Loading";
import ButtonField from "@/components/fields/ButtonField";
import GenericList from "@/features/list/GenericList";
import RenderStorageTile from "@/features/list/RenderStorageTile";
import StorageCreator from "@/features/editors/StorageCreator";
import StashEditor from "@/features/editors/StashEditor";

export default function StashPage() {
    const { loader } = useStash();

    const [storages, setStorages] = useState<Storage[]>([]);
    const [selectedStorageIds, setSelectedStorageIds] = useState<string[]>([]);

    const [showStorageCreator, setShowStorageCreator] = useState(false);
    const [showStashEditor, setShowStashEditor] = useState(false);

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    if (!loader.is_loaded()) {
        throw new Error("Current stash not set. Possible failure in StashContext.");
    }

    async function fetchStorages() {
        setLoading(true);
        if (!loader.is_loaded()) {
            setStorages([]);
            setLoading(false);
            return;
        }

        try {
            const response: Storage[] = await loader.fetch_storages();
            response.sort((a, b) => a.updated_at > b.updated_at ? -1 : 1);
            setStorages(response);
        } catch (error) {
            toast.error("Failed to fetch storages: " + error);
            setStorages([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStorages();
    }, [loader]);

    return (
        <HomeLayout>
            <div className="d-flex flex-column w-100 h-auto">
                <div className="w-100 vh-25 align-items-center justify-content-center align-content-center text-center">
                    <div className="w-100 d-flex flex-row justify-content-center text-center m-1" onClick={() => setShowStashEditor(true)} style={{ cursor: "pointer" }}>
                        <h1 className="text-primary m-0">{loader.stash.name}</h1>
                    </div>
                    <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                        <h5 className="text-light m-0">Here you can manage your storage items.</h5>
                    </div>
                </div>
                <div className="w-100 container-md align-items-center text-center">
                    {loading ? (
                        <Loading />
                    ) : storages.length === 0 ? (
                        <div className="w-100 d-flex flex-column align-items-center justify-content-center text-center bg-darker border-darkish p-5 gap-2 rounded-4">
                            <h5 className="text-light m-0">No storages found.</h5>
                            <p className="text-muted m-0">Please create a storage to get started.</p>
                            <div className="col-12 col-sm-9 col-md-6 d-flex flex-row justify-content-center text-center gap-3 m-2">
                                <ButtonField
                                    onClick={() => {
                                        setShowStorageCreator(true);
                                    }}
                                    className="w-100"
                                >
                                    <p className="m-2 text-nowrap">Create a storage</p>
                                </ButtonField>
                            </div>
                        </div>
                    ) : (
                        <GenericList
                            items={storages}
                            onRefresh={fetchStorages}
                            onClick={(storage) => navigate("/storage/" + storage.id)}
                            openCreator={() => setShowStorageCreator(true)}
                            searchBar
                            getItemName={(storage) => storage.name}
                            defaultLimit={8}
                            pagination
                            selectedItemIds={selectedStorageIds}
                            setSelectedItemIds={setSelectedStorageIds}
                            renderTile={RenderStorageTile}
                        />
                    )}
                </div>

                <StorageCreator showCreator={showStorageCreator} setShowCreator={setShowStorageCreator} refresh={fetchStorages} />
                <StashEditor showEditor={showStashEditor} setShowEditor={setShowStashEditor} />

            </div>
        </HomeLayout>
    );
}
