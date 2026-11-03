import { useState } from "react";

import {
    Alert,
    Anchor,
    Box,
    Button,
    Checkbox,
    Divider,
    PasswordInput,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import formStyles from "../components/AuthForm.module.css";
import AuthLayout from "../components/AuthLayout.jsx";
import { apiFetch } from "../api.js";

import googleLogo from "../../assets/icons/google_logo.svg";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;


function SignupPage() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");

    const [lastName, setLastName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [terms, setTerms] = useState(false);

    const [errors, setErrors] = useState({});

    const [formError, setFormError] = useState("");

    const [loading, setLoading] = useState(false);


    function validateForm() {
        const nextErrors = {};

        if (!firstName.trim()) {
            nextErrors.firstName = "This field is required.";
        } else if (firstName.trim().length > 100) {
            nextErrors.firstName = "Use 100 characters or fewer.";
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
            nextErrors.email = "Email is required.";
        } else if (
            !EMAIL_PATTERN.test(email.trim())
        ) {
            nextErrors.email = "Enter a valid email address.";
        }

        if (!password) {
            nextErrors.password = "Password is required.";
        } else if (password.length < 8) {
            nextErrors.password = "Use at least 8 characters.";
        }

        if (!terms) {
            nextErrors.terms =
                "You must agree to the Terms & Conditions.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };


    async function handleSubmit(event) {
        event.preventDefault();
        
        if (loading) {
            return;
        }

        if (!validateForm()) {
            setFormError(
                "Please correct the highlighted fields."
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
                        first_name:firstName.trim(),

                        last_name:lastName.trim(),

                        email:email.trim().toLowerCase(),

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
        <AuthLayout variant="signup">
            <Stack gap="xl">

                {/* Page heading */}
                <Box>
                    <Title order={1} fw={600}>
                        Create an Account
                    </Title>

                    <Text c="dimmed" mt="xs" size="sm">
                        Already have an account?{" "}
                        <Anchor
                            component={Link}
                            to="/login"
                            className={formStyles.pageLink}
                        >
                            Log in
                        </Anchor>
                    </Text>
                </Box>

                {/* Signup form */}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <Stack gap="lg">
                        
                        {/* Form/API errors */}
                        {formError && (
                            <Alert
                                color="red"
                                title="Unable to create account"
                                variant="light"
                                role="alert"
                            >
                                {formError}
                            </Alert>
                        )}

                        {/* First and last names */}
                        <SimpleGrid
                            cols={{ base: 1, sm: 2}}
                            spacing="md"
                        >
                            <TextInput
                                label="First Name"
                                placeholder="John"
                                name="firstName"
                                autoComplete="given-name"
                                size="md"
                                variant="unstyled"
                                value={firstName}
                                onChange={(event) => {
                                    setFirstName(
                                        event.currentTarget.value
                                    );
                                    setErrors((prev) => ({
                                        ...prev,
                                        firstName: "",
                                    }));
                                    setFormError("");
                                }}
                                error={errors.firstName}
                                required
                                classNames={{
                                    label: formStyles.fieldLabel,
                                    input: formStyles.lineInput,
                                    error: formStyles.fieldError,
                                }}
                            />

                            <TextInput
                                label="Last Name"
                                placeholder="Doe"
                                name="lastName"
                                autoComplete="family-name"
                                size="md"
                                variant="unstyled"
                                value={lastName}
                                onChange={(event) => {
                                    setLastName(
                                        event.currentTarget.value
                                    );
                                    setErrors((prev) => ({
                                        ...prev,
                                        lastName: "",
                                    }));
                                    setFormError("");
                                }}
                                error={errors.lastName}
                                required
                                classNames={{
                                    label: formStyles.fieldLabel,
                                    input: formStyles.lineInput,
                                    error: formStyles.fieldError,
                                }}
                            />
                        </SimpleGrid>

                        {/* Email */}
                        <TextInput
                            label="Email Address"
                            placeholder="name@example.com"
                            type="email"
                            name="email"
                            autoComplete="email"
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
                            error={errors.email}
                            required
                            classNames={{
                                label: formStyles.fieldLabel,
                                input: formStyles.lineInput,
                                error: formStyles.fieldError,
                            }}
                        />

                        {/* Password */}
                        <PasswordInput
                            label="Password"
                            placeholder="Create a password"
                            name="password"
                            autoComplete="new-password"
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
                            error={errors.password}
                            description="Use at least 8 characters."
                            required
                            classNames={{
                                label: formStyles.fieldLabel,
                                input: formStyles.lineInput,
                                innerInput: formStyles.lineInput,
                                description: formStyles.fieldDescription,
                                error: formStyles.fieldError,
                                section: formStyles.sectionText,
                            }}
                        />

                        {/* Terms acceptance */}
                        <Checkbox
                            label="I agree to the Terms & Conditions"
                            checked={terms}
                            onChange={(event) => {
                                setTerms(event.currentTarget.checked);
                                setErrors((prev) => ({
                                    ...prev,
                                    terms: "",
                                }));
                                setFormError("");
                            }}
                            error={errors.terms}
                            classNames={{
                                label: formStyles.termsText,
                                error: formStyles.fieldError,
                            }}
                        />


                        {/* Create account Button*/}
                        <Button
                            type="submit"
                            fullWidth
                            size="md"
                            radius="xl"
                            loading={loading}
                            className={formStyles.submitButton}
                        >
                            Create Account
                        </Button>

                        <Divider
                            label="OR"
                            labelPosition="center"
                        />

                        {/* Future Google authentication */}
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


export default SignupPage;