const socket = io();

const form = document.getElementById('productForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const product = {
    title: formData.get('title'),
    price: formData.get('price')
  };

  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  if (response.ok) {
    form.reset();
  }
});

// Eliminado de productos
const deleteForm = document.getElementById('deleteForm');
deleteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(deleteForm);
  const id = formData.get('id');

  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    deleteForm.reset();
  }
});

// Actualización en tiempo real
socket.on('updateProducts', (products) => {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  products.forEach(prod => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${prod._id}</strong> - ${prod.title} - $${prod.price}`;
    list.appendChild(li);
  });
});
