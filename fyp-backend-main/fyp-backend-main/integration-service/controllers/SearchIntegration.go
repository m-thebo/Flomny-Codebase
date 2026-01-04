package controllers

import (
	"context"
	"errors"
	"strings"

	"integration-service/models"
	integration_service "integration-service/proto/generated/github.com/multiagentai/backend/integration-service"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *IntegrationServer) SearchIntegration(ctx context.Context, req *integration_service.SearchIntegrationRequest) (*integration_service.SearchIntegrationResponse, error) {
	// Validate the search query
	query := strings.TrimSpace(req.GetQuery())
	if query == "" {
		return nil, errors.New("search query cannot be empty")
	}

	// Connect to the integrations collection
	integrationCollection := s.DocDB.Database("fyp-db").Collection("integrations")

	// Case-insensitive filter for the search query
	filter := bson.M{
		"$or": []bson.M{
			{"display_name": bson.M{"$regex": query, "$options": "i"}},
			{"unique_name": bson.M{"$regex": query, "$options": "i"}},
			{"description": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	// Perform the query
	cursor, err := integrationCollection.Find(ctx, filter)
	if err == mongo.ErrNoDocuments {
		// No integrations found
		return &integration_service.SearchIntegrationResponse{
			Integrations: []*integration_service.Integration{},
		}, nil
	} else if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Process the results
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
	return &integration_service.SearchIntegrationResponse{
		Integrations: integrations,
	}, nil
}
