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
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *WorkflowServer) UpdateProject(ctx context.Context, in *workflow_service.UpdateProjectRequest) (*workflow_service.UpdateProjectResponse, error) {
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

	// update
	update := bson.M{
		"updatedAt": time.Now(),
	}
	if strings.TrimSpace(in.Title) != "" {
		update["title"] = in.Title
	}
	if strings.TrimSpace(in.Description) != "" {
		update["description"] = in.Description
	}

	// perform update with permission check
	updateResult, err := s.DocDB.Database("fyp-db").Collection("projects").UpdateOne(ctx, bson.M{
		"_id":       objectID,
		"createdBy": userID,
	}, bson.M{"$set": update})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update project: %v", err)
	}
	if updateResult.ModifiedCount == 0 {
		return nil, status.Errorf(codes.NotFound, "project not found or you don't have permission to update it")
	}

	// fetch updated project
	updatedResult := s.DocDB.Database("fyp-db").Collection("projects").FindOne(ctx, bson.M{
		"_id": objectID,
	})
	if updatedResult.Err() != nil {
		return nil, status.Errorf(codes.Internal, "failed to fetch updated project: %v", updatedResult.Err())
	}

	project := models.Project{}
	err = updatedResult.Decode(&project)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to decode project: %v", err)
	}

	// return response
	return &workflow_service.UpdateProjectResponse{
		Project: &workflow_service.Project{
			Id:          project.ID.Hex(),
			Title:       project.Title,
			Description: project.Description,
			CreatedAt:   timestamppb.New(project.CreatedAt),
			UpdatedAt:   timestamppb.New(project.UpdatedAt),
			DeletedAt:   nil,
		},
	}, nil
}
