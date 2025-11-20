import { useEffect } from "react";
import { useAuth } from "./AuthContextValue";
import { useNavigate } from "react-router-dom";
import { useToast } from "@contexts/toasts/ToastContextValue";
import AccessDenied from "@pages/403AccessDenied";

export function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;

        if (user) {
            navigate("/", { replace: true });
        }
    }, [user, authLoading]);

    if (authLoading) return <div>Loading...</div>;
    if (!user) return <>{children}</>;

    return <><AccessDenied /></>;
}

export function UserRoute({ children }: { children: React.ReactNode }) {
    const { user, authLoading } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast('warning', 'You need to be logged in to access this page.');
            navigate("/auth", { replace: true });
        }
    }, [user, authLoading]);

    if (authLoading) return <div>Loading...</div>;
    if (user) return <>{children}</>;

    return <><AccessDenied /></>;
}
