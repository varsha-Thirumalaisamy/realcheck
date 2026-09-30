# REALCHECK AI - API Documentation

## Enterprise APIs
All Enterprise API endpoints require an API key to be passed via the `X-API-Key` HTTP Header.
*Example: `X-API-Key: rc_ent_2026_secure`*

### 1. C2PA Cryptographic Verification
`POST /api/enterprise/c2pa/verify`

High-speed endpoint dedicated to extracting and verifying C2PA manifests from uploaded media files.

**Request Format (Multipart Form Data):**
- `file`: The media file (Image/Video/Audio) to verify.

**Response Schema:**
```json
{
  "status": "VALID | INVALID | NO_C2PA | UNSUPPORTED | VERIFICATION_ERROR",
  "has_c2pa": true,
  "manifest": { ... },
  "provenance": {
    "software_agent": "...",
    "created_at": "..."
  },
  "actions": [ ... ],
  "verification": {
    "is_valid": true,
    "details": []
  },
  "warnings": [],
  "request_id": "req_12345678",
  "processing_time_ms": 25.5
}
```

### 2. High-Throughput Batch Analyze
`POST /api/enterprise/batch/analyze`

High-throughput batch ingestion API that accepts multiple files and routes them asynchronously.

**Request Format (Multipart Form Data):**
- `files`: List of files to process.
- `texts`: List of text strings to process.

**Response Schema:**
```json
{
  "batch_id": "batch_12345678",
  "status": "QUEUED",
  "jobs": [
    {
      "job_id": "job_abcdef12",
      "media_type": "IMAGE",
      "status": "QUEUED"
    }
  ]
}
```

### 3. Check Batch Status
`GET /api/enterprise/batch/{batch_id}`

Retrieves the status of an ongoing or completed batch analysis.

**Response Schema:**
```json
{
  "batch_id": "batch_12345678",
  "status": "COMPLETED",
  "jobs": [
    {
      "job_id": "job_abcdef12",
      "status": "COMPLETED",
      "result_id": "RC-2026-1234",
      "error": null
    }
  ]
}
```
