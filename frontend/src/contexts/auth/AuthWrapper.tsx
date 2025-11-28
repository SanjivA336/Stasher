import { useAuth } from "./AuthContextValue";
import { Navigate } from "react-router-dom";

export function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, authLoading } = useAuth();

    if (authLoading) return <div>Loading Guest Route...</div>;

    if (user) return <Navigate to="/" replace />;

    return <>{children}</>;
}

export function UserRoute({ children }: { children: React.ReactNode }) {
    const { user, authLoading } = useAuth();

    if (authLoading) return <div>Loading User Route...</div>;

    if (!user) return <Navigate to="/auth" replace />;

    return <>{children}</>;
}
