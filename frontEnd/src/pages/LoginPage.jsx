import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import { apiFetch } from "../api";

import companyLogo from "../../assets/images/company_logo.png";
import googleLogo from "../../assets/icons/google_logo.svg";
import facebookLogo from "../../assets/icons/facebook_logo.svg";

import "../css/signup.css";
import "../css/login.css";


const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function getRememberedEmail() {
    try {
        return(
            localStorage.getItem(
                "auth:rememberEmail"
            ) || ""
        );
    } catch {
        return "";
    }
}

function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] =
        useState(() => getRememberedEmail());
    
    const [password, setPassword] =
        useState("");
    
    const [rememberMe, setRememberMe] =
        useState(() => Boolean(
            getRememberedEmail()
        ));
    
    const [showPassword, setShowPassword] =
        useState(false);
    
    const [errors, setErrors] =
        useState({});
    
    const [formError, setFormError] =
        useState("");
    
    const [loading, setLoading] =
        useState(false);

    const validate = () => {
        const nextErrors = {};

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            nextErrors.email =
                "Email is required.";
        } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
            nextErrors.email =
                "Enter a valid email address.";
        }

        if (!password) {
            nextErrors.password =
                "Password is required.";
        } else if (password.length < 8) {
            nextErrors.password =
                "Use at least 8 characters.";
        }

        setErrors(nextErrors);

        return (Object.keys(nextErrors).length === 0);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            setFormError(
                "Please correct the highlighted fields."
            );
            return;
        }

        setFormError("");
        setLoading(true);

        try {
            if (rememberMe) {
                localStorage.setItem(
                    "auth:rememberEmail",
                    email.trim()
                );
            } else {
                localStorage.removeItem(
                    "auth:rememberEmail"
                );
            }

            const data = await apiFetch(
                "/api/users/login",
                {
                    method: "POST",
                    body: {
                        email: email.trim().toLowerCase(),
                        password
                    },
                }
            );

            sessionStorage.setItem(
                "token",
                data.access_token
            );

            navigate(
                "/dashboard",
                { replace: true }
            );
        } catch (error) {
            if (error.status === 401) {
                setErrors({
                    email: "Invalid email or password.",
                    password: "Invalid email or password."
                });

                setFormError(
                    "Invalid credentials. Please try again."
                );
            } else {
                setFormError(
                    error.message
                    || "Login failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <a
                className="skip-link"
                href="#main"
            >
                Skip to main content
            </a>

            <main
                id="main"
                role="main"
            >
                <div className="auth-container">

                    <div
                        className="auth-left auth-left--login"
                        role="img"
                        aria-label="Dark single tall tree"
                    >
                        <img
                            src={companyLogo}
                            alt="Company logo"
                            className="company-logo"
                        />
                    </div>

                    <div className="auth-right">
                        <div className="form-wrapper">

                            <h1>Log in</h1>

                            <p className="subtext">
                                Don't have an account?{" "}
                                <Link to="/signup">
                                    Create an Account
                                </Link>
                            </p>

                            <form
                                className="login-form"
                                onSubmit={handleSubmit}
                                noValidate
                            >
                                <div
                                    className="form-error"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {formError}
                                </div>

                                <div
                                    className={
                                        `form-group ${
                                            errors.email
                                                ? "has-error"
                                                : ""
                                        }`
                                    }
                                >
                                    <label htmlFor="email">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="username"
                                        inputMode="email"
                                        placeholder="name@example.com"
                                        aria-invalid={
                                            Boolean(
                                                errors.email
                                            )
                                        }
                                    />

                                    <p className="field-error">
                                        {errors.email}
                                    </p>
                                </div>

                                <div
                                    className={
                                        `form-group ${
                                            errors.password
                                                ? "has-error"
                                                : ""
                                        }`
                                    }
                                >
                                    <label htmlFor="password">
                                        Password
                                    </label>

                                    <div className="password-field">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            id="password"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            aria-invalid={
                                                Boolean(
                                                    errors.password
                                                )
                                            }
                                        />

                                        <button
                                            type="button"
                                            className={
                                                `toggle-pass ${
                                                    showPassword
                                                        ? "is-on"
                                                        : ""
                                                }`
                                            }
                                            onClick={() =>
                                                setShowPassword(
                                                    (value) =>
                                                        !value
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            aria-pressed={
                                                showPassword
                                            }
                                        />
                                    </div>

                                    <p className="field-error">
                                        {errors.password}
                                    </p>

                                    <div className="muted-row-between">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(event) =>
                                                    setRememberMe(
                                                        event.target.checked
                                                    )
                                                }
                                            />
                                            {" "}Remember Me
                                        </label>

                                        <a
                                            className="small-link"
                                            href="#"
                                        >
                                            Forgot Password?
                                        </a>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    <strong>
                                        {loading
                                            ? "Signing In..."
                                            : "Log In"}
                                    </strong>
                                </button>

                                <p
                                    className="muted-hint"
                                    aria-live="polite"
                                >
                                    {
                                        searchParams.get(
                                            "signup"
                                        ) === "success"
                                            ? "Account created successfully! You can log in now."
                                            : ""
                                    }
                                </p>

                                <div
                                    className="divider"
                                    aria-hidden="true"
                                >
                                    <span>OR</span>
                                </div>

                                <div className="social-buttons-container">
                                    <button
                                        type="button"
                                        className="btn-social google"
                                    >
                                        <img
                                            src={googleLogo}
                                            alt=""
                                            width={30}
                                            height={30}
                                            aria-hidden="true"
                                        />
                                        <span>
                                            Continue with Google
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-social facebook"
                                    >
                                        <img
                                            src={facebookLogo}
                                            alt=""
                                            width={30}
                                            height={30}
                                        />
                                        <span>
                                            Continue with Facebook
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default LoginPage;