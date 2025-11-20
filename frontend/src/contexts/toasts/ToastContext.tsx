import React, { useState } from "react";
import type { Toast } from "@contexts/toasts/ToastContextValue";
import { ToastContext } from "@contexts/toasts/ToastContextValue";


export const ToastProvider = ({ children }: { children: React.ReactNode }) => {

	const [toasts, setToasts] = useState<Array<Toast>>([]);

    const fade = 500;
    const lifetime = 3000;

	const toast = (type: 'info' | 'warning' | 'success' | 'danger', message?: string) => {
		const id = Date.now();

        if (!message) {
            message = `A ${type} toast was created at ${id}`;
        }
        
        setToasts(current => [...current, { id, message, type, visible: true }]);

        setTimeout(() => {
			setToasts(current => current.map(t => t.id === id ? { ...t, visible: false } : t));
		}, lifetime - fade);

		setTimeout(() => {
			setToasts(current => current.filter(toast => toast.id !== id));
		}, lifetime);
	};

    const clearToasts = () => {
        setToasts([]);
    };

	return (
		<ToastContext.Provider value={{ toast, clearToasts }}>
            <div className="fixed top-5 right-5 z-50 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        onClick={() => setToasts(current => current.filter(t => t.id !== toast.id))}
                        className={`
                            p-3 px-4
                            rounded-md shadow-md text-text border-2
                            transition-all duration-500
                            ${!toast.visible ? "opacity-0 scale-100" : "opacity-100 scale-90"}
                            ${toast.type === "info" ? "bg-info/20 border-info/80" : ""}
                            ${toast.type === "warning" ? "bg-warning/20 border-warning/80" : ""}
                            ${toast.type === "success" ? "bg-success/20 border-success/80" : ""}
                            ${toast.type === "danger" ? "bg-danger/20 border-danger/80" : ""}
                            hover:scale-105
                        `}
                    >
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>

			{children}
		</ToastContext.Provider>
	);
};