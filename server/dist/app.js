import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";
import errorHandler from "./src/middleware/errorHandler.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import artTermsRoutes from "./src/routes/artTermsRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import exhibitionRoutes from "./src/routes/exhibitionRoutes.js";
import geoRoutes from "./src/routes/geoRoutes.js";
import likeRoutes from "./src/routes/likeRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set("trust proxy", true);
app.use(express.json());
// Security HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'unsafe-inline'", "'self'"],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://*.tile.openstreetmap.org",
            ],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
// Rate Limiting
const limiter = rateLimit({
    windowMs: 0.2 * 60 * 1000, // 2 sec
    max: 10000,
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
// HTTP request logger
app.use(morgan("combined"));
// Middleware to parse JSON
app.use(express.json());
// ✅ Type-safe middleware for request logging
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});
// Enforce HTTPS
if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.secure || req.headers["x-forwarded-proto"] === "https") {
            next();
        }
        else {
            res.redirect(`https://${req.headers.host}${req.url}`);
        }
    });
}
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts/postId", postRoutes);
app.use("/api/exhibitions", exhibitionRoutes);
app.use("/api/art-terms", artTermsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/like", likeRoutes);
// Route debugging
console.log("Environment", process.env.NODE_ENV);
console.log("Client URL", process.env.CLIENT_URL);
// Error Handling Middleware
app.use(errorHandler);
export default app;
