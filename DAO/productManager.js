const Product = require('../models/Product');

class productManager {
  async getAll() {
    return await Product.find();
  }

  async getAllFiltered(filters) {
    
    return Product.find(filters);
  }

  async countFiltered(filters) {
    
    return Product.countDocuments(filters);
  }

  async getById(id) {
    return await Product.findById(id);
  }

  async create(productData) {
    return await Product.create(productData);
  }

  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }
}

module.exports = new productManager();

