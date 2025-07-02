# 📚 REST API Documentation

This document provides comprehensive documentation for the **API Gateway** REST endpoints.

## 🌐 Base URL

```
http://localhost:3001
```

## 📋 Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Root](#root)
  - [Health Check](#health-check)
  - [Users](#users)
- [Data Models](#data-models)
- [Response Formats](#response-formats)
- [Examples](#examples)

---

## 🔐 Authentication

Currently, no authentication is required. This is suitable for development and testing environments.

**⚠️ Production Note:** Implement JWT authentication or API keys before deploying to production.

---

## ❌ Error Handling

All API responses follow a consistent error format:

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2025-07-02T17:35:42.224Z",
    "path": "/api/endpoint"
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input data |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error - Server-side error |
| `503` | Service Unavailable - Dependent service down |

---

## 🔗 Endpoints

### Root

Get welcome message from API Gateway.

**Endpoint:** `GET /`

**Description:** Returns a welcome message to verify the API Gateway is running.

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/html

Hello from API Gateway! Ready to process user data.
```

**Example:**
```bash
curl http://localhost:3001/
```

---

### Health Check

Check the health status of the API Gateway service.

**Endpoint:** `GET /health`

**Description:** Returns the health status and basic information about the API Gateway service.

**Response Schema:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-02T17:35:42.224Z",
  "service": "api-gateway",
  "version": "1.0.0",
  "uptime": 12345,
  "dependencies": {
    "data-processor": "connected",
    "cassandra": "connected"
  }
}
```

**Example:**
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-02T17:35:42.224Z",
  "service": "api-gateway"
}
```

---

## 👤 Users

### Create User

Process and store user data through the complete microservices pipeline.

**Endpoint:** `POST /users`

**Description:** Creates a new user by sending data through the gRPC pipeline to the Data Processor, which enriches the data and stores it in Cassandra.

**Content-Type:** `application/json`

**Request Schema:**
```json
{
  "name": "string (required, 1-100 characters)",
  "email": "string (required, valid email format)",
  "age": "number (required, integer 1-150)"
}
```

**Request Example:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@company.com",
  "age": 29
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "email": "string",
    "age": "number",
    "processedBy": "string",
    "enrichedInfo": "string",
    "timestamp": "string (ISO 8601)",
    "processingTimestamp": "string (ISO 8601)"
  },
  "message": "string",
  "timestamp": "string (ISO 8601)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice Johnson",
    "email": "alice@company.com",
    "age": 29,
    "processedBy": "data-processor-service",
    "enrichedInfo": "User from api-gateway | Age group: Young Adult | Email domain: company.com | Processed at: 2025-07-02T17:33:21.225Z",
    "timestamp": "2025-07-02T17:33:21.213Z",
    "processingTimestamp": "2025-07-02T17:33:21.226Z"
  },
  "message": "User data processed successfully",
  "timestamp": "2025-07-02T17:33:21.257Z"
}
```

**Error Responses:**

**400 Bad Request - Invalid Input:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data: age must be a number between 1 and 150",
    "timestamp": "2025-07-02T17:35:42.224Z",
    "path": "/users"
  }
}
```

**500 Internal Server Error - Processing Failed:**
```json
{
  "success": false,
  "error": {
    "code": "PROCESSING_ERROR",
    "message": "Failed to process user data: Data Processor service unavailable",
    "timestamp": "2025-07-02T17:35:42.224Z",
    "path": "/users"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@company.com",
    "age": 29
  }'
```

---

### Get All Users

Retrieve all processed users from the database.

**Endpoint:** `GET /users`

**Description:** Fetches all processed users from Cassandra through the Data Processor HTTP endpoint.

**Response Schema:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (UUID)",
      "name": "string",
      "email": "string",
      "age": "number",
      "processedBy": "string",
      "enrichedInfo": "string",
      "timestamp": "string (ISO 8601)",
      "processingTimestamp": "string (ISO 8601)"
    }
  ],
  "count": "number",
  "timestamp": "string (ISO 8601)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Alice Johnson",
      "email": "alice@company.com",
      "age": 29,
      "processedBy": "data-processor-service",
      "enrichedInfo": "User from api-gateway | Age group: Young Adult | Email domain: company.com | Processed at: 2025-07-02T17:33:21.225Z",
      "timestamp": "2025-07-02T17:33:21.213Z",
      "processingTimestamp": "2025-07-02T17:33:21.226Z"
    },
    {
      "id": "16fd5b86-3415-4c34-ab8c-d9d901dc165b",
      "name": "Bob Smith",
      "email": "bob@tech.com",
      "age": 34,
      "processedBy": "data-processor-service",
      "enrichedInfo": "User from api-gateway | Age group: Adult | Email domain: tech.com | Processed at: 2025-07-02T17:45:12.155Z",
      "timestamp": "2025-07-02T17:45:12.125Z",
      "processingTimestamp": "2025-07-02T17:45:12.155Z"
    }
  ],
  "count": 2,
  "timestamp": "2025-07-02T17:35:20.787Z"
}
```

**Empty Response (200):**
```json
{
  "success": true,
  "data": [],
  "count": 0,
  "timestamp": "2025-07-02T17:35:20.787Z"
}
```

**Error Response (503):**
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Data Processor service is unavailable",
    "timestamp": "2025-07-02T17:35:42.224Z",
    "path": "/users"
  }
}
```

**Example:**
```bash
curl http://localhost:3001/users
```

---

## 📊 Data Models

### User Input (Request)

```typescript
interface UserInput {
  name: string;        // 1-100 characters, required
  email: string;       // Valid email format, required  
  age: number;         // Integer 1-150, required
}
```

**Validation Rules:**
- `name`: Non-empty string, 1-100 characters
- `email`: Valid email format (RFC 5322 compliant)
- `age`: Positive integer between 1 and 150

### Processed User (Response)

```typescript
interface ProcessedUser {
  id: string;                    // UUID v4 format
  name: string;                  // Original user name
  email: string;                 // Original email address
  age: number;                   // Original age
  processedBy: string;           // Service that processed the data
  enrichedInfo: string;          // Additional processed information
  timestamp: string;             // ISO 8601 timestamp (original request)
  processingTimestamp: string;   // ISO 8601 timestamp (when processed)
}
```

### Age Group Classifications

The system automatically classifies users into age groups:

| Age Range | Classification |
|-----------|----------------|
| 1-17 | Minor |
| 18-25 | Young Adult |
| 26-35 | Adult |
| 36-50 | Middle-aged |
| 51+ | Senior |

### Email Domain Analysis

The system extracts and analyzes email domains:
- Extracts domain from email address (e.g., `company.com` from `alice@company.com`)
- Includes domain information in `enrichedInfo` field

---

## 📝 Response Formats

### Success Response

All successful API calls return this format:

```json
{
  "success": true,
  "data": "<response-data>",
  "message": "<optional-success-message>",
  "timestamp": "<iso-8601-timestamp>"
}
```

### Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "<error-code>",
    "message": "<human-readable-message>",
    "timestamp": "<iso-8601-timestamp>",
    "path": "<api-endpoint>"
  }
}
```

---

## 🧪 Complete Examples

### Example 1: Create and Retrieve User

**Step 1: Create User**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Williams",
    "email": "sarah@startup.io",
    "age": 32
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "a8b3c4d5-e6f7-8901-2345-6789abcdef01",
    "name": "Sarah Williams", 
    "email": "sarah@startup.io",
    "age": 32,
    "processedBy": "data-processor-service",
    "enrichedInfo": "User from api-gateway | Age group: Adult | Email domain: startup.io | Processed at: 2025-07-02T18:15:30.445Z",
    "timestamp": "2025-07-02T18:15:30.420Z",
    "processingTimestamp": "2025-07-02T18:15:30.445Z"
  },
  "message": "User data processed successfully",
  "timestamp": "2025-07-02T18:15:30.450Z"
}
```

**Step 2: Retrieve All Users**
```bash
curl http://localhost:3001/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a8b3c4d5-e6f7-8901-2345-6789abcdef01",
      "name": "Sarah Williams",
      "email": "sarah@startup.io", 
      "age": 32,
      "processedBy": "data-processor-service",
      "enrichedInfo": "User from api-gateway | Age group: Adult | Email domain: startup.io | Processed at: 2025-07-02T18:15:30.445Z",
      "timestamp": "2025-07-02T18:15:30.420Z",
      "processingTimestamp": "2025-07-02T18:15:30.445Z"
    }
  ],
  "count": 1,
  "timestamp": "2025-07-02T18:15:45.123Z"
}
```

### Example 2: Error Handling

**Invalid Age (Too High):**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Old Person",
    "email": "old@example.com",
    "age": 200
  }'
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data: age must be between 1 and 150",
    "timestamp": "2025-07-02T18:20:15.789Z",
    "path": "/users"
  }
}
```

