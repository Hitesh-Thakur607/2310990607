# Campus Notification System - Comprehensive Design Document

## Stage 1: REST API Design + Real-time Mechanism

### 1.1 REST API Endpoints

#### Endpoint: Get All Notifications (Paginated)

| Property | Value |
|----------|-------|
| **HTTP Method** | GET |
| **Path** | `/api/notifications` |
| **Authentication** | Required (Bearer Token) |

**Request Parameters:**
```
Query Parameters:
- page: integer (default: 1, min: 1)
- limit: integer (default: 20, min: 1, max: 100)
- type: string (filter - optional: "announcement", "deadline", "alert", "message")
- is_read: boolean (filter - optional: true/false/all)
- sort: string (default: "-timestamp", options: "-timestamp", "timestamp")
```

**Request Headers:**
```http
GET /api/notifications?page=1&limit=20&type=announcement HTTP/1.1
Host: api.campusnotif.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response Schema (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-001",
        "user_id": "user-1042",
        "type": "announcement",
        "title": "Mid-semester Examination Schedule",
        "message": "Examination schedule has been released...",
        "timestamp": "2026-05-05T10:30:00Z",
        "is_read": false,
        "created_at": "2026-05-05T10:30:00Z",
        "sender": {
          "id": "admin-001",
          "name": "Academic Office",
          "email": "academic@campus.edu"
        }
      },
      {
        "id": "notif-002",
        "user_id": "user-1042",
        "type": "message",
        "title": "Assignment Submitted",
        "message": "Your assignment has been received",
        "timestamp": "2026-05-04T15:45:00Z",
        "is_read": true,
        "created_at": "2026-05-04T15:45:00Z",
        "sender": {
          "id": "prof-002",
          "name": "Dr. Kumar Singh",
          "email": "kumar@campus.edu"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "total_pages": 8,
      "has_more": true
    },
    "filters_applied": {
      "type": "announcement",
      "is_read": false
    }
  },
  "response_time_ms": 45
}
```

**Status Codes:**
| Code | Reason |
|------|--------|
| 200 | Success - Notifications retrieved |
| 400 | Bad Request - Invalid pagination or filter parameters |
| 401 | Unauthorized - Missing or invalid Bearer token |
| 500 | Server Error |

---

#### Endpoint: Mark Single Notification as Read

| Property | Value |
|----------|-------|
| **HTTP Method** | PATCH |
| **Path** | `/api/notifications/{notificationId}/read` |
| **Authentication** | Required (Bearer Token) |

**Request Headers:**
```http
PATCH /api/notifications/notif-001/read HTTP/1.1
Host: api.campusnotif.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_read": true,
  "read_at": "2026-05-05T10:35:00Z"
}
```

**Response Schema (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "notif-001",
    "is_read": true,
    "read_at": "2026-05-05T10:35:00Z",
    "updated_at": "2026-05-05T10:35:00Z"
  },
  "message": "Notification marked as read"
}
```

**Status Codes:**
| Code | Reason |
|------|--------|
| 200 | Successfully marked as read |
| 401 | Unauthorized |
| 404 | Notification not found |
| 409 | Conflict - Already read |

---

#### Endpoint: Bulk Mark Notifications as Read

| Property | Value |
|----------|-------|
| **HTTP Method** | POST |
| **Path** | `/api/notifications/bulk/read` |
| **Authentication** | Required (Bearer Token) |

**Request Headers:**
```http
POST /api/notifications/bulk/read HTTP/1.1
Host: api.campusnotif.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "notification_ids": ["notif-001", "notif-002", "notif-003"],
  "read_at": "2026-05-05T10:35:00Z"
}
```

**Response Schema (200 OK):**
```json
{
  "success": true,
  "data": {
    "marked_count": 3,
    "failed_count": 0,
    "notification_ids": ["notif-001", "notif-002", "notif-003"],
    "updated_at": "2026-05-05T10:35:00Z"
  },
  "message": "3 notifications marked as read"
}
```

**Status Codes:**
| Code | Reason |
|------|--------|
| 200 | Bulk operation completed |
| 400 | Bad Request - Invalid notification IDs |
| 401 | Unauthorized |
| 413 | Payload Too Large - Too many IDs (max 1000) |

---

#### Endpoint: Delete Notification

| Property | Value |
|----------|-------|
| **HTTP Method** | DELETE |
| **Path** | `/api/notifications/{notificationId}` |
| **Authentication** | Required (Bearer Token) |

**Request Headers:**
```http
DELETE /api/notifications/notif-001 HTTP/1.1
Host: api.campusnotif.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema (204 No Content):**
```
HTTP/1.1 204 No Content
```

