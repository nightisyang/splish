module.exports = {
  apps: [
    {
      name: 'splish-api',
      script: 'server.js',
      cwd: __dirname,
      interpreter: '/opt/node-v22/bin/node',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '8081'
      },
      autorestart: true,
      kill_timeout: 5000,
      max_memory_restart: '500M',
      time: true
    }
  ]
};
