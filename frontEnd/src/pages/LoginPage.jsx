import { useState } from "react";

import {
    Alert,
    Anchor,
    Box,
    Button,
    Checkbox,
    Divider,
    Group,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core"

import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import formStyles from "../components/AuthForm.module.css";
import { apiFetch } from "../api";

import googleLogo from "../../assets/icons/google_logo.svg";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

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

function validateEmail(value) {
    const trimmed = value.trim();

    if (!trimmed) {
        return "Email is required.";
    }

    if (!EMAIL_PATTERN.test(trimmed)) {
        return "Enter a valid email address.";
    }

    return "";
}

function validatePassword(value) {
    if (!value) {
        return "Password is required.";
    }

    if (value.length < 8) {
        return "Use at least 8 characters.";
    }

    return "";
}


function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState(
        () => getRememberedEmail()
    );
    
    const [password, setPassword] = useState("");
    
    const [rememberMe, setRememberMe] = useState(
        () => Boolean(getRememberedEmail())
    );
    
    const [errors, setErrors] = useState({});
    
    const [formError, setFormError] = useState("");
    
    const [loading, setLoading] = useState(false);

    const signupSuccess = 
        searchParams.get("signup") === "success";
    
    function validateForm() {
        const nextErrors = {
            email: validateEmail(email),
            password: validatePassword(password),
        };

        setErrors(nextErrors);

        return !nextErrors.email
            && !nextErrors.password;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            setFormError(
                "Please correct the highlighted fields."
            );
            return;
        }

        setFormError("");
        setLoading(true);

        try {
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
            
            // Remember the email only after 
            // a successful login.
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
            } catch {
                // Storage may be unavailable
            }

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
        <AuthLayout variant="login">
            <Stack gap="xl">

                {/* Page heading */}
                <Box>
                    <Title order={1} fw={600}>
                        Log in
                    </Title>

                    <Text c="dimmed" mt="xs" size="sm">
                        Don't have an account?{" "}
                        <Anchor
                            component={Link}
                            to="/signup"
                            className={formStyles.pageLink}
                        >
                            Create an Account
                        </Anchor>
                    </Text>
                </Box>

                {/* Signup Confirmation */}
                {signupSuccess && (
                    <Alert
                        color="green"
                        title="Account created"
                        variant="light"
                        role="status"
                    >
                        Your account was created successfully.
                        You can log in now.
                    </Alert>
                )}

                {/* Login form */}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <Stack gap="xl">

                        {/* API/form errors */}
                        {formError && (
                            <Alert
                                color="red"
                                title="Unable to log in"
                                variant="light"
                                role="alert"
                            >
                                {formError}
                            </Alert>
                        )}

                        <TextInput
                            label="Email Address"
                            placeholder="name@example.com"
                            type="email"
                            name="email"
                            autoComplete="username"
                            size="md"
                            variant="unstyled"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.currentTarget.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    email: "",
                                }));
                                setFormError("");
                            }}
                            onBlur={() =>
                                setErrors((prev) => ({
                                    ...prev,
                                    email: validateEmail(email),
                                }))
                            }
                            error={errors.email}
                            required
                            classNames={{
                                label: formStyles.fieldLabel,
                                input: formStyles.lineInput,
                                error: formStyles.fieldError
                            }}
                        />

                        <PasswordInput
                            label="Password"
                            placeholder="Enter your password"
                            name="password"
                            autoComplete="current-password"
                            size="md"
                            variant="unstyled"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.currentTarget.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    password: "",
                                }));
                                setFormError("");
                            }}
                            onBlur={() =>
                                setErrors((prev) => ({
                                    ...prev,
                                    password: validatePassword(password),
                                }))
                            }
                            error={errors.password}
                            required
                            classNames={{
                                label: formStyles.fieldLabel,
                                input: formStyles.lineInput,
                                innerInput: formStyles.lineInput,
                                error: formStyles.fieldError,
                                section: formStyles.sectionText,
                            }}
                        />

                        <Group
                            justify="space-between"
                            align="center"
                            gap="xs"
                        >
                            <Checkbox
                                label="Remember Me"
                                checked={rememberMe}
                                onChange={(event) =>
                                    setRememberMe(
                                        event.currentTarget.checked
                                    )
                                }
                            />

                            <Text size="sm" className={formStyles.helperText}>
                                Forgot password? (Coming soon)
                            </Text>
                        </Group>

                        <Button
                            type="submit"
                            fullWidth
                            size="md"
                            radius="xl"
                            loading={loading}
                            className={formStyles.submitButton}
                        >
                            Log in
                        </Button>

                        <Divider
                            label="OR"
                            labelPosition="center"
                            className={formStyles.formDivider}
                        />

                        {/* Google sign-in */}
                        <Button
                            type="button"
                            variant="default"
                            fullWidth
                            size="md"
                            radius="xl"
                            disabled
                            className={formStyles.googleButton}
                            leftSection={
                                <img
                                    src={googleLogo}
                                    alt=""
                                    width={22}
                                    height={22}
                                />
                            }
                        >
                            Continue with Google
                        </Button>

                        <Text
                            ta="center"
                            size="xs"
                            c="dimmed"
                        >
                            Google sign-in coming soon
                        </Text>

                    </Stack>
                </Box>
            </Stack>

        </AuthLayout>
    );
        
}

export default LoginPage;