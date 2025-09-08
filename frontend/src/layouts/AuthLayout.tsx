import React from "react";

type AuthLayoutProps = {
    children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="vw-100 vh-100 d-flex flex-column align-items-center justify-content-center bg-darkest text-light">
            <div className="d-flex text-center m-1">
                <h1 className="text-light m-0">Welcome to <span className="text-primary" style={{fontFamily: "Cal Sans"}}>Stasher.</span></h1>
            </div>
            <div className="d-flex text-center">
                <h5 className="text-light m-0">Never lose track of what's in your stash.</h5>
            </div>
            <div className="d-flex flex-column align-items-center justify-content-center rounded-5 bg-dark px-5 py-4 shadow m-3">
                {children}
            </div>
        </div>
    );
}
