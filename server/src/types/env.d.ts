// src/types/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV?: "development" | "production";
        PORT?: string;
        CLIENT_URL?: string;
        JWT_SECRET: string;
        // додайте інші ваші змінні...
    }
}



