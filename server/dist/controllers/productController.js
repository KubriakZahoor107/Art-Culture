// server/src/controllers/productController.ts
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../prismaClient.js";
import { validationResult } from "express-validator";
// —————————————————————————————————————————
// ESM __dirname setup
// —————————————————————————————————————————
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../uploads/productImages");
// —————————————————————————————————————————
// Multer setup
// —————————————————————————————————————————
const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
    },
    filename(_req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
function fileFilter(req, file, cb) {
    const allowed = /\.(jpe?g|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype)) {
        cb(null, true);
    }
    else {
        // закриваємо new Error(...) а потім передаємо false
        cb(new Error("Дозволено завантажувати лише зображення!"));
    }
}
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
// —————————————————————————————————————————
// === CREATE ===
// —————————————————————————————————————————
export const createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Перевіряємо, що user додано в Request через middleware
        if (!req.user) {
            return res.status(401).json({ error: "Неавторизований доступ" });
        }
        const userId = req.user.id;
        const { title_en, title_uk, description_en, description_uk, specs_en, specs_uk, size, dateOfCreation, style_en, style_uk, technique_en, technique_uk, } = req.body;
        const files = req.files;
        const imagesData = (files ?? []).map((f) => ({
            imageUrl: `/uploads/productImages/${f.filename}`,
        }));
        const product = await prisma.product.create({
            data: {
                title_en,
                title_uk,
                description_en,
                description_uk,
                specs_en,
                specs_uk,
                size,
                dateOfCreation,
                style_en,
                style_uk,
                technique_en,
                technique_uk,
                status: "PENDING",
                authorId: userId,
                images: { create: imagesData },
            },
            include: { images: true },
        });
        res.status(201).json({ product });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === READ ALL or by authorIds ===
// —————————————————————————————————————————
export const getProducts = async (req, res, next) => {
    try {
        const { authorIds } = req.query;
        let products;
        if (typeof authorIds === "string") {
            const ids = authorIds.split(",").map((i) => parseInt(i, 10));
            if (ids.some(isNaN)) {
                return res.status(400).json({ error: "Invalid authorIds" });
            }
            products = await prisma.product.findMany({
                where: {
                    OR: [{ authorId: { in: ids } }, { museumId: { in: ids } }],
                },
                include: {
                    images: true,
                    author: { select: { id: true, email: true, title: true } },
                },
            });
        }
        else {
            products = await prisma.product.findMany({
                include: {
                    images: true,
                    author: { select: { id: true, email: true, title: true } },
                },
            });
        }
        res.json({ products });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === READ BY ID ===
// —————————————————————————————————————————
export const getProductById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.productId, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid product ID" });
        }
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                author: { select: { id: true, email: true, title: true } },
            },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ product });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === READ CURRENT USER ===
// —————————————————————————————————————————
export const getUserProducts = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Неавторизований доступ" });
        }
        const userId = req.user.id;
        const products = await prisma.product.findMany({
            where: { authorId: userId },
            include: {
                images: true,
                author: { select: { id: true, email: true, title: true } },
            },
        });
        res.json({ products });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === READ CREATORS ===
// —————————————————————————————————————————
export const getCreatorProducts = async (req, res, next) => {
    try {
        const products = await prisma.product.findMany({
            where: { author: { role: "CREATOR" } },
            include: {
                images: true,
                author: { select: { id: true, email: true, title: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ products });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === READ BY AUTHOR ID ===
// —————————————————————————————————————————
export const getProductByAuthorId = async (req, res, next) => {
    try {
        const authorId = parseInt(req.params.authorId, 10);
        if (isNaN(authorId)) {
            return res.status(400).json({ error: "Invalid author ID" });
        }
        const products = await prisma.product.findMany({
            where: { authorId },
            include: {
                images: true,
                author: { select: { id: true, email: true, title: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ products });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === READ MUSEUMS ===
// —————————————————————————————————————————
export const getMuseumProducts = async (req, res, next) => {
    try {
        const products = await prisma.product.findMany({
            where: { author: { role: "MUSEUM" } },
            include: {
                images: true,
                author: { select: { id: true, email: true, title: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ products });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === READ BY MUSEUM ID ===
// —————————————————————————————————————————
export const getProductByMuseumId = async (req, res, next) => {
    try {
        const museumId = parseInt(req.params.museumId, 10);
        if (isNaN(museumId)) {
            return res.status(400).json({ error: "Invalid museum ID" });
        }
        const products = await prisma.product.findMany({
            where: { museumId },
            include: {
                images: true,
                author: { select: { id: true, email: true, title: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ products });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === READ BY EXHIBITION ID ===
// —————————————————————————————————————————
export const getProductByExhibitionId = async (req, res, next) => {
    try {
        const exhibitionId = parseInt(req.params.exhibitionId, 10);
        if (isNaN(exhibitionId)) {
            return res.status(400).json({ error: "Invalid exhibition ID" });
        }
        const exhibition = await prisma.exhibition.findUnique({
            where: { id: exhibitionId },
            include: {
                products: {
                    include: { product: { include: { images: true, author: true } } },
                },
            },
        });
        // Гарантуємо, що products є масивом, і безпечно робимо map
        const products = exhibition?.products?.map((ep) => ep.product) ?? [];
        res.json({ products });
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === UPDATE ===
// —————————————————————————————————————————
export const updateProduct = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!req.user) {
            return res.status(401).json({ error: "Неавторизований доступ" });
        }
        const userId = req.user.id;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        if (product.authorId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const files = req.files;
        if (files && files.length > 0) {
            for (const img of product.images) {
                const p = path.join(__dirname, "../../", img.imageUrl);
                if (fs.existsSync(p))
                    fs.unlinkSync(p);
            }
            await prisma.productImage.deleteMany({ where: { productId: id } });
        }
        const imagesData = (files ?? []).map((f) => ({
            imageUrl: `/uploads/productImages/${f.filename}`,
        }));
        const updated = await prisma.product.update({
            where: { id },
            data: { ...req.body, images: { create: imagesData } },
            include: { images: true, author: { select: { id: true, email: true } } },
        });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
// —————————————————————————————————————————
// === DELETE ===
// —————————————————————————————————————————
export const deleteProduct = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!req.user) {
            return res.status(401).json({ error: "Неавторизований доступ" });
        }
        const userId = req.user.id;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        if (product.authorId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        for (const img of product.images) {
            const p = path.join(__dirname, "../../", img.imageUrl);
            if (fs.existsSync(p))
                fs.unlinkSync(p);
        }
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id } });
        res.json({ message: "Product deleted successfully" });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=productController.js.map