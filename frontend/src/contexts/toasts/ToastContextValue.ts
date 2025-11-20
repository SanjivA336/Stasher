import { createContext, useContext } from "react";

export type Toast = {
	id: number;
	message: string;
	type: 'info' | 'warning' | 'success' | 'danger';
    visible?: boolean;
};

export type ToastContextType = {
	toast: (type: 'info' | 'warning' | 'success' | 'danger', message?: string) => void;
	clearToasts: () => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context.toast;
};
