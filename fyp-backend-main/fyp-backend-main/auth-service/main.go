package main

import (
	"auth-service/controllers"
	auth_service "auth-service/proto/generated/github.com/multiagentai/backend/auth-service"
	"auth-service/utils"
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
)

func main() {
	// Set up a gRPC server
	fmt.Println("Starting gRPC server on port 50000")

	listener, err := net.Listen("tcp", ":50000")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	// Connect to Database
	db, err := utils.ConnectToDB()
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	// Register the Directory service
	auth_service.RegisterAuthServiceServer(grpcServer, &controllers.AuthServer{
		DocDB: db,
	})

	// Start serving
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
