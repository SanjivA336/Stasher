import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@/context/auth/AuthContext";
import { useStash } from "@/context/stash/StashContext";

import type { Storage } from "@/apis/_schemas";

import HomeLayout from "@/layouts/HomeLayout";
import Loading from "@/components/design/Loading";
import ButtonField from "@/components/fields/ButtonField";
import GenericList from "@/features/list/GenericList";
import RenderStorageTile from "@/features/list/RenderStorageTile";
import { StorageCreator } from "@/features/editors/StorageCreator";

export default function StoragesPage() {
    const { loader } = useStash();

    const [storages, setStorages] = useState<Storage[]>([]);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [showStorageCreator, setShowStorageCreator] = useState(false);
    const [showStorageEditor, setShowStorageEditor] = useState(false);
    
    async function fetchStorages(refresh=false) {
        setLoading(true);

        try {
            const response: Storage[] = await loader.fetch_storages(refresh);
            response.sort((a, b) => a.name.localeCompare(b.name));
            response.sort((a, b) => a.type.localeCompare(b.type));
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
    }, []);

    return (
        <HomeLayout>
                <div className="d-flex flex-column w-100 h-auto">
                    <div className="w-100 my-3 align-items-center justify-content-center align-content-center text-center">
                        <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                            <h1 className="text-primary m-0">{loader.stash?.name}</h1>
                        </div>
                        <div className="w-100 d-flex flex-row justify-content-center text-center m-1 gap-3">
                            <a href="/storages" className="text-muted text-decoration-none">Storages</a>
                            <a href="/labels" className="text-muted text-decoration-none">Labels</a>
                            <a href="/items" className="text-muted text-decoration-none">Items</a>
                        </div>

                    </div>
                    <div className="w-100 my-3 align-items-center justify-content-center align-content-center text-center">
                        <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                            <h3 className="text-primary m-0">Storages</h3>
                        </div>
                        <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                            <h6 className="text-light m-0">Manage your storages here.</h6>
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
                            <GenericList<Storage>
                                items={storages}
                                onRefresh={fetchStorages}
                                onClick={(storage) => {navigate("/storage/" + storage.id);}}
                                openCreator={() => setShowStorageCreator(true)}
                                searchBar
                                getItemName={(storage) => storage.name}
                                defaultLimit={8}
                                largeTiles="12"
                                mediumTiles="6"
                                smallTiles="4"
                                pagination
                                viewSelector
                                renderTile={RenderStorageTile}
                            />
                        )}
                    </div>

                    <StorageCreator showCreator={showStorageCreator} setShowCreator={setShowStorageCreator} refresh={fetchStorages} />
                    

                </div>            
        </HomeLayout>
    );
}
