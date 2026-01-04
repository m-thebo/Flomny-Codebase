package projectcontrollers

import (
	workflow_service "api-gateway/proto/generated/github.com/multiagentai/backend/workflow-service"
	"api-gateway/server"
	"context"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/metadata"
)

func DeleteProject(c *gin.Context) {
	// Extract userID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized: userID not found in context"})
		return
	}

	// Extract the ID from the route parameter
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "Missing required field: id in route parameter"})
		return
	}

	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)

	// Create a gRPC request with the extracted ID
	req := &workflow_service.DeleteProjectRequest{
		Id: id,
	}

	// Create a context with metadata containing the userID
	md := metadata.New(map[string]string{"userID": userID.(string)})
	ctx := metadata.NewOutgoingContext(context.Background(), md)

	// Make the gRPC call to delete the integration
	res, err := serverInstance.WorkflowService.DeleteProject(ctx, req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Return the response
	c.JSON(200, gin.H{
		"success": res.Success,
	})
}
