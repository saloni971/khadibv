document.addEventListener("DOMContentLoaded", async function () {
    const ordersContainer = document.querySelector(".orders-container");
    
    if (!ordersContainer) {
        console.error("Error: .orders-container not found in the DOM.");
        return;
    }

    try {
        console.log("Fetching orders...");
        const response = await fetch("/api/myorders", { // Change this line
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.orders || data.orders.length === 0) {
            ordersContainer.innerHTML = "<p>No orders found.</p>";
            return;
        }

        ordersContainer.innerHTML = "<h2>My Orders</h2>"; // Ensure header is shown

        data.orders.forEach((order) => {
            let orderHTML = `<div class="order-card">`;

            order.cartItems.forEach((item) => {
                const productImage = item.productID?.images?.[0] || "default.jpg"; // Handle missing images
                orderHTML += `
                    <div class="order-item">
                        <img src="/images/${productImage}" alt="${item.name}" class="order-image" />
                        <div class="order-details">
                            <h3>${item.name}</h3>
                            <p>Order #${order.orderID} | Placed on ${new Date(order.orderDate).toDateString()}</p>
                            <p>Quantity: ${item.quantity} | ₹${item.price} each</p>
                            <p><b>Total: ₹${order.totalAmount}</b></p>
                            <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                        </div>
                    </div>`;
            });

            orderHTML += `
                <div class="order-actions">
                    <button class="view-details">View Details</button>
                    ${
                        order.status === "Delivered"
                            ? `<button>Download Invoice</button>`
                            : `<button>Track Order</button>`
                    }
                </div>
            </div>`;

            ordersContainer.innerHTML += orderHTML; // Append, not replace
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        ordersContainer.innerHTML = `<p>Error loading orders. Please try again later.</p>`;
    }
});