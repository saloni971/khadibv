// Change the main image when a thumbnail is clicked
function changeImage(imageSrc) {
  document.getElementById('main-image').src = imageSrc;
}

// Add to Cart functionality
document.getElementById('add-to-cart').addEventListener('click', () => {
  alert('Product added to cart!');
});

// Add to Wishlist functionality
document.getElementById('add-to-wishlist').addEventListener('click', () => {
  alert('Product added to wishlist!');
});

fetch('dataset.json')
  .then(response => response.json())
  .then(product => {
    document.querySelector('h2').textContent = product.name;
    document.getElementById('description').textContent = product.description;
    document.getElementById('price').textContent = `Price: ₹${product.price}`;
    document.getElementById('main-image').src = product.images[0];

    const thumbnails = document.querySelector('.thumbnail-gallery');
    product.images.forEach(image => {
      const img = document.createElement('img');
      img.src = image;
      img.alt = product.name;
      img.onclick = () => changeImage(image);
      thumbnails.appendChild(img);
    });
  })
  .catch(error => console.error('Error loading product data:', error));
