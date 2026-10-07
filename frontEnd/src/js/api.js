const API_BASE = window.ENV?.API_BASE;

if (!API_BASE) {
    throw new Error(
        "API_BASE is not configured. Check config.js."
    );
}

function getErrorMessage(data, status) {
    const detail = data?.detail;

    // Standard FastAPI HTTPException response
    if (typeof detail === "string") {
        return detail;
    }

    // FastAPI/Pydantic validation errors
    if (Array.isArray(detail)) {
        const messages = detail
            .map((error) => error?.msg)
            .filter(Boolean);
        
        if (messages.length > 0) {
            return messages.join(" ");
        }
    }

    return `Request failed (${status}).`;
}


async function apiFetch(
    path,
    {
        method = "GET",
        body,
        token,
    } = {}
) {
    const headers = {};

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(
            `${API_BASE}${path}`,
            {
                method,
                headers,
                body: body !== undefined
                    ? JSON.stringify(body)
                    : undefined,
                credentials: "omit",
            }
        );
    } catch (cause) {
        const error = new Error(
            "Unable to connect to the server. Please try again."
        );

        // status 0 represents a network-level failure,
        // not an HTTP response from the backend.
        error.status = 0;
        error.cause = cause;

        throw error;
    }

    let data = null;

    const contentType =
        response.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
        try {
            data = await response.json();
        } catch {
            // Invalid or empty JSON response.
        }
    }

    if (!response.ok) {
        const error = new Error(
            getErrorMessage(
                data,
                response.status
            )
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}