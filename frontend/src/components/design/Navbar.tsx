import { useNavigate } from "react-router-dom";
import { logout } from "@/apis/auth_api";
import React from "react";

import Logo from "@/assets/brand/LogoAccent.png";
import ButtonField from "@/components/fields/ButtonField";
export const NAVBAR_HEIGHT = "70px";

const Navbar = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState(false);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        try {
            await logout();
            window.location.reload();
        } catch (err: any) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-100 px-4 bg-dark d-flex flex-row justify-content-between fixed-top" style={{ height: NAVBAR_HEIGHT }}>
                {/* Navbar Start */}
                <div className="d-flex align-items-start h-100">
                    <img src={Logo} className="h-50 my-auto me-2" onClick={() => navigate("/")}/>
                    <h1 className="text-light my-auto" onClick={() => navigate("/")}>Stasher</h1>
                </div>

                {/* Navbar End */}
                <div className="d-flex gap-2 align-items-end">
                    <ButtonField
                        onClick={() => navigate("/kitchens")}
                        rounding="3"
                        color="dark"
                        loading={loading}
                        className="w-100 px-3 p-2 text-nowrap"
                    >
                        My Kitchens
                    </ButtonField>
                    <ButtonField
                        onClick={() => handleLogout()}
                        rounding="3"
                        color="danger"
                        outlineVariant
                        loading={loading}
                        className="w-100 px-3 p-2 text-nowrap"
                    >
                        Logout
                        {loading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
                    </ButtonField>
                </div>
            </div>
            <div className="mb-2" style={{ height: NAVBAR_HEIGHT }}></div> {/* Spacer for fixed navbar */}
        </>
    );
};

export default Navbar;
