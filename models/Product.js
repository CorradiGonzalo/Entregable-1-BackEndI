const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    price:       { type: Number, required: true, min: 0, index: true },
    thumbnail:   { type: String },
    code:        { type: String, required: true, unique: true, trim: true },
    stock:       { type: Number, required: true, min: 0 },
    // Campos requeridos por la consigna:
    category:    { type: String, required: true, trim: true, index: true },
    status:      { type: Boolean, default: true, index: true } // disponibilidad
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

