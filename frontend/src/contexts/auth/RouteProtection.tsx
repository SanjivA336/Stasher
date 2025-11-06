import { useEffect } from "react";
import { useAuth } from "@/contexts/auth/AuthContextValue";
import { useNavigate } from "react-router-dom";
import { useToast } from "../toasts/ToastContextValue";

export function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, authLoading } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        if (user && !authLoading) {
            toast('info', 'You are already logged in. Redirecting to home...');
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    if (authLoading) return <div>Loading...</div>;
    if (user) return null;

    return <>{children}</>;
}

export function UserRoute({ children }: { children: React.ReactNode }) {
    const { user, authLoading } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        if (!user && !authLoading) {
            toast('warning', 'You need to be logged in to access this page. Redirecting to login...');
            navigate("/auth", { replace: true });
        }
    }, [user, navigate]);

    if (authLoading) return <div>Loading...</div>;
    if (!user) return null;

    return <>{children}</>;
}
