declare module 'bun' {
  interface Env {
    NODE_ENV: string

    DATABASE_URL: string
    REDIS_URL: string

    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string

    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string

    AWS_S3_BUCKET: string
    AWS_REGION: string
    AWS_ENDPOINT: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_TOKEN_VALUE: string
    AWS_PUBLIC_URL_BASE: string

    RAZORPAY_KEY_ID: string
    RAZORPAY_KEY_SECRET: string
    RAZORPAY_WEBHOOK_SECRET: string
    RAZORPAY_PLAN_ID_PRO: string

    GEMINI_API_KEY: string
    OPENAI_API_KEY: string
    AI_GATEWAY_API_KEY: string
    GOOGLE_MAPS_API_KEY: string

    X_IG_APP_ID: string
    APIFY_API_KEY: string
  }
}

export {}
