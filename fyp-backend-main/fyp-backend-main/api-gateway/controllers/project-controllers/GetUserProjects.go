package projectcontrollers

import (
	workflow_service "api-gateway/proto/generated/github.com/multiagentai/backend/workflow-service"
	"api-gateway/server"
	"context"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/metadata"
)

func GetUserProjects(c *gin.Context) {
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

	// Create the gRPC request
	req := &workflow_service.GetProjectsRequest{}

	// Make the gRPC call
	res, err := serverInstance.WorkflowService.GetProjects(ctx, req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if res.Projects == nil {
		c.JSON(200, gin.H{
			"projects": []string{},
		})
		return
	}
	// Return the response
	c.JSON(200, gin.H{
		"projects": res.Projects,
	})
}
