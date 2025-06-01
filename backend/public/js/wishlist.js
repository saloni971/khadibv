document.addEventListener('DOMContentLoaded', () => {
    const moveToCartButtons = document.querySelectorAll('.move-to-cart');

    moveToCartButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const itemId = event.target.getAttribute('data-id');
            console.log("Attempting to move item to cart. Item ID:", itemId); // Debugging

            try {
                const response = await fetch(`/wishlist/move-to-cart/${itemId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Remove the item from the wishlist UI
                    const productCard = event.target.closest('.product-card');
                    productCard.remove();
                    alert('Item moved to cart successfully!');
                } else {
                    const errorData = await response.json();
                    alert(errorData.msg || 'Failed to move item to cart.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while moving the item to cart.');
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const removeItemButtons = document.querySelectorAll('.remove-item');

    removeItemButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const itemId = event.target.getAttribute('data-id');

            try {
                const response = await fetch(`/wishlist/remove/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Remove the item from the wishlist UI
                    const productCard = event.target.closest('.product-card');
                    productCard.remove();
                    alert('Item removed from wishlist successfully!');
                } else {
                    alert('Failed to remove item from wishlist.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while removing the item from wishlist.');
            }
        });
    });
});