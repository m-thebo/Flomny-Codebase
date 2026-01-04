package workflowcontrollers

import (
	workflow_service "api-gateway/proto/generated/github.com/multiagentai/backend/workflow-service"
	"api-gateway/server"
	"context"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/metadata"
)

func GetUserWorkflows(c *gin.Context) {
	// Extract userID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized: userID not found in context"})
		return
	}

	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)

	// Create a context with metadata containing the userID
	md := metadata.New(map[string]string{"userID": userID.(string)})
	ctx := metadata.NewOutgoingContext(context.Background(), md)

	// Make the gRPC call with the modified context
	res, err := serverInstance.WorkflowService.GetUserWorkflows(ctx, &workflow_service.GetUserWorkflowsRequest{})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if res.Workflows == nil {
		c.JSON(200, gin.H{
			"workflows": []string{},
		})
		return
	}
	// Return the response
	c.JSON(200, gin.H{
		"workflows": res.Workflows,
	})
}