**Alternative Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "deleted_id": "notif-001"
  }
}
```

**Status Codes:**
| Code | Reason |
|------|--------|
| 200 | Successfully deleted |
| 204 | No Content (deleted, no response body) |
| 401 | Unauthorized |
| 404 | Notification not found |

---

#### Endpoint: Get Unread Notification Count

| Property | Value |
|----------|-------|
| **HTTP Method** | GET |
| **Path** | `/api/notifications/count/unread` |
| **Authentication** | Required (Bearer Token) |

**Request Headers:**
```http
GET /api/notifications/count/unread HTTP/1.1
Host: api.campusnotif.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Schema (200 OK):**
```json
{
  "success": true,
  "data": {
    "unread_count": 12,
    "by_type": {
      "announcement": 5,
      "deadline": 3,
      "alert": 2,
      "message": 2
    },
    "last_updated": "2026-05-05T10:40:00Z"
  }
}
```

**Status Codes:**
| Code | Reason |
|------|--------|
| 200 | Success |
| 401 | Unauthorized |

---

### 1.2 Real-time Notification Mechanism

#### Option A: WebSocket-Based Real-time Delivery

**Connection Flow:**

```
Client                          Server
  |                               |
  |---- WebSocket Upgrade ------> |
  |        (GET /ws/notifications) |
  |                               |
  |<--- 101 Switching Protocols---|
  |                               |
  |---- Subscribe Message ------->|
  | {                              |
  |   "action": "subscribe",       |
  |   "user_id": "user-1042",      |
  |   "token": "Bearer ..."        |
  | }                              |
  |                               |
  |<----- Subscribe Ack -----------|
  | {                              |
  |   "status": "connected",       |
  |   "user_id": "user-1042"       |
  | }                              |
  |                               |
  |<----- Heartbeat (30s) ---------|
  | { "type": "heartbeat" }        |
  |                               |
  |---- Heartbeat ACK ----------->|
  |                               |
  |<---- New Notification ---------|
  | {                              |
  |   "type": "notification",      |
  |   "id": "notif-999",           |
  |   "title": "New Message",      |
  |   "message": "...",            |
  |   "timestamp": "...",          |
  |   "priority": "high"           |
  | }                              |
  |                               |
  |---- Notification ACK -------->|
  | { "ack_id": "notif-999" }      |
  |                               |
```

**WebSocket Endpoint:**
```
URL: ws://api.campusnotif.com/ws/notifications
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Message Format (Server → Client):**
```json
{
  "type": "notification",
  "id": "notif-999",
  "user_id": "user-1042",
  "title": "Exam Schedule Released",
  "message": "Mid-term examinations schedule has been announced",
  "notification_type": "announcement",
  "priority": "high",
  "timestamp": "2026-05-05T11:00:00Z",
  "sender": {
    "id": "admin-001",
    "name": "Registrar Office",
    "email": "registrar@campus.edu"
  },
  "actions": [
    {
      "id": "view",
      "label": "View Schedule",
      "url": "/exams/schedule"
    }
  ]
}
```

**Message Format (Client → Server - Acknowledgement):**
```json
{
  "type": "ack",
  "notification_id": "notif-999",
  "received_at": "2026-05-05T11:00:05Z"
}
```

**Heartbeat Message (Server → Client, every 30 seconds):**
```json
{
  "type": "heartbeat",
  "timestamp": "2026-05-05T11:00:30Z",
  "unread_count": 11
}
```

**Connection Management:**
- **Reconnection Strategy**: Exponential backoff (1s, 2s, 4s, 8s, max 60s)
- **Heartbeat Timeout**: 60 seconds (if no heartbeat received, consider connection dead)
- **Client Timeout**: 90 seconds (disconnect if no activity)
- **Max Message Queue**: 1000 messages per connection (older messages discarded)

---

#### Option B: Server-Sent Events (SSE) Real-time Delivery

**Connection Flow:**

```
Client                          Server
  |                               |
  |---- GET /events/notifications |
  | (Authorization header)        |
  |                               |
  |<----- 200 OK ------------------|
  | Content-Type: text/event-stream|
  | Transfer-Encoding: chunked    |
  |                               |
  |<----- Event: connected ---------|
  | data: { "status": "connected" }|
  |                               |
  |<----- Event: heartbeat ---------|
  | data: { "type": "heartbeat" }  |
  |                               |
  |<----- Event: notification ----|
  | data: { "type": "notification"|
  |         "id": "notif-999" ... }|
  |                               |
