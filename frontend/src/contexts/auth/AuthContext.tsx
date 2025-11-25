import React, { useEffect, useState } from "react";
import type { User } from "@apis/schemas";
import { AuthContext } from "./AuthContextValue";
import { AuthAPI } from "@apis/identityApi";
import { useToast } from "@contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";

import { auth } from "@/apis/firebase";
import { onAuthStateChanged, signInWithCustomToken, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

	const [user, setUser] = useState<User | null>(null);
	const [authReady, setAuthReady] = useState(false);
	const [loading, setLoading] = useState(false);

	const toast = useToast();

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (firebaseUser) => {
			console.log("Firebase User", firebaseUser);
			setAuthReady(true);
		});
		return unsub;
	}, []);

	const login = async (email: string, password: string) => {
		if (email.trim() === "" || password.trim() === "") {
			toast('danger', 'Please fill in all fields!');
			return;
		}

		setLoading(true);
		try {
			const currentUser: User = await AuthAPI.login(email, password);
			setUser(currentUser);

			const firebaseToken = await AuthAPI.firebase_token();
			await signInWithCustomToken(auth, firebaseToken);

			toast('success', 'Login successful!');
		} catch (error) {
			setUser(null);
			try {
				await signOut(auth);
			} catch { /* Ignore Firebase sign out errors */ }

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

		if (email.trim() === "" || username.trim() === "" || password.trim() === "") {
			toast('danger', 'Please fill in all fields!');
			return;
		}

		setLoading(true);
		try {
			const currentUser: User = await AuthAPI.register(username, email, password);
			setUser(currentUser);

			const firebaseToken = await AuthAPI.firebase_token();
			await signInWithCustomToken(auth, firebaseToken);

			toast('success', 'Registration successful!');
		} catch (error) {
			setUser(null);
			try {
				await signOut(auth);
			} catch { /* Ignore Firebase sign out errors */ }
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
			await AuthAPI.logout();
			setUser(null);

			await signOut(auth);

			toast('success', 'Logout successful!');
		} catch (error: unknown) {
			toast('danger', getError(error));
		} finally {
			setLoading(false);
		}
	};

	const authenticate = async () => {
		setLoading(true);
		try {
			// Normal Authentication
			const currentUser: User = await AuthAPI.authenticate();
			setUser(currentUser);

			const firebaseToken = await AuthAPI.firebase_token();
			await signInWithCustomToken(auth, firebaseToken);
		} catch {
			try {
				// Attempt Refresh
				await AuthAPI.refresh();

				const currentUser: User = await AuthAPI.authenticate();
				setUser(currentUser);

				const firebaseToken = await AuthAPI.firebase_token();
				await signInWithCustomToken(auth, firebaseToken);
			} catch {
				// Authentication and Refresh Failed
				setUser(null);
				try {
					await signOut(auth);
				} catch { /* Ignore Firebase sign out errors */ }
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		authenticate();
	}, []);

	if (!authReady) {
		return null;
	}

	return (
		<AuthContext.Provider value={{ user, authLoading: loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
};