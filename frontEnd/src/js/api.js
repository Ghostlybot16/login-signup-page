const API_BASE = window.ENV?.API_BASE;

if (!API_BASE) {
    throw new Error(
        "API_BASE is not configured. Check config.js."
    );
}


async function apiFetch(
    path,
    {
        method = "GET",
        body,
        token,
    } = {}
) {
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE}${path}`,
        {
            method,
            headers,
            body: body
                ? JSON.stringify(body)
                : undefined,
            credentials: "omit",
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        // Response did not contain JSON.
    }

    if (!response.ok) {
        const message =
            data?.detail
            || `Request failed (${response.status})`;

        const error = new Error(message);

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}