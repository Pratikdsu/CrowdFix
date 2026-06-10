const app = require('./app');
const config = require('./config/env');
const prisma = require('./lib/prisma');

const server = app.listen(config.port, () => {
  console.log(`🚀 CrowdFix API running on http://localhost:${config.port}`);
  console.log(`   Environment:  ${config.nodeEnv}`);
  console.log(`   Health check: http://localhost:${config.port}/api/health`);
});

// Graceful shutdown — close server + DB cleanly on Ctrl+C or platform stop
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Server closed, database disconnected.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));