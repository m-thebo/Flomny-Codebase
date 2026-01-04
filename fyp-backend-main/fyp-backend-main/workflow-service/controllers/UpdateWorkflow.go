package controllers

import (
	"context"
	"errors"
	"strings"
	"time"
	"workflow-service/models"
	workflow_service "workflow-service/proto/generated/github.com/multiagentai/backend/workflow-service"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *WorkflowServer) UpdateWorkflow(ctx context.Context, in *workflow_service.UpdateWorkflowRequest) (*workflow_service.UpdateWorkflowResponse, error) {
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

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(in.Id)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid ID format: %v", err)
	}

	// Prepare update fields
	update := bson.M{
		"updatedAt": time.Now(),
	}

	if strings.TrimSpace(in.Name) != "" {
		update["name"] = in.Name
	}

	if strings.TrimSpace(in.Description) != "" {
		update["description"] = in.Description
	}

	if strings.TrimSpace(in.WorkflowURL) != "" {
		update["workflowURL"] = in.WorkflowURL
	}

	// Handle optional projectId
	if in.ProjectId != nil {
		update["projectID"] = *in.ProjectId
	}

	// Perform the update and get the updated document in one operation
	var workflowDoc models.Workflow
	err = s.DocDB.Database("fyp-db").Collection("workflows").FindOneAndUpdate(
		ctx,
		bson.M{
			"_id":       objectID,
			"createdBy": userID,
		},
		bson.M{"$set": update},
	).Decode(&workflowDoc)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, status.Errorf(codes.NotFound, "workflow not found or you don't have permission to update it")
		}
		return nil, status.Errorf(codes.Internal, "Failed to update workflow: %v", err)
	}

	// Convert to response object
	workflow := &workflow_service.Workflow{
		Id:          workflowDoc.ID.Hex(),
		Name:        workflowDoc.Name,
		Description: workflowDoc.Description,
		Public:      workflowDoc.Public,
		ProjectId:   workflowDoc.ProjectID,
		WorkflowURL: workflowDoc.WorkflowURL,
		CreatedAt:   timestamppb.New(workflowDoc.CreatedAt),
		UpdatedAt:   timestamppb.New(workflowDoc.UpdatedAt),
		DeletedAt:   nil,
	}

	return &workflow_service.UpdateWorkflowResponse{
		Workflow: workflow,
	}, nil
}
