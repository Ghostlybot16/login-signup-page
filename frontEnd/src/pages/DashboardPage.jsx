import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import { apiFetch } from "../api";

import "../css/dashboard.css";

function DashboardPage() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [error, setErrors] = useState("");

    useEffect(() => {
        async function loadUser() {
            const token = sessionStorage.getItem(
                "token"
            );

            if (!token) {
                navigate(
                    "/login",
                    { replace: true }
                );

                return;
            }

            try {
                const data = await apiFetch(
                    "/api/users/me",
                    {
                        token,
                    }
                );

                setUser(data);
            } catch (requestError) {
                if (requestError.status === 401) {
                    sessionStorage.removeItem(
                        "token"
                    );

                    navigate(
                        "/login", 
                        { replace: true }
                    );

                    return;
                }

                setErrors(
                    requestError.message
                    || "Unable to load your account."
                );
            }
        }

        loadUser();
    
    }, [navigate])

    const handleLogout = () => {
        sessionStorage.removeItem("token");

        navigate(
            "/login",
            { replace: true }
        );
    };

    if (error) {
        return (
            <main className="dash-main">
                <p>{error}</p>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="dash-body">
            <div className="dash-shell">

                <main
                    className="dash-main"
                    id="main"
                >
                    <p className="dash-greeting">
                        Hello, {user.first_name}
                    </p>

                    <h2 className="dash-section-title">
                        My Dashboard
                    </h2>

                    <section className="dash-card">
                        <p className="dash-muted">
                            This is your dashboard area.
                            Add widgets here!
                        </p>
                    </section>
                </main>

                <footer className="dash-footer">
                    <button
                        className="btn-logout"
                        type="button"
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </footer>

            </div>
        </div>
    );
}

export default DashboardPage