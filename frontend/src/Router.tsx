import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@contexts/auth/AuthContext";
import { ToastProvider } from "@contexts/toasts/ToastContext";

import { UserRoute, GuestRoute} from "@/contexts/auth/RouteProtection";

import HomePage from "@pages/HomePage";
import AuthPage from "@pages/AuthPage";

export default function App() {
	return (
		<BrowserRouter>
			<ToastProvider>
				<AuthProvider>
					<Routes>
						<Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />

						{/* Protected Routes */}
						<Route path="/" element={<UserRoute><HomePage /></UserRoute>} />

						{/* Error Pages */}
						<Route path="/403" element={<div />} />
						<Route path="/404" element={<div />} />
						<Route path="*" element={<Navigate to="/404" />} />
					</Routes>
				</AuthProvider>
			</ToastProvider>
		</BrowserRouter>
	);
}