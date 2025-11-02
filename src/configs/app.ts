import 'dotenv/config'

export const appConfig = Object.freeze({
  isInProduction: process.env.NODE_ENV === 'production',
  isCI: process.env.CI === 'true',
})
