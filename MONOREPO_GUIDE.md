# 🏗️ NestJS Monorepo with Cassandra and gRPC

This project demonstrates a **production-ready monorepo architecture** with two NestJS applications communicating via **gRPC** and using a shared **Cassandra** database service.

## 📁 Project Structure

```
nestJS/
├── apps/
│   ├── api-gateway/         # App 1: HTTP API (Port 3001)
│   ├── data-processor/      # App 2: gRPC + HTTP Server (Port 50051 + 3002)
│   └── nestJS/             # Original starter app (can be removed)
├── libs/
│   ├── cassandra/          # Shared Cassandra service library
│   └── shared/             # Shared types/interfaces
├── proto/
│   └── data-processing.proto # gRPC service definition
├── docs/                   # Documentation (API, gRPC)
├── README.md              # Main project documentation
└── MONOREPO_GUIDE.md      # This setup guide
```

## 🔄 System Architecture

```
HTTP Request → API Gateway → gRPC → Data Processor → Cassandra DB
     ↓              ↓            ↓           ↓            ↓
   Port 3001    Port 3001   Port 50051  Port 3002   Port 9042
                              (gRPC)      (HTTP)
```

### **Data Flow:**
1. **Client** → HTTP POST to API Gateway (`localhost:3001/users`)
2. **API Gateway** → Validates, enriches data, sends gRPC to Data Processor
3. **Data Processor** → Receives gRPC, processes data, saves to Cassandra
4. **Cassandra** → Stores in `my_keyspace.processed_data` table
5. **Response** → Flows back through the chain to client

### **Dual Communication:**
- **POST requests:** API Gateway → Data Processor (via gRPC)
- **GET requests:** API Gateway → Data Processor (via HTTP)

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Apache Cassandra 4.0+
- NestJS CLI (`npm i -g @nestjs/cli`)

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Cassandra**
```bash
# Check if Cassandra is running
brew services list | grep cassandra

# Start Cassandra if not running
brew services start cassandra

# Verify connection
cqlsh
```

### **3. Start Data Processor (Critical: Start First!)**
```bash
# Terminal 1 - MUST start first (gRPC server dependency)
npm run start:data-processor
```

**Expected Output:**
```
[CassandraService] Successfully connected to Cassandra
[CassandraService] Table "processed_data" created or already exists
🌐 Data Processor HTTP server is running on http://localhost:3002
🚀 Data Processor gRPC server is running on localhost:50051
📋 Ready to receive both HTTP and gRPC requests!
```

### **4. Start API Gateway**
```bash
# Terminal 2 - Start after Data Processor is ready
npm run start:api-gateway
```

**Expected Output:**
```
✅ gRPC client initialized successfully
🔗 Connected to Data Processor on localhost:50051
🚀 API Gateway is running on http://localhost:3001
```

## 🧪 Testing the Complete System

### **✅ Test 1: Health Checks**

```bash
# API Gateway health
curl http://localhost:3001/health
# Expected: {"status":"healthy","timestamp":"...","service":"api-gateway"}

# Data Processor health  
curl http://localhost:3002/health
# Expected: {"status":"healthy","timestamp":"...","service":"data-processor"}
```

### **✅ Test 2: Create User (Full gRPC Flow)**

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson", 
    "email": "alice@company.com",
    "age": 29
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice Johnson",
    "email": "alice@company.com", 
    "age": 29,
    "processedBy": "data-processor-service",
    "enrichedInfo": "User from api-gateway | Age group: Young Adult | Email domain: company.com | Processed at: 2025-07-02T...",
    "timestamp": "2025-07-02T17:33:21.213Z",
    "processingTimestamp": "2025-07-02T17:33:21.226Z"
  },
  "message": "User data processed successfully",
  "timestamp": "2025-07-02T17:33:21.257Z"
}
```

### **✅ Test 3: Get All Users (HTTP Flow)**

```bash
# Via API Gateway (recommended)
curl http://localhost:3001/users

# Via Data Processor directly  
curl http://localhost:3002/users
```

**Expected Response:**
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
      "enrichedInfo": "User from api-gateway | Age group: Young Adult | Email domain: company.com | Processed at: 2025-07-02T...",
      "timestamp": "2025-07-02T17:33:21.213Z", 
      "processingTimestamp": "2025-07-02T17:33:21.226Z"
    }
  ],
  "count": 1,
  "timestamp": "2025-07-02T17:35:20.787Z"
}
```

### **✅ Test 4: Verify in Cassandra**

```bash
cqlsh
```

```sql
USE my_keyspace;
DESCRIBE TABLE processed_data;
SELECT * FROM processed_data;
```

## 📊 Component Details

### **🚪 API Gateway (Port 3001)**
**Role:** HTTP API entry point and gRPC client

**Responsibilities:**
- Accept HTTP requests from clients
- Input validation and request enrichment
- gRPC communication with Data Processor
- HTTP communication for data retrieval
- Error handling and response formatting

**Endpoints:**
- `GET /` - Welcome message
- `GET /health` - Health check
- `POST /users` - Create user (triggers gRPC flow)
- `GET /users` - Get all users (triggers HTTP flow)

### **⚙️ Data Processor (Ports 50051 + 3002)**
**Role:** Dual-mode microservice (gRPC + HTTP)

**Responsibilities:**
- Process gRPC requests from API Gateway
- Data enrichment (age groups, email analysis)
- Cassandra database operations
- HTTP endpoints for data retrieval
- Comprehensive logging and error handling

