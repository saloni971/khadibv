document.addEventListener('DOMContentLoaded', () => {
    const removeButtons = document.querySelectorAll('.remove-btn');

    removeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const itemId = event.target.getAttribute('data-id'); // Get the item ID

            try {
                // Send a DELETE request to the server
                const response = await fetch(`/cart/remove/${itemId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    const data = await response.json();

                    const cartItem = event.target.closest('.cart-item');
                    const quantityElement = cartItem.querySelector('.quantity');

                    if (data.remove) {
                        // If the item is completely removed, remove it from the DOM
                        cartItem.remove();
                    } else {
                        // Update quantity in the UI
                        quantityElement.textContent = `Quantity: ${data.cartItem.quantity}`;
                    }

                    // Update the total price
                    updateTotalPrice();
                } else {
                    console.error('Failed to remove item from cart');
                }
            } catch (error) {
                console.error('Error removing item from cart:', error);
            }
        });
    });

    // Function to update the total price
    function updateTotalPrice() {
        const cartItems = document.querySelectorAll('.cart-item');
        let totalPrice = 0;

        cartItems.forEach(item => {
            const price = parseFloat(item.querySelector('.price').textContent.replace('Price: ₹', ''));
            const quantity = parseInt(item.querySelector('.quantity').textContent.replace('Quantity: ', ''));
            totalPrice += price * quantity;
        });

        // Update the total price in the DOM
        document.getElementById('total-price').textContent = `Total Price: ₹${totalPrice.toFixed(2)}`;
    }
});
