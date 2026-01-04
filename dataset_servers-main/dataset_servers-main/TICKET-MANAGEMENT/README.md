# Ticket Management API

A RESTful API for managing tickets and users in a ticket management system.

## Features

- Ticket management (create, read, update, delete)
- Comment management on tickets
- Status and priority management
- User management (admin only)
- Basic authentication
- Role-based access control

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## Authentication

The API uses Basic Authentication. Include the Authorization header in your requests:

```
Authorization: Basic <base64(username:password)>
```

Default admin credentials:
- Username: admin
- Password: admin123

## API Endpoints

### Tickets

#### GET /tickets
Get all tickets. Supports filtering by status, priority, and assignedTo.

Query Parameters:
- status: Filter by status (open, in-progress, resolved, closed)
- priority: Filter by priority (low, medium, high, urgent)
- assignedTo: Filter by assigned user ID

#### POST /tickets [Basic Auth]
Create a new ticket.

Request Body:
```json
{
  "title": "string",
  "description": "string",
  "priority": "string" // optional, defaults to "medium"
}
```

#### GET /tickets/{ticketId}
Get details of a specific ticket.

#### PUT /tickets/{ticketId} [Basic Auth]
Update a specific ticket.

Request Body:
```json
{
  "title": "string",
  "description": "string",
  "assignedTo": "string" // user ID
}
```

#### DELETE /tickets/{ticketId} [Basic Auth]
Delete a specific ticket.

#### GET /tickets/{ticketId}/comments
Get comments on a specific ticket.

#### POST /tickets/{ticketId}/comments [Basic Auth]
Add a comment to a specific ticket.

Request Body:
```json
{
  "content": "string"
}
```

#### GET /tickets/{ticketId}/status
Get the status of a specific ticket.

#### PUT /tickets/{ticketId}/status [Basic Auth]
Update the status of a specific ticket.

Request Body:
```json
{
  "status": "string" // open, in-progress, resolved, closed
}
```

#### GET /tickets/{ticketId}/priority
Get the priority of a specific ticket.

#### PUT /tickets/{ticketId}/priority [Basic Auth]
Update the priority of a specific ticket.

Request Body:
```json
{
  "priority": "string" // low, medium, high, urgent
}
```

### Users

#### GET /users [Basic Auth, Admin]
Get all users (admin only).

#### GET /users/{userId} [Basic Auth, Admin]
Get details of a specific user (admin only).

## Response Format

All responses are in JSON format. Error responses include a message field:

```json
{
  "message": "Error message"
}
```

## Status Codes

- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Data Models

### Ticket
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "priority": "string",
  "status": "string",
  "createdBy": "string",
  "assignedTo": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "comments": [
    {
      "id": "string",
      "content": "string",
      "createdBy": "string",
      "createdAt": "string"
    }
  ]
}
```

### User
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "string",
  "createdAt": "string"
}
``` 