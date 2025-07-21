// exhibitionImageUploader.ts
import multer, { FileFilterCallback, StorageEngine } from "multer"
import path, { dirname } from "path"
import sharp from "sharp"
import { fileURLToPath } from "url"
// Імпортуємо Request, Response, NextFunction без 'type'
// Оскільки їх типи розширені у src/types/express.d.ts,
// вони вже глобально доступні або можуть бути імпортовані як звичайні модулі.
import { Request, Response, NextFunction } from "express"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const storage: StorageEngine = multer.memoryStorage() // Store files in memory

// Define the fileFilter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  )
  const mimetype = allowedTypes.test(file.mimetype)
  if (extname && mimetype) {
    return cb(null, true)
  } else {
    // Передаємо MulterError як перший аргумент cb
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only images are allowed",
      ),
    )
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
})

const processImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Явно приводимо req.files до Express.Multer.File[],
  // оскільки ми використовуємо upload.array().
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return next(); // Якщо файлів немає, просто переходимо до наступного middleware
  }

  try {
    await Promise.all(
      files.map(async (file) => { // Тепер 'files' є масивом, і .map() працює коректно
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const filename = uniqueSuffix + ".webp"
        const outputPath = path.join(
          __dirname,
          "../../uploads/exhibitionsImages",
          filename,
        )
        await sharp(file.buffer)
          .resize(1920)
          .webp({ quality: 80 })
          .toFile(outputPath)
        // Replace file information with the new processed file
        file.filename = filename
        file.path = outputPath
      }),
    )
    next()
  } catch (error) {
    console.error("Error processing images:", error)
    next(error)
  }
}

export default {
  upload: upload.array("exhibitionImages", 10), // Використовуємо .array()
  processImages,
}
