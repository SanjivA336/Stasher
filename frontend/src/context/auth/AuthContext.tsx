import { createContext, useContext, useEffect, useState } from "react";
import { authenticate, refresh } from "@/apis/auth_api";
import type { User } from "@/apis/_schemas";
import { toast } from "react-toastify/unstyled";

type AuthContextType = {
    user: User | null;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            setLoading(true);
            try {
                const userData = await authenticate();
                setUser(userData);
            } catch (error) {
                toast.warning("Session expired, attempting refresh.");
                try {
                    await refresh();
                    const userData = await authenticate();
                    setUser(userData);
                } catch (refreshError) {
                    setUser(null);
                    toast.error("Refresh failed. Please log in again.");
                }
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
