/** PM2 config for AWS EC2 — run: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "bolinjcha-mandal",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};
