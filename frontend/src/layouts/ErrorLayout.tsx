import ButtonField from "@/components/fields/ButtonField";
import React from "react";
import { useNavigate } from "react-router-dom";

type ErrorLayoutProps = {
    children: React.ReactNode;
};

export default function ErrorLayout({ children }: ErrorLayoutProps) {

    const navigate = useNavigate();

    return (
        <div className="vw-100 vh-100 d-flex flex-column align-items-center justify-content-center bg-darkest text-light">
            <div className="d-flex flex-column text-center m-1">
                {children}
                <ButtonField
                    onClick={() => navigate("/")}
                    color="primary"
                    rounding="3"
                    className="p-2"
                >
                    <p className="m-0">Go to Home</p>
                </ButtonField>
            </div>
        </div>
    );
}
