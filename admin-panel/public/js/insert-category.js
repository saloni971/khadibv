document.getElementById("category-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Create a FormData object to handle file uploads
    const formData = new FormData(event.target);

    try {
        const response = await fetch("/insert-category", {
            method: "POST",
            body: formData, // Send the form data
        });

        if (response.ok) {
            alert("Category inserted successfully!");
            window.location.href = "/view-category"; // Redirect to the category view page
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred while submitting the form.");
    }
});
