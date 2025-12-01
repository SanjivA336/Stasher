import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ToastProvider } from "@contexts/toasts/ToastContext";
import { AuthProvider } from "@contexts/auth/AuthContext";
import { StashProvider } from "@contexts/stash/StashContext";


import { UserRoute, GuestRoute} from "@contexts/auth/AuthWrapper";
import { StashRoute } from "@contexts/stash/StashWrapper";

import AccessDenied from "@/pages/public/403AccessDenied";
import NotFound from "@/pages/public/404NotFound";

import AuthPage from "@/pages/guest/AuthPage";
import StashesPage from "@/pages/user/StashesPage";
import StoragesPage from "@/pages/user/stash-restricted/StoragesPage";
import LabelsPage from "@/pages/user/stash-restricted/LabelsPage";
import HistoryPage from "@/pages/user/stash-restricted/HistoryPage";
import SettingsPage from "@/pages/user/stash-restricted/SettingsPage";


export default function App() {
	return (
		<BrowserRouter>
			<ToastProvider>
				<AuthProvider>
					<StashProvider>
						<Routes>
							{/* Guest Routes */}
							<Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />

							{/* Protected Routes */}
							<Route path="/stashes" element={<UserRoute><StashesPage /></UserRoute>} />
							<Route path="/" element={<Navigate to="/storages" />} />

							{/* Stash-Restricted Routes */}
							<Route path="/storages" element={<UserRoute><StashRoute><StoragesPage /></StashRoute></UserRoute>} />
							<Route path="/labels" element={<UserRoute><StashRoute><LabelsPage /></StashRoute></UserRoute>} />
							<Route path="/history" element={<UserRoute><StashRoute><HistoryPage /></StashRoute></UserRoute>} />
							<Route path="/settings" element={<UserRoute><StashRoute><SettingsPage /></StashRoute></UserRoute>} />

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