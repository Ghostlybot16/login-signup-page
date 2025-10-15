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
        if (errEl) errEl.textContent = message;
    } else {
        group.classList.remove('has-error');
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
    inputs.password.type = isText ? 'password' : 'text';
    toggleBtn.classList.toggle('is-on', !isText);
    toggleBtn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
});

// Submit handler
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = validateForm();
    if (!ok) {
        const firstInvalid = form.querySelector('.has-error input');
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const payload = {
        firstName: inputs.firstName.value.trim(),
        lastName: inputs.lastName.value.trim(),
        email: inputs.email.value.trim(),
    };
    console.log('Signup payload (demo):', payload);
    alert('Account created! (frontend demo)');

});