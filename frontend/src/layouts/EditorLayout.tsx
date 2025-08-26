import React from "react";

type HomeLayoutProps = {
    children: React.ReactNode;
};

export default function HomeLayout({ children }: HomeLayoutProps) {
    return (
        <div className="w-100 d-flex flex-column align-items-center bg-darkest text-light">
            {/* Page content */}
            <div className="w-100 h-auto container p-2">
                {children}
            </div>

            {/* Footer */}
            <div className="w-100 text-center text-light mt-auto py-3">
                <p>&copy; {new Date().getFullYear()} Stasher. All rights reserved.</p>
            </div>
        </div>
    );
}
