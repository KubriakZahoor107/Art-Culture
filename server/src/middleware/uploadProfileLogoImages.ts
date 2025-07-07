// server/src/middleware/uploadProfileLogoImages.ts

import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import multer, { MulterError, StorageEngine } from "multer";
import path, { dirname } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Derive __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = dirname(__filename);

// Multer memory storage
const storage: StorageEngine = multer.memoryStorage();

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowedTypes = /\.(jpe?g|png|gif|webp)$/i;
  const extname = allowedTypes.test(path.extname(file.originalname));
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE", "Only images are allowed"));
  }
}

export const uploadProfileLogoImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
}).fields([
  { name: "profileImage", maxCount: 1 },
  { name: "museumLogo", maxCount: 1 },
]);

export async function processProfileLogoImages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Обробка profileImage
    if (req.files && "profileImage" in req.files) {
      const file = (req.files as any).profileImage[0] as Express.Multer.File;
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = uniqueSuffix + path.extname(file.originalname);
      const outputDir = path.join(__dirnameLocal, "../../uploads/profileImages");
      const outputPath = path.join(outputDir, filename);

      await fs.mkdir(outputDir, { recursive: true });

      await sharp(file.buffer)
        .resize({
          width: 1920,
          height: 1080,
          fit: sharp.fit.cover,
          position: sharp.gravity.center,      // <-- тут заміна
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      req.body.profileImagePath = `/uploads/profileImages/${filename}`;
    }

    // Обробка museumLogo
    if (req.files && "museumLogo" in req.files) {
      const file = (req.files as any).museumLogo[0] as Express.Multer.File;
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = uniqueSuffix + ".webp";
      const outputDir = path.join(__dirnameLocal, "../../uploads/museumLogoImages");
      const outputPath = path.join(outputDir, filename);

      await fs.mkdir(outputDir, { recursive: true });

      await sharp(file.buffer)
        .resize({
          fit: sharp.fit.outside,
          position: sharp.gravity.center,      // <-- і тут
        })
        .webp({ quality: 100 })
        .toFile(outputPath);

      req.body.museumLogoPath = `/uploads/museumLogoImages/${filename}`;
    }

    next();
  } catch (error) {
    console.error("Error processing images:", error);
    next(error);
  }
}

