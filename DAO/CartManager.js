const Cart = require('../models/Cart');

const CartManager = {
  async createCart() {
    return await Cart.create({ products: [] });
  },

  async getCartById(cid) {
    return await Cart.findById(cid).populate('products.product');
  },

  async addProductToCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const existingProduct = cart.products.find(p => p.product.toString() === pid);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    return cart;
  }
};

module.exports = CartManager;
