// src/types/express.d.ts


declare global {
    namespace Express {
        interface Request {
            /** додається після authenticateToken */
            user?: import('@prisma/client').User
            /** multer.memoryStorage() або .fields()  */
            files?: Express.Multer.File[]
        }
    }
}

// порожній експорт, щоб TS розцінював цей файл як модуль
export { }






