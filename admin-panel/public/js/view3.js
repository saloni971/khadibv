document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", function () {
            const userId = this.getAttribute("data-id"); // Get user ID
            deleteUser(userId);
        });
    });
});

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const response = await fetch(`/delete-customer/${userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            alert("User deleted successfully");
            location.reload(); // Refresh page to update table
        } else {
            alert("Failed to delete user");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
    }
}
