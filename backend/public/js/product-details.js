document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                document.getElementById('product-title').textContent = product.name;
                document.getElementById('product-description').textContent = product.description;
                document.getElementById('product-price').textContent = `₹${product.price}`;
                document.getElementById('main-image').src = `/images/${product.images[0]}`;

                const thumbnailsContainer = document.getElementById('image-thumbnails');
                product.images.forEach(image => {
                    const img = document.createElement('img');
                    img.src = `/images/${image}`;
                    img.alt = product.name;
                    thumbnailsContainer.appendChild(img);
                });

                document.getElementById('add-to-cart-btn').onclick = () => addToCart(product._id);
                document.getElementById('add-to-wishlist-btn').onclick = () => addToWishlist(product._id);
            })
            .catch(error => console.error('Error fetching product details:', error));
    }
});

function addToCart(productId) {
    // Add to cart logic
}

function addToWishlist(productId) {
    // Add to wishlist logic
}