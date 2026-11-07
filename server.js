require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🌐 Server Details:
   - URL: http://localhost:${PORT}
   - Environment: ${process.env.NODE_ENV || 'development'}
   - Node.js Version: ${process.version}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] SIGTERM received. Shutting down gracefully...`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] SIGINT received. Shutting down gracefully...`);
  process.exit(0);
});
