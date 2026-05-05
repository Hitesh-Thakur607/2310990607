# Quick Start Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Start the Server
```bash
npm start
```

## 3. Test Endpoints

### Health Check
```bash
curl http://localhost:3000/api/schedule/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-05T10:30:00.000Z"
}
```

### Optimize Schedule
```bash
curl http://localhost:3000/api/schedule/optimize
```

Response:
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
      }
    ],
    "total_impact": 87,
    "total_duration": 38.7,
    "unused_hours": 1.3
  }
}
```

## Architecture

### API Client (`services/apiClient.js`)
- Fetches depot info (mechanic hours available)
- Fetches vehicles and maintenance tasks
- Handles Bearer token authentication

### Knapsack Solver (`services/knapsackSolver.js`)
- Implements 0/1 Knapsack using Dynamic Programming
- Takes tasks and available hours
- Returns optimal task selection

### Controller (`controllers/schedulerController.js`)
- Orchestrates API calls
- Runs optimization algorithm
- Returns formatted response

### Routes (`routes/schedule.js`)
- `/api/schedule/health` - Health check
- `/api/schedule/optimize` - Optimization endpoint

### Middleware (`middleware/logging.js`)
- Initializes logging with token
- Logs all requests/responses
- Error handling

## Data Flow

```
Request → Logging Middleware → Controller
                                 ↓
                    ┌─────────────┴─────────────┐
                    ↓                             ↓
              API Client                   API Client
              (Fetch Depot)                (Fetch Vehicles)
                    │                           │
                    └─────────────┬─────────────┘
                                  ↓
                         Knapsack Solver
                         (DP Algorithm)
                                  ↓
                         Formatted Response
                                  ↓
                    Logging Middleware
                                  ↓
                              Response
```

## Configuration

Edit `.env`:
```bash
AUTH_TOKEN=your-jwt-token
PORT=3000
```

## Logging

Logs are sent to the remote logging service using the logging middleware.

Check logs in the remote service based on:
- **Level:** debug, info, warn, error
- **Package:** middleware, controller, service
- **Stack:** backend

## Optimization Algorithm

### 0/1 Knapsack Problem

Given:
- n tasks with duration and impact
- Maximum available hours (capacity)

Find:
- Maximum impact tasks that fit within hours
- Uses Dynamic Programming DP[i][w] table

### Example

Tasks:
```
TaskID | Duration | Impact
-------|----------|-------
T1     | 5.5      | 10
T2     | 3.2      | 8
T3     | 4.0      | 7
```

Available: 40 hours

Result:
- Selected: T1, T2, T3, ... (optimal selection)
- Total Impact: 87
- Total Duration: 38.7
- Unused: 1.3 hours

## Performance

- Response Time: < 100ms typically
- Algorithm: O(n × maxHours)
- For 100 tasks & 40 hours: ~4000 operations

## Error Scenarios

| Scenario | Response |
|----------|----------|
| No auth token | 401 Unauthorized |
| API down | 500 Internal Error |
| Invalid data | Error in response |

All errors are logged with details.

## Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Service info |
| GET | /api/schedule/health | Health check |
| GET | /api/schedule/optimize | Run optimization |

## Next Steps

1. Deploy to production environment
2. Monitor health endpoint
3. Check remote logs for detailed activity
4. Scale based on load

For detailed documentation, see `README.md`.
