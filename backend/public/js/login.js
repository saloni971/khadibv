document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Send the login request to the server
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }), // Send email and password as JSON
        });

        // Parse the response
        const data = await response.json();

        // Debugging: Log the response data
        console.log("Login response data:", data);

        if (response.ok) {
            if (data.userId && data.cartId) {
                sessionStorage.setItem("userId", data.userId); // ✅ Store userId
                sessionStorage.setItem("cartId", data.cartId); // ✅ Store cartId
                
                console.log("Stored userId:", sessionStorage.getItem("userId"));
                console.log("Stored cartId:", sessionStorage.getItem("cartId"));

                // Redirect to homepage or dashboard after login
                window.location.href = data.redirect;
            } else {
                console.error("No cartId received from the server."); // Log if cartId is missing
            }
            window.location.href = data.redirect; // Redirect to the specified URL
        } else {
            // Show error message if login fails
            alert(data.error || "Login failed. Please try again.");
        }
    } catch (err) {
        console.error('Error during login:', err); // Log any errors
        alert('An error occurred. Please try again later.');
    }
});