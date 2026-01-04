# Point of Sale (POS) System API

A mock API for a point of sale system with authentication, inventory management, sales processing, customer management, and payment processing.

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

#### Login
- **URL:** `/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "JWT_TOKEN",
    "user": {
      "id": "uuid",
      "username": "admin",
      "role": "admin",
      "name": "System Administrator",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "lastLogin": "2023-07-01T15:30:45.123Z"
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

### Products/Inventory

#### Get all products
- **URL:** `/products`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Query Parameters:**
  - `category`: Filter by category
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `inStock`: Filter only products in stock (true/false)
- **Response:** Array of product objects

#### Get product details
- **URL:** `/products/:id`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Response:**
  ```json
  {
    "id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "price": 19.99,
    "stock": 100,
    "category": "Category",
    "barcode": "PROD001",
    "cost": 10.50,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
  ```

#### Add new product (admin only)
- **URL:** `/products`
- **Method:** `POST`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "stock": 50,
    "category": "Category",
    "barcode": "NEWPROD001",
    "cost": 15.00
  }
  ```
- **Response:**
  ```json
  {
    "message": "Product added successfully",
    "product": {
      "id": "uuid",
      "name": "New Product",
      "description": "Product description",
      "price": 29.99,
      "stock": 50,
      "category": "Category",
      "barcode": "NEWPROD001",
      "cost": 15.00,
      "createdAt": "2023-07-01T15:30:45.123Z",
      "updatedAt": "2023-07-01T15:30:45.123Z"
    }
  }
  ```

#### Update product (admin only)
- **URL:** `/products/:id`
- **Method:** `PUT`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "price": 24.99,
    "stock": 75
  }
  ```
- **Response:**
  ```json
  {
    "message": "Product updated successfully",
    "product": {
      "id": "uuid",
      "name": "Product Name",
      "price": 24.99,
      "stock": 75,
      "updatedAt": "2023-07-01T15:30:45.123Z"
    }
  }
  ```

#### Delete product (admin only)
- **URL:** `/products/:id`
- **Method:** `DELETE`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Response:**
  ```json
  {
    "message": "Product deleted successfully",
    "product": {
      "id": "uuid",
      "name": "Product Name"
    }
  }
  ```

### Sales Transactions

#### Get all sales
- **URL:** `/sales`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Query Parameters:**
  - `status`: Filter by status (pending, completed, cancelled)
  - `startDate`: Filter by start date (YYYY-MM-DD)
  - `endDate`: Filter by end date (YYYY-MM-DD)
  - `customerId`: Filter by customer ID
- **Response:** Array of sale objects

#### Get sale details
- **URL:** `/sales/:id`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Response:**
  ```json
  {
    "id": "uuid",
    "items": [
      {
        "productId": "product_uuid",
        "name": "Product Name",
        "quantity": 2,
        "price": 19.99,
        "subtotal": 39.98
      }
    ],
    "cashierId": "cashier_uuid",
    "customerId": "customer_uuid",
    "date": "2023-07-01T15:30:45.123Z",
    "subtotal": 39.98,
    "tax": 4.00,
    "total": 43.98,
    "status": "completed",
    "paymentStatus": "paid",
    "paymentId": "payment_uuid",
    "customer": {
      "id": "customer_uuid",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "555-123-4567"
    }
  }
  ```

#### Create new sale
- **URL:** `/sales`
- **Method:** `POST`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "items": [
      {
        "productId": "product_uuid",
        "quantity": 2
      },
      {
        "productId": "product_uuid2",
        "quantity": 1
      }
    ],
    "customerId": "customer_uuid"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Sale created successfully",
    "sale": {
      "id": "uuid",
      "items": [
        {
          "productId": "product_uuid",
          "name": "Product Name",
          "quantity": 2,
          "price": 19.99,
          "subtotal": 39.98
        },
        {
          "productId": "product_uuid2",
          "name": "Product Name 2",
          "quantity": 1,
          "price": 29.99,
          "subtotal": 29.99
        }
      ],
      "cashierId": "cashier_uuid",
      "customerId": "customer_uuid",
      "date": "2023-07-01T15:30:45.123Z",
      "subtotal": 69.97,
      "tax": 7.00,
      "total": 76.97,
      "status": "pending",
      "paymentStatus": "pending"
    }
  }
  ```

