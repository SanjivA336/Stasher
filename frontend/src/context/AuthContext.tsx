import { createContext, useContext, useEffect, useState } from "react";
import { authenticate, refresh } from "@/apis/auth_api";
import type { UserProtected } from "@/apis/_schemas";
import { toast } from "react-toastify/unstyled";

type AuthContextType = {
    user: UserProtected | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProtected | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            setLoading(true);
            try {
                const userData = await authenticate();
                setUser(userData);
            } catch (error) {
                console.error("Authentication failed. Attempting refresh:", error);
                try {
                    await refresh();
                    const userData = await authenticate();
                    setUser(userData);
                } catch (refreshError) {
                    console.error("Session refresh failed:", refreshError);
                    setUser(null);
                    toast.warning("Session expired. Please log in again.");
                }
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
