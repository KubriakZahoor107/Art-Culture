import prisma from './prismaClient.js'
import dotenv from 'dotenv'
import app from './app.js'
import logger from './src/utils/logging.js'

dotenv.config()

// Define PORT
const PORT = process.env.PORT || 5000 // Use a port that doesn't conflict with your frontend

// Prisma client is initialized in prismaClient.js and imported here


// Start the server and connect to the database
async function startServer() {
	try {
		// Connect to the database
                await prisma.$connect()
                logger.info('Connected to the database successfully.')

		// Start listening for incoming requests
                app.listen(PORT, () => {
                        logger.info(
                                `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
                        )
                })
	} catch (error) {
                logger.error('Error starting the server:', error)
                await prisma.$disconnect()
                process.exit(1)
	}
}

startServer()

// Handle unhandled promise rejections and exceptions
process.on('unhandledRejection', async (reason, promise) => {
        logger.error('Unhandled Rejection:', reason)
        await prisma.$disconnect()
        process.exit(1)
})

process.on('uncaughtException', async error => {
        logger.error('Uncaught Exception:', error)
        await prisma.$disconnect()
        process.exit(1)
})

// Handle graceful shutdown
process.on('SIGINT', async () => {
        logger.info('SIGINT received. Shutting down gracefully...')
        await prisma.$disconnect()
        process.exit(0)
})

process.on('SIGTERM', async () => {
        logger.info('SIGTERM received. Shutting down gracefully...')
        await prisma.$disconnect()
        process.exit(0)
})
