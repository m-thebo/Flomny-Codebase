package server

import (
	auth_service "api-gateway/proto/generated/github.com/multiagentai/backend/auth-service"
	integration_service "api-gateway/proto/generated/github.com/multiagentai/backend/integration-service"
	workflow_service "api-gateway/proto/generated/github.com/multiagentai/backend/workflow-service"
	"api-gateway/server/stubs"
	"log"
)

// InitStubs initializes the gRPC stubs for the services
func (s *Server) InitServer() {
	//AuthService
	auth, err := stubs.AuthConnection()
	if err != nil {
		log.Fatal(err)
	}
	authService := auth_service.NewAuthServiceClient(auth)
	s.AuthService = authService
	// IntegrationService
	integration, err := stubs.IntegrationConnection()
	if err != nil {
		log.Fatal(err)
	}
	integrationService := integration_service.NewIntegrationServiceClient(integration)
	s.IntegrationService = integrationService

	//Workflow Service
	workflow, err := stubs.WorkflowConnection()
	if err != nil {
		log.Fatal(err)
	}
	workflowService := workflow_service.NewWorkflowServiceClient(workflow)
	s.WorkflowService = workflowService
	//MinioClient
	s.InitStorage()
}
