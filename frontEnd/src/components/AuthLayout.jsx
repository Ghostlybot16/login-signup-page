import { Box, Paper } from "@mantine/core";

import companyLogo from "../../assets/images/company_logo.png";
import loginSplash from "../../assets/images/login_splashart.webp";
import signupSplash from "../../assets/images/signup_splashart.webp";

import styles from "./AuthLayout.module.css";

function AuthLayout({ variant = "login", children }) {
    const isLogin = variant === "login";

    const backgroundImage = isLogin
        ? loginSplash
        : signupSplash;
    
    const backgroundPosition = isLogin
        ? "50% 18%"
        : "center";
    
    return (
        <Box className={styles.page}>
            <a
                className={styles.skipLink}
                href="#auth-form"
            >
                Skip to main content
            </a>

            <Paper
                component="main"
                className={styles.container}
                radius="xl"
                shadow="xl"
            >
                {/* Left branding panel */}
                <Box
                    className={styles.imagePanel}
                    style={{
                        backgroundImage: `url("${backgroundImage}")`,
                        backgroundPosition,
                    }}
                >
                    <img
                        src={companyLogo}
                        alt="Company Logo"
                        className={styles.logo}
                    />
                </Box>

                {/* Right authentication panel */}
                <Box
                    component="section"
                    id="auth-form"
                    tabIndex={-1}
                    className={styles.formPanel}
                >
                    <Box className={styles.formContent}>
                        {children}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default AuthLayout;