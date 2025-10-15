// Helpers 
const $ = (sel, root = document) => root.querySelector(sel);
const form = $('#loginForm');

const inputs = {
    email: $('#email'),
    password: $('#password'),
}

const toggleBtn = $('.toggle-pass');
const formError = $('#formError');

const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i
};

function setError(inputEl, message='') {
    const group = inputEl.closest('.form-group');
    const errId = inputEl.getAttribute('aria-describedby');
    if(!group || !errId) return;
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
    validateField(inputs.email);
    validateField(inputs.password);
    return !form.querySelector('.has-error input');
}

// Inline validation
['blur', 'input'].forEach(evt => {
    inputs.email.addEventListener(evt, e => validateField(e.target));
    inputs.password.addEventListener(evt, e => validateField(e.target));
});

// Password toggle 
toggleBtn.addEventListener('click', () => {
    const isText = inputs.password.type === 'text';
    const nowOn = !isText;
    inputs.password.type = nowOn ? 'text' : 'password';
    toggleBtn.classList.toggle('is-on', nowOn);
    toggleBtn.setAttribute('aria-pressed', String(nowOn));
    toggleBtn.setAttribute('aria-label', nowOn ? 'Hide password' : 'Show password');
});

// Initialize ARIA state 
(function initPasswordToggleState() {
    const visible = inputs.password.type === 'text';
    toggleBtn.classList.toggle('is-on', visible);
    toggleBtn.setAttribute('aria-pressed', String(visible));
    toggleBtn.setAttribute('aria-label', visible ? 'Hide Password' : 'Show password');
})();

// Submit 
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) {
        const firstBadLabel = form.querySelector('.has-error label')?.textContent?.trim() || 'form';
        formError.textContent = `Please correct the highlighted fields. First issue: ${firstBadLabel}.`;
        form.querySelector('.has-error input')?.focus();
        return;
    }
    formError.textContent = '';
    const payload = { email: inputs.email.value.trim() };
    console.log('Login payload (demo):', payload);
    alert('Logged in! (frontend demo)');
});

// Clear sensitive information on load/BFCache restore
function clearSensitive() {
    inputs.password.value = '';
    inputs.password.type = 'password';
    toggleBtn.classList.remove('is-on');
    toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn.setAttribute('aria-label', 'Show password');
}
document.addEventListener('DOMContentLoaded', clearSensitive);
window.addEventListener('pageshow', (e) => { if (e.persisted) clearSensitive(); });