# Hotel Management API

A mock API for a hotel management system with authentication, user profiles, room browsing, and booking functionality.

## Setup

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

The server will run on port 5000 by default (http://localhost:5000).

## API Endpoints

### Authentication

#### Register a new user
- **URL:** `/auth/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "JWT_TOKEN",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "",
      "bookings": []
    }
  }
  ```

#### Login
- **URL:** `/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "JWT_TOKEN",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "",
      "bookings": []
    }
  }
  ```

#### Logout
- **URL:** `/auth/logout`
- **Method:** `POST`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Response:**
  ```json
  {
    "message": "Logout successful"
  }
  ```

### User Profile

#### Get user profile
- **URL:** `/users/:id`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Response:**
  ```json
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "bookings": ["booking_id1", "booking_id2"],
    "bookingDetails": [
      {
        "id": "booking_id1",
        "roomId": "room_id",
        "startDate": "2023-01-10",
        "endDate": "2023-01-15",
        "status": "confirmed"
      }
    ]
  }
  ```

#### Update user profile
- **URL:** `/users/:id`
- **Method:** `PUT`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "name": "John Doe Updated",
    "phone": "555-999-8888"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "id": "uuid",
      "name": "John Doe Updated",
      "email": "john@example.com",
      "phone": "555-999-8888",
      "bookings": ["booking_id1"]
    }
  }
  ```

### Rooms & Amenities

#### Browse available rooms
- **URL:** `/rooms`
- **Method:** `GET`
- **Query Parameters:**
  - `type`: Room type (standard, deluxe, suite, family)
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `capacity`: Minimum capacity
  - `startDate`: Check-in date (YYYY-MM-DD)
  - `endDate`: Check-out date (YYYY-MM-DD)
  - `available`: true/false
- **Response:** Array of room objects

#### Get specific room details
- **URL:** `/rooms/:id`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "id": "room_id",
    "name": "Deluxe Double Room",
    "type": "deluxe",
    "price": 149.99,
    "capacity": 2,
    "description": "Spacious room with premium amenities",
    "amenities": ["wifi", "tv", "air-conditioning", "mini-bar", "safe"],
    "images": ["deluxe_double_1.jpg", "deluxe_double_2.jpg"]
  }
  ```

#### List available hotel amenities
- **URL:** `/amenities`
- **Method:** `GET`
- **Query Parameters:**
  - `type`: Amenity type (hotel, room)
- **Response:** Array of amenity objects

### Booking & Checkout

#### Create a new booking
- **URL:** `/bookings`
- **Method:** `POST`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "roomId": "room_id",
    "startDate": "2023-03-10",
    "endDate": "2023-03-15",
    "guests": 2
  }
  ```
- **Response:**
  ```json
  {
    "message": "Booking created successfully",
    "booking": {
      "id": "booking_id",
      "userId": "user_id",
      "roomId": "room_id",
      "startDate": "2023-03-10",
      "endDate": "2023-03-15",
      "guests": 2,
      "totalPrice": 749.95,
      "status": "pending"
    }
  }
  ```

#### Get booking details
- **URL:** `/bookings/:id`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Response:**
  ```json
  {
    "id": "booking_id",
    "userId": "user_id",
    "roomId": "room_id",
    "startDate": "2023-03-10",
    "endDate": "2023-03-15",
    "guests": 2,
    "totalPrice": 749.95,
    "status": "pending",
    "room": {
      "id": "room_id",
      "name": "Deluxe Double Room",
      "type": "deluxe",
      "price": 149.99
    }
  }
  ```

#### Complete checkout
- **URL:** `/checkout`
- **Method:** `POST`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "bookingId": "booking_id",
    "paymentMethod": "credit_card",
    "specialRequests": "Late check-in, extra pillows"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Checkout completed successfully",
    "booking": {
      "id": "booking_id",
      "status": "confirmed",
      "paymentStatus": "paid",
      "specialRequests": "Late check-in, extra pillows"
    }
  }
  ```

## Authentication

The API uses JWT (JSON Web Token) for authentication. After login or registration, you'll receive a token that should be included in the `x-auth-token` header for protected routes.

## Data Storage

This is a mock API that stores data in memory. All data will be lost when the server restarts. 