const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  thumbnail: String,
  code: { type: String, required: true, unique: true },
  stock: { type: Number, required: true }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
