
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

export default function StashesPage() {
    const { user } = useAuth();
    const { currentStashId, setCurrentStashId } = useStash();

    const [stashes, setStashes] = useState<Stash[]>([]);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [showStashCreator, setShowStashCreator] = useState(false);

    useEffect(() => {
        if (currentStashId) {
            navigate(`/stash/${currentStashId}`);
        }
    }, [currentStashId]);

    async function fetchStashes() {
        setLoading(true);
        if (!user) {
            setStashes([]);
            setLoading(false);
            return;
        }

        try {
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
            <div className="d-flex flex-column gap-5 w-100 h-auto">
                <div className="w-100 p-5 align-items-center text-center">
                    <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                        <h1 className="text-light m-0">Welcome to&nbsp;</h1>
                        <h1 className="text-primary m-0">Stasher.</h1>
                    </div>
                    <div className="w-100 d-flex flex-row justify-content-center text-center m-1">
                        <h5 className="text-light m-0">Never lose track of what's in your stash.</h5>
                    </div>
                </div>

                <h3 className="w-100 text-light text-center m-0">Your Stashes:</h3>

                {loading ? (
                    <Loading />
                ) : stashes.length === 0 ? (
                    <div className="w-100 p-5 align-items-center text-center">
                        <div className="w-100 d-flex flex-column align-items-center justify-content-center text-center bg-darker border-darkish p-5 gap-2 rounded-4">
                            <h5 className="text-light m-0">No active stashes found.</h5>
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
                    </div>
                ) : (
                    <div className="w-100 p-5 align-items-center text-center">
                        <h3 className="text-light m-0">Your active stashes:</h3>
                        <ul className="list-unstyled">
                            {stashes.map((stash) => (
                                <li key={stash.id}>
                                    <button
                                        className="btn btn-link text-light"
                                        onClick={() => {
                                            setCurrentStashId(stash.id);
                                            navigate(`/stash/${stash.id}`);
                                        }}
                                    >
                                        {stash.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <StashCreator showCreator={showStashCreator} setShowCreator={setShowStashCreator} />

            </div>
        </HomeLayout>
    );
}
