package workflowcontrollers

import (
	workflow_service "api-gateway/proto/generated/github.com/multiagentai/backend/workflow-service"
	"api-gateway/server"
	"context"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/metadata"
)

func GetWorkflowById(c *gin.Context) {
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
	// Extract the ID from the route parameter
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "Missing required field: id in route parameter"})
		return
	}
	// Make the gRPC call with the modified context
	res, err := serverInstance.WorkflowService.GetWorkflowById(ctx, &workflow_service.GetWorkflowByIdRequest{
		Id: id,
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Return the response
	c.JSON(200, gin.H{
		"response": res,
	})
}
