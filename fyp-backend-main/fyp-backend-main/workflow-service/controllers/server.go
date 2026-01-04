package controllers

import (
	workflow_service "workflow-service/proto/generated/github.com/multiagentai/backend/workflow-service"

	"go.mongodb.org/mongo-driver/mongo"
)

// WorkflowServer implements the WorkflowService server
type WorkflowServer struct {
	workflow_service.UnimplementedWorkflowServiceServer
	DocDB *mongo.Client // MongoDB database connection
}
