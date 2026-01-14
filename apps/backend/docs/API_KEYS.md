# API Key Authentication

The Culyn backend supports two authentication methods:

1. **Better Auth Sessions** (for web/mobile apps)
2. **API Keys** (for server-to-server integrations, CLIs, scripts)

## Using API Keys

### Creating an API Key

API keys can only be created via authenticated session (not via another API key).

**Request:**

```bash
POST /api/v1/api-keys
Content-Type: application/json
Cookie: better-auth.session_token=<your-session>

{
  "name": "My Integration",
  "expiresInDays": 90  // optional, max 365 days
}
```

**Response:**

```json
{
  "message": "API key created successfully",
  "apiKey": "culyn_a1b2c3d4e5f6...", // SAVE THIS - shown only once!
  "id": "clx123...",
  "name": "My Integration",
  "keyPrefix": "culyn_a1b2c3",
  "expiresAt": "2024-04-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

⚠️ **Important**: The full API key is only shown once during creation. Store it securely!

### Using API Keys

Include the API key in requests using either method:

**Option 1: Authorization Header (Recommended)**

```bash
curl -H "Authorization: Bearer culyn_a1b2c3d4e5f6..." \
  http://localhost:8000/api/v1/recipes
```

**Option 2: X-API-Key Header**

```bash
curl -H "X-API-Key: culyn_a1b2c3d4e5f6..." \
  http://localhost:8000/api/v1/recipes
```

### Listing API Keys

**Request:**

```bash
GET /api/v1/api-keys
Authorization: Bearer <api-key-or-session>
```

**Response:**

```json
[
  {
    "id": "clx123...",
    "name": "My Integration",
    "keyPrefix": "culyn_a1b2c3",
    "lastUsedAt": "2024-01-15T12:00:00.000Z",
    "expiresAt": "2024-04-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Deleting an API Key

**Request:**

```bash
DELETE /api/v1/api-keys/:id
Authorization: Bearer <api-key-or-session>
```

**Response:**

```json
{
  "message": "API key deleted successfully"
}
```

## Security Features

- **Hashed Storage**: API keys are hashed (SHA-256) before storage
- **Prefix Identification**: First 12 characters stored for identification
- **Soft Deletion**: Keys are soft-deleted, not permanently removed
- **Expiration**: Keys can have optional expiration dates
- **Last Used Tracking**: Track when keys were last used
- **User Isolation**: Users can only manage their own keys

## API Key Format

```
culyn_<64-character-hex-string>
```

Example: `culyn_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

## Authentication Priority

When a request includes multiple authentication methods:

1. **API Key** (Authorization: Bearer header) - checked first
2. **API Key** (X-API-Key header) - checked second
3. **Better Auth Session** (Cookie) - fallback

## Example: Python Script

```python
import requests

API_KEY = "culyn_a1b2c3d4e5f6..."
BASE_URL = "http://localhost:8000/api/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# List recipes
response = requests.get(f"{BASE_URL}/recipes", headers=headers)
recipes = response.json()

# Create grocery list
payload = {
    "recipeSlug": "chicken-curry",
    "ingredientIds": ["ing_123", "ing_456"]
}
response = requests.post(f"{BASE_URL}/lists", json=payload, headers=headers)
```

## Example: Node.js Script

```javascript
const API_KEY = 'culyn_a1b2c3d4e5f6...'
const BASE_URL = 'http://localhost:8000/api/v1'

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

// List recipes
const recipes = await fetch(`${BASE_URL}/recipes`, { headers }).then(res => res.json())

// Create grocery list
const payload = {
  recipeSlug: 'chicken-curry',
  ingredientIds: ['ing_123', 'ing_456'],
}

const result = await fetch(`${BASE_URL}/lists`, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
}).then(res => res.json())
```

## Example: cURL

```bash
# Create API key (requires session)
curl -X POST http://localhost:8000/api/v1/api-keys \
  -H "Cookie: better-auth.session_token=<session>" \
  -H "Content-Type: application/json" \
  -d '{"name":"CLI Tool","expiresInDays":90}'

# Use API key
export CULYN_API_KEY="culyn_a1b2c3d4e5f6..."

# List recipes
curl -H "Authorization: Bearer $CULYN_API_KEY" \
  http://localhost:8000/api/v1/recipes

# Get user stats
curl -H "Authorization: Bearer $CULYN_API_KEY" \
  http://localhost:8000/api/v1/user/stats

# Generate recipe from URL
curl -X POST http://localhost:8000/api/v1/recipes/generate \
  -H "Authorization: Bearer $CULYN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://instagram.com/reel/abc123","sourceType":"INSTAGRAM_REEL"}'
```

## Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** to store keys
3. **Create separate keys** for different integrations
4. **Set expiration dates** for long-running keys
5. **Rotate keys regularly** for production use
6. **Delete unused keys** immediately
7. **Monitor last used timestamps** for suspicious activity

## Limitations

- Maximum 365 days expiration
- API keys inherit full user permissions
- No fine-grained permissions per key (yet)
- Cannot create API keys using another API key (requires session)
