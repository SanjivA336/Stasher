import { Navigate } from "react-router-dom";
import { useStash } from "./StashContext";
import Loading from "@/components/design/Loading";

export default function ProtectedRoute({ children }: { children: React.JSX.Element }) {
    const { activeStash, stashLoading } = useStash();

    return (
        <>
            {stashLoading ? (
                <Loading />
            ) : activeStash ? (
                children
            ) : (
                <Navigate to="/" replace />
            )}
        </>
    );
}