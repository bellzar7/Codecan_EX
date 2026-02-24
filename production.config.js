module.exports = {
  apps: [
    {
      name: "backend",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      exec_mode: "fork",
      instances: 1,
    },
    {
      name: "frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      exec_mode: "fork",
      instances: 1,
    },
    {
      name: "eco-ws",
      script: "dist/backend/integrations/twelvedata/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 4002,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4002,
      },
      exec_mode: "fork",
      instances: 1,
    },
  ],
};
