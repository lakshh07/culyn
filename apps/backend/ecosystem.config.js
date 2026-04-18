module.exports = {
  apps: [
    {
      name: 'api',
      script: '/home/ec2-user/.bun/bin/bun',
      args: 'run src/index.ts',
      cwd: '/home/ec2-user/culyn/apps/backend',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'worker',
      script: '/home/ec2-user/.bun/bin/bun',
      args: 'run src/worker.ts',
      cwd: '/home/ec2-user/culyn/apps/backend',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
}
