// src/types/express.d.ts

import type { User } from '@prisma/client'
import type { File as MulterFile } from 'multer'

declare global {
    namespace Express {
        interface Request {
            /** додається після authenticateToken */
            user?: User
            /** multer.memoryStorage() або .fields()  */
            files?: MulterFile[]
        }
    }
}

// порожній експорт, щоб TS розцінював цей файл як модуль
export { }






