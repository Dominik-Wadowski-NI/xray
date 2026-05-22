# Data Models

## Top-Level JSON Artifacts

### 1. Entry Points (`bin/{service}/entry-points.json`)

Unified discovery output for all entry point types (GraphQL resolvers, REST endpoints, functions, methods):

```json
{
  "service": "product-rts",
  "timestamp": "2026-05-21T09:30:00Z",
  "count": 3,
  "entryPoints": [
    {
      "id": "Query.user",
      "type": "graphql-resolver",
      "name": "user",
      "metadata": { "parent": "Query" },
      "params": ["_parent", "{ id }"],
      "definitionFile": "lib/graphql/resolvers/query.ts",
      "line": 12,
      "column": 2
    },
    {
      "id": "GET /api/users/:id",
      "type": "rest-endpoint",
      "name": "getUserHandler",
      "metadata": { "method": "GET", "framework": "express" },
      "definitionFile": "lib/routes/users.ts",
      "line": 18,
      "column": 0
    },
    {
      "id": "UserService.create",
      "type": "method",
      "name": "create",
      "metadata": { "service": "UserService" },
      "definitionFile": "lib/services/user-service.ts",
      "line": 45,
      "column": 2
    }
  ],
  "errors": []
}
```

---

### 2. Entry Point Map (`bin/entry-point-map.json`)

Cross-service and cross-package aggregation of all discovered entry points:

```json
{
  "timestamp": "2026-05-21T09:35:00Z",
  "services": [
    { "name": "product-rts", "entryPointCount": 31 },
    { "name": "content-element-rts", "entryPointCount": 22 }
  ],
  "entryPoints": [
    {
      "id": "Query.user",
      "type": "graphql-resolver",
      "name": "user",
      "namespace": "Query",
      "service": "product-rts",
      "kind": "rootQuery",
      "ownedBy": "product-rts",
      "definitionFile": "lib/graphql/resolvers/query.ts",
      "line": 12
    },
    {
      "id": "GET /api/products",
      "type": "rest-endpoint",
      "name": "listProducts",
      "namespace": "/api/products",
      "service": "product-rts",
      "kind": "route",
      "ownedBy": "product-rts",
      "definitionFile": "lib/routes/products.ts",
      "line": 10
    }
  ],
  "crossBoundaryLinks": [
    {
      "resource": "User",
      "ownerService": "product-rts",
      "dependentServices": ["content-element-rts"],
      "linkType": "cross-service"
    },
    {
      "resource": "affiliateLinkHelper",
      "ownerService": "ni-rts-helper",
      "dependentServices": ["content-element-rts"],
      "linkType": "cross-package"
    }
  ]
}
```

---

### 3. Call Graph Report (`bin/{service}/call-graphs.{entryPointId}.json`)

Call graph traced from any entry point type:

```json
{
  "entryPoint": {
    "id": "Query.user",
    "type": "graphql-resolver",
    "name": "user",
    "parent": "Query"
  },
  "service": "product-rts",
  "summary": {
    "totalCalls": 18,
    "internalFunctionCount": 5,
    "externalPackageCount": 3,
    "crossPackageCalls": 2
  },
  "functions": [
    {
      "symbol": "fetchUserFromDB",
      "type": "internal",
      "packageName": "@company/user-repo",
      "source": { "file": "packages/user-repo/src/user-service.ts", "line": 42, "column": 10 },
      "snippet": "return fetchUserFromDB(id);",
      "order": 1
    },
    {
      "symbol": "get",
      "receiverType": "AxiosInstance",
      "type": "external",
      "packageName": "axios",
      "source": { "file": "lib/services/api-client.ts", "line": 28, "column": 4 },
      "snippet": "const response = await client.get(`/api/user/${id}`);",
      "order": 4
    }
  ],
  "externalPackages": [
    {
      "name": "axios",
      "category": "http",
      "imports": ["get", "post"],
      "order": 5
    },
    {
      "name": "@prisma/client",
      "category": "database",
      "imports": ["query"],
      "order": 2
    },
    {
      "name": "lodash",
      "category": "generic",
      "imports": ["pick", "omit"],
      "order": 6
    }
  ],
  "apiRequests": [
    {
      "method": "GET",
      "url": "/api/user/${id}",
      "library": "axios",
      "source": { "file": "lib/services/api-client.ts", "line": 28 },
      "order": 7
    }
  ],
  "databaseCalls": [
    {
      "operation": "query",
      "target": "User table",
      "library": "@prisma/client",
      "source": { "file": "packages/user-repo/src/user-service.ts", "line": 42 },
      "order": 3
    }
  ],
  "classInstantiations": [
    {
      "className": "UserValidator",
      "source": { "file": "lib/services/user-service.ts", "line": 15 },
      "snippet": "const validator = new UserValidator(user);",
      "order": 8
    }
  ]
}
```

