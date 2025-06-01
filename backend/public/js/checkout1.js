async function fetchSavedAddress() {
    try {
        const response = await fetch("/get-saved-address");
        const data = await response.json();

        console.log("API Response:", data); // Debugging log ✅

        if (data.savedAddress && Object.keys(data.savedAddress).length > 0) {
            console.log("Saved Address Found:", data.savedAddress); // ✅ Debugging log

            document.getElementById("saved-name").textContent = data.savedAddress.name;
            document.getElementById("saved-address").textContent = data.savedAddress.address;
            document.getElementById("saved-pincode").textContent = data.savedAddress.pincode;
            document.getElementById("saved-city").textContent = data.savedAddress.city;
            document.getElementById("saved-state").textContent = data.savedAddress.state;

            document.getElementById("saved-address-box").style.display = "block";
            document.getElementById("address-form").style.display = "none";
        } else {
            console.warn("No saved address found. Showing form."); // ❌ Debugging log
            document.getElementById("address-form").style.display = "block";
        }
    } catch (error) {
        console.error("Error fetching saved address:", error);
    }
}

async function saveAddress(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();

    if (!name || !address || !pincode || !city || !state) {
        alert("Please fill all the address fields.");
        return;
    }

    try {
        const response = await fetch("/save-address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, address, pincode, city, state }),
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById("saved-name").textContent = name;
            document.getElementById("saved-address").textContent = address;
            document.getElementById("saved-pincode").textContent = pincode;
            document.getElementById("saved-city").textContent = city;
            document.getElementById("saved-state").textContent = state;

            document.getElementById("saved-address-box").style.display = "block";
            document.getElementById("address-form").style.display = "none";
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error saving address:", error);
        alert("Failed to save address. Please try again.");
    }
}

// ✅ Make editAddress global so it works in HTML onclick
function editAddress() {
    document.getElementById("saved-address-box").style.display = "none";
    document.getElementById("address-form").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
    let currentStep = 1;

    function showStep(step) {
        document.querySelectorAll(".step").forEach(s => s.style.display = "none");
        document.getElementById(`step${step}`).style.display = "block";
    }

    function goToNextStep(nextStep) {
        currentStep = nextStep;
        showStep(nextStep);
    }

    async function placeOrder() {
        const name = document.getElementById("saved-name").textContent.trim();
        const address = document.getElementById("saved-address").textContent.trim();
        const pincode = document.getElementById("saved-pincode").textContent.trim();
        const city = document.getElementById("saved-city").textContent.trim();
        const state = document.getElementById("saved-state").textContent.trim();
        const paymentMethod = document.querySelector("input[name='payment']:checked")?.value || "";

        if (!name || !address || !pincode || !city || !state || !paymentMethod) {
            alert("Please fill in all required fields.");
            return;
        }

        const cartItems = [];
        document.querySelectorAll(".order-item").forEach(item => {
            const productID = item.getAttribute("data-product-id"); // Assuming you have a data attribute for product ID
            cartItems.push({
                productID, // Add productID here
                name: item.querySelector("strong").textContent.trim(),
                quantity: parseInt(item.querySelectorAll("p")[1].textContent.replace("Quantity: ", "").trim()),
                price: parseFloat(item.querySelectorAll("p")[2].textContent.replace("Price: ₹", "").trim()),
            });
        });

        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const totalAmount = parseFloat(document.getElementById("final-price").textContent.trim()) || 0;

        const orderData = { name, address, pincode, city, state, cartItems, totalAmount, paymentMethod };

        try {
            const response = await fetch("/place-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            let data;
            try {
                data = await response.json();
            } catch (err) {
                throw new Error("Invalid server response. Please try again.");
            }

            if (response.ok) {
                alert(`Order placed successfully!\nOrder ID: ${data.orderID}`);
                window.location.href = `/order-confirmation?orderID=${data.orderID}`;
            } else {
                alert("Order failed: " + (data.error || "Unknown error occurred."));
            }
        } catch (error) {
            alert("Error placing order. Please try again.");
            console.error("Order placement error:", error);
        }
    }

    showStep(1);
    fetchSavedAddress(); // ✅ Now accessible globally

    document.querySelector("#address-form .continue-btn").addEventListener("click", saveAddress);
    document.querySelector("#step2 .continue-btn").addEventListener("click", () => goToNextStep(3));
    document.getElementById("placeOrderBtn").addEventListener("click", placeOrder);
    document.querySelectorAll("input[name='payment']").forEach(radio => {
        radio.addEventListener("change", () => {
            document.getElementById("placeOrderBtn").disabled = false;
        });
    });
});
