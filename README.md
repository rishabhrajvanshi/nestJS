# 🏗️ NestJS Monorepo with Cassandra and gRPC

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  A production-ready <strong>microservices monorepo</strong> built with NestJS, featuring gRPC communication, Cassandra database, and shared libraries.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api-docs">API Docs</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 🚀 Quick Start

Get your microservices stack running in 3 commands:

```bash
# 1. Install dependencies
npm install

# 2. Start Data Processor (MUST start first)
npm run start:data-processor

# 3. Start API Gateway (in another terminal)
npm run start:api-gateway
```

**Test it works:**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","age":25}'
```

## 🏗️ Architecture

```
┌─────────────┐    gRPC     ┌─────────────────┐    Database    ┌─────────────┐
│ API Gateway │────────────▶│ Data Processor  │───────────────▶│  Cassandra  │
│   :3001     │             │ :50051 + :3002  │                │    :9042    │
└─────────────┘             └─────────────────┘                └─────────────┘
      │                              │
      │                              │
   HTTP API                     gRPC + HTTP
  (Client-facing)               (Internal + Monitoring)
```

### Key Components

- **🚪 API Gateway** - HTTP REST API, gRPC client, request validation
- **⚙️ Data Processor** - gRPC server, data enrichment, database operations  
- **💾 Cassandra Service** - Shared database library with connection management
- **📋 Protocol Buffers** - Type-safe inter-service communication

## 🌟 Features

✅ **Microservices Architecture** - Loosely coupled, independently scalable services  
✅ **gRPC Communication** - High-performance binary protocol with type safety  
✅ **Cassandra Integration** - Distributed NoSQL database for scalability  
✅ **Monorepo Structure** - Shared libraries and consistent tooling  
✅ **Production Ready** - Health checks, error handling, structured logging  
✅ **Type Safety** - Full TypeScript with Protocol Buffers  

## 📊 System Overview

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| API Gateway | 3001 | HTTP | Client-facing REST API |
| Data Processor | 50051 | gRPC | High-performance data processing |
| Data Processor | 3002 | HTTP | Health checks & monitoring |
| Cassandra | 9042 | CQL | Distributed database |

## 🧪 API Examples

### Create User
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@company.com",
    "age": 29
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice Johnson",
    "email": "alice@company.com",
    "age": 29,
    "processedBy": "data-processor-service",
    "enrichedInfo": "User from api-gateway | Age group: Young Adult | Email domain: company.com",
    "timestamp": "2025-07-02T17:33:21.213Z"
  }
}
```

### Get All Users
```bash
curl http://localhost:3001/users
```

### Health Checks
```bash
# API Gateway health
curl http://localhost:3001/health

# Data Processor health
curl http://localhost:3002/health
```

## 📁 Project Structure

```
nestJS/
├── apps/
│   ├── api-gateway/         # HTTP API server (port 3001)
│   │   ├── src/
│   │   │   ├── api-gateway.controller.ts
│   │   │   ├── api-gateway.service.ts
│   │   │   └── main.ts
│   │   └── test/
│   └── data-processor/      # gRPC + HTTP server (ports 50051 + 3002)
│       ├── src/
│       │   ├── data-processor.controller.ts
│       │   ├── data-processor.service.ts
│       │   └── main.ts
│       └── test/
├── libs/
│   ├── cassandra/          # Shared database service
│   │   └── src/
│   │       ├── cassandra.service.ts
│   │       └── index.ts
│   └── shared/             # Shared types and interfaces
│       └── src/
│           ├── interfaces.ts
│           └── index.ts
├── proto/
│   └── data-processing.proto # gRPC service definition
├── docs/                   # API and gRPC documentation
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Apache Cassandra 4.0+
- NestJS CLI: `npm i -g @nestjs/cli`

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd nestJS

# Install dependencies
npm install
```

### Running Services

**⚠️ Important:** Start Data Processor first (API Gateway depends on it)

