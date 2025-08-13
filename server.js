const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const viewsRoutes = require('./routes/viewsRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8080;

// ---------------------------
// MIDDLEWARES
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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
});

// ---------------------------
// RUTAS
// ---------------------------
app.use('/api/products', productRoutes(io)); 
app.use('/api/carts', cartRoutes);
app.use('/', viewsRoutes);

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






