document.getElementById('addProductForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page
  
    // Collect form data
    const formData = new FormData(event.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      stockquantity: parseInt(formData.get('stockquantity'), 10),
      price: parseFloat(formData.get('price')),
      category: formData.get('category'),
      images: formData.get('images') ? formData.get('images').split(',') : [],
    };
  
    // Send the data to the backend
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        alert('Product added successfully');
        event.target.reset(); // Clear the form
      } else {
        const error = await response.json();
        alert(`Failed to add product: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to add product. Please try again later.');
      console.error(error);
    }
  });
  