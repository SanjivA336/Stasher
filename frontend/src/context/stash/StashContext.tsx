import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import type { User, Member, Stash } from "@/apis/_schemas";
import { CurrentAPI, StashAPI } from "@/apis/repo_api";

const CURRENT_STASH_KEY = "current_stash_id";

type StashContextType = {
    currentStash: Stash | null;
    setCurrentStashId: (stashId: string) => void;
};

const StashContext = createContext<StashContextType>({
    currentStash: null,
    setCurrentStashId: () => {},
});

export function StashProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [currentStash, setCurrentStash] = useState<Stash | null>(null);
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initializeStash() {
            if (!user) {
                setCurrentStash(null);
                setLoading(false);
                return;
            }

            // 1. Check local storage
            let stashId = localStorage.getItem(CURRENT_STASH_KEY);
            if (stashId) {
                try {
                    const stash: Stash = await StashAPI.get(stashId);
                    setCurrentStash(stash);
                    setLoading(false);
                    return;
                } catch (error) {
                    console.warn("Failed to fetch stash from local storage, will try to find another. Error: ", error);
                }
            }

            // 2. If none, default to first active member/stash
            const stashes: Stash[] = await CurrentAPI.get_active_stashes();
            if (stashes.length > 0) {
                setCurrentStash(stashes[0]);
                localStorage.setItem(CURRENT_STASH_KEY, stashes[0].id);
            }

            // 3. If still no stash (user has no members), set to null
            setCurrentStash(null);
            setLoading(false);
        }

        initializeStash();
    }, [user]);

    async function setCurrentStashId(stashId: string) {
        const stash: Stash = await StashAPI.get(stashId);
        localStorage.setItem(CURRENT_STASH_KEY, stashId);
        setCurrentStash(stash);
    }

    return (
        <StashContext.Provider value={{ currentStash, setCurrentStashId }}>
            {children}
        </StashContext.Provider>
    );
}

export function useStash() {
    return useContext(StashContext);
}
