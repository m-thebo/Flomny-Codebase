package controllers

import (
	"context"
	"errors"

	"integration-service/models"
	integration_service "integration-service/proto/generated/github.com/multiagentai/backend/integration-service"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *IntegrationServer) GetUserIntegrations(ctx context.Context, req *integration_service.GetUserIntegrationsRequest) (*integration_service.GetUserIntegrationsResponse, error) {
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

	// Connect to the integrations collection
	integrationCollection := s.DocDB.Database("fyp-db").Collection("integrations")

	// Query for integrations that are either created by the user OR are public
	filter := bson.M{
		"$or": []bson.M{
			{"created_by": userID},
			{"public": true},
		},
	}
	cursor, err := integrationCollection.Find(ctx, filter)
	if err == mongo.ErrNoDocuments {
		// No integrations found for the user
		return &integration_service.GetUserIntegrationsResponse{
			Integrations: []*integration_service.Integration{},
		}, nil
	} else if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Prepare the response by iterating over the cursor
	var integrations []*integration_service.Integration
	for cursor.Next(ctx) {
		var integration models.Integration
		if err := cursor.Decode(&integration); err != nil {
			return nil, err
		}

		// Convert timestamps
		createdAt := timestamppb.New(integration.CreatedAt)
		updatedAt := timestamppb.New(integration.UpdatedAt)
		var deletedAt *timestamppb.Timestamp
		if integration.DeletedAt != nil {
			deletedAt = timestamppb.New(*integration.DeletedAt)
		}

		// Add the integration to the response
		integrations = append(integrations, &integration_service.Integration{
			Id:          integration.ID.Hex(),
			DisplayName: integration.DisplayName,
			UniqueName:  integration.UniqueName,
			Description: integration.Description,
			AdditionalInfo: &integration_service.AdditionalInfo{
				IsFileBased:      integration.AdditionalInfo.IsFileBased,
				FileStatus:       string(integration.AdditionalInfo.FileStatus),
				PublicBaseURL:    integration.AdditionalInfo.PublicBaseURL,
				DocumentationURL: integration.AdditionalInfo.DocumentationURL,
				IsLocallyStored:  integration.AdditionalInfo.IsLocallyStored,
			},
			CreatedBy: integration.CreatedBy,
			Public:    integration.Public,
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
			DeletedAt: deletedAt,
		})
	}

	// Return the response
	return &integration_service.GetUserIntegrationsResponse{
		Integrations: integrations,
	}, nil
}
