// server/src/middleware/uploadProfileLogoImages.ts
import { promises as fs } from "fs";
import multer, { MulterError } from "multer";
import path, { dirname } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = dirname(__filename);
const UPLOAD_ROOT = path.join(__dirnameLocal, "../../uploads");
// Multer memory storage
const storage = multer.memoryStorage();
function fileFilter(req, file, cb) {
    const allowed = /\.(jpe?g|png|gif|webp)$/i;
    const ext = allowed.test(path.extname(file.originalname));
    const type = allowed.test(file.mimetype);
    if (ext && type)
        cb(null, true);
    else
        cb(new MulterError("LIMIT_UNEXPECTED_FILE", "Only images are allowed"));
}
export const uploadProfileLogoImages = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 },
}).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "museumLogo", maxCount: 1 },
]);
// Універсальна функція для обробки одного поля
async function processImageField(req, fieldName, subdir, resizeOptions, webpOptions) {
    const files = req.files;
    if (!files || !(fieldName in files))
        return;
    const file = files[fieldName][0];
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = fieldName === "museumLogo" ? ".webp" : path.extname(file.originalname);
    const filename = unique + ext;
    const outputDir = path.join(UPLOAD_ROOT, subdir);
    const outputPath = path.join(outputDir, filename);
    await fs.mkdir(outputDir, { recursive: true });
    await sharp(file.buffer)
        .resize(resizeOptions)
        .webp(webpOptions)
        .toFile(outputPath);
    // записуємо назад у req.body правильний шлях
    const bodyKey = fieldName === "profileImage" ? "profileImagePath" : "museumLogoPath";
    req.body[bodyKey] = `/${path.join("uploads", subdir, filename)}`;
}
export async function processProfileLogoImages(req, res, next) {
    try {
        await processImageField(req, "profileImage", "profileImages", { width: 1920, height: 1080, fit: sharp.fit.cover, position: sharp.gravity.center }, { quality: 80 });
        await processImageField(req, "museumLogo", "museumLogoImages", { fit: sharp.fit.outside, position: sharp.gravity.center }, { quality: 100 });
        next();
    }
    catch (error) {
        console.error("Error processing images:", error);
        next(error);
    }
}
//# sourceMappingURL=uploadProfileLogoImages.js.map