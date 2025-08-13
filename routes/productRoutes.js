const express = require('express');
const productManager = require('../DAO/productManager');

module.exports = (io) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query } = req.query;

      // Filtro a partir de `query`
      const filter = {};
      if (query) {
        const [key, ...rest] = String(query).split(':');
        const value = rest.join(':'); // soporta "category:algo:con:dos:puntos"
        if (key === 'category' && value) filter.category = value;
        if (key === 'status' && value !== '') filter.status = value === 'true';
      }

      // Orden por precio
      let sortOpt = undefined;
      if (sort === 'asc') sortOpt = { price: 1 };
      if (sort === 'desc') sortOpt = { price: -1 };

      // Sanitización de paginación
      const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const skip = (pageNum - 1) * limitNum;

      // Query + totales
      let q = productManager.getAllFiltered(filter);
      if (sortOpt) q = q.sort(sortOpt);

      const [total, results] = await Promise.all([
        productManager.countFiltered(filter),
        q.skip(skip).limit(limitNum).lean().exec()
      ]);

      const totalPages = Math.max(Math.ceil(total / limitNum) || 1, 1);
      const hasPrevPage = pageNum > 1;
      const hasNextPage = pageNum < totalPages;

      // Construcción de prevLink y nextLink
      const base = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
      const qs = new URLSearchParams(req.query);
      const makeLink = (p) => {
        const copied = new URLSearchParams(qs.toString());
        copied.set('page', String(p));
        return `${base}?${copied.toString()}`;
      };

      const prevLink = hasPrevPage ? makeLink(pageNum - 1) : null;
      const nextLink = hasNextPage ? makeLink(pageNum + 1) : null;

      return res.json({
        status: 'success',
        payload: results,
        totalPages,
        prevPage: hasPrevPage ? pageNum - 1 : null,
        nextPage: hasNextPage ? pageNum + 1 : null,
        page: pageNum,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Error al obtener productos' });
    }
  });

  // Obtener un producto por ID
  router.get('/:pid', async (req, res) => {
    const product = await productManager.getById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  });

  // Crear producto
  router.post('/', async (req, res) => {
    try {
      const newProduct = await productManager.create(req.body);
      io.emit('updateProducts', await productManager.getAll());
      res.status(201).json(newProduct);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Error al crear producto', details: error.message });
    }
  });

  // Actualizar producto
  router.put('/:pid', async (req, res) => {
    const updated = await productManager.update(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  });

  // Eliminar producto
  router.delete('/:pid', async (req, res) => {
    const deleted = await productManager.delete(req.params.pid);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    io.emit('updateProducts', await productManager.getAll());
    res.status(204).end();
  });

  return router;
};

