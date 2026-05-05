# Vehicle Maintenance Scheduler Microservice

A production-grade Express.js microservice that optimizes vehicle maintenance task scheduling using the 0/1 Knapsack algorithm.

## Overview

This service fetches vehicle maintenance tasks and depot mechanic hours from an evaluation service, then uses Dynamic Programming to determine the optimal set of tasks that maximizes maintenance impact while staying within available working hours.

## Features

- ✅ **Knapsack Optimization** - 0/1 Knapsack using Dynamic Programming
- ✅ **API Integration** - Fetches depot and vehicles data from evaluation service
- ✅ **Bearer Token Authentication** - Secure API requests
- ✅ **Remote Logging** - Integrates custom logging middleware
- ✅ **Request Tracking** - Logs all requests/responses with IDs
- ✅ **Error Handling** - Comprehensive error handling with logging
- ✅ **Production-Ready** - No external algorithm libraries, pure DP implementation

## Architecture

```
vehicle_maintenance_scheduler/
├── src/
│   ├── server.js                    # Main Express server
│   ├── middleware/
│   │   └── logging.js               # Logging middleware
│   ├── routes/
│   │   └── schedule.js              # API routes
│   ├── controllers/
│   │   └── schedulerController.js   # Request handlers
│   └── services/
│       ├── apiClient.js             # API calls to evaluation service
│       └── knapsackSolver.js        # 0/1 Knapsack DP solver
├── screenshots/                      # API response screenshots
├── package.json                      # Dependencies
├── .env                             # Configuration
└── .gitignore
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Valid JWT token for authentication

### Setup

1. **Clone or download the project**
```bash
cd vehicle_maintenance_scheduler
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure .env**
```bash
# .env file should contain:
AUTH_TOKEN=your-jwt-token
PORT=3000
```

## Running the Server

```bash
npm start
```

Output:
```
✓ Vehicle Maintenance Scheduler running on port 3000
✓ Logging middleware initialized
✓ Ready to accept requests
```

## API Endpoints

### GET /
Root endpoint - Returns service info

**Response:**
```json
{
  "service": "Vehicle Maintenance Scheduler",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET /api/schedule/health",
    "optimize": "GET /api/schedule/optimize"
  }
}
```

### GET /api/schedule/health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-05T10:30:00.000Z"
}
```

### GET /api/schedule/optimize
Optimizes maintenance task scheduling

**Response:**
```json
{
  "success": true,
  "response_time_ms": 45.23,
  "data": {
    "mechanic_hours_available": 40,
    "total_tasks": 15,
    "selected_tasks": [
      {
        "taskId": "264e638f-...",
        "duration": 5.5,
        "impact": 10
      },
      {
        "taskId": "a7b9c2e1-...",
        "duration": 3.2,
        "impact": 8
      }
    ],
    "total_impact": 87,
    "total_duration": 38.7,
    "unused_hours": 1.3
  }
}
```

## Algorithm Details

### 0/1 Knapsack Problem

The service solves the 0/1 Knapsack problem using Dynamic Programming to select tasks that:
- Maximize total maintenance impact
- Stay within available mechanic hours

**Time Complexity:** O(n × maxHours)  
**Space Complexity:** O(n × maxHours)

### How It Works

1. **Fetch Data** - Gets depot mechanic hours and vehicle tasks from APIs
2. **Format Tasks** - Converts tasks to {id, duration, impact} format
3. **Build DP Table** - Creates DP[i][w] table where:
   - i = task index (0 to n)
   - w = remaining capacity (0 to maxHours)
   - value = maximum impact achievable
4. **Backtrack** - Finds which tasks to select from DP table
5. **Return Results** - Returns selected tasks with totals

## Data Flow

```
┌─────────────────────────────────────┐
│   Client Request                     │
│   GET /api/schedule/optimize         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Logging Middleware                │
│   (Logs request with ID)             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Scheduler Controller               │
└────────────┬────────────────────────┘
             │
        ┌────┴────┐
        ▼         ▼
    ┌────────┐ ┌────────┐
    │Depot   │ │Vehicles│
    │API     │ │API     │
    └────┬───┘ └───┬────┘
         │         │
         └────┬────┘
              ▼
       ┌──────────────────┐
       │API Client Service│
       │(With Auth Token) │
       └────────┬─────────┘
                │
          ┌─────┴─────┐
          ▼           ▼
       ┌─────┐     ┌────────┐
       │Hours│     │ Tasks  │
       └──┬──┘     └───┬────┘
          │            │
          └──────┬─────┘
                 ▼
        ┌─────────────────────┐
        │ Knapsack Solver     │
        │ (Dynamic Programming)│
        └────────┬────────────┘
                 │
        ┌────────▼──────────┐
        │ Selected Tasks    │
        │ Total Impact      │
        │ Total Duration    │
        │ Unused Hours      │
        └────────┬──────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Return JSON Response│
        │ + Response Time     │
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Logging Middleware  │
        │ (Logs response)     │
        └──────────────────────┘
```

## Logging

### Logging Levels
- **debug** - Debug information (verbose)
- **info** - Normal operations
- **warn** - Warnings
- **error** - Errors

### Log Packages
- **middleware** - Request/response logging
- **controller** - Controller operations
- **service** - API calls and processing

### Example Logs
```
[Logger] Auth token set successfully
[Logger] Log sent successfully. LogID: 6eb22b54-d8ed-4b44-8bf8-4e68a3007d6b
[REQ-abc123] GET /api/schedule/optimize
[REQ-abc123] GET /api/schedule/optimize - Status: 200 - 45ms
```

## Error Handling

The service handles errors gracefully:

| Error | Status | Response |
|-------|--------|----------|
| Missing token | 401 | `{success: false, error: "Missing authentication token"}` |
| Invalid hours | 400 | `{success: false, error: "Invalid mechanic hours"}` |
| API failure | 500 | `{success: false, error: "error message"}` |

## Configuration

### Environment Variables

```bash
# .env file

# Authentication token from evaluation service
AUTH_TOKEN=your-jwt-token-here

# Server port
PORT=3000
```

## Testing

Test the health endpoint:
```bash
curl http://localhost:3000/api/schedule/health
```

Test the optimize endpoint:
```bash
curl http://localhost:3000/api/schedule/optimize
```

## Dependencies

- **express** ^4.18.2 - Web framework
- **logging-middleware** - Custom logging module (local)

## Development

### Project Structure
- No external algorithm libraries
- Pure JavaScript implementation
- Native Node.js modules only
- Modular service architecture

### Performance
- Response time: Typically < 100ms
- DP table: O(n × maxHours) memory
- Optimization: < 50ms for 100+ tasks

## Production Deployment

1. **Environment Variables** - Set AUTH_TOKEN and PORT
2. **Error Logging** - All errors logged remotely
3. **Request Tracking** - Each request has unique ID
4. **Health Check** - Use `/api/schedule/health` for monitoring
5. **Response Times** - Included in all responses

## License

MIT

## Author

Hitesh Thakur

## Support

For issues or questions, refer to the GitHub repository:
https://github.com/Hitesh-Thakur607/2310990607
