import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Center,
    Container,
    Divider,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";

import { apiFetch } from "../api";
import styles from "./DashboardPage.module.css";

function DashboardPage() {
    const navigate = useNavigate();

    const [account, setAccount] = useState({
        status: "loading",
        user: null,
        error: "",
    });

    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        // Prevent an outdated request from updating 
        // state after the component unmounts.
        let active = true;

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

                if (!active) {
                    return;
                }

                setAccount({
                    status: "ready",
                    user: data,
                    error: "",
                });

            } catch (requestError) {
                if (!active) {
                    return;
                }

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

                setAccount({
                    status: "error",
                    user: null,
                    error:
                        requestError.message ||
                        "Unable to load your account.",
                });
            }
        }

        loadUser();

        return () => {
            active = false;
        }
    
    }, [navigate, retryCount]);
    

    function handleLogout() {
        sessionStorage.removeItem("token");

        navigate(
            "/login",
            { replace: true }
        );
    }

    function handleRetry() {
        setAccount({
            status: "loading",
            user: null,
            error: "",
        });

        setRetryCount((count) => count + 1);
    }

    const user = account.user;

    const fullName = user
        ? [user.first_name, user.last_name]
            .filter(Boolean)
            .join(" ")
        : "";
    
    const initials = user
        ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`
            .toUpperCase()
        : "";


    return (
        <Box
            component="main"
            id="main"
            className={styles.page}
        >
            <Container
                size="xl"
                py={{ base: "xl", md: 48 }}
            >
                {/* Loading: don't display private
                    account information yet */}
                {account.status === "loading" && (
                    <Center mih="70dvh">
                        <Stack
                            align="center"
                            gap="md"
                            role="status"
                        >
                            <Loader color="dark" size="md" />

                            <Text c="dimmed" size="sm">
                                Checking your session...
                            </Text>
                        </Stack>
                    </Center>
                )}

                {/* Network/server errors */}
                {account.status === "error" && (
                    <Center mih="70dvh">
                        <Paper
                            withBorder
                            shadow="sm"
                            radius="xl"
                            p="xl"
                            w="100%"
                            maw={520}
                        >
                            <Stack gap="lg">
                                <Title order={1} size="h3">
                                    Unable to load dashboard
                                </Title>

                                <Alert
                                    color="red"
                                    variant="light"
                                    title="Something went wrong"
                                    role="alert"
                                >
                                    {account.error}
                                </Alert>

                                <Group gap="sm">
                                    <Button
                                        color="dark"
                                        radius="xl"
                                        onClick={handleRetry}
                                    >
                                        Try again
                                    </Button>

                                    <Button
                                        variant="default"
                                        radius="xl"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    </Center>
                )}


                {/* Authenticated dashboard */}
                {account.status === "ready" && user && (
                    <Stack gap="xl">

                        {/* Dashboard header */}
                        <Paper
                            withBorder
                            shadow="sm"
                            radius="xl"
                            p={{ base: "lg", md: "xl" }}
                        >
                            <Group
                                justify="space-between"
                                align="center"
                                gap="lg"
                            >
                                <Group gap="md">
                                    <Avatar
                                        size={56}
                                        radius="xl"
                                        color="dark"
                                        variant="light"
                                    >
                                        {initials}
                                    </Avatar>

                                    <Box>
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                        >
                                            Welcome back
                                        </Text>

                                        <Title
                                            order={1}
                                            size="h2"
                                            fw={600}
                                        >
                                            Hello, {user.first_name}
                                        </Title>
                                    </Box>
                                </Group>

                                <Button
                                    type="button"
                                    color="dark"
                                    radius="xl"
                                    size="md"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </Button>
                            </Group>
                        </Paper>


                        {/* Dashboard heading */}
                        <Box>
                            <Title order={2} size="h3">
                                My Dashboard
                            </Title>

                            <Text
                                c="dimmed"
                                size="sm"
                                mt="xs"
                            >
                                Welcome to your personal
                                account dashboard.
                            </Text>
                        </Box>


                        {/* Dashboard content */}
                        <SimpleGrid
                            cols={{ base: 1, md: 2 }}
                            spacing="lg"
                        >

                            {/* Account information */}
                            <Paper
                                withBorder
                                shadow="xs"
                                radius="xl"
                                p="xl"
                            >
                                <Stack gap="md">

                                    <Title order={3} size="h4">
                                        Account Information
                                    </Title>

                                    <Divider />

                                    <Group
                                        justify="space-between"
                                        align="start"
                                        wrap="wrap"
                                    >
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                        >
                                            Full name
                                        </Text>

                                        <Text fw={500}>
                                            {fullName}
                                        </Text>
                                    </Group>

                                    <Divider />

                                    <Group
                                        justify="space-between"
                                        align="start"
                                        wrap="wrap"
                                    >
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                        >
                                            Email address
                                        </Text>

                                        <Text
                                            fw={500}
                                            style={{
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {user.email}
                                        </Text>
                                    </Group>


                                </Stack>
                            </Paper>

                            {/* Future dashboard features */}
                            <Paper
                                withBorder
                                shadow="xs"
                                radius="xl"
                                p="xl"
                            >
                                <Stack gap="md">

                                    <Title order={3} size="h4">
                                        What's Next?
                                    </Title>

                                    <Divider />

                                    <Text
                                        size="sm"
                                        c="dimmed"
                                    >
                                        Your dashboard is ready
                                        for future features.
                                    </Text>

                                    <Text
                                        size="sm"
                                        c="dimmed"
                                    >
                                        For now, you can view
                                        your account information
                                        and securely log out.
                                    </Text>


                                </Stack>
                            </Paper>


                        </SimpleGrid>

                    </Stack>
                )}

            </Container>
        </Box>
    );
}

export default DashboardPage