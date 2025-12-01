import { useNavigate } from "react-router-dom";

export default function AccessDenied() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text">
            <h1 className="text-4xl font-bold">403 - Access Denied</h1>
            <p className="text-lg">Sorry, you do not have permission to access this page.</p>
            <button 
                className="mt-4 px-4 py-2 rounded-full bg-accent text-text hover:bg-accent/80 transition-all duration-200"
                onClick={() => navigate('/')}
            >
                Go to Home
            </button>
        </div>
    );
}
