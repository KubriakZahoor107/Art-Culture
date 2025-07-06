import multer, { FileFilterCallback, StorageEngine } from 'multer'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Request } from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const storage: StorageEngine = multer.diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb) => {
                cb(null, path.join(__dirname, '../../uploads/productImages'))
        },
        filename: (req: Request, file: Express.Multer.File, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
                cb(null, uniqueSuffix + path.extname(file.originalname))
        },
})

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
	const allowedTypes = /jpeg|jpg|png|gif|webp/
	const extname = allowedTypes.test(
		path.extname(file.originalname).toLowerCase()
	)
	const mimetype = allowedTypes.test(file.mimetype)
	if (extname && mimetype) {
		return cb(null, true)
	} else {
		cb(new Error('Only images are allowed'))
	}
}

const upload = multer({
	storage,
	fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
})

export default upload
