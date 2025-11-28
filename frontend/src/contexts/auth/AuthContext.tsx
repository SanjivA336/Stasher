// AuthProvider.tsx
import React, { useEffect, useState } from "react";
import type { User } from "@apis/schemas";
import { AuthContext } from "./AuthContextValue";
import { useToast } from "@contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";

import { auth } from "@/apis/firebase";
import { onAuthStateChanged, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { UserAPI } from "@/apis/identityApi";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const toast = useToast();

    // onAuthStateChanged still used for catching external changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
            } else {
                try {
                    const response: User = await UserAPI.get(firebaseUser.uid);
                    setUser(response);
                } catch (error) {
                    setUser(null);
                    toast('danger', getError(error));
                }
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        if (!email.trim() || !password.trim()) {
            toast('danger', 'Please fill in all fields!');
            return;
        }
        setActionLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);

            // Ensure user data is fully loaded BEFORE returning
            const response: User = await UserAPI.get(cred.user.uid);
            setUser(response);

            toast('success', 'Login successful!');
        } catch (error) {
            try { await signOut(auth); } catch { /* ignore */ }
            toast('danger', getError(error));
        } finally {
            setActionLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string, confirm: string) => {
        if (password !== confirm) {
            toast('danger', 'Passwords do not match!');
            return;
        }
        if (!email.trim() || !username.trim() || !password.trim()) {
            toast('danger', 'Please fill in all fields!');
            return;
        }

        setActionLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            const response: User = await UserAPI.create({
                id: cred.user.uid,
                username,
                email,
                password_current: password
            });

            setUser(response);

            toast('success', 'Registration successful!');
        } catch (error) {
            try { await signOut(auth); } catch { /* ignore */ }
            toast('danger', getError(error));
        } finally {
            setActionLoading(false);
        }
    };

    const logout = async () => {
        if (!user) {
            toast('warning', 'No user is currently logged in');
            return;
        }
        setActionLoading(true);
        try {
            await signOut(auth);
            setUser(null); // immediately clear user state
            toast('success', 'Logout successful!');
        } catch (error: unknown) {
            toast('danger', getError(error));
        } finally {
            setActionLoading(false);
        }
    };

    if (authLoading) return <div>Loading Auth...</div>;

    return (
        <AuthContext.Provider value={{ user, authLoading, actionLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
