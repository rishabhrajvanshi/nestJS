# 🏗️ NestJS Monorepo with Cassandra and gRPC

This project demonstrates a **monorepo architecture** with two NestJS applications communicating via **gRPC** and using a shared **Cassandra** database service.

## 📁 Project Structure

```
nestJS/
├── apps/
│   ├── api-gateway/         # App 1: HTTP API (Port 3001)
│   ├── data-processor/      # App 2: gRPC Server (Port 50051, HTTP 3002)
│   └── nestJS/             # Original app (can be removed)
├── libs/
│   ├── cassandra/          # Shared Cassandra service
│   └── shared/             # Shared types/interfaces
├── proto/
│   └── data-processing.proto # gRPC service definition
└── package.json
```

## 🔄 System Architecture

```
HTTP Request → API Gateway → gRPC → Data Processor → Cassandra DB
     ↓              ↓            ↓           ↓            ↓
   Port 3001    Port 3001   Port 50051  Port 3002   Port 9042
```

### **Flow:**
1. **User** sends HTTP POST to API Gateway (`localhost:3001/users`)
2. **API Gateway** enriches data and sends gRPC request to Data Processor
3. **Data Processor** receives gRPC, adds more enrichment, saves to Cassandra
4. **Cassandra** stores processed data in `my_keyspace.processed_data` table
5. **Response** flows back through the chain

## 🚀 Getting Started

### **1. Start Cassandra**
```bash
# Cassandra should already be running from installation
brew services list | grep cassandra

# If not running, start it
brew services start cassandra
```

### **2. Start Data Processor (App 2)**
```bash
# Terminal 1 - Start the gRPC server first
npm run start:data-processor
```

You should see:
```
🚀 Data Processor gRPC server is running on localhost:50051
📡 Data Processor HTTP server is running on http://localhost:3002
```

### **3. Start API Gateway (App 1)**
```bash
# Terminal 2 - Start the HTTP API
npm run start:api-gateway
```

You should see:
```
🚀 API Gateway is running on http://localhost:3001
```

## 🧪 Testing the System

### **Test 1: Health Checks**

```bash
# Check API Gateway
curl http://localhost:3001/health

# Check Data Processor
curl http://localhost:3002/health
```

### **Test 2: Create User (Complete Flow)**

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "age": 28
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-generated-id",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "processedBy": "data-processor-service",
    "enrichedInfo": "User from api-gateway | Age group: Young Adult | Email domain: example.com | Processed at: 2025-01-07T...",
    "timestamp": "2025-01-07T...",
    "processingTimestamp": "2025-01-07T..."
  },
  "message": "User data processed successfully",
  "timestamp": "2025-01-07T..."
}
```

### **Test 3: Retrieve All Users**

```bash
# Via API Gateway
curl http://localhost:3001/users

# Via Data Processor directly
curl http://localhost:3002/users
```

### **Test 4: Verify in Cassandra**

```bash
cqlsh
```

```sql
USE my_keyspace;
SELECT * FROM processed_data;
```

## 📊 What Each Component Does

### **🚪 API Gateway (App 1)**
- **Port:** 3001
- **Role:** HTTP API entry point
- **Functions:**
  - Receives HTTP requests
  - Validates input data
  - Adds timestamp to user data
  - Sends data to Data Processor via gRPC
  - Returns processed results

### **⚙️ Data Processor (App 2)**
- **Ports:** 50051 (gRPC), 3002 (HTTP health checks)
- **Role:** Data processing and persistence
- **Functions:**
  - Receives gRPC requests
  - Enriches data (age group, email domain analysis)
  - Saves to Cassandra database
  - Returns processed data

### **💾 Cassandra Service (Shared Library)**
- **Location:** `libs/cassandra/`
- **Role:** Database abstraction layer
- **Functions:**
  - Connects to Cassandra cluster
  - Creates tables automatically
  - CRUD operations for processed data
  - Connection management

## 🔧 Available Scripts

```bash
# Development
npm run start:api-gateway     # Start API Gateway in watch mode
npm run start:data-processor  # Start Data Processor in watch mode

# Building
npm run build:api-gateway     # Build API Gateway
npm run build:data-processor  # Build Data Processor

# Testing
npm run test                  # Run all tests
npm run lint                  # Lint all code
```

## 🌟 Key Features Demonstrated

### **✅ Monorepo Architecture**
- Multiple applications in one repository
- Shared libraries (`libs/cassandra`, `libs/shared`)
- Consistent tooling and dependencies

### **✅ gRPC Communication**
- Type-safe inter-service communication
- Protocol buffer definitions
- Async request/response pattern

### **✅ Shared Database Service**
- Reusable Cassandra connection
- Automatic table creation
- Clean separation of concerns

### **✅ Different Ports**
- API Gateway: 3001 (HTTP)
- Data Processor: 50051 (gRPC) + 3002 (HTTP)
- Cassandra: 9042

## 🐛 Troubleshooting

### **gRPC Connection Issues**
```bash
# Check if Data Processor is running
netstat -an | grep 50051
```

### **Cassandra Connection Issues**
```bash
# Check Cassandra status
brew services list | grep cassandra

# Connect manually
cqlsh

# Check keyspace
DESCRIBE KEYSPACES;
```

### **Build Errors**
```bash
# Clean build
rm -rf dist/
npm run build
```

## 📈 Next Steps

1. **Add Authentication** - JWT tokens, API keys
2. **Add Validation** - DTO validation with class-validator
3. **Add Error Handling** - Global exception filters
4. **Add Logging** - Structured logging with Winston
5. **Add Metrics** - Prometheus metrics
6. **Add Tests** - Unit and integration tests
7. **Add Docker** - Containerize all services

## 🎯 Success Criteria

✅ **API Gateway running on port 3001**  
✅ **Data Processor running on ports 50051 (gRPC) and 3002 (HTTP)**  
✅ **Cassandra connected and tables created**  
✅ **gRPC communication working**  
✅ **Data persisted in Cassandra**  
✅ **Complete request/response flow functional**

Your NestJS monorepo with Cassandra and gRPC is now ready! 🚀 