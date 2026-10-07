// Helpers 
const $ = (sel, root = document) => root.querySelector(sel);

const form = $("#loginForm");

const inputs = {
    email: $("#email"),
    password: $("#password"),
};

const toggleBtn = $(".toggle-pass");
const formError = $("#formError");

const rememberBox = $("#rememberMe");
const statusEl = $("#loginStatus");
const submitBtn = form.querySelector(".btn-primary");

const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i
};


function showSignupSuccess() {
    const params = new URLSearchParams(
        window.location.search
    );

    if (params.get("signup") !== "success") {
        return;
    }

    if (statusEl) {
        statusEl.textContent =
            "Account created successfully! You can log in now.";
    }
}


function setError(inputEl, message= "") {
    const group = inputEl.closest(".form-group");
    const errId = inputEl.getAttribute(
        "aria-describedby"
    );

    if(!group || !errId) {
        return;  
    } 

    const errEl = document.getElementById(errId);

    if (message) {
        group.classList.add("has-error");
        inputEl.setAttribute(
            "aria-invalid", 
            "true"
        );

        if (errEl){
            errEl.textContent = message;
        } 

        return;
    } 
    group.classList.remove("has-error");
    inputEl.removeAttribute("aria-invalid");
    
    if (errEl) {
        errEl.textContent = "";
    }
}

function validateField(inputEl) {
    const id = inputEl.id;
    const val = inputEl.value.trim();

    if (id === "email") {
        if (!val) {
            return setError(
                inputEl, 
                "Email is required."
            );
        }

        if (!patterns.email.test(val)) {
            return setError(
                inputEl, 
                "Enter a valid email address."
            );
        }

        return setError(inputEl);
    }

    if (id === "password") {
        if (!val) {
            return setError(
                inputEl, 
                "Password is required."
            );
        }
        
        if (val.length < 8) {
            return setError(
                inputEl, 
                "Use at least 8 characters."
            );
        }

        return setError(inputEl);
    }
}


function validateForm() {
    validateField(inputs.email);
    validateField(inputs.password);

    return !form.querySelector(
        ".has-error input"
    );
}


// Inline validation
["blur", "input"].forEach((eventName) => {
    inputs.email.addEventListener(
        eventName, 
        (event) => validateField(event.target)
    );

    inputs.password.addEventListener(
        eventName, 
        (event) => validateField(event.target)
    );
});


// Password toggle 
toggleBtn.addEventListener("click", () => {
    const isText = 
        inputs.password.type === "text";

    const nowOn = !isText;

    inputs.password.type = 
        nowOn ? "text" : "password";

    toggleBtn.classList.toggle(
        "is-on", 
        nowOn
    );

    toggleBtn.setAttribute(
        "aria-pressed", 
        String(nowOn)
    );

    toggleBtn.setAttribute(
        "aria-label", 
        nowOn 
            ? "Hide password" 
            : "Show password"
    );
});


// Initialize ARIA state 
(function initPasswordToggleState() {
    const visible = 
        inputs.password.type === "text";

    toggleBtn.classList.toggle(
        "is-on", 
        visible
    );

    toggleBtn.setAttribute(
        "aria-pressed", 
        String(visible)
    );

    toggleBtn.setAttribute(
        "aria-label", 
        visible 
            ? "Hide Password" 
            : "Show password"
    );
})();

// Restore remembered email if exists
(function restoreRemembered() {
    try {
        const remembered = 
            localStorage.getItem(
                "auth:rememberEmail"
            );

        if (remembered) {
            inputs.email.value = remembered;
            rememberBox.checked = true;
        }
    } catch {
        // localStorage may be unavailable
    }
})();


// Loading helper
function setLoading(on) {
    submitBtn.classList.toggle(
        "is-loading", 
        on
    );

    submitBtn.disabled = on;

    if (statusEl) {
        statusEl.textContent = 
            on ? "Signing you in..." : "";

    } 
}

// Submit 
form.addEventListener(
    "submit", 
    async (event) => {
        event.preventDefault();

    if (!validateForm()) {
        const firstBadLabel = 
            form
                .querySelector(
                    ".has-error label"
                )
                ?.textContent
                ?.trim() 
            || "form";

        formError.textContent = 
            `Please correct the highlighted fields. `
            + `First issue: ${firstBadLabel}.`;

        form
            .querySelector(
                ".has-error input"
            )
            ?.focus();

        return;
    }

    // Remember email
    try {
        if (rememberBox?.checked) {
            localStorage.setItem(
                "auth:rememberEmail", 
                inputs.email.value.trim()
            );
        } else {
            localStorage.removeItem(
                "auth:rememberEmail"
            );
        }
    } catch {
        // localStorage may be unavailable
    }

    formError.textContent = "";
    setLoading(true);

    const payload = {
        email: inputs.email
            .value
            .trim()
            .toLowerCase(),

        password: inputs.password.value,
    };

    try{
        const data = await apiFetch(
            "/api/users/login", 
            { 
                method: "POST", 
                body: payload, 
            }
        );

        // Save JWT for later API calls 
        sessionStorage.setItem(
            "token", 
            data.access_token
        );

        // Redirect to dashboard
        window.location.href = 
            "./dashboard.html";

    }  catch (err) {
        if (err.status === 401) {
            setError(
                inputs.email, 
                "Invalid email or password."
            );

            setError(
                inputs.password, 
                "Invalid email or password."
            );

            formError.textContent = 
                "Invalid credentials. Please try again.";

            inputs.password.focus();
        
        } else if (err.status === 422) {
            formError.textContent =
                err.message
                || "Please check the information you entered.";

        } else if (err.status === 0) {
            formError.textContent =
                err.message
                || "Unable to connect to the server. Please try again.";
        
        } else {
            formError.textContent = 
                err.message 
                || "Login failed. Please try again.";
        }
        
    } finally {
        setLoading(false);
    }
});

// Clear sensitive information on load/BFCache restore
function clearSensitive() {
    inputs.password.value = "";
    inputs.password.type = "password";

    toggleBtn.classList.remove("is-on");

    toggleBtn.setAttribute(
        "aria-pressed", 
        "false"
    );

    toggleBtn.setAttribute(
        "aria-label", 
        "Show password"
    );
}


document.addEventListener(
    "DOMContentLoaded", 
    () => {
        clearSensitive();
        showSignupSuccess();
    }
);

window.addEventListener(
    "pageshow", 
    (event) => { 
        if (event.persisted) {
            clearSensitive(); 
        }
    }
);