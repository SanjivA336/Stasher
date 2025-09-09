
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@/context/auth/AuthContext";
import { useStash } from "@/context/stash/StashContext";

import type { Stash } from "@/apis/_schemas";
import { CurrentAPI } from "@/apis/repo_api";

import HomeLayout from "@/layouts/HomeLayout";
import Loading from "@/components/design/Loading";
import ButtonField from "@/components/fields/ButtonField";
import StashCreator from "@/features/editors/StashCreator";
import GenericList from "@/features/list/GenericList";
import RenderStashTile from "@/features/list/RenderStashTile";

export default function HomePage() {
    const { user } = useAuth();
    const { loader, setStashId, stashLoading } = useStash();

    const [stashes, setStashes] = useState<Stash[]>([]);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const [showStashCreator, setShowStashCreator] = useState(false);

    useEffect(() => {
        if (stashLoading) return;

        if (loader.is_loaded()) {
            toast.info("Redirecting to your active stash: " + loader.stash.id);
            navigate("/stash", { replace: true });
        }
    }, [stashLoading]);

    async function fetchStashes() {
        setLoading(true);

        try {
            if (!user) {
                setStashes([]);
                setLoading(false);
                throw new Error("User not logged in.");
            }
            const response: Stash[] = await CurrentAPI.get_active_stashes();
            setStashes(response);
        } catch (error) {
            toast.error("Failed to fetch stashes: " + error);
            setStashes([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStashes();
    }, [user]);

    return (
        <HomeLayout>
                <div className="d-flex flex-column w-100 h-auto">
                    <div className="w-100 vh-25 align-items-center justify-content-center align-content-center text-center">
                        <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                            <h1 className="text-light m-0">Welcome to <span className="text-primary" style={{fontFamily: "Cal Sans"}}>Stasher.</span></h1>
                        </div>
                        <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                            <h5 className="text-light m-0">Never lose track of what's in your stash.</h5>
                        </div>
                    </div>

                    <h3 className="w-100 text-light text-center mb-3">Your Stashes:</h3>
                    <div className="w-100 container-md align-items-center text-center">
                        {loading ? (
                            <Loading />
                        ) : stashes.length === 0 ? (
                            <div className="w-100 d-flex flex-column align-items-center justify-content-center text-center bg-darker border-darkish p-5 gap-2 rounded-4">
                                <h5 className="text-light m-0">No stashes found.</h5>
                                <p className="text-muted m-0">Please create a stash to get started.</p>
                                <div className="col-12 col-sm-9 col-md-6 d-flex flex-row justify-content-center text-center gap-3 m-2">
                                    <ButtonField
                                        onClick={() => {
                                            setShowStashCreator(true);
                                        }}
                                        className="w-100"
                                    >
                                        <p className="m-2 text-nowrap">Create a stash</p>
                                    </ButtonField>

                                    <ButtonField
                                        onClick={() => {
                                            navigate("/join-stash");
                                        }}
                                        className="w-100"
                                    >
                                        <p className="m-2 text-nowrap">Join a stash</p>
                                    </ButtonField>
                                </div>
                            </div>
                        ) : (
                            <GenericList<Stash>
                                items={stashes}
                                onRefresh={fetchStashes}
                                onClick={(stash) => {setStashId(stash.id); navigate("/stash");}}
                                openCreator={() => setShowStashCreator(true)}
                                searchBar
                                getItemName={(stash) => stash.name}
                                defaultLimit={8}
                                pagination
                                renderTile={RenderStashTile}
                            />
                        )}
                    </div>

                    <StashCreator showCreator={showStashCreator} setShowCreator={setShowStashCreator} refresh={fetchStashes} />

                </div>            
        </HomeLayout>
    );
}
