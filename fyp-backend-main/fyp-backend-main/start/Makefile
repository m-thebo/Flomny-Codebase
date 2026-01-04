AUTH_BINARY=authApp
GATEWAY_BINARY=gatewayApp
INTEGRATION_BINARY=integrationApp
WORKFLOW_BINARY=workflowApp
## up: starts all containers in the background without forcing build
up:
	@echo "Starting Docker images..."
	docker compose up -d
	@echo "Docker images started!"

up_build: build_auth build_gateway build_integration build_workflow
	@echo "Stopping docker images (if running...)"
	docker compose down
	@echo "Building (when required) and starting docker images..."
	docker compose up --build -d
	@echo "Docker images built and started!"

## down: stop docker compose
down:
	@echo "Stopping docker compose..."
	docker compose down
	@echo "Done!"

## build_auth: builds the auth binary as a linux executable
build_auth:
	@echo "Building auth binary..."
	cd ../auth-service && env GOOS=linux CGO_ENABLED=0 go build -o ${AUTH_BINARY} .
	@echo "Done!"

## build_gateway: builds the gateway binary as a linux executable
build_gateway:
	@echo "Building gateway binary..."
	cd ../api-gateway && env GOOS=linux CGO_ENABLED=0 go build -o ${GATEWAY_BINARY} .
	@echo "Done!"

## build_workflow: builds the workflow binary as a linux executable
build_workflow:
	@echo "Building workflow binary..."
	cd ../workflow-service && env GOOS=linux CGO_ENABLED=0 go build -o ${WORKFLOW_BINARY} .
	@echo "Done!"

## build_integration: builds the integration binary as a linux executable
build_integration:
	@echo "Building integration binary..."
	cd ../integration-service && env GOOS=linux CGO_ENABLED=0 go build -o ${INTEGRATION_BINARY} .
	@echo "Done!"