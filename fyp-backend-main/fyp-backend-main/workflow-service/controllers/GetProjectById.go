package controllers

// WORKS
import (
	"context"
	"errors"
	"fmt"

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

func (s *WorkflowServer) GetProjectById(ctx context.Context, in *workflow_service.GetProjectByIdRequest) (*workflow_service.GetProjectByIdResponse, error) {
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

	// fetch
	result := s.DocDB.Database("fyp-db").Collection("projects").FindOne(ctx, bson.M{
		"_id":       objectID,
		"createdBy": userID,
	})

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			return nil, status.Errorf(codes.NotFound, "project not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to get project: %v", result.Err())
	}

	// Fetch list of workflows
	workflows, err := s.DocDB.Database("fyp-db").Collection("workflows").Find(ctx, bson.M{
		"projectId": in.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get workflows: %v", err)
	}

	var workflowList []*workflow_service.Workflow
	for workflows.Next(ctx) {
		var workflow models.Workflow
		if err := workflows.Decode(&workflow); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to decode workflow: %v", err)
		}
		fmt.Println(workflow)
		workflowList = append(workflowList, &workflow_service.Workflow{
			Id:          workflow.ID.Hex(),
			Name:        workflow.Name,
			Description: workflow.Description,
			WorkflowURL: workflow.WorkflowURL,
			Public:      workflow.Public,
			CreatedAt:   timestamppb.New(workflow.CreatedAt),
			UpdatedAt:   timestamppb.New(workflow.UpdatedAt),
			DeletedAt:   nil,
		})
	}

	var project models.Project
	if err := result.Decode(&project); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to decode project: %v", err)
	}

	return &workflow_service.GetProjectByIdResponse{
		Project: &workflow_service.Project{
			Id:          project.ID.Hex(),
			Title:       project.Title,
			Description: project.Description,
			CreatedBy:   project.CreatedBy,
			CreatedAt:   timestamppb.New(project.CreatedAt),
			UpdatedAt:   timestamppb.New(project.UpdatedAt),
			DeletedAt:   nil,
		},
		Workflows: workflowList,
	}, nil
}
