import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthContext";
import Loading from "@/components/design/Loading";

export default function ProtectedRoute({ children }: { children: React.JSX.Element }) {
    const { user, authLoading } = useAuth();

    return (
        <>
            {authLoading ? (
                <Loading />
            ) : user ? (
                children
            ) : (
                <Navigate to="/login" replace />
            )}
        </>
    );
}