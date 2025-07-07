// server/src/controllers/postController.ts
import multer from "multer";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import prisma from "../prismaClient.js";
import logger from "../utils/logging.js";
// 🛠 Підготовка __dirname для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 📦 Налаштування Multer
const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = path.join(__dirname, "../../uploads");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
function fileFilter(req, file, cb) {
    const allowed = /\.(jpe?g|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname)) &&
        allowed.test(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only images are allowed"));
    }
}
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
// ————————————————
// CREATE POST
// ————————————————
export const createPost = async (req, res, next) => {
    try {
        const { title_en, title_uk, content_en, content_uk } = req.body;
        const userId = req.user.id;
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        const post = await prisma.post.create({
            data: {
                title_en,
                title_uk,
                content_en,
                content_uk,
                images: imageUrl,
                author: { connect: { id: userId } },
                status: "PENDING",
            },
            include: {
                author: { select: { id: true, email: true, title: true } },
            },
        });
        res.status(201).json(post);
    }
    catch (err) {
        next(err);
    }
};
// ————————————————
// GET ALL APPROVED POSTS
// ————————————————
export const getAllPosts = async (_req, res, next) => {
    try {
        const { authorId } = _req.query;
        const filter = authorId
            ? { authorId: parseInt(authorId, 10) }
            : {};
        const posts = await prisma.post.findMany({
            where: { status: "APPROVED", ...filter },
            include: { author: { select: { id: true, email: true, title: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(posts);
    }
    catch (err) {
        if (err.code === 'P2021') {
            return res.json([]);
        }
        next(err);
    }
};
// ————————————————
// GET POST BY ID
// ————————————————
export const getPostById = async (_req, res, next) => {
    try {
        const id = parseInt(_req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid post ID" });
            return;
        }
        const post = await prisma.post.findUnique({
            where: { id },
            include: { author: { select: { id: true, email: true, title: true } } },
        });
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        res.json(post);
    }
    catch (err) {
        next(err);
    }
};
// ————————————————
// UPDATE POST
// ————————————————
export const updatePost = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        if (existing.authorId !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }
        let imageUrl = existing.images;
        if (req.file) {
            if (existing.images) {
                const oldPath = path.join(__dirname, "../../", existing.images);
                fs.unlinkSync(oldPath);
            }
            imageUrl = `/uploads/${req.file.filename}`;
        }
        const updated = await prisma.post.update({
            where: { id },
            data: {
                title_en: req.body.title_en,
                title_uk: req.body.title_uk,
                content_en: req.body.content_en,
                content_uk: req.body.content_uk,
                images: imageUrl,
            },
            include: { author: { select: { id: true, email: true, title: true } } },
        });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
// ————————————————
// DELETE POST
// ————————————————
export const deletePost = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        if (existing.authorId !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }
        if (existing.images) {
            const imgPath = path.join(__dirname, "../../", existing.images);
            fs.unlinkSync(imgPath);
        }
        await prisma.post.delete({ where: { id } });
        res.json({ message: "Post deleted successfully" });
    }
    catch (err) {
        next(err);
    }
};
// ————————————————
// GET POSTS BY ROLE
// ————————————————
export function makeRoleFinder(role) {
    return async (_req, res, next) => {
        try {
            const posts = await prisma.post.findMany({
                where: { author: { role } },
                include: { author: { select: { id: true, email: true, title: true } } },
                orderBy: { createdAt: "desc" },
            });
            res.json({ posts });
        }
        catch (err) {
            if (err.code === "P2021") {
                return res.json({ posts: [] });
            }
            logger.error(`Error fetching ${role} posts:`, err);
            next(err);
        }
    };
}
export const getCreatorsPosts = makeRoleFinder("CREATOR");
export const getAuthorsPosts = makeRoleFinder("AUTHOR");
export const getExhibitionsPosts = makeRoleFinder("EXHIBITION"); // <-- зверни увагу на s
export const getMuseumsPosts = makeRoleFinder("MUSEUM"); // <-- зверни увагу на s
// ————————————————
// GET POSTS BY ENTITY ID
// ————————————————
export function makeByAuthorId(param) {
    return async (req, res, next) => {
        try {
            const id = parseInt(req.params[param], 10);
            if (isNaN(id)) {
                res.status(400).json({ error: "Invalid ID" });
                return;
            }
            const posts = await prisma.post.findMany({
                where: { [param]: id },
                include: {
                    author: { select: { id: true, email: true, title: true, role: true } },
                },
                orderBy: { createdAt: "desc" },
            });
            res.json({ posts });
        }
        catch (err) {
            if (err.code === "P2021") {
                return res.json({ posts: [] });
            }
            next(err);
        }
    };
}
export const getPostsByAuthorId = makeByAuthorId("authorId");
export const getPostsByExhibitionId = makeByAuthorId("exhibitionId");
export const getPostsByMuseumId = makeByAuthorId("museumId");
