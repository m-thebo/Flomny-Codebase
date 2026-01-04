package controllers

//WORKS
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

func (s *WorkflowServer) CreateWorkflow(ctx context.Context, in *workflow_service.CreateWorkflowRequest) (*workflow_service.CreateWorkflowResponse, error) {
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

	workflow := models.Workflow{
		Name:        in.Name,
		Description: in.Description,
		Public:      in.Public,
		WorkflowURL: in.WorkflowURL,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		DeletedAt:   nil,
	}

	if in.ProjectId != nil {
		workflow.ProjectID = in.ProjectId
	}
	// insert into database
	result, err := s.DocDB.Database("fyp-db").Collection("workflows").InsertOne(ctx, workflow)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create workflow: %v", err)
	}

	// return response
	return &workflow_service.CreateWorkflowResponse{
		Workflow: &workflow_service.Workflow{
			Id:          result.InsertedID.(primitive.ObjectID).Hex(),
			Name:        workflow.Name,
			Description: workflow.Description,
			ProjectId:   workflow.ProjectID,
			Public:      workflow.Public,
			WorkflowURL: workflow.WorkflowURL,
			CreatedAt:   timestamppb.New(workflow.CreatedAt),
			UpdatedAt:   timestamppb.New(workflow.UpdatedAt),
			DeletedAt:   nil,
		},
	}, nil
}
