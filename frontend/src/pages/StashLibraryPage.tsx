import { StashAPI } from "@/apis/containerApi";
import { UserAPI } from "@/apis/identityApi";
import type { Stash } from "@/apis/schemas";
import Spinner from "@/components/spinner";
import { useUser } from "@/contexts/auth/AuthContextValue";
import { useStashSettings } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StashLibraryPage() {

    const user = useUser();
    const { setStashId } = useStashSettings();
    const toast = useToast();
    const navigate = useNavigate();

    const [stashes, setStashes] = useState<Stash[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    const fetchStashes = async () => {
        setLoading(true);
        try {
            const response: Stash[] = await UserAPI.get_active_stashes(user.id);
            setStashes(response);
        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStashes();
    }, [user]);

    const selectStash = async (stashId: string) => {
        setLoading(true);
        try {
            const response: Stash = await StashAPI.get(stashId);
            setStashId(response.id);
            navigate(`/storages`);
        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text">
            <h1 className="text-4xl font-bold">Welcome back, <span className="text-accent">{user.username}</span>.</h1>

            <h2 className="text-xl font-semibold text-center">Choose, create, or join a Stash to continue.</h2>

            <div className="flex flex-row justify-center gap-3">
                <button
                    onClick={() => alert('Feature coming soon!')}
                    className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                >
                    Join an Existing Stash
                </button>

                <button
                    onClick={() => alert('Feature coming soon!')}
                    className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                >
                    Create a New Stash
                </button>
            </div>

            {loading ? (
                <Spinner size={50} />
            ) : stashes.length === 0 ? (
                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                    <p className="text-text text-lg">We couldn't find any stashes for you.</p>
                    <p className="text-text">Why not create or join one?</p>
                </div>
            ) : (
                <div className="w-full max-w-2xl">
                    {stashes.map((stash) => (
                        <div key={stash.id} onClick={selectStash.bind(null, stash.id)} className="p-4 rounded-2xl flex flex-row justify-between text-text-alt border-2 border-border bg-foreground hover:bg-accent hover:scale-105 hover:border-accent hover:text-text transition-all duration-200">
                            <div className="flex flex-col gap-1 justify-center">
                                <h3 className="text-xl text-text font-semibold">{stash.name}</h3>
                                <p className="text-sm font-normal">{stash.address}</p>
                            </div>
                            <div className="flex flex-col gap-1 justify-center">
                                <h3 className="text-sm font-thin">{stash.member_ids.length} Members</h3>
                                <p className="text-sm font-thin">Code: {stash.join_code}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
