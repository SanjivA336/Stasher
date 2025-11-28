import React, { useEffect, useState } from "react";
import type { User } from "@apis/schemas";
import { AuthContext } from "./AuthContextValue";
import { useToast } from "@contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";

import { auth } from "@/apis/firebase";
import { onAuthStateChanged, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { UserAPI } from "@/apis/identityApi";
import { useNavigate } from "react-router";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const toast = useToast();

    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setAuthReady(true);
            } else {
                try {
                    const response: User = await UserAPI.get(firebaseUser.uid);
                    setUser(response);
                } catch (error) {
                    setUser(null);
                    toast('danger', getError(error));
                } finally {
                    setAuthReady(true);
                }
            }
        });
        return () => unsubscribe();
    }, []);


    const login = async (email: string, password: string) => {
        if (!email.trim() || !password.trim()) {
            toast('danger', 'Please fill in all fields!');
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast('success', 'Login successful!');
            navigate("/");
        } catch (error) {
            try { await signOut(auth); } catch { /* Ignore */ }
            toast('danger', getError(error));
        } finally {
            setLoading(false);
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

        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            await UserAPI.create({
                id: cred.user.uid,
                username,
                email,
                password_current: password
            });

            toast('success', 'Registration successful!');
            navigate("/"); // Let the onAuthStateChanged callback handle user state
        } catch (error) {
            try { await signOut(auth); } catch { /* Ignore */ }
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    };


	const logout = async () => {
		if (!user) {
			toast('warning', 'No user is currently logged in');
			return;
		}
		setLoading(true);
		try {
			await signOut(auth);
			toast('success', 'Logout successful!');
            navigate("/auth");
		} catch (error: unknown) {
			toast('danger', getError(error));
		} finally {
			setLoading(false);
		}
	};

    if (!authReady || loading) return <div>Loading Auth...</div>;

    return (
        <AuthContext.Provider value={{ user, authLoading: loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
