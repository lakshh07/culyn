declare module 'bun' {
  interface Env {
    DATABASE_URL: string

    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string

    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string

    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_REGION: string
    AWS_S3_BUCKET_NAME: string

    REDIS_URL: string

    GOOGLE_GENERATIVE_AI_API_KEY: string

    NODE_ENV: string
  }
}

export {}
