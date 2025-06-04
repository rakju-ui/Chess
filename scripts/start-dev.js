
const { spawn } = require('child_process');

// Start the WebSocket server
const server = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

// Start Next.js development server
const nextApp = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit'
});

// Handle cleanup
process.on('SIGINT', () => {
  server.kill();
  nextApp.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  server.kill();
  nextApp.kill();
  process.exit();
});
