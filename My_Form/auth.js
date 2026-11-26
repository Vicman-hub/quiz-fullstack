
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const messageSign = document.getElementById('registerMessage');
 
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    const API_BASE = window.APP_CONFIG.API_BASE;
    
// Then use ${API_BASE}/signup/, ${API_BASE}/login/, etc.

    btn.disabled = true;
    btn.textContent = "Creating account…";
    
    try {
        const response = await fetch(`${API_BASE}/signup/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: document.getElementById('firstname').value,
                last_name: document.getElementById('lastname').value,
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                phone_number: document.getElementById('phone').value, // Send new field
                password: document.getElementById('password').value
            })
        });
         
        const data = await response.json();
        
        if (response.ok) {
            messageSign.style.color = "green";
            messageSign.textContent = data.message;
            document.getElementById('registerForm').reset();

            // Wait 1 seconds (1000 milliseconds) before redirecting
            setTimeout(() => {
                window.location.href = 'new_login.html';
            }, 1000);
        } else {
            messageSign.style.color = "red";
            // Display the specific security/validation error from the serializer
            const firstErrorKey = Object.keys(data)[0];
            messageSign.textContent = `${firstErrorKey}: ${data[firstErrorKey][0]}`;
        }
    } catch (error) {
        messageSign.style.color = "red";
        messageSign.textContent = "Network error. Make sure the backend is running.";
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











// // 1. Handle Signup
// document.getElementById('signupForm').addEventListener('submit', async (e) => {
//     e.preventDefault(); 
    
//     const messageEl = document.getElementById('signupMessage');
//     messageEl.textContent = 'Processing...';

//     const response = await fetch('http://localhost:8000/api/signup/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             username: document.getElementById('signUsername').value,
//             password: document.getElementById('signPassword').value
//         })
//     });
    
//     const data = await response.json();
    
//     if (response.ok) {
//         messageEl.style.color = "green";
//         messageEl.textContent = data.message;
//         document.getElementById('signupForm').reset();
//     } else {
//         messageEl.style.color = "red";
//         // Extract the first error message returned by the DRF serializer
//         const firstErrorKey = Object.keys(data)[0];
//         const errorMessage = data[firstErrorKey][0]; 
//         messageEl.textContent = `${firstErrorKey}: ${errorMessage}`;
//     }
// });

