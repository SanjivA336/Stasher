import type { Stash } from "@/apis/_schemas";
import { StashAPI } from "@/apis/repo_api";
import { createContext, useContext, useState, useEffect } from "react";

import { useAuth } from "@/context/auth/AuthContext";

type StashContextType = {
    activeStash: Stash | null;
    setActiveStashId: (stashId: string | null) => void;

    clearStash: () => void;

    stashLoading: boolean;
};

const StashContext = createContext<StashContextType | undefined>(undefined);

const STASH_ID_LOCATION = "activeStashId";

export const StashProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, authLoading } = useAuth();

    const [stash, setStash] = useState<Stash | null>(null);

    const [loading, setLoading] = useState(true);

    // Load from localStorage on startup
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            clearStash();
            return;
        }

        const savedId = localStorage.getItem(STASH_ID_LOCATION);
        setActiveStash(savedId);

    }, [authLoading, user]);

    const setActiveStash = async (id: string | null) => {
        if (id) {
            setLoading(true);
            try {
                const response: Stash = await StashAPI.get(id);
                setStash(response);
                localStorage.setItem(STASH_ID_LOCATION, response.id);
            } catch (error) {
                console.error("Failed to fetch stash:", error);
                clearStash();
            } finally {
                setLoading(false);
            }
        } else {
            clearStash();
        }
    };

    // Clear storage + redirect to stashes menu
    const clearStash = () => {
        localStorage.removeItem(STASH_ID_LOCATION);
        setStash(null);
        setLoading(false);
    };

    return (
        <StashContext.Provider value={{ activeStash: stash, setActiveStashId: setActiveStash, clearStash, stashLoading: loading }}>
            {children}
        </StashContext.Provider>
    );
};

export const useStash = () => {
    const context = useContext(StashContext);
    if (!context) throw new Error("useStash must be used inside StashProvider");
    return context;
};
