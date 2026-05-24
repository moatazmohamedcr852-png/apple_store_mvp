document.addEventListener('DOMContentLoaded', () => {

    /* ================== SIGNUP ================== */
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const phone = document.getElementById('signupPhone').value;

            try {
                const response = await fetch('/api/user/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, phone }),
                });

                const data = await response.json();
                if (!response.ok) {
                    const errorMessage =
                        data.errorDetails?.map(e => `${e.field}: ${e.message}`).join(", ") ||
                        data.message ||
                        "Signup failed";
                    throw new Error(errorMessage);
                }
                alert(data.message);

                bootstrap.Modal.getInstance(
                    document.getElementById('signupModal')
                )?.hide();

                new bootstrap.Modal(
                    document.getElementById('loginModal')
                ).show();

            } catch (err) {
                const registerstate = document.getElementById('Register-state');
                if (registerstate) {
                    registerstate.textContent = err;
                    registerstate.style.color = 'red';
                }
            }
        });
    }

    /* ================== LOGIN ================== */
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('/api/user/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!response.ok) {
                    const errorMessage =
                        data.errorDetails?.map(e => `${e.field}: ${e.message}`).join(", ") ||
                        data.message ||
                        'Invalid email or password';
                    throw new Error(errorMessage);
                }

                const data = await response.json();

                bootstrap.Modal.getInstance(
                    document.getElementById('loginModal')
                )?.hide();
                localStorage.setItem('token', data.token);
                updateNavbarAuth();
                showLoginToast(`Hello again, ${data.data.name}!`);

            } catch (err) {
                const loginstate = document.getElementById('Login-state');
                if (loginstate) {
                    loginstate.textContent =
                        "Login failed, please check your credentials.";
                    loginstate.style.color = 'red';
                }
                console.error(err);
            }
        });
    }

    ////forget password ya 3nter
    const otpForm = document.getElementById('otpForm');
    if (!otpForm) return;

    const emailStep = document.getElementById('emailStep');
    const otpStep = document.getElementById('otpStep');
    const state = document.getElementById('otpState');
    const changePasswordStep = document.getElementById('changePasswordStep');

    let cachedEmail = '';
    let cachedToken = null;

    // Send OTP
    const sendOtpBtn = emailStep.querySelector('button');
    sendOtpBtn?.addEventListener('click', async () => {
        const emailInput = document.getElementById('otpEmail');
        const email = emailInput.value.trim();
        if (!email) {
            state.textContent = "Please enter your email.";
            state.style.color = "red";
            return;
        }

        try {
            const response = await fetch('/api/user/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Failed to send OTP");

            cachedEmail = email;
            emailStep.classList.add('d-none');
            otpStep.classList.remove('d-none');
            state.textContent = data.message;
            state.style.color = "green";

        } catch (err) {
            state.textContent = err.message || "Something went wrong.";
            state.style.color = "red";
            console.error(err);
        }
    });

    // Verify OTP
    const verifyOtpBtn = otpStep.querySelector('button');
    verifyOtpBtn?.addEventListener('click', async () => {
        const otpInput = document.getElementById('otpCode');
        const otp = otpInput.value.trim();

        if (!otp) {
            state.textContent = "Please enter the OTP.";
            state.style.color = "red";
            return;
        }

        try {
            const response = await fetch('/api/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cachedEmail, otp }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Invalid OTP");
            cachedToken = data.resetToken;
            otpStep.classList.add('d-none');
            changePasswordStep.classList.remove('d-none');
            state.textContent = "OTP verified! Please enter your new password.";
            state.style.color = "green";
            // Redirect to reset password page
            // window.location.href = `/reset-password.html?email=${encodeURIComponent(cachedEmail)}`;

        } catch (err) {
            state.textContent = err.message || "Something went wrong.";
            state.style.color = "red";
            console.error(err);
        }
    });


    // Step 3: Change Password

    const changePasswordBtn = document.getElementById('changePasswordBtn');

    changePasswordBtn?.addEventListener('click', async () => {
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!newPassword || !confirmPassword) {
            state.textContent = "Please fill in all password fields.";
            state.style.color = "red";
            return;
        }

        if (newPassword !== confirmPassword) {
            state.textContent = "Passwords do not match.";
            state.style.color = "red";
            return;
        }

        try {
            const response = await fetch('/api/user/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cachedEmail, newPassword, resetToken: cachedToken }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Failed to change password");
            if (!cachedToken) {
                throw new Error(data.message || " Session expired. Please restart password reset.");
            }
            state.textContent = "Password changed successfully!";
            state.style.color = "green";
            // Optionally redirect to login page
            setTimeout(() => {
                resetOtpFlow();
            }, 1500);


        } catch (err) {
            state.textContent = err.message || "Something went wrong.";
            state.style.color = "red";
            console.error(err);
        }
    });
});
function resetOtpFlow() {
    // Reset cached values
    cachedEmail = '';
    cachedToken = null;

    // Show first step
    emailStep.classList.remove('d-none');

    // Hide other steps
    otpStep.classList.add('d-none');
    changePasswordStep.classList.add('d-none');

    // Clear message
    state.textContent = '';
    state.style.color = '';

    // Clear all inputs
    otpForm.reset();
}
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
forgotPasswordModal.addEventListener('hidden.bs.modal', () => {
    resetOtpFlow();
});


/* ================== TOAST ================== */
function showLoginToast(message) {
    const toastEl = document.getElementById('loginToast');
    if (!toastEl) return;

    toastEl.querySelector('.toast-body').textContent = message;
    new bootstrap.Toast(toastEl, { delay: 2000 }).show();
}
