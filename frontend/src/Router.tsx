import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ToastProvider } from "@contexts/toasts/ToastContext";
import { AuthProvider } from "@contexts/auth/AuthContext";
import { StashProvider } from "@contexts/stash/StashContext";


import { UserRoute, GuestRoute} from "@contexts/auth/AuthWrapper";
import { StashRoute } from "@contexts/stash/StashWrapper";

import AccessDenied from "@pages/403AccessDenied";
import NotFound from "@pages/404NotFound";

import AuthPage from "@pages/AuthPage";
import StashLibraryPage from "@pages/StashLibraryPage";
import StoragesPage from "@pages/StoragesPage";
import StorageContentsPage from "./pages/StorageContentsPage";

export default function App() {
	return (
		<BrowserRouter>
			<ToastProvider>
				<AuthProvider>
					<StashProvider>
						<Routes>
							<Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />

							{/* Protected Routes */}
							<Route path="/stashes" element={<UserRoute><StashLibraryPage /></UserRoute>} />
							<Route path="/" element={<Navigate to="/storages" />} />

							{/* Stash Required Pages - Storages */}
							<Route path="/storages" element={<UserRoute><StashRoute><StoragesPage /></StashRoute></UserRoute>} />
							<Route path="/storages/:storageId" element={<UserRoute><StashRoute><StorageContentsPage/></StashRoute></UserRoute>} />

							{/* Error Pages */}
							<Route path="/403" element={<AccessDenied />} />
							<Route path="/404" element={<NotFound />} />
							<Route path="*" element={<Navigate to="/404" replace={false} />} />
						</Routes>
					</StashProvider>
				</AuthProvider>
			</ToastProvider>
		</BrowserRouter>
	);
}