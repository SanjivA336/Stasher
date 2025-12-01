import { useState } from "react";
import { useAuth } from "@/contexts/auth/AuthContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { ButtonField } from "@/components/Fields";

export default function AuthPage() {
    const { login, register, authLoading, actionLoading } = useAuth();
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async () => {
        try {
            if (isLogin) await login(email, password);
            else await register(username, email, password, confirm);
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
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={authLoading} className="p-2 border border-gray-300 rounded"/>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <h3>Email</h3>
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={authLoading} className="p-2 border border-gray-300 rounded"/>
                </div>

                <div className="flex flex-col gap-1">
                    <h3>Password</h3>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={authLoading} className="p-2 border border-gray-300 rounded"/>
                </div>

                {!isLogin && (
                    <div className="flex flex-col gap-1">
                        <h3>Confirm Password</h3>
                        <input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={authLoading} className={`p-2 border ${password !== confirm ? 'border-red-500' : 'border-gray-300'} rounded`}/>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <ButtonField
                        onClick={handleSubmit} 
                        loading={authLoading  || actionLoading}
                        style="rounded"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
                        {isLogin ? "Login" : "Register"}
                    </ButtonField>
                    <p>Already have an account? <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Register" : "Login"} Here</span></p>
                </div>
            </form>
        </div>
    );
}
