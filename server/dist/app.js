import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
// Імпортуємо всі ваші роутери
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import postRoutes from './routes/postRoutes.js';
import productRoutes from './routes/productRoutes.js';
import exhibitionRoutes from './routes/exhibitionRoutes.js';
import artTermsRoutes from './routes/artTermsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
const app = express();
// ————— Загальні middleware —————
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ————— Підключаємо роутери —————
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/exhibitions', exhibitionRoutes);
app.use('/api/art-terms', artTermsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/like', likeRoutes);
// Health‐check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// ————— 404-хендлер —————
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// ————— Глобальний обробник помилок —————
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});
export default app;
//# sourceMappingURL=app.js.map