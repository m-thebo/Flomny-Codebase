package main

import (
	"fmt"
	"log"
	"net"

	"integration-service/controllers"
	integration_service "integration-service/proto/generated/github.com/multiagentai/backend/integration-service"
	"integration-service/utils"

	"google.golang.org/grpc"
)

func main() {
	// Connect to the MongoDB Database
	db, err := utils.ConnectToDB()
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	// Connect to Redis
	err = utils.ConnectToCache()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	// Set up gRPC server
	fmt.Println("Starting gRPC server on port 50051")

	listener, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	// Register the Integration service
	integration_service.RegisterIntegrationServiceServer(grpcServer, &controllers.IntegrationServer{
		DocDB: db, // Pass the database connection to the server
	})

	// Start the server
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
