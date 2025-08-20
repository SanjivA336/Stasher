import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, register } from "@/apis/auth_api";

import AuthLayout from "@/layouts/AuthLayout";

import ButtonField from "@/components/fields/ButtonField";
import ShortTextField from "@/components/fields/ShortTextField";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (loading) return;

        setLoading(true);

        if (!username || !email || !password || !confirm) {
            toast.error("Please fill in all fields.");
            setLoading(false);
            return;
        }

        if (password !== confirm) {
            toast.error("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await register(username, email, password);
            await login(email, password);
            window.location.reload();
        } catch (err: any) {
            toast.error("Registration failed: " + (err.message || "An error occurred."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <form className="w-100 text-center d-flex flex-column gap-3 align-items-center">
                <h2 className="m-0">Register</h2>
                <div className="w-100 d-flex flex-column gap-2">
                    <ShortTextField
                        value={username}
                        setValue={setUsername}
                        placeholder="Username"
                        autoComplete="none"
                        type="text"
                        label="Username"
                        className="w-100"/>
                    <ShortTextField
                        value={email}
                        setValue={setEmail}
                        placeholder="Email"
                        autoComplete="email"
                        type="email"
                        label="Email"
                        className="w-100"/>
                    <ShortTextField
                        value={password}
                        setValue={setPassword}
                        placeholder="Password"
                        autoComplete="none"
                        secure={true}
                        label="Password"
                        className="w-100"/>
                    <ShortTextField
                        value={confirm}
                        setValue={setConfirm}
                        placeholder="Confirm Password"
                        autoComplete="none"
                        secure={true}
                        label="Confirm Password"
                        className="w-100"/>
                </div>

                <ButtonField
                    onClick={handleSubmit}
                    loading={loading}
                    className="w-100 p-2"
                >
                    Register
                </ButtonField>
                <p>
                    Already have an account?{" "}
                    <button className="bg-transparent p-0  m-0 text-primary border-0" type="button" onClick={() => navigate("/login")}>
                        Login here
                    </button>
                </p>

            </form>
        </AuthLayout>
    );
}
