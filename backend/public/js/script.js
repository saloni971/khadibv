async function addToWishlist(productId) {
  try {
      const userId = sessionStorage.getItem("userId"); // Retrieve user ID from session storage
      console.log("Retrieved userId:", userId);

      if (!userId) {
          alert("User ID is missing! Please log in.");
          return;
      }

      const requestBody = { productId, userId };
      console.log("Sending request with payload:", requestBody);

      const response = await fetch("/add-to-wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Server Response:", data);
    } else {
        console.error("Received non-JSON response:", await response.text());
    }

      if (response.ok) {
          alert("Product added to wishlist successfully!");
      } else {
          alert("Failed to add product: " + (data.msg || "Unknown error"));
      }
  } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Something went wrong. Please try again.");
  }
}


// Add to Cart Function (works for both product list & modal)
async function addToCart(productId) {
  try {
      const cartId = sessionStorage.getItem("cartId"); // Ensure cartId is set
      console.log("Retrieved cartId:", cartId);

      if (!cartId) {
          alert("Cart ID is missing! Please log in.");
          return;
      }

      const requestBody = { productId, cartId };
      console.log("Sending request with payload:", requestBody);

      const response = await fetch("/add-to-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Server Response:", data);

      if (response.ok) {
          alert("Product added to cart successfully!");
      } else {
          alert("Failed to add product: " + (data.msg || "Unknown error"));
      }
  } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong. Please try again.");
  }
}

// Scroll to Categories
function scrollToCategory() {
  document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search-bar input");
  const searchButton = document.getElementById("search-icon");
  const suggestionsBox = document.createElement("ul"); 
  suggestionsBox.classList.add("suggestions-box");
  document.body.appendChild(suggestionsBox); 

  // Define products & keywords
  const categories = {
      "kurti": ["/kurti", ["long kurti", "women kurti", "stylish kurti", "cotton kurti", "printed kurti", "embroidered kurti"]],
      "saree": ["/saree", ["silk saree", "cotton saree", "party saree", "wedding saree"]],
      "pants": ["/pants", ["cotton pants", "formal pants", "casual pants"]],
      "uniforms": ["/uniforms", ["school uniforms", "hospital uniforms"]],
      "bedsheets": ["/bedsheets", ["cotton bedsheets", "printed bedsheets"]],
      "bags": ["/bags", ["handbags", "shoulder bags", "laptop bags"]],
  };

  function findCategory(query) {
      for (let category in categories) {
          if (query.includes(category)) return categories[category][0]; 
          for (let keyword of categories[category][1]) {
              if (query.includes(keyword)) return categories[category][0];
          }
      }
      return null;
  }

  searchButton.addEventListener("click", function () {
      let query = searchInput.value.trim().toLowerCase();

      if (query === "") {
          alert("Please enter a search term!");
          return;
      }

      let matchUrl = findCategory(query);
      if (matchUrl) {
          window.location.href = matchUrl;  // ✅ Redirects to the correct page
      } else {
          alert("No matching products found! Try another keyword.");
      }
  });

  searchInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
          searchButton.click();
      }
  });

  // **Auto-Suggestions Feature**
  searchInput.addEventListener("input", function () {
      let query = searchInput.value.trim().toLowerCase();
      suggestionsBox.innerHTML = "";

      if (query === "") {
          suggestionsBox.style.display = "none";
          return;
      }

      let suggestions = [];
      for (let category in categories) {
          if (category.includes(query)) suggestions.push(category);
          categories[category][1].forEach(keyword => {
              if (keyword.includes(query)) suggestions.push(keyword);
          });
      }

      if (suggestions.length === 0) {
          suggestionsBox.style.display = "none";
          return;
      }

      suggestionsBox.style.display = "block";
      suggestionsBox.style.position = "absolute";
      suggestionsBox.style.background = "white";
      suggestionsBox.style.border = "1px solid #ccc";
      suggestionsBox.style.padding = "5px";
      suggestionsBox.style.listStyle = "none";
      suggestionsBox.style.width = searchInput.offsetWidth + "px";
      suggestionsBox.style.top = searchInput.getBoundingClientRect().bottom + "px";
      suggestionsBox.style.left = searchInput.getBoundingClientRect().left + "px";

      suggestions.forEach(suggestion => {
          let li = document.createElement("li");
          li.textContent = suggestion;
          li.style.padding = "8px";
          li.style.cursor = "pointer";

          li.addEventListener("click", function () {
              searchInput.value = suggestion;
              searchButton.click();
          });

          suggestionsBox.appendChild(li);
      });
  });

  document.addEventListener("click", function (event) {
      if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
          suggestionsBox.style.display = "none";
      }
  });
});


// document.getElementById('notifications-icon').addEventListener('click', () => {
//   alert("No new notifications.");
// });
document.getElementById('chatbot-icon').addEventListener('click', () => {
  alert("Chatbot is ready to assist you!");
});

// Open Product Modal with Add to Cart & Wishlist Support
function openModal(productData) {
  const product = JSON.parse(productData);

  document.getElementById("product-title").innerText = product.name;
  document.getElementById("product-description").innerText = product.description || "No description available.";
  document.getElementById("product-price").innerText = `₹${product.price}`;

  const mainImage = document.getElementById("main-image");
  const thumbnails = document.getElementById("image-thumbnails");

  if (product.images && product.images.length > 0) {
      mainImage.src = `/images/${product.images[0]}`;
      thumbnails.innerHTML = "";

      product.images.forEach((image, index) => {
          const img = document.createElement("img");
          img.src = `/images/${image}`;
          img.alt = `Image ${index + 1}`;
          img.className = "thumbnail";
          img.onclick = () => { mainImage.src = `/images/${image}`; };
          thumbnails.appendChild(img);
      });
  } else {
      mainImage.src = "/images/default-placeholder.png";
      thumbnails.innerHTML = "<p>No additional images available.</p>";
  }

  // Set dynamic event listeners for Add to Cart and Wishlist buttons
  document.getElementById("add-to-cart-btn").setAttribute("onclick", `addToCart('${product._id}')`);
  document.getElementById("add-to-wishlist-btn").setAttribute("onclick", `addToWishlist('${product._id}')`);

  // Show the modal
  const modal = document.getElementById("product-modal");
  modal.style.display = "block";

  // Center the modal
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
}

// Close Product Modal
function closeModal() {
  document.getElementById("product-modal").style.display = "none";
}

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  const modal = document.getElementById("product-modal");
  if (event.target === modal) {
      modal.style.display = "none";
  }
});

// Image Slider (Auto Scroll)
let currentIndex = 0;

function showSlide(index) {
  const galleryWrapper = document.querySelector(".gallery-wrapper");
  const totalSlides = document.querySelectorAll(".ad-card").length;

  if (index >= totalSlides) {
      currentIndex = 0;
  } else if (index < 0) {
      currentIndex = totalSlides - 1;
  } else {
      currentIndex = index;
  }

  galleryWrapper.style.transform = `translateX(${-currentIndex * 100}%)`;
}

function nextSlide() { showSlide(currentIndex + 1); }
function prevSlide() { showSlide(currentIndex - 1); }

// Auto slide every 3 seconds
setInterval(() => { nextSlide(); }, 3000);
