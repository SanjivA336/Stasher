import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import GuestOnlyRoute from "@/components/GuestOnlyRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// === Error Pages ===
import PageNotFound from "@/pages/error/PageNotFound";
import RequestDenied from "@/pages/error/RequestDenied";

// === Auth Pages ===
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// === Main Pages ===
import HomePage from "@/pages/HomePage";

export default function App() {
	return (
		<div className="w-100 h-100">
			<BrowserRouter>
				<AuthProvider>
					<Routes>
						<Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
						<Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />

						{/* Protected Routes */}

						<Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

						<Route path="/403" element={<RequestDenied />} />
						<Route path="/404" element={<PageNotFound />} />
						<Route path="*" element={<Navigate to="/404" />} />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
			<ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable pauseOnFocusLoss />
		</div>
	);
}
