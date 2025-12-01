import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useAuth } from "@/contexts/auth/AuthContextValue";
import { useStash } from "@/contexts/stash/StashContextValue";
export const NAVBAR_HEIGHT = "60px";

type NavbarProps = {
    stashActive?: boolean;
};

const Navbar = ({ stashActive = true }: NavbarProps) => {
    const navigate = useNavigate();
    const toast = useToast();
    const { setActiveStash } = useStash();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        try {
            await logout();
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
                        className="text-text text-3xl font-bold my-auto pe-3" 
                        onClick={() => navigate("/storages")}
                    >
                        Stasher
                    </h1>

                    <button
                        className="whitespace-nowrap px-3 py-2 rounded-lg flex flex-row justify-between text-text bg-transparent hover:bg-accent hover:scale-105 transition-all duration-200"
                        onClick={() => { navigate("/stashes"); setActiveStash(null); }}
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
                    {stashActive && (
                        <>
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
                                onClick={() => { navigate("/settings"); }}
                                disabled={loading}
                            >
                                Settings
                            </button>
                        </>
                    )}

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
        </>
    );
};

export default Navbar;