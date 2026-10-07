import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import { apiFetch } from "../api.js";

import companyLogo from "../../assets/images/company_logo.png";
import googleLogo from "../../assets/icons/google_logo.svg";
import facebookLogo from "../../assets/icons/facebook_logo.svg";

import "../css/signup.css";


const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;


function SignupPage() {
    const navigate = useNavigate();

    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [terms, setTerms] =
        useState(false);

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

        if (!firstName.trim()) {
            nextErrors.firstName =
                "This field is required.";
        } else if (
            firstName.trim().length > 100
        ) {
            nextErrors.firstName =
                "Use 100 characters or fewer.";
        }

        if (!lastName.trim()) {
            nextErrors.lastName =
                "This field is required.";
        } else if (
            lastName.trim().length > 100
        ) {
            nextErrors.lastName =
                "Use 100 characters or fewer.";
        }

        if (!email.trim()) {
            nextErrors.email =
                "Email is required.";
        } else if (
            !EMAIL_PATTERN.test(email.trim())
        ) {
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

        return (
            Object.keys(nextErrors).length === 0
        );
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            setFormError(
                "Please correct the highlighted fields."
            );
            return;
        }

        if (!terms) {
            setFormError(
                "You must agree to the Terms & Conditions."
            );
            return;
        }

        setFormError("");
        setLoading(true);

        try {
            await apiFetch(
                "/api/users/signup",
                {
                    method: "POST",
                    body: {
                        first_name:
                            firstName.trim(),

                        last_name:
                            lastName.trim(),

                        email:
                            email
                                .trim()
                                .toLowerCase(),

                        password,
                    },
                }
            );

            navigate(
                "/login?signup=success",
                { replace: true }
            );

        } catch (error) {
            const detail =
                error.data?.detail;

            if (
                error.status === 400
                && typeof detail === "string"
                && detail
                    .toLowerCase()
                    .includes("email")
            ) {
                setErrors((current) => ({
                    ...current,
                    email:
                        "An account with this email already exists.",
                }));

                setFormError(
                    "An account with this email already exists."
                );

            } else {
                setFormError(
                    error.message
                    || "Signup failed. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    return (
        <main
            id="main"
            role="main"
        >
            <div className="auth-container">

                <div className="auth-left">
                    <img
                        src={companyLogo}
                        alt="Company logo"
                        className="company-logo"
                    />
                </div>

                <div className="auth-right">
                    <div className="form-wrapper">

                        <h1>Create an Account</h1>

                        <p className="subtext">
                            Already have an account?{" "}
                            <Link to="/login">
                                Log in
                            </Link>
                        </p>

                        <form
                            className="signup-form"
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

                            <div className="form-row">
                                <div
                                    className={
                                        `form-group ${
                                            errors.firstName
                                                ? "has-error"
                                                : ""
                                        }`
                                    }
                                >
                                    <label htmlFor="firstName">
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        id="firstName"
                                        value={firstName}
                                        onChange={(event) =>
                                            setFirstName(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="given-name"
                                        placeholder="John"
                                    />

                                    <p className="field-error">
                                        {errors.firstName}
                                    </p>
                                </div>

                                <div
                                    className={
                                        `form-group ${
                                            errors.lastName
                                                ? "has-error"
                                                : ""
                                        }`
                                    }
                                >
                                    <label htmlFor="lastName">
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        id="lastName"
                                        value={lastName}
                                        onChange={(event) =>
                                            setLastName(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="family-name"
                                        placeholder="Doe"
                                    />

                                    <p className="field-error">
                                        {errors.lastName}
                                    </p>
                                </div>
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
                                    autoComplete="email"
                                    placeholder="email@example.com"
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
                                        autoComplete="new-password"
                                        placeholder="••••••••"
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
                                        aria-pressed={
                                            showPassword
                                        }
                                    />
                                </div>

                                <p className="field-error">
                                    {errors.password}
                                </p>
                            </div>

                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={terms}
                                    onChange={(event) =>
                                        setTerms(
                                            event.target.checked
                                        )
                                    }
                                />

                                <label htmlFor="terms">
                                    I agree to the{" "}
                                    <a href="#">
                                        Terms & Conditions
                                    </a>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={
                                    loading || !terms
                                }
                            >
                                <strong>
                                    {loading
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </strong>
                            </button>

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
                                        aria-hidden="true"
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
    );
}


export default SignupPage;