```bash
# Terminal 1: Start Data Processor
npm run start:data-processor

# Terminal 2: Start API Gateway  
npm run start:api-gateway
```

### Available Scripts

```bash
# Development
npm run start:api-gateway       # Start API Gateway
npm run start:data-processor    # Start Data Processor

# Building
npm run build:api-gateway       # Build API Gateway
npm run build:data-processor    # Build Data Processor
npm run build                   # Build all applications

# Testing
npm run test                    # Run unit tests
npm run test:e2e               # Run end-to-end tests
npm run lint                   # Lint code
```

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build all services
docker-compose build

# Start the stack
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start services
NODE_ENV=production npm run start:prod:data-processor
NODE_ENV=production npm run start:prod:api-gateway
```

### Environment Variables
```bash
# Cassandra Configuration
CASSANDRA_HOSTS=localhost
CASSANDRA_KEYSPACE=my_keyspace
CASSANDRA_USERNAME=cassandra
CASSANDRA_PASSWORD=cassandra

# Service Configuration
API_GATEWAY_PORT=3001
DATA_PROCESSOR_GRPC_PORT=50051
DATA_PROCESSOR_HTTP_PORT=3002

# Logging
LOG_LEVEL=info
```

## 📚 Documentation

- **[Setup Guide](MONOREPO_GUIDE.md)** - Detailed setup and troubleshooting
- **[API Documentation](docs/API.md)** - REST API endpoints and examples
- **[gRPC Documentation](docs/GRPC.md)** - Protocol Buffer schemas and methods
- **[Architecture](docs/ARCHITECTURE.md)** - System design and component details

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:e2e
```

### Manual Testing
```bash
# Health checks
curl http://localhost:3001/health
curl http://localhost:3002/health

# Create user
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","age":30}'

# Get users
curl http://localhost:3001/users
```

## 🐛 Troubleshooting

### Common Issues

**"Connection refused" errors:**
```bash
# Check if services are running
netstat -an | grep -E "(3001|3002|50051|9042)"

# Start Cassandra if needed
brew services start cassandra
```

**gRPC connection issues:**
```bash
# Ensure Data Processor starts before API Gateway
npm run start:data-processor  # Start this first
npm run start:api-gateway     # Then start this
```

**Database connection errors:**
```bash
# Test Cassandra connection
cqlsh -e "DESCRIBE KEYSPACES;"

# Check keyspace exists
cqlsh -e "USE my_keyspace; DESCRIBE TABLES;"
```

For more troubleshooting, see [MONOREPO_GUIDE.md](MONOREPO_GUIDE.md#troubleshooting-guide).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Add tests for new features
- Update documentation
- Use conventional commits
- Ensure all services pass health checks

## 📈 Performance

- **gRPC Communication:** Sub-millisecond latency for inter-service calls
- **Cassandra:** Handles millions of writes per second with proper partitioning
- **HTTP/2:** Multiplexed connections for efficient client communication
- **Connection Pooling:** Optimized database connection management

## 🔒 Security

- Input validation on all endpoints
- gRPC TLS encryption (production)
- Cassandra authentication and authorization
- Rate limiting and DDoS protection
- Security headers and CORS configuration

## 📊 Monitoring

- Health check endpoints on all services
- Structured logging with correlation IDs
- Metrics collection (Prometheus compatible)
- Distributed tracing support
- Error tracking and alerting

## 🚀 What's Next?

- [ ] Add JWT authentication
- [ ] Implement caching layer (Redis)
- [ ] Add Swagger/OpenAPI documentation
- [ ] Create Kubernetes manifests
- [ ] Add monitoring dashboard
- [ ] Implement event streaming
- [ ] Add API versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Apache Cassandra](https://cassandra.apache.org/) - Distributed database
- [gRPC](https://grpc.io/) - High-performance RPC framework
- [Protocol Buffers](https://developers.google.com/protocol-buffers) - Serialization library

---

<p align="center">
  Made with ❤️ using NestJS, gRPC, and Cassandra
</p>
