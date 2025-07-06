const express = require('express');

const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const PORT = 8080;
const {readFile, writeFile} = require('./fileManager');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const productsPath = './products.json';
const cartsPath = './carts.json';

// ---------------------------
// PRODUCTOS
// ---------------------------

app.get('/api/products', (req, res) => {
  const products = readFile(productsPath);
  res.json(products);
});

app.get('/api/products/:pid', (req, res) => {
  const products = readFile(productsPath);
  const product = products.find(p => p.id == req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const products = readFile(productsPath);
  const newId = products.length ? products[products.length - 1].id + 1 : 1;
  const newProduct = {
    id: newId,
    ...req.body
  };
  products.push(newProduct);
  writeFile(productsPath, products);
  res.status(201).json(newProduct);
});

app.put('/api/products/:pid', (req, res) => {
  const products = readFile(productsPath);
  const index = products.findIndex(p => p.id == req.params.pid);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  products[index] = { ...products[index], ...req.body, id: products[index].id };
  writeFile(productsPath, products);
  res.json(products[index]);
});

app.delete('/api/products/:pid', (req, res) => {
  const products = readFile(productsPath);
  const updated = products.filter(p => p.id != req.params.pid);
  writeFile(productsPath, updated);
  res.status(204).end();
});

// ---------------------------
// CARRITOS
// ---------------------------

app.post('/api/carts', (req, res) => {
  const carts = readFile(cartsPath);
  const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;
  const newCart = { id: newId, products: [] };
  carts.push(newCart);
  writeFile(cartsPath, carts);
  res.status(201).json(newCart);
});

app.get('/api/carts/:cid', (req, res) => {
  const carts = readFile(cartsPath);
  const cart = carts.find(c => c.id == req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart.products);
});

app.post('/api/carts/:cid/product/:pid', (req, res) => {
  const carts = readFile(cartsPath);
  const cartIndex = carts.findIndex(c => c.id == req.params.cid);
  if (cartIndex === -1) return res.status(404).json({ error: 'Carrito no encontrado' });

  const cart = carts[cartIndex];
  const existing = cart.products.find(p => p.product == req.params.pid);

  if (existing) {
    existing.quantity++;
  } else {
    cart.products.push({ product: parseInt(req.params.pid), quantity: 1 });
  }

  carts[cartIndex] = cart;
  writeFile(cartsPath, carts);
  res.json(cart);
});

//Configuracion de Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));



// ---------------------------

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//rutas

app.get('/home', (req, res) => { 
  const products = readFile(productsPath);
  res.render('home', {titulo: 'Lista de Productos:', products});
});

app.get('/realtimeproducts', (req, res) => {
  const products = readFile(productsPath);
  res.render('realTimeProducts', { products });
});
