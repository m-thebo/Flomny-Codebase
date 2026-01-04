package controllers

import (
	"context"
	"errors"

	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/grpc/metadata"

	integration_service "integration-service/proto/generated/github.com/multiagentai/backend/integration-service"
)

func (s *IntegrationServer) DeleteIntegration(ctx context.Context, req *integration_service.DeleteIntegrationRequest) (*integration_service.DeleteIntegrationResponse, error) {
	// Extract userID from gRPC metadata
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, errors.New("metadata not provided in gRPC context")
	}

	userIDs := md.Get("userID")
	if len(userIDs) == 0 {
		return nil, errors.New("userID not found in metadata")
	}
	userID := userIDs[0]

	// Validate integration ID
	integrationID, err := primitive.ObjectIDFromHex(req.GetId())
	if err != nil {
		return nil, errors.New("invalid integration ID format")
	}

	// Locate the integration document
	integrationCollection := s.DocDB.Database("fyp-db").Collection("integrations")
	var integration struct {
		CreatedBy string `bson:"created_by" json:"created_by"`
	}
	err = integrationCollection.FindOne(ctx, bson.M{"_id": integrationID}).Decode(&integration)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("integration not found")
	} else if err != nil {
		return nil, err
	}

	// Verify user authorization
	if !strings.EqualFold(strings.TrimSpace(integration.CreatedBy), strings.TrimSpace(userID)) {
		return nil, errors.New("user is not authorized to delete this integration")
	}

	// Delete the integration
	_, err = integrationCollection.DeleteOne(ctx, bson.M{"_id": integrationID})
	if err != nil {
		return nil, err
	}

	// Return the response
	return &integration_service.DeleteIntegrationResponse{
		Success: true,
	}, nil
}
