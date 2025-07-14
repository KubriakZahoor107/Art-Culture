import express, { Request, Response, NextFunction } from 'express';
import * as helmetPkg from 'helmet';
const helmet = (helmetPkg as any).default ?? helmetPkg;
import * as rateLimitPkg from 'express-rate-limit';
const rateLimit = (rateLimitPkg as any).default ?? rateLimitPkg;
import cors from 'cors';
import morgan from 'morgan';

import errorHandler from './middleware/errorHandler.js';
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import exhibitionRoutes from './routes/exhibitionRoutes.js';
import artTermsRoutes from './routes/artTermsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import likeRoutes from './routes/likeRoutes.js';

const app = express();

// Базові middleware
app.set('trust proxy', true);
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  })
);
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
})
);
app.use(
  rateLimit({
    windowMs: 2_000,
    max: 10_000,
    message: 'Too many requests, try again later.'
  })
);
app.use(morgan('combined'));
app.use((req: Request, res: Response, next: NextFunction) => {
  console.info(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Маршрути
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/exhibitions', exhibitionRoutes);
app.use('/api/art-terms', artTermsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/like', likeRoutes);

// повинно бути після усіх app.use(<router>)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" })
})

app.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    const status = err.status || 500
    const message = err.message || "Server Error"
    res.status(status).json({ error: message })
  }
)

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Обробник помилок наприкінці
app.use(errorHandler);

export default app;

