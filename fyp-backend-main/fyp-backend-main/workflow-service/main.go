package main

import (
	"fmt"
	"log"
	"net"
	"workflow-service/controllers"
	workflow_service "workflow-service/proto/generated/github.com/multiagentai/backend/workflow-service"
	"workflow-service/utils"

	"google.golang.org/grpc"
)

func main() {
	// Connect to the MongoDB Database
	db, err := utils.ConnectToDB()
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	// Set up gRPC server
	fmt.Println("Starting gRPC server on port 50002")

	listener, err := net.Listen("tcp", ":50002")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	// Register the Workflow service
	workflow_service.RegisterWorkflowServiceServer(grpcServer, &controllers.WorkflowServer{
		DocDB: db, // Pass the database connection to the server
	})

	// Start the server
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
