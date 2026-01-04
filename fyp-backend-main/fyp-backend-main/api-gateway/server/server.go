package server

import (
	auth_service "api-gateway/proto/generated/github.com/multiagentai/backend/auth-service"
	integration_service "api-gateway/proto/generated/github.com/multiagentai/backend/integration-service"
	workflow_service "api-gateway/proto/generated/github.com/multiagentai/backend/workflow-service"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Server struct {
	AuthService        auth_service.AuthServiceClient               //AuthStub
	IntegrationService integration_service.IntegrationServiceClient //IntegrationStub
	WorkflowService    workflow_service.WorkflowServiceClient       //WorkflowStub
	S3Client           *s3.Client
}
