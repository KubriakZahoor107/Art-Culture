// src/types/express.d.ts

/// <reference types="multer" />

// Важливо: цей імпорт не використовується для значень, а лише для того,
// щоб TypeScript розглядав цей файл як модуль і дозволяв розширення.
import 'express';
// Явний імпорт User для використання в інтерфейсі
import { User } from '@prisma/client'; // Повертаємо імпорт User з Prisma Client


declare module 'express' {
    interface Request {
        /** додається після authenticateToken */
        user?: User; // Повертаємо тип User з Prisma
        /** multer.memoryStorage() або .fields() */
        files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
    // Якщо потрібно розширити інші інтерфейси Express, наприклад Response, це робиться тут
    // interface Response {
    //   // ...
    // }
}