### Customers

#### Get all customers
- **URL:** `/customers`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Query Parameters:**
  - `name`: Search by name
  - `email`: Search by email
  - `phone`: Search by phone
- **Response:** Array of customer objects

#### Get customer details
- **URL:** `/customers/:id`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Response:**
  ```json
  {
    "id": "uuid",
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "555-123-4567",
    "address": "123 Main St, Anytown, USA",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z",
    "totalPurchases": 143.94,
    "salesCount": 2,
    "recentSales": [
      {
        "id": "sale_uuid",
        "date": "2023-07-01T15:30:45.123Z",
        "total": 76.97,
        "status": "completed"
      }
    ]
  }
  ```

#### Add new customer
- **URL:** `/customers`
- **Method:** `POST`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "name": "New Customer",
    "email": "newcustomer@example.com",
    "phone": "555-987-6543",
    "address": "456 Oak Ave, Somewhere, USA"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Customer added successfully",
    "customer": {
      "id": "uuid",
      "name": "New Customer",
      "email": "newcustomer@example.com",
      "phone": "555-987-6543",
      "address": "456 Oak Ave, Somewhere, USA",
      "createdAt": "2023-07-01T15:30:45.123Z",
      "updatedAt": "2023-07-01T15:30:45.123Z",
      "totalPurchases": 0,
      "purchaseHistory": []
    }
  }
  ```

#### Update customer
- **URL:** `/customers/:id`
- **Method:** `PUT`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "phone": "555-111-2222",
    "address": "789 Pine Rd, Nowhere, USA"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Customer updated successfully",
    "customer": {
      "id": "uuid",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "555-111-2222",
      "address": "789 Pine Rd, Nowhere, USA",
      "updatedAt": "2023-07-01T15:30:45.123Z"
    }
  }
  ```

### Payments

#### Get payment details
- **URL:** `/payments/:id`
- **Method:** `GET`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Response:**
  ```json
  {
    "id": "uuid",
    "saleId": "sale_uuid",
    "amount": 76.97,
    "method": "credit_card",
    "cashierId": "cashier_uuid",
    "date": "2023-07-01T15:30:45.123Z",
    "status": "completed",
    "changeAmount": 0,
    "transactionId": "TXN-1625144190123-123",
    "sale": {
      "id": "sale_uuid",
      "date": "2023-07-01T15:30:45.123Z",
      "items": 2,
      "subtotal": 69.97,
      "tax": 7.00,
      "total": 76.97,
      "status": "completed"
    }
  }
  ```

#### Process payment
- **URL:** `/payments`
- **Method:** `POST`
- **Headers:** `x-auth-token: JWT_TOKEN`
- **Body:**
  ```json
  {
    "saleId": "sale_uuid",
    "method": "cash",
    "amountTendered": 100
  }
  ```
- **Response:**
  ```json
  {
    "message": "Payment processed successfully",
    "payment": {
      "id": "uuid",
      "saleId": "sale_uuid",
      "amount": 76.97,
      "method": "cash",
      "cashierId": "cashier_uuid",
      "date": "2023-07-01T15:30:45.123Z",
      "status": "completed",
      "changeAmount": 23.03,
      "transactionId": "TXN-1625144190123-123"
    },
    "sale": {
      "id": "sale_uuid",
      "status": "completed",
      "paymentStatus": "paid"
    }
  }
  ```

## Authentication

The API uses JWT (JSON Web Token) for authentication. After login, you'll receive a token that should be included in the `x-auth-token` header for protected routes.

There are two user roles:
- **Admin**: Can perform all operations, including adding/updating/deleting products
- **Cashier**: Can process sales and payments, view inventory, but cannot modify product information

## Data Storage

This is a mock API that stores data in memory. All data will be lost when the server restarts. 