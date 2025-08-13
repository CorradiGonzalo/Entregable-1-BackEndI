const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const router = express.Router();

/**
 * Vista: Listado de productos con paginación + filtros + orden
 * GET /products
 * Query:
 *  - limit (default 10)
 *  - page  (default 1)
 *  - sort: "asc" | "desc" (por precio)
 *  - query: "category:<valor>" | "status:true|false"
 */
router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Filtro desde `query`
    const filter = {};
    if (query) {
      const [key, ...rest] = String(query).split(':');
      const value = rest.join(':');
      if (key === 'category' && value) filter.category = value;
      if (key === 'status' && value !== '') filter.status = value === 'true';
    }

    // Ordenamiento por price
    let sortOpt = undefined;
    if (sort === 'asc') sortOpt = { price: 1 };
    if (sort === 'desc') sortOpt = { price: -1 };

    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortOpt).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.max(Math.ceil(total / limitNum) || 1, 1);
    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;

    // Construcción de prev/next links para la vista
    const qs = new URLSearchParams(req.query);
    const makeLink = (p) => {
      const q = new URLSearchParams(qs.toString());
      q.set('page', String(p));
      return `/products?${q.toString()}`;
    };

    return res.render('home', {
      titulo: 'Lista de Productos:',
      products: items,
      page: pageNum,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? makeLink(pageNum - 1) : null,
      nextLink: hasNextPage ? makeLink(pageNum + 1) : null,
      q_query: query || '',
      q_sort: sort || '',
      q_limit: limitNum
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al renderizar productos');
  }
});


router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send('Producto no encontrado');
    res.render('productDetail', { product });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al renderizar el detalle');
  }
});

/**
 * Vista: Carrito poblado
 * GET /carts/:cid
 */
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const items = cart.products.map(p => ({
      ...p,
      subtotal: (p.product?.price || 0) * p.quantity
    }));
    const total = items.reduce((acc, it) => acc + it.subtotal, 0);

    res.render('cart', { cartId: req.params.cid, items, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al renderizar el carrito');
  }
});

/** Rutas existentes para compatibilidad **/

// Vista Home (puede quedar como alias a /products o lista básica)
router.get('/home', async (req, res) => {
  const products = await Product.find().limit(20).lean();
  res.render('home', { titulo: 'Lista de Productos:', products, page: 1, totalPages: 1 });
});

// Vista RealTimeProducts
router.get('/realtimeproducts', async (req, res) => {
  const products = await Product.find().lean();
  res.render('realTimeProducts', { products });
});

module.exports = router;

