import { useAuth } from "@/contexts/auth/AuthContextValue";
import { Navigate } from "react-router-dom";


export function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    return user ? <Navigate to="/" replace /> : children;
}

export function UserRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/auth" replace />;
}
