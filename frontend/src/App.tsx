import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import { AuthProvider } from "@/context/auth/AuthContext";
import GuestRoute from "@/context/auth/GuestRoute";
import ProtectedRoute from "@/context/auth/ProtectedRoute";

import { StashProvider } from "@/context/stash/StashContext";
import StashRoute from "@/context/stash/StashRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// === Error Pages ===
import PageNotFound from "@/pages/error/PageNotFound";
import RequestDenied from "@/pages/error/RequestDenied";

// === Auth Pages ===
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// === Home Pages ===
import HomePage from "@/pages/HomePage";

// === Stash Pages ===
import StashPage from "@/pages/StashPage";


export default function App() {
	return (
		<div className="w-100 h-100">
			<BrowserRouter>
				<AuthProvider>
					<StashProvider>
						<Routes>
							<Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
							<Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

							{/* Protected Routes */}
							<Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

							{/* Protected Stash Routes */}
							<Route path="/stash" element={<ProtectedRoute><StashRoute><StashPage /></StashRoute></ProtectedRoute>} />

							{/* Error Pages */}
							<Route path="/403" element={<RequestDenied />} />
							<Route path="/404" element={<PageNotFound />} />
							<Route path="*" element={<Navigate to="/404" />} />
						</Routes>
					</StashProvider>
				</AuthProvider>
			</BrowserRouter>
			<ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable pauseOnFocusLoss />
		</div>
	);
}
