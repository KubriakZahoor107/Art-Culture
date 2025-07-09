// файл: server/src/index.ts
import 'dotenv/config'
import app from './app.js'       // <-- Ось тут
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
        await prisma.$connect()
        console.info('✅ Connected to the database')

        const PORT = process.env.PORT ?? 5000
        app.listen(PORT, () => {
                console.log(`🚀 Server listening on http://localhost:${PORT}`)
        })
}

main().catch((err) => {
        console.error('🔥 Failed to start app:', err)
        process.exit(1)
})


