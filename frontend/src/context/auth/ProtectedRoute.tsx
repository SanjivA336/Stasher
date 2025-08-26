import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthContext";
import React from "react";
import Loading from "../../components/design/Loading";

export default function ProtectedRoute({ children }: { children: React.JSX.Element }) {
    const { user, authLoading } = useAuth();
    const location = useLocation();

    return (
        <>
            {authLoading ? (
                <Loading />
            ) : user ? (
                children
            ) : (
                <Navigate to="/login" state={{ from: location }} replace />
            )}
        </>
    );
}