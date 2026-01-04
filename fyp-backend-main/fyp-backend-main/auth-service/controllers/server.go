package controllers

import (
	auth_service "auth-service/proto/generated/github.com/multiagentai/backend/auth-service"

	"go.mongodb.org/mongo-driver/mongo"
)

// AuthServer implements the AuthService server
type AuthServer struct {
	auth_service.UnimplementedAuthServiceServer
	DocDB *mongo.Client // MongoDB client to interact with the database
}
