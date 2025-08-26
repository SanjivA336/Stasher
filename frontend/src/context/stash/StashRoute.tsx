import { Navigate } from "react-router-dom";
import { useStash } from "@/context/stash/StashContext";
import React from "react";
import Loading from "../../components/design/Loading";

export default function StashRoute({ children }: { children: React.JSX.Element }) {
    const { currentStashId, stashLoading: loading } = useStash();

    return (
        <>
            {loading ? (
                <Loading />
            ) : currentStashId ? (
                children
            ) : (
                <Navigate to="/stashes" replace />
            )}
        </>
    );
}
