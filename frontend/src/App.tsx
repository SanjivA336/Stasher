import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import GuestRoute from "@/context/auth/GuestRoute";
import ProtectedRoute from "@/context/auth/ProtectedRoute";
import { AuthProvider } from "@/context/auth/AuthContext";
import { StashProvider } from "./context/stash/StashContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// === Error Pages ===
import PageNotFound from "@/pages/error/PageNotFound";
import RequestDenied from "@/pages/error/RequestDenied";

// === Auth Pages ===
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// === Main Pages ===
import StashesPage from "@/pages/StashesPage";


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
							<Route path="/stashes" element={<ProtectedRoute><StashesPage /></ProtectedRoute>} />

							{/* Protected Stash Routes */}
							

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
