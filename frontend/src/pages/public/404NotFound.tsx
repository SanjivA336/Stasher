import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text">
            <h1 className="text-4xl font-bold">404 - Not Found</h1>
            <p className="text-lg">Sorry, the page you are looking for does not exist.</p>
            <button 
                className="mt-4 px-4 py-2 rounded-full bg-accent text-text hover:bg-accent/80 transition-all duration-200"
                onClick={() => navigate('/')}
            >
                Go to Home
            </button>
        </div>
    );
}
