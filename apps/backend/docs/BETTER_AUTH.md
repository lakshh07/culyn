# Better Auth Configuration

Better Auth is configured and mounted at `/api/auth/*` in the backend.

## Available Auth Endpoints

All Better Auth endpoints are automatically available at:

### Sign In / Sign Up

- **POST** `/api/auth/sign-in/email` - Email & password sign in
- **POST** `/api/auth/sign-up/email` - Email & password sign up
- **POST** `/api/auth/sign-in/social` - Social provider sign in (Google)

### Session Management

- **GET** `/api/auth/get-session` - Get current session
- **POST** `/api/auth/sign-out` - Sign out

### Passkey (WebAuthn)

- **POST** `/api/auth/passkey/register` - Register a passkey
- **POST** `/api/auth/passkey/authenticate` - Authenticate with passkey
- **GET** `/api/auth/passkey/list` - List user's passkeys

### Organization Plugin

- **POST** `/api/auth/organization/create` - Create organization
- **GET** `/api/auth/organization/list` - List user's organizations
- **POST** `/api/auth/organization/invite` - Invite user to organization
- **POST** `/api/auth/organization/accept-invitation` - Accept invitation
- **POST** `/api/auth/organization/leave` - Leave organization
- **POST** `/api/auth/organization/remove-member` - Remove member

## Configuration

The auth instance is configured in `src/lib/auth.ts` with:

```typescript
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8000',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [passkey(), organization()],
  // ... database hooks for user creation
})
```

## Mounting in Hono

The Better Auth handler is mounted in `src/index.ts`:

```typescript
// Mount Better Auth routes at /api/auth/*
app.on(['POST', 'GET'], '/api/auth/*', c => {
  return auth.handler(c.req.raw)
})
```

## Frontend Integration

Update your frontend auth client to point to the backend:

```typescript
// apps/web/src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/client'
import { passkeyClient } from '@better-auth/passkey/client'
import { organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  plugins: [passkeyClient(), organizationClient()],
})
```

## Example Usage

### Sign Up

```bash
curl -X POST http://localhost:8000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }'
```

### Sign In

```bash
curl -X POST http://localhost:8000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Get Session

```bash
curl http://localhost:8000/api/auth/get-session \
  -H "Cookie: better-auth.session_token=<session-token>"
```

### Sign Out

```bash
curl -X POST http://localhost:8000/api/auth/sign-out \
  -H "Cookie: better-auth.session_token=<session-token>"
```

## Environment Variables

Required environment variables in `.env`:

```env
# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:8000"

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Database Hooks

When a user signs up, the following are automatically created:

1. **User** record
2. **Organization** for the user
3. **Subscription** (FREE plan)
4. **UserOrganization** membership (OWNER role)
5. User's `defaultOrgId` is set

This happens via the `databaseHooks.user.create.after` hook in the auth configuration.

## CORS Configuration

CORS is configured to allow:

- `http://localhost:3000` (web app)
- `http://localhost:3001` (alternative port)

With credentials enabled for cookie-based auth.

## Security Notes

- Sessions are stored in database via Prisma adapter
- Passkeys use WebAuthn for passwordless authentication
- Social auth uses OAuth 2.0 flow
- Cookies are httpOnly and secure in production
- CSRF protection is built-in

## Testing Auth

1. Start the backend:

```bash
cd apps/backend
bun run dev
```

2. Test sign-up:

```bash
curl -X POST http://localhost:8000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

3. Extract the session token from the `Set-Cookie` response header

4. Use the session token in subsequent requests:

```bash
curl http://localhost:8000/api/v1/recipes \
  -H "Cookie: better-auth.session_token=<token>"
```

## Debugging

Enable debug logs:

```typescript
export const auth = betterAuth({
  // ... other config
  advanced: {
    debug: true,
  },
})
```

Or set environment variable:

```env
DEBUG=better-auth:*
```
