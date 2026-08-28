# FoodGrade Required OCR Backend Contract

**Status:** IMPLEMENTED in `apps/api` (Node.js / Express).

The frontend requires a secure proxy to communicate with Google's Cloud Vision (Gemini) API. 
This document defines the contract that the backend implements.

## OCR Proxy Endpoint

**Endpoint:** `POST /api/v1/vision/ocr`
**(Configured via `VISION_PROXY_ENDPOINT` environment variable in the PWA build)**

### Request Format
The client will send a `multipart/form-data` request containing the captured image.

**Form Data Fields:**
* `image`: (File) The captured food label image (JPEG or PNG).

**Headers:**
* `Authorization`: (Optional) Bearer token if user authentication is added in the future.

### Expected Backend Behavior
The backend MUST perform the following operations:
1. **Rate Limiting**: Enforce IP or user-based rate limits to prevent abuse.
2. **Payload Validation**: Reject files exceeding maximum size limits or unsupported types.
3. **Gemini Invocation**: Forward the image to the official Google Gemini API (`gemini-3.7-flash` or current configured model) with the appropriate instruction prompt for extracting JSON OCR data.
4. **Error Handling**: Map Gemini API errors (e.g., rate limits, bad requests) to standard HTTP status codes.

### Response Format
The endpoint must return a JSON response containing the extracted OCR text and confidence scores matching the `IVisionProvider` signature.

**Success Response (200 OK):**
```json
{
  "text": "Ingredients: Water, Sugar, Citric Acid...",
  "confidence": 0.98,
  "provider": "gemini-3.7-flash"
}
```

**Error Responses:**
* `400 Bad Request`: Invalid image format or payload too large.
* `429 Too Many Requests`: Client exceeded rate limits.
* `502 Bad Gateway`: Downstream Gemini API failure.
* `504 Gateway Timeout`: Gemini API took too long to respond.

### Security Boundaries
* The frontend browser MUST NEVER possess or transmit the `GEMINI_API_KEY`.
* The backend proxy is the ONLY component authorized to hold the `GEMINI_API_KEY`.
* The frontend `GeminiVisionProvider` will throw a `VisionEndpointMissingError` if `VISION_PROXY_ENDPOINT` is not configured at build time, preventing accidental direct key exposure.
