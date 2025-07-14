// файл: /Users/konstantinkubriak/Desktop/Art-Culture/server/src/index.ts

import 'dotenv/config'
import app from './app.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
        // ————— Establish DB connection —————
        await prisma.$connect()
        console.info('✅ Connected to the database')

        // ————— Health-check endpoint —————
        app.get('/healthz', async (_req, res) => {
                try {
                        await prisma.$queryRaw`SELECT 1`
                        res.sendStatus(200)
                } catch {
                        res.sendStatus(503)
                }
        })

        // ————— Root endpoint —————
        app.get('/', (_req, res) => {
                res.send('Art-Culture API is running')
        })

        // ————— Start server —————
        const port = Number(process.env.PORT ?? 5000)
        app.listen(port, () => {
                console.log(`🚀 Server listening on http://localhost:${port}`)
        })
}

// Graceful shutdown
process.on('SIGINT', async () => {
        console.log('🛑 SIGINT received, shutting down gracefully...')
        await prisma.$disconnect()
        process.exit()
})

main().catch((err) => {
        console.error('🔥 Failed to start app:', err)
        process.exit(1)
})