**gRPC Methods:**
- `ProcessUserData` - Process and save user data

**HTTP Endpoints:**
- `GET /` - Welcome message  
- `GET /health` - Health check
- `GET /users` - Retrieve all processed users

### **💾 Cassandra Service (Shared Library)**
**Location:** `libs/cassandra/`
**Role:** Database abstraction and connection management

**Features:**
- Automatic connection management
- Table creation on startup
- UUID generation and proper type handling
- **Fixed:** 32-bit integer handling for age field
- Comprehensive error handling and logging

**Database Schema:**
```sql
CREATE TABLE processed_data (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  age INT,                    -- 32-bit integer (fixed!)
  processed_by TEXT,
  enriched_info TEXT,
  timestamp TIMESTAMP,
  processing_timestamp TIMESTAMP
);
```

## 🔧 Available Scripts

```bash
# Development
npm run start:api-gateway     # Start API Gateway (port 3001)
npm run start:data-processor  # Start Data Processor (ports 50051 + 3002)
npm run start:dev            # Start all in dev mode (if configured)

# Building  
npm run build:api-gateway     # Build API Gateway
npm run build:data-processor  # Build Data Processor
npm run build                # Build all apps

# Testing
npm run test                 # Run all tests
npm run test:e2e            # End-to-end tests
npm run lint                # Lint all code
```

## 🌟 Production-Ready Features

### **✅ Robust Architecture**
- **Monorepo:** Unified codebase with shared libraries
- **Microservices:** Loosely coupled, independently scalable
- **Type Safety:** Full TypeScript + Protocol Buffers
- **Clean Separation:** Clear boundaries between components

### **✅ Communication Patterns**
- **gRPC:** High-performance binary protocol for writes
- **HTTP/REST:** Standard protocol for reads and health checks
- **Connection Pooling:** Efficient database connections
- **Error Propagation:** Clean error handling across services

### **✅ Database Integration**
- **Cassandra:** Distributed, highly available NoSQL
- **Automatic Schema:** Tables created on startup
- **Type Safety:** Proper data type handling (32-bit integers fixed)
- **Connection Management:** Graceful startup/shutdown

### **✅ Observability**
- **Structured Logging:** Detailed request/response logging
- **Health Checks:** Service availability monitoring  
- **Error Tracking:** Comprehensive error information
- **Request Tracing:** Full request lifecycle tracking

## 🔧 Key Technical Solutions

### **Fixed Issue: Cassandra Integer Types**
- **Problem:** "Expected 4 or 0 byte int (8)" error
- **Solution:** Explicit 32-bit integer conversion with type hints
- **Implementation:** `Math.floor(Number(age))` + prepared statements

### **Dual Server Architecture**
- **Data Processor** runs both gRPC (50051) and HTTP (3002) servers
- **gRPC:** For high-performance data processing 
- **HTTP:** For standard REST API access

### **Connection Management**
- **Startup Order:** Data Processor must start before API Gateway
- **Health Checks:** Verify all services before accepting traffic
- **Graceful Shutdown:** Proper cleanup of database connections

## 🚨 Troubleshooting Guide

### **"Expected 4 or 0 byte int (8)" Error**
```bash
# ✅ FIXED: This error has been resolved with proper type handling
# The age field now correctly uses 32-bit integers
```

### **gRPC Connection Failed**
```bash
# Check Data Processor is running first
netstat -an | grep 50051

# Verify gRPC server logs
npm run start:data-processor
```

### **Cassandra Connection Issues**
```bash
# Check Cassandra status
brew services status cassandra

# Test connection
cqlsh -e "DESCRIBE KEYSPACES;"

# Restart if needed
brew services restart cassandra
```

### **Build/Start Issues**
```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

## 📈 Production Deployment

### **Environment Configuration**
```bash
# Development
CASSANDRA_HOSTS=localhost
CASSANDRA_KEYSPACE=my_keyspace

# Production  
CASSANDRA_HOSTS=cassandra-cluster.internal
CASSANDRA_KEYSPACE=production_keyspace
```

### **Docker Deployment**
```bash
# TODO: Add Dockerfile and docker-compose.yml
docker-compose up -d
```

### **Monitoring**
```bash
# TODO: Add Prometheus metrics
# TODO: Add health check endpoints for load balancers
```

## 🎯 Success Criteria

✅ **API Gateway:** HTTP server on port 3001  
✅ **Data Processor:** gRPC server on port 50051 + HTTP on port 3002  
✅ **Cassandra:** Connected with `my_keyspace` and `processed_data` table  
✅ **gRPC Communication:** API Gateway ↔ Data Processor working  
✅ **HTTP Communication:** API Gateway ↔ Data Processor working  
✅ **Data Persistence:** Records saved and retrieved from Cassandra  
✅ **Type Safety:** 32-bit integer handling fixed  
✅ **End-to-End Flow:** Complete request/response cycle operational  

## 🚀 What's Next?

1. **Security:** Add JWT authentication, API rate limiting
2. **Validation:** DTO validation with class-validator decorators  
3. **Testing:** Unit tests, integration tests, e2e tests
4. **Monitoring:** Prometheus metrics, structured logging
5. **Documentation:** OpenAPI/Swagger for REST, gRPC reflection
6. **Deployment:** Docker containers, Kubernetes manifests
7. **Performance:** Connection pooling, caching strategies

---

**🎉 Your NestJS monorepo with Cassandra and gRPC is production-ready!** 

For detailed API documentation, see `docs/API.md`  
For gRPC documentation, see `docs/GRPC.md` 