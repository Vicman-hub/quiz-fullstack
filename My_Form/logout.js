
const API_BASE = window.APP_CONFIG.API_BASE;
// Then use ${API_BASE}/signup/, ${API_BASE}/login/, etc.


document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // Call the Django logout endpoint to clear the HttpOnly cookie
                const response = await fetch(`${API_BASE}/logout/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' // Crucial: ensures the cookie is sent to be cleared
                });

                if (response.ok) {
                    window.location.href = 'new_login.html';
                } else {
                    console.error('Logout failed');
                    // Force redirect anyway for safety
                    window.location.href = 'new_login.html'; 
                }
            } catch (error) {
                console.error("Network error during logout:", error);
                window.location.href = 'new_login.html'; 
            }
        });
    }
});