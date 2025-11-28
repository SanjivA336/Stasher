import { createContext, useContext } from "react";
import type { User } from "@/apis/schemas";

export type AuthContextType = {
	user: User | null;
    authLoading: boolean;
    actionLoading: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, confirm: string) => Promise<void>;
    logout: () => Promise<void>;

};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};

export const useUser = (): User => {
    const context = useAuth();

    if (!context.user) {
        throw new Error("No user is currently logged in");
    }

    return context.user;
};