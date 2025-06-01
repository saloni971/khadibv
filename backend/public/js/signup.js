// Handle the navigation between the steps (Step 1 and Step 2)
function goToStep(step) {
    const steps = document.querySelectorAll(".form-step");
    steps.forEach((step) => step.style.display = "none");
    document.getElementById(`step-${step}`).style.display = "block";
}

document.getElementById('signup-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const securityQuestion1 = document.getElementById('security-question-1').value;
    const answer1 = document.getElementById('answer-1').value;
    const securityQuestion2 = document.getElementById('security-question-2').value;
    const answer2 = document.getElementById('answer-2').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    const data = {
        username,
        email,
        password,
        confirmpassword: confirmPassword,
        securityQuestions: [
            { question: securityQuestion1, answer: answer1 },
            { question: securityQuestion2, answer: answer2 }
        ]
    };

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        // ✅ Check if response is JSON before parsing
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "An error occurred.");
        }

        const result = await response.json();
        localStorage.setItem("cartId", result.cartId); // Store cartId
        alert("Signup successful! Redirecting to login...");
        window.location.href = '/login'; // Redirect to login page
    } catch (err) {
        console.error("Error during signup:", err);
        alert(err.message || "An error occurred during signup. Please try again.");
    }
});
