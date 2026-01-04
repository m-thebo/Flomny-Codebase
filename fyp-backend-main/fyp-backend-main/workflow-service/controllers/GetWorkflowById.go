package controllers

// WORKS
import (
	"context"
	"errors"
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

func (s *WorkflowServer) GetWorkflowById(ctx context.Context, in *workflow_service.GetWorkflowByIdRequest) (*workflow_service.GetWorkflowByIdResponse, error) {
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

	var workflowDoc models.Workflow
	err = s.DocDB.Database("fyp-db").Collection("workflows").FindOne(ctx, bson.M{
		"_id":       objectID,
		"createdBy": userID,
	}).Decode(&workflowDoc)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, status.Errorf(codes.NotFound, "Workflow not found")
		}
		return nil, status.Errorf(codes.Internal, "Database error: %v", err)
	}

	// Convert the document to a workflow object
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

	return &workflow_service.GetWorkflowByIdResponse{
		Workflow: workflow,
	}, nil
}
