import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function GuestOnlyRoute({ children }: { children: React.JSX.Element }) {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? <Navigate to="/" replace /> : children;
}
