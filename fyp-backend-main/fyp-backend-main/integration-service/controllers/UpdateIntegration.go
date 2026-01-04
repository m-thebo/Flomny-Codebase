package controllers

import (
	"context"
	"errors"
	"time"

	"integration-service/models"
	integration_service "integration-service/proto/generated/github.com/multiagentai/backend/integration-service"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *IntegrationServer) UpdateIntegration(ctx context.Context, req *integration_service.UpdateIntegrationRequest) (*integration_service.UpdateIntegrationResponse, error) {
	// Validate input fields
	if req.GetId() == "" {
		return nil, errors.New("id is required")
	}

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

	// Find the integration by id
	integrationCollection := s.DocDB.Database("fyp-db").Collection("integrations")
	objectID, err := primitive.ObjectIDFromHex(req.GetId())
	if err != nil {
		return nil, errors.New("invalid integration id format")
	}
	filter := bson.M{"_id": objectID}

	var integration models.Integration
	err = integrationCollection.FindOne(ctx, filter).Decode(&integration)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("integration not found")
	} else if err != nil {
		return nil, err
	}

	// Ensure the user is authorized to update the integration
	if integration.CreatedBy != userID {
		return nil, errors.New("user is not authorized to update this integration")
	}

	// If uniqueName is being updated, check if it's already taken
	if req.GetUniqueName() != "" && req.GetUniqueName() != integration.UniqueName {
		// Check if the new unique name is already taken
		existingFilter := bson.M{
			"unique_name": req.GetUniqueName(),
			"_id": bson.M{
				"$ne": objectID,
			},
		}
		count, err := integrationCollection.CountDocuments(ctx, existingFilter)
		if err != nil {
			return nil, err
		}
		if count > 0 {
			return nil, errors.New("unique name is already taken")
		}
	}

	// Prepare the update fields
	updateFields := bson.M{
		"updated_at": time.Now(),
	}

	// Update fields if they are provided
	if req.GetDisplayName() != "" {
		updateFields["display_name"] = req.GetDisplayName()
	}
	if req.GetUniqueName() != "" {
		updateFields["unique_name"] = req.GetUniqueName()
	}
	if req.GetDescription() != "" {
		updateFields["description"] = req.GetDescription()
	}
	if req.GetDocumentationURL() != "" {
		updateFields["additional_info.documentation_url"] = req.GetDocumentationURL()
	}
	if req.GetPublicBaseURL() != "" {
		updateFields["additional_info.public_base_url"] = req.GetPublicBaseURL()
	}
	// Handle boolean fields
	updateFields["additional_info.is_locally_stored"] = req.GetIsLocallyStored()
	updateFields["public"] = req.GetPublic()

	// Perform the update operation
	update := bson.M{"$set": updateFields}
	_, err = integrationCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	// Fetch the updated integration
	err = integrationCollection.FindOne(ctx, filter).Decode(&integration)
	if err != nil {
		return nil, err
	}

	// Convert timestamps to gRPC-compatible format
	createdAt := timestamppb.New(integration.CreatedAt)
	updatedAt := timestamppb.New(integration.UpdatedAt)
	var deletedAt *timestamppb.Timestamp
	if integration.DeletedAt != nil {
		deletedAt = timestamppb.New(*integration.DeletedAt)
	}

	// Return the updated integration response
	return &integration_service.UpdateIntegrationResponse{
		Integration: &integration_service.Integration{
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
		},
	}, nil
}
