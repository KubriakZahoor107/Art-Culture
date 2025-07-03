// src/types/express.d.ts
import { File } from 'multer'
import { User } from '@prisma/client'

declare global {
    namespace Express {
        interface Request {
            user?: User // або { id: number }
            files?: File[]
        }
    }
}
