import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStash } from "./StashContextValue";
import NotFound from "@pages/404NotFound";

export function StashRoute({ children }: { children: React.ReactNode }) {
    const { stashId, loadingContext, loadingStash } = useStash();
    const navigate = useNavigate();

    useEffect(() => {
        if (loadingContext || loadingStash) return;

        if (!stashId) {
            navigate("/stashes", { replace: true });
        }
    }, [stashId, loadingContext, loadingStash]);

    if (loadingContext || loadingStash) return <div>Loading...</div>;
    if (stashId) return <>{children}</>;

    return <><NotFound /></>;
}