import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthContext";
import React from "react";
import Loading from "../../components/design/Loading";

export default function GuestRoute({ children }: { children: React.JSX.Element }) {
    const { user, authLoading: loading } = useAuth();

    return (
        <>
            {loading ? (
                <Loading />
            ) : !user ? (
                children
            ) : (
                <Navigate to="/" replace />
            )}
        </>
    );
}
