import { Navigate } from "react-router-dom";
import { useStash } from "./StashContext";
import Loading from "@/components/design/Loading";

export default function ProtectedRoute({ children }: { children: React.JSX.Element }) {
    const { loader, stashLoading } = useStash();

    return (
        <>
            {stashLoading ? (
                <Loading />
            ) : loader.is_loaded() ? (
                children
            ) : (
                <Navigate to="/" replace />
            )}
        </>
    );
}