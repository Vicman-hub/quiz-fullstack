
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageEl = document.getElementById('loginMessage');
    
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    const API_BASE = window.APP_CONFIG.API_BASE;
    // Then use ${API_BASE}/signup/, ${API_BASE}/login/, etc.

    btn.disabled = true;
    btn.textContent = "Logging in…";

    try {

        const response = await fetch(`${API_BASE}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',          // <-- required to store the cookies
            body: JSON.stringify({
                username: document.getElementById('loginUsername').value,
                password: document.getElementById('password').value   // id fixed earlier
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Optional: If your Django API returns an auth token, save it here
            // localStorage.setItem('token', data.token);

            messageEl.style.color = "green";
            messageEl.textContent = "Login successful! Loading dashboard...";
            
            // Redirect to your dashboard page
             // Wait 1.5 seconds (1000 milliseconds) before redirecting
            setTimeout(() => {
               window.location.href = 'quiz.html'; 
            }, 1000);
           
        } else {
            messageEl.style.color = "red";
            messageEl.textContent = data.error || "Invalid credentials.";
        }
    } catch (error) {
            console.error("Login error:", error);
            messageEl.style.color = "red";
        if (error instanceof TypeError) {
            messageEl.textContent = "App error: a form field or element is missing.";
        } else {
            messageEl.textContent = "Network error. Make sure the backend is running.";
        }
    }finally {
            btn.disabled = false;
            btn.textContent = original;
    }
});





const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';

    passwordInput.type = isHidden ? 'text' : 'password';
    togglePassword.classList.toggle('fa-eye', !isHidden);
    togglePassword.classList.toggle('fa-eye-slash', isHidden);
});


const pwdInput = document.getElementById('password');
const pwdRule = document.getElementById('passwordRule');

if (pwdInput && pwdRule) {
    const updatePasswordRule = () => {
        const longEnough = pwdInput.value.length >= 8;

        pwdRule.classList.toggle('show', pwdInput.value.length > 0);
        pwdRule.classList.toggle('valid', longEnough);
        pwdRule.classList.toggle('invalid', pwdInput.value.length > 0 && !longEnough);
    };

    pwdInput.addEventListener('input', updatePasswordRule);
    pwdInput.addEventListener('focus', updatePasswordRule);
}






