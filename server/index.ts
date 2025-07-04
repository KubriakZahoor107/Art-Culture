// index.ts
import app from './src/app.js';  // зверніть увагу на .js у кінці

async function startServer() {
        try {
                const PORT = process.env.PORT || 5000;

                // Якщо у вас є підключення до БД:
                // await connectToDb();

                app.listen(PORT, () => {
                        console.log(`✅ Server is running on port ${PORT}`);
                });
        } catch (error) {
                console.error('🔥 Failed to start server:', error);
                process.exit(1);
        }
}

startServer();