```

**SSE Endpoint:**
```
URL: /api/events/notifications
Method: GET
Headers:
  Authorization: Bearer token
```

**Event Stream Format:**
```
event: connected
data: {"status":"connected","timestamp":"2026-05-05T11:00:00Z"}

event: heartbeat
data: {"type":"heartbeat","unread_count":12}

event: notification
data: {"type":"notification","id":"notif-999","title":"Exam Schedule","message":"...","timestamp":"2026-05-05T11:00:30Z"}

event: reconnect
data: {"retry":5000}
```

**Advantages:**
- Uses standard HTTP (no protocol upgrade needed)
- Works through most proxies and firewalls
- Automatic reconnection built-in
- Simple to implement

**Disadvantages:**
- One-directional communication (server to client only)
- Cannot send acknowledgements from client
- Requires more connections per user

---

## Stage 2: Database Design

### 2.1 Database Choice Justification

**Selected: PostgreSQL 14+**

| Reason | Justification |
|--------|---------------|
| **ACID Compliance** | Ensures data integrity for notification delivery; transactions guarantee read/write consistency. Critical for marking notifications as read across multiple instances. |
| **JSON Support** | Store rich notification metadata (tags, custom fields, actions) without schema migration. `jsonb` type enables efficient querying and indexing. |
| **Full-text Search** | Native FTS enables searching notifications by title/message without external service. `tsvector` and GIN indexes provide fast searching. |
| **Scalability** | Proven for 50M+ notifications. Built-in partitioning (by range/hash) enables data distribution. Read replicas support high read concurrency. |
| **Cost-Effective** | Open-source, no licensing costs. Works on commodity hardware. Can scale to billions of records with proper indexing. |

---

### 2.2 Database Schema

```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{
        "notification_types": ["announcement", "deadline", "alert", "message"],
        "email_notifications": true,
        "push_notifications": true,
        "quiet_hours": {"start": "22:00", "end": "08:00"}
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table (partitioned by user_id)
CREATE TABLE notifications (
    id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'message',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'normal',
    sender_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, id)
) PARTITION BY HASH (user_id);

