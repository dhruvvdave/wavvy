# Wavvy API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "beatmaker123",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "beatmaker123",
    "email": "user@example.com"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "beatmaker123",
    "email": "user@example.com"
  }
}
```

## Beats

### Get All Beats
```http
GET /beats
```

**Response:**
```json
{
  "beats": [
    {
      "id": "beat_id",
      "title": "My Beat",
      "description": "A cool beat",
      "bpm": 120,
      "pattern_data": {...},
      "plays": 100,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Beat by ID
```http
GET /beats/:id
```

**Response:**
```json
{
  "beat": {
    "id": "beat_id",
    "title": "My Beat",
    "description": "A cool beat",
    "bpm": 120,
    "pattern_data": {...},
    "plays": 100,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Create Beat
```http
POST /beats
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "My New Beat",
  "description": "An awesome beat",
  "bpm": 128,
  "pattern_data": {
    "steps": 16,
    "tracks": [...]
  }
}
```

**Response:**
```json
{
  "beat": {
    "id": "new_beat_id",
    "title": "My New Beat",
    "bpm": 128,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Beat
```http
PUT /beats/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "bpm": 140
}
```

### Delete Beat
```http
DELETE /beats/:id
Authorization: Bearer {token}
```

## File Upload

### Upload Audio File
```http
POST /upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "audio": [file]
}
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "filename": "audio-1234567890.mp3",
    "originalname": "mysong.mp3",
    "size": 5242880,
    "url": "/uploads/audio-1234567890.mp3"
  }
}
```

## SoundCloud Integration

### Search Tracks
```http
GET /soundcloud/search?q=search_query
```

**Response:**
```json
{
  "collection": [
    {
      "id": 123456,
      "title": "Track Title",
      "user": {
        "username": "Artist Name"
      },
      "artwork_url": "https://...",
      "duration": 180000,
      "permalink_url": "https://soundcloud.com/..."
    }
  ]
}
```

**Note:** Requires `SOUNDCLOUD_CLIENT_ID` in environment variables.

### Get Stream URL
```http
GET /soundcloud/stream/:trackId
```

## Spotify Integration

### Search Tracks
```http
GET /spotify/search?q=search_query&type=track&limit=20
```

**Response:**
```json
{
  "tracks": {
    "items": [
      {
        "id": "track_id",
        "name": "Track Name",
        "artists": [{"name": "Artist Name"}],
        "album": {
          "name": "Album Name",
          "images": [{"url": "https://..."}]
        },
        "duration_ms": 180000,
        "preview_url": "https://...",
        "external_urls": {
          "spotify": "https://open.spotify.com/track/..."
        }
      }
    ]
  }
}
```

**Note:** Requires `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in environment variables.

### Get Track Details
```http
GET /spotify/track/:trackId
```

### Browse Categories
```http
GET /spotify/browse/categories
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

## Rate Limiting

Currently, there are no rate limits enforced. This may change in production.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Wavvy API is running"
}
```

## Notes

- All timestamps are in ISO 8601 format
- File uploads are limited to 10MB
- JWT tokens expire after 7 days
- SoundCloud and Spotify integrations require valid API credentials
