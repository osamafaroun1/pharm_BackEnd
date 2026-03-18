import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import routes from './routes/index';
import './models/index';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_PHARMACIST_URL || 'http://localhost:3001',
    process.env.FRONTEND_ADMIN_URL       || 'http://localhost:3002',
    process.env.FRONTEND_OWNER_URL       || 'http://localhost:3003',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api', routes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// simple http server without socket.io
import http from 'http';
const server = http.createServer(app);

startServer();