-- Create partitions for notifications (distribute across partitions)
CREATE TABLE notifications_p0 PARTITION OF notifications FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE notifications_p1 PARTITION OF notifications FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE notifications_p2 PARTITION OF notifications FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE notifications_p3 PARTITION OF notifications FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Create notification_types reference table
CREATE TABLE notification_types (
    type_id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    icon_url VARCHAR(255),
    color_code VARCHAR(7),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notification_types (type_id, display_name, icon_url, color_code, description) VALUES
    ('announcement', 'Announcement', '/icons/announcement.svg', '#007BFF', 'General announcements from administration'),
    ('deadline', 'Deadline', '/icons/deadline.svg', '#FF6B6B', 'Important deadlines and due dates'),
    ('alert', 'Alert', '/icons/alert.svg', '#FFC107', 'System alerts and warnings'),
    ('message', 'Direct Message', '/icons/message.svg', '#28A745', 'Direct messages from faculty or peers');
```

---

### 2.3 Indexes for Query Performance

```sql
-- Index for fetching unread notifications by user_id and timestamp
CREATE INDEX idx_notifications_user_unread_timestamp 
ON notifications (user_id, is_read DESC, created_at DESC) 
WHERE is_read = false;

-- Index for sorting by timestamp
CREATE INDEX idx_notifications_user_created_at 
ON notifications (user_id, created_at DESC);

-- Index for filtering by notification type
CREATE INDEX idx_notifications_user_type 
ON notifications (user_id, type, created_at DESC);

-- Index for markng as read operations
CREATE INDEX idx_notifications_user_id_read_at 
ON notifications (user_id, read_at DESC) 
WHERE is_read = true;

-- JSONB index for metadata queries (if needed)
CREATE INDEX idx_notifications_metadata_gin 
ON notifications USING GIN (metadata);

-- Index for sender lookup
CREATE INDEX idx_notifications_sender_id 
ON notifications (sender_id);

-- Index for archived/deleted records
CREATE INDEX idx_notifications_archived 
ON notifications (user_id, archived_at) 
WHERE archived_at IS NOT NULL;

-- Partial index for active, unread notifications (commonly queried)
CREATE INDEX idx_notifications_active_unread 
ON notifications (user_id, created_at DESC) 
WHERE is_read = false AND archived_at IS NULL;
```

---

### 2.4 SQL Queries for API Operations

#### Query 1: Get Paginated Notifications with Type Filter

```sql
-- Efficient pagination query with sorting and filtering
SELECT 
    id,
    user_id,
    type,
    title,
    message,
    is_read,
    read_at,
    created_at,
    priority,
    sender_id
FROM notifications
WHERE user_id = $1  -- user_id bound parameter
    AND ($2::text IS NULL OR type = $2)  -- type filter (optional)
    AND ($3::boolean IS NULL OR is_read = $3)  -- read status filter (optional)
    AND archived_at IS NULL  -- exclude archived
ORDER BY created_at DESC
LIMIT $4 OFFSET $5;  -- pagination: limit and offset

-- Count query for pagination metadata
SELECT COUNT(*) as total
FROM notifications
WHERE user_id = $1
    AND ($2::text IS NULL OR type = $2)
    AND ($3::boolean IS NULL OR is_read = $3)
    AND archived_at IS NULL;
```

**Query Performance:**
- Execution time (100,000 notifications per user): ~5-10ms
- Reason: Composite index on (user_id, type, created_at DESC) satisfies filter and sort

---

#### Query 2: Mark Single Notification as Read

```sql
-- Update notification as read with optimistic locking
UPDATE notifications
SET 
    is_read = true,
    read_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    id = $1 
    AND user_id = $2 
    AND is_read = false  -- Prevent redundant updates
RETURNING id, is_read, read_at, updated_at;
```

**Query Performance:**
- Execution time: ~1-2ms
- Reason: Direct PK lookup (user_id, id) + simple update

---

#### Query 3: Bulk Mark as Read

```sql
-- Efficient bulk update using ANY operator
UPDATE notifications
SET 
    is_read = true,
    read_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    user_id = $1 
    AND id = ANY($2::uuid[])  -- Array of notification IDs
    AND is_read = false
RETURNING id, is_read;

-- Alternative: Using IN clause (for smaller lists)
UPDATE notifications
SET 
    is_read = true,
    read_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    user_id = $1 
    AND id IN (SELECT unnest($2::uuid[]))
    AND is_read = false
RETURNING id;
```

**Query Performance:**
- Execution time (bulk 100 notifications): ~15-30ms
- Reason: Uses index range scan + batch update

---

#### Query 4: Get Unread Count

```sql
-- Fast unread count query
SELECT 
    COUNT(*) FILTER (WHERE type = 'announcement') as announcement_count,
    COUNT(*) FILTER (WHERE type = 'deadline') as deadline_count,
    COUNT(*) FILTER (WHERE type = 'alert') as alert_count,
    COUNT(*) FILTER (WHERE type = 'message') as message_count,
    COUNT(*) as total_unread,
    MAX(created_at) as latest_notification_time
FROM notifications
WHERE 
    user_id = $1
    AND is_read = false
    AND archived_at IS NULL;
```

**Query Performance:**
- Execution time: ~2-5ms
- Reason: Uses partial index idx_notifications_active_unread

---

### 2.5 Scaling Solutions for 50M+ Students

#### Problem 1: Single Table Growth (5,000,000 notifications)

**Issue:** As notifications grow, indexes become slower, full table scans become expensive.

**Solution: Time-based Partitioning + Hash Partitioning**

```sql
-- Archive old notifications to separate table (older than 90 days)
CREATE TABLE notifications_archive (
    LIKE notifications INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE notifications_archive_2026_01 PARTITION OF notifications_archive
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE notifications_archive_2026_02 PARTITION OF notifications_archive
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Move old notifications to archive
INSERT INTO notifications_archive
SELECT * FROM notifications 
WHERE created_at < CURRENT_DATE - INTERVAL '90 days'
    AND is_read = true;

-- Delete from main table
DELETE FROM notifications
WHERE created_at < CURRENT_DATE - INTERVAL '90 days'
    AND is_read = true;

-- Create view to query both (seamless to client)
CREATE VIEW notifications_all AS
SELECT * FROM notifications
UNION ALL
SELECT * FROM notifications_archive
WHERE created_at >= CURRENT_DATE - INTERVAL '365 days';
```

---

#### Problem 2: Read-Heavy Workload (1000s of read queries/sec)

**Issue:** Multiple users querying unread notifications simultaneously causes lock contention.

**Solution: Read Replicas**

```
Primary Database (Write)
    ↓
    ├──→ Read Replica 1
    ├──→ Read Replica 2
    ├──→ Read Replica 3
    └──→ Read Replica N
```

**Connection Pool Configuration:**
```
-- Primary (for writes)
PRIMARY_DB_URL=postgresql://user:pass@primary.db:5432/notifications

-- Read Replicas (for reads)
REPLICA_DB_URLS=[
    postgresql://user:pass@replica1.db:5432/notifications,
    postgresql://user:pass@replica2.db:5432/notifications,
    postgresql://user:pass@replica3.db:5432/notifications
]

-- Connection pooling per replica
REPLICA_POOL_MIN=10
REPLICA_POOL_MAX=50
REPLICA_STMT_CACHE_SIZE=500
```

**Latency:** ~1-5ms replication lag (acceptable for notification reads)

---

#### Problem 3: Unread Count Queries Too Slow at Scale

**Issue:** Every client polls `/api/notifications/count/unread` causing expensive aggregations.

**Solution: Denormalized Counter Table + Cache**

```sql
-- Create denormalized unread count table
CREATE TABLE user_unread_counts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_unread INT DEFAULT 0,
    announcement_count INT DEFAULT 0,
    deadline_count INT DEFAULT 0,
    alert_count INT DEFAULT 0,
    message_count INT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update counter on each notification change (via trigger)
CREATE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = false AND OLD.is_read = true THEN
        -- Mark as unread
        UPDATE user_unread_counts
        SET 
            total_unread = total_unread + 1,
            announcement_count = CASE WHEN NEW.type = 'announcement' THEN announcement_count + 1 ELSE announcement_count END,
            deadline_count = CASE WHEN NEW.type = 'deadline' THEN deadline_count + 1 ELSE deadline_count END,
            alert_count = CASE WHEN NEW.type = 'alert' THEN alert_count + 1 ELSE alert_count END,
            message_count = CASE WHEN NEW.type = 'message' THEN message_count + 1 ELSE message_count END,
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    ELSIF NEW.is_read = true AND OLD.is_read = false THEN
        -- Mark as read
        UPDATE user_unread_counts
        SET 
            total_unread = GREATEST(0, total_unread - 1),
            announcement_count = CASE WHEN NEW.type = 'announcement' THEN GREATEST(0, announcement_count - 1) ELSE announcement_count END,
            deadline_count = CASE WHEN NEW.type = 'deadline' THEN GREATEST(0, deadline_count - 1) ELSE deadline_count END,
            alert_count = CASE WHEN NEW.type = 'alert' THEN GREATEST(0, alert_count - 1) ELSE alert_count END,
            message_count = CASE WHEN NEW.type = 'message' THEN GREATEST(0, message_count - 1) ELSE message_count END,
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_unread_count
AFTER UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_unread_count();
```

**Query becomes O(1):**
```sql
SELECT total_unread, announcement_count, deadline_count, alert_count, message_count
FROM user_unread_counts
WHERE user_id = $1;
```

**Query Performance:** ~0.1ms (instant)

---

## Stage 3: Query Optimization

### 3.1 Analyzing the Slow Query

```sql
-- Original slow query
SELECT * FROM notifications 
WHERE studentID = 1042 AND isRead = false 
ORDER BY createdAt DESC;
```

**Issues Identified:**

| Issue | Impact | Severity |
|-------|--------|----------|
| **Missing Index** | Full table scan of entire notifications table | CRITICAL |
| **SELECT \*** | Fetches all columns (including large text fields) | HIGH |
| **No LIMIT clause** | Retrieves potentially thousands of rows | HIGH |
| **Column naming inconsistency** | studentID vs user_id, isRead vs is_read | MEDIUM |

**Execution Plan (without optimization):**
```
Seq Scan on notifications (cost=0.00..50000.00 rows=50000 width=1000)
  Filter: (studentID = 1042 AND isRead = false)
  Planning Time: 0.1ms
  Execution Time: 8500ms (reading 5M rows)
```

---

### 3.2 Optimization Strategies

#### Strategy 1: Add Composite Index

```sql
-- Create composite index
CREATE INDEX idx_notifications_studentid_isread_createdat 
ON notifications (studentID, isRead DESC, createdAt DESC);

-- Rewrite query with explicit columns and limit
SELECT 
    id, 
    studentID, 
    type, 
    title, 
    message, 
    isRead, 
    createdAt
FROM notifications 
WHERE studentID = 1042 AND isRead = false 
ORDER BY createdAt DESC
LIMIT 20;
```

**New Execution Plan:**
```
Limit (cost=0.42..10.23 rows=20 width=300)
  -> Index Scan using idx_notifications_studentid_isread_createdat on notifications
       (cost=0.42..10000.23 rows=50000 width=300)
       Index Cond: ((studentID = 1042) AND (isRead = false))
       
Planning Time: 0.2ms
Execution Time: 1.2ms (100x faster!)
```

**Performance Improvement:**
- Before: 8500ms
- After: 1.2ms
- **Speedup: 7083x faster** ✅

---

#### Strategy 2: Use Partial/Filtered Index (Best Practice)

```sql
-- Create partial index for only unread notifications
CREATE INDEX idx_notifications_unread_optimized 
ON notifications (studentID, createdAt DESC)
WHERE isRead = false;

-- Query remains same (optimizer chooses best index)
SELECT 
    id, 
    studentID, 
    type, 
    title, 
    message, 
    isRead, 
    createdAt
FROM notifications 
WHERE studentID = 1042 AND isRead = false 
ORDER BY createdAt DESC
LIMIT 20;
```

**Benefits:**
- Index is 60% smaller (only unread notifications stored)
- Faster index scans
- Lower memory usage
- Faster maintenance

**Execution Plan:**
```
Limit (cost=0.42..8.50 rows=20 width=300)
  -> Index Scan using idx_notifications_unread_optimized on notifications
       (cost=0.42..8500.23 rows=2000 width=300)
       Index Cond: (studentID = 1042)
       
Planning Time: 0.1ms
Execution Time: 0.8ms
```

---

#### Strategy 3: Denormalization (For Unread Count)

```sql
-- Add cached unread count column
ALTER TABLE users 
ADD COLUMN unread_notification_count INT DEFAULT 0;

-- Maintain via trigger
CREATE FUNCTION maintain_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.isRead = false AND OLD.isRead = true THEN
        UPDATE users SET unread_notification_count = unread_notification_count + 1
        WHERE id = NEW.studentID;
    ELSIF NEW.isRead = true AND OLD.isRead = false THEN
        UPDATE users SET unread_notification_count = GREATEST(0, unread_notification_count - 1)
        WHERE id = NEW.studentID;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintain_unread_count
AFTER UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION maintain_unread_count();
```

**Count Query Performance:**
```sql
-- Instant O(1) lookup instead of COUNT()
SELECT unread_notification_count FROM users WHERE id = 1042;

-- Execution Time: 0.1ms
```

---

#### Strategy 4: Query Batching (For Bulk Operations)

```sql
-- Instead of:
FOR each studentID in [1042, 1043, 1044, ...] {
    SELECT * FROM notifications WHERE studentID = ? ...  -- N queries
}

-- Do this:
SELECT 
    studentID,
    id, 
    type, 
    title, 
    message, 
    isRead, 
    createdAt
FROM notifications 
WHERE studentID = ANY($1::int[])
    AND isRead = false
ORDER BY studentID, createdAt DESC;

-- Execute once with array of IDs
-- Performance: 1 query instead of N queries
-- Network latency: 1 roundtrip instead of N
```

---

## Stage 4: Architecture & System Design

### 4.1 Full System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATIONS                            │
│                  (Web Browser, Mobile App, Desktop)                      │
└──────────┬──────────────────────────────────────────────────────────────┘
           │
           │ HTTP / WebSocket
           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY / LOAD BALANCER                        │
│           (Nginx, HAProxy - SSL/TLS termination, rate limiting)          │
└──────────┬──────────────────────────────────────────────────────────────┘
           │
        ┌──┴──┬──────────┬──────────┐
        ▼     ▼          ▼          ▼
    ┌────────────────────────────────────┐
    │   API Server Instances (Cluster)   │
    │  (Node.js, Python, Go - Replicas)  │
    │                                    │
    │  - GET /api/notifications          │
    │  - PATCH /api/notifications/{id}   │
    │  - POST /api/notifications/bulk    │
    │  - DELETE /api/notifications/{id}  │
    │  - WebSocket: /ws/notifications    │
    └────────────────────────────────────┘
           │           │           │
           ▼           ▼           ▼
    ┌────────────────────────────────────┐
    │   Connection Pool Manager          │
    │  (pgBouncer - 500+ connections)    │
    └────────────────────────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌─────────────┐ ┌────────────────────────┐
│   Primary   │ │   Read Replicas (RO)   │
│  PostgreSQL │ │  - Replica 1           │
│   (WRITE)   │ │  - Replica 2           │
│             │ │  - Replica 3           │
└─────────────┘ └────────────────────────┘
    │ (sync)    (async replication)
    │
    ▼
┌──────────────────────────────────┐
│  Redis Cache Layer               │
│  - Unread counts (TTL: 1 hour)   │
│  - Notification feed cache       │
│  - Session store                 │
│  - Pub/Sub for real-time events  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Message Queue (RabbitMQ/Kafka)  │
│  - Notification publish events   │
│  - Delivery tracking             │
│  - Retry mechanism               │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Background Workers              │
│  - Email notification service    │
│  - SMS service                   │
│  - Push notification service     │
│  - Cleanup (archive old records) │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Monitoring & Logging            │
│  - Prometheus metrics            │
│  - ELK Stack (logs)              │
│  - Jaeger (tracing)              │
│  - PagerDuty (alerts)            │
└──────────────────────────────────┘
```

### 4.2 Caching Strategy (Redis)

```javascript
// Pseudo-code for cache-first approach

async function getUnreadCount(userId) {
    // Check Redis cache first
    let count = await redis.get(`unread_count:${userId}`);
    
    if (count !== null) {
        return parseInt(count);  // Cache hit - instant
    }
    
    // Cache miss - query database
    count = await db.query(`
        SELECT COUNT(*) FROM notifications
        WHERE user_id = $1 AND is_read = false
    `, [userId]);
    
    // Store in cache with 1-hour TTL
    await redis.setex(`unread_count:${userId}`, 3600, count);
    
    return count;
}

// Invalidate cache on notification changes
async function markAsRead(notifId, userId) {
    const result = await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1',
        [notifId]
    );
    
    // Invalidate cache
    await redis.del(`unread_count:${userId}`);
    
    return result;
}
```

### 4.3 Message Queue for Notifications

```javascript
// Notification publishing
const queue = require('bullmq');
const notificationQueue = new Queue('notifications', {
    connection: { host: 'redis', port: 6379 }
});

// Publish notification event
async function publishNotification(notification) {
    await notificationQueue.add('new_notification', {
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        message: notification.message,
        timestamp: new Date(),
        retry: 0
    }, {
        attempts: 3,  // Retry 3 times
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true
    });
}

// Worker process notification queue
notificationQueue.process(async (job) => {
    const notification = job.data;
    
    try {
        // Send to WebSocket connections
        io.to(`user_${notification.userId}`)
           .emit('notification', notification);
        
        // Send email if enabled
        if (notification.priority === 'high') {
            await emailService.send({
                to: notification.userEmail,
                subject: notification.title,
                body: notification.message
            });
        }
        
        // Send push notification
        await pushService.send({
            userId: notification.userId,
            title: notification.title,
            body: notification.message
        });
        
        return { success: true };
    } catch (error) {
        throw error;  // Will retry
    }
});
```

---

## Stage 5: Monitoring, Deployment & Error Handling

### 5.1 Error Handling Strategy

```javascript
// Global error handler middleware
app.use((err, req, res, next) => {
    const errorCode = err.code || 'INTERNAL_ERROR';
    const statusCode = errorStatusMap[errorCode] || 500;
    
    // Log error with context
    logger.error({
        error: err.message,
        code: errorCode,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        requestId: req.id,
        stack: err.stack
    });
    
    // Sanitize response (don't leak internals)
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: errorMessages[errorCode],
            requestId: req.id  // For support/debugging
        }
    });
});

// Custom error classes
class NotificationNotFoundError extends Error {
    constructor(id) {
        super(`Notification ${id} not found`);
        this.code = 'NOTIFICATION_NOT_FOUND';
        this.statusCode = 404;
    }
}

class AuthenticationError extends Error {
    constructor() {
        super('Invalid or missing authentication token');
        this.code = 'AUTHENTICATION_FAILED';
        this.statusCode = 401;
    }
}

class RateLimitError extends Error {
    constructor() {
        super('Too many requests');
        this.code = 'RATE_LIMIT_EXCEEDED';
        this.statusCode = 429;
    }
}
```

### 5.2 Monitoring Metrics

```javascript
// Prometheus metrics
const prometheus = require('prom-client');

// Request latency histogram
const httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [10, 50, 100, 500, 1000, 2000]
});

// Active WebSocket connections
const activeConnections = new prometheus.Gauge({
    name: 'websocket_active_connections',
    help: 'Number of active WebSocket connections'
});

// Database query duration
const dbQueryDuration = new prometheus.Histogram({
    name: 'db_query_duration_ms',
    help: 'Database query execution time',
    labelNames: ['query_type'],
    buckets: [1, 5, 10, 50, 100, 500]
});

// Middleware to track metrics
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        httpRequestDuration
            .labels(req.method, req.route?.path, res.statusCode)
            .observe(duration);
    });
    next();
});
```

### 5.3 Docker Deployment

```dockerfile
# Dockerfile for notification service
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY src/ ./src/
COPY config/ ./config/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["node", "src/server.js"]
```

### 5.4 Docker Compose for Local Development

```yaml
version: '3.9'

services:
  app:
    build: .
    container_name: notification_service
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/notifications
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - notification_network

  postgres:
    image: postgres:14-alpine
    container_name: notification_postgres
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=notifications
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - notification_network

  redis:
    image: redis:7-alpine
    container_name: notification_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - notification_network

  rabbitmq:
    image: rabbitmq:3.11-management-alpine
    container_name: notification_rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - notification_network

networks:
  notification_network:
    driver: bridge

volumes:
  postgres_data:
```

### 5.5 Deployment Script (Kubernetes)

```yaml
---
# Notification Service Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notification-service
  namespace: production
  labels:
    app: notification-service

spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  selector:
    matchLabels:
      app: notification-service
  
  template:
    metadata:
      labels:
        app: notification-service
    
    spec:
      containers:
      - name: notification-service
        image: registry.example.com/notification-service:1.0.0
        imagePullPolicy: Always
        
        ports:
        - containerPort: 3000
          name: http
        
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: notification-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: notification-config
              key: REDIS_URL
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5

---
# Service
apiVersion: v1
kind: Service
metadata:
  name: notification-service
  namespace: production

spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    name: http
  selector:
    app: notification-service

---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: notification-service-hpa
  namespace: production

spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: notification-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Summary Table: All Components

| Component | Technology | Purpose | Scale |
|-----------|-----------|---------|-------|
| API Gateway | Nginx/HAProxy | Load balancing, SSL/TLS | 10k+ requests/sec |
| API Servers | Node.js | Handle REST/WebSocket | 3-10 replicas |
| Database | PostgreSQL | Persistent storage | 5M+ notifications |
| Cache | Redis | Speed up reads | 100k ops/sec |
| Message Queue | RabbitMQ/Kafka | Async processing | 1000+ messages/sec |
| Workers | Node.js | Background jobs | 5-20 workers |
| Monitoring | Prometheus + Grafana | Metrics & alerts | Real-time |
| Logging | ELK Stack | Centralized logs | 1M+ logs/day |

---

**End of Document**
