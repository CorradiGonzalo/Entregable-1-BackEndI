const socket = io();

const form = document.getElementById('productForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const product = {
    title: formData.get('title'),
    description: formData.get('description'),
    code: formData.get('code'),
    price: parseFloat(formData.get('price')),
    status: formData.get('status') === 'true', // asumiendo que en el form es 'true' o 'false'
    stock: parseInt(formData.get('stock')),
    category: formData.get('category')
  };

  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  if (response.ok) {
    form.reset();
  } else {
    const errorData = await response.json();
    console.error('Error al agregar producto:', errorData);
    alert('Error al agregar producto. Revisa los campos.');
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
  } else {
    alert('Error al eliminar producto. Verifica el ID.');
  }
});

// Actualización en tiempo real
socket.on('updateProducts', (products) => {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  products.forEach(prod => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${prod._id}</strong> - ${prod.title} - $${prod.price} - Stock: ${prod.stock}`;
    list.appendChild(li);
  });
});

