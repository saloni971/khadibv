document.getElementById("login-button").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email && password) {
        
        alert("Login Successful!");

      
        document.getElementById("login-section").style.display = "none";
        document.getElementById("security-section").style.display = "block";
    } else {
        alert("Please enter valid login credentials.");
    }
});

document.getElementById("submit-security-button").addEventListener("click", () => {
    const answers = Array.from(document.querySelectorAll("#security-form input"))
        .map((input) => input.value.trim())
        .filter((value) => value !== "");

    if (answers.length >= 2) {
        alert("Security questions answered successfully!");
        window.location.href = "homepage.html"; 
    } else {
        alert("Please answer at least two security questions.");
    }
});
