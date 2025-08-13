const express = require('express');
const cartManager = require('../DAO/CartManager');

const router = express.Router();

// Crear carrito
router.post('/', async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json({ status: 'success', payload: newCart });
});

// Obtener carrito por ID (con populate)
router.get('/:cid', async (req, res) => {
  const cart = await cartManager.getCartById(req.params.cid);
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
  }
  res.json({ status: 'success', payload: cart });
});

// Agregar producto al carrito (sumar 1)
router.post('/:cid/product/:pid', async (req, res) => {
  const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Carrito o producto no encontrado' });
  }
  const populated = await cartManager.getCartById(req.params.cid);
  res.status(201).json({ status: 'success', payload: populated });
});

// Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Carrito o producto no encontrado' });
  }
  res.json({ status: 'success', payload: cart });
});

// Reemplazar todos los productos del carrito
// body: { products: [{ product: "<pid>", quantity: <n> }, ...] }
router.put('/:cid', async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ status: 'error', message: 'products debe ser un array' });
  }
  const cart = await cartManager.replaceCartProducts(req.params.cid, products);
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Carrito o producto no encontrado' });
  }
  res.json({ status: 'success', payload: cart });
});

// Actualizar solo la cantidad de un producto
// body: { quantity: <n> }
router.put('/:cid/products/:pid', async (req, res) => {
  const q = Number(req.body.quantity);
  if (!Number.isFinite(q) || q < 1) {
    return res.status(400).json({ status: 'error', message: 'quantity debe ser >= 1' });
  }
  const cart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, q);
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Carrito o producto no encontrado' });
  }
  res.json({ status: 'success', payload: cart });
});

// Vaciar el carrito
router.delete('/:cid', async (req, res) => {
  const cart = await cartManager.clearCart(req.params.cid);
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
  }
  res.json({ status: 'success', payload: cart });
});

module.exports = router;


