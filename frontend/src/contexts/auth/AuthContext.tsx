	import React, { useEffect, useState } from "react";
	import type { User } from "@apis/schemas";
	import { AuthContext } from "./AuthContextValue";
	import { AuthAPI } from "@apis/identityApi";
	import { useToast } from "@contexts/toasts/ToastContextValue";
	import { getError } from "@/utils/utilities";

	export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

		const [user, setUser] = useState<User | null>(null);
		const [loading, setLoading] = useState(false);

		const toast = useToast();

		const login = async (email: string, password: string) => {
			if (email.trim() === "" || password.trim() === "") {
				toast('danger', 'Please fill in all fields!');
				return;
			}

			setLoading(true);
			try {
				const currentUser: User = await AuthAPI.login(email, password);
				setUser(currentUser);
				toast('success', 'Login successful!');
			} catch (error: unknown) {
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
				toast('success', 'Registration successful!');
			} catch (error: unknown) {
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
			} catch {
				try {
					// Attempt Refresh
					await AuthAPI.refresh();
					const currentUser: User = await AuthAPI.authenticate();
					setUser(currentUser);
				} catch {
					// Authentication and Refresh Failed
					setUser(null);
				}
			} finally {
				setLoading(false);
			}
		};

		useEffect(() => {
			authenticate();
		}, []);

		return (
			<AuthContext.Provider value={{ user, authLoading: loading, login, register, logout }}>
				{children}
			</AuthContext.Provider>
		);
	};