// Helpers 
const $ = (sel, root = document) => root.querySelector(sel);
const form = $('#signupForm');

const inputs = {
    firstName: $('#firstName'),
    lastName: $('#lastName'),
    email: $('#email'),
    password: $('#password'),
    terms: $('#terms'),
};

const btnSubmit = $('.btn-primary');
const toggleBtn = $('.toggle-pass');
const formError = document.getElementById('formError');

const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i
}

function setError(inputEl, message = '') {
    const group = inputEl.closest('.form-group');
    const errId = inputEl.getAttribute('aria-describedby');
    if (!group || !errId) return;

    const errEl = document.getElementById(errId);
    if (message) {
        group.classList.add('has-error');
        inputEl.setAttribute('aria-invalid', 'true');
        if (errEl) errEl.textContent = message;
    } else {
        group.classList.remove('has-error');
        inputEl.removeAttribute('aria-invalid');
        if (errEl) errEl.textContent = '';
    }
}

function validateField(inputEl) {
    const id = inputEl.id;
    const val = inputEl.value.trim();

    if (id === 'firstName' || id === 'lastName'){
        if (!val) return setError(inputEl, 'This field is required.');
        return setError(inputEl);
    }

    if (id === 'email') {
        if (!val) return setError(inputEl, 'Email is required.');
        if (!patterns.email.test(val)) return setError(inputEl, 'Enter a valid email address.');
        return setError(inputEl);
    }

    if (id === 'password') {
        if (!val) return setError(inputEl, 'Password is required.');
        if (val.length < 8) return setError(inputEl, 'Use at least 8 characters.');
        return setError(inputEl);
    }
}

function validateForm() {
    validateField(inputs.firstName);
    validateField(inputs.lastName);
    validateField(inputs.email);
    validateField(inputs.password);

    const firstInvalid = form.querySelector('.has-error input');
    return !firstInvalid;
}

// Inline validation 
['blur', 'input'].forEach(evt => {
    inputs.firstName.addEventListener(evt, e => validateField(e.target));
    inputs.lastName.addEventListener(evt, e => validateField(e.target));
    inputs.email.addEventListener(evt, e => validateField(e.target));
    inputs.password.addEventListener(evt, e => validateField(e.target));
});


// Disable submit until terms checked 
function updateSubmitState() {
    const enabled = inputs.terms.checked;
    btnSubmit.disabled = !enabled;
}
inputs.terms.addEventListener('change', updateSubmitState);
updateSubmitState();

// Password show/hide
toggleBtn.addEventListener('click', () => {
    if (!inputs.password) return;

    const isText = inputs.password.type === 'text';
    const nowOn = !isText; // "on" means password is visible

    inputs.password.type = nowOn ? 'text' : 'password';
    toggleBtn.classList.toggle('is-on', nowOn);
    toggleBtn.setAttribute('aria-pressed', String(nowOn));
    toggleBtn.setAttribute('aria-label', nowOn ? 'Hide password' : 'Show password');
});

// Ensure ARIA matches the current input type 
(function initPasswordToggleState() {
    if (!inputs.password || !toggleBtn) return;
    const visible = inputs.password.type === 'text';
    toggleBtn.classList.toggle('is-on', visible);
    toggleBtn.setAttribute('aria-pressed', String(visible));
    toggleBtn.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
})();

function setLoading(on) {
    btnSubmit.disabled = on || !inputs.terms.checked;
    btnSubmit.classList.toggle('is-loading', on);
}

// Submit handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = validateForm();

    if (!ok) {
        if (formError) {
            const firstBadLabel = form.querySelector('.has-error label')?.textContent?.trim() || 'form';
            formError.textContent = `Please correct the highlighted fields. First issue: ${firstBadLabel}.`;
        }
        form.querySelector('.has-error input')?.focus();
        return;
    } else {
        if (formError) formError.textContent = ''; // Clear banner on success
    }

    const payload = {
        first_name: inputs.firstName.value.trim(),
        last_name: inputs.lastName.value.trim(),
        email: inputs.email.value.trim().toLowerCase(),
        password: inputs.password.value,
    };
    
    setLoading(true);
    try {
        // POST to FastAPI
        await apiFetch("/api/users/signup", { method: "POST", body: payload });

        // Success UX: route to login 
        window.location.href = "./login.html?signup=success";
    } catch (err) {
        // Backend may send {"detail": "..."} or 400 for duplicate email
        if (err.status === 400 && err.data?.detail?.toLowerCase().includes("email")) {
            setError(inputs.email, "An account with this email already exists.");
            inputs.email.focus();
        } else {
            formError.textContent = err.message || "Signup failed. Please try again."
        }
    } finally {
        setLoading(false);
    }

});

// Clear sensitive fields on load or when page is restored from bfcache (back/forward)
function clearSensitive(){
    if (inputs.password) {
        inputs.password.value = '';
        
        // Make sure it's back to password mode and the toggle is reset
        inputs.password.type = 'password';
        if (toggleBtn) {
            toggleBtn.classList.remove('is-on');
            toggleBtn.setAttribute('aria-pressed', 'false');
            toggleBtn.setAttribute('aria-label', 'Show password');
        }
    }
    if (inputs.terms) inputs.terms.checked = false;
    
    updateSubmitState();
}

document.addEventListener('DOMContentLoaded', clearSensitive);
window.addEventListener('pageshow', (e) => {
    if (e.persisted) clearSensitive();
});
