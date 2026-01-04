package controllers

// WORKS
import (
	"context"
	"errors"

	"workflow-service/models"
	workflow_service "workflow-service/proto/generated/github.com/multiagentai/backend/workflow-service"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	"go.mongodb.org/mongo-driver/bson"
)

func (s *WorkflowServer) GetProjects(ctx context.Context, in *workflow_service.GetProjectsRequest) (*workflow_service.GetProjectsResponse, error) {
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

	projects, err := s.DocDB.Database("fyp-db").Collection("projects").Find(ctx, bson.M{
		"createdBy": userID,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get projects: %v", err)
	}

	var projectList []*workflow_service.Project
	for projects.Next(ctx) {
		var project models.Project
		if err := projects.Decode(&project); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to decode project: %v", err)
		}

		projectList = append(projectList, &workflow_service.Project{
			Id:          project.ID.Hex(),
			Title:       project.Title,
			Description: project.Description,
			CreatedBy:   project.CreatedBy,
			CreatedAt:   timestamppb.New(project.CreatedAt),
			UpdatedAt:   timestamppb.New(project.UpdatedAt),
			DeletedAt:   nil,
		})
	}

	return &workflow_service.GetProjectsResponse{
		Projects: projectList,
	}, nil
}
