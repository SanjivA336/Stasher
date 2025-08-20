import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "@/apis/auth_api";

import AuthLayout from "@/layouts/AuthLayout";

import ButtonField from "@/components/fields/ButtonField";
import ShortTextField from "@/components/fields/ShortTextField";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (loading) return;

        setLoading(true);

        if (!email || !password) {
            toast.error("Please enter email and password.");
            setLoading(false);
            return;
        }

        try {
            await login(email, password);
            window.location.reload();
        } catch (err: any) {
            toast.error("Login failed: " + (err.message || "An error occurred."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <form className="w-100 text-center d-flex flex-column gap-3 align-items-center">
                <h2 className="m-0">Login</h2>
                <div className="w-100 d-flex flex-column gap-2">
                    <ShortTextField
                        value={email}
                        setValue={setEmail}
                        placeholder="Email"
                        autoComplete="email"
                        type="email"
                        label="Email"
                        required={true}
                        className="w-100"/>
                    <ShortTextField
                        value={password}
                        setValue={setPassword}
                        placeholder="Password"
                        autoComplete="current-password"
                        secure={true}
                        label="Password"
                        required={true}
                        className="w-100"/>
                </div>

                <ButtonField
                    onClick={handleSubmit}
                    loading={loading}
                    className="w-100 p-2"
                >
                    Login
                </ButtonField>
                <p>
                    Don't have an account?{" "}
                    <button className="bg-transparent p-0 m-0 text-primary border-0" type="button" onClick={() => navigate("/register")}>
                        Register here
                    </button>
                </p>

            </form>
        </AuthLayout>
    );
}
