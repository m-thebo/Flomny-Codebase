package controllers

// WORKS
import (
	"context"
	"errors"
	"time"

	workflow_service "workflow-service/proto/generated/github.com/multiagentai/backend/workflow-service"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

func (s *WorkflowServer) DeleteWorkflow(ctx context.Context, in *workflow_service.DeleteWorkflowRequest) (*workflow_service.DeleteWorkflowResponse, error) {
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

	objectID, err := primitive.ObjectIDFromHex(in.Id)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid ID format: %v", err)
	}
	// fetch
	result := s.DocDB.Database("fyp-db").Collection("workflows").FindOne(ctx, bson.M{
		"_id":       objectID,
		"createdBy": userID,
	})
	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			return nil, status.Errorf(codes.NotFound, "Workflow not found")
		}
		return nil, status.Errorf(codes.Internal, "Database error: %v", result.Err())
	}

	// soft delete
	_, err = s.DocDB.Database("fyp-db").Collection("workflows").UpdateOne(ctx, bson.M{
		"_id": objectID,
	}, bson.M{"$set": bson.M{"deletedAt": time.Now()}})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to delete workflow: %v", err)
	}

	// return response
	return &workflow_service.DeleteWorkflowResponse{
		Success: true,
	}, nil
}