**Invalid Email Format:**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "not-an-email",
    "age": 25
  }'
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR", 
    "message": "Invalid input data: email must be a valid email address",
    "timestamp": "2025-07-02T18:22:30.456Z",
    "path": "/users"
  }
}
```

---

## 🔧 Development Notes

### Architecture Flow

1. **Client** → API Gateway (`POST /users`)
2. **API Gateway** → Data Processor (gRPC `ProcessUserData`)
3. **Data Processor** → Cassandra (Database save)
4. **Response** flows back through the chain

### Performance Considerations

- **gRPC Communication:** High-performance binary protocol for data processing
- **HTTP Fallback:** Standard REST for monitoring and retrieval
- **Connection Pooling:** Efficient database connections
- **Async Processing:** Non-blocking I/O operations

### Monitoring

- All requests include correlation IDs for tracing
- Health checks available on both services
- Structured logging for debugging
- Error tracking with full stack traces

---

## 📈 Rate Limits

Currently no rate limiting is implemented. Consider adding rate limiting for production:

```typescript
// Example rate limiting (not implemented)
{
  "windowMs": 900000,        // 15 minutes
  "max": 100,                // 100 requests per window
  "message": "Too many requests"
}
```

---

## 🔒 Security Considerations

### Development Environment
- No authentication required
- All endpoints publicly accessible
- CORS enabled for all origins

### Production Recommendations
- Implement JWT authentication
- Add API key validation
- Enable HTTPS only
- Configure CORS for specific origins
- Add input sanitization
- Implement rate limiting
- Enable request logging

---

**📚 For more information:**
- [Setup Guide](../MONOREPO_GUIDE.md)
- [gRPC Documentation](GRPC.md)
- [Architecture Overview](../README.md#architecture) 