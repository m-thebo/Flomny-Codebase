package controllers

import (
	"context"
	"integration-service/models"
	integration_service "integration-service/proto/generated/github.com/multiagentai/backend/integration-service"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (i *IntegrationServer) GetPaginatedCommunityIntegrations(ctx context.Context, req *integration_service.GetPaginatedCommunityIntegrationsRequest) (*integration_service.GetPaginatedCommunityIntegrationsResponse, error) {
	offset := req.Offset
	limit := req.Limit

	findOptions := options.Find().
		SetSkip(int64(offset)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"created_at": -1})

	// Find public integrations that haven't been deleted
	cursor, err := i.DocDB.Database("fyp-db").Collection("integrations").Find(ctx, bson.M{
		"public": true,
		"deleted_at": bson.M{
			"$exists": false,
		},
	}, findOptions)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to fetch integrations: %v", err)
	}
	defer cursor.Close(ctx)

	integrations := make([]*integration_service.Integration, 0)
	for cursor.Next(ctx) {
		var integration models.Integration
		if err := cursor.Decode(&integration); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to decode integration: %v", err)
		}

		// Handle FailedReason pointer
		var failedReason string
		if integration.AdditionalInfo.FailedReason != nil {
			failedReason = *integration.AdditionalInfo.FailedReason
		}

		integrations = append(integrations, &integration_service.Integration{
			Id:          integration.ID.Hex(),
			DisplayName: integration.DisplayName,
			Public:      integration.Public,
			UniqueName:  integration.UniqueName,
			Description: integration.Description,
			CreatedBy:   integration.CreatedBy,
			AdditionalInfo: &integration_service.AdditionalInfo{
				IsFileBased:      integration.AdditionalInfo.IsFileBased,
				FileStatus:       string(integration.AdditionalInfo.FileStatus),
				FailedReason:     failedReason,
				PublicBaseURL:    integration.AdditionalInfo.PublicBaseURL,
				DocumentationURL: integration.AdditionalInfo.DocumentationURL,
				IsLocallyStored:  integration.AdditionalInfo.IsLocallyStored,
			},
			CreatedAt: timestamppb.New(integration.CreatedAt),
			UpdatedAt: timestamppb.New(integration.UpdatedAt),
			DeletedAt: nil,
		})
	}

	// Count total number of public integrations that haven't been deleted
	total, err := i.DocDB.Database("fyp-db").Collection("integrations").CountDocuments(ctx, bson.M{
		"public": true,
		"deleted_at": bson.M{
			"$exists": false,
		},
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to count integrations: %v", err)
	}

	return &integration_service.GetPaginatedCommunityIntegrationsResponse{
		Integrations: integrations,
		Total:        int32(total),
	}, nil
}
