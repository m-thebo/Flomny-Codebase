package controllers

import (
	integration_service "integration-service/proto/generated/github.com/multiagentai/backend/integration-service"

	"go.mongodb.org/mongo-driver/mongo"
)

// IntegrationServer implements the IntegrationService server
type IntegrationServer struct {
	integration_service.UnimplementedIntegrationServiceServer
	DocDB *mongo.Client // MongoDB database connection
}