---

### 4. System Map (`bin/system-map.json`)

Comprehensive system skeleton showing service and package dependencies enriched with exit point context:

```json
{
  "timestamp": "2026-05-21T10:00:00Z",
  "summary": {
    "totalServices": 5,
    "totalPackages": 12,
    "totalDependencies": 34,
    "circularDependencies": [
      {
        "path": ["service-a", "service-b", "service-a"],
        "type": "service",
        "severity": "medium"
      }
    ]
  },
  "services": [
    {
      "name": "product-rts",
      "entryPoints": 31,
      "outgoingDependencies": [
        {
          "target": "content-element-rts",
          "dependencyCount": 5,
          "types": ["federation-link", "http-client"],
          "exitPoints": [
            {
              "id": "http:content-element-rts",
              "type": "http",
              "method": "GET",
              "url": "/api/content-elements",
              "library": "axios"
            }
          ]
        },
        {
          "target": "ni-rts-helper",
          "dependencyCount": 3,
          "types": ["package-import"]
        }
      ],
      "incomingDependencies": [
        {
          "source": "gateway-service",
          "dependencyCount": 2,
          "types": ["federation-link"]
        }
      ],
      "externalSystemDependencies": [
        {
          "exitPointId": "db:Product",
          "name": "products database",
          "type": "database",
          "library": "@prisma/client",
          "criticality": "high",
          "entryPointCount": 8
        },
        {
          "exitPointId": "cache:redis-products",
          "name": "redis (product cache)",
          "type": "cache",
          "library": "ioredis",
          "criticality": "medium",
          "entryPointCount": 5
        }
      ]
    }
  ],
  "packages": [
    {
      "name": "@company/user-repo",
      "type": "data-layer",
      "entryPoints": 12,
      "outgoingDependencies": [
        {
          "target": "@prisma/client",
          "dependencyCount": 1,
          "types": ["npm-import"]
        }
      ],
      "incomingDependencies": [
        {
          "source": "product-rts",
          "dependencyCount": 4,
          "types": ["package-import"]
        },
        {
          "source": "content-element-rts",
          "dependencyCount": 2,
          "types": ["package-import"]
        }
      ]
    }
  ],
  "topologyLayers": [
    {
      "layer": 0,
      "description": "Foundation services (no outgoing service dependencies)",
      "services": ["database-service"],
      "packages": ["@company/user-repo"]
    },
    {
      "layer": 1,
      "description": "Business services (depend on foundation)",
      "services": ["product-rts", "content-element-rts"],
      "packages": ["@company/ni-rts-helper"]
    },
    {
      "layer": 2,
      "description": "Aggregation/Gateway services (depend on business layer)",
      "services": ["gateway-service"],
      "packages": []
    }
  ],
  "insights": {
    "highestInDegree": {
      "name": "@company/user-repo",
      "type": "package",
      "incomingCount": 5
    },
    "highestOutDegree": {
      "name": "gateway-service",
      "type": "service",
      "outgoingCount": 3
    },
    "orphanedServices": [],
    "orphanedPackages": [
      {
        "name": "@company/old-legacy-helper",
        "reason": "No incoming or outgoing dependencies"
      }
    ]
  }
}
```

---

See [03-components.md](./03-components.md) for component descriptions and [04-data-flow.md](./04-data-flow.md) for pipeline implementations that produce these artifacts.
