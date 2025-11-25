import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@apis/identityApi";
import { useState } from "react";
import { useStashData } from "@/contexts/stash/StashContextValue";

import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import StashEditor from "@/features/StashEditor";
export const NAVBAR_HEIGHT = "60px";

const Navbar = () => {
    const navigate = useNavigate();
    const ctx = useStashData();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const [showStashEditor, setShowStashEditor] = useState(false);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        try {
            await AuthAPI.logout();
            window.location.reload();
        } catch (error) {
            toast('danger', getError(error));
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={`w-full p-4 bg-foreground flex justify-between items-center fixed top-0`} style={{ height: NAVBAR_HEIGHT }}>
                {/* Navbar Start */}
                <div className="flex gap-2 items-start justify-center">
                    <h1 
                        className="text-text text-3xl font-bold my-auto" 
                        onClick={() => navigate("/storages")}
                    >
                        Stasher
                    </h1>

                    <button
                        className="whitespace-nowrap px-3 py-2 rounded-lg flex flex-row justify-between text-text bg-transparent hover:bg-accent hover:scale-105 transition-all duration-200"
                        onClick={() => { ctx.setActiveStash(null); navigate("/stashes"); }}
                        disabled={loading}
                    >
                        My Stashes
                    </button>

                    <button
                        className="whitespace-nowrap px-3 py-2 rounded-lg flex flex-row justify-between text-text bg-transparent hover:bg-accent hover:scale-105 transition-all duration-200"
                        onClick={() => { navigate("/profile"); }}
                        disabled={loading}
                    >
                        Profile
                    </button>
                </div>

                {/* Navbar End */}
                <div className="flex gap-2 items-end justify-center">
                    <button
                        className="whitespace-nowrap px-3 py-2 rounded-lg flex flex-row justify-between text-text bg-transparent hover:bg-border hover:scale-105 hover:text-text transition-all duration-200"
                        onClick={() => { navigate("/storages"); }}
                        disabled={loading}
                    >
                        Storages
                    </button>

                    <button
                        className="whitespace-nowrap px-3 py-2 rounded-lg flex flex-row justify-between text-text bg-transparent hover:bg-border hover:scale-105 hover:text-text transition-all duration-200"
                        onClick={() => { navigate("/labels"); }}
                        disabled={loading}
                    >
                        Labels
                    </button>

                    <button
                        className="whitespace-nowrap px-3 py-2 rounded-lg flex flex-row justify-between text-text bg-transparent hover:bg-border hover:scale-105 hover:text-text transition-all duration-200"
                        onClick={() => { navigate("/history"); }}
                        disabled={loading}
                    >
                        History
                    </button>

                    <button
                        className="whitespace-nowrap px-3 py-2 rounded-lg flex flex-row justify-between text-text bg-transparent hover:bg-border hover:scale-105 hover:text-text transition-all duration-200"
                        onClick={() => { setShowStashEditor(true); }}
                        disabled={loading}
                    >
                        Settings
                    </button>

                    <button
                        className="whitespace-nowrap px-3 py-2 rounded-lg flex flex-row justify-between text-danger border-2 border-danger/50 bg-transparent hover:bg-danger hover:scale-105 hover:border-danger hover:text-text transition-all duration-200"
                        onClick={handleLogout}
                        disabled={loading}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Spacer to prevent content behind navbar */}
            <div style={{ height: NAVBAR_HEIGHT }}></div>

            <StashEditor
                show={showStashEditor}
                setShow={setShowStashEditor}
            />
        </>
    );
};

export default Navbar;