import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStashSettings } from "./StashContextValue";
import NotFound from "@pages/404NotFound";

export function StashRoute({ children }: { children: React.ReactNode }) {
    const { stashId, stashLoading } = useStashSettings();
    const navigate = useNavigate();

    useEffect(() => {
        if (stashLoading) return;

        if (!stashId) {
            navigate("/stashes", { replace: true });
        }
    }, [stashId, stashLoading]);

    if (stashLoading) return <div>Loading...</div>;
    if (stashId) return <>{children}</>;

    return <><NotFound /></>;
}