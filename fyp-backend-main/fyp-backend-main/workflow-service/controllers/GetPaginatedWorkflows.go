package controllers

import (
	"context"
	"workflow-service/models"
	workflow_service "workflow-service/proto/generated/github.com/multiagentai/backend/workflow-service"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (w *WorkflowServer) GetPaginatedCommunityWorkflows(ctx context.Context, req *workflow_service.GetPaginatedCommunityWorkflowsRequest) (*workflow_service.GetPaginatedCommunityWorkflowsResponse, error) {
	offset := req.Offset
	limit := req.Limit

	// Create find options for pagination
	findOptions := options.Find().
		SetSkip(int64(offset)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"createdAt": -1}) // Sort by creation date, newest first

	// Find public workflows
	cursor, err := w.DocDB.Database("fyp-db").Collection("workflows").Find(ctx, bson.M{
		"public": true,
		"deletedAt": bson.M{
			"$exists": false,
		},
	}, findOptions)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to fetch workflows: %v", err)
	}
	defer cursor.Close(ctx)

	// Count total number of public workflows
	total, err := w.DocDB.Database("fyp-db").Collection("workflows").CountDocuments(ctx, bson.M{
		"public": true,
		"deletedAt": bson.M{
			"$exists": false,
		},
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to count workflows: %v", err)
	}

	// Convert cursor to workflow list
	var workflows []*workflow_service.Workflow
	for cursor.Next(ctx) {
		var workflow models.Workflow
		if err := cursor.Decode(&workflow); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to decode workflow: %v", err)
		}

		workflows = append(workflows, &workflow_service.Workflow{
			Id:          workflow.ID.Hex(),
			Name:        workflow.Name,
			Description: workflow.Description,
			CreatedBy:   workflow.CreatedBy,
			Public:      workflow.Public,
			WorkflowURL: workflow.WorkflowURL,
			ProjectId:   workflow.ProjectID,
			CreatedAt:   timestamppb.New(workflow.CreatedAt),
			UpdatedAt:   timestamppb.New(workflow.UpdatedAt),
			DeletedAt:   nil,
		})
	}

	if err := cursor.Err(); err != nil {
		return nil, status.Errorf(codes.Internal, "cursor error: %v", err)
	}

	return &workflow_service.GetPaginatedCommunityWorkflowsResponse{
		Workflows: workflows,
		Total:     int32(total),
	}, nil
}
