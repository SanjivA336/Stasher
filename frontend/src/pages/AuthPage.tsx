import { useState } from "react";
import { useAuth } from "@/contexts/auth/AuthContextValue";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/testing";

export default function AuthPage() {
    const { login, register, authLoading } = useAuth();

    const toast = useToast();

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async () => {
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(username, email, password, confirm);
            }
            navigate("/");
        } catch (error) {
            toast('danger', getError(error));
        }
    };

    return (
        <div className="min-h-screen w-full h-full flex items-center justify-center bg-background">
            <form className="flex flex-col gap-4 p-4 max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Register"}</h1>

                {!isLogin && (
                    <div className="flex flex-col gap-1">
                        <h3>Username</h3>
                        <input
                            type="text"
                            placeholder="Username"
                            className="p-2 border border-gray-300 rounded"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={authLoading}
                        />
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <h3>Email</h3>
                    <input
                        type="text"
                        placeholder="Email"
                        className="p-2 border border-gray-300 rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={authLoading}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <h3>Password</h3>
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-2 border border-gray-300 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={authLoading}
                    />
                </div>

                {!isLogin && (
                    <div className="flex flex-col gap-1">
                        <h3>Confirm Password</h3>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className={`p-2 border ${password !== confirm ? 'border-red-500' : 'border-gray-300'} rounded`}
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            disabled={authLoading}
                        />
                    </div>
                )}
                
                <div className="flex flex-col gap-1">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                        disabled={authLoading}
                    >
                        {isLogin ? "Login" : "Register"}
                    </button>
                    <p>Already have an account? <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Register" : "Login"} Here</span></p>
                </div>
            </form>
        </div>
    );
}