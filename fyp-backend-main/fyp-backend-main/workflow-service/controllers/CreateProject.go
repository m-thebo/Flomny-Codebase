package controllers

// WORKS

import (
	"context"
	"errors"
	"time"

	"workflow-service/models"
	workflow_service "workflow-service/proto/generated/github.com/multiagentai/backend/workflow-service"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// CreateProject implements the CreateProject method of the WorkflowServiceServer interface
func (s *WorkflowServer) CreateProject(ctx context.Context, in *workflow_service.CreateProjectRequest) (*workflow_service.CreateProjectResponse, error) {
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
	project := models.Project{
		Title:       in.Title,
		Description: in.Description,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		DeletedAt:   nil,
	}

	// Insert the project into the database
	insertedProject, err := s.DocDB.Database("fyp-db").Collection("projects").InsertOne(ctx, project)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to insert project: %v", err)
	}

	// Return the project
	return &workflow_service.CreateProjectResponse{
		Project: &workflow_service.Project{
			Id:          insertedProject.InsertedID.(primitive.ObjectID).Hex(),
			Title:       project.Title,
			Description: project.Description,
			CreatedBy:   project.CreatedBy,
			CreatedAt:   timestamppb.New(project.CreatedAt),
			UpdatedAt:   timestamppb.New(project.UpdatedAt),
			DeletedAt:   nil,
		},
	}, nil
}
