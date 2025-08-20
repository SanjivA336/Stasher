import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function ProtectedRoute({ children }: { children: React.JSX.Element }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // Optional loading spinner

    return user ? (
        children
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
}
