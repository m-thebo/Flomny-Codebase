package controllers

// WORKS
import (
	"context"
	"errors"

	"workflow-service/models"
	workflow_service "workflow-service/proto/generated/github.com/multiagentai/backend/workflow-service"

	"go.mongodb.org/mongo-driver/bson"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *WorkflowServer) GetUserWorkflows(ctx context.Context, in *workflow_service.GetUserWorkflowsRequest) (*workflow_service.GetUserWorkflowsResponse, error) {
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

	// get workflows from database
	workflows, err := s.DocDB.Database("fyp-db").Collection("workflows").Find(ctx, bson.M{"createdBy": userID})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get workflows: %v", err)
	}

	// convert workflows to protobuf
	protoWorkflows := []*workflow_service.Workflow{}
	for workflows.Next(ctx) {
		var workflow models.Workflow
		if err := workflows.Decode(&workflow); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to decode workflow: %v", err)
		}
		protoWorkflows = append(protoWorkflows, &workflow_service.Workflow{
			Id:          workflow.ID.Hex(),
			Name:        workflow.Name,
			Description: workflow.Description,
			Public:      workflow.Public,
			ProjectId:   workflow.ProjectID,
			WorkflowURL: workflow.WorkflowURL,
			CreatedAt:   timestamppb.New(workflow.CreatedAt),
			UpdatedAt:   timestamppb.New(workflow.UpdatedAt),
			DeletedAt:   nil,
		})
	}

	// return response
	return &workflow_service.GetUserWorkflowsResponse{
		Workflows: protoWorkflows,
	}, nil
}
