package controllers

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"integration-service/models"
	integration_service "integration-service/proto/generated/github.com/multiagentai/backend/integration-service"
	"integration-service/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *IntegrationServer) CreateIntegration(ctx context.Context, req *integration_service.CreateIntegrationRequest) (*integration_service.CreateIntegrationResponse, error) {
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

	// Validate userID
	userCollection := s.DocDB.Database("fyp-db").Collection("users")
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid userID format")
	}

	var user struct{}
	err = userCollection.FindOne(ctx, bson.M{"_id": userObjectID}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("user not found")
	} else if err != nil {
		return nil, err
	}

	// Normalize unique_name
	normalizedUniqueName := strings.TrimSpace(strings.ToLower(req.GetUniqueName()))

	// Check if unique_name already exists
	integrationCollection := s.DocDB.Database("fyp-db").Collection("integrations")
	var existingIntegration models.Integration
	err = integrationCollection.FindOne(ctx, bson.M{"unique_name": normalizedUniqueName}).Decode(&existingIntegration)
	if err == nil {
		return nil, errors.New("unique_name already exists")
	} else if err != mongo.ErrNoDocuments {
		return nil, err
	}

	// Generate integration data
	integrationID := primitive.NewObjectID()
	additionalInfo := models.AdditionalInfo{
		DocumentationURL: req.GetDocumentationUrl(),
		PublicBaseURL:    req.GetBaseUrl(),
	}

	if req.GetIsLocallyStored() {
		additionalInfo.IsFileBased = true
		additionalInfo.IsLocallyStored = true
		additionalInfo.FileStatus = models.FileStatusUploaded
	} else {
		additionalInfo.IsFileBased = false
		additionalInfo.IsLocallyStored = false
		additionalInfo.FileStatus = models.FileStatusNoUpload
	}

	integration := models.Integration{
		ID:             integrationID,
		DisplayName:    req.GetDisplayName(),
		UniqueName:     normalizedUniqueName,
		Description:    req.GetDescription(),
		CreatedBy:      userID,
		Public:         req.GetPublic(),
		AdditionalInfo: additionalInfo,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Insert integration into DB
	_, err = integrationCollection.InsertOne(ctx, integration)
	if err != nil {
		return nil, err
	}

	// Prepare gRPC Integration object
	createdAt := timestamppb.New(integration.CreatedAt)
	updatedAt := timestamppb.New(integration.UpdatedAt)
	var deletedAt *timestamppb.Timestamp
	if integration.DeletedAt != nil {
		deletedAt = timestamppb.New(*integration.DeletedAt)
	}

	integrationObject := &integration_service.Integration{
		Id:          integration.ID.Hex(),
		DisplayName: integration.DisplayName,
		UniqueName:  integration.UniqueName,
		Description: integration.Description,
		CreatedBy:   integration.CreatedBy,
		Public:      integration.Public,
		AdditionalInfo: &integration_service.AdditionalInfo{
			IsFileBased:      integration.AdditionalInfo.IsFileBased,
			FileStatus:       string(integration.AdditionalInfo.FileStatus),
			PublicBaseURL:    integration.AdditionalInfo.PublicBaseURL,
			DocumentationURL: integration.AdditionalInfo.DocumentationURL,
			IsLocallyStored:  integration.AdditionalInfo.IsLocallyStored,
		},
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
		DeletedAt: deletedAt,
	}

	//  Publish event if file is based
	if integrationObject.AdditionalInfo.IsFileBased {
		if utils.RDB != nil {
			// Marshal the integrationObject to JSON
			payload, err := json.Marshal(integrationObject)
			if err != nil {
				return nil, err
			}

			// Publish to Redis channel
			err = utils.RDB.Publish(context.Background(), "integration_created", payload).Err()
			if err != nil {
				return nil, err
			}
		} else {
			return nil, errors.New("redis client not initialized")
		}
	}

	// Return created integration
	return &integration_service.CreateIntegrationResponse{
		Integration: integrationObject,
	}, nil
}
