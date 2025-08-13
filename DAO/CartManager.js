const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const CartManager = {
  // Crear carrito vacío
  async createCart() {
    return await Cart.create({ products: [] });
  },

  // Obtener carrito por id con populate de productos
  async getCartById(cid) {
    if (!isValidId(cid)) return null;
    return await Cart.findById(cid).populate('products.product');
  },

  // Agregar producto (suma 1 si ya existe)
  async addProductToCart(cid, pid) {
    if (!isValidId(cid) || !isValidId(pid)) return null;

    const [cart, product] = await Promise.all([
      Cart.findById(cid),
      Product.findById(pid)
    ]);
    if (!cart || !product) return null;

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx >= 0) {
      cart.products[idx].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }
    await cart.save();
    return cart;
  },

  // Eliminar un producto específico del carrito
  async removeProductFromCart(cid, pid) {
    if (!isValidId(cid) || !isValidId(pid)) return null;

    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const before = cart.products.length;
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    if (cart.products.length === before) return null; // no estaba en el carrito

    await cart.save();
    return await cart.populate('products.product');
  },

  // Reemplazar el arreglo completo de productos
  // products: [{ product: <pid>, quantity: <number> }, ...]
  async replaceCartProducts(cid, products) {
    if (!isValidId(cid) || !Array.isArray(products)) return null;

    // Validaciones básicas de ids y cantidades
    for (const p of products) {
      if (!p || !isValidId(p.product)) return null;
      const exists = await Product.exists({ _id: p.product });
      if (!exists) return null;
    }

    const sanitized = products.map(p => ({
      product: p.product,
      quantity: Math.max(1, Number.parseInt(p.quantity || 1, 10))
    }));

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: sanitized },
      { new: true }
    ).populate('products.product');

    return cart; // puede ser null si no existe el carrito
  },

  // Actualizar solo la cantidad de un producto
  async updateProductQuantity(cid, pid, quantity) {
    if (!isValidId(cid) || !isValidId(pid)) return null;
    const q = Math.max(1, Number.parseInt(quantity, 10));
    if (!Number.isFinite(q)) return null;

    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx === -1) return null;

    cart.products[idx].quantity = q;
    await cart.save();
    return await cart.populate('products.product');
  },

  // Vaciar carrito
  async clearCart(cid) {
    if (!isValidId(cid)) return null;
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    ).populate('products.product');
    return cart;
  }
};

module.exports = CartManager;

