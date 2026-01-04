# ERP System Mock API

This is a complete mock API for an ERP (Enterprise Resource Planning) system. It provides a RESTful interface for various business modules including inventory management, procurement, sales, finance, HR, manufacturing, and logistics.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the ERP-SYSTEM directory
3. Install dependencies:

```bash
npm install
```

### Running the Server

Start the development server:

```bash
npm run dev
```

The server will run on port 3000 by default. You can access the API at `http://localhost:3000`.

## API Endpoints

### Inventory Management

- `GET /inventory/items` - List all inventory items
- `GET /inventory/items/{itemId}` - Get a specific inventory item
- `POST /inventory/items` - Create a new inventory item
- `PUT /inventory/items/{itemId}` - Update an inventory item
- `DELETE /inventory/items/{itemId}` - Delete an inventory item
- `GET /inventory/stock-levels` - Get stock levels for all items
- `POST /inventory/adjust-stock` - Adjust stock quantity for an item

### Procurement

- `GET /procurement/vendors` - List all vendors
- `POST /procurement/vendors` - Create a new vendor
- `GET /procurement/vendors/{vendorId}` - Get a specific vendor
- `GET /procurement/purchase-orders` - List all purchase orders
- `POST /procurement/purchase-orders` - Create a new purchase order
- `GET /procurement/purchase-orders/{orderId}` - Get a specific purchase order
- `PUT /procurement/purchase-orders/{orderId}/status` - Update the status of a purchase order

### Sales

- `GET /sales/customers` - List all customers
- `POST /sales/customers` - Create a new customer
- `GET /sales/customers/{customerId}` - Get a specific customer
- `GET /sales/orders` - List all sales orders
- `POST /sales/orders` - Create a new sales order
- `GET /sales/orders/{orderId}` - Get a specific sales order
- `PUT /sales/orders/{orderId}/status` - Update the status of a sales order

### Finance

- `GET /finance/transactions` - List all financial transactions
- `POST /finance/transactions` - Create a new financial transaction
- `GET /finance/transactions/{transactionId}` - Get a specific transaction
- `GET /finance/accounts` - List all financial accounts
- `POST /finance/accounts` - Create a new financial account

### Human Resources

- `GET /hr/employees` - List all employees
- `POST /hr/employees` - Create a new employee
- `GET /hr/employees/{employeeId}` - Get a specific employee
- `GET /hr/payroll` - Get payroll information
- `POST /hr/payroll/run` - Run a new payroll process

### Manufacturing

- `GET /manufacturing/orders` - List all production orders
- `POST /manufacturing/orders` - Create a new production order
- `GET /manufacturing/orders/{productionOrderId}` - Get a specific production order
- `POST /manufacturing/material-requests` - Create a material request for production
- `GET /manufacturing/material-requests/{requestId}` - Get a specific material request

### Logistics

- `GET /logistics/shipments` - List all shipments
- `POST /logistics/shipments` - Create a new shipment
- `GET /logistics/shipments/{shipmentId}` - Get a specific shipment
- `GET /logistics/tracking/{shipmentId}` - Get tracking information for a shipment

### System

- `GET /system/health` - Get system health status
- `GET /system/version` - Get system version information

## Data Persistence

This is a mock API that stores data in memory. Data will be reset when the server restarts.

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - The request was successful
- `201 Created` - A new resource was created successfully
- `400 Bad Request` - The request was invalid or cannot be served
- `404 Not Found` - The requested resource does not exist
- `500 Internal Server Error` - An error occurred on the server 