const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const productManager = require('./DAO/productManager');
const cartManager = require('./DAO/CartManager'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8080;

// ---------------------------
// MIDDLEWARES
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (para servir JS del frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------
// CONEXIÓN A MONGODB Y START
// ---------------------------
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
  }
};

startServer();

// ---------------------------
// PRODUCTOS (MongoDB)
// ---------------------------
app.get('/api/products', async (req, res) => {
  const products = await productManager.getAll();
  res.json(products);
});

app.get('/api/products/:pid', async (req, res) => {
  const product = await productManager.getById(req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

app.post('/api/products', async (req, res) => {
  const newProduct = await productManager.create(req.body);
  io.emit('updateProducts', await productManager.getAll());
  res.status(201).json(newProduct);
});

app.put('/api/products/:pid', async (req, res) => {
  const updated = await productManager.update(req.params.pid, req.body);
  if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(updated);
});

app.delete('/api/products/:pid', async (req, res) => {
  const deleted = await productManager.delete(req.params.pid);
  if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
  io.emit('updateProducts', await productManager.getAll());
  res.status(204).end();
});

// ---------------------------
// CARRITOS (MongoDB)
// ---------------------------
app.post('/api/carts', async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json(newCart);
});

app.get('/api/carts/:cid', async (req, res) => {
  const cart = await cartManager.getCartById(req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart.products);
});

app.post('/api/carts/:cid/product/:pid', async (req, res) => {
  const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart);
});

// ---------------------------
// HANDLEBARS
// ---------------------------
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ---------------------------
// WEBSOCKETS
// ---------------------------
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('nuevoProducto', async (producto) => {
    await productManager.create(producto);
    const productosActualizados = await productManager.getAll();
    io.emit('updateProducts', productosActualizados);
  });

  socket.on('eliminarProducto', async (id) => {
    await productManager.delete(id);
    const productosActualizados = await productManager.getAll();
    io.emit('updateProducts', productosActualizados);
  });
});

// ---------------------------
// VISTAS
// ---------------------------
app.get('/home', async (req, res) => {
  const products = await productManager.getAll();
  res.render('home', { titulo: 'Lista de Productos:', products });
});

app.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getAll();
  res.render('realTimeProducts', { products });
});




