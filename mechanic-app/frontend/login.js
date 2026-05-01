document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginform').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('USERNAME').value;
        const password = document.getElementById('PASSWORD').value;

        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            console.log('Login response:', data);
            sessionStorage.setItem('loggedInUser', JSON.stringify(data));
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('Login failed. Please check your credentials and try again.');
        });
    });
});