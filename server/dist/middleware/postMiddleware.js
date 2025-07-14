export const logPostActions = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} by User ID: ${req.user.id}`);
    next();
};
// Export other middlewares as needed
