# Fastflow Architecture and System Design

## Overview

Fastflow is a low-code platform for building custom LLM (Large Language Model) applications through a visual drag-and-drop interface. This document outlines the architecture, system design patterns, and technical implementation details.

## High-Level Architecture

Fastflow follows a modular monorepo architecture with four primary components:

1. **Server**: Node.js/Express backend that handles API logic and orchestrates flow execution
2. **UI**: React-based frontend providing the visual flow builder interface
3. **Components**: Library of pluggable nodes representing LLM models, tools, and integrations
4. **API Documentation**: Auto-generated Swagger documentation

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  UI (React)     │◄────►  Server (Node)  │◄────►  Database       │
│  - Flow Builder │     │  - API          │     │  - Flows        │
│  - Chatbot UI   │     │  - Execution    │     │  - Credentials  │
│                 │     │  - Node Loading │     │  - Chat History │
└─────────────────┘     └───────┬─────────┘     └─────────────────┘
                               ▲
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Components (Pluggable Nodes)                                  │
│   - LLM Models (OpenAI, Anthropic, etc.)                        │
│   - Vector Stores (Chroma, Pinecone, etc.)                      │
│   - Memory (Redis, MongoDB, etc.)                               │
│   - Tools & Integrations                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components Breakdown

### Server

The backend is built with Express.js and TypeORM, forming the operational core of the system:

- **NodesPool**: Dynamic registry that loads and manages all available node components
- **CachePool**: Manages LLM response caching to improve performance and reduce costs
- **DataSource**: Database abstraction layer using TypeORM
- **QueueManager**: Handles async task processing using BullMQ with Redis
- **Controllers**: API endpoints for CRUD operations on flows and executions
- **Flow Executor**: Orchestrates the execution of connected nodes based on input
- **Credential Manager**: Securely stores and provides credentials for API services

### UI

The frontend is a React application using Material-UI and ReactFlow for the visual builder:

- **Canvas**: Drag-and-drop interface for connecting nodes
- **Node Components**: Visual representations of backend node components
- **Property Editor**: Configuration UI for each node type
- **API Client**: Communicates with the backend server
- **Chat Interface**: For testing and interacting with built flows

### Components

The pluggable node system is the core extensibility mechanism:

- **Base Nodes**: Abstract classes defining common node behaviors
- **LLM Nodes**: Integrations with various language models (OpenAI, Claude, etc.)
- **Memory Nodes**: Different implementations for conversation state
- **Tool Nodes**: Function calling, web browsing, database connections, etc.
- **Vector Nodes**: Document loaders, embeddings, and vector databases

## Data Flow & Execution Model

1. **Flow Definition**: Users create flows in the UI by connecting nodes
2. **Storage**: Flows are serialized and stored in the database
3. **Execution**:
   - Client sends input to a flow endpoint
   - Server loads flow definition
   - Builds a directed acyclic graph (DAG) of node dependencies
   - Executes nodes in dependency order
   - Handles streaming for real-time responses
   - Returns results to the client

```
┌────────────┐     ┌───────────────┐     ┌───────────────┐
│            │     │               │     │               │
│  API/Chat  │────►│  Load Flow    │────►│  Build Graph  │
│  Request   │     │  Definition   │     │  of Nodes     │
│            │     │               │     │               │
└────────────┘     └───────────────┘     └───────▲───────┘
                                                 │
┌────────────┐     ┌───────────────┐     ┌───────▼───────┐
│            │     │               │     │               │
│  Response  │◄────│  Process      │◄────│  Execute in   │
│  to Client │     │  Results      │     │  Topo Order   │
│            │     │               │     │               │
└────────────┘     └───────────────┘     └───────────────┘
```

## Technical Implementation Details

### Database Design

Fastflow uses TypeORM with support for SQLite, MySQL, or PostgreSQL:

- **ChatFlow**: Stores flow definitions, metadata, and deployment information
- **ChatMessage**: Stores conversation history for each flow
- **Credential**: Securely stores encrypted API keys and authentication details
- **Tool**: Stores custom tool definitions and implementations

### Node System

The node system follows a plugin architecture:

- Each node implements a standard interface (INode)
- Nodes declare their inputs, outputs, and configuration options
- Nodes are registered with the NodesPool at runtime
- The UI dynamically renders configuration options based on node metadata

### Queue System

For handling resource-intensive tasks:

- **BullMQ**: Redis-based queue for background processing
- **Worker Mode**: Separate process for handling computationally intensive tasks
- **Rate Limiting**: Prevents excessive API calls and resource consumption

### Dynamic Imports

The system uses dynamic imports to load components:

```typescript
// Simplified example of dynamic node loading
const loadNodes = async (nodesDirPath: string) => {
  const nodeTypes = {};
  const nodeFiles = await fs.readdir(nodesDirPath);
  
  for (const file of nodeFiles) {
    const nodePath = path.join(nodesDirPath, file);
    const nodeModule = await import(nodePath);
    const nodeClass = nodeModule.default;
    
    if (nodeClass.nodeType) {
      nodeTypes[nodeClass.nodeType] = nodeClass;
    }
  }
  
  return nodeTypes;
};
```

## Security Considerations

- **Credential Encryption**: Sensitive information is encrypted at rest
- **API Key Authentication**: Public endpoints are secured with API keys
- **Input Validation**: Prevents injection attacks in flow definitions
- **CORS Protection**: Configurable CORS policy for API access
- **Rate Limiting**: Prevents abuse through excessive requests

## Scaling Strategy

- **Horizontal Scaling**: Worker processes can be scaled independently
- **Caching Layer**: Reduces redundant LLM API calls
- **Database Options**: Supports enterprise-grade databases for high availability
- **Docker Support**: Containerization for cloud deployments
- **Prometheus/OpenTelemetry**: Metrics collection for performance monitoring

## Extension Points

1. **Custom Nodes**: New node types can be added by extending base classes
2. **Custom Tools**: Function calling tools can be defined for specific use cases
3. **Storage Providers**: Support for different storage mechanisms (S3, local, etc.)
4. **Authentication**: Pluggable authentication strategies

## Design Patterns

- **Repository Pattern**: Data access is abstracted through repositories
- **Factory Pattern**: Used for creating node instances
- **Dependency Injection**: Services are injected into components that need them
- **Observer Pattern**: Event-based communication for real-time updates
- **Builder Pattern**: Flow execution builds a graph of connected components
- **Strategy Pattern**: Different implementations for same interfaces (memory, storage)

## Deployment Options

Fastflow supports various deployment scenarios:

- **Development**: Local development environment with hot reloading
- **Production**: Optimized builds for performance
- **Docker**: Containerized deployment for cloud environments
- **Serverless**: Support for serverless deployments with appropriate database configurations