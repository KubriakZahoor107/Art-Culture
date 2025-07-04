// src/app.ts
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import errorHandler from './middleware/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import artTermsRoutes from './routes/artTermsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import exhibitionRoutes from './routes/exhibitionRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import postRoutes from './routes/postRoutes.js';
import productRoutes from './routes/productRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Для __dirname у ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', true);

app.use(express.json());

// HTTP logger
app.use(morgan('combined'));

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'unsafe-inline'", "'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.tile.openstreetmap.org'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Rate limit
const limiter = rateLimit({
  windowMs: 0.2 * 60 * 1000, // 2s
  max: 10000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Custom request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.info(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      next();
    } else {
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  });
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exhibitions', exhibitionRoutes);
app.use('/api/art-terms', artTermsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/like', likeRoutes);

// Error handler (останній middleware)
app.use(errorHandler);

export default app;
