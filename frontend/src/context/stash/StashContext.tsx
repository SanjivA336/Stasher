import type { Stash } from "@/apis/_schemas";
import { StashAPI } from "@/apis/repo_api";
import { createContext, useContext, useState, useEffect, act, useRef } from "react";

import { useAuth } from "@/context/auth/AuthContext";
import { StashLoader } from "@/apis/loader_api";

type StashContextType = {
    loader: StashLoader;
    setStashId: (stashId: string | null) => Promise<void>;

    stashLoading: boolean;
};

const StashContext = createContext<StashContextType | undefined>(undefined);

const STASH_ID_LOCATION = "activeStashId";

export const StashProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, authLoading } = useAuth();
    const loaderRef = useRef<StashLoader>(new StashLoader());
    const [loading, setLoading] = useState(true);

    // Load from localStorage on startup
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            clearStash();
            return;
        }

        const savedId = localStorage.getItem(STASH_ID_LOCATION);
        setStashId(savedId);
    }, [authLoading, user]);

    const setStashId = async (id: string | null) => {
        setLoading(true);
        if (id) {
            try {
                loaderRef.current.clear();
                await loaderRef.current.init(id, user!);
                localStorage.setItem(STASH_ID_LOCATION, id);
            } catch (error) {
                console.error("Failed to initialize stash loader:", error);
                clearStash();
            } finally {
                setLoading(false);
            }
        } else {
            clearStash();
        }
        setLoading(false);
    };

    // Clear storage + redirect to stashes menu
    const clearStash = () => {
        localStorage.removeItem(STASH_ID_LOCATION);
        loaderRef.current.clear();
        setLoading(false);
    };

    return (
        <StashContext.Provider value={{
            loader: loaderRef.current,
            setStashId,
            stashLoading: loading
        }}>
            {children}
        </StashContext.Provider>
    );
};

export const useStash = () => {
    const context = useContext(StashContext);
    if (!context) throw new Error("useStash must be used inside StashProvider");
    return context;
};
