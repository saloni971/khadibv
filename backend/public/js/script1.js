document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === "test@khadibv.in" && password === "password123") {
        alert("Login successful! Welcome to Khadibv.");
        // Redirect to another page or dashboard
        window.location.href = 'script2.html';
    } else {
        alert("Invalid login credentials. Please try again.");
    }
